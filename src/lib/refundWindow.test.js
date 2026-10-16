import { describe, it, expect } from 'vitest';
import { refundWindow, ledgerBarWidths } from './refundWindow.js';

/**
 * These tests are the site's factual guarantee. Every year, date and day count
 * the visitor sees comes from refundWindow(), so a regression here is a
 * regression in what we tell people about their legal rights.
 *
 * Dates are constructed as UTC instants and then interpreted in Asia/Jerusalem,
 * which is how a real visitor's clock reaches the function.
 */

const at = (iso) => new Date(iso);

describe('refundWindow — the 2026 window', () => {
  const w = refundWindow(at('2026-10-16T12:00:00Z'));

  it('claims six years back, not seven', () => {
    // The seven-year figure is the National Insurance window and is wrong here.
    expect(w.openYears).toHaveLength(6);
  });

  it('opens 2020 through 2025', () => {
    expect(w.openYears).toEqual([2020, 2021, 2022, 2023, 2024, 2025]);
  });

  it('expires tax year 2020 on 31.12.2026', () => {
    expect(w.expiringYear).toBe(2020);
    expect(w.deadline).toBe('31.12.2026');
  });

  it('treats 2019 as already closed', () => {
    expect(w.lastClosedYear).toBe(2019);
  });

  it('counts 76 days from 16 October to 31 December', () => {
    // 15 remaining in Oct + 30 Nov + 31 Dec = 76
    expect(w.daysLeft).toBe(76);
  });
});

describe('refundWindow — boundary behaviour', () => {
  it('reaches zero, not negative, on the deadline itself', () => {
    const w = refundWindow(at('2026-12-31T09:00:00Z'));
    expect(w.daysLeft).toBe(0);
    expect(w.isLastDay).toBe(true);
    expect(w.expiringYear).toBe(2020);
  });

  it('rolls over cleanly on 1 January', () => {
    const w = refundWindow(at('2027-01-01T09:00:00Z'));
    expect(w.expiringYear).toBe(2021);
    expect(w.openYears).toEqual([2021, 2022, 2023, 2024, 2025, 2026]);
    expect(w.lastClosedYear).toBe(2020);
    expect(w.deadline).toBe('31.12.2027');
    expect(w.daysLeft).toBe(364); // 2027 is not a leap year
  });

  it('handles a leap year', () => {
    const w = refundWindow(at('2028-01-01T09:00:00Z'));
    expect(w.daysLeft).toBe(365); // 2028 is a leap year
  });

  it('never returns a negative day count, across a full year of dates', () => {
    for (let month = 1; month <= 12; month += 1) {
      const w = refundWindow(at(`2026-${String(month).padStart(2, '0')}-28T12:00:00Z`));
      expect(w.daysLeft).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('refundWindow — timezone independence', () => {
  it('gives the same answer to a visitor anywhere in the world', () => {
    // 16 Oct 2026, 23:30 UTC is already 17 Oct in Israel (UTC+3).
    // A naive local-clock implementation would disagree with itself here.
    const lateUtc = refundWindow(at('2026-10-16T23:30:00Z'));
    const nextDayIsrael = refundWindow(at('2026-10-17T06:00:00Z'));
    expect(lateUtc.daysLeft).toBe(nextDayIsrael.daysLeft);
  });

  it('does not let a late-December UTC instant overstate the window', () => {
    // 31 Dec 2026 22:00 UTC is already 1 Jan 2027 in Israel.
    // The expiring year must have rolled over, not be claimed as still open.
    const w = refundWindow(at('2026-12-31T22:00:00Z'));
    expect(w.currentYear).toBe(2027);
    expect(w.expiringYear).toBe(2021);
  });
});

describe('refundWindow — the practical filing cut-off', () => {
  it('is false in October, when 2020 can still realistically be filed', () => {
    expect(refundWindow(at('2026-10-16T12:00:00Z')).pastPracticalCutoff).toBe(false);
  });

  it('is true in late December, when it cannot', () => {
    expect(refundWindow(at('2026-12-20T12:00:00Z')).pastPracticalCutoff).toBe(true);
  });

  it('turns on at 35 days out', () => {
    // 35 days before 31.12.2026 is 26 November.
    expect(refundWindow(at('2026-11-26T12:00:00Z')).daysLeft).toBe(35);
    expect(refundWindow(at('2026-11-26T12:00:00Z')).pastPracticalCutoff).toBe(false);
    expect(refundWindow(at('2026-11-27T12:00:00Z')).pastPracticalCutoff).toBe(true);
  });
});

describe('refundWindow — the ledger', () => {
  const w = refundWindow(at('2026-10-16T12:00:00Z'));

  it('renders newest year first', () => {
    expect(w.ledger.map((r) => r.taxYear)).toEqual([2025, 2024, 2023, 2022, 2021, 2020]);
  });

  it('gives each year its own statutory deadline', () => {
    expect(w.ledger.find((r) => r.taxYear === 2025).deadline).toBe('31.12.2031');
    expect(w.ledger.find((r) => r.taxYear === 2020).deadline).toBe('31.12.2026');
  });

  it('flags exactly one expiring year', () => {
    expect(w.ledger.filter((r) => r.isExpiring)).toHaveLength(1);
    expect(w.ledger.find((r) => r.isExpiring).taxYear).toBe(2020);
  });

  it('shows the expiring year with the least time remaining', () => {
    const remaining = w.ledger.map((r) => r.daysRemaining);
    expect(Math.min(...remaining)).toBe(w.ledger.find((r) => r.isExpiring).daysRemaining);
  });

  it('matches the headline count for the expiring year', () => {
    expect(w.ledger.find((r) => r.isExpiring).daysRemaining).toBe(w.daysLeft);
  });
});

describe('ledgerBarWidths — the visual argument', () => {
  const bars = ledgerBarWidths(refundWindow(at('2026-10-16T12:00:00Z')));

  it('gives the newest year a full bar', () => {
    expect(bars[0].widthPercent).toBe(100);
  });

  it('reduces the expiring year to a sliver', () => {
    // This proportion IS the argument the page makes. If it ever stops being
    // dramatic, the deadline section has lost its point.
    const expiring = bars.find((b) => b.isExpiring);
    expect(expiring.widthPercent).toBeLessThan(10);
  });

  it('never renders a zero-width bar', () => {
    // A year with one day left must still be visible.
    const lastDay = ledgerBarWidths(refundWindow(at('2026-12-31T09:00:00Z')));
    expect(Math.min(...lastDay.map((b) => b.widthPercent))).toBeGreaterThanOrEqual(1);
  });

  it('orders bars monotonically, newest widest', () => {
    const widths = bars.map((b) => b.widthPercent);
    expect([...widths].sort((a, b) => b - a)).toEqual(widths);
  });
});
