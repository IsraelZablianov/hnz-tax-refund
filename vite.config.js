import { defineConfig } from 'vite';
import { existsSync, readFileSync } from 'node:fs';
import { mkdir, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { refundWindow, ledgerBarWidths } from './src/lib/refundWindow.js';
import { remainingPhrase, hebrewMonthYear } from './src/lib/hebrew.js';
import { pageSchema, schemaToScript } from './src/lib/schema.js';
import { buildSitemap } from './src/lib/sitemap.js';
import { absoluteUrl, ORIGIN_HOST, verifyCanonicalHost } from './src/lib/urls.js';
import { shippedRoutes, routeBySource } from './src/content/routes.js';
import { TRIGGERS, PROCESS, WA_MESSAGE, WA_MESSAGES } from './src/content/copy.js';
import {
  PHONE_WA,
  PHONE_TEL,
  PHONE_DISPLAY,
  EMAIL,
  LICENCE_NUMBER,
  LICENCE_REGISTER_URL,
  LICENSED_SINCE,
  DEGREE_HE,
  INSTITUTION_HE,
  SERVICE_AREAS_HE,
  NAME_HE,
  TITLE_HE,
  SITE_NAME_HE,
  SERVICE_HE,
  SERVICE_CLASS_HE,
  OG_IMAGE_PATH,
  OG_IMAGE_WIDTH,
  OG_IMAGE_HEIGHT,
  ACCESSIBILITY_TITLE_HE,
  ACCESSIBILITY_REVIEWED,
} from './src/content/site.js';

/**
 * ARCHITECTURE NOTE — deviation from docs/spec/03-architecture.md.
 *
 * The spec called for React Router. That is the wrong tool here:
 *
 *   1. This is a content site with two interactive islands (the quiz and the
 *      day counter), not an application.
 *   2. The years ledger and every content block MUST exist in the served HTML.
 *      They are the page's factual claims and what we want extracted into
 *      snippets and AI answers — so nothing substantive may be client-rendered.
 *   3. An MPA gives a real static document per URL with zero prerender
 *      toolchain, which is strictly better for a YMYL site.
 *
 * EVERYTHING below is injected at BUILD time. The runtime script only
 * (a) corrects the date if the build is stale and (b) wires the scroll reveal.
 * A visitor with JS disabled, and every crawler, sees the complete page.
 */

const ledgerRow = (row, deadline) => `
        <tr class="ledger__row${row.isExpiring ? ' ledger__row--expiring' : ''}">
          <th scope="row" class="ledger__year"><bdi>${row.taxYear}</bdi></th>
          <td class="ledger__deadline"><bdi>${row.deadline}</bdi></td>
          <td class="ledger__status">${
            row.isExpiring
              ? `<span class="ledger__expiring-label">נסגרת ב-<bdi>${deadline}</bdi></span>`
              : 'פתוחה'
          }</td>
          <td class="ledger__bar-cell">
            <span class="ledger__bar" style="--bar-width:${row.widthPercent}%" aria-hidden="true"></span>
            <span class="ledger__days">${remainingPhrase(row.daysRemaining)}</span>
          </td>
        </tr>`;

function buildCredentials() {
  const items = [`רואת חשבון מוסמכת משנת <bdi>${LICENSED_SINCE}</bdi>`];

  // The licence number renders only once we actually have it: structured data
  // must match visible content, so a placeholder is worse than an omission.
  // When it arrives, it carries the register link with it — a bare link to the
  // register without a number to look up is noise, which is why there is no
  // `else` branch here.
  if (LICENCE_NUMBER) {
    items.push(
      `רישיון רואת חשבון מס' <bdi>${LICENCE_NUMBER}</bdi>. ` +
        `<a href="${LICENCE_REGISTER_URL}" rel="noopener">ניתן לאמת בפנקס רואי החשבון</a>`,
    );
  }

  items.push(`${DEGREE_HE}, ${INSTITUTION_HE}`);
  return items.map((i) => `<li>${i}</li>`).join('');
}

/* ==================================================================
   Per-page <head> metadata.

   Keyed by the ASCII source filename. `title` and `description` are used for
   the visible <title>, the meta description, the Open Graph and Twitter cards,
   AND the schema WebPage node — one definition, so they cannot drift. Schema
   that contradicts the rendered page is worse than no schema.

   `trail` is the breadcrumb. Omitted on the homepage: a one-item breadcrumb
   saying "Home" is noise and Google ignores it.
   ================================================================== */
function headMeta(page, w) {
  const route = routeBySource(`${page}.html`);
  if (!route) {
    throw new Error(
      `No route declared for HTML entry "${page}.html". ` +
        'Add it to ROUTES in src/content/routes.js.',
    );
  }

  const metaByPage = {
    index: {
      // Verbatim the copy that was in index.html, moved here so the <title>,
      // the meta description, the OG card and the schema WebPage node all read
      // from one string. Front-loaded topic, brand last: Google rewrites most
      // titles by trimming the trailing segment, so this survives and the
      // reverse does not.
      title: `${SERVICE_HE} | רו״ח ${NAME_HE}`,
      description:
        `רואת חשבון מוסמכת משנת ${LICENSED_SINCE}, מתמחה ב${SERVICE_HE}. ` +
        `ניתן לתבוע עד שש שנים אחורה. שנת המס ${w.expiringYear} נסגרת ב-${w.deadline}. ` +
        'בדיקת זכאות ללא עלות וללא התחייבות.',
      // Shorter for the social card, which truncates harder than a SERP.
      ogDescription:
        'ניתן לתבוע מס ששולם ביתר עד שש שנים אחורה. ' +
        `שנת המס ${w.expiringYear} נסגרת ב-${w.deadline}.`,
    },
    accessibility: {
      title: `${ACCESSIBILITY_TITLE_HE} | רו״ח ${NAME_HE}`,
      description:
        'מה מיושם באתר, מה עדיין לא הושלם, ואל מי לפנות אם משהו באתר לא נגיש. ' +
        'נערכה לפי התקן הישראלי 5568.',
      trail: [
        { name: 'דף הבית', path: '/' },
        { name: ACCESSIBILITY_TITLE_HE, path: route.path },
      ],
    },
  };

  const meta = metaByPage[page];
  if (!meta) {
    throw new Error(
      `No <head> metadata registered for "${page}.html". ` +
        'Add it to metaByPage in vite.config.js.',
    );
  }

  return { ...meta, path: route.path, url: absoluteUrl(route.path) };
}

/* ==================================================================
   Head block shared by every document.

   Favicons, the manifest, the Open Graph image and the canonical. Centralised
   because the og:image dimensions, the manifest and the actual PNG must agree,
   and three copies of that in hand-written HTML will diverge. Regenerate the
   images with `npm run images`.
   ================================================================== */
function headAssets({ url, title, description }) {
  return `<link rel="canonical" href="${url}" />

    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
    <link rel="manifest" href="/site.webmanifest" />

    <meta property="og:url" content="${url}" />
    <meta property="og:site_name" content="${SITE_NAME_HE}" />
    <meta property="og:image" content="${absoluteUrl(OG_IMAGE_PATH)}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="${OG_IMAGE_WIDTH}" />
    <meta property="og:image:height" content="${OG_IMAGE_HEIGHT}" />
    <meta property="og:image:alt" content="${title}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${absoluteUrl(OG_IMAGE_PATH)}" />

    <!-- A named, credentialed author on every page. Anonymous tax content is
         the top YMYL failure mode — docs/spec/07-seo.md § E-E-A-T. -->
    <meta name="author" content="${NAME_HE}, ${TITLE_HE}" />`;
}

/* ==================================================================
   The footer, shared by every document.

   The three mandatory elements under docs/spec/02-constraints.md —
   the שירות נלווה label, the author identity, and the disclaimer — must
   appear on EVERY page. Generating them from one function is the only way
   that stays true as pages are added.
   ================================================================== */
function pageFooter({ lastUpdated, currentYear }) {
  return `<footer class="doc-foot">
      <div class="wrap">
        <div class="doc-foot__grid">
          <div>
            <p>
              <strong>${NAME_HE}</strong><br />
              ${TITLE_HE}
            </p>
            <p class="doc-foot__label">${
              LICENCE_NUMBER
                ? `רישיון מס' <bdi>${LICENCE_NUMBER}</bdi>`
                : `${TITLE_HE} מוסמכת משנת <bdi>${LICENSED_SINCE}</bdi>`
            }</p>
          </div>
          <div>
            <p>
              <a href="tel:${PHONE_TEL}" data-surface="footer"><bdi>${PHONE_DISPLAY}</bdi></a><br />
              <a href="mailto:${EMAIL}" data-surface="footer"><bdi>${EMAIL}</bdi></a>
            </p>
            <p class="doc-foot__label"><a href="/">דף הבית ←</a></p>
          </div>
          <div>
            <p>אזורי שירות: ${SERVICE_AREAS_HE.join(', ')} והסביבה. הטיפול כולו מרחוק.</p>
            <p class="doc-foot__label">
              ${SERVICE_HE} (${SERVICE_CLASS_HE}) · ראיית חשבון
            </p>
          </div>
        </div>
        <p class="doc-foot__disclaimer">
          אין באמור באתר זה ייעוץ מס אישי, ואין בו הבטחה לקבלת החזר או לגובהו.
          גובה ההחזר, אם קיים, נקבע על ידי רשות המסים בלבד.<br />
          עודכן לאחרונה: ${lastUpdated} · © ${currentYear} ${NAME_HE}
        </p>
      </div>
    </footer>`;
}

/** ISO date → Hebrew display date, e.g. 2026-10-16 → 16.10.2026 */
function hebrewDate(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

/** The accessibility statement's URL, for the footer link on every page. */
const accessibilityPath = () => routeBySource('accessibility.html').path;

function injectContent() {
  return {
    name: 'hnz-inject-content',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const w = refundWindow();
        const bars = ledgerBarWidths(w);
        const waHref = `https://wa.me/${PHONE_WA}?text=${encodeURIComponent(WA_MESSAGE)}`;

        /**
         * Per-surface WhatsApp links.
         *
         * `wa.me` discards query parameters, so UTMs do not survive the handoff
         * and the lead arrives in her inbox with no attribution at all. GA4
         * records the click, but she does not read GA4 while answering messages
         * at 23:00 — and GA4 only works once there is consent and a property.
         *
         * So the pre-filled message itself carries the signal: each surface
         * opens with naturally different wording, so she can tell a hero tap
         * from someone who read to the bottom. The latter is a warmer lead.
         * No tracking codes in the text — it has to read like a person wrote it.
         */
        const waHrefFor = (surface) =>
          `https://wa.me/${PHONE_WA}?text=${encodeURIComponent(WA_MESSAGES[surface])}`;

        // ctx.filename is an absolute path to the source HTML entry; the ASCII
        // basename is the page key. Source filenames stay ASCII deliberately
        // (docs/spec/03-architecture.md) — the Hebrew slug is applied to the
        // OUTPUT path in hebrewSlugs() below.
        const page = ctx.filename.replace(/^.*[/\\]/, '').replace(/\.html$/, '');

        const meta = headMeta(page, w);
        const lastUpdated = hebrewMonthYear();

        const tokens = {
          '{{CURRENT_YEAR}}': String(w.currentYear),
          '{{EXPIRING_YEAR}}': String(w.expiringYear),
          '{{LAST_CLOSED_YEAR}}': String(w.lastClosedYear),
          '{{DEADLINE}}': w.deadline,
          '{{DAYS_LEFT}}': String(w.daysLeft),
          '{{DAYS_REMAINING_PHRASE}}': remainingPhrase(w.daysLeft),
          '{{OPEN_YEARS_FIRST}}': String(w.openYears[0]),
          '{{OPEN_YEARS_LAST}}': String(w.openYears[w.openYears.length - 1]),
          '{{LAST_UPDATED}}': lastUpdated,
          '{{WA_HREF}}': waHref,
          '{{WA_HREF_HERO}}': waHrefFor('hero'),
          '{{WA_HREF_STICKY}}': waHrefFor('sticky'),
          '{{WA_HREF_FINAL}}': waHrefFor('final'),

          '{{SITE_HOST}}': ORIGIN_HOST,
          '{{PHONE_TEL}}': PHONE_TEL,
          '{{PHONE_DISPLAY}}': PHONE_DISPLAY,
          '{{EMAIL}}': EMAIL,
          '{{ACCESSIBILITY_HREF}}': accessibilityPath(),
          '{{ACCESSIBILITY_TITLE}}': ACCESSIBILITY_TITLE_HE,
          '{{ACCESSIBILITY_REVIEWED}}': ACCESSIBILITY_REVIEWED,
          '{{ACCESSIBILITY_REVIEWED_HE}}': hebrewDate(ACCESSIBILITY_REVIEWED),

          // Title and description come from the same object the schema uses,
          // so the rendered page and the structured data cannot disagree.
          '{{TITLE}}': meta.title,
          '{{DESCRIPTION}}': meta.description,
          // Falls back to the SERP description where no shorter card copy is
          // declared, so a new page cannot ship with an empty og:description.
          '{{OG_DESCRIPTION}}': meta.ogDescription ?? meta.description,
          '{{HEAD_ASSETS}}': headAssets(meta),
          '{{JSONLD}}': `<script type="application/ld+json">\n${schemaToScript(
            pageSchema(meta),
          )}\n    </script>`,

          '{{PAGE_FOOTER}}': pageFooter({
            lastUpdated,
            currentYear: w.currentYear,
          }),

          '{{LEDGER_ROWS}}': bars.map((r) => ledgerRow(r, w.deadline)).join(''),

          '{{TRIGGERS}}': TRIGGERS.map(
            (t) => `
            <li class="reveal">
              <span class="trigger__name">${t.name}</span>
              <span class="trigger__why">${t.why}</span>
            </li>`,
          ).join(''),

          '{{PROCESS}}': PROCESS.map(
            (s) => `
            <li class="process__step reveal">
              <span class="process__name">${s.name}</span>
              <span class="process__detail">${s.detail}</span>
            </li>`,
          ).join(''),

          '{{CREDENTIALS}}': buildCredentials(),

          '{{LICENCE_LINE}}': LICENCE_NUMBER
            ? `רישיון מס' <bdi>${LICENCE_NUMBER}</bdi>`
            : `רואת חשבון מוסמכת משנת <bdi>${LICENSED_SINCE}</bdi>`,

          '{{SERVICE_AREAS}}':
            `אזורי שירות: ${SERVICE_AREAS_HE.join(', ')} והסביבה. הטיפול כולו מרחוק.`,
        };

        const out = Object.entries(tokens).reduce(
          (acc, [token, value]) => acc.replaceAll(token, value),
          html,
        );

        // Fail the build rather than ship a page with a visible {{TOKEN}}.
        const leftover = out.match(/\{\{[A-Z_]+\}\}/g);
        if (leftover) {
          throw new Error(
            `Unsubstituted tokens in ${page}.html: ${[...new Set(leftover)].join(', ')}`,
          );
        }
        return out;
      },
    },
  };
}

