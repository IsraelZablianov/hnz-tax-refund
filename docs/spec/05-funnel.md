# 05 — Funnel

## Conversion mechanism **[LOCKED]**

| | Mobile (~80–85% of traffic) | Desktop |
| --- | --- | --- |
| **Primary** | WhatsApp deep link — hero + sticky bar | Eligibility quiz → WhatsApp |
| **Secondary** | Tap-to-call | Short form, name + phone |
| **Tertiary** | Short form | Tap-to-call |

**Why WhatsApp primary on mobile.** Near-universal penetration in Israel, so zero
install or format friction. It is asynchronous — a lead at 23:00 is queued, not
lost, which matters enormously for a solo practitioner. It is identity-carrying:
she gets a name and a reachable number without a single form field. It is the
natural medium for the document exchange that follows, so the channel the lead
starts in is the channel the engagement lives in. And it is psychologically
cheaper than a phone call for a money question people are mildly embarrassed about.

Her Instagram bio already points at `wa.me/+972555582369` — she has independently
arrived at the same answer.

**Why the quiz on desktop.** Desktop visitors are researching, can't tap to
WhatsApp as naturally, and tolerate more interaction. The quiz supplies the
engagement scaffolding that the mobile tap gets for free.

**Why not a form as primary.** A form is a one-way deposit into a black box: the
visitor surrenders their number and receives nothing. WhatsApp returns an
immediate signal that a human is there. Keep the form for people who genuinely
prefer not to be messaged — just not as the main road.

## The eligibility quiz

**Build the eligibility screening. Never a shekel calculator.**

An amount on screen is a number she becomes accountable for — prohibited under
`2(א)` and `כלל 17(ד)`, and exposed under `חוק הגנת הצרכן §2(א)`. The eligibility
version carries none of that and answers the visitor's actual first question:
*"אני בכלל זכאי?"*

**Honest note on the evidence:** the multi-step-form conversion literature is
weaker than the marketing industry implies — mostly self-reported or vendor case
studies, and rigorous work suggests total field count matters more than how you
chunk it. The case here is mechanism-specific, not benchmark-driven:

1. It answers a question no amount of body copy can answer for an individual.
2. **It replaces the price filter she is legally barred from using.** Instead of
   screening on "can you afford it", it screens on "do you have a plausible
   refund event" — which is a better predictor of revenue anyway.
3. It converts passive reading into commitment.
4. It arms her: a lead arriving with five known facts lets her open with
   substance instead of discovery.

**Framing:** `בדיקת זכאות ב-60 שניות — 5 שאלות, בלי להשאיר פרטים`

Five questions, one per screen, tappable buttons only, no typing until the end,
progress indicator, WhatsApp always reachable in the sticky bar so the quiz is
never the only exit.

### Questions

**Q1 — employment status**
`בשש השנים האחרונות עבדת כשכיר/ה?`
`כן, כל הזמן` / `כן, בחלק מהשנים` / `גם שכיר/ה וגם עצמאי/ת` / `לא`
→ `לא` routes to a polite exit. `גם וגם` flags high-value but complex.

**Q2 — employment continuity** *(most predictive)*
`קרה אחד מאלה בשנים האחרונות?` — multi-select
`החלפתי מקום עבודה` / `עבדתי בשני מקומות במקביל` / `הייתה לי תקופה בלי עבודה` /
`חופשת לידה` / `חל"ת` / `פרשתי או קיבלתי מענק פרישה` / `לא, מעסיק אחד ברצף`

**Q3 — unused credit points**
`אחד מאלה נכון לגביך?` — multi-select
`סיימתי תואר` / `השתחררתי מצה"ל או משירות לאומי` / `נולד לי ילד` / `עליתי לארץ` /
`הורה יחיד` / `אני גר/ה ביישוב מוטב` / `שילמתי מזונות` / `אף אחד מאלה`

**Q4 — deductions outside payroll**
`אחד מאלה?` — multi-select
`מילואים` / `דמי אבטלה או דמי לידה` / `הפקדה מהכיס לקופת גמל או ביטוח חיים` /
`תרומות למוסד מוכר` / `הפסדים בשוק ההון` / `משיכת קופת גמל או פנסיה` / `אף אחד מאלה`

**Q5 — prior filing**
`הגשת בעבר בקשה להחזר מס?`
`לא, מעולם` / `כן, לפני יותר משנה` / `כן, בשנה האחרונה` / `לא בטוח/ה`

### Disqualifier screen

Before the result — two situations that change the handling path entirely:

`משהו מהשניים האלה נכון לגביך?`
`יש עיקול על חשבון הבנק שלי` / `בן/בת הזוג שלי עצמאי/ת ומגיש/ה דוח שנתי`
Helper: `שני מצבים שמשנים את מסלול הטיפול, ועדיף שנדע עכשיו ולא בסוף.`

Asking this is a credibility signal in itself: it is a question only someone who
intends to do the work properly would ask.

### Scoring

- **Positive** = ≥1 selection in Q2/Q3/Q4 **and** Q1 ≠ `לא`
- **High-value** = selections across ≥2 of Q2/Q3/Q4 **and** Q5 = never filed →
  the lead she answers within 5 minutes
