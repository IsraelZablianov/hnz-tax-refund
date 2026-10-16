import { describe, it, expect } from 'vitest';
import { daysPhrase, remainingPhrase, ltr, hebrewMonthYear } from './hebrew.js';

describe('daysPhrase — Hebrew number agreement', () => {
  it('uses the singular for one', () => {
    expect(daysPhrase(1)).toBe('יום אחד');
  });

  it('uses the dual form for two', () => {
    // Hebrew has a genuine dual; "2 ימים" is wrong and reads as careless.
    expect(daysPhrase(2)).toBe('יומיים');
  });

  it('uses the plural from three up', () => {
    expect(daysPhrase(3)).toBe('3 ימים');
    expect(daysPhrase(76)).toBe('76 ימים');
  });

  it('says "today" on the deadline itself', () => {
    expect(daysPhrase(0)).toBe('היום');
  });
});

describe('remainingPhrase — verb agreement', () => {
  it('agrees the verb with a single day', () => {
    expect(remainingPhrase(1)).toBe('נותר יום אחד');
  });

  it('agrees the verb with a plural count', () => {
    expect(remainingPhrase(76)).toBe('נותרו 76 ימים');
  });
});

describe('ltr — bidi isolation', () => {
  it('wraps a phone number so it does not reorder', () => {
    const wrapped = ltr('055-5582369');
    expect(wrapped.startsWith('\u2066')).toBe(true);
    expect(wrapped.endsWith('\u2069')).toBe(true);
    expect(wrapped).toContain('055-5582369');
  });

  it('survives embedding in a Hebrew sentence', () => {
    const sentence = `התקשרו ל${ltr('055-5582369')} עוד היום`;
    expect(sentence).toContain('\u2066055-5582369\u2069');
  });
});

describe('hebrewMonthYear', () => {
  it('formats the last-updated line in Hebrew', () => {
    expect(hebrewMonthYear(new Date('2026-10-16T12:00:00Z'))).toBe('אוקטובר 2026');
  });
});
