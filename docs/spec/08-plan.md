# 08 — Build Plan

## Build order

Dependency-ordered. Each phase ends in a gate that must pass before the next.

### Phase 0 — verification (before any UI)

1. **Scaffold** Vite + React + router with Hebrew slugs from route config, ASCII
   filenames.
2. **Write `refundWindow()` and test it first.** This module is the factual spine
   of the site; everything year-dependent derives from it. Frozen-date tests:
   - mid-year → 2020 expiring, 2020–2025 open
   - `31.12.2026` → `daysLeft === 0`, `isLastDay`
   - `01.01.2027` → expiring rolls to 2021, ledger 2021–2026, `daysLeft === 364`
   - `25.11.2026` → `pastPracticalCutoff` true
   - a non-Israel timezone → same answer as Asia/Jerusalem
3. **Throwaway GitHub Pages deploy** with one Hebrew-slug route.

**Gate 0:** Hebrew percent-encoded paths resolve on real GitHub Pages, and
`refundWindow()` passes every frozen-date test. **If Hebrew paths fail, switch to
Latin slugs and update `03` before continuing** — this is the one architectural
assumption that could still break.

### Gate 0 result — PASSED, 16 Oct 2026

**`refundWindow()` + `hebrew.js`: 32 tests passing.** Including both timezone
traps (a 23:30 UTC instant that is already tomorrow in Israel; a 22:00 UTC
31 December that is already next year in Israel), the 1 January rollover, leap
years, and the Hebrew dual-form plural.

**Hebrew slugs on GitHub Pages: verified by real deploy**, not inference. A
throwaway repo with Hebrew directory names was pushed and served:

| Test | Result |
| --- | --- |
| Percent-encoded, top level | **200**, correct content |
| Percent-encoded, nested two levels | **200**, correct content |
| Raw UTF-8 in the URL — what a user pastes from WhatsApp | **200**, correct content |
| No trailing slash | **301** → correctly redirected, decoded |
| Content-Type | `text/html; charset=utf-8` |

Notably GitHub Pages *does* issue a 301 for the missing trailing slash, and
normalises raw UTF-8 and percent-encoded forms to the same resource. **Hebrew
slugs are confirmed safe on this host. `03` stands as written.**

Two incidental findings worth keeping:

- `.nojekyll` is required, or Jekyll processing interferes.
- The default branch must be `main` before `gh repo create --push`, or Pages
  cannot be pointed at it.

### Phase 1 — content layer

4. `src/content/site.js` — NAP, licence, all contact constants in one place.
5. `src/content/copy.js` — every string from `04`, verbatim.
6. `src/content/quiz.js`, `triggers.js`.
7. `AGENTS.md` with the RED list inline, plus `.cursor/rules/`.

**Gate 1:** no Hebrew string and no contact detail exists anywhere outside
`src/content/`.

### Phase 2 — homepage

8. Tokens, base CSS, logical properties only.
9. Mobile 414px first: header → hero → ledger → triggers → process → honesty →
   details → about → final CTA → sticky bar.
10. **`YearsLedger` gets disproportionate effort.** It is the centrepiece.
11. Expand to 1440px.

**Gate 2:** screenshot at 414 and 1440 via Playwright over CDP, read the
screenshots, iterate at least twice. Zero horizontal overflow. No clipped or
bidi-mangled Hebrew. Hero legible on a 900px-tall laptop without scrolling.

### Phase 3 — funnel

12. `EligibilityQuiz` — 5 questions + disqualifier + 3 result variants.
13. WhatsApp deep links with answer serialisation.
14. Form → Apps Script, with honeypot and rate limit.
15. Consent-gated GA4.

**Gate 3:** quiz completable by keyboard alone; `aria-live` announces steps and
result; every path reaches a WhatsApp handoff; **no `ת.ז.` field exists anywhere
in the codebase.**

### Phase 4 — remaining pages

16. `/אודות` with `ProfilePage` schema and the credential block.
17. `/בדיקת-זכאות-להחזר-מס` as a standalone indexable page.
18. First guide + `/מדריכים/` hub.
19. `/שירותים`, `/צור-קשר`, `/נגישות`.
20. Holon page — **only if it passes the gate in `07`.**

### Phase 5 — launch

21. Schema, metadata, OG image, sitemap, robots.
22. Perf pass: AVIF portrait, self-hosted font subset, preload LCP.
23. Lighthouse ≥ 95 mobile on performance and accessibility.
24. **Full compliance audit against the RED list** — line by line, every page.
25. `break-ui` pass: long names, missing fields, extreme values, non-Latin text.

**Gate 5 — launch checklist:**
- [ ] Zero RED-list violations on any page
- [ ] Every number on the site traceable to `02`
- [ ] `שירות נלווה` label present
- [ ] No fee, percentage, testimonial, client result, or `חינם` anywhere
- [ ] `7 שנים` appears nowhere
- [ ] Accessibility statement live
- [ ] Disclaimer in the footer
- [ ] GBP verified, service-area, address hidden
- [ ] WhatsApp Business away message configured
- [ ] Search Console domain property verified **before** any DNS change
- [ ] Scheduled 1 January rebuild action committed

