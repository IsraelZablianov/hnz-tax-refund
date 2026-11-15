/**
 * The "remind me in a week" calendar file.
 *
 * WHY THIS EXISTS (behavioural, see docs/behavioral-design.md)
 * -----------------------------------------------------------
 * The visitor this serves already agrees and just isn't going to do it today.
 * That is the commonest way a refund goes unclaimed. A reminder they put in
 * their own calendar, for a specific evening, turns "I should do that" into an
 * appointment. It collects nothing: no form, no number, no cookie. The file
 * downloads and the visitor's calendar app takes it from there.
 *
 * COMPLIANCE: the text states no year, no deadline and no amount. A reminder
 * fires a week after it was saved, and by then a year-specific line could be
 * stale (on 28 December, "2020 is still open" would be false by the time it
 * fires). The page itself carries the dated facts.
 *
 * Format: RFC 5545. CRLF line endings, and lines folded at 75 OCTETS, not
 * characters. Hebrew is two bytes per letter in UTF-8, so folding by
 * characters produces lines Outlook rejects.
 */

const DAYS_AHEAD = 7;
const HOUR = 20; // 20:00, evening, when paperwork actually gets done

/** Israeli civil date (Y, M, D) for `now`, plus `addDays`. */
function israeliDatePlus(now, addDays) {
  const [y, m, d] = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jerusalem',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(now)
    .split('-')
    .map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + addDays));
  return {
    y: t.getUTCFullYear(),
    m: t.getUTCMonth() + 1,
    d: t.getUTCDate(),
  };
}

const pad = (n) => String(n).padStart(2, '0');

/** RFC 5545 TEXT escaping. */
const escapeText = (s) =>
  s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

/** Fold one content line at 75 octets, never splitting a UTF-8 sequence. */
export function foldLine(line) {
  const enc = new TextEncoder();
  const out = [];
  let current = '';
  let bytes = 0;
  for (const ch of line) {
    const n = enc.encode(ch).length;
    // Continuation lines start with a space, which counts toward the 75.
    const limit = out.length === 0 ? 75 : 74;
    if (bytes + n > limit) {
      out.push(current);
      current = '';
      bytes = 0;
    }
    current += ch;
    bytes += n;
  }
  out.push(current);
  return out.join('\r\n ');
}

/**
 * @param {object} o
 * @param {Date}   o.now      the moment of generation
 * @param {string} o.name     her name, for the description
 * @param {string} o.waUrl    plain wa.me link (no prefilled text: keeps it short)
 * @param {string} o.siteUrl  the canonical origin
 * @param {string} o.host     for the UID
 */
export function reminderIcs({ now = new Date(), name, waUrl, siteUrl, host }) {
  const { y, m, d } = israeliDatePlus(now, DAYS_AHEAD);
  const date = `${y}${pad(m)}${pad(d)}`;
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const description =
    `בדיקת זכאות להחזר מס אצל רו״ח ${name}.\n` +
    `וואטסאפ: ${waUrl}\n` +
    `האתר: ${siteUrl}`;

  // Floating local time (no TZID, no Z): fires at 20:00 wherever the device is.
  // For an Israeli audience that is the intent, and it avoids shipping a
  // VTIMEZONE block that some calendar apps parse badly.
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${host}//reminder//HE`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:reminder-${date}@${host}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${date}T${pad(HOUR)}0000`,
    `DTEND:${date}T${pad(HOUR)}3000`,
    `SUMMARY:${escapeText('לבדוק החזר מס')}`,
    `DESCRIPTION:${escapeText(description)}`,
    `URL:${siteUrl}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText('לבדוק החזר מס')}`,
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(foldLine).join('\r\n') + '\r\n';
}

/** ISO date of the Israeli "today", e.g. "2026-11-15". Used to detect staleness. */
export function israeliToday(now = new Date()) {
  const { y, m, d } = israeliDatePlus(now, 0);
  return `${y}-${pad(m)}-${pad(d)}`;
}

export const constants = { DAYS_AHEAD, HOUR };
