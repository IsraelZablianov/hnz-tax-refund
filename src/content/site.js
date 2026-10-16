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
 * DECIDED (17 Oct 2026): the licence number is NOT published on this site.
 *
 * This is a settled client decision, not a missing asset — do not add a TODO,
 * do not prompt for it, and do not emit a placeholder. Everything that consumes
 * it already degrades gracefully: the credentials block omits the line, and the
 * Person schema omits the `identifier` property.
 *
 * Context for anyone revisiting this: the number IS public (searchable by name
 * in the משרד המשפטים CPA register), and publishing it was identified in
 * research as the strongest available trust signal. The owner nonetheless
 * prefers not to display it. Respect that unless she says otherwise.
 *
 * Consequence: the trust engine rests instead on her name and photograph,
 * seniority since 2018, degree and institution, the transparency of the stated
 * process, and the honest-disclosure block. See docs/spec/02-constraints.md.
 */
export const LICENCE_NUMBER = null;

/**
 * The public register. Retained for schema `recognizedBy` only — per the
 * owner's decision this is NOT surfaced as a visible link in the UI.
 */
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
export const SITE_NAME_HE = 'החזרי מס לשכירים | רו״ח הילה נח זבליאנוב';
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

/**
 * GA4 measurement ID.
 *
 * TODO(open-question-10): pending from Hila — she has to create the property.
 *
 * `null` is a working state, not a broken one: the analytics module no-ops and
 * the consent bar never renders, so the site ships collecting nothing. The
 * moment a real `G-XXXXXXXXXX` lands here, consent-gated GA4 turns on with no
 * other change. Same pattern as LICENCE_NUMBER above — absent beats placeholder.
 */
export const GA4_MEASUREMENT_ID = null;

/**
 * Date this site was first published, ISO-8601, for schema `datePublished`.
 *
 * Hardcoded, and that is correct — same reasoning as ACCESSIBILITY_REVIEWED
 * below. A publication date is a claim about one specific day. Deriving it from
 * the build clock would re-date the site on every deploy and tell crawlers the
 * content is brand new every time, which is both false and an E-E-A-T negative
 * for YMYL content.
 */
export const SITE_PUBLISHED = '2026-10-17';

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