/* ==================================================================
   ASCII source filenames → Hebrew output slugs.

   Source files stay ASCII (docs/spec/03-architecture.md, LOCKED): Hebrew
   filenames are a known failure class on CI runners and in git tooling. The
   Hebrew URL is produced here, at the output stage, by renaming the emitted
   asset to `<slug>/index.html` so GitHub Pages serves it as a directory index.

   Hebrew percent-encoded paths on GitHub Pages were verified by real deploy —
   Gate 0, docs/spec/08-plan.md. Both the percent-encoded form and the raw
   UTF-8 form a user pastes from WhatsApp return 200.

   `rollupOptions.input` cannot do this on its own: Vite derives the output
   path from the input path, so the only way to keep the source ASCII and the
   URL Hebrew is to move the file after it is written.

   It runs in `writeBundle`, on disk, rather than by reassigning entries in the
   `bundle` object during `generateBundle` — Rolldown (Vite 8's bundler)
   explicitly refuses mutations of `bundle` and silently ignores them.

   The mapping is DERIVED from ROUTES, so there is no second list to keep in
   sync with the route table.
   ================================================================== */
function slugMap() {
  const map = {};
  for (const route of shippedRoutes()) {
    if (!route.source || route.source === 'index.html') continue;
    const dir = route.path.replace(/^\/|\/$/g, '');
    map[route.source] = `${dir}/index.html`;
  }
  return map;
}

