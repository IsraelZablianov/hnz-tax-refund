# 06 — Design

## The direction **[LOCKED]**

**Portrait-led and warm, with the deadline ledger as its structural spine.** A
merge of all three comps, reassessed after seeing the third: the palette, type
hierarchy and mobile treatment from "Her, Up Close"; the to-scale years ledger
from "The Deadline"; the vertical rhythm from "Quiet Authority".

**Thesis.** The whole competitive advantage is that you get one named, licensed
human who does the work herself. Because `02` forbids her from *saying* she is
warm, personal or professional, every trust signal must be carried by scale, eye
contact, voice-set typography and interaction design — while the words stay
strictly factual. The portrait *is* the interface, not an illustration of it.

The deadline is the reason to act *now*; the person is the reason to act *with
her*. The page needs both, and the merge is how it gets them.

**The hard part.** Two of them. First, convey genuine urgency without looking like
a scam — urgency through clarity and typographic structure, never alarms or
manufactured scarcity. Second, convey warmth without a single self-praising word.
A dramatised countdown is graded amber-to-red in `02`; a plain statement of the
date is clearly permitted.

### What comes from where

**From "Her, Up Close" — the base:**
- **The type hierarchy inversion, which is the key insight of the whole set.** Her
  first-person sentences are set at statement size (19→30px) while factual
  connective tissue stays at 17px. The page audibly speaks in her voice rather
  than reading as body copy.
- **`1.4%` at that same statement size** — so the honest disclosure is
  typographically *equal* to her own claims, not demoted to fine print. This is
  the positioning expressed as typography.
- Field-change sectioning: cream → sand → olive. No rules, no shadows, no
  gradients except text scrims.
- The mobile hero: portrait at `58svh`, near-full-bleed, type on the dark lower
  third.
- The eyebrow set as a readable sentence-case credential line, not a tracked
  label.

**From "The Deadline" — the ledger:**
- **Each year's bar drawn to its actual remaining claim window**, computed
  client-side: 2025 a full bar, 2020 a ~4% sliver. That proportion *is* the
  argument — demonstrated, not asserted. The strongest single component produced,
  and the most screenshot-able asset for the November press pitch.
- A real `<table>`; tabular numerals throughout.
- `{lastClosedYear}` struck through on a sealed block below the line.

**From "Quiet Authority":**
- Generous section padding and printed-page vertical rhythm. The warm direction
  needs this discipline or the fields crowd each other.

**Fixed across all three:**
- The day count moves **out of the H1** (see `03`, `04`).
- The `שירות נלווה` label is added — mandatory, missing from all three.
- The final CTA reworded away from `נבדוק אם 2020 עוד שווה לך כסף`, which edges
  toward promising an outcome.

## Tokens

Base inherited from the business card she likes; the warm steps and olive accent
come from the chosen direction.

```css
:root {
  /* Carried over, pushed warmer */
  --bg:          #f3efe7;  /* warm cream — was #f0ede8 */
  --bg-step:     #ece5d9;  /* tone step */
  --sand:        #ddd1bd;  /* the warm field — honesty, about */
  --dark:        #3a3a3a;  /* charcoal */
  --surface:     #ffffff;
  --text:        #222222;
  --text-muted:  #666666;

  /* The one added hue */
  --accent:      #2f4036;  /* deep forest-olive — actions */

  /* State only */
  --signal:      #b7410e;  /* oxide red-orange — expiry state ONLY */
  --closed:      #9e9e9e;  /* already-expired years */
}
```

**Why olive.** It gestures at WhatsApp without being WhatsApp green, and it keeps
the warmth on the credible-financial side rather than drifting into wellness or
spa. This is the narrow line the direction has to walk, and it is the main risk if
implementation loosens it.

**`--signal` discipline — the most important styling rule here.** Oxide red-orange
reads as stamp ink, not alarm red. It marks expiry state and nothing else: the
expiry date, the expiring row, that row's bar, its underline. **Never a CTA,
never a heading, never a field of any size.** The moment it appears as a
background the direction collapses into the register we are avoiding.

Actions are olive. Urgency is carried by **type, scale and proportion** — never
by colour.

## Type

Rubik, self-hosted subset. **Three working sizes, deliberately:**

| Role | Size | Weight |
| --- | --- | --- |
| Display | 33→64px, −0.025em, 1.03 leading | 300 |
| **Statement — her voice, and `1.4%`** | 19→30px | 400/500 |
| Body — factual connective tissue | 17px | 400 |

- Hebrew body line-height **1.7–1.8**. Hebrew needs more leading than Latin; this
  is where most Hebrew sites fail.
- `font-variant-numeric: tabular-nums lining-nums` on every year, date, counter
  and bar label, so the ledger column aligns optically.
- **Never 700 as a default.** The main weakness across the comps was over-bolding.
- Headlines hold two lines at both widths via explicit line spans.

## The years ledger component

The centrepiece, and where most of the design budget goes.

- A real `<table>` — it is genuinely tabular data, and semantic HTML serves both
  accessibility and AI extraction (`07`).
- Rows descending `2025 → 2020`. Each row: year · `31.12.{year+6}` · remaining
  window · bar.
- **The bar is the argument.** Width proportional to actual days remaining,
  computed from `refundWindow()`. Olive for open years; `--signal` on the
  expiring row only.
- `{expiringYear}` is heavier, with `--signal` on its status and bar. **No badge,
  no pill, no icon.**
- `{lastClosedYear}` below a visible divider, struck through, `--closed`, on a
  sealed block.
- Scroll-reveal: bars `scaleX` from 0, ~420ms, 70ms stagger **ending on the
  expiring year**. Transform and opacity only.
- **With motion disabled, all bars render at true length** — the information must
  survive without the animation.

## The portrait

