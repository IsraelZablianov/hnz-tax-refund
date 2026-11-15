import { describe, it, expect } from 'vitest';
import { QUIZ_STEPS, QUIZ_INTRO, QUIZ_RESULTS, QUIZ_UI, QUIZ_WA } from '../content/quiz.js';
import {
  scoreQuiz,
  toggleMulti,
  activeSteps,
  signalLabels,
  quizMessage,
  quizWhatsAppHref,
  hasRoutingFlag,
} from './quiz.js';

const step = (id) => QUIZ_STEPS.find((s) => s.id === id);

const base = {
  employment: 'all',
  continuity: ['none'],
  credits: ['none'],
  deductions: ['none'],
  prior: 'never',
  routing: ['none'],
};

describe('scoreQuiz', () => {
  it('exits when there was no salary', () => {
    expect(scoreQuiz({ employment: 'no' })).toBe('exit');
  });
  it('is low when nothing was marked', () => {
    expect(scoreQuiz(base)).toBe('low');
  });
  it('is positive with a single signal', () => {
    expect(scoreQuiz({ ...base, credits: ['degree'] })).toBe('positive');
  });
  it('is high with signals in two groups and no prior filing', () => {
    expect(scoreQuiz({ ...base, continuity: ['job_change'], deductions: ['reserve'] })).toBe('high');
  });
  it('is only positive with two groups if a claim was already filed', () => {
    expect(
      scoreQuiz({ ...base, continuity: ['job_change'], deductions: ['reserve'], prior: 'recent' }),
    ).toBe('positive');
  });
  it('does not count routing answers as refund signals', () => {
    expect(scoreQuiz({ ...base, routing: ['garnish'] })).toBe('low');
  });
});

describe('toggleMulti', () => {
  const s = step('credits');
  it('adds and removes options', () => {
    expect(toggleMulti([], s, 'degree')).toEqual(['degree']);
    expect(toggleMulti(['degree'], s, 'degree')).toEqual([]);
  });
  it('makes "none" exclusive in both directions', () => {
    expect(toggleMulti(['degree', 'child'], s, 'none')).toEqual(['none']);
    expect(toggleMulti(['none'], s, 'child')).toEqual(['child']);
  });
  it('ignores unknown ids', () => {
    expect(toggleMulti(['degree'], s, 'nope')).toEqual(['degree']);
  });
});

describe('activeSteps', () => {
  it('stops after the first question on "no"', () => {
    expect(activeSteps({ employment: 'no' })).toHaveLength(1);
    expect(activeSteps({ employment: 'all' })).toHaveLength(QUIZ_STEPS.length);
  });
});

describe('quizMessage', () => {
  it('writes the marked situations as the visitor speaking', () => {
    const msg = quizMessage({ ...base, continuity: ['job_change'], credits: ['child'], deductions: ['reserve'] });
    expect(msg).toContain('החלפתי מקום עבודה, נולד לי ילד, עשיתי מילואים');
    expect(msg).toContain('עוד לא הגשתי בקשה להחזר מס');
    expect(msg.startsWith(QUIZ_WA.open)).toBe(true);
  });
  it('carries routing flags so she knows before replying', () => {
    const msg = quizMessage({ ...base, credits: ['degree'], routing: ['garnish'] });
    expect(msg).toContain('חשוב לדעת: יש עיקול על חשבון הבנק שלי');
    expect(hasRoutingFlag({ routing: ['garnish'] })).toBe(true);
  });
  it('has short messages for low and exit', () => {
    expect(quizMessage(base)).toBe(QUIZ_WA.low);
    expect(quizMessage({ employment: 'no' })).toBe(QUIZ_WA.exit);
  });
  it('builds a wa.me link with the message encoded', () => {
    const href = quizWhatsAppHref({ ...base, credits: ['degree'] });
    expect(href).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
    expect(decodeURIComponent(href.split('text=')[1])).toContain('סיימתי תואר');
  });
  it('lists on-screen labels for the result screen', () => {
    expect(signalLabels({ ...base, deductions: ['reserve'] })).toEqual(['מילואים']);
  });
});

/**
 * Compliance tripwires on the quiz copy itself. The deploy CI greps built HTML,
 * but the quiz renders client-side, so its strings never reach that grep. These
 * tests are the equivalent net for the island.
 */
describe('quiz copy compliance', () => {
  const allStrings = (() => {
    const out = [];
    const walk = (v) => {
      if (typeof v === 'string') out.push(v);
      else if (typeof v === 'function') out.push(v(1, 6));
      else if (v && typeof v === 'object') Object.values(v).forEach(walk);
    };
    walk([QUIZ_STEPS, QUIZ_INTRO, QUIZ_RESULTS, QUIZ_UI, QUIZ_WA]);
    return out;
  })();
  const text = allStrings.join('\n');

  it('has no em or en dashes', () => {
    expect(text).not.toMatch(/[–—]/);
  });
  it('never uses prohibited words', () => {
    for (const bad of ['חינם', 'מומחה', 'מוביל', 'מובטח', 'לא שילמת', '7 שנים', 'שבע שנים']) {
      expect(text).not.toContain(bad);
    }
  });
  it('never names an amount, percentage or determination of entitlement', () => {
    expect(text).not.toMatch(/₪|%/);
    expect(text).not.toMatch(/(^|[\s,.])(אתה|את|הנך)?\s*זכאי(ת)?([\s,.]|$)/);
  });
  it('uses no slash gender forms', () => {
    expect(text).not.toMatch(/[֐-׿]\/[֐-׿]/);
  });
  it('uses gershayim, never an ASCII quote, inside Hebrew abbreviations', () => {
    expect(text).not.toMatch(/[֐-׿]"[֐-׿]/);
  });
});
