# 03 — Architecture

## Stack **[LOCKED]**

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | **Vite 8 (current)** | **Deviation from "Vite 5 to match the card": shipping a new YMYL site on a three-major-versions-stale toolchain is the wrong trade. Her card repo can be upgraded separately.** |
| Architecture | **MPA — one HTML document per route** | **Deviation from "React Router". See below** |
| Language | JavaScript / JSX | No TypeScript, consistent with the card repo |
| Styling | Plain CSS + custom properties | No framework; the card proves this is enough |
| Interactivity | React islands only — quiz, counter | The rest of the site is static documents |
| Font | Rubik, self-hosted Hebrew+Latin subset | Removes two third-party connections from the LCP path |
| Host | GitHub Pages + Actions | User's choice. Hebrew slugs verified — see `08` Gate 0 |
| Leads | WhatsApp deep link + Google Apps Script → Sheet | Same mechanism as the card |
| Analytics | GA4, consent-gated | See `05` |

### Why MPA, not React Router **[revised during Phase 0]**

The spec originally called for React Router. That is the wrong tool here:

1. This is a **content site with two interactive islands** (the quiz and the day
   counter), not an application.
2. **The years ledger must exist in the served HTML.** It is the page's central
   factual claim and precisely what we want extracted into snippets and AI
   answers — so it cannot be client-rendered.
3. An MPA gives a real static document per URL with **zero prerender toolchain**,
   which is strictly better for a YMYL site than hydrating a shell.

### How year-dependent content stays correct

Belt and braces, because a wrong date here is a wrong statement about someone's
legal rights:

- **Build-time injection** — a Vite `transformIndexHtml` plugin calls
  `refundWindow()` and writes real values and the full ledger table into the HTML.
  Correct for crawlers and for no-JS visitors.
- **Client-side correction** — a small script re-checks the date on load and
  corrects the counter and ledger if the build is stale.
- **Scheduled 1 January rebuild** — so the two can never drift far apart.

## Hosting note **[FLAG]**

GitHub Pages cannot serve server-side 301s. This is acceptable **because** the
user chose subdomain-first: there is nothing to redirect, since the Wix site has
exactly one indexed URL. If the root domain is pointed here later, redirects
become a real requirement and Cloudflare Pages should be reconsidered then —
it deploys from the same repo, so this is a migration, not a rewrite.

**Before committing to Hebrew slugs, verify GitHub Pages serves percent-encoded
paths correctly with a throwaway deploy.** Local testing confirmed both decoded
and percent-encoded paths resolve, but that was `python -m http.server`, not
Pages. This is a launch-blocking verification.

## Pages at launch

| # | URL | Purpose |
| --- | --- | --- |
| 1 | `/` | The money page. Everything in `04` and `06` describes this page |
| 2 | `/בדיקת-זכאות-להחזר-מס` | The eligibility quiz as a standalone indexable page |
| 3 | `/אודות` | E-E-A-T keystone: licence number, register link, degree, photo, video |
| 4 | `/רואה-חשבון-החזרי-מס-חולון` | The one city page. Ships only if it passes the checklist in `07` |
| 5 | `/מדריכים/כמה-שנים-אחורה-אפשר-לקבל-החזר-מס` | First article; carries the deadline |
| 6 | `/מדריכים/` | Guides hub — a real browseable index, not an island |
| 7 | `/שירותים` | Thin page for her other services |
| 8 | `/צור-קשר` | Contact, hours, service areas |
| 9 | `/נגישות` | Accessibility statement — legally required |

Plus `sitemap.xml`, `robots.txt`, a 404 page, and `og-image.png`.

**Deliberately not at launch:** a pricing page (there is no price to publish — this
removes what the SEO research called the highest-intent page, and that is the
cost of compliance); more city pages; any self-employed service pages.

## Slug handling **[LOCKED]**

Hebrew slugs, with these rules:

- **Source filenames stay ASCII.** `guides/lookback-window.jsx` declares
  `slug: 'מדריכים/כמה-שנים-אחורה-אפשר-לקבל-החזר-מס'` in route config. This
  eliminates the Hebrew-filename-on-CI failure class entirely.
- Hyphens between words. Never spaces or `+`.
- **No nikud, ever.**
- Canonicals use the **percent-encoded** form, consistently, everywhere. Mixed
  encoded/decoded canonicals create accidental duplicates.
- One host. Decide `www` vs apex once and never deviate.
- `רו״ח` with the proper gershayim `U+05F4`, one form site-wide. The current Wix
  meta description leaks `&quot;` entities — do not repeat that.

## The year-math module — single source of truth **[LOCKED]**

Every year-dependent string on the site derives from one function. No hardcoded
years, no hardcoded day counts, anywhere.