- **Low** = Q2 = `מעסיק אחד ברצף` **and** nothing in Q3/Q4

### Result screens

**No number. No percentage. No probability. Never the word `זכאי` as a determination.**

**Positive:**
> `לפי התשובות שלך — יש כאן סימנים שכדאי לבדוק לעומק.`
> `סימנת: {FLAGS}`
> `כל אחד מאלה הוא מצב שבו שכירים רבים שילמו מס ביתר. אם זה המצב אצלך — ובאיזה
> סכום — אפשר לדעת רק מהנתונים האמיתיים בטופסי 106 ובתיק שלך ברשות המסים.`
> `חשוב שתדע/י: זו אינה חוות דעת מקצועית ואינה התחייבות לסכום או לקיומו של החזר.`
> `[המשך בוואטסאפ ←]` `[או השאר/י טלפון ואחזור אליך]`
> `השנים הפתוחות כרגע: {openYears[0]}–{openYears[5]}. שנת {expiringYear} נסגרת ב-{deadline}.`

**Low:**
> `לפי התשובות שלך לא זיהינו סימנים מובהקים להחזר.`
> `זה לא אומר שאין — יש זיכויים שלא שאלנו עליהם — אבל אני מעדיפה לומר את זה בכנות
> מראש ולא לפתוח לך תיק סתם. אם משהו השתנה אצלך ואינך בטוח/ה אם זה רלוונטי, כתוב/כתבי לי.`
> `[יש לי שאלה — וואטסאפ]`

**The low screen is a conversion asset, not a leak.** It is behavioural proof of
the trustworthiness the positioning claims, it costs her nothing (those leads were
unprofitable), and it is what a professional does.

## Lead delivery — no backend

- Quiz state in component memory only. **No `ת.ז.`, no bank details, no uploads,
  ever.** Identity-grade data moves only inside WhatsApp after engagement.
- **Primary:** WhatsApp deep link with answers serialised into the pre-filled
  message. Zero infrastructure; the lead lands in her working inbox.
- **Secondary:** name + phone → Google Apps Script → Sheet. Same mechanism as the
  card. The endpoint is public, so: honeypot field, client-side rate limit, and
  treat the sheet as a lead log rather than a store of anything sensitive.
- Fire-and-forget on the sheet write — if it fails, WhatsApp still opens. The card
  already does this correctly.

**Form fields: name + phone. Two.** Nothing else. Everything else is a
conversation.

## Speed to lead — the highest-ROI item in this entire spec

Published research on web leads shows the odds of qualifying a lead collapse
within the first half hour, and degrade by roughly an order of magnitude over 24
hours. For a solo operator this beats every design change we could make.

**Operational requirements, not site features:**

- WhatsApp Business installed, with the after-hours away message from `04`.
- Target: first response **under 5 minutes** in business hours.
- High-value quiz leads get a call, not a message.
- A simple follow-up cadence she can actually run alone: WhatsApp → next-morning
  call → one SMS → stop.

**SMS note:** a lead who submitted a form requesting a check has consented to
being contacted *about that request* — service communication, not marketing. Any
later promotional SMS needs separate explicit opt-in under
`חוק התקשורת (בזק ושידורים)`.

## Tracking **[FLAG]**

Minimum viable, consent-gated:

- GA4 with `whatsapp_click`, `call_click`, `form_submit`, `quiz_start`,
  `quiz_step_{n}`, `quiz_result_positive`, `quiz_result_low`, `quiz_to_whatsapp`.
  The per-step events show exactly which question bleeds.
- UTM convention: `utm_source` / `utm_medium` / `utm_campaign`, documented in
  `AGENTS.md` so it stays consistent.
- **No Meta pixel.** Paid social is prohibited pending clarification, so the pixel
  would collect data for a channel we cannot use.
- **Consent:** `תיקון 13` to the Israeli Privacy Protection Law took effect in
  2025 and materially raised the stakes on personal-data handling. Analytics
  loads only after consent; the lead form carries an explicit purpose statement
  and a privacy-policy link. **A lawyer should review the privacy policy text** —
  this is the one place I would not rely on my own drafting.

## Campaign notes

**Google Search ads: permitted.** Ethics decision 14.2.9 expressly allows paying
Google to rank her site for chosen search terms — it is *pull*, the visitor is
already searching. Use exact/phrase match on high-intent Hebrew terms.

**Paid social: do not run.** `2(ב)(5)` bans `פנייה יזומה` to people who have not
expressed interest, which is precisely what feed advertising is.

**Organic Instagram and YouTube: strongly encouraged.** `2(ד)` explicitly permits
video. She already produces it. This is her most under-used legal asset.

**Local press in November:** a Holon/Bat Yam pitch on the expiring tax year is the
highest-value realistic link, and it is seasonal — pitch it before the deadline,
not after.

**Facebook groups:** answer questions genuinely, never drop links. Output is brand
searches, which are themselves a positive signal.

**Never:** purchased lead lists, cold calling, affiliate/referral commissions
(`1א(10)` bars payment for obtaining professional work), bought reviews, paid link
packages.