`src/assets/hila-hero.png` — waist-up studio frame, 704×1472, black blazer, grey
backdrop.

- **Mobile: `58svh`, near-full-bleed**, high on the page, eyes visible, type
  overlaid on a scrim across the lower third. `svh` not `vh`. Not a circular
  avatar, not a thumbnail.
- Desktop: full-height two-column split, wider crop.
- AVIF with JPEG fallback, preloaded, explicit dimensions.
- `alt`: `הילה נח זבליאנוב, רואת חשבון`

**Known limitation, flagged independently by all three comps.** There is exactly
one photograph. One direction reused a scaled crop for the About section; another
needed four crop iterations to get genuinely close and noted a tonal seam near the
frame edge. With testimonials prohibited by `02`, imagery is carrying load that a
single studio frame cannot carry alone.

**→ 2–3 additional photographs are now an open question in `08`.** A working shot,
a second portrait at a different crop, and ideally a short talking-to-camera video
— all explicitly permitted by `2(ד)`, and she already produces this content well
on Instagram.


## Mobile

~80–85% of traffic. The 414px view is the primary design target, not a derivative.
The chosen direction was designed mobile-first and already solves most of this.

- Sticky bottom bar: a two-cell WhatsApp + call bar with
  `env(safe-area-inset-bottom)`. Reads as native, not bolted on.
- Tap targets ≥ 44px; primary CTAs at 56px, thumb-reachable.
- `-webkit-tap-highlight-color` killed; `:active` press at ~120ms.
- **Hover gated behind `(hover: hover) and (pointer: fine)`** — no sticky hover
  states on touch.
- `svh` units, not `vh` — avoids the mobile viewport bug.
- `overscroll-behavior: none`, `touch-action: manipulation`.
- `user-select: none` on controls **only** — never on body copy.
- Zero horizontal overflow at 414px **and 320px**. The ledger must fit without
  scroll.
- Inputs ≥16px so iOS doesn't zoom the page.

## RTL

- `<html lang="he" dir="rtl">`
- **Logical properties only** — `margin-inline-start`, `padding-inline-end`,
  `inset-inline-start`. No `left`/`right` anywhere.
- `<bdi>` or `dir="ltr"` on every Latin or numeric run: the phone number,
  `31.12.2026`, `1.4%`, `HNZ`, `hnz-cpa.com`. **A phone number rendering as
  `0369-5555-55` is both a conversion killer and the classic RTL failure.**
- Mirror any `translateX` in animations.

## Motion

Minimal and purposeful.

- **Ledger bars: `scaleX` from 0 on scroll, ~420ms, 70ms stagger ending on the
  expiring year.** The stagger order is deliberate — the eye lands last on 2020.
- Section parts rise ~22px with opacity, 70ms stagger, `IntersectionObserver`.
- Day counter: counts up once on load, ~760ms cubic ease-out. Tabular figures so
  nothing reflows mid-count.
- CTA press: subtle scale, ~120ms.
- Composite-only properties — transform and opacity. Nothing that triggers layout.
- `prefers-reduced-motion` fully honoured: **all bars at true length**, all
  content in final state, travel dropped.
- **Content must be fully visible with JS disabled.** The reveal is an
  enhancement, never a gate.

**No:** flip-clock widgets, pulsing, blinking, seconds ticking, parallax on the
portrait beyond a few pixels, scroll-jacking.

## Accessibility

- WCAG AA minimum: all text ≥ 4.5:1. **Check specifically:** `--signal` on
  `--bg`, `--closed` on `--bg`, and body text on `--sand` — the sand field is the
  likeliest failure, and dimmed closed years the second.
- Semantic landmarks, one `<h1>`, logical heading order.
- Quiz fully keyboard-navigable, `aria-live` on step changes and the result.
- Visible focus states; never `outline: none`.
- The `/נגישות` statement is legally required — see `03`.
- **Verify bidi at every breakpoint.** The comps independently hit three real
  cases: the `=` in her tagline reads as an equation and must be isolated;
  `[PENDING]`-style brackets mirror unless LTR-isolated; and the phone number is
  the classic failure. Wrap every Latin and numeric run.

## Prohibited design patterns

Beyond taste, these are legal or strategic:

- **Pop-ups and exit-intent modals** — prohibited by `2(ב)(4)`.
- **Testimonial carousels, star ratings, review widgets** — prohibited by `02`.
- **Comparison tables** — prohibited.
- **Countdown timer widgets** in the scammy register.
- **Trust badges** she has not earned.
- Gradients, glassmorphism, emoji soup, generic SaaS purple, stock photography,
  illustrated mascots.

## Accessibility

- WCAG AA minimum: all text ≥ 4.5:1. **Check specifically:** `--signal` on
  `--bg`, `--closed` on `--bg`, and body text on `--sand` — the sand field is the
  likeliest failure, and dimmed closed years the second.
- Semantic landmarks, one `<h1>`, logical heading order.
- Quiz fully keyboard-navigable, `aria-live` on step changes and the result.
- Visible focus states; never `outline: none`.
- The `/נגישות` statement is legally required — see `03`.
- **Verify bidi at every breakpoint.** The comps independently hit three real
  cases: the `=` in her tagline reads as an equation and must be isolated;
  `[PENDING]`-style brackets mirror unless LTR-isolated; and the phone number is
  the classic failure. Wrap every Latin and numeric run.

## The eyebrow problem

All three comps collided with the house style's ban on tracked eyebrow labels,
and each solved it differently. **Adopt the chosen direction's solution:** set
`רואת חשבון מוסמכת משנת 2018 · מתמחה בהחזרי מס לשכירים` as a readable
sentence-case credential line rather than a small tracked label — or move it into
the portrait caption, where it reads as an attribution rather than a badge.
