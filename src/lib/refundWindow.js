/**
 * The factual spine of the site. Every year-dependent string derives from here.
 * Nothing about years or deadlines is hardcoded anywhere else.
 *
 * Legal basis — §160(א) לפקודת מס הכנסה:
 *   a refund claim requires the annual return to be filed
 *   "לא יאוחר מתום שש שנים אחריה" — no later than the end of six years
 *   after the tax year in question.
 *
 * Therefore, in calendar year Y:
 *   - claimable tax years are Y-6 … Y-1
 *   - tax year Y-6 expires on 31 December of Y
 *   - tax year Y-7 and earlier are already closed
 *
 * Worked example for 2026: claimable 2020…2025; 2020 expires 31.12.2026;
 * 2019 closed on 31.12.2025.
 *
 * NOTE: this is the income-tax window. National Insurance (ביטוח לאומי) runs a
 * *different and longer* window. Do not conflate them anywhere on the site.
 */

const LOOKBACK_YEARS = 6;
const IL_TIMEZONE = 'Asia/Jerusalem';
const MS_PER_DAY = 86_400_000;

/**
 * Today's civil date in Israel, regardless of the visitor's device timezone.
 * A visitor in Los Angeles must see the same day count as one in Holon, and
 * near midnight on 31 December the counter must not claim a day that has
 * already ended in Israel.
 */
function israeliCivilDate(now) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: IL_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  const [year, month, day] = parts.split('-').map(Number);
  return { year, month, day };
}

/**
 * Days from the Israeli "today" to 31 December of the same year.
 *
 * Both endpoints are converted to UTC midnights before differencing, so this is
 * pure calendar arithmetic: no timezone offset and no DST transition can
 * corrupt it. We only ever care about whole days.
 *
 * Convention: on 31 December this returns 0, and `isLastDay` becomes true.
 * It can never be negative, because 31 December is always >= today within the
 * same calendar year.
 */
function daysUntilYearEnd({ year, month, day }) {
  const today = Date.UTC(year, month - 1, day);
  const yearEnd = Date.UTC(year, 11, 31);
  return Math.round((yearEnd - today) / MS_PER_DAY);
}

/**
 * Days remaining to claim a given tax year, from the Israeli "today".
 * Used to draw each ledger row's bar to scale — the proportion between
 * 2025's full window and 2020's sliver is the page's central argument.
 */
function daysRemainingForTaxYear(taxYear, { year, month, day }) {
  const today = Date.UTC(year, month - 1, day);
  const deadline = Date.UTC(taxYear + LOOKBACK_YEARS, 11, 31);
  return Math.max(0, Math.round((deadline - today) / MS_PER_DAY));
}

/**
 * The practical cut-off for taking on new work for the *expiring* tax year.
 *
 * This exists for a legal reason, not a UX one. The statutory trigger is that
 * the return is FILED — opening a file does not stop the clock. Reconstructing
 * a six-year-old טופס 106 from a possibly-defunct employer takes weeks.
 * Advertising "2020 is still open" in late December, when it cannot realistically
 * be filed in time, risks being misleading under §2(א) חוק הגנת הצרכן.
 *
 * Past this point the messaging stops leading on the expiring year and pivots
 * to the remaining five.
 */
const PRACTICAL_CUTOFF_DAYS = 35;

export function refundWindow(now = new Date()) {
  const today = israeliCivilDate(now);
  const { year } = today;

  const expiringYear = year - LOOKBACK_YEARS;
  const openYears = Array.from(
    { length: LOOKBACK_YEARS },
    (_, i) => expiringYear + i,
  );

  const daysLeft = daysUntilYearEnd(today);

  return {
    /** Calendar year in Israel, e.g. 2026 */
    currentYear: year,
    /** Tax year that expires on 31 December of currentYear, e.g. 2020 */
    expiringYear,
    /** Claimable tax years, ascending, e.g. [2020…2025] */
    openYears,
    /** Most recent tax year that is already closed, e.g. 2019 */
    lastClosedYear: expiringYear - 1,
    /** Display string for the nearest deadline, e.g. "31.12.2026" */
    deadline: `31.12.${year}`,
    /** Whole days to 31 December. 0 on the day itself. Never negative. */
    daysLeft,
    isLastDay: daysLeft === 0,
    /** True when the expiring year can no longer realistically be filed. */
    pastPracticalCutoff: daysLeft < PRACTICAL_CUTOFF_DAYS,
    /** Per-year rows for the ledger, newest first — the render order. */
    ledger: [...openYears].reverse().map((taxYear) => ({
      taxYear,
      deadline: `31.12.${taxYear + LOOKBACK_YEARS}`,
      daysRemaining: daysRemainingForTaxYear(taxYear, today),
      isExpiring: taxYear === expiringYear,
    })),
  };
}

/**
 * Proportional bar widths for the ledger, as percentages of the widest row.
 * Keeping this beside the window logic means the visual claim and the factual
 * claim can never drift apart.
 */
export function ledgerBarWidths(window_) {
  const max = Math.max(...window_.ledger.map((r) => r.daysRemaining), 1);
  return window_.ledger.map((row) => ({
    ...row,
    widthPercent: Math.max(1, Math.round((row.daysRemaining / max) * 100)),
  }));
}

export const constants = { LOOKBACK_YEARS, PRACTICAL_CUTOFF_DAYS, IL_TIMEZONE };
