# Off-site presence checklist

AI assistants and Google cross-check the site against other profiles. Every
profile must say the same thing as the site: same name, phone, email, service
areas and service label. Source of truth: `src/content/site.js`.

All of it is subject to `docs/spec/02-constraints.md`. Profiles are advertising
too: no fee, no `חינם`, no `מומחה`, no client results, and **never ask clients
for reviews**.

Needs Hila's own Google account and verification, so it cannot be automated.

## 1. Google Business Profile (highest value)

- **Business name:** `הילה נח זבליאנוב, רואת חשבון` (the real name only, no
  keywords added; keyword stuffing gets profiles suspended).
- **Type:** service-area business. **Hide the address** (matches the site and
  schema, which omit `streetAddress`).
- **Primary category:** `רואה חשבון` (Accountant). Do not add a tax-refund
  category as primary.
- **Service areas:** חולון, בת ים, ראשון לציון, תל אביב-יפו, אזור.
- **Phone:** 055-5582369 · **Website:** https://card.hnz-cpa.com (decided: the
  card site is the one on Google; it links on to the tax site, see
  `docs/card-site-brief.md`)
- **Service:** `החזרי מס לשכירים (שירות נלווה)`. Keep the `שירות נלווה` label.
- **Description (draft, 750 chars max):**
  `רואת חשבון מוסמכת משנת 2018, בוגרת תואר ראשון במנהל עסקים וראיית חשבון
  בקריה האקדמית אונו. מתמחה בהחזרי מס לשכירים (שירות נלווה): בדיקת השנים
  הפתוחות, חישוב כל שנה בנפרד והגשה לרשות המסים רק אחרי אישור. הטיפול מרחוק.`
- **Photos:** a real photo of her. Do not upload the current hero portrait (see
  below).
- **Reviews:** leave them to arrive on their own. Do not request, link to or
  incentivise them.
- Verification is by video or phone; Google decides which.

## 2. Search consoles (free, makes pages findable)

- **Google Search Console:** add `tax.hnz-cpa.com`, submit `/sitemap.xml`, then
  request indexing for `/`, `/אודות/` and the guide.
- **Bing Webmaster Tools:** same. Bing's index feeds ChatGPT search and Copilot,
  so this matters more than it looks. Import from Search Console to save time.

## 3. Profiles to align (she already has Facebook and Instagram)

- **Facebook and Instagram:** bio uses the same sentence as the GBP description,
  links to the site, same phone. They are already in `sameAs`.
- **LinkedIn:** a personal profile with title `רואת חשבון`, the same degree and
  year, and the site as website. Ranks well for professional queries.
- Put the site link in all of them. Do not join ICPAS yet (see `02`).

## 4. Known problem

`src/assets/hila-hero.png` has a visible Gemini watermark, so it is AI-generated
or edited. The site's trust rests on her real image, so replace it with a real
photo before pushing the site hard.

## 5. Monthly AI check

Ask 15 Hebrew questions (for example `איך מבקשים החזר מס לשכיר`, `כמה שנים אחורה
אפשר לקבל החזר מס`) in ChatGPT, Perplexity, Gemini and Google. Run each 3 to 5
times and log how often the site is cited.
