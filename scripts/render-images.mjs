/**
 * Image generator — run by hand, not by the build.
 *
 *   node scripts/render-images.mjs
 *
 * Produces, from the two checked-in sources:
 *
 *   public/og-image.html  →  public/og-image.png        1200×630
 *   public/favicon.svg    →  public/favicon-32.png        32×32
 *                         →  public/apple-touch-icon.png 180×180
 *
 * WHY THIS IS A SCRIPT AND NOT A BUILD STEP
 * -----------------------------------------
 * Rasterising needs a browser. Adding Playwright to this repo would multiply
 * its install size for three files that change roughly never, and the CI job
 * would then need a browser download on every deploy. The PNGs are committed;
 * this script exists so they are reproducible rather than mysterious.
 *
 * WHY PLAYWRIGHT IS RESOLVED AT RUNTIME
 * -------------------------------------
 * `playwright-core` is NOT a dependency of this project, deliberately. Point
 * the script at an existing install, or at an already-running browser:
 *
 *   PLAYWRIGHT=/path/to/node_modules/playwright-core  node scripts/render-images.mjs
 *   CDP_URL=http://127.0.0.1:9090                     node scripts/render-images.mjs
 *
 * WHY THE FONT IS INLINED
 * -----------------------
 * The page is loaded over file://, where every file is its own opaque origin,
 * so a relative @font-face URL is treated as cross-origin and dropped. Falling
 * back to the system Hebrew face would silently change the brand. So the woff2
 * is base64'd into a throwaway copy of the HTML before rendering. The source
 * file in public/ keeps its plain relative URLs, which is what it needs when it
 * is served over HTTP.
 */

import { existsSync } from 'node:fs';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');

/* ------------------------------------------------------------------ */
/* Resolve playwright-core from wherever it happens to live.           */
/* ------------------------------------------------------------------ */

async function loadChromium() {
  const candidates = [
    process.env.PLAYWRIGHT,
    'playwright-core',
    'playwright',
    '/tmp/hnz-scrape/node_modules/playwright-core',
  ].filter(Boolean);

  for (const candidate of candidates) {
    // A bare name goes through normal resolution; an absolute path is a package
    // directory, so point at its entry file directly. `createRequire` cannot
    // help here — the install is outside this project's module graph.
    const specifier = candidate.startsWith('/')
      ? pathToFileURL(
          existsSync(path.join(candidate, 'index.js'))
            ? path.join(candidate, 'index.js')
            : candidate,
        ).href
      : candidate;

    try {
      // playwright-core is CommonJS, so the named export is not always
      // statically detectable — fall back to the default/module.exports shape.
      const mod = await import(specifier);
      const chromium = mod.chromium ?? mod.default?.chromium;
      if (chromium) return chromium;
    } catch {
      /* try the next one */
    }
  }

  throw new Error(
    'playwright-core not found. Set PLAYWRIGHT=/path/to/node_modules/playwright-core',
  );
}

async function openBrowser(chromium) {
  const cdp = process.env.CDP_URL;
  if (cdp) {
    const browser = await chromium.connectOverCDP(cdp);
    return { browser, shouldClose: false };
  }
  const browser = await chromium.launch();
  return { browser, shouldClose: true };
}

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const scratch = await mkdtemp(path.join(tmpdir(), 'hnz-render-'));

/** Write `html` into the public/ directory's sibling scratch dir and return a file:// URL. */
async function stage(name, html) {
  const file = path.join(scratch, name);
  await writeFile(file, html, 'utf8');
  return pathToFileURL(file).href;
}

async function fontDataUri(file) {
  const buf = await readFile(path.join(PUBLIC, 'fonts', file));
  return `data:font/woff2;base64,${buf.toString('base64')}`;
}

async function shoot(browser, { url, width, height, out, omitBackground = false }) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'load' });
  // Let the inlined webfont finish decoding — without this the first render
  // can land on the fallback face.
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
  await page.screenshot({
    path: out,
    omitBackground,
    clip: { x: 0, y: 0, width, height },
  });
  await context.close();
  console.log(`  ✓ ${path.relative(ROOT, out)}  ${width}×${height}`);
}

/* ------------------------------------------------------------------ */
/* 1. The Open Graph card                                             */
/* ------------------------------------------------------------------ */

async function renderOgImage(browser) {
  let html = await readFile(path.join(PUBLIC, 'og-image.html'), 'utf8');

  for (const file of ['rubik-hebrew-var.woff2', 'rubik-latin-var.woff2']) {
    html = html.replace(`url('fonts/${file}')`, `url('${await fontDataUri(file)}')`);
  }

  const url = await stage('og-image.html', html);
  await shoot(browser, {
    url,
    width: 1200,
    height: 630,
    out: path.join(PUBLIC, 'og-image.png'),
  });
}

/* ------------------------------------------------------------------ */
/* 2. The icons                                                       */
/* ------------------------------------------------------------------ */

/**
 * `bleed` drops the mark's own corner radius and fills the whole square,
 * because iOS applies its own mask to apple-touch-icon and would otherwise
 * clip transparent corners onto whatever is behind them.
 *
 * `scale` oversizes the artwork and lets the square crop it. The SVG carries
 * generous internal padding so it reads well as a 16px tab icon; a home-screen
 * tile wants the opposite — a mark that fills its field — so the apple icon
 * scales past 1 and the overflow is clipped.
 */
async function renderIcon(browser, { size, out, bleed = false, scale = 1 }) {
  let svg = (await readFile(path.join(PUBLIC, 'favicon.svg'), 'utf8'))
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();

  if (bleed) svg = svg.replace(' rx="4"', '');

  // Strip the intrinsic size from the <svg> tag ONLY — the same regex applied
  // globally would also eat the background <rect>'s width/height and silently
  // render the mark with no plate behind it.
  svg = svg.replace(/<svg\b[^>]*>/, (tag) => tag.replace(/\s(width|height)="32"/g, ''));

  const html = `<!doctype html>
<meta charset="utf-8">
<style>
  html, body { margin: 0; width: ${size}px; height: ${size}px; overflow: hidden; }
  body { background: ${bleed ? '#30332f' : 'transparent'}; display: grid; place-items: center; }
  /* Scaled with a transform rather than a larger width: transform-origin is
     the centre, so the crop is symmetric. Sizing the element up instead makes
     overflow clip from one corner and the mark lands off-centre. */
  svg { width: ${size}px; height: ${size}px; display: block; transform: scale(${scale}); }
</style>
${svg}`;

  const url = await stage(`icon-${size}.html`, html);
  await shoot(browser, {
    url,
    width: size,
    height: size,
    out,
    // The small favicon keeps its rounded corners, so the corners themselves
    // must be transparent rather than white — otherwise they show as four
    // white pips against dark browser chrome.
    omitBackground: !bleed,
  });
}

/* ------------------------------------------------------------------ */

const chromium = await loadChromium();
const { browser, shouldClose } = await openBrowser(chromium);

console.log('rendering brand images…');
await renderOgImage(browser);
await renderIcon(browser, {
  size: 32,
  out: path.join(PUBLIC, 'favicon-32.png'),
});
await renderIcon(browser, {
  size: 180,
  out: path.join(PUBLIC, 'apple-touch-icon.png'),
  bleed: true,
  scale: 1.3,
});

if (shouldClose) await browser.close();
console.log('done.');

// Over CDP the connection keeps the event loop alive even after the contexts
// are closed, because we must not close someone else's browser. Exit outright.
process.exit(0);
