/**
 * sitemap.xml, generated at build time from src/content/routes.js.
 *
 * WHY GENERATED AND NOT A STATIC FILE IN public/
 * ----------------------------------------------
 * public/robots.txt already advertises `Sitemap: .../sitemap.xml`, and the file
 * did not exist — a guaranteed 404 and a Search Console error on day one. A
 * static file would fix that once and then rot: every new route would need a
 * hand edit, and `lastmod` would freeze at whenever someone last remembered.
 *
 * Only `shipped` routes are emitted. A sitemap is an assertion that these URLs
 * exist and want indexing; listing a planned page is a self-inflicted crawl
 * error. Planned routes live in routes.js with `shipped: false`.
 */

import { shippedRoutes } from '../content/routes.js';
import { absoluteUrl } from './urls.js';

/** XML text escape. Our paths are Hebrew and `&`-free, but never assume. */
const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * @param {Date} [now] injected so tests are deterministic.
 * @returns {string} complete sitemap.xml
 */
export function buildSitemap(now = new Date()) {
  const buildDate = now.toISOString().slice(0, 10);

  const entries = shippedRoutes()
    .map((route) => {
      const lastmod = route.lastmodFromBuild ? buildDate : route.lastmod;
      return [
        '  <url>',
        `    <loc>${esc(absoluteUrl(route.path))}</loc>`,
        lastmod ? `    <lastmod>${esc(lastmod)}</lastmod>` : null,
        route.changefreq ? `    <changefreq>${esc(route.changefreq)}</changefreq>` : null,
        route.priority ? `    <priority>${esc(route.priority)}</priority>` : null,
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}
