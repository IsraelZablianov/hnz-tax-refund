/**
 * Hebrew language helpers. Hebrew has grammatical dual and gendered agreement
 * that English-trained templating gets wrong by default, and a visibly wrong
 * plural on a financial site reads as carelessness.
 */

/**
 * Day count with correct Hebrew number agreement.
 *   1  → "יום אחד"      (singular)
 *   2  → "יומיים"        (dual — Hebrew has a distinct dual form)
 *   3+ → "3 ימים"        (plural)
 *   0  → "היום"          (today — the deadline itself)
 */
export function daysPhrase(days) {
  if (days === 0) return 'היום';
  if (days === 1) return 'יום אחד';
  if (days === 2) return 'יומיים';
  return `${days} ימים`;
}

/**
 * "נותרו X" vs "נותר יום אחד" — the verb agrees with the number too.
 */
export function remainingPhrase(days) {
  if (days === 0) return 'היום היום האחרון';
  if (days === 1) return 'נותר יום אחד';
  return `נותרו ${daysPhrase(days)}`;
}

/**
 * Wrap Latin/numeric runs so bidi reordering does not mangle them.
 *
 * This is the single most common RTL bug in Hebrew sites: a phone number
 * rendering as 0369-5555-55, or a date as 2026.12.31 reversed mid-string.
 * Any run of Latin letters, digits, or symbols adjacent to Hebrew needs
 * isolation — use <bdi> in JSX, or this for plain-string contexts.
 */
export const LTR_ISOLATE = '\u2066'; // LEFT-TO-RIGHT ISOLATE
export const POP_ISOLATE = '\u2069'; // POP DIRECTIONAL ISOLATE

export function ltr(text) {
  return `${LTR_ISOLATE}${text}${POP_ISOLATE}`;
}

/** Hebrew month names, for the "last updated" line. */
const MONTHS_HE = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];

export function hebrewMonthYear(date = new Date()) {
  return `${MONTHS_HE[date.getMonth()]} ${date.getFullYear()}`;
}
