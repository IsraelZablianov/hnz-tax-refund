/**
 * HTML fragments for the year-dependent parts of the homepage.
 *
 * Shared by the build (vite.config.js, which writes them into the static HTML)
 * and the browser (home.js, which rewrites them when the deployed build is
 * older than the visitor's "today").
 *
 * WHY ONE MODULE: these used to be written twice, once per side. The two
 * copies drifted: the browser refreshed the hero counter every day but only
 * rebuilt the ledger on a year rollover, so a build from 17 October showed
 * "75 days" in the ledger beside a hero counter saying 46. Rendering both
 * sides from the same function makes that class of bug impossible.
 *
 * Everything here is a pure function of a refundWindow() result.
 */

import { ledgerBarWidths } from './refundWindow.js';
import { remainingPhrase } from './hebrew.js';

/** One <tr> per open tax year, newest first. */
export function ledgerRowsHtml(w) {
  return ledgerBarWidths(w)
    .map(
      (row) => `
        <tr class="ledger__row${row.isExpiring ? ' ledger__row--expiring' : ''}">
          <th scope="row" class="ledger__year"><bdi>${row.taxYear}</bdi></th>
          <td class="ledger__deadline"><bdi>${row.deadline}</bdi></td>
          <td class="ledger__status">${
            row.isExpiring
              ? `<span class="ledger__expiring-label">נסגרת ב-<bdi>${w.deadline}</bdi></span>`
              : 'פתוחה'
          }</td>
          <td class="ledger__bar-cell">
            <span class="ledger__bar" style="--bar-width:${row.widthPercent}%" aria-hidden="true"></span>
            <span class="ledger__days">${remainingPhrase(row.daysRemaining)}</span>
          </td>
        </tr>`,
    )
    .join('');
}

/**
 * The hero counter line.
 *
 * Past the practical cut-off it stops leading on a year that can no longer
 * realistically be FILED in time and points at the remaining five instead.
 * See PRACTICAL_CUTOFF_DAYS in refundWindow.js: a consumer-law point, not a
 * UX nicety.
 *
 * The year range is written "X עד Y", not with a dash: house style bans en
 * dashes in visitor-facing Hebrew, and this string reaches the page through
 * the JS bundle too, where the CI grep over dist/*.html cannot see it.
 */
export function counterHtml(w) {
  if (w.pastPracticalCutoff) {
    const first = w.openYears[1];
    const last = w.openYears[w.openYears.length - 1];
    return (
      `הזמן להגשת <bdi>${w.expiringYear}</bdi> כבר קצר מאוד. ` +
      `אפשר עדיין לבדוק את השנים <bdi>${first}</bdi> עד <bdi>${last}</bdi>.`
    );
  }
  return `${remainingPhrase(w.daysLeft)} להגשת הדוח על שנת <bdi>${w.expiringYear}</bdi>`;
}