function hebrewSlugs() {
  return {
    name: 'hnz-hebrew-slugs',
    enforce: 'post',
    apply: 'build',
    async writeBundle(options) {
      const outDir = options.dir;

      for (const [from, to] of Object.entries(slugMap())) {
        const src = path.join(outDir, from);
        const dest = path.join(outDir, to);

        if (!existsSync(src)) {
          throw new Error(
            `hebrewSlugs: expected ${from} in ${outDir}. ` +
              'Is it still listed in build.rollupOptions.input?',
          );
        }

        await mkdir(path.dirname(dest), { recursive: true });
        await rename(src, dest);
      }
    },
  };
}

/**
 * The same mapping, for `vite dev` and `vite preview`.
 *
 * Without this the Hebrew URL 404s locally while working in production, which
 * is the worst kind of divergence: every link in the footer would be dead in
 * development and nobody would trust the local build. Pure URL rewrite — the
 * dev server still resolves and transforms the ASCII source file.
 */
function hebrewSlugsDevServer() {
  const rewrite = (server) => {
    server.middlewares.use((req, _res, next) => {
      try {
        // Both forms: percent-encoded, and the raw UTF-8 a user pastes.
        const decoded = decodeURI(req.url.split('?')[0]);

        for (const [from, to] of Object.entries(slugMap())) {
          const slug = `/${to.replace(/\/index\.html$/, '')}`;
          if (decoded === slug || decoded === `${slug}/`) {
            req.url = `/${from}`;
            break;
          }
        }
      } catch {
        /* malformed percent-encoding — leave it to the next handler */
      }
      next();
    });
  };

  return {
    name: 'hnz-hebrew-slugs-dev',
    apply: 'serve',
    configureServer: rewrite,
    configurePreviewServer: rewrite,
  };
}