## Parallelisation

Phases 0–2 are sequential and depend on decisions in this spec. From Phase 4
onward the work fans out cleanly, and the user asked for parallel agents:

| Agent | Scope |
| --- | --- |
| Guides author | The three day-31–60 articles, from `04` + `07` conventions. Must repurpose her Instagram explainers |
| Schema & metadata | All JSON-LD, meta, sitemap, OG image |
| Holon page | Research the real `פקיד שומה` assignment and employment profile, then write — or report that it cannot pass the gate |
| GBP + citations | A step-by-step runbook for Hila, including the verification-video script |
| Compliance auditor | Independent review of every page against `02`. **Must be a different agent from whoever wrote the copy** |

Each gets `02` and `04` verbatim. The compliance auditor's independence matters —
the agent that wrote a sentence is the worst judge of whether it is compliant.

## Open questions — blocking the pages noted

| # | Question | Blocks |
| --- | --- | --- |
| 1 | **2–3 more photographs** | Nothing blocks, but the design is weaker without them. All three comps independently flagged the single studio frame as a limitation. With testimonials prohibited by `02` **and the licence number withheld**, imagery now carries more load than one waist-up shot can. Wanted: a working shot, a second portrait at a different crop, and ideally a short talking-to-camera video — all explicitly permitted by `2(ד)`, and she already makes this content well on Instagram |
| 2 | Is she an ICPAS member? | Whether `2(ג)(12)` applies — and see the `02` flag on whether membership is net-negative here |
| 3 | Real business hours for callbacks | The response-time promise must be one she can keep |
| 4 | Comfortable with the honesty block and the gov.il links? | The honesty section. **Verify explicitly — it is counter-intuitive and she may react badly without the reasoning** |
| 5 | Existing company or second `עוסק מורשה`? | Nothing on the site; informs the fee-model question |
| 6 | Keep `card.hnz-cpa.com` indexed? | Recommend `noindex` or redirect — it currently competes for brand queries with near-empty content |
| 7 | **Fee model: flat or percentage?** | Nothing on the site. Must be resolved before her first engagement letter |

### Settled, no longer open

| Decision | Outcome |
| --- | --- |
| **Subdomain** | **`tax.hnz-cpa.com`** — DNS live, HTTPS enforced, Pages deploying from `main` |
| **Licence number** | **Not published.** Owner's decision, 17 Oct 2026. Code degrades gracefully: the credentials line is omitted and the `Person` schema omits `identifier`. The visible register link was also removed at her request. Recorded in `src/content/site.js` as a decision so no future agent re-opens it |

## Immediate actions for Hila — independent of the build

1. **Fix the Wix page today.** It publishes `גובים את שכר הטרחה כאחוז מגובה החזר
   המס` — a fee basis, live, treated as newly published under the amendment's
   transitional rule. One-line deletion.
2. **Fix the broken email link.** The Wix contact row points at
   `hila@hzn-cpa.com` — `hzn`, not `hnz`. Leads have been silently bouncing.
3. **WhatsApp Business + away message.** Free, 20 minutes, and by the
   speed-to-lead evidence it will outperform every design decision in this spec.
4. **File the §11א request.** Free, anonymous, statutory safe harbour. Three
   questions in `02`. Phone 08-6831666 and ask for the legal adviser.
5. **Retrieve two documents** that were Cloudflare-blocked during research:
   `gov.il/he/pages/procedure_for_handling_requests_to_receive_opinions` (cost and
   timeline for the §11א request) and the ועדת המשמעת decisions index.

## Known environment issue

The shell in this session stopped returning exit codes partway through. It does
not affect the spec, but Phase 0 onward needs working `npm`, `git` and Playwright
over CDP on `:9090` (which was verified working earlier). **Restart the terminal
before starting the build.**

## What I would reconsider first

Flagging my own weakest calls, so they get scrutiny rather than inheritance:

1. **`בדיקת זכאות ללא עלות`** — the user requested it, the base rate supports it,
   and the "screening is not a consultation" reading is defensible. It is still
   amber, and it is the first thing to change if the pre-ruling comes back
   unhelpful.
2. **GitHub Pages.** Correct given subdomain-first. The moment the root domain is
   involved, revisit.
3. **One city page.** Possibly zero is right, if Holon cannot pass the gate
   honestly. A thin city page is worse than none.
4. **No pricing page.** Compliance removes what the SEO research identified as the
   highest-intent page on the site. There is no way around it, but it is a real
   cost and worth naming.
5. **The counter.** Permitted and effective, but it is the element most likely to
   drift toward the register we are avoiding. If in doubt, drop it — the date
   alone carries the argument.
