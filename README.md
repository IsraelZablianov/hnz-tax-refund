# hnz-tax-refund

Hebrew (RTL), statically generated lead-generation site for **הילה נח זבליאנוב,
רואת חשבון** — a licensed Israeli CPA — selling one service: `החזרי מס לשכירים`
(income-tax refunds for salaried employees).

One job: get a salaried Israeli employee to start a WhatsApp conversation about
checking whether they are owed a refund, before their oldest claimable tax year
expires.

- **Live:** <https://tax.hnz-cpa.com> (GitHub Pages, deployed from `main`)
- **Spec — source of truth:** [`docs/spec/`](docs/spec/README.md)
- **Agent/contributor rules:** [`AGENTS.md`](AGENTS.md)

---

## Why this repo looks the way it does

Israeli CPA conduct regulations (`תקנות רואי חשבון (התנהגות שאינה הולמת את כבוד
המקצוע), תשכ"ה-1965`, as amended 2025) forbid almost every lever a normal
conversion site pulls. No fee, no price range, no discount, no testimonials —
even anonymised — no client results or averages, no comparison tables, no
superlatives, no pop-ups. `תקנה 2(ג)` is a **closed list**: copy either fits an
enumerated permitted item or it is not permitted at all. Breach is a
disciplinary offence that can reach her licence.

So the persuasion engine is built to never depend on any of them. It converts on
four things she alone can offer:

1. **A real statutory deadline.** Under `§160(א) לפקודת מס הכנסה` a refund claim
   requires the annual return to be filed no later than six years after the tax
   year. In calendar year `Y`, tax years `Y-6 … Y-1` are claimable and `Y-6`
   expires on 31 December.
2. **A named licensed professional**, verifiable in the public government
   register.
3. **Radical procedural transparency** about what happens to the visitor's
   documents and data.
4. **Honest disclosure** of the ~1.4% chance that a filing surfaces a debt
   rather than a refund — in a market the consumer protection authority publicly
   associates with `העוקץ הפיננסי`.

Read [`docs/spec/02-constraints.md`](docs/spec/02-constraints.md) before writing
or editing a single user-facing string. The restraint is the differentiator, not
a limitation to work around.

## Status

| Area | State |
| --- | --- |
| Year math + Hebrew helpers | Shipped, under test (`npm test`) |
| Content layer (`src/content/`) | Shipped — no Hebrew string or contact detail lives outside it |
| Homepage `/` with the to-scale years ledger | Shipped |
| Deploy infrastructure — `robots.txt`, generated `sitemap.xml`, favicons, web manifest, OG card, `.nojekyll` | Shipped |
| JSON-LD — `AccountingService`, `Person` + `hasCredential`, `Service`, `BreadcrumbList` | Shipped, injected at build time |
| `/נגישות/` accessibility statement | Shipped — legally required, `תקן ת"י 5568` |
| Pages deploy + compliance tripwires + `npm run verify` | Shipped |
| Eligibility quiz, `/אודות`, guides, city page, remaining routes | Planned — see [`docs/spec/08-plan.md`](docs/spec/08-plan.md) |
| Licence number, GA4 property, extra photography | Open questions blocking specific pages (`08-plan.md`) |

## Quick start

Node 22 (what CI uses).

```bash
npm install
npm run dev      # dev server; Hebrew slugs are rewritten like production
npm run build    # production build — injects year data, schema and head at build time
npm run verify   # assert dist/ is shippable — run after every build
npm run preview  # serve the build locally
npm test         # vitest — year math and Hebrew plural agreement
npm run test:watch
npm run images   # regenerate the favicons and OG card (needs a browser)
```

### Regenerating the brand images

The favicon PNGs and the Open Graph card are committed, but generated from
checked-in sources — `public/favicon.svg` and `public/og-image.html` — so they
are reproducible rather than mysterious. Edit the source, re-render, commit the
PNGs. Never edit a PNG directly.

`playwright-core` is deliberately **not** a dependency: the site ships ~1.8 kB of
gzipped JS and a browser download is not worth three files that change roughly
never. Point the script at an existing install, or at a running browser:

```bash
PLAYWRIGHT=/path/to/node_modules/playwright-core npm run images
CDP_URL=http://127.0.0.1:9090 npm run images
```