```js
// src/lib/refundWindow.js
// §160: in year Y the claimable tax years are Y-6 … Y-1,
// and Y-6 expires on 31 December of Y.

export function refundWindow(now = new Date()) {
  // The deadline is Israeli. The visitor's clock may be anywhere.
  const [y, m, d] = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jerusalem',
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now).split('-').map(Number);

  // Pure calendar arithmetic — no DST or offset can corrupt it.
  const daysLeft = Math.round(
    (Date.UTC(y, 11, 31) - Date.UTC(y, m - 1, d)) / 86_400_000
  );

  return {
    currentYear: y,
    expiringYear: y - 6,                                       // 2026 → 2020
    openYears: Array.from({ length: 6 }, (_, i) => y - 6 + i), // 2020…2025
    lastClosedYear: y - 7,                                     // 2019
    deadline: `31.12.${y}`,
    daysLeft,                                                  // ≥ 0 always
    isLastDay: daysLeft === 0,
    pastPracticalCutoff: daysLeft < 35,
  };
}
```

**Rollover:** on 1 January 2027 `expiringYear` becomes 2021, the ledger becomes
2021–2026, `lastClosedYear` becomes 2020, and `daysLeft` resets to 364. No annual
maintenance. `daysLeft` can never be negative, since 31 December is always ≥ today
within the same year.

**`pastPracticalCutoff` exists for a legal reason.** The statutory trigger is that
the return is *filed*; reconstructing a 2020 `טופס 106` from a possibly-defunct
employer takes weeks. Advertising "2020 is still open" on 28 December, when she
cannot realistically file it, risks being misleading under `חוק הגנת הצרכן §2(א)`.
Past the cutoff the messaging stops leading on the expiring year and pivots to the
remaining five.

**Hebrew plural agreement** needs a helper: `1 → עוד יום אחד`,
`2 → עוד יומיים`, `3+ → עוד N יום`.

### Where the counter may and may not appear

- **H1: the date, never the count.** `שנת המס 2020 נסגרת ב-31 בדצמבר 2026` is
  stable all year, factually unimpeachable, and cannot go stale in a search
  result. A build-time day count would be wrong the next morning.
- **The counter is a separate, client-side element**, rendered after hydration.
- Add a **scheduled GitHub Action rebuild on 1 January** so nothing build-time
  can drift even by accident.

## Repo layout

```
src/
  lib/
    refundWindow.js        ← the module above; the most test-worthy file here
    hebrew.js              ← plural agreement, number formatting
    whatsapp.js            ← deep-link construction, message serialisation
    analytics.js           ← consent-gated GA4 wrapper
  content/
    site.js                ← NAP, licence number, all contact constants
    copy.js                ← every Hebrew string, from 04-copy-deck.md
    quiz.js                ← questions, options, scoring, result variants
    triggers.js            ← the refund-cause list
  components/
    YearsLedger.jsx        ← the centrepiece; see 06
    DayCounter.jsx
    EligibilityQuiz.jsx
    StickyBar.jsx
    HonestyBlock.jsx
    CredentialBlock.jsx
  routes/
    routes.js              ← ASCII filenames → Hebrew slugs
  styles/
    tokens.css
    base.css
public/
  robots.txt  sitemap.xml  og-image.png  CNAME
docs/
  spec/                    ← this spec
AGENTS.md                  ← see below
```

## Agent-friendliness

The user asked for this explicitly. `AGENTS.md` at the repo root must carry:

- A pointer to `docs/spec/` as the source of truth.
- **The RED list from `02`, inline**, with: *do not add copy to this site without
  checking it. The constraint is legal, not stylistic.*
- The rule that all contact details live in `src/content/site.js` and are never
  hardcoded elsewhere.
- The rule that **no year or day count is ever hardcoded** — always
  `refundWindow()`.
- RTL conventions: logical properties only; `<bdi>` or `dir="ltr"` around Latin
  and numeric runs.
- The schema decisions from `07`, including what **not** to implement.

Also ship `.cursor/rules/` mirroring the card repo's conventions. A `CLAUDE.md`
symlinked to `AGENTS.md` costs nothing and covers other tooling.

## Performance budget

- LCP < 2.0s on 4G mobile. The portrait is the LCP element: preload it, serve
  AVIF with a JPEG fallback, explicit `width`/`height` to reserve layout.
- Self-host the Rubik subset; `font-display: swap`; subset to Hebrew + Latin
  digits. This drops two third-party connections the card currently makes.
- No JS required for first paint. The quiz and counter hydrate progressively.
- Total JS < 100KB gzipped.
- The contact-page map is a static image that swaps to an iframe on click, so it
  never touches LCP.
