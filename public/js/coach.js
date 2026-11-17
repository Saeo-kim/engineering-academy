// 학습 코치: short messages that react to what just happened (a score, a
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
  return h('aside', { class: 'coach', role: 'note' }, h('span', { class: 'coach-mark', 'aria-hidden': 'true' }, '✎'), h('div', null, h('strong', null, title), h('p', null, body), next && h('p', { class: 'coach-next' }, '다음 한 걸음: ', next)));
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
      `지난번 ${prev}점 → 이번 ${result.score}점 (+${gain})`,
      explain
        ? `다시 읽은 게 아니라 다시 "꺼내 본" 결과입니다. 점수가 오른 만큼 이 개념이 머리에서 꺼낼 수 있는 상태로 바뀌었어요.`
        : `손이 기억하는 부분이 늘었습니다. 같은 코드를 두 번째로 쓸 때 빨라지는 것, 그게 실력이 붙는 감각입니다.`,
      result.passed ? '하루 뒤 Review Center에서 한 번 더 떠올리면 오래 갑니다.' : firstMissed ? `빠진 "${firstMissed}" 하나만 확인하고 한 번 더.` : '한 번 더 시도해 보세요.',
    );
  }
  if (prev !== undefined && result.score <= prev && !result.passed) {
    return coachCard(
      '점수가 그대로이거나 내려갔습니다. 정상입니다.',
      '같은 설명을 한 번 더 읽는 방식이 이 개념에는 안 통한다는 신호예요. 읽는 양을 늘리지 말고 입구를 바꾸세요.',
      firstMissed ? `코드 해부실에서 "${firstMissed}"를 클릭해 한 단계 더 쉬운 설명부터 보기.` : '코드 해부실에서 이 기록의 코드를 한 단어씩 눌러 보기.',
    );
  }
  if (result.passed) {
    return coachCard(
      explain ? '설명할 수 있는 개념이 하나 늘었습니다.' : '보지 않고 다시 만들 수 있게 됐습니다.',
      explain
        ? '시험의 서술형과 면접 질문은 정확히 이 능력을 봅니다. "읽어 본 적 있다"와 "말할 수 있다"는 전혀 다른 단계예요.'
        : '이제 이 코드는 외운 게 아니라 이유를 알고 쓴 코드입니다. AI가 비슷한 코드를 줘도 맞는지 판단할 수 있어요.',
      explain ? 'Rebuild challenge로 손으로도 확인하기.' : '커리큘럼의 다음 항목으로.',
    );
  }
  if (result.score >= 40) {
    return coachCard(
      `${result.score}점: 뼈대는 잡혔습니다.`,
      missed.length ? `빠진 건 ${missed.length}개뿐이에요. 처음부터 다시 볼 필요 없이 그 단어들만 보면 됩니다.` : '거의 다 왔습니다. 표현만 조금 더 구체적으로.',
      firstMissed ? `"${firstMissed}"가 왜 필요한지 한 문장으로 적어 보기.` : '한 번 더 시도.',
    );
  }
  return coachCard(
    '첫 시도에서 낮은 점수는 실패가 아니라 측정입니다.',
    '읽을 때 "안다"고 느낀 것과 덮고 꺼낼 수 있는 것 사이의 차이를 지금 정확히 찾은 거예요. 이 차이를 모르고 시험장에 가는 게 진짜 위험입니다.',
    '기록의 "What is it?" 첫 문장과 비유 하나만 다시 보고, 2분 뒤에 다시 시도.',
  );
}

// Top of the dashboard, from the learning summary.
export function dashboardCoach(data) {
  const { totals, learning } = data;
  if (learning.due > 0) {
    return coachCard(
      `복습할 카드 ${learning.due}장이 기다리고 있습니다.`,
      '잊어버리기 직전에 다시 떠올리는 것이 가장 적은 시간으로 가장 오래 기억하는 방법입니다. 새로 읽는 것보다 효과가 큽니다.',
      h('a', { href: '#/review' }, 'Review Center에서 10분'),
    );
  }
  if (totals.studiedThisWeek === 0) {
    return coachCard(
      '이번 주는 아직 조용합니다.',
      '공부를 다시 시작하는 데 필요한 건 결심이 아니라 아주 작은 첫 동작입니다. 오늘은 한 개념, 25분만.',
      h('a', { href: '#/curriculum' }, '커리큘럼의 "지금 할 것" 열기'),
    );
  }
  const stuck = learning.focus?.[0];
  if (stuck) {
    return coachCard(
      `이번 주 ${totals.studiedThisWeek}번 공부했습니다. 꾸준함은 이미 증명됐어요.`,
      `지금 가장 막혀 있는 건 "${stuck.title}" 입니다. 막힌 곳 하나를 푸는 게 새 개념 세 개보다 시험 점수에 더 큽니다.`,
      h('a', { href: `#/${stuck.kind}/${stuck.id}` }, '그 기록 열기'),
    );
  }
  return coachCard(`이번 주 ${totals.studiedThisWeek}번 공부했습니다.`, '복습할 것도 막힌 것도 없는 상태입니다. 새 개념을 하나 열 때입니다.', h('a', { href: '#/curriculum' }, '커리큘럼'));
}

// After a review session.
export function reviewCoach(tally) {
  const total = Object.values(tally).reduce((a, b) => a + b, 0);
  if (!total) return null;
  const again = tally[1] ?? 0;
  if (again / total > 0.4) {
    return coachCard(`${total}장 중 ${again}장을 다시 봐야 합니다.`, '많이 잊은 날은 복습이 가장 효과적인 날입니다. 오늘 잊은 카드는 내일 다시 나오고, 그때 떠올리면 기억이 훨씬 단단해집니다.', '"다시" 카드 중 하나를 코드 해부실에서 열어 보기.');
  }
  return coachCard(`${total}장 복습 완료, ${total - again}장은 기억하고 있었습니다.`, '복습 간격이 점점 길어지는 카드가 진짜로 내 것이 된 지식입니다.', '오늘은 여기까지 해도 충분합니다.');
}
