# Brief: changes needed on card.hnz-cpa.com

The card site is not in this repo. It is the website on the Google Business
Profile, so it is the page Google and AI assistants will meet first. The refund
content lives on https://tax.hnz-cpa.com. Checked 2026-11-15.

## Do

1. **Link to the tax site** from the refund service entry, as a real `<a>` in
   the HTML: text `החזרי מס לשכירים`, href `https://tax.hnz-cpa.com/`. Optionally
   also link the guide:
   `https://tax.hnz-cpa.com/%D7%9E%D7%93%D7%A8%D7%99%D7%9B%D7%99%D7%9D/%D7%90%D7%99%D7%9A-%D7%9E%D7%92%D7%99%D7%A9%D7%99%D7%9D-%D7%91%D7%A7%D7%A9%D7%94-%D7%9C%D7%94%D7%97%D7%96%D7%A8-%D7%9E%D7%A1/`
2. **Render the content into the HTML.** The page is a client-side React app
   (about 7 KB of HTML), so crawlers and assistants that do not run JavaScript
   see almost nothing. Pre-render it, or ship the text in the HTML.
3. **Add the same JSON-LD name, phone and email** as the tax site
   (`src/content/site.js`) and list https://tax.hnz-cpa.com in `sameAs`.
4. **Service label.** Wherever the services are listed, label the refund service
   `שירות נלווה` and keep it visually apart from `ראיית חשבון` (`02`, 2(ג)(4)).
5. **Footer disclaimer** like the tax site's.

## Check against `docs/spec/02-constraints.md`

This page is advertising too and Google will show it. Review its copy for fees,
`חינם`, `מומחה`, superlatives and client results. The `keywords` meta and
`revisit-after` are ignored by Google; they can go.
