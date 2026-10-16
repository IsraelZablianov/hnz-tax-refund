/**
 * The route table. One entry per real, served document.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * Two things have to agree and currently had no shared source: the `canonical`
 * each page declares, and the list of URLs in `sitemap.xml`. When those drift
 * you get the worst SEO failure mode available — a sitemap advertising URLs that
 * 404, or a page telling Google its authoritative copy lives somewhere else.
 * Both are now derived from this array.
 *
 * `shipped: false` routes are DELIBERATELY excluded from the sitemap. A sitemap
 * is a claim that these URLs exist and are indexable; listing a page that is not
 * built yet is a self-inflicted crawl error in Search Console. They are declared
 * here anyway so the planned information architecture is visible in one place
 * and so flipping one on is a one-word change.
 *
 * Hebrew slugs are intentional and verified working on GitHub Pages (Gate 0 in
 * docs/spec/08-plan.md). Source filenames stay ASCII; only the URL is Hebrew.
 */

import { ACCESSIBILITY_REVIEWED } from './site.js';

export const ROUTES = [
  {
    /** Served at the origin root. */
    path: '/',
    /** Build-time entry. Only meaningful for shipped routes. */
    source: 'index.html',
    shipped: true,
    /**
     * The homepage's factual content is year-derived — the ledger, the counter
     * and the deadline all change with the calendar — so the build date is an
     * honest `lastmod` rather than a fake freshness signal.
     */
    lastmodFromBuild: true,
    priority: '1.0',
    changefreq: 'weekly',
  },

  // ---- Planned. Not in the sitemap until they are real documents. ----
  { path: '/אודות/', shipped: false, priority: '0.8', changefreq: 'yearly' },
  { path: '/בדיקת-זכאות-להחזר-מס/', shipped: false, priority: '0.9', changefreq: 'monthly' },
  { path: '/מדריכים/', shipped: false, priority: '0.7', changefreq: 'monthly' },
  { path: '/שירותים/', shipped: false, priority: '0.6', changefreq: 'yearly' },
  { path: '/צור-קשר/', shipped: false, priority: '0.6', changefreq: 'yearly' },

  {
    /**
     * Accessibility statement. Legally required on an Israeli commercial site
     * under תקנות שוויון זכויות לאנשים עם מוגבלות and תקן ת"י 5568, so it is
     * not optional and not "planned".
     *
     * Hebrew URL, ASCII source file. vite.config.js renames the built
     * accessibility.html to נגישות/index.html — see hebrewSlugs() there.
     */
    path: '/נגישות/',
    source: 'accessibility.html',
    shipped: true,
    /**
     * NOT lastmodFromBuild. A conformance statement is a claim about a review
     * on a specific day; re-dating it on every deploy would assert a review
     * that never happened. The date comes from ACCESSIBILITY_REVIEWED.
     */
    lastmod: ACCESSIBILITY_REVIEWED,
    priority: '0.3',
    changefreq: 'yearly',
  },
];

/** Routes that are actually served — the only ones a sitemap may contain. */
export const shippedRoutes = () => ROUTES.filter((r) => r.shipped);

/** The ASCII source file for a shipped route, keyed by path. */
export const routeBySource = (source) =>
  ROUTES.find((r) => r.source === source);
