// Builders for the Project Structure & File Literacy course. Every lesson is
// made from the same six questions, so no lesson can skip one:
//   1. What is it?
//   2. Why does it exist?
//   3. Why is it located here?
//   4. What happens if it is missing?
//   5. How does it connect to other files and folders?
//   6. Where is it used in a real project?

export const QUESTIONS = [
  ['what', '1. What is it?'],
  ['why', '2. Why does it exist?'],
  ['where', '3. Why is it located here?'],
  ['missing', '4. What happens if it is missing?'],
  ['connects', '5. How does it connect to other files and folders?'],
  ['usage', '6. Where is it used in a real project?'],
];

// `answers` holds one short text per question, keyed as in QUESTIONS.
// `extra` adds the optional parts: key terms, a folder/code example, a small
// exercise and knowledge checks.
export function lesson(id, title, minutes, summary, answers, extra = {}) {
  for (const [key] of QUESTIONS) {
    if (!answers[key]) throw new Error(`lesson ${id} is missing "${key}"`);
  }
  return {
    id,
    title,
    minutes,
    summary,
    why: answers.why,
    objectives: extra.objectives ?? [`Explain "${title}" in one sentence.`, `Point to where this item lives in a project and what it does.`],
    sections: QUESTIONS.map(([key, heading]) => ({ heading, body: answers[key] })),
    keyTerms: extra.keyTerms ?? [],
    example: extra.example ?? '',
    practice: extra.practice ?? '',
    knowledgeCheck: extra.check ?? [],
    videoQuery: extra.videoQuery ?? `${title} project structure explained beginner`,
  };
}

// Module wrapper with a hands-on project at the end.
export function moduleOf(id, title, level, summary, objectives, lessons, project) {
  return { id, title, level, summary, objectives, lessons, project };
}
