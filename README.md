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
| Pages deploy + compliance tripwires | Shipped |
| Eligibility quiz, `/אודות`, guides, city page, remaining routes | Planned — see [`docs/spec/08-plan.md`](docs/spec/08-plan.md) |
| Licence number, extra photography, exact subdomain | Open questions blocking specific pages (`08-plan.md`) |

## Quick start

Node 22 (what CI uses).

```bash
npm install
npm run dev      # dev server
npm run build    # production build — injects year data at build time
npm run preview  # serve the build locally
npm test         # vitest — year math and Hebrew plural agreement
npm run test:watch
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

## Layout

```
index.html              homepage template, {{TOKENS}} filled at build time
vite.config.js          the injection plugin + build-time guards
src/
  home.js               runtime: stale-build correction, scroll reveal
  lib/refundWindow.js   §160 year math — single source of truth
  lib/hebrew.js         Hebrew plural agreement, month/year formatting
  lib/*.test.js         vitest coverage for both
  content/site.js       canonical business facts: name, phone, licence, areas, gov links
  content/copy.js       Hebrew copy blocks (triggers, process, WhatsApp message)
  styles/tokens.css     design tokens
  styles/{base,home}.css
public/                 CNAME, self-hosted Rubik subsets (Hebrew + Latin)
docs/spec/              the spec — intent, constraints, architecture, copy deck,
                        funnel, design, SEO, build plan
```

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
  prohibited by the conduct rules.
- **It is 6 years, not 7.** The figure "7 years" is factually wrong for income
  tax. National Insurance runs a different, longer window; never conflate them.

## CI

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) runs on push to
`main`, on 1 January, and on demand. It tests, builds, then refuses to deploy
unless the output passes a set of tripwires:

- the years ledger and all refund triggers are present in the **static** HTML
- the WhatsApp link is present
- no unsubstituted `{{TOKEN}}` survives
- no prohibited term appears in the shipped page — `חינם` (use `ללא עלות`),
  `מומחה` (only `מתמחה` is permitted), or the wrong `7 שנים` figure

A build that fails any of these is not published.

## Licence

`UNLICENSED` — private client work. Not for redistribution.

---

The site content is not legal or tax advice to the reader; the footer carries the
`אין באמור באתר זה ייעוץ מס אישי...` disclaimer on every page.
