/**
 * Eligibility screening: the copy. Spec: docs/spec/05-funnel.md, "The
 * eligibility quiz".
 *
 * COMPLIANCE (docs/spec/02-constraints.md), read before editing:
 *  - Never a shekel amount, a percentage or a probability on any screen.
 *  - Never the word זכאי as a determination about the visitor. The result says
 *    "there are signs worth checking", never "you are entitled".
 *  - No dashes (em or en) anywhere in these strings. CI fails the build.
 *  - Gender-neutral throughout. Answer options are first-person past tense
 *    (החלפתי, נולד לי), which Hebrew does not inflect for gender, and no slash
 *    forms like שכיר/ה. Questions use forms that read the same for everyone.
 *  - Answers never leave the browser except inside the WhatsApp message the
 *    visitor chooses to send. Analytics gets step numbers only.
 *
 * Option `say` is the phrasing used in the pre-filled WhatsApp message, when it
 * differs from the on-screen label. The message is written as the visitor
 * talking about themselves, never as a form dump.
 */

export const QUIZ_INTRO = {
  title: 'בדיקה ראשונית: יש אצלך סימנים להחזר?',
  sub: 'שש שאלות קצרות, בערך דקה. בלי להשאיר פרטים, והתשובות לא נשמרות בשום מקום.',
  start: 'להתחיל',
};

export const QUIZ_STEPS = [
  {
    id: 'employment',
    type: 'single',
    question: 'בשש השנים האחרונות היו לך הכנסות ממשכורת?',
    options: [
      { id: 'all', label: 'כן, בכל השנים' },
      { id: 'partial', label: 'כן, בחלק מהשנים', say: 'הייתה לי משכורת רק בחלק מהשנים' },
      { id: 'both', label: 'גם משכורת וגם הכנסה מעסק', say: 'הייתה לי גם משכורת וגם הכנסה מעסק' },
      { id: 'no', label: 'לא' },
    ],
  },
  {
    id: 'continuity',
    type: 'multi',
    signal: true,
    question: 'קרה אצלך אחד מאלה בשנים האלה?',
    helper: 'אפשר לסמן כמה.',
    options: [
      { id: 'job_change', label: 'החלפתי מקום עבודה' },
      { id: 'two_jobs', label: 'עבדתי בשני מקומות במקביל' },
      { id: 'gap', label: 'הייתה לי תקופה בלי עבודה' },
      { id: 'maternity', label: 'חופשת לידה', say: 'הייתי בחופשת לידה' },
      { id: 'unpaid', label: 'חל״ת', say: 'הייתי בחל״ת' },
      { id: 'retired', label: 'פרשתי או קיבלתי מענק פרישה' },
      { id: 'none', label: 'לא, מעסיק אחד ברצף', none: true },
    ],
  },
  {
    id: 'credits',
    type: 'multi',
    signal: true,
    question: 'ואחד מאלה?',
    helper: 'אפשר לסמן כמה.',
    options: [
      { id: 'degree', label: 'סיימתי תואר' },
      { id: 'discharge', label: 'השתחררתי מצה״ל או משירות לאומי' },
      { id: 'child', label: 'נולד לי ילד' },
      { id: 'aliyah', label: 'עליתי לארץ' },
      { id: 'single_parent', label: 'הורות יחידנית', say: 'אני במשפחה חד הורית' },
      { id: 'periphery', label: 'גרתי ביישוב שמקנה הטבת מס' },
      { id: 'alimony', label: 'שילמתי מזונות' },
      { id: 'none', label: 'אף אחד מאלה', none: true },
    ],
  },
  {
    id: 'deductions',
    type: 'multi',
    signal: true,
    question: 'ומה לגבי דברים שלא עוברים דרך התלוש?',
    helper: 'אפשר לסמן כמה.',
    options: [
      { id: 'reserve', label: 'מילואים', say: 'עשיתי מילואים' },
      { id: 'benefits', label: 'דמי אבטלה או דמי לידה', say: 'קיבלתי דמי אבטלה או דמי לידה' },
      { id: 'pension_self', label: 'הפקדתי מהכיס לקופת גמל או לביטוח חיים' },
      { id: 'donations', label: 'תרמתי למוסד מוכר' },
      { id: 'capital_loss', label: 'היו לי הפסדים בשוק ההון' },
      { id: 'withdrawal', label: 'משכתי כספים מקופת גמל או מפנסיה' },
      { id: 'none', label: 'אף אחד מאלה', none: true },
    ],
  },
  {
    id: 'prior',
    type: 'single',
    question: 'הוגשה בעבר בקשה להחזר מס בשמך?',
    options: [
      { id: 'never', label: 'לא, אף פעם', say: 'עוד לא הגשתי בקשה להחזר מס' },
      { id: 'over_year', label: 'כן, לפני יותר משנה', say: 'הגשתי בקשה להחזר לפני יותר משנה' },
      { id: 'recent', label: 'כן, בשנה האחרונה', say: 'הגשתי בקשה להחזר בשנה האחרונה' },
      { id: 'unknown', label: 'לא ידוע לי', say: 'לא ידוע לי אם הוגשה בעבר בקשה' },
    ],
  },
  {
    id: 'routing',
    type: 'multi',
    question: 'ולפני התוצאה: אחד מהשניים האלה נכון?',
    helper: 'שני מצבים שמשנים את מסלול הטיפול, ועדיף לדעת עליהם עכשיו ולא בסוף.',
    options: [
      { id: 'garnish', label: 'יש עיקול על חשבון הבנק שלי' },
      { id: 'spouse_business', label: 'בן או בת הזוג מגישים דוח שנתי כעצמאים', say: 'בן או בת הזוג שלי מגישים דוח שנתי כעצמאים' },
      { id: 'none', label: 'אף אחד מהשניים', none: true },
    ],
  },
];

