/**
 * Runtime script. Deliberately minimal.
 *
 * Everything substantive is already in the HTML, injected at build time — see
 * vite.config.js. This script does exactly two things:
 *
 *   1. Corrects the date if the deployed build has gone stale.
 *   2. Wires the scroll reveal.
 *
 * It renders NO primary content. A visitor with JS disabled, and every crawler,
 * must see the complete page — that is the whole point of the MPA decision.
 */

import { refundWindow, ledgerBarWidths } from './lib/refundWindow.js';
import { remainingPhrase } from './lib/hebrew.js';
import { initAnalytics } from './lib/analytics.js';
import { mountConsentBar } from './lib/consent.js';
import './styles/tokens.css';
import './styles/base.css';
import './styles/home.css';

/* ------------------------------------------------------------------
   Stale-build correction.

   The HTML carries build-time values. If the deployment is older than the
   visitor's "today" — which happens the moment a build survives midnight, and
   badly on 1 January — these would be wrong. A wrong date here is a wrong
   statement about someone's legal rights, so it is worth the belt and braces.
   ------------------------------------------------------------------ */
function correctStaleYearData() {
  const w = refundWindow();
  const body = document.querySelector('[data-ledger-body]');
  const renderedExpiring = document
    .querySelector('.ledger__row--expiring .ledger__year bdi')
    ?.textContent?.trim();

  const isStale = renderedExpiring !== String(w.expiringYear);

  // The counter changes daily, so always refresh it.
  const counter = document.querySelector('[data-days-counter]');
  if (counter) {
    if (w.pastPracticalCutoff) {
      // Past the practical cut-off, stop leading on a year that can no longer
      // realistically be FILED in time. See refundWindow.js — this is a
      // consumer-law point, not a UX nicety.
      const rest = `${w.openYears[1]}–${w.openYears[w.openYears.length - 1]}`;
      counter.innerHTML =
        `הזמן להגשת <bdi>${w.expiringYear}</bdi> כבר קצר מאוד. ` +
        `אפשר עדיין לבדוק את השנים <bdi>${rest}</bdi>.`;
    } else {
      counter.innerHTML =
        `${remainingPhrase(w.daysLeft)} להגשת הדוח על שנת <bdi>${w.expiringYear}</bdi>`;
    }
  }

  if (!isStale || !body) return;

  // Whole-year rollover: rebuild the ledger and the surrounding year references.
  body.innerHTML = ledgerBarWidths(w)
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

  document.querySelectorAll('[data-closed-year]').forEach((el) => {
    el.textContent = String(w.lastClosedYear);
  });
  document.querySelectorAll('[data-expiring-year]').forEach((el) => {
    el.textContent = String(w.expiringYear);
  });
  document.querySelectorAll('[data-deadline]').forEach((el) => {
    el.textContent = w.deadline;
  });
}

/* ------------------------------------------------------------------
   Scroll reveal. Content is already visible without this; the reveal is
   purely an enhancement and is skipped entirely under reduced motion.
   ------------------------------------------------------------------ */
function wireReveal() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const showAll = () => {
    document.querySelectorAll('.reveal, .ledger__bar').forEach((el) => {
      el.classList.add('is-visible');
    });
  };

  if (reduced || !('IntersectionObserver' in window)) {
    showAll();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;

        if (el.matches('[data-ledger-body]')) {
          // Stagger from the newest year down, so the eye lands last on the
          // expiring one.
          el.querySelectorAll('.ledger__bar').forEach((bar, i) => {
            setTimeout(() => bar.classList.add('is-visible'), i * 70);
          });
        } else {
          el.classList.add('is-visible');
        }
        observer.unobserve(el);
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.1 },
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  const ledger = document.querySelector('[data-ledger-body]');
  if (ledger) observer.observe(ledger);
}

/* ------------------------------------------------------------------
   Mark that the enhancement layer actually loaded.

   This is set HERE, by the module itself, rather than by an inline script in
   <head>. That distinction matters: if the bundle fails to load — blocked,
   stale cache, old browser, network error — the class is never added, and the
   CSS keeps every .reveal element visible. An inline flag in <head> would lie,
   claiming JS is available when the script that does the revealing never ran.
   ------------------------------------------------------------------ */
document.documentElement.classList.add('js');

correctStaleYearData();
wireReveal();

/* ------------------------------------------------------------------
   Analytics and consent. Last, and deliberately so.

   Both are strictly additive and fail closed: with GA4_MEASUREMENT_ID null —
   which is the current shipping state — initAnalytics() captures UTMs into
   sessionStorage and returns, and mountConsentBar() renders nothing. No
   network request, no cookie, no visible change.

   They run after the content corrections above because nothing here may ever
   delay the page being right. A WhatsApp tap must work whether or not any of
   this executed, which is why track() swallows its own errors rather than
   letting an analytics failure surface as a broken click.
   ------------------------------------------------------------------ */
initAnalytics();
mountConsentBar();
