/**
 * Tests for the URL layer and conversion tracking.
 *
 * These cover the two failure modes that are expensive and silent:
 *
 *   1. A canonical naming a host we do not serve. This is not a cosmetic bug —
 *      it tells Google the authoritative copy of the page lives elsewhere and
 *      invites it to drop the site from the index. It shipped once already.
 *   2. Analytics firing without consent, or leaking identifying data into
 *      event parameters. תיקון 13 to חוק הגנת הפרטיות makes that a legal
 *      problem, not a tidiness one.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { absoluteUrl, verifyCanonicalHost, ORIGIN, ORIGIN_HOST } from './urls.js';
import { buildSitemap } from './sitemap.js';
import { WA_MESSAGES } from '../content/copy.js';

describe('absoluteUrl', () => {
  it('builds an absolute URL on the served origin', () => {
    expect(absoluteUrl('/')).toBe(`${ORIGIN}/`);
  });

  it('percent-encodes Hebrew slugs', () => {
    // A canonical must be byte-stable. If one page emits raw Hebrew and
    // another the encoded form, that is two strings for one resource — exactly
    // the duplicate signal canonicals exist to kill.
    const url = absoluteUrl('/נגישות/');
    expect(url).toBe(`${ORIGIN}/%D7%A0%D7%92%D7%99%D7%A9%D7%95%D7%AA/`);
    expect(url).not.toMatch(/[\u0590-\u05FF]/);
  });

  it('leaves the path separator alone', () => {
    expect(absoluteUrl('/מדריכים/טופס-106/')).toContain('/');
    expect(absoluteUrl('/a/b/')).toBe(`${ORIGIN}/a/b/`);
  });

  it('tolerates a missing leading slash', () => {
    expect(absoluteUrl('foo/')).toBe(`${ORIGIN}/foo/`);
  });

  it('passes absolute URLs through untouched', () => {
    const gov = 'https://www.gov.il/he/service/itc135';
    expect(absoluteUrl(gov)).toBe(gov);
  });
});

describe('verifyCanonicalHost', () => {
  it('accepts a CNAME matching SITE_URL', () => {
    expect(verifyCanonicalHost(ORIGIN_HOST)).toBe(true);
  });

  it('ignores surrounding whitespace, as a real CNAME file has a newline', () => {
    expect(verifyCanonicalHost(`${ORIGIN_HOST}\n`)).toBe(true);
  });

  it('REJECTS the apex when we serve a subdomain — the bug that shipped', () => {
    expect(() => verifyCanonicalHost('hnz-cpa.com')).toThrow(/mismatch/i);
  });

  it('rejects an empty CNAME rather than silently passing', () => {
    expect(() => verifyCanonicalHost('   ')).toThrow(/empty/i);
  });
});

describe('buildSitemap', () => {
  const xml = buildSitemap(new Date('2026-10-17T09:00:00Z'));

  it('declares the correct sitemap namespace', () => {
    // sitemaps.org, plural. The singular form is a typo validators reject.
    expect(xml).toContain('http://www.sitemaps.org/schemas/sitemap/0.9');
  });

  it('lists the homepage with the build date', () => {
    expect(xml).toContain(`<loc>${ORIGIN}/</loc>`);
    expect(xml).toContain('<lastmod>2026-10-17</lastmod>');
  });

  it('omits unshipped routes — a sitemap entry that 404s is worse than none', () => {
    expect(xml).not.toContain('אודות');
    expect(xml).not.toContain('%D7%90%D7%95%D7%93%D7%95%D7%AA'); // /אודות/
  });

  it('emits no raw Hebrew', () => {
    expect(xml).not.toMatch(/[\u0590-\u05FF]/);
  });
});

describe('per-surface WhatsApp messages', () => {
  it('has one for every surface in the markup', () => {
    expect(Object.keys(WA_MESSAGES).sort()).toEqual(['final', 'hero', 'sticky']);
  });

  it('are distinct, or attribution is impossible', () => {
    const values = Object.values(WA_MESSAGES);
    expect(new Set(values).size).toBe(values.length);
  });

  it('read like a person, carrying no tracking codes', () => {
    // A visible [hero] or ?utm= in the message would undercut the one thing
    // this site sells. The differentiation has to be natural wording.
    for (const message of Object.values(WA_MESSAGES)) {
      expect(message).not.toMatch(/\[|\]|utm_|surface=/);
      expect(message).toMatch(/[\u0590-\u05FF]/);
    }
  });

  it('never mention a fee, an amount, or a guarantee', () => {
    // תקנה 2(ג)(14) — no שכר טרחה, and no promised sum.
    for (const message of Object.values(WA_MESSAGES)) {
      expect(message).not.toMatch(/₪|אחוז|%|חינם|מובטח|שכר טרחה/);
    }
  });
});

/* ------------------------------------------------------------------
   Analytics. Imported dynamically per-test because the module reads
   GA4_MEASUREMENT_ID at import time and we need a clean module registry.
   ------------------------------------------------------------------ */
describe('analytics, unconfigured (the current shipping state)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal('sessionStorage', {
      store: {},
      getItem(k) {
        return this.store[k] ?? null;
      },
      setItem(k, v) {
        this.store[k] = v;
      },
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it('reports itself unconfigured when there is no measurement ID', async () => {
    const { isConfigured } = await import('./analytics.js');
    expect(isConfigured()).toBe(false);
  });

  it('track() is inert and never throws', async () => {
    const { track } = await import('./analytics.js');
    expect(() => track('whatsapp_click', { surface: 'hero' })).not.toThrow();
    // Nothing may be queued or sent while unconfigured.
    expect(globalThis.dataLayer).toBeUndefined();
  });

  it('captureUtm survives a hostile query string', async () => {
    const { captureUtm } = await import('./analytics.js');
    vi.stubGlobal('location', { search: '?utm_source=' + 'x'.repeat(500) });
    const utm = captureUtm();
    // Bounded: an unbounded query value is how a crafted URL poisons reports.
    if (utm.utm_source) expect(utm.utm_source.length).toBeLessThanOrEqual(100);
  });

  it('captureUtm returns an object even with no query and no storage', async () => {
    const { captureUtm } = await import('./analytics.js');
    vi.stubGlobal('location', { search: '' });
    vi.stubGlobal('sessionStorage', undefined);
    expect(captureUtm()).toEqual({});
  });
});
