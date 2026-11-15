# Behavioural design

What the page does to help people act, why, and the levers we deliberately do
not pull. Read `docs/spec/02-constraints.md` first: every lever here has to fit
inside it, and most of the standard conversion playbook does not.

## The problem, stated behaviourally

Most people who are owed a refund never claim it. The State Comptroller found
about ₪3.6bn over-collected across about 2m cases. The barriers are behavioural,
not informational:

| Barrier | What it looks like | Where the page answers it |
| --- | --- | --- |
| **Present bias** | "I'll do it after the holidays." | The dated deadline; the calendar reminder |
| **Hassle factor** | Imagining hunting down six years of 106 forms | `לא צריך להכין מסמכים מראש` beside the CTA; process step 2 |
| **Status quo / inertia** | Assuming the state refunds automatically | `רשות המסים לא מחזירה מיוזמתה` (why section, authority note) |
| **Ambiguity aversion** | "What if it ends in a debt?" | The 1.4% honesty block, with real design weight |
| **Distrust** | Refund factories, scam calls | Named person, own process, the explicit "I'll tell you if there's nothing" |
| **"Not me"** | "That's for people with complicated situations" | Trigger list of ordinary events; the 2m-cases figure |

## The levers in use

1. **Loss framing on the visitor's own money.** The hero says `ההפרש שייך לך`.
   That frames a refund as getting back money that was already theirs, not
   winning something new, and people act faster to avoid a loss. It is legally
   safe because it asserts no amount and no outcome: it is conditional
   (`אם שילמת יותר`).
2. **A real, statutory deadline.** §160 sets it, not us. It is stated neutrally
   (H1 carries the date, never the count) and the counter pivots honestly past
   the practical cut-off (`PRACTICAL_CUTOFF_DAYS`). Artificial urgency is
   prohibited and would also burn trust.
3. **The ledger as a picture of loss.** Each bar is drawn to the year's real
   remaining window. The expiring year's sliver beside 2025's full bar makes the
   argument without a single adjective.
4. **Descriptive norm from an official source.** Client counts and testimonials
   are prohibited, so the "people like you" signal comes from the Comptroller's
   `כ-2 מיליון מקרים`.
5. **Friction removed from step one.** WhatsApp with a pre-filled message means
   zero typing, and "no documents needed to start" removes the imagined
   paperwork. The first tap costs nothing.
6. **Commitment device for the not-today visitor.** `אפשר לשים תזכורת ביומן
   לעוד שבוע` downloads an `.ics` for 20:00 a week later (`src/lib/reminder.js`).
   An appointment you set yourself beats a vague intention. It collects no data.
7. **Honesty as a costly signal.** `וגם אם אין`, the 1.4% block and the link to
   file alone on gov.il are things a high-pressure seller would never say. That
   is exactly why they persuade.
8. **The eligibility quiz** (`#bdika`, `src/islands/quiz.js`). Self-relevance
   ("which of these happened to me"), small commitments before the ask, and an
   honest "low" result that tells some people not to bother. The WhatsApp
   message it pre-fills means she opens the chat already briefed. No amount,
   percentage or "זכאי" on any screen.
9. **One primary action per screen.** Every section ends in the same WhatsApp
   action, and the reminder and phone are visually secondary. No choice overload.

## Levers we do NOT pull, and why

| Lever | Why not |
| --- | --- |
| Testimonials, reviews, "X clients helped" | Prohibited, even anonymised (ethics 14.13.5, rule 17(ג)(7)) |
| Average-refund anchors, calculators showing ₪ | Promise of outcome: §2(א), rule 17(ד), consumer law |
| Fake scarcity, "only 3 slots left", countdown drama | Prohibited (`2(א)` + `1א(9)`) and dishonest |
| Pop-ups, exit intent, sticky modals | `2(ב)(4)` |
| Pre-ticked boxes, confirm-shaming declines | Dark patterns; the consent bar's "no" is equally weighted on purpose |
| Free-gift / lead-magnet email capture | No backend by design; any fee or "free" framing is restricted |
| Retargeting / Meta pixel | Paid social treated as prohibited (`2(ב)(5)`) |

## Next candidates, not built

- **Seasonal framing after 1 January.** The page rolls over automatically. A
  "fresh start" line in early January would suit the moment.
- **Measure before adding more.** Once `GA4_MEASUREMENT_ID` is set, compare
  `whatsapp_click` by surface and `reminder_click` before adding levers.
