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

import { refundWindow } from './lib/refundWindow.js';
import { counterHtml, ledgerRowsHtml } from './lib/render.js';
import { reminderIcs, israeliToday } from './lib/reminder.js';
import { NAME_HE, PHONE_WA } from './content/site.js';
import { ORIGIN, ORIGIN_HOST } from './lib/urls.js';
import { initAnalytics, track } from './lib/analytics.js';
import { mountQuiz } from './islands/quiz.js';
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

  // The counter and the ledger both change DAILY, so both are always
  // re-rendered from the visitor's own date. They come from the same functions
  // the build uses (src/lib/render.js), so the two can never disagree. The
  // ledger used to be refreshed only on a year rollover, which left a build
  // from 17 October showing "75 days" under a hero counter that said 46.
  const counter = document.querySelector('[data-days-counter]');
  if (counter) counter.innerHTML = counterHtml(w);

  const body = document.querySelector('[data-ledger-body]');
  if (body) body.innerHTML = ledgerRowsHtml(w);

  // Whole-year rollover: every other year reference on the page. These carry
  // data attributes in index.html precisely so this can find them. The meta
  // description and JSON-LD cannot be fixed from here, which is why the deploy
  // also rebuilds daily.
  const fill = (selector, value) =>
    document.querySelectorAll(selector).forEach((el) => {
      el.textContent = String(value);
    });
  fill('[data-closed-year]', w.lastClosedYear);
  fill('[data-expiring-year]', w.expiringYear);
  fill('[data-current-year]', w.currentYear);
  fill('[data-deadline]', w.deadline);
}

/* ------------------------------------------------------------------
   Reminder link. The static /reminder.ics is dated build day + 7. If the
   deploy is older than today (the daily rebuild failed or was disabled), a
   reminder could land in the past, so regenerate it in the browser. Only
   when stale: the static file is the path iOS Safari handles most reliably.
   ------------------------------------------------------------------ */
function correctStaleReminder() {
  const link = document.querySelector('[data-reminder]');
  if (!link || link.dataset.built === israeliToday()) return;
  const ics = reminderIcs({
    name: NAME_HE,
    waUrl: `https://wa.me/${PHONE_WA}`,
    siteUrl: ORIGIN,
    host: ORIGIN_HOST,
  });
  link.href = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
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
correctStaleReminder();
wireReveal();

// The eligibility quiz. Replaces the no-JS WhatsApp fallback inside the
// section. track() fails closed while GA4_MEASUREMENT_ID is null.
const quizRoot = document.querySelector('[data-quiz]');
if (quizRoot) mountQuiz(quizRoot, { track });

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
