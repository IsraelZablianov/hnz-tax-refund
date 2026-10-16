# 07 — SEO & Discoverability

## The honest framing

The head terms — `החזר מס`, `החזרי מס` — are owned by gov.il plus well-funded
brands with large marketing budgets. **We will not rank for them. Do not measure
success against them.**

The realistic wins are:

1. **Google Business Profile + local intent** — likely her first leads, and
   probably more qualified traffic in months 1–6 than organic search.
2. **Situation long-tail** — `החזר מס חייל משוחרר`, `החזר מס לאחר לידה`,
   `כמה שנים אחורה`. Low competition, covered shallowly by incumbents.
3. **The feminine `רואת חשבון`** — a genuinely distinct query from
   `רואה חשבון` with materially less competition. She already uses it on
   Instagram. Use it in at least one title and H1.

**Note:** search-volume estimates in the underlying research were explicitly
flagged as order-of-magnitude priors, not Keyword Planner pulls. The *ranking* of
clusters is reliable; the absolute numbers are not. Validate in Keyword Planner
before committing article budget.

## Technical baseline

- `<html lang="he" dir="rtl">` — fixes the live Wix bug (`lang="en"` on a Hebrew
  page). Note `lang` is not a ranking signal; it is for accessibility, screen
  readers and correct font selection. Set it correctly regardless.
- **No `hreflang`.** One language, one country, no alternates. It is not a
  geotargeting ranking signal.
- No country-targeting setting exists any more — removed from Search Console in
  2022. `.com` + Hebrew + Israeli links + Israeli GBP is how geotargeting works now.
- Canonicals percent-encoded, consistent, one host.
- Titles: front-load the topic, brand last. Google rewrites most titles by
  trimming the trailing segment, so `החזרי מס לשכירים — ... | רו״ח הילה נח זבליאנוב`
  survives; the reverse does not. Hebrew fits ~5–15% more characters per pixel
  than Latin, so English character counters mislead.
- `<title>` must align closely with `<h1>` — mismatch is a top trigger for Google
  substituting your title.
- **No nikud** anywhere — body, titles, slugs, schema.
- Search Console: verify as a **Domain property** so the subdomain and root roll
  up. Add `card.hnz-cpa.com` separately to watch for brand-query cannibalisation.
- Timezone `Asia/Jerusalem`; the Israeli week is Sun–Thu. **Publish Sunday or
  Monday morning, never Friday.**
- Bing Webmaster Tools: 20 minutes, mainly as an AI-visibility hedge.

## Schema **[LOCKED]**

What Google actually still renders, verified:

| Type | Ship? |
| --- | --- |
| `AccountingService` | ✅ Yes — most specific `LocalBusiness` subtype |
| `BreadcrumbList` | ✅ Yes — still rendered, replaces the URL line |
| `ProfilePage` + `Person` + `hasCredential` | ✅ Yes — on `/אודות` |
| `Article` | ✅ Yes — on guides |
| `FAQPage` | ❌ **No.** Google stopped showing FAQ rich results 7 May 2026 and deleted the docs 15 June 2026. Dead markup |
| `HowTo` | ❌ **No.** Deprecated Sept 2023 |
| `Review` / `AggregateRating` | ❌ **No.** Self-serving reviews are categorically ineligible for `LocalBusiness` subtypes — *and* prohibited by `02` anyway |
| `Service` with `priceSpecification` | ❌ **No price in schema.** There is no price to publish |

**Keep FAQ content as visible HTML** — question in an `<h3>`, direct answer in the
first sentence of the paragraph following. That is what feeds People Also Ask and
AI Overviews, which extract from *rendered text*, not markup. Accordions must keep
answer text in the DOM, not inject it on click.

### The business node

`["AccountingService", "ProfessionalService"]`, `@id` on the homepage, referenced
by `@id` from every other page rather than duplicated.

**Because the GBP is a service-area business with a hidden address, omit
`streetAddress`** — keep `addressLocality: "חולון"` + `addressCountry: "IL"` and
lean on `areaServed`. This will fail the Rich Results Test, since `address` is
required for the rich result. **That is the correct trade-off.** Do not fabricate
an address to pass a test; schema must match what GBP shows.

