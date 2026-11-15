/**
 * Eligibility screening island. Vanilla, no React: the site ships no framework
 * runtime today, and a screening of six tap-only steps does not justify one.
 *
 * MOUNTING
 *   <section id="bdika" class="section" aria-labelledby="quiz-h" data-quiz>
 *     <!-- no-JS fallback, replaced on mount -->
 *     <h2 id="quiz-h">...</h2> <a href="{{WA_HREF_...}}">...</a>
 *   </section>
 *   import { mountQuiz } from './islands/quiz.js';
 *   mountQuiz(document.querySelector('[data-quiz]'), { track });
 *
 * COMPLIANCE
 *   This is an inline section in the page flow. It must NEVER be opened as a
 *   modal, overlay, timed prompt or exit-intent: תקנה 2(ב)(4) prohibits
 *   pop-ups. All copy lives in src/content/quiz.js with its own tripwires.
 *
 * PRIVACY
 *   Answers live in this closure only. Nothing is stored, nothing is sent.
 *   `track` receives step numbers and the result bucket, never an answer.
 */

import '../styles/quiz.css';
import { QUIZ_INTRO, QUIZ_UI, QUIZ_RESULTS } from '../content/quiz.js';
import {
  activeSteps,
  isAnswered,
  toggleMulti,
  scoreQuiz,
  signalLabels,
  hasRoutingFlag,
  quizWhatsAppHref,
} from '../lib/quiz.js';
import { refundWindow } from '../lib/refundWindow.js';
import { PHONE_DISPLAY, PHONE_TEL } from '../content/site.js';

const noop = () => {};

/** Tiny element builder. Text goes through textContent, never innerHTML. */
function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

const bdi = (text) => h('bdi', {}, text);

/**
 * Native replaceChildren() stringifies `false`, so a `cond && h(...)` child
 * rendered the word "false" on screen. Filter like h() does.
 */
const replace = (el, ...children) =>
  el.replaceChildren(...children.flat().filter((c) => c != null && c !== false));

