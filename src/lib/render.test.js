import { describe, expect, it } from 'vitest';
import { refundWindow } from './refundWindow.js';
import { counterHtml, ledgerRowsHtml } from './render.js';

/** Noon in Israel on a given civil date, so no timezone edge can interfere. */
const il = (iso) => new Date(`${iso}T12:00:00+02:00`);

const daysCells = (html) =>
  [...html.matchAll(/ledger__days">([^<]*)</g)].map((m) => m[1]);

describe('ledgerRowsHtml', () => {
  it('reflects the day it is rendered for, not the day of the build', () => {
    // The live bug: built 17 Oct, viewed 15 Nov. The expiring row must move.
    const built = daysCells(ledgerRowsHtml(refundWindow(il('2026-10-17'))));
    const viewed = daysCells(ledgerRowsHtml(refundWindow(il('2026-11-15'))));
    expect(built.at(-1)).toBe('נותרו 75 ימים');
    expect(viewed.at(-1)).toBe('נותרו 46 ימים');
  });

  it('agrees with the hero counter on the expiring year', () => {
    const w = refundWindow(il('2026-11-15'));
    expect(counterHtml(w)).toContain('נותרו 46 ימים');
    expect(daysCells(ledgerRowsHtml(w)).at(-1)).toBe('נותרו 46 ימים');
  });

  it('marks exactly one row as expiring, and it is the last one', () => {
    const html = ledgerRowsHtml(refundWindow(il('2026-11-15')));
    expect(html.match(/ledger__row--expiring/g)).toHaveLength(1);
    const rows = html.split('<tr').slice(1);
    expect(rows.at(-1)).toContain('ledger__row--expiring');
  });

  it('reads naturally on 31 December', () => {
    const cells = daysCells(ledgerRowsHtml(refundWindow(il('2026-12-31'))));
    expect(cells.at(-1)).toBe('היום האחרון');
  });
});

describe('counterHtml', () => {
  it('pivots to the remaining years past the practical cut-off', () => {
    const html = counterHtml(refundWindow(il('2026-12-20')));
    expect(html).toContain('<bdi>2021</bdi> עד <bdi>2025</bdi>');
    expect(html).not.toContain('נותרו');
  });

  it('never emits an em or en dash, on any day of the year', () => {
    // This text reaches the page through the JS bundle as well as the HTML,
    // and the CI dash guard only greps dist/*.html. So it is enforced here.
    for (let d = new Date('2026-01-01T12:00:00+02:00'); d.getUTCFullYear() === 2026; ) {
      const w = refundWindow(d);
      expect(counterHtml(w)).not.toMatch(/[–—]/);
      expect(ledgerRowsHtml(w)).not.toMatch(/[–—]/);
      d = new Date(d.getTime() + 86_400_000);
    }
  });
});
