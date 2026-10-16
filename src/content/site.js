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

/**
 * Canonical origin. Resolved (was open-question-7): the site ships on the
 * `tax.` subdomain, which is what `public/CNAME` serves and what GitHub Pages
 * has an HTTPS certificate for. `card.hnz-cpa.com` is her separate business
 * card; the apex is still the Wix page.
 *
 * One host, no exceptions — canonicals, sitemap, JSON-LD @ids and og:url all
 * derive from this constant. Mixed hosts create accidental duplicates.
 */
export const SITE_URL = 'https://tax.hnz-cpa.com';

/** og:site_name and the web manifest name. */
export const SITE_NAME_HE = 'החזרי מס לשכירים — רו״ח הילה נח זבליאנוב';
export const SITE_SHORT_NAME_HE = 'החזרי מס · רו״ח הילה';

/**
 * The service, and its mandatory classification.
 *
 * תקנה 2(ג)(4) requires advertising to distinguish ראיית חשבון from
 * עיסוקים נלווים. Filing a טופס 135 refund claim is NOT ראיית חשבון — that
 * term is statutorily reserved, and tax filing is not reserved to CPAs.
 * So it is labelled שירות נלווה, everywhere, in visible copy and in schema.
 */
export const SERVICE_HE = 'החזרי מס לשכירים';
export const SERVICE_CLASS_HE = 'שירות נלווה';

/**
 * areaServed for the business node. Deliberately short: five named localities
 * plus the metro. Over-broad service areas dilute local relevance for no gain
 * (docs/spec/07-seo.md), and this list must stay recognisable as the same set
 * the footer shows.
 */
export const AREA_SERVED_HE = [...SERVICE_AREAS_HE, 'גוש דן'];

/** Social profiles, as a flat list for schema `sameAs`. */
export const SAME_AS = Object.values(SOCIAL);

/** Open Graph card. Regenerate with public/og-image.html — see README. */
export const OG_IMAGE_PATH = '/og-image.png';
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/** Accessibility statement. Legally required — תקן ת"י 5568. */
export const ACCESSIBILITY_SLUG = 'נגישות';
export const ACCESSIBILITY_TITLE_HE = 'הצהרת נגישות';

/**
 * Date the accessibility statement was last reviewed, ISO-8601.
 *
 * This one date IS hardcoded, and that is correct: a statement of accessibility
 * conformance is a claim about a specific review on a specific day. Deriving it
 * from the build clock would silently re-date the claim on every deploy and
 * assert a review that never happened.
 */
export const ACCESSIBILITY_REVIEWED = '2026-10-16';
