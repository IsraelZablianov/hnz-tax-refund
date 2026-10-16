/**
 * Consent notice.
 *
 * A static bar appended at the end of the document — NOT a modal, NOT an
 * overlay, NOT a pop-up. תקנה 2(ב)(4) prohibits pop-ups outright, and beyond
 * the rule, anything that covers the WhatsApp button to ask permission for
 * statistics has its priorities backwards.
 *
 * It renders only when both are true:
 *   1. a GA4 measurement ID exists (today it does not — so this never shows)
 *   2. the visitor has not already chosen
 *
 * Accept and decline are weighted identically. A greyed-out decline is a dark
 * pattern and would fail the "freely given" standard that makes the consent
 * worth anything under תיקון 13.
 */

import { CONSENT } from '../content/copy.js';
import { consentState, grantConsent, denyConsent, isConfigured } from './analytics.js';

export function mountConsentBar() {
  if (!isConfigured() || consentState() !== null) return;

  const bar = document.createElement('div');
  bar.className = 'consent';
  // `region` + label, not `dialog`: it is not modal, it traps nothing, and
  // announcing it as a dialog would imply the visitor must deal with it first.
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', CONSENT.label);

  const text = document.createElement('p');
  text.className = 'consent__text';
  text.textContent = CONSENT.text;

  const actions = document.createElement('div');
  actions.className = 'consent__actions';

  const dismiss = () => bar.remove();

  const accept = document.createElement('button');
  accept.type = 'button';
  accept.className = 'consent__btn consent__btn--accept';
  accept.textContent = CONSENT.accept;
  accept.addEventListener('click', () => {
    grantConsent();
    dismiss();
  });

  const decline = document.createElement('button');
  decline.type = 'button';
  decline.className = 'consent__btn';
  decline.textContent = CONSENT.decline;
  decline.addEventListener('click', () => {
    denyConsent();
    dismiss();
  });

  actions.append(accept, decline);
  bar.append(text, actions);
  document.body.appendChild(bar);
}