export const QUIZ_UI = {
  next: 'הבא',
  back: 'חזרה',
  restart: 'לענות מחדש',
  progress: (n, total) => `שאלה ${n} מתוך ${total}`,
  pickOne: 'צריך לבחור תשובה כדי להמשיך.',
};

/**
 * Result screens. Spec 05: "No number. No percentage. No probability."
 * `years` is filled from refundWindow() at render time, never hardcoded.
 */
export const QUIZ_RESULTS = {
  positive: {
    title: 'לפי התשובות, יש כאן סימנים שכדאי לבדוק לעומק.',
    flagsLead: 'מה שסימנת:',
    body: 'בכל אחד מהמצבים האלה שכירים רבים שילמו מס ביתר. אם זה קרה גם אצלך, ובאיזה סכום, אפשר לדעת רק מהנתונים האמיתיים בטופסי 106 ובתיק שלך ברשות המסים.',
    disclaimer: 'זו אינה חוות דעת מקצועית ואינה התחייבות לקיומו של החזר או לגובהו.',
    cta: 'להמשיך בוואטסאפ עם התשובות',
    ctaNote: 'התשובות כבר כתובות בהודעה, אין צורך להקליד.',
  },
  low: {
    title: 'מהתשובות לא עולים סימנים מובהקים להחזר.',
    body: 'זה לא אומר שאין, כי יש זיכויים שלא שאלנו עליהם. אני מעדיפה לומר את זה מראש ולא לפתוח לך תיק סתם. אם משהו השתנה אצלך ולא ברור אם זה רלוונטי, אפשר לכתוב לי.',
    cta: 'יש לי שאלה בוואטסאפ',
  },
  exit: {
    title: 'החזר מס לשכירים רלוונטי למי שהייתה לו משכורת בשש השנים האחרונות.',
    body: 'אם יש לך שאלה אחרת על מס, אפשר לכתוב לי ואגיד אם זה משהו שאני מטפלת בו.',
    cta: 'לשאול בוואטסאפ',
  },
  routing: 'סימנת מצב שמשנה את מסלול הטיפול. נדבר עליו בשיחה לפני כל צעד.',
  phoneLead: 'או בטלפון:',
};

/** Pre-filled WhatsApp message fragments. First person, no tokens, no tags. */
export const QUIZ_WA = {
  open: 'היי הילה, עשיתי באתר את הבדיקה הראשונית.',
  marked: 'מה שסימנתי:',
  important: 'חשוב לדעת:',
  closePositive: 'אשמח שנבדוק אילו שנים פתוחות אצלי 🙏',
  low: 'היי הילה, עשיתי באתר את הבדיקה ולא סימנתי אף מצב, אבל יש לי שאלה 🙏',
  exit: 'היי הילה, יש לי שאלה על מס 🙏',
};