`areaServed`: חולון, בת ים, ראשון לציון, תל אביב-יפו, גוש דן.
`priceRange` is **not** emitted. `02-constraints.md` puts anything fee-shaped on
the RED list and declares itself the tie-breaker, and the cost/benefit settles
it independently: because we omit `streetAddress` for the service-area business,
the LocalBusiness rich result is ineligible, so `priceRange` renders nothing at
all. Zero upside against non-zero risk to a professional licence. No percentage.

### The person node

`ProfilePage` + `Person` on `/אודות`, with `hasCredential` carrying the licence,
`dateCreated: "2018"`, and `recognizedBy` pointing at מועצת רואי החשבון.

`hasCredential` produces no rich result. Its value is entity understanding and AI
citation. **Only include the licence number if it is also visible on the page** —
structured data must match visible content. It should be visible: it is her
strongest trust signal.

## Google Business Profile — the highest-ROI item here

**Service-area business, address hidden.** Confirmed by the user: home office. The
rules are explicit — a business without permanent exterior signage is not eligible
as a storefront and should hide its address. Showing a residential address without
signage risks suspension.

- **Primary category: `רואה חשבון`.** Higher-volume identity query, and it serves
  her existing self-employed base too. Don't optimise the profile purely for the
  refund funnel and orphan the core business.
- Secondary: `שירות הכנת דוחות מס` (most important — the refund match),
  `יועץ מס`, `משרד רואי חשבון`, `שירות הנהלת חשבונות`.
- **Name: `הילה נח זבליאנוב, רו״ח` only.** Never append keywords — the single
  most common cause of CPA profile suspension.
- **5–8 service areas, not 20.** חולון, בת ים, ראשון לציון, תל אביב-יפו, אזור,
  plus `גוש דן`. Over-broad areas dilute relevance for no gain.
- **Exactly one profile.** Never a second one for another city.
- Website link → the money page, not the homepage.
- Attributes: `בעלות על ידי אישה`, `שירות מרחוק`.
- ≥10 photos: portrait, workspace, licence certificate, logo.
- **Seed Q&A yourself** — owner-posted Q&A is permitted and you control the first
  answers: `כמה שנים אחורה?`, `צריך להגיע למשרד?`, `מה צריך להביא?`
- Posts 2–4/month; the highest-value one of the year is the `{deadline}` notice.
- Expect **video verification**: one unbroken daylight take — street sign →
  building number → workspace → a document showing the business name.

### Reviews — the conflict, resolved **[FLAG]**

The SEO research recommends an aggressive review-generation loop. **`02`
prohibits it:** soliciting reviews is prohibited, and displaying client
satisfaction on her own site is prohibited even unnamed.

**Resolution:** reviews may accumulate **organically** on GBP. She does not
solicit them. They are not quoted or embedded on the site. A bare link labelled
`הפרופיל שלנו בגוגל` is amber — permitted as a contact destination, with the
reasoning documented.

This is a real competitive cost, honestly accepted. It is also why the credential
block and the honesty block have to carry more weight than they would elsewhere.

## Citations — cap at ~12

Week 1: GBP, `easy.co.il`, B144, דפי זהב, Google Maps.
Month 1–2: `dinvecheshbon.co.il` (built on the official CPA register), LinkedIn,
Facebook business page.

**Link to the official gov.il CPA register from `/אודות`** so visitors can verify
her licence independently. Almost no competitor does this.

**Avoid** the long tail of 400+ Israeli directories. Mass submission has no
measurable upside and a real footprint risk for a YMYL site.

## The city page gate

Ships **only** if it satisfies all of these — otherwise it is a doorway page:

1. The city's actual `פקיד שומה` assignment, with the official gov.il link.
2. A true, ideally sourced, city-specific employment reason for over-withholding —
   Holon's industrial zone, shift work, overtime.
3. ≥3 city-specific FAQs.
4. A distinct, non-templated H1 and title.
5. An honest service-model statement: the office is in Holon, the process is remote.
6. Real two-way internal links.
7. Unique meta description.

Item 5 in the original checklist was "local proof — a review from a client in that
city." **That is prohibited by `02`.** Substitute: the `פקיד שומה` fact plus the
local employment profile. If Holon cannot pass without it, the page does not ship.

**Maximum 4 city pages, ever.** Google's spam policy names city-targeted
near-duplicate pages and "blocks of text that list cities" explicitly.

