# Agent work split — live coordination

**Purpose:** more than one agent is editing this repo concurrently. This file is
the lock. Read it before you write, and update it when you claim or release a
file. If a claim here conflicts with what you were about to do, stop and
re-scope rather than editing anyway.

---

## Claimed by: COMPLIANCE-COPY agent — **WORK COMPLETE**, scope released

Scope was **Hebrew user-facing copy and its compliance correctness only**.
Derived from a full evidence audit of the live deployment (commit `23d73d6`).

**These files are now released. No pending edits from me.**

### Files I edited

| File | What changed |
| --- | --- |
| `index.html` | `privacy-h` list, `honesty-h` H2, `why-h` lead paragraph, `final__sub`. Copy text only — no `{{TOKEN}}`, no `<head>` plumbing, no attributes |
| `src/content/copy.js` | `PROCESS[3]` name + detail |

Verified after the edits: **32/32 tests pass**, `npm run build` exit 0,
**0/10 RED categories violated**, no horizontal overflow at 414 or 1440.

### Fixed

| # | Finding | Fix |
| --- | --- | --- |
| 2 | `בדיקת הזכאות באתר רצה בדפדפן שלך` claimed an on-site eligibility check. **There is none** — 0 `<form>`, 0 `<input>`, no React in the bundle. The meta description also sold `בדיקת זכאות ללא עלות`, a phrase that appeared nowhere visible | Replaced with what is actually true: `באתר הזה אין טופס ואין מערכת שאוספת נתונים…`. Separately, `בדיקת הזכאות היא ללא עלות וללא התחייבות` now appears in the final CTA, so the meta description is backed by visible copy |
| 4 | H2 `מה שחברות החזרי מס לא מספרות לך` was self-praise by comparison to other firms — RED-listed in `AGENTS.md` | Now `מה שכדאי לדעת לפני שמגישים`. Every honesty fact retained: `1.4%` ×3, `98%`, `המעטפות הירוקות`, both gov.il links |
| 11 | Body copy addressed a man throughout while the WhatsApp message says `שכיר/ה` | Gender-neutral: `שתמשיך`→`שהשכר יישאר זהה`, `היית צריך`→`צריך היה`, `תעדיף`→`מעדיפים`, `אתה רואה`→`הדוח מוצג`, `שאישרת`→`אישור`, `ראית ואישרת`→`ראיתם ואישרתם` |
| 12 | The `אני לא אתקשר אליך` fraud-detection paragraph from `docs/spec/02` GREEN was absent | Added to the privacy list as `אני לא מתקשרת ביוזמתי…`, phrased gender-neutral and dash-free per the `23d73d6` convention |

### Retracted — I was wrong, do not "fix" these

Three of my original findings were errors. I had checked them against the
numbers table in `02-constraints.md` without checking `04-copy-deck.md`.
Recording them so nobody re-opens them:

| Was | Reality |
| --- | --- |
| "`ההחזר משולם עד שנה מהשומה` and `כשלושה חודשים` are unsourced" | **Verbatim from `04-copy-deck.md:112-113`.** Approved copy |
| "`35%`/`סעיף 46`, `45א`/`47`, `2,904 ₪`, `106` are unsourced" | **All verbatim from `04-copy-deck.md:92-94,106`.** Approved copy |
| "`2013-2019` should use an en dash" | Commit `23d73d6` **deliberately** changed `–` to `-` and removed every dash from user-facing copy. I reverted my own change. The only dashes left in the repo are inside code comments |

---

## NOT mine — infrastructure / metadata agent

I audited these as defects but found you already working on them. **They are
yours, I have not touched them.** Listed so you can confirm nothing is missed:

| # | Finding | Status as of my last build |
| --- | --- | --- |
| 1 | **CRITICAL.** Live canonical was `https://hnz-cpa.com/` — a different host that 301s to a live Wix page. Self-declared duplicate; de-indexes this site. That Wix page *also* still publishes `וגובים את שכר הטרחה כאחוז מגובה החזר המס`, the exact fee-basis violation `docs/spec/08` says to delete | ✅ **fixed in your working tree** — now emits `https://tax.hnz-cpa.com/` |
| 5 | Zero `application/ld+json` on the live page | ✅ **fixed** — build emits 1 |
| 6 | `robots.txt` advertised `sitemap.xml`, which `404`d | ✅ **fixed** — build emits `dist/sitemap.xml` |
| 3 | No accessibility statement (legally required, `ת"י 5568`) | ✅ **built** — `dist/accessibility.html` |
| 7 | `og-image.png`, `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `site.webmanifest` all served `200` but nothing in `<head>` referenced them | 🔧 `{{HEAD_ASSETS}}` — please confirm `og:image`, `og:url`, `og:site_name`, `rel=icon`, `rel=manifest` all emit |
| 8 | Hardcoded contact details in `index.html` (`tel:+972555582369` ×3, `055-5582369` ×2, `hila@hnz-cpa.com`, `2018` ×3) against the `AGENTS.md` hard rule; constants already exist in `site.js` | 🔧 still present last I looked |

### Still unclaimed — nobody owns these

- **#3b author byline.** `AGENTS.md` requires a named byline linking to
  `/אודות` on every page. `index.html` has none and `/אודות` does not exist.
  Needs the route first, so it belongs to whoever owns `routes.js`.
- **#10 tap targets under 44px at 414px.** gov.il links `373×26`, footer phone
  `100×18`, footer email `129×18`. Lives in `src/styles/home.css`, which the
  infrastructure agent is also editing, so I stayed out.

---

## Verified-good, do not "fix" these

A full audit confirmed these are correct. If you are tempted to change one,
read `docs/spec/02-constraints.md` first.

- **Year math is correct.** Independently recomputed in Python, not read back
  from `refundWindow.js`: 2020→75 days, 2021→440, 2022→806, 2023→1171,
  2024→1536, 2025→1901; bars 4/23/42/62/81/100%. `lastClosedYear` 2019.
- **RED-list sweep is clean** on all 10 prohibited categories.
  Note: `הבטחה לקבלת` matches only inside the disclaimer's own *negation*
  (`ואין בו הבטחה לקבלת החזר`) — do not "fix" that.
- **RTL is sound.** 37 `<bdi>`, 0 visually reorder. 13 bare digit runs were
  A/B-rendered against `<bdi>`-wrapped twins and came back pixel-identical, so
  they are a letter-of-the-rule gap with **no visual defect**. Low priority.
- **0 physical `left`/`right`** CSS properties. `--signal` correctly confined
  to the counter border and the expiring ledger row.
- All three gov.il links return `200` in a real browser. curl gets `403`
  because of Cloudflare bot-blocking — the links are **not** broken.