export function mountQuiz(root, { track = noop, now = new Date() } = {}) {
  if (!root) return;

  let answers = {};
  let index = -1; // -1 intro, 0..n-1 steps, n result
  let started = false;
  const uid = `q${Math.random().toString(36).slice(2, 7)}`;

  const safeTrack = (name, params) => {
    try {
      track(name, params);
    } catch {
      /* analytics must never break the screening */
    }
  };

  const card = h('div', { class: 'quiz', 'data-state': 'intro' });
  const live = h('p', { class: 'visually-hidden', 'aria-live': 'polite' });
  root.replaceChildren(card, live);

  function go(next) {
    index = next;
    render();
    // Move focus to the new screen's heading so keyboard and screen-reader
    // users land on the question, not on a button that no longer exists.
    card.querySelector('[data-focus]')?.focus({ preventScroll: true });
    if (card.getBoundingClientRect().top < 0) {
      card.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  }

  function renderIntro() {
    card.dataset.state = 'intro';
    replace(card, 
      h('h2', { class: 'quiz__title', id: `${uid}-h`, tabindex: '-1', 'data-focus': true }, QUIZ_INTRO.title),
      h('p', { class: 'quiz__sub' }, QUIZ_INTRO.sub),
      h(
        'button',
        {
          type: 'button',
          class: 'btn btn--primary quiz__start',
          onclick: () => {
            if (!started) safeTrack('quiz_start');
            started = true;
            go(0);
          },
        },
        QUIZ_INTRO.start,
      ),
    );
  }

  function renderStep() {
    const steps = activeSteps(answers);
    const step = steps[index];
    const total = steps.length;
    const multi = step.type === 'multi';
    const picked = new Set([].concat(answers[step.id] ?? []));
    const name = `${uid}-${step.id}`;

    const options = step.options.map((o) =>
      h(
        'label',
        { class: `quiz__option${o.none ? ' quiz__option--none' : ''}` },
        h('input', {
          type: multi ? 'checkbox' : 'radio',
          name,
          value: o.id,
          checked: picked.has(o.id),
          onchange: () => {
            answers = {
              ...answers,
              [step.id]: multi ? toggleMulti(answers[step.id], step, o.id) : o.id,
            };
            // Re-render keeps "none" exclusivity visible, then restore focus.
            render();
            card.querySelector(`input[value="${o.id}"]`)?.focus();
          },
        }),
        h('span', {}, o.label),
      ),
    );

    const answered = isAnswered(answers, step);
    const fraction = `${Math.round((index / total) * 100)}%`;

    card.dataset.state = 'step';
    replace(card, 
      h(
        'div',
        { class: 'quiz__progress' },
        h('span', { class: 'quiz__count' }, QUIZ_UI.progress(index + 1, total)),
        h(
          'span',
          { class: 'quiz__bar', 'aria-hidden': 'true' },
          h('span', { class: 'quiz__fill', style: `inline-size:${fraction}` }),
        ),
      ),
      h(
        'fieldset',
        { class: 'quiz__step', 'aria-describedby': step.helper ? `${name}-help` : null },
        h('legend', { class: 'quiz__q', tabindex: '-1', 'data-focus': true }, step.question),
        step.helper && h('p', { class: 'quiz__helper', id: `${name}-help` }, step.helper),
        h('div', { class: `quiz__options${multi ? ' quiz__options--multi' : ''}` }, options),
      ),
      h(
        'div',
        { class: 'quiz__nav' },
        h(
          'button',
          {
            type: 'button',
            class: 'btn btn--primary',
            'aria-disabled': answered ? null : 'true',
            onclick: () => {
              if (!isAnswered(answers, step)) {
                live.textContent = QUIZ_UI.pickOne;
                return;
              }
              safeTrack('quiz_step', { step: index + 1 });
              const after = activeSteps(answers);
              go(index + 1 >= after.length ? after.length : index + 1);
            },
          },
          QUIZ_UI.next,
        ),
        h('button', { type: 'button', class: 'quiz__back', onclick: () => go(index - 1) }, QUIZ_UI.back),
      ),
    );
    live.textContent = QUIZ_UI.progress(index + 1, total);
  }

  function renderResult() {
    const result = scoreQuiz(answers);
    const bucket = result === 'high' ? 'positive' : result;
    const copy = QUIZ_RESULTS[bucket];
    const w = refundWindow(now);
    safeTrack(`quiz_result_${bucket}`, result === 'high' ? { high_value: true } : {});

    const flags = bucket === 'positive' ? signalLabels(answers) : [];
    // Past the practical cut-off the expiring year can no longer realistically
    // be filed, so it is not listed as open (same rule as counterHtml).
    const late = w.pastPracticalCutoff;
    const first = w.openYears[late ? 1 : 0];
    const last = w.openYears[w.openYears.length - 1];

    card.dataset.state = 'result';
    card.dataset.result = bucket;
    replace(card, 
      h('h2', { class: 'quiz__title', tabindex: '-1', 'data-focus': true }, copy.title),
      flags.length > 0 &&
        h(
          'div',
          { class: 'quiz__flags' },
          h('p', { class: 'quiz__flags-lead' }, copy.flagsLead),
          h('ul', {}, flags.map((f) => h('li', {}, f))),
        ),
      h('p', { class: 'quiz__body' }, copy.body),
      hasRoutingFlag(answers) && h('p', { class: 'quiz__routing' }, QUIZ_RESULTS.routing),
      bucket !== 'exit' &&
        h(
          'p',
          { class: 'quiz__years' },
          'השנים הפתוחות כרגע: ',
          bdi(`${first}-${last}`),
          '.',
          ...(late
            ? []
            : [' שנת ', bdi(String(w.expiringYear)), ' נסגרת ב-', bdi(w.deadline), '.']),
        ),
      copy.disclaimer && h('p', { class: 'quiz__disclaimer' }, copy.disclaimer),
      h(
        'div',
        { class: 'quiz__cta' },
        h(
          'a',
          {
            class: 'btn btn--primary',
            href: quizWhatsAppHref(answers),
            target: '_blank',
            rel: 'noopener noreferrer',
            'data-surface': 'quiz',
            onclick: () => safeTrack('quiz_to_whatsapp', { result: bucket }),
          },
          copy.cta,
        ),
        copy.ctaNote && h('p', { class: 'quiz__note' }, copy.ctaNote),
        h(
          'p',
          { class: 'quiz__phone' },
          `${QUIZ_RESULTS.phoneLead} `,
          h('a', { href: `tel:${PHONE_TEL}`, 'data-surface': 'quiz' }, bdi(PHONE_DISPLAY)),
        ),
      ),
      h(
        'button',
        {
          type: 'button',
          class: 'quiz__back',
          onclick: () => {
            answers = {};
            go(0);
          },
        },
        QUIZ_UI.restart,
      ),
    );
  }

  function render() {
    const steps = activeSteps(answers);
    if (index < 0) renderIntro();
    else if (index >= steps.length) renderResult();
    else renderStep();
  }

  render();
}
