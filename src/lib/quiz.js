/**
 * Eligibility screening: pure logic. No DOM, no network, fully unit-tested.
 *
 * Scoring follows docs/spec/05-funnel.md:
 *   exit      employment = "no"
 *   high      signals across 2 or more of continuity/credits/deductions AND
 *             never filed before. Same screen as positive; it only marks the
 *             lead she should answer first, and the WhatsApp message makes that
 *             obvious by its content, with no visible tag.
 *   positive  at least one signal
 *   low       no signal at all
 *
 * `answers` shape: { [stepId]: string | string[] }, single steps hold one
 * option id, multi steps an array of option ids.
 */

import { QUIZ_STEPS, QUIZ_WA } from '../content/quiz.js';
import { PHONE_WA } from '../content/site.js';

const stepById = Object.fromEntries(QUIZ_STEPS.map((s) => [s.id, s]));

const asArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

/** Option objects the visitor picked on a step, excluding "none" options. */
export function pickedOptions(answers, stepId) {
  const step = stepById[stepId];
  if (!step) return [];
  const ids = asArray(answers[stepId]);
  return step.options.filter((o) => ids.includes(o.id) && !o.none);
}

/**
 * Toggle an option on a multi step. A "none" option is exclusive: picking it
 * clears the rest, and picking anything else clears it.
 */
export function toggleMulti(current, step, optionId) {
  const option = step.options.find((o) => o.id === optionId);
  if (!option) return asArray(current);
  const ids = asArray(current);
  if (ids.includes(optionId)) return ids.filter((id) => id !== optionId);
  if (option.none) return [optionId];
  const noneIds = step.options.filter((o) => o.none).map((o) => o.id);
  return [...ids.filter((id) => !noneIds.includes(id)), optionId];
}

/** True once the step has an answer, so "next" can be enabled. */
export function isAnswered(answers, step) {
  return asArray(answers[step.id]).length > 0;
}

/** Which steps are actually asked, given answers so far. "no" ends it early. */
export function activeSteps(answers) {
  return answers.employment === 'no' ? [QUIZ_STEPS[0]] : QUIZ_STEPS;
}

export function scoreQuiz(answers) {
  if (answers.employment === 'no') return 'exit';
  const signalSteps = QUIZ_STEPS.filter((s) => s.signal);
  const groupsHit = signalSteps.filter((s) => pickedOptions(answers, s.id).length > 0).length;
  if (groupsHit === 0) return 'low';
  if (groupsHit >= 2 && answers.prior === 'never') return 'high';
  return 'positive';
}

/** On-screen labels of every signal the visitor marked, in question order. */
export function signalLabels(answers) {
  return QUIZ_STEPS.filter((s) => s.signal).flatMap((s) =>
    pickedOptions(answers, s.id).map((o) => o.label),
  );
}

export function hasRoutingFlag(answers) {
  return pickedOptions(answers, 'routing').length > 0;
}

const say = (o) => o.say || o.label;

/**
 * The pre-filled WhatsApp message. Reads as a person writing about their own
 * situation, so she opens the chat already briefed (spec 05, point 4).
 */
export function quizMessage(answers) {
  const result = scoreQuiz(answers);
  if (result === 'exit') return QUIZ_WA.exit;
  if (result === 'low' && !hasRoutingFlag(answers)) return QUIZ_WA.low;

  const lines = [QUIZ_WA.open];
  const employment = pickedOptions(answers, 'employment').find((o) => o.say);
  if (employment) lines.push(employment.say + '.');

  const signals = QUIZ_STEPS.filter((s) => s.signal).flatMap((s) =>
    pickedOptions(answers, s.id).map(say),
  );
  if (signals.length) lines.push(`${QUIZ_WA.marked} ${signals.join(', ')}.`);

  const prior = pickedOptions(answers, 'prior')[0];
  if (prior) lines.push(say(prior) + '.');

  const routing = pickedOptions(answers, 'routing').map(say);
  if (routing.length) lines.push(`${QUIZ_WA.important} ${routing.join(', ')}.`);

  lines.push(QUIZ_WA.closePositive);
  return lines.join('\n');
}

export function quizWhatsAppHref(answers) {
  return `https://wa.me/${PHONE_WA}?text=${encodeURIComponent(quizMessage(answers))}`;
}
