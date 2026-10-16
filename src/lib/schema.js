/**
 * JSON-LD. Built from src/content, never hand-written into a template.
 *
 * WHY A GRAPH AND NOT SEPARATE BLOCKS
 * -----------------------------------
 * One `@graph` with stable `@id`s lets every node reference the business by id
 * instead of restating it. When the /אודות page ships it points at
 * `{ORIGIN}/#business` rather than duplicating the organisation — duplicated
 * entities with slightly different values are how a knowledge-graph entity gets
 * split in two, which is the opposite of what this markup is for.
 *
 * COMPLIANCE — this file is as regulated as the visible copy
 * ---------------------------------------------------------
 * Schema is advertising. Everything prohibited in the HTML is prohibited here:
 *
 *   - NO `Review` / `AggregateRating`. Categorically ineligible for
 *     LocalBusiness subtypes anyway, and prohibited by the conduct rules.
 *   - NO `priceSpecification`, `offers.price`, `feesAndCommissionsSpecification`.
 *     There is no fee to publish — תקנה 2(ג)(14).
 *   - NO `FAQPage` (rich result removed May 2026) and NO `HowTo` (deprecated
 *     2023). Dead markup that only adds weight.
 *   - The licence number appears ONLY if it is also visible on the page.
 *     Structured data must match rendered content; see buildCredentials().
 *   - `priceRange: "₪₪"` is a category band, not a fee. Permitted.
 *
 * `streetAddress` is deliberately absent: she is a service-area business with a
 * hidden address, and schema must match what the Google Business Profile shows.
 * This FAILS the Rich Results Test, which requires `address` for the rich
 * result. That is the correct, deliberate trade-off — see docs/spec/07-seo.md.
 * Do not "fix" it by inventing an address.
 */

import {
  NAME_HE,
  NAME_EN,
  TITLE_HE,
  LICENSED_SINCE,
  LICENCE_NUMBER,
  INSTITUTION_HE,
  PHONE_TEL,
  EMAIL,
  CITY_HE,
  AREA_SERVED_HE,
  SAME_AS,
  SITE_NAME_HE,
  SERVICE_HE,
  SERVICE_CLASS_HE,
  OG_IMAGE_PATH,
  OG_IMAGE_WIDTH,
  OG_IMAGE_HEIGHT,
  SITE_PUBLISHED,
  LICENCE_REGISTER_URL,
} from '../content/site.js';
import { absoluteUrl, ORIGIN } from './urls.js';

/** Stable node ids. Referenced across pages, so they must never be rewritten. */
export const NODE = {
  business: `${ORIGIN}/#business`,
  person: `${ORIGIN}/#hila`,
  website: `${ORIGIN}/#website`,
  service: `${ORIGIN}/#service-tax-refund`,
  logo: `${ORIGIN}/#logo`,
};

const imageNode = () => ({
  '@type': 'ImageObject',
  '@id': NODE.logo,
  url: absoluteUrl(OG_IMAGE_PATH),
  width: OG_IMAGE_WIDTH,
  height: OG_IMAGE_HEIGHT,
  caption: `${NAME_HE}, ${TITLE_HE}`,
});

/**
 * The person node.
 *
 * `hasCredential` produces no rich result; its value is entity understanding
 * and AI citation. `recognizedBy` names מועצת רואי החשבון as the issuing
 * authority, which is the fact that makes the credential verifiable.
 */
function personNode() {
  const credential = {
    '@type': 'EducationalOccupationalCredential',
    credentialCategory: 'רישיון רואה חשבון',
    recognizedBy: {
      '@type': 'GovernmentOrganization',
      name: 'מועצת רואי החשבון בישראל',
      url: LICENCE_REGISTER_URL,
    },
    // The year she was licensed is a permitted fact under תקנה 2(ג)(3).
    dateCreated: String(LICENSED_SINCE),
  };

  // Only ever emitted alongside the visible number. See the header note.
  if (LICENCE_NUMBER) credential.identifier = String(LICENCE_NUMBER);

  return {
    '@type': 'Person',
    '@id': NODE.person,
    name: NAME_HE,
    alternateName: NAME_EN,
    jobTitle: TITLE_HE,
    description: `${TITLE_HE} מוסמכת משנת ${LICENSED_SINCE}, מתמחה ב${SERVICE_HE}.`,
    image: { '@id': NODE.logo },
    telephone: PHONE_TEL,
    email: EMAIL,
    url: ORIGIN,
    knowsLanguage: ['he', 'en'],
    hasCredential: credential,
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: INSTITUTION_HE,
    },
    worksFor: { '@id': NODE.business },
    sameAs: SAME_AS,
  };
}

/**
 * The business node.
 *
 * `["AccountingService", "ProfessionalService"]` — AccountingService is the most
 * specific LocalBusiness subtype available and the one that matches her primary
 * GBP category.
 */
