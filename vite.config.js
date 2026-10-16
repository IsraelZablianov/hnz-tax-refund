import { defineConfig } from 'vite';
import { refundWindow, ledgerBarWidths } from './src/lib/refundWindow.js';
import { remainingPhrase, hebrewMonthYear } from './src/lib/hebrew.js';
import { TRIGGERS, PROCESS, WA_MESSAGE } from './src/content/copy.js';
import {
  PHONE_WA,
  LICENCE_NUMBER,
  LICENCE_REGISTER_URL,
  LICENSED_SINCE,
  DEGREE_HE,
  INSTITUTION_HE,
  SERVICE_AREAS_HE,
} from './src/content/site.js';

/**
 * ARCHITECTURE NOTE — deviation from docs/spec/03-architecture.md.
 *
 * The spec called for React Router. That is the wrong tool here:
 *
 *   1. This is a content site with two interactive islands (the quiz and the
 *      day counter), not an application.
 *   2. The years ledger and every content block MUST exist in the served HTML.
 *      They are the page's factual claims and what we want extracted into
 *      snippets and AI answers — so nothing substantive may be client-rendered.
 *   3. An MPA gives a real static document per URL with zero prerender
 *      toolchain, which is strictly better for a YMYL site.
 *
 * EVERYTHING below is injected at BUILD time. The runtime script only
 * (a) corrects the date if the build is stale and (b) wires the scroll reveal.
 * A visitor with JS disabled, and every crawler, sees the complete page.
 */

const ledgerRow = (row, deadline) => `
        <tr class="ledger__row${row.isExpiring ? ' ledger__row--expiring' : ''}">
          <th scope="row" class="ledger__year"><bdi>${row.taxYear}</bdi></th>
          <td class="ledger__deadline"><bdi>${row.deadline}</bdi></td>
          <td class="ledger__status">${
            row.isExpiring
              ? `<span class="ledger__expiring-label">נסגרת ב-<bdi>${deadline}</bdi></span>`
              : 'פתוחה'
          }</td>
          <td class="ledger__bar-cell">
            <span class="ledger__bar" style="--bar-width:${row.widthPercent}%" aria-hidden="true"></span>
            <span class="ledger__days">${remainingPhrase(row.daysRemaining)}</span>
          </td>
        </tr>`;

function buildCredentials() {
  const items = [`רואת חשבון מוסמכת משנת <bdi>${LICENSED_SINCE}</bdi>`];

  // The licence number renders only once we actually have it: structured data
  // must match visible content, so a placeholder is worse than an omission.
  if (LICENCE_NUMBER) {
    items.push(
      `רישיון רואת חשבון מס' <bdi>${LICENCE_NUMBER}</bdi> — ` +
        `<a href="${LICENCE_REGISTER_URL}" rel="noopener">ניתן לאמת בפנקס רואי החשבון ←</a>`,
    );
  } else {
    items.push(
      `<a href="${LICENCE_REGISTER_URL}" rel="noopener">פנקס רואי החשבון של משרד המשפטים ←</a>`,
    );
  }

  items.push(`${DEGREE_HE} — ${INSTITUTION_HE}`, 'שפות: עברית, אנגלית');
  return items.map((i) => `<li>${i}</li>`).join('');
}

function injectContent() {
  return {
    name: 'hnz-inject-content',
    transformIndexHtml(html) {
      const w = refundWindow();
      const bars = ledgerBarWidths(w);
      const waHref = `https://wa.me/${PHONE_WA}?text=${encodeURIComponent(WA_MESSAGE)}`;

      const tokens = {
        '{{CURRENT_YEAR}}': String(w.currentYear),
        '{{EXPIRING_YEAR}}': String(w.expiringYear),
        '{{LAST_CLOSED_YEAR}}': String(w.lastClosedYear),
        '{{DEADLINE}}': w.deadline,
        '{{DAYS_LEFT}}': String(w.daysLeft),
        '{{DAYS_REMAINING_PHRASE}}': remainingPhrase(w.daysLeft),
        '{{OPEN_YEARS_FIRST}}': String(w.openYears[0]),
        '{{OPEN_YEARS_LAST}}': String(w.openYears[w.openYears.length - 1]),
        '{{LAST_UPDATED}}': hebrewMonthYear(),
        '{{WA_HREF}}': waHref,

        '{{LEDGER_ROWS}}': bars.map((r) => ledgerRow(r, w.deadline)).join(''),

        '{{TRIGGERS}}': TRIGGERS.map(
          (t) => `
            <li class="reveal">
              <span class="trigger__name">${t.name}</span>
              <span class="trigger__why">${t.why}</span>
            </li>`,
        ).join(''),

        '{{PROCESS}}': PROCESS.map(
          (s) => `
            <li class="process__step reveal">
              <span class="process__name">${s.name}</span>
              <span class="process__detail">${s.detail}</span>
            </li>`,
        ).join(''),

        '{{CREDENTIALS}}': buildCredentials(),

        '{{LICENCE_LINE}}': LICENCE_NUMBER
          ? `רישיון מס' <bdi>${LICENCE_NUMBER}</bdi>`
          : `רואת חשבון מוסמכת משנת <bdi>${LICENSED_SINCE}</bdi>`,

        '{{SERVICE_AREAS}}':
          `אזורי שירות: ${SERVICE_AREAS_HE.join(', ')} והסביבה. הטיפול כולו מרחוק.`,
      };

      const out = Object.entries(tokens).reduce(
        (acc, [token, value]) => acc.replaceAll(token, value),
        html,
      );

      // Fail the build rather than ship a page with a visible {{TOKEN}}.
      const leftover = out.match(/\{\{[A-Z_]+\}\}/g);
      if (leftover) {
        throw new Error(
          `Unsubstituted tokens in HTML: ${[...new Set(leftover)].join(', ')}`,
        );
      }
      return out;
    },
  };
}

export default defineConfig({
  base: '/',
  plugins: [injectContent()],
  build: {
    target: 'es2022',
    cssCodeSplit: false,
  },
});