/* ==================================================================
   sitemap.xml — generated, never hand-maintained.

   The XML itself is built in src/lib/sitemap.js, which is a pure function of
   ROUTES and an injectable clock so it can be unit-tested. This plugin only
   decides WHERE it lands.

   Emitted with `this.emitFile` rather than written to public/, so there is no
   generated artifact in version control to drift from the real one.
   ================================================================== */
function generateSitemap() {
  return {
    name: 'hnz-sitemap',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: buildSitemap(),
      });
    },
  };
}

/* ==================================================================
   Canonical-host guard.

   The canonical URL must name the host GitHub Pages actually serves. A
   canonical pointing elsewhere tells Google the authoritative copy of this page
   lives somewhere that does not contain this content, and invites it to drop
   the site from the index. SITE_URL and public/CNAME are two separate files, so
   they are checked against each other on every build.
   ================================================================== */
function verifyOrigin() {
  return {
    name: 'hnz-verify-origin',
    apply: 'build',
    buildStart() {
      const cname = fileURLToPath(new URL('./public/CNAME', import.meta.url));
      verifyCanonicalHost(readFileSync(cname, 'utf8'));
    },
  };
}

/* ==================================================================
   OG card tripwire.

   public/og-image.png is a static raster: it cannot be rebuilt at build time
   and link previews are cached hard by the platforms. So its source template
   must never state a year-dependent fact — baking "2020 נסגרת ב-2026" into it
   would make it a false statement about someone's legal rights from the next
   1 January, silently.

   This fails the build if the template mentions the current calendar year or
   the expiring tax year. 2018 (the year she was licensed) is a fixed
   historical fact and is allowed.
   ================================================================== */
