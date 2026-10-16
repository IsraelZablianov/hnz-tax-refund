/**
 * Post-build verification. Run by `npm run verify` and by CI after the build.
 *
 * Why this is a script and not shell in the workflow: the JSON-LD check has to
 * actually PARSE the structured data. A `grep` for `application/ld+json` proves
 * the tag exists, not that its contents are valid JSON, and invalid JSON-LD is
 * silently ignored by Google — the exact failure this is here to catch.
 *
 * Everything asserted here is a failure mode this site specifically cares
 * about. If a check feels arbitrary, read the comment above it.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  OG_IMAGE_WIDTH,
  OG_IMAGE_HEIGHT,
  LICENCE_NUMBER,
  PHONE_DISPLAY,
  EMAIL,
  CITY_HE,
  GA4_MEASUREMENT_ID,
} from '../src/content/site.js';
import { NODE } from '../src/lib/schema.js';
import { ORIGIN, ORIGIN_HOST } from '../src/lib/urls.js';
import { shippedRoutes, routeBySource } from '../src/content/routes.js';
import { refundWindow } from '../src/lib/refundWindow.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

/** The Hebrew-slug output path for the accessibility statement. */
const A11Y_ROUTE = routeBySource('accessibility.html');
const A11Y_FILE = `${A11Y_ROUTE.path.replace(/^\/|\/$/g, '')}/index.html`;

const failures = [];
const checks = [];

function ok(label) {
  checks.push(label);
}

function fail(label, detail) {
  failures.push(detail ? `${label} — ${detail}` : label);
}

function check(label, condition, detail) {
  if (condition) ok(label);
  else fail(label, detail);
}

function read(rel) {
  return readFileSync(path.join(DIST, rel), 'utf8');
}

/* ================================================================
   1. The files that must exist in dist/
   ================================================================ */

const REQUIRED_FILES = [
  // Deploy infrastructure. Without .nojekyll, GitHub Pages runs the output
  // through Jekyll, which ignores directories starting with _ and can mangle
  // non-ASCII paths — i.e. exactly our Hebrew slug.
  '.nojekyll',
  'CNAME',
  // SEO
  'robots.txt',
  'sitemap.xml',
  // Brand
  'favicon.svg',
  'favicon-32.png',
  'apple-touch-icon.png',
  'og-image.png',
  'og-image.html',
  'site.webmanifest',
  // Documents
  'index.html',
  A11Y_FILE,
];

for (const file of REQUIRED_FILES) {
  check(`dist/${file}`, existsSync(path.join(DIST, file)));
}

if (failures.length) {
  console.error('verify: required files missing, stopping.');
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}

/* ================================================================
   2. JSON-LD — parsed, not grepped
   ================================================================ */

function parseJsonLd(file, label) {
  const html = read(file);
  const blocks = [
    ...html.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    ),
  ];

  check(`${label}: exactly one JSON-LD block`, blocks.length === 1, `found ${blocks.length}`);
  if (blocks.length !== 1) return null;

  try {
    const parsed = JSON.parse(blocks[0][1]);
    ok(`${label}: JSON-LD parses`);
    return parsed;
  } catch (error) {
    fail(`${label}: JSON-LD parses`, error.message);
    return null;
  }
}

const homeLd = parseJsonLd('index.html', 'index.html');
const a11yLd = parseJsonLd(A11Y_FILE, 'נגישות/index.html');

/** Find a node in a @graph by @id. */
const nodeById = (ld, id) => (ld?.['@graph'] ?? []).find((n) => n['@id'] === id);

/** Find a node in a @graph by @type, tolerating the array form. */
const nodeByType = (ld, type) =>
  (ld?.['@graph'] ?? []).find((n) =>
    Array.isArray(n['@type']) ? n['@type'].includes(type) : n['@type'] === type,
  );

