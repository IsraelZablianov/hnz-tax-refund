/**
 * URL construction. One origin, one spelling, no exceptions.
 *
 * THE BUG THIS MODULE EXISTS TO PREVENT
 * -------------------------------------
 * index.html shipped with `<link rel="canonical" href="https://hnz-cpa.com/">`
 * while the site is actually served from `tax.hnz-cpa.com` (see public/CNAME).
 * That is not a cosmetic slip: a canonical pointing at a different host tells
 * Google the authoritative copy of this page is the Wix apex — a page that does
 * not contain any of this content — and invites it to drop the subdomain from
 * the index entirely.
 *
 * So no absolute URL is ever written by hand again. Everything derives from
 * SITE_URL, and `verifyCanonicalHost()` is run by CI against public/CNAME.
 */

import { SITE_URL } from '../content/site.js';

/** SITE_URL with any trailing slash removed, so joins never double up. */
export const ORIGIN = SITE_URL.replace(/\/+$/, '');

/** The host we serve from, e.g. `tax.hnz-cpa.com`. */
export const ORIGIN_HOST = new URL(ORIGIN).host;

/**
 * Absolute, crawler-safe URL for a site-relative path.
 *
 * Hebrew path segments are percent-encoded. GitHub Pages normalises raw UTF-8
 * and percent-encoded forms to the same resource (verified in Gate 0), but a
 * canonical must be byte-stable: if one page emits raw Hebrew and another emits
 * the encoded form, they are two strings for one resource, which is exactly the
 * duplicate-signal problem canonicals exist to solve. `encodeURI` is the right
 * tool — it leaves `/` alone and encodes everything non-ASCII.
 */
export function absoluteUrl(path = '/') {
  if (/^https?:\/\//.test(path)) return path;
  const rel = path.startsWith('/') ? path : `/${path}`;
  return `${ORIGIN}${encodeURI(rel)}`;
}

/**
 * Guard for CI: the canonical host must equal what GitHub Pages actually serves.
 * Takes the raw contents of public/CNAME so the check has no filesystem
 * dependency and is trivially testable.
 */
export function verifyCanonicalHost(cnameContents) {
  const cname = String(cnameContents).trim();
  if (!cname) throw new Error('CNAME is empty — cannot verify canonical host');
  if (cname !== ORIGIN_HOST) {
    throw new Error(
      `Canonical host mismatch: SITE_URL is "${ORIGIN_HOST}" but CNAME serves "${cname}". ` +
        'A canonical pointing at a host we do not serve de-indexes the site.',
    );
  }
  return true;
}