## How it works

**Vite MPA.** One real HTML document per route, no SPA shell. React is reserved
for two interactive islands (the eligibility quiz and the day counter); the
substantive content is static HTML, because every factual claim on the page must
be extractable by crawlers and AI assistants without JavaScript.

Year-dependent content flows one way:

```
src/lib/refundWindow.js          the factual spine — §160 window, deadlines, day counts
        ↓ (build time)
vite.config.js  transformIndexHtml
        ↓   substitutes {{TOKENS}} in index.html, throws if any survive
dist/index.html                  complete page, correct without JS
        ↓ (runtime, src/home.js)
corrects a stale build client-side + wires the scroll reveal
```

Everything else in the `<head>` is injected from the same place, from one
definition each, so the rendered page and the machine-readable copy of it cannot
disagree:

```
src/content/routes.js    path, source file, sitemap priority — one entry per page
src/content/site.js      NAP, licence, origin, service areas
        ↓
src/lib/urls.js          absoluteUrl() — percent-encoded, one host, checked against CNAME
src/lib/schema.js        the JSON-LD @graph, stable @ids
        ↓ (build time)
vite.config.js           <title>, meta description, OG/Twitter, canonical, JSON-LD,
                         the shared footer, and dist/sitemap.xml
```

`<title>`, the meta description and the schema `WebPage` node are the *same
string*. `npm run verify` asserts that byte for byte — structured data that
contradicts the page it describes is worse than no structured data.

The three-layer defence against a stale date exists because a wrong year here is
a wrong statement about someone's legal rights:

1. **Build time** — `transformIndexHtml` injects the current window.
2. **Runtime** — `src/home.js` detects a build that has outlived its year and
   rebuilds the ledger in place.
3. **Scheduled rebuild** — the workflow runs on `cron: 5 0 1 1 *`, so the static
   HTML a crawler sees is corrected on 1 January too.

`refundWindow()` resolves "today" in `Asia/Jerusalem` regardless of the
visitor's device clock, and differences UTC midnights so no offset or DST
transition can corrupt the day count. It also exposes `pastPracticalCutoff`:
within 35 days of the deadline the messaging stops leading on the expiring year,
because the statutory trigger is that the return is *filed* and reconstructing a
six-year-old `טופס 106` takes weeks — advertising it as open would risk being
misleading under `§2(א) חוק הגנת הצרכן`.

## Routes

| URL | Source | Notes |
| --- | --- | --- |
| `/` | `index.html` | The money page |
| `/נגישות/` | `accessibility.html` | Legally required under `תקן ת"י 5568` |

URLs are Hebrew; **source filenames are not.** Hebrew filenames are a known
failure class on CI runners and in git tooling, so `accessibility.html` is an
ASCII entry point and the `hnz-hebrew-slugs` plugin renames the output to
`נגישות/index.html`, which Pages serves as a directory index. Canonicals and the
sitemap use the percent-encoded form, consistently.

Verified by real deploy, not inference — Gate 0 in
[`docs/spec/08-plan.md`](docs/spec/08-plan.md). Percent-encoded paths, nested
percent-encoded paths, and the raw UTF-8 a user pastes from WhatsApp all return
200 on GitHub Pages. The dev server rewrites the same slugs, so `/נגישות/` works
locally exactly as it does in production.

`src/content/routes.js` is the one place a route is declared. The build derives
`rollupOptions.input`, the slug renames and `sitemap.xml` from it, so a page
cannot exist in one of those and not the others. Adding a page means an entry
there plus its `<head>` metadata in `vite.config.js`; the build fails with a
pointed message if either is missing.

Eight more pages are planned in
[`docs/spec/03-architecture.md`](docs/spec/03-architecture.md). `shipped: false`
routes are deliberately excluded from the sitemap — advertising a URL that 404s
is a self-inflicted crawl error.

## SEO & structured data

`src/lib/schema.js` builds one `@graph` per page with stable `@id`s, so every
page references the business rather than restating it. Duplicated entities with
slightly different values are how one knowledge-graph entity gets split in two;
`npm run verify` compares the shared nodes across pages byte for byte.

Two decisions worth knowing before you touch it:

**`streetAddress` is deliberately omitted.** She is a service-area business
working from a home office with no exterior signage, so her Google Business
Profile hides the address and schema must match what the profile shows. This
means Google's Rich Results Test reports the business node as invalid, because
`address` with a street is a required property. **That is the correct
trade-off** — we lose a rich result we were unlikely to get, and keep the profile
and the truth. `npm run verify` fails if a street address is ever added, so the
"fix" cannot ship silently.

**The licence number degrades gracefully.** `LICENCE_NUMBER` is currently `null`
(pending from Hila). While it is null, neither the visible credential block nor
the JSON-LD emits it — structured data must match visible content, and a
placeholder identifier would be an unevidenced claim about a regulated
credential. Set the constant and both appear, verified against each other.

## Layout

```
index.html              homepage template, {{TOKENS}} filled at build time
accessibility.html      → /נגישות/   (ASCII source, Hebrew output slug)
vite.config.js          build-time injection, slug renames, sitemap, guards
scripts/
  render-images.mjs     og-image.html + favicon.svg → PNGs (manual, needs a browser)
  verify-dist.mjs       post-build assertions — npm run verify, also run by CI
src/
  home.js               runtime: stale-build correction, scroll reveal
  lib/refundWindow.js   §160 year math — single source of truth for dates
  lib/hebrew.js         Hebrew plural agreement, month/year formatting
  lib/urls.js           absoluteUrl(), and the canonical-host guard
  lib/schema.js         the JSON-LD @graph — build-time only, never bundled
  lib/*.test.js         vitest coverage for the year math and Hebrew helpers
  content/routes.js     the route table — paths, source files, sitemap metadata
  content/site.js       canonical business facts: name, phone, licence, areas, gov links
  content/copy.js       Hebrew copy blocks (triggers, process, WhatsApp message)
  styles/tokens.css     design tokens
  styles/{base,home,doc}.css
public/
  .nojekyll             stops Jekyll mangling the Hebrew slug
  CNAME                 tax.hnz-cpa.com
  favicon.svg           the HNZ mark — source of both PNGs
  favicon-32.png        32×32, generated
  apple-touch-icon.png  180×180, generated
  og-image.html         source of the OG card — edit this, not the PNG
  og-image.png          1200×630, generated
  robots.txt            allow all, points at the sitemap
  site.webmanifest      Hebrew name, RTL
  fonts/                self-hosted Rubik subsets (Hebrew + Latin)
docs/spec/              the spec — intent, constraints, architecture, copy deck,
                        funnel, design, SEO, build plan
```

`sitemap.xml` is **generated into `dist/`**, never committed, so `lastmod` cannot
go stale. Do not add a hand-maintained one to `public/`.

## Hard rules

These are the ones that break the site — or her licence — when ignored.
`AGENTS.md` is the full list.

- **No hardcoded years, dates or day counts.** Everything comes from
  `refundWindow()`. A literal `2020` in a template is a bug that becomes a false
  legal claim on 1 January.
- **No hardcoded contact details.** Name, phone, email, licence number and
  service areas live in `src/content/site.js`. They appear in both visible text
  and JSON-LD; NAP consistency is a local-search signal and the two must never
  diverge.
- **The service is labelled `שירות נלווה`**, visually distinguished from
  `ראיית חשבון`. Mandatory under `2(ג)(4)`.
- **RTL:** `<html lang="he" dir="rtl">`; logical CSS properties only
  (`margin-inline-start`, never `left`/`right`); wrap every Latin or numeric run
  in `<bdi>` — phone numbers, `31.12.2026`, `1.4%`. Hebrew has a real dual form,
  so use `src/lib/hebrew.js`: `1 → יום אחד`, `2 → יומיים`, `3+ → N ימים`.
- **`--signal` (oxide red-orange) marks expiry state and nothing else** — never a
  CTA, never a heading. Actions use `--accent`. Urgency is carried by type and
  scale, not colour.
- **Schema:** add `AccountingService`, `BreadcrumbList`, `ProfilePage` +
  `Person` + `hasCredential`, `Article`. Do **not** add `FAQPage`, `HowTo`, or
  `Review`/`AggregateRating` — deprecated, ineligible, and in the last case
  prohibited by the conduct rules. **No fee in schema either:** a `priceRange`
  is a published fee just as much as one in the body copy.