if (homeLd) {
  const business = nodeById(homeLd, NODE.business);
  const person = nodeById(homeLd, NODE.person);
  const service = nodeById(homeLd, NODE.service);
  const webpage = nodeByType(homeLd, 'WebPage');

  check('home: @context is schema.org', homeLd['@context'] === 'https://schema.org');
  check('home: business node present at its stable @id', Boolean(business));
  check('home: person node present at its stable @id', Boolean(person));
  check('home: service node present at its stable @id', Boolean(service));
  check('home: WebPage node present', Boolean(webpage));

  if (business) {
    check(
      'home: business is AccountingService',
      business['@type'].includes('AccountingService'),
    );
    check(
      'home: business is also ProfessionalService',
      business['@type'].includes('ProfessionalService'),
    );
    check(
      'home: founder references the Person by @id',
      business.founder?.['@id'] === NODE.person,
    );
    check(
      'home: addressLocality is the real city',
      business.address?.addressLocality === CITY_HE,
    );
    check('home: addressCountry is IL', business.address?.addressCountry === 'IL');
    check('home: areaServed is populated', (business.areaServed ?? []).length > 0);

    // DELIBERATE. She is a service-area business with a hidden address, so
    // schema must not publish a street — see the header of src/lib/schema.js.
    // This assertion exists so that a well-meaning "fix the Rich Results Test"
    // change fails the build instead of shipping.
    check(
      'home: streetAddress is ABSENT (service-area business, deliberate)',
      !('streetAddress' in (business.address ?? {})),
      'a street address was added — read the header of src/lib/schema.js first',
    );
  }

  if (person) {
    const credential = person.hasCredential;
    check('home: hasCredential present', Boolean(credential));
    check(
      'home: credential is recognised by the state register',
      credential?.recognizedBy?.['@type'] === 'GovernmentOrganization',
    );

    // The licence number must appear in structured data ONLY when we actually
    // have it, because structured data has to match visible content and the
    // credential block omits it until then. A placeholder identifier would be
    // an unevidenced claim about a regulated credential.
    if (LICENCE_NUMBER) {
      check(
        'home: licence identifier matches site.js',
        credential?.identifier === String(LICENCE_NUMBER),
      );
      check(
        'home: licence number is also visible in the HTML',
        read('index.html').includes(String(LICENCE_NUMBER)),
        'structured data must match visible content',
      );
    } else {
      check(
        'home: no licence identifier while LICENCE_NUMBER is null',
        !('identifier' in (credential ?? {})),
        'degrades gracefully — do not emit a placeholder identifier',
      );
    }
  }

  if (service) {
    // The mandatory 2(ג)(4) distinction has to survive into the structured
    // data, not just the visible copy.
    check(
      'home: serviceType carries the שירות נלווה label',
      String(service.serviceType).includes('שירות נלווה'),
    );
    check(
      'home: service provider references the business by @id',
      service.provider?.['@id'] === NODE.business,
    );
  }

  if (webpage) {
    const html = read('index.html');
    check('home: WebPage url is on the one host', webpage.url?.startsWith(ORIGIN));
    check(
      'home: schema name matches the rendered <title>',
      html.includes(`<title>${webpage.name}</title>`),
      'structured data must match visible content',
    );
    check(
      'home: schema description matches the meta description',
      html.includes(`content="${webpage.description}"`),
    );
    check('home: WebPage has a named author', Boolean(webpage.author?.['@id']));
  }

  // No fee anywhere, in any of the shapes schema.org offers. 2(ג)(14) forbids
  // ציון שכר טרחה, and a price in schema is a published fee just as much as
  // one in the body copy.
  const serialised = JSON.stringify(homeLd);
  for (const banned of [
    'priceSpecification',
    'feesAndCommissionsSpecification',
    '"price"',
    // The four dead or prohibited types. See the header of src/lib/schema.js.
    'FAQPage',
    'HowTo',
    'AggregateRating',
    '"Review"',
  ]) {
    check(
      `home: no ${banned.replaceAll('"', '')} in JSON-LD`,
      !serialised.includes(banned),
      'prohibited by docs/spec/02-constraints.md, or a dead Google feature',
    );
  }
}

if (a11yLd) {
  const crumbs = nodeByType(a11yLd, 'BreadcrumbList');
  const webpage = nodeByType(a11yLd, 'WebPage');

  check('נגישות: BreadcrumbList present', Boolean(crumbs));
  check(
    'נגישות: breadcrumb has two levels',
    crumbs?.itemListElement?.length === 2,
  );
  check(
    'נגישות: breadcrumb items are absolute URLs on the one host',
    (crumbs?.itemListElement ?? []).every((i) => i.item?.startsWith(ORIGIN)),
  );
  check(
    'נגישות: WebPage url is the Hebrew slug, percent-encoded',
    webpage?.url === `${ORIGIN}${encodeURI(A11Y_ROUTE.path)}`,
  );

  // Every page emits the full graph, which is fine — Google reconciles nodes
  // by @id. What must NOT happen is the same entity appearing under different
  // ids, or with different values, on different pages: that is how one
  // knowledge-graph entity gets split into two. So compare them byte for byte.
  if (homeLd) {
    for (const [label, id] of [
      ['business', NODE.business],
      ['person', NODE.person],
      ['service', NODE.service],
    ]) {
      check(
        `${label} node is byte-identical across both pages`,
        JSON.stringify(nodeById(homeLd, id)) ===
          JSON.stringify(nodeById(a11yLd, id)),
        'a split entity is worse than no markup',
      );
    }
  }
}

