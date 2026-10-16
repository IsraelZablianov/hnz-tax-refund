> **Status:** Draft for approval. No production code until the user signs off.
> **Date:** 16 Oct 2026 · **Owner:** Hila Noah Zablianov, CPA (licensed 2018)

# החזרי מס לשכירים — Design & Build Spec

A Hebrew (RTL), mobile-first, statically generated lead-generation site whose single
job is to get a salaried Israeli employee to start a WhatsApp conversation about
checking whether they are owed an income-tax refund.

## Spec index

| File | Contents |
| --- | --- |
| `01-intent.md` | What we are building and why; success criteria; what would make this a failure |
| `02-constraints.md` | The binding legal constraints and the green/amber/red copy rules |
| `03-architecture.md` | Pages, URLs, stack, hosting, repo layout, the year-math module |
| `04-copy-deck.md` | Every string on the site, verbatim, in Hebrew |
| `05-funnel.md` | Conversion mechanism, eligibility quiz, lead delivery, tracking |
| `06-design.md` | The chosen art direction, tokens, components, motion, RTL rules |
| `07-seo.md` | Schema, metadata, sitemap, GBP, citations, the 90-day content plan |
| `08-plan.md` | Build order, verification gates, launch checklist, open questions |

## The one-paragraph version

Israeli CPA conduct regulations forbid Hila from doing almost everything her
competitors do: she cannot publish a fee, a discount, a testimonial, a client
result, an average refund, a comparison table, or the word `מומחה`. Rather than
work around that, the site is built so its persuasion engine never depends on any
of them. It converts on four things she alone can offer: a **real statutory
deadline** (tax year 2020 expires 31.12.2026 under §160), a **named licensed
professional** whose licence is verifiable in a public government register,
**radical procedural transparency** about what happens to the visitor's data and
documents, and **honest disclosure** of the ~1.4% chance a filing reveals a debt
rather than a refund — in a market the consumer protection authority publicly
associates with `העוקץ הפיננסי`. The restraint is the differentiator.

## Decisions already locked by the user

| Decision | Choice |
| --- | --- |
| Domain | New subdomain first; point the root at it later once she is happy |
| Scope | Refund funnel + a real About page + a thin other-services page |
| Fee on the page | **Nothing.** No number, no range, no discount, no "starting from" |
| Risk posture | Ship strictly compliant; keep riskier variants behind config flags |
| Legal spend | None for now. Use the free §11א route instead |
| Stack | Vite + GitHub Pages, Google Sheet + WhatsApp — same as her business card |
| Hebrew URLs | Yes, percent-encoded, slugs declared in route config |
| Google Business Profile | Create it, service-area business, address hidden |
| English version | Phase 2. Hebrew only at launch |
| Capacity | 30+ new refund clients/month — build for volume |
| Art direction | Merge of all three comps: portrait-led warmth as the base, the to-scale deadline ledger as its spine |
| Wintax's "disappearing freelancer" attack | Do not answer it directly |

## How to read this spec

Sections marked **[LOCKED]** are decided and should not be relitigated during
implementation. Sections marked **[OPEN]** need an answer from Hila before the
relevant page can ship — they are collected in `08-plan.md`. Sections marked
**[FLAG]** are judgement calls I made that the user may want to reverse.

Every factual claim that appears on the public site must be traceable to a source
in `02-constraints.md` or `07-seo.md`. If a claim cannot be sourced, it does not
ship.
