// Study coach: short messages that react to what just happened (a score, a
// retry, a review session, a quiet week), never a random quote. Every message
// says what the result means and the one next step.
import { h } from './dom.js';

const KEY = 'ea-coach-last';

function lastScores() {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}');
  } catch {
    return {};
  }
}
function saveScore(key, score) {
  try {
    const all = lastScores();
    all[key] = score;
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* coaching then just skips the comparison */
  }
}

export function coachCard(title, body, next) {
  return h('aside', { class: 'coach', role: 'note' }, h('span', { class: 'coach-mark', 'aria-hidden': 'true' }, '✎'), h('div', null, h('strong', null, title), h('p', null, body), next && h('p', { class: 'coach-next' }, 'Next step: ', next)));
}

// After an explain-back or rebuild attempt.
export function practiceCoach(kind, id, result) {
  const key = `${kind}:${id}:${result.mode}`;
  const prev = lastScores()[key];
  saveScore(key, result.score);
  const missed = result.missed ?? [];
  const firstMissed = missed[0];
  const explain = result.mode === 'explain';

  if (prev !== undefined && result.score > prev) {
    const gain = result.score - prev;
    return coachCard(
      `Last time ${prev} → this time ${result.score} (+${gain})`,
      explain
        ? `You didn't re-read it; you pulled it back out. The higher score means this concept is now something you can recall from memory.`
        : `Your hands remember more now. Writing the same code a second time gets faster; that is how skill builds.`,
      result.passed ? 'Recall it once more in the Review Center tomorrow and it will stick.' : firstMissed ? `Check the missing "${firstMissed}" and try once more.` : 'Try once more.',
    );
  }
  if (prev !== undefined && result.score <= prev && !result.passed) {
    return coachCard(
      'Your score stayed the same or dropped. That is normal.',
      'A signal that re-reading the same explanation is not working for this concept. Do not read more; change the way in.',
      firstMissed ? `In the Code Explainer, click "${firstMissed}" to see a simpler explanation first.` : 'In the Code Explainer, click through this record\'s code one word at a time.',
    );
  }
  if (result.passed) {
    return coachCard(
      explain ? 'You can now explain one more concept.' : 'You can now rebuild it without looking.',
      explain
        ? 'Exam essays and interview questions test exactly this skill. "I have read it" and "I can explain it" are very different stages.'
        : 'This code is no longer memorized; you know why it works. You can judge whether AI-suggested code is right.',
      explain ? 'Confirm it by hand with a Rebuild challenge.' : 'Move on to the next item in the curriculum.',
    );
  }
  if (result.score >= 40) {
    return coachCard(
      `${result.score} points: the skeleton is in place.`,
      missed.length ? `Only ${missed.length} are missing. No need to start over; just review those words.` : 'Almost there. Just make the wording more specific.',
      firstMissed ? `Write one sentence on why "${firstMissed}" is needed.` : 'Try once more.',
    );
  }
  return coachCard(
    'A low score on the first try is a measurement, not a failure.',
    'You have just found the gap between "I think I know it" and "I can recall it with the notes closed." Going into an exam without knowing that gap is the real risk.',
    'Re-read only the first "What is it?" sentence and one analogy, then try again in 2 minutes.',
  );
}

// Top of the dashboard, from the learning summary.
export function dashboardCoach(data) {
  const { totals, learning } = data;
  if (learning.due > 0) {
    return coachCard(
      `${learning.due} review cards are waiting.`,
      'Recalling just before you would forget is the least-time way to remember longest. It works better than re-reading.',
      h('a', { href: '#/review' }, '10 minutes in the Review Center'),
    );
  }
  if (totals.studiedThisWeek === 0) {
    return coachCard(
      'It is quiet this week so far.',
      'Restarting does not need a big decision, just a tiny first step. Today: one concept, 25 minutes.',
      h('a', { href: '#/curriculum' }, 'Open "What to do now" in the curriculum'),
    );
  }
  const stuck = learning.focus?.[0];
  if (stuck) {
    return coachCard(
      `You studied ${totals.studiedThisWeek} times this week. Consistency is already proven.`,
      `The thing you are stuck on most is "${stuck.title}". Solving one sticking point helps your exam score more than three new concepts.`,
      h('a', { href: `#/${stuck.kind}/${stuck.id}` }, 'Open that record'),
    );
  }
  return coachCard(`You studied ${totals.studiedThisWeek} times this week.`, 'Nothing to review and nothing stuck. Time to open a new concept.', h('a', { href: '#/curriculum' }, 'Curriculum'));
}

// After a review session.
export function reviewCoach(tally) {
  const total = Object.values(tally).reduce((a, b) => a + b, 0);
  if (!total) return null;
  const again = tally[1] ?? 0;
  if (again / total > 0.4) {
    return coachCard(`${again} of ${total} cards need another look.`, 'Days with many misses are the most useful review days. Cards you forget today come back tomorrow, and recalling them then makes memory much stronger.', 'Open one of the "Again" cards in the Code Explainer.');
  }
  return coachCard(`${total} cards reviewed; ${total - again} were remembered.`, 'Cards whose review gaps keep growing are the knowledge that is truly yours.', 'Stopping here for today is enough.');
}
