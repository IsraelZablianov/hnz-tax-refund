# AGENTS.md — working rules for this repo

A Hebrew (RTL) lead-generation site for **הילה נח זבליאנוב**, a licensed Israeli
CPA, selling one service: `החזרי מס לשכירים` (income-tax refunds for salaried
employees).

**The full spec is `docs/spec/`. It is the source of truth.** Read
`docs/spec/02-constraints.md` before writing any user-facing copy.

---

## ⚠️ READ THIS FIRST — the copy constraints are legal, not stylistic

Israeli CPA conduct regulations (`תקנות רואי חשבון (התנהגות שאינה הולמת את כבוד
המקצוע), תשכ"ה-1965`, as amended 2025) bind every word on this site. `תקנה 2(ג)`
is a **closed list** — content must fit an enumerated permitted item, or it is
outside the permission entirely.

Breach is a **disciplinary offence** that can reach her licence. Do not add copy
without checking it against this list.

### NEVER ships

| Prohibited | Why |
| --- | --- |
| Any fee, percentage, price, range, discount, "starting from" | `2(ג)(14)` — no `ציון שכר טרחה` |
| `לא קיבלת החזר — לא שילמת` or any variant | States the fee basis; advertises the arrangement `1א(14)` forbids |
| The literal word `חינם` | On the ethics committee's prohibited list verbatim. **Use `ללא עלות`** |
| `מומחה`, `מוביל`, any superlative | Self-praise. **Only `מתמחה` is permitted** |
| Testimonials, client names, quoted reviews — **even anonymised** | Ethics decision 14.13.5 |
| Client results — `החזרתי ללקוח X ₪`, averages, client counts, success rates | `כלל 17(ג)(7)` |
| Comparison tables, "unlike other companies" | Self-praise by comparison |
| Any promised or estimated shekel amount for the visitor | Misleading; also consumer law |
| Pop-ups, exit-intent modals | `2(ב)(4)` |
| Dramatised countdowns — `אל תפספסו! נותרו X ימים!` | Reads as harassment/solicitation |
| The figure **7 years** | **Factually wrong.** It is 6 years for income tax |

### Required on every page

- The service must be labelled **`שירות נלווה`**, visually distinguished from
  `ראיית חשבון`. Mandatory under `2(ג)(4)`.
- A named author byline linking to `/אודות`.
- The footer disclaimer: `אין באמור באתר זה ייעוץ מס אישי...`

The shared footer and the `<head>` block are generated in `vite.config.js`
(`pageFooter()`, `headAssets()`) precisely so these cannot be forgotten on a new
page. Use them; do not hand-write a footer.

**CI enforces this.** `.github/workflows/deploy.yml` greps every emitted HTML
document for the prohibited strings and for the mandatory `שירות נלווה` label,
and `scripts/verify-dist.mjs` asserts the disclaimer and the byline. The
tripwires catch the known phrasings, not new ones — they are a net, not a licence
to stop reading `02`.

### What we convert on instead

The deadline as a neutral statement of law; her licence number plus a link to the
public register; her own process stated factually; that she never initiates
contact; State Comptroller figures instead of her own; and honest disclosure of
the ~1.4% debt risk. See `docs/spec/02-constraints.md` for the exact wording.

---

## Hard code rules

### No hardcoded years, dates or day counts — ever

Everything year-dependent comes from `src/lib/refundWindow.js`. It is the factual
spine of the site and it is covered by tests in `refundWindow.test.js`.

```js
import { refundWindow } from './lib/refundWindow.js';
const { expiringYear, openYears, deadline, daysLeft, ledger } = refundWindow();
```

Writing `2020` or `76` as a literal in a template is a bug: it will be wrong
tomorrow, and on 1 January it will be a false statement about someone's legal
rights. The module rolls over by itself.

### No hardcoded contact details

All of it lives in `src/content/site.js` — name, phone, email, licence number,
service areas, the origin, government links. NAP consistency is a local-search
signal and the licence number appears in both visible text and JSON-LD; they must
never diverge.

`LICENCE_NUMBER` is currently `null`. **Do not invent one and do not emit a
placeholder** — neither the visible credential block nor the JSON-LD renders it
until the constant is set, because structured data must match visible content.
`npm run verify` fails if an identifier appears while the constant is null.

`SITE_URL` is the single origin, and no absolute URL is written by hand: use
`absoluteUrl()` from `src/lib/urls.js`. Canonicals, the sitemap, `og:url` and
every JSON-LD `@id` derive from it, and the build checks it against
`public/CNAME`. A canonical naming a host we do not serve de-indexes the site.

### RTL

