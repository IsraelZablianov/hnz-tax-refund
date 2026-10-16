/**
 * Analytics. Consent-gated, no-ops entirely when unconfigured.
 *
 * WHAT THIS SOLVES
 * ----------------
 * The site had no measurement of any kind, which means there is no way to tell
 * whether a lead came from the Google Business Profile, organic search, or her
 * Instagram bio — and no way to see which surface on the page actually produces
 * taps. With paid social prohibited, Google Search ads are the only buyable
 * channel, and running them without conversion tracking is setting money on
 * fire. Tracking therefore has to land before any ad spend.
 *
 * DESIGN CONSTRAINTS, IN PRIORITY ORDER
 * -------------------------------------
 * 1. The WhatsApp link must work even if every line of this file fails. Events
 *    are fire-and-forget and never block, delay or intercept navigation — the
 *    conversion is more important than the record of it.
 * 2. Nothing loads before consent (תיקון 13 to חוק הגנת הפרטיות, in force 2025).
 * 3. No measurement ID → no network, no cookies, no consent bar. Today that is
 *    the shipping state, so the site currently collects nothing at all.
 * 4. No Meta pixel, ever. Paid social is prohibited, so the pixel would collect
 *    data for a channel that cannot be used.
 *
 * WHAT IS DELIBERATELY NOT SENT
 * -----------------------------
 * No `ת.ז.`, no phone number, no name, no free text, no quiz answers. Event
 * parameters are a fixed vocabulary of surfaces and step numbers. If a future
 * event needs a user-supplied value, it does not belong here.
 */

import { GA4_MEASUREMENT_ID } from '../content/site.js';

const CONSENT_KEY = 'hnz-analytics-consent';
const UTM_KEY = 'hnz-utm';
const UTM_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

/** localStorage access that cannot throw — Safari private mode denies writes. */
const safeStore = {
  get(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* ignore — analytics must never break the page */
    }
  },
};

export const isConfigured = () => Boolean(GA4_MEASUREMENT_ID);
export const consentState = () => safeStore.get(CONSENT_KEY); // 'granted' | 'denied' | null

/**
 * Capture UTMs on first landing and keep them for the session.
 *
 * GA4 attributes on its own, but only after consent. These are stored
 * regardless so that a converting visitor's source is still knowable from the
 * first-party record — and critically, the campaign is available to stamp onto
 * events once consent arrives, rather than being lost on the first navigation.
 * sessionStorage, not a cookie: no cross-site identity, expires with the tab.
 */
export function captureUtm() {
  try {
    const params = new URLSearchParams(window.location.search);
    const found = {};
    for (const field of UTM_FIELDS) {
      const value = params.get(field);
      // Bound the length: these land in event parameters, and an unbounded
      // query value is how a crafted URL turns into junk in the reports.
      if (value) found[field] = value.slice(0, 100);
    }
    if (Object.keys(found).length === 0) return readUtm();
    window.sessionStorage.setItem(UTM_KEY, JSON.stringify(found));
    return found;
  } catch {
    return {};
  }
}

export function readUtm() {
  try {
    return JSON.parse(window.sessionStorage.getItem(UTM_KEY) || '{}');
  } catch {
    return {};
  }
}

/* ------------------------------------------------------------------
   GA4 loading. Happens once, only after consent is granted.
   ------------------------------------------------------------------ */

let loaded = false;

function loadGa4() {
  if (loaded || !isConfigured()) return;
  loaded = true;

  window.dataLayer = window.dataLayer || [];
  // Must be `arguments`-based, not a rest parameter: gtag.js reads the live
  // `arguments` object. A spread version pushes the wrong shape and GA4
  // silently drops the hits, which is a genuinely horrible bug to find.
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  gtag('js', new Date());
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'granted',
  });
  gtag('config', GA4_MEASUREMENT_ID, {
    anonymize_ip: true,
    // Paid social is prohibited, so there is no remarketing audience to build.
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
}

/* ------------------------------------------------------------------
   Event queue.

   Events fired before consent are held in memory, not dropped, so a visitor
   who taps WhatsApp and *then* accepts still has that conversion recorded.
   Bounded, because an unbounded queue on a page nobody consents on is a leak.
   ------------------------------------------------------------------ */

const queue = [];
const MAX_QUEUE = 25;

function flush() {
  while (queue.length) {
    const [name, params] = queue.shift();
    window.gtag?.('event', name, params);
  }
}

/**
 * Record an event. Safe to call at any time, in any state.
 *
 * Intentionally returns nothing and never throws: callers are click handlers on
 * the conversion path, and the one unacceptable outcome is analytics breaking a
 * WhatsApp tap.
 */
export function track(name, params = {}) {
  if (!isConfigured()) return;
  try {
    const enriched = { ...readUtm(), ...params };
    if (consentState() === 'granted') {
      loadGa4();
      window.gtag?.('event', name, enriched);
      return;
    }
    if (consentState() === null && queue.length < MAX_QUEUE) {
      queue.push([name, enriched]);
    }
    // 'denied' → dropped, deliberately.
  } catch {
    /* never surface an analytics failure to the visitor */
  }
}

export function grantConsent() {
  safeStore.set(CONSENT_KEY, 'granted');
  loadGa4();
  flush();
}

export function denyConsent() {
  safeStore.set(CONSENT_KEY, 'denied');
  queue.length = 0;
}

/**
 * Wire the conversion events.
 *
 * Uses one delegated listener on the document rather than per-element handlers,
 * so elements injected later by the stale-build correction are covered without
 * re-binding. `capture: true` means the event is seen even if something else
 * stops propagation on the way up.
 *
 * `surface` is read from `data-surface`, which the markup already needs for the
 * per-surface WhatsApp messages — so attribution and copy stay in sync.
 */
export function wireConversionEvents() {
  if (!isConfigured()) return;

  document.addEventListener(
    'click',
    (event) => {
      const link = event.target?.closest?.('a[href]');
      if (!link) return;

      const href = link.getAttribute('href') || '';
      const surface = link.dataset.surface || 'unknown';

      if (href.includes('wa.me')) {
        track('whatsapp_click', { surface });
      } else if (href.startsWith('tel:')) {
        track('call_click', { surface });
      } else if (href.startsWith('mailto:')) {
        track('email_click', { surface });
      } else if (href.includes('gov.il')) {
        // The honest outbound link. Worth knowing how often it is taken —
        // if it is high, the honesty section is doing its job, not leaking.
        track('gov_link_click', { surface });
      }
    },
    { capture: true, passive: true },
  );
}

/** Initialise. Called once from home.js. */
export function initAnalytics() {
  captureUtm();
  if (consentState() === 'granted') loadGa4();
  wireConversionEvents();
}