/* ================================================================
   3. Head wiring — favicons, manifest, OG image
   ================================================================ */

for (const [file, label] of [
  ['index.html', 'index.html'],
  [A11Y_FILE, 'נגישות/index.html'],
]) {
  const html = read(file);

  check(`${label}: lang="he" dir="rtl"`, html.includes('<html lang="he" dir="rtl">'));
  check(`${label}: favicon.svg linked`, html.includes('href="/favicon.svg"'));
  check(`${label}: apple-touch-icon linked`, html.includes('href="/apple-touch-icon.png"'));
  check(`${label}: manifest linked`, html.includes('href="/site.webmanifest"'));
  check(`${label}: og:image absolute`, html.includes(`content="${ORIGIN}/og-image.png"`));
  check(
    `${label}: og:image dimensions declared`,
    html.includes(`content="${OG_IMAGE_WIDTH}"`) &&
      html.includes(`content="${OG_IMAGE_HEIGHT}"`),
  );
  check(
    `${label}: canonical on the host CNAME serves`,
    html.includes(`<link rel="canonical" href="${ORIGIN}`),
    `must be ${ORIGIN_HOST}`,
  );
  check(`${label}: named author byline`, html.includes('<meta name="author"'));
  check(`${label}: og:description is not empty`, !/og:description" content=""/.test(html));

  // The mandatory 2(ג)(4) label, on every page without exception.
  check(`${label}: labelled שירות נלווה`, html.includes('שירות נלווה'));
  check(`${label}: carries the footer disclaimer`, html.includes('אין באמור באתר זה ייעוץ מס אישי'));

  // No unsubstituted tokens, and no leftover template syntax.
  check(`${label}: no {{TOKEN}} left`, !/\{\{[A-Z_]+\}\}/.test(html));
}

/* ================================================================
   4. The OG PNG really is 1200×630
   ================================================================ */

// PNG IHDR: 8-byte signature, 4-byte length, 4-byte type, then width/height
// as big-endian uint32. Cheaper and more honest than trusting the filename.
const png = readFileSync(path.join(DIST, 'og-image.png'));
const pngWidth = png.readUInt32BE(16);
const pngHeight = png.readUInt32BE(20);
check(
  `og-image.png is ${OG_IMAGE_WIDTH}×${OG_IMAGE_HEIGHT}`,
  pngWidth === OG_IMAGE_WIDTH && pngHeight === OG_IMAGE_HEIGHT,
  `got ${pngWidth}×${pngHeight}`,
);

for (const [file, size] of [
  ['favicon-32.png', 32],
  ['apple-touch-icon.png', 180],
]) {
  const buf = readFileSync(path.join(DIST, file));
  check(
    `${file} is ${size}×${size}`,
    buf.readUInt32BE(16) === size && buf.readUInt32BE(20) === size,
    `got ${buf.readUInt32BE(16)}×${buf.readUInt32BE(20)}`,
  );
}

/* ================================================================
   5. robots.txt, sitemap.xml, manifest
   ================================================================ */

const robots = read('robots.txt');
check('robots.txt allows all', /User-agent:\s*\*/.test(robots) && /Allow:\s*\//.test(robots));
check('robots.txt has no stray Disallow', !/^\s*Disallow:\s*\S/m.test(robots));
check('robots.txt points at the sitemap', robots.includes(`${ORIGIN}/sitemap.xml`));

const sitemap = read('sitemap.xml');
check(
  'sitemap declares the sitemaps.org namespace',
  sitemap.includes('http://www.sitemaps.org/schemas/sitemap/0.9'),
);

// Derived from ROUTES, so this cannot drift from what is actually built.
const routes = shippedRoutes();
for (const route of routes) {
  const loc = `${ORIGIN}${encodeURI(route.path)}`;
  check(`sitemap lists ${route.path}`, sitemap.includes(`<loc>${loc}</loc>`));
}
check(
  'sitemap lists ONLY shipped routes',
  (sitemap.match(/<loc>/g) ?? []).length === routes.length,
  'an entry for a page that 404s is a self-inflicted crawl error',
);

// The homepage lastmod must be generated, i.e. today — not a date someone
// typed once. The accessibility statement deliberately keeps its review date.
const today = new Date().toISOString().slice(0, 10);
check(
  'sitemap: year-derived pages carry the build date',
  sitemap.includes(`<lastmod>${today}</lastmod>`),
  `expected ${today}; a stale date means it is being hand-maintained`,
);
check(
  'sitemap: the accessibility statement keeps its review date',
  sitemap.includes(`<lastmod>${A11Y_ROUTE.lastmod}</lastmod>`),
  'a conformance claim must not be re-dated by a deploy',
);

const manifest = JSON.parse(read('site.webmanifest'));
check('manifest parses', true);
check('manifest lang is he', manifest.lang === 'he');
check('manifest dir is rtl', manifest.dir === 'rtl');
check('manifest name is Hebrew', /[\u0590-\u05FF]/.test(manifest.name));
check('manifest short_name is Hebrew', /[\u0590-\u05FF]/.test(manifest.short_name));
check('manifest theme_color', manifest.theme_color === '#30332f');
check('manifest background_color', manifest.background_color === '#f3efe7');

/* ================================================================
   6. The accessibility page is a real statement, not a stub
   ================================================================ */

const a11y = read(A11Y_FILE);

check('נגישות: cites ת"י 5568', a11y.includes('5568'));
check('נגישות: declares an AA target', a11y.includes('AA'));
check('נגישות: discloses what is NOT finished', a11y.includes('מה עדיין לא הושלם'));
check('נגישות: gives a phone contact route', a11y.includes(PHONE_DISPLAY));
check('נגישות: gives an email contact route', a11y.includes(EMAIL));
check('נגישות: is dated', a11y.includes('<time datetime="'));
check(
  'נגישות: linked from the homepage footer',
  read('index.html').includes(`href="${A11Y_ROUTE.path}"`),
);

/* ================================================================
   7. No client-rendered primary content
   ================================================================ */

// The whole reason for the MPA decision. The ledger and the triggers are the
// page's factual claims; if they ever move into JS, crawlers and JS-disabled
// visitors lose them.
const home = read('index.html');
check('home: ledger rows are in the static HTML', (home.match(/ledger__row/g) ?? []).length >= 6);
check('home: all nine triggers are in the static HTML', (home.match(/trigger__name/g) ?? []).length >= 9);
check('home: process steps are in the static HTML', home.includes('process__step'));

// The accessibility statement needs no JS at all; it should not be loading a
// bundle it has no use for.
check(
  'נגישות: ships no JS bundle',
  !/<script type="module"/.test(a11y),
  'the statement is pure prose — it should not pull in the runtime',
);

/* ================================================================
   8. Compliance tripwires over the whole output
   ================================================================ */

const w = refundWindow();
// og-image.html is SERVED, not just a build input — it ships in dist/ so the
// card can be regenerated from a deployed checkout. So it gets scanned like
// any other document.
const ogHtml = read('og-image.html');
const allHtml = [home, a11y, ogHtml].join('\n');

const PROHIBITED = [
  ['חינם', "prohibited verbatim by the ethics committee — use 'ללא עלות'"],
  ['מומחה', "self-praise — only 'מתמחה' is permitted"],
  ['7 שנים', 'factually wrong: the income-tax window is 6 years'],
  ['שבע שנים', 'factually wrong: the income-tax window is 6 years'],
  ['מוביל', 'superlative / self-praise'],
];

for (const [needle, why] of PROHIBITED) {
  check(`output is free of "${needle}"`, !allHtml.includes(needle), why);
}

/* ================================================================
   Conversion tracking and consent.

   Added by a concurrent session — see AGENT-HANDOFF.md. These guard the
   attribution layer, which is invisible in the rendered page and therefore
   the easiest thing on the site to break without noticing.
   ================================================================ */

const homeHtml = read('index.html');

/**
 * The built JS and CSS bundles, concatenated.
 *
 * Read by hashed filename from dist/assets, because the z-index and
 * measurement-ID checks below have to inspect what actually shipped — the
 * source files are not what the browser receives.
 */
const assetsDir = path.join(DIST, 'assets');
const assetFiles = existsSync(assetsDir) ? readdirSync(assetsDir) : [];
const readAssets = (ext) =>
  assetFiles
    .filter((f) => f.endsWith(ext))
    .map((f) => readFileSync(path.join(assetsDir, f), 'utf8'))
    .join('\n');

const bundleJs = readAssets('.js');
const bundleCss = readAssets('.css');

check('a JS bundle was emitted', bundleJs.length > 0);
check('a CSS bundle was emitted', bundleCss.length > 0);

// Every conversion link must declare which surface it belongs to, or the
// GA4 event arrives tagged `unknown` and the per-surface report is useless.
const conversionLinks = [...homeHtml.matchAll(/<a\b[^>]*href="(?:https:\/\/wa\.me|tel:)[^"]*"[^>]*>/g)];
check(
  'every WhatsApp/phone link carries data-surface',
  conversionLinks.length > 0 && conversionLinks.every((m) => m[0].includes('data-surface=')),
  `${conversionLinks.filter((m) => !m[0].includes('data-surface=')).length} of ` +
    `${conversionLinks.length} conversion links are untagged`,
);

// wa.me strips query parameters, so the pre-filled message is the ONLY
// attribution that survives the handoff. Distinct messages per surface are
// what let her tell a hero tap from someone who read to the bottom.
const waMessages = new Set(
  [...homeHtml.matchAll(/wa\.me\/\d+\?text=([^"]+)/g)].map((m) => m[1]),
);
check(
  'WhatsApp surfaces use distinct pre-filled messages',
  waMessages.size >= 3,
  `found ${waMessages.size} distinct message(s); attribution needs one per surface`,
);

// The message must read like a person wrote it. A visible tracking token
// would undercut the single thing this site is selling.
for (const encoded of waMessages) {
  const decoded = decodeURIComponent(encoded);
  check(
    'WhatsApp message carries no tracking token',
    !/\[|\]|utm_|surface=/.test(decoded),
    decoded.slice(0, 60),
  );
}

// Analytics must ship inert until a real measurement ID exists. If this
// fails, the site is loading GA4 and setting cookies — תיקון 13 exposure.
if (!GA4_MEASUREMENT_ID) {
  check(
    'no GA4 measurement ID is baked into the output',
    !/G-[A-Z0-9]{8,}/.test(allHtml + bundleJs),
    'analytics must stay inert while GA4_MEASUREMENT_ID is null',
  );
  check(
    'no analytics script tag in the served HTML',
    !allHtml.includes('googletagmanager.com'),
    'gtag must be injected by JS after consent, never hardcoded in <head>',
  );
}

// The consent notice must never be a pop-up — תקנה 2(ב)(4) prohibits those.
// It is created by JS and appended to <body>, so it must be absent from the
// static HTML, and it must sit below the sticky CTA bar.
check(
  'consent bar is not in the static HTML',
  !homeHtml.includes('class="consent"'),
  'it must be JS-created and absent for crawlers and no-JS visitors',
);
check(
  'consent bar sits below the sticky CTA bar',
  (() => {
    const consentZ = /\.consent\s*\{[^}]*z-index:\s*(\d+)/.exec(bundleCss)?.[1];
    const stickyZ = /\.sticky-bar\s*\{[^}]*z-index:\s*(\d+)/.exec(bundleCss)?.[1];
    return consentZ && stickyZ && Number(consentZ) < Number(stickyZ);
  })(),
  'a consent notice must never cover the WhatsApp button',
);

// The OG card is a cached static raster, so it must carry no year-dependent
// claim. Mirrors the build-time tripwire in vite.config.js; asserted again
// here against the SHIPPED file.
const ogBody = ogHtml.replace(/<!--[\s\S]*?-->/g, '');
for (const year of [w.currentYear, w.expiringYear]) {
  check(
    `og-image.html states no year-dependent fact (${year})`,
    !ogBody.includes(String(year)),
    'link previews are cached hard; this would go false on 1 January',
  );
}

/* ================================================================ */

console.log(`verify: ${checks.length} checks passed`);

if (failures.length) {
  console.error(`\nverify: ${failures.length} FAILED\n`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}

console.log('✓ dist verified');