- `<html lang="he" dir="rtl">` on every document.
- **Logical properties only** — `margin-inline-start`, `padding-inline-end`,
  `inset-inline-start`. Never `left` / `right`.
- **Wrap every Latin or numeric run in `<bdi>`.** The phone number, dates like
  `31.12.2026`, `1.4%`, `HNZ`. A phone rendering as `0369-5555-55` is the classic
  failure, and bracketed placeholders mirror unless isolated.
- `src/lib/hebrew.js` has the plural-agreement helpers. Hebrew has a real dual
  form: `1 → יום אחד`, `2 → יומיים`, `3+ → N ימים`. `2 ימים` is wrong.

### Design

Tokens in `src/styles/tokens.css`. The one rule that matters:

**`--signal` (oxide red-orange) marks expiry state and nothing else.** Never a
CTA, never a heading, never a background field. Actions use `--accent` (olive).
Urgency is carried by type, scale and proportion — not colour.

### Schema — what NOT to implement

Do **not** add `FAQPage` (Google removed the rich result in May 2026), `HowTo`
(deprecated 2023), or `Review`/`AggregateRating` (categorically ineligible for
`LocalBusiness` subtypes, *and* prohibited by the conduct rules). No fee of any
kind in schema either — a `priceSpecification` is a published fee just as much as
one in the body copy.

Do add: `AccountingService`, `BreadcrumbList`, `ProfilePage` + `Person` +
`hasCredential`, `Article` on guides. Details in `docs/spec/07-seo.md`.

The graph is built in `src/lib/schema.js`, at build time, from
`src/content/site.js`. Every omission is justified in that file's header, and
`npm run verify` asserts each one stays omitted.

**`streetAddress` is deliberately absent.** Service-area business, hidden
address; schema must match what her Google Business Profile shows. This fails
Google's Rich Results Test, which requires `address`. That is the accepted
trade-off — **do not fabricate an address to make the test pass.** The verifier
fails the build if one appears.

`<title>`, the meta description and the schema `WebPage` node are generated from
one string in `vite.config.js`, and the verifier compares them byte for byte.
Structured data that contradicts the page it describes is worse than none.

### Adding a page

Two places, and the build fails with a pointed message if you miss either:

1. `ROUTES` in `src/content/routes.js` — path, ASCII source filename,
   `shipped: true`, sitemap priority and `lastmod` policy.
2. `metaByPage` in `vite.config.js` — title, description, breadcrumb trail.

`rollupOptions.input`, the Hebrew-slug rename and `sitemap.xml` are all derived
from `ROUTES`, so there is no third list to forget.

### Images

`public/favicon.svg` and `public/og-image.html` are the sources; the PNGs are
generated by `npm run images` (needs a browser) and committed. Edit the source,
re-render, commit. Never edit a PNG directly.

The OG card must state **only evergreen facts** — it is a cached raster that
cannot be regenerated per-year, so a tax year baked into it would go false on
1 January and nobody would notice, because platforms cache link previews hard.
A build-time tripwire enforces this.

---

## Commands

```bash
npm run dev        # dev server; rewrites Hebrew slugs like production
npm run build      # production build; injects year data, schema and head
npm run verify     # assert dist/ is shippable — run after every build
npm run preview    # serve the build locally
npm test           # vitest — year math and Hebrew helpers
npm run images     # regenerate the favicons and OG card (needs a browser)
```

## Architecture in one paragraph

Vite MPA. One real HTML document per route, no SPA shell. Year-dependent content,
the JSON-LD, the whole `<head>` block and the shared footer are all injected at
**build time** by `transformIndexHtml` plugins calling `refundWindow()`, then
**corrected client-side** if the build is stale, with a scheduled 1 January
rebuild so the two never drift. `sitemap.xml` is generated into `dist/`, never
committed, so `lastmod` cannot go stale. React is reserved for two islands: the
eligibility quiz and the day counter. Everything else is static HTML, because the
content must be extractable by crawlers and AI assistants without JS — and
`scripts/verify-dist.mjs` asserts that it still is.

Hebrew slugs are declared in `src/content/routes.js`; **source filenames stay
ASCII** to avoid Hebrew-filename problems on CI. Verified working on GitHub
Pages — see the Gate 0 result in `docs/spec/08-plan.md`. The dev server rewrites
the same slugs, so a Hebrew URL is never dead locally while working in
production.

`public/.nojekyll` and `public/CNAME` are load-bearing: without the first, Pages
runs the output through Jekyll and can mangle the Hebrew slug; without the second
the custom domain unbinds. Both are asserted present in CI, and `SITE_URL` is
checked against `CNAME` on every build.

## UTM convention

`utm_source` / `utm_medium` / `utm_campaign`. Keep it consistent or the
attribution is worthless.
