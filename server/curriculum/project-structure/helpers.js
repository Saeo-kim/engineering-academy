// Builders for the Project Structure & File Literacy course. Every lesson is
// made from the same six questions, so no lesson can skip one:
//   1. 무엇인가 / What is it?
//   2. 왜 존재하는가 / Why does it exist?
//   3. 왜 이 위치에 있는가 / Why is it located here?
//   4. 없으면 어떻게 되나 / What happens if it is missing?
//   5. 다른 파일·폴더와 어떻게 연결되나 / How does it connect?
//   6. 실제 프로젝트에서 어디에 쓰이나 / Where is it used in a real project?

export const QUESTIONS = [
  ['what', '1. 무엇인가 · What is it?'],
  ['why', '2. 왜 존재하는가 · Why does it exist?'],
  ['where', '3. 왜 이 위치에 있는가 · Why is it located here?'],
  ['missing', '4. 없으면 어떻게 되나 · What happens if it is missing?'],
  ['connects', '5. 다른 파일·폴더와 어떻게 연결되나 · How does it connect?'],
  ['usage', '6. 실제 프로젝트에서 어디에 쓰이나 · Where is it used in a real project?'],
];

// `answers` holds one short Korean text per question, keyed as in QUESTIONS.
// `extra` adds the optional parts: key terms, a folder/code example, a small
// exercise and knowledge checks.
export function lesson(id, title, titleKo, minutes, summary, answers, extra = {}) {
  for (const [key] of QUESTIONS) {
    if (!answers[key]) throw new Error(`lesson ${id} is missing "${key}"`);
  }
  return {
    id,
    title: `${title} · ${titleKo}`,
    minutes,
    summary,
    why: answers.why,
    objectives: extra.objectives ?? [`${title}를 한 문장으로 설명할 수 있다.`, `이 항목이 프로젝트에서 어디에 있고 무엇을 하는지 가리킬 수 있다.`],
    sections: QUESTIONS.map(([key, heading]) => ({ heading, body: answers[key] })),
    keyTerms: extra.keyTerms ?? [],
    example: extra.example ?? '',
    practice: extra.practice ?? '',
    knowledgeCheck: extra.check ?? [],
    videoQuery: extra.videoQuery ?? `${title} project structure explained beginner`,
  };
}

// Module wrapper with a hands-on project at the end.
export function moduleOf(id, title, titleKo, level, summary, objectives, lessons, project) {
  return { id, title: `${title} · ${titleKo}`, level, summary, objectives, lessons, project };
}
