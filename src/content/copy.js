/**
 * Refund triggers — "why you overpaid".
 *
 * Written as diagnoses rather than categories: each one names the mechanism,
 * which is both more persuasive and legally safer than implying an outcome.
 *
 * COMPLIANCE: these describe the LAW and general mechanisms. No client results,
 * no amounts attributed to anyone, no promise of a refund. The credit-point
 * figure is a published statutory value, which is why it is permitted.
 */

export const TRIGGERS = [
  {
    name: 'החלפת עבודה',
    why: 'המעסיק החדש מחשב את המדרגות מאפס, וחודשי המעבר משאירים מדרגות נמוכות שלא נוצלו.',
  },
  {
    name: 'שני מעסיקים במקביל',
    why: 'בלי תיאום מס, על המשרה השנייה נוכה מס בשיעור כמעט מקסימלי, בלי נקודות זיכוי.',
  },
  {
    name: 'תקופה בלי עבודה, חל״ת או אבטלה',
    why: 'השכר השנתי בפועל נמוך ממה שההנחה החודשית הניחה, ונקודות הזיכוי לא נוצלו במלואן.',
  },
  {
    name: 'חופשת לידה',
    why: 'נקודות הזיכוי על הילד חלות על כל שנת המס, גם אם הוא נולד בדצמבר.',
  },
  {
    name: 'מילואים ותשלומי ביטוח לאומי',
    why: 'דמי אבטלה, דמי לידה ותגמולי מילואים לא עברו חישוב מול השכר.',
  },
  {
    name: 'תואר או שחרור מצה״ל',
    why: 'נקודות זיכוי שמגיעות בחוק ולא נדרשות אוטומטית. נקודת זיכוי אחת שווה 2,904 ₪ בשנה.',
  },
  {
    name: 'הפקדה עצמאית לקופת גמל או ביטוח חיים',
    why: 'זיכוי לפי סעיף 45א וניכוי לפי סעיף 47. המעסיק לא רואה את ההפקדות האלה.',
  },
  {
    name: 'תרומות למוסד מוכר',
    why: 'זיכוי של 35% מהתרומה לפי סעיף 46, רק בהגשת דוח שנתי.',
  },
  {
    name: 'פיצויי פיטורים או משיכת כספי פנסיה',
    why: 'לעיתים נוכה מס בשיעור מרבי בלי שחושבו הפטור לפי ותק או פריסת המענק.',
  },
];

/**
 * The process. Step 4 is deliberately "only after you approved" — the veto sits
 * with the client, which is the structural answer to the fear of being
 * committed to something they did not see.
 */
export const PROCESS = [
  {
    name: 'שיחה אישית',
    detail: 'מדברים. אני שואלת מה קרה אצלך בשש השנים האחרונות, ולפי זה יודעת אם בכלל שווה לפתוח תיק.',
  },
  {
    name: 'אני אוספת את הנתונים',
    detail: 'טופסי 106 ואישורים. אני מסבירה בדיוק איך מנפיקים אותם מהאזור האישי ברשות המסים, או מנפיקה בשבילך.',
  },
  {
    name: 'בדיקה וסימולציה',
    detail: 'אני מחשבת שנה-שנה ומראה לך את התוצאה הצפויה לפני שמוגש משהו. כולל המקרה שבו לא כדאי להגיש שנה מסוימת.',
  },
  {
    name: 'הגשה רק אחרי אישור',
    detail: 'הדוח מוצג לפני השידור. אני לא משדרת שום דבר שלא ראיתם ואישרתם.',
  },
  {
    name: 'הכסף נכנס',
    detail: 'ישירות מרשות המסים לחשבון הבנק שלך, בתוספת הצמדה וריבית.',
  },
];

/**
 * Pre-filled WhatsApp messages. Zero typing for the first tap.
 *
 * WHY THERE IS MORE THAN ONE
 * --------------------------
 * `wa.me` discards query parameters, so UTMs do not survive the handoff — the
 * lead lands in her inbox with no attribution whatsoever. GA4 records which
 * surface was clicked, but she does not read GA4 while answering messages at
 * 23:00, and GA4 only works once there is consent and a measurement ID.
 *
 * So the message itself carries the signal: each surface opens with naturally
 * different wording, and she can tell at a glance whether someone tapped from
 * the hero, the sticky bar, or after reading the whole page. The last of those
 * is a materially warmer lead and worth answering first.
 *
 * Constraint: these are messages a real person sends about their own money. No
 * tracking codes, no bracketed tokens, nothing that reads as machine output —
 * a visible `[hero]` would undercut the one thing this site is selling.
 */

/** Hero — the visitor acted early, on the deadline alone. */
export const WA_MESSAGE =
  'היי הילה, הגעתי מהאתר. אני שכיר/ה ואני רוצה לבדוק אם מגיע לי החזר מס 🙏';

/** Sticky bar — mid-page, skimming. */
export const WA_MESSAGE_STICKY =
  'היי הילה, אני שכיר/ה ורוצה לבדוק אם מגיע לי החזר מס 🙏';

/** Final CTA — read to the bottom, including the 1.4% section. Warmest. */
export const WA_MESSAGE_FINAL =
  'היי הילה, קראתי את הדף ואני רוצה שנבדוק אילו שנים פתוחות אצלי 🙏';

/** Surface key → message. The key is also the GA4 `surface` event parameter. */
export const WA_MESSAGES = {
  hero: WA_MESSAGE,
  sticky: WA_MESSAGE_STICKY,
  final: WA_MESSAGE_FINAL,
};

/**
 * Consent notice for analytics.
 *
 * NOT a pop-up and NOT a modal — תקנה 2(ב)(4) prohibits those, and this is a
 * static bar at the end of the document that never covers the content or the
 * WhatsApp button. It renders only when a GA4 measurement ID exists and the
 * visitor has not already chosen, which today means it does not render at all.
 *
 * Why it exists: תיקון 13 to חוק הגנת הפרטיות took effect in 2025 and raised
 * the stakes on personal-data handling materially. GA4 sets cookies, so it does
 * not load until someone says yes. Declining is one tap and equally weighted —
 * a greyed-out "no" is a dark pattern and would fail the "freely given" test.
 */
export const CONSENT = {
  text: 'אני משתמשת בסטטיסטיקות שימוש אנונימיות כדי להבין אילו עמודים עוזרים. אין בהן פרטים מזהים.',
  accept: 'אפשר',
  decline: 'לא, תודה',
  label: 'הודעה על סטטיסטיקות שימוש',
};

