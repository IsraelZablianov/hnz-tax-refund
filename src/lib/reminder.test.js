import { describe, expect, it } from 'vitest';
import { foldLine, reminderIcs, israeliToday } from './reminder.js';

const base = {
  name: 'הילה נח זבליאנוב',
  waUrl: 'https://wa.me/972555582369',
  siteUrl: 'https://tax.hnz-cpa.com',
  host: 'tax.hnz-cpa.com',
};

describe('reminderIcs', () => {
  it('schedules 20:00 seven Israeli days ahead', () => {
    const ics = reminderIcs({ ...base, now: new Date('2026-11-15T10:00:00Z') });
    expect(ics).toContain('DTSTART:20261122T200000');
  });

  it('uses the Israeli date, not UTC, near midnight', () => {
    // 23:30 UTC on 15 Nov is already 16 Nov in Israel.
    const ics = reminderIcs({ ...base, now: new Date('2026-11-15T23:30:00Z') });
    expect(ics).toContain('DTSTART:20261123T200000');
  });

  it('rolls across the year boundary', () => {
    const ics = reminderIcs({ ...base, now: new Date('2026-12-28T10:00:00Z') });
    expect(ics).toContain('DTSTART:20270104T200000');
  });

  it('is valid RFC 5545 framing: CRLF, every line at most 75 octets', () => {
    const ics = reminderIcs({ ...base, now: new Date('2026-11-15T10:00:00Z') });
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
    const enc = new TextEncoder();
    for (const line of ics.split('\r\n')) {
      expect(enc.encode(line).length).toBeLessThanOrEqual(75);
    }
    expect(ics).not.toMatch(/[^\r]\n/);
  });

  it('states no year, deadline or amount (it fires a week later)', () => {
    const ics = reminderIcs({ ...base, now: new Date('2026-12-28T10:00:00Z') });
    const text = ics
      .split('\r\n')
      .filter((l) => /^(SUMMARY|DESCRIPTION|\s)/.test(l))
      .join('');
    expect(text).not.toMatch(/20\d\d|₪|31\.12/);
    expect(text).not.toMatch(/[–—]/);
  });
});

describe('foldLine', () => {
  it('never splits a Hebrew letter across lines', () => {
    const folded = foldLine(`SUMMARY:${'א'.repeat(100)}`);
    for (const part of folded.split('\r\n ')) {
      expect(part).not.toContain('�');
    }
    expect(folded.replace(/\r\n /g, '')).toBe(`SUMMARY:${'א'.repeat(100)}`);
  });
});

describe('israeliToday', () => {
  it('is the Israeli civil date', () => {
    expect(israeliToday(new Date('2026-11-15T23:30:00Z'))).toBe('2026-11-16');
  });
});