function ogImageTripwire() {
  return {
    name: 'hnz-og-tripwire',
    // Build only. This is an output check, and running it under `vitest` or
    // `vite dev` just makes an unrelated failure mode for both.
    apply: 'build',
    buildStart() {
      const template = fileURLToPath(
        new URL('./public/og-image.html', import.meta.url),
      );

      // HTML comments are stripped first: the file explains this very rule in
      // prose, and the explanation necessarily names the years it forbids.
      const html = readFileSync(template, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
      const w = refundWindow();

      for (const year of [w.currentYear, w.expiringYear]) {
        if (html.includes(String(year))) {
          throw new Error(
            `public/og-image.html renders ${year}. The OG card is a static ` +
              'PNG that cannot be regenerated per-year and is cached hard by ' +
              'social platforms, so it must state only evergreen facts. ' +
              'See the comment at the top of that file.',
          );
        }
      }
    },
  };
}

export default defineConfig({
  base: '/',
  plugins: [
    verifyOrigin(),
    ogImageTripwire(),
    injectContent(),
    hebrewSlugs(),
    hebrewSlugsDevServer(),
    generateSitemap(),
  ],
  build: {
    target: 'es2022',
    cssCodeSplit: false,
    rollupOptions: {
      // One real HTML document per route — the MPA decision above. Derived
      // from ROUTES so a new page is declared in exactly one place.
      // Filenames are ASCII; hebrewSlugs() rewrites the output paths.
      input: Object.fromEntries(
        shippedRoutes().map((route) => [
          route.source.replace(/\.html$/, ''),
          fileURLToPath(new URL(`./${route.source}`, import.meta.url)),
        ]),
      ),
    },
  },
});
