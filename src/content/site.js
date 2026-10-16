/**
 * Canonical business facts. Nothing in this file may be hardcoded elsewhere.
 *
 * Why this is centralised: NAP (name / address / phone) consistency is an
 * entity-resolution signal for local search, and the licence number is the
 * site's strongest trust element. Both must be identical everywhere they appear,
 * including in JSON-LD. One source, no drift.
 */

export const NAME_HE = 'הילה נח זבליאנוב';
export const NAME_EN = 'Hila Noah Zablianov';
export const TITLE_HE = 'רואת חשבון'; // feminine form — deliberate, see docs/spec/07-seo.md
export const TITLE_SHORT = 'רו״ח'; // gershayim U+05F4, one form site-wide

/** Licensed since this year. A permitted fact under תקנה 2(ג)(3). */
export const LICENSED_SINCE = 2018;

/**
 * TODO(open-question-1): licence number, pending from Hila.
 * Highest-value trust element available and it costs nothing.
 * Until it arrives, the credential block renders without it rather than
 * rendering a placeholder — structured data must match visible content.
 */
export const LICENCE_NUMBER = null;

/** The public register, so visitors can verify the licence themselves. */
export const LICENCE_REGISTER_URL =
  'https://www.gov.il/he/departments/dynamiccollectors/cpa-search';

export const DEGREE_HE = 'תואר ראשון במנהל עסקים וראיית חשבון';
export const INSTITUTION_HE = 'הקריה האקדמית אונו';

export const PHONE_DISPLAY = '055-5582369';
export const PHONE_TEL = '+972555582369'; // E.164 for href
export const PHONE_WA = '972555582369'; // wa.me form
export const EMAIL = 'hila@hnz-cpa.com'; // note: the Wix site has a typo'd variant

export const CITY_HE = 'חולון';

/**
 * Service-area business: the address is deliberately NOT published.
 * Home office without permanent signage is not eligible as a storefront,
 * and publishing a residential address risks profile suspension.
 * Schema omits streetAddress to match. See docs/spec/07-seo.md.
 */
export const SERVICE_AREAS_HE = [
  'חולון',
  'בת ים',
  'ראשון לציון',
  'תל אביב-יפו',
  'אזור',
];

export const SOCIAL = {
  instagram: 'https://www.instagram.com/hila_noah_zablianov/',
  facebook: 'https://www.facebook.com/hylh.nh/',
};

/** Official sources we cite. Linking these out is an E-E-A-T asset, not a leak. */
export const GOV_LINKS = {
  refundForm135: 'https://www.gov.il/he/service/itc135',
  eligibilitySimulator: 'https://www.gov.il/he/service/simulator-employee',
  taxCreditCalculator: 'https://www.gov.il/he/service/tax-credit',
};

export const SITE_URL = 'https://hnz-cpa.com'; // TODO(open-question-7): confirm subdomain