- **It is 6 years, not 7.** The figure "7 years" is factually wrong for income
  tax. National Insurance runs a different, longer window; never conflate them.

## Verification

`npm run verify` runs [`scripts/verify-dist.mjs`](scripts/verify-dist.mjs)
against `dist/` — every assertion is a failure mode this site
specifically cares about:

- Every required file is present: `.nojekyll`, `CNAME`, `robots.txt`,
  `sitemap.xml`, the favicons, `og-image.png`, `site.webmanifest`, and the
  accessibility page **at its Hebrew slug** (with the ASCII original gone).
- JSON-LD is **parsed with `JSON.parse`**, not grepped. A `grep` for the script
  tag proves it exists, not that it is valid — and invalid JSON-LD is silently
  ignored by Google, which is exactly the failure worth catching.
- `<title>` and the meta description equal the schema `WebPage` values.
- The things that must be **absent**: no `streetAddress`, no fee in any of the
  shapes schema.org offers, no `FAQPage` / `HowTo` / `Review` /
  `AggregateRating`, no licence identifier while `LICENCE_NUMBER` is null.
- Shared schema nodes are byte-identical across pages.
- Image dimensions read out of the **PNG headers**, not inferred from filenames.
- The sitemap lists exactly the shipped routes; year-derived pages carry the
  build date, and the accessibility statement keeps its fixed review date.
- Primary content is in the static HTML, and the prose page ships no JS bundle.
- The compliance tripwires, across every emitted document.

## CI

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) runs on push to
`main`, on 1 January, and on demand:

```
checkout → npm ci → npm test → npm run build → npm run verify
        → shell tripwires → upload-pages-artifact → deploy-pages
```

Two layers, deliberately. `npm run verify` carries the substantive checks; the
shell step repeats the handful that must hold even if someone breaks or deletes
that script:

- the years ledger and all refund triggers are present in the **static** HTML
- the WhatsApp link is present
- no unsubstituted `{{TOKEN}}` survives
- `.nojekyll` and `CNAME` are in the output, and the Hebrew-slug page exists
- every emitted document labels the service `שירות נלווה`
- no prohibited term appears in any shipped document — `חינם` (use `ללא עלות`),
  `מומחה` (only `מתמחה` is permitted), or the wrong `7 שנים` figure

A build that fails any of these is not published.

## Custom domain

Served from `tax.hnz-cpa.com` via a DNS `CNAME`, **`public/CNAME`** in the repo
(Pages reads it on every deploy; if it goes missing the domain unbinds), and
HTTPS enforced by GitHub.

`public/.nojekyll` is equally load-bearing: without it Pages runs the output
through Jekyll, which ignores paths beginning with `_` and can mangle non-ASCII
ones — i.e. exactly our Hebrew slug.

`SITE_URL` in `src/content/site.js` is the single origin, and the build checks
it against `public/CNAME` on every run. A canonical naming a host we do not
serve tells Google the authoritative copy of the page lives somewhere that does
not contain this content.

> GitHub Pages cannot serve server-side 301s. Acceptable today because the
> subdomain is new and there is nothing to redirect. If the apex is ever pointed
> here, redirects become a real requirement and Cloudflare Pages should be
> reconsidered — it deploys from the same repo, so that is a migration, not a
> rewrite.

## Open questions

Tracked as `TODO(open-question-N)` in the source:

1. **Licence number** — pending. Highest-value trust element available and it
   costs nothing. Set `LICENCE_NUMBER`; the credential block and the JSON-LD
   both light up and are verified against each other.
2. **GA4 measurement ID** — pending. `null` is a working state: analytics
   no-ops and the consent bar never renders.
3. **The fee model** — displaying no fee removes the advertising exposure but
   not the `1א(14)` conduct question about contingent fees. Must be resolved
   before the first engagement letter.
4. **`priceRange: "₪₪"`** — `07-seo.md` calls it acceptable in schema;
   `02-constraints.md` puts any fee range on the RED list and declares itself
   the tie-breaker when they disagree. Currently emitted. Flagged for the
   `§11א` pre-ruling.

## Licence

`UNLICENSED` — private client work. Not for redistribution.

---

The site content is not legal or tax advice to the reader; the footer carries the
`אין באמור באתר זה ייעוץ מס אישי...` disclaimer on every page.