function businessNode() {
  return {
    '@type': ['AccountingService', 'ProfessionalService'],
    '@id': NODE.business,
    name: NAME_HE,
    alternateName: SITE_NAME_HE,
    description:
      `${TITLE_HE} מוסמכת משנת ${LICENSED_SINCE}. ${SERVICE_HE} (${SERVICE_CLASS_HE}) ` +
      'והכנת דוחות מס. הטיפול כולו מרחוק.',
    url: ORIGIN,
    telephone: PHONE_TEL,
    email: EMAIL,
    image: { '@id': NODE.logo },
    logo: { '@id': NODE.logo },
    founder: { '@id': NODE.person },
    employee: { '@id': NODE.person },
    foundingDate: String(LICENSED_SINCE),
    // Service-area business: locality and country only, no streetAddress.
    address: {
      '@type': 'PostalAddress',
      addressLocality: CITY_HE,
      addressCountry: 'IL',
    },
    areaServed: AREA_SERVED_HE.map((name) => ({ '@type': 'City', name })),
    // A category band, not a fee. No percentage, no amount, no range in ₪.
    priceRange: '₪₪',
    currenciesAccepted: 'ILS',
    knowsLanguage: ['he', 'en'],
    sameAs: SAME_AS,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'שירותים',
      itemListElement: [
        {
          '@type': 'Offer',
          // NOTE: no `price`, no `priceSpecification`. Deliberate — see header.
          itemOffered: { '@id': NODE.service },
        },
      ],
    },
  };
}

/**
 * The service node.
 *
 * `serviceType` carries the mandatory ancillary-service classification, so the
 * תקנה 2(ג)(4) distinction between ראיית חשבון and a שירות נלווה survives into
 * the structured data and not just the visible copy.
 */
function serviceNode() {
  return {
    '@type': 'Service',
    '@id': NODE.service,
    name: SERVICE_HE,
    serviceType: `${SERVICE_HE} (${SERVICE_CLASS_HE})`,
    description:
      'בדיקת זכאות להחזר מס לשכירים והגשת דוחות שנתיים לשנות המס הפתוחות, ' +
      'עד שש שנים אחורה לפי סעיף 160 לפקודת מס הכנסה.',
    provider: { '@id': NODE.business },
    areaServed: AREA_SERVED_HE.map((name) => ({ '@type': 'City', name })),
    audience: {
      '@type': 'Audience',
      audienceType: 'שכירים',
    },
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: ORIGIN,
      servicePhone: { '@type': 'ContactPoint', telephone: PHONE_TEL },
    },
  };
}

function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': NODE.website,
    url: ORIGIN,
    name: SITE_NAME_HE,
    inLanguage: 'he-IL',
    publisher: { '@id': NODE.business },
    // No SearchAction: there is no site search, and claiming one is a lie.
  };
}

/**
 * The per-page WebPage node.
 *
 * `dateModified` is the build date, which is honest here precisely because the
 * year-dependent content really is regenerated — the ledger, counter and
 * deadline change with the calendar and the build runs on 1 January.
 * `datePublished` stays fixed; see SITE_PUBLISHED.
 */
function webPageNode({ path, title, description, breadcrumb, buildDate }) {
  const url = absoluteUrl(path);
  const node = {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: title,
    description,
    inLanguage: 'he-IL',
    isPartOf: { '@id': NODE.website },
    about: { '@id': NODE.business },
    primaryImageOfPage: { '@id': NODE.logo },
    datePublished: SITE_PUBLISHED,
    dateModified: buildDate,
    // The named, credentialed author — the top E-E-A-T requirement for YMYL.
    author: { '@id': NODE.person },
    reviewedBy: { '@id': NODE.person },
  };
  if (breadcrumb) node.breadcrumb = { '@id': `${url}#breadcrumb` };
  return node;
}

/**
 * BreadcrumbList. Still rendered by Google, replacing the URL line in results.
 *
 * Omitted entirely on the homepage: a single-item breadcrumb that just says
 * "Home" is noise, and Google ignores it.
 */
function breadcrumbNode({ path, trail }) {
  const url = absoluteUrl(path);
  return {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: trail.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * Build the full graph for a page.
 *
 * @param {object}   page
 * @param {string}   page.path         site-relative path, e.g. '/'
 * @param {string}   page.title        must match the visible <title>
 * @param {string}   page.description  must match the meta description
 * @param {Array}    [page.trail]      breadcrumb trail, omit on the homepage
 * @param {Date}     [page.now]        injectable for deterministic tests
 */
export function pageSchema({ path = '/', title, description, trail, now = new Date() }) {
  const buildDate = now.toISOString().slice(0, 10);
  const hasTrail = Array.isArray(trail) && trail.length > 1;

  const graph = [
    businessNode(),
    personNode(),
    websiteNode(),
    serviceNode(),
    imageNode(),
    webPageNode({ path, title, description, breadcrumb: hasTrail, buildDate }),
  ];

  if (hasTrail) graph.push(breadcrumbNode({ path, trail }));

  return { '@context': 'https://schema.org', '@graph': graph };
}

/**
 * Serialise for embedding in a <script> tag.
 *
 * `<` is escaped to `\u003c` so a stray `</script>` inside any string can never
 * break out of the script element. This is the standard JSON-LD XSS guard and it
 * costs nothing; all content here is ours, but the escape is non-negotiable
 * because one day it might not be.
 */
export function schemaToScript(schema) {
  return JSON.stringify(schema, null, 2).replace(/</g, '\\u003c');
}