## E-E-A-T for Hebrew YMYL

Tax content is squarely "Your Money or Your Life".

1. **Named, credentialed author on every page** — `נכתב על ידי רו״ח הילה נח זבליאנוב`,
   linking to `/אודות`. Anonymous tax content is the top YMYL failure.
2. **Licence number visible**, plus the register link.
3. `רואת חשבון מוסמכת משנת 2018` — state the date, not "years of experience".
4. Degree and institution.
5. **A real photograph.** Personal-service trust in Israel is face-driven.
6. **Visible `עודכן לאחרונה`** plus `datePublished`/`dateModified`. Tax content
   without a date is untrustworthy; the numbers change every January.
7. **Cite primary sources inline, with links** — `סעיף 160`, `סעיף 46`,
   `סעיף 45א`, gov.il service pages. This is simultaneously the strongest driver
   of AI citation.
8. Honest disclaimer.
9. Full business identity in the footer.
10. **Honesty about the free alternative.** Counter-intuitive, and the single
    highest-trust move available.

## AI search

Verified: there are no special requirements. A page must be indexed and
snippet-eligible — that is the whole gate. `llms.txt` is explicitly ignored by
Google Search; skip it.

What actually helps, and overlaps entirely with E-E-A-T:

- **Prerendered semantic HTML.** Already a structural advantage over the Wix
  incumbents.
- **Answer-first paragraphs.** First sentence of each section is a complete,
  standalone answer: `החזר מס אפשר לבקש עד שש שנים אחורה. בשנת 2026 פתוחות השנים
  2020–2025.` Then elaborate. Good for readers first; the machine benefit follows.
- **Be quotable:** specific, dated, numeric, attributable. `סעיף 160 — שש שנים`
  and `רישיון רו״ח מס' X משנת 2018` are quotable. Adjectives are not.
- **Cite gov.il and name sections.**
- **First-party statistics are the strongest long-term asset** — but note `02`:
  her *own* results are prohibited. The compliant version is aggregate and
  non-promotional, e.g. the distribution of refund *causes* she encounters, never
  amounts or success rates. **[FLAG — needs the pre-ruling before publishing.]**

**Hebrew-specific opportunity, and the most under-priced thing in this spec:**
Hebrew is a lower-resource language for LLMs and there are far fewer high-quality
Hebrew sources on tax refunds than English equivalents. A genuinely excellent,
dated, source-cited, CPA-authored Hebrew article has a materially better chance of
being the cited source than its English counterpart would.

## 90-day content plan

**Days 1–30 (launch):** the 9 pages in `03`.

**Days 31–60:**
- `/מדריכים/נקודות-זיכוי` — pillar, the biggest long-tail volume
- `/מדריכים/טופס-106` — high volume, under-served commercially
- `/מדריכים/איך-מגישים-בקשה-להחזר-מס`

**Days 61–90:**
- `/מדריכים/החזר-מס-חייל-משוחרר`
- `/מדריכים/החזר-מס-לאחר-לידה` — low competition, high empathy, and she already
  has an Instagram highlight on `דמי לידה` to repurpose
- `/מדריכים/לבד-או-דרך-רואה-חשבון`
- `/אזורי-שירות/בת-ים` — only if it passes the gate

**Repurpose her existing Instagram content.** Her saved highlights are already
tax explainers. Transcribing them into articles is the cheapest high-quality
content available, and embedding the video is explicitly permitted under `2(ד)`.

## Honest time-to-rank

| When | Expect |
| --- | --- |
| Weeks 1–3 | Indexation; brand queries. **GBP produces the first leads** |
| Month 1–2 | Long-tail impressions, clicks near zero. **This is the stage where clients panic — set the expectation now** |
| Month 3 | Page 2–3 mid-tail; local pack for `רואה חשבון חולון`; first organic leads |
| Month 4–6 | Page 1 for several long-tails; top-10 local organic |
| Month 6–9 | Meaningful sustained lead flow |
| Never | Top-3 for bare `החזר מס` |

**Launching in October–November is ideal** — it rides the deadline spike. But
year-one January–March will understate the site, because it will be months old
during peak season with no authority. **Judge the strategy on the second season.**

90-day KPIs are pages indexed, impressions trend, GBP calls, and leads by source.
Ranking is a month-6 metric.
