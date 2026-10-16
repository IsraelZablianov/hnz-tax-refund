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
    why: 'נקודות הזיכוי על הילד חלות על כל שנת המס — גם אם הוא נולד בדצמבר.',
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
    why: 'זיכוי לפי סעיף 45א וניכוי לפי סעיף 47 — המעסיק לא רואה את ההפקדות האלה.',
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
    name: 'הגשה — רק אחרי שאישרת',
    detail: 'אתה רואה את הדוח לפני השידור. אני לא משדרת שום דבר שלא ראית ואישרת.',
  },
  {
    name: 'הכסף נכנס',
    detail: 'ישירות מרשות המסים לחשבון הבנק שלך, בתוספת הצמדה וריבית.',
  },
];

/** Pre-filled WhatsApp message. Zero typing for the first tap. */
export const WA_MESSAGE =
  'היי הילה, הגעתי מהאתר. אני שכיר/ה ואני רוצה לבדוק אם מגיע לי החזר מס 🙏';
