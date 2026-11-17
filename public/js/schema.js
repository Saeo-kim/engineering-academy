// Describes how each record type is presented and edited.

export const KIND_UI = {
  knowledge: {
    label: 'Knowledge',
    singular: 'knowledge entry',
    plural: 'knowledge entries',
    heading: 'Knowledge Library',
    intro: 'Concepts explained in your own words: what they are, why they matter, and how they work.',
    emptyHint: 'Capture a note or an AI explanation, then work through what, why, and how.',
    relatedLabel: 'Related knowledge',
    progressFields: ['what_is_it', 'why_needed', 'how_it_works', 'real_example', 'exercise'],
    sections: [
      { field: 'content', label: 'Captured content', captured: true },
      { field: 'what_is_it', label: 'What is it?', prompt: 'Define it in one or two sentences, as if to a new teammate.' },
      { field: 'why_needed', label: 'Why is it needed?', prompt: 'What problem would you have without it?' },
      { field: 'how_it_works', label: 'How does it work?', prompt: 'Walk through the mechanism step by step.' },
      { field: 'real_example', label: 'Real-world example', prompt: 'Where did you meet this in a real project?' },
      { field: 'exercise', label: 'Practical exercise', prompt: 'What could you do to prove you understand it?' },
    ],
    form: [
      { group: 'Capture' },
      { name: 'title', label: 'Title', required: true },
      { name: 'capture_type', label: 'Type', type: 'captureType', half: true },
      { name: 'category', label: 'Category', type: 'category', half: true },
      { name: 'tags', label: 'Tags', type: 'tags', half: true },
      { name: 'entry_date', label: 'Date', type: 'date', half: true },
      { name: 'content', label: 'Captured content', type: 'code', rows: 6 },
      { group: 'Understanding', note: 'Use ``` for code blocks and backticks for inline code.' },
      { name: 'what_is_it', label: 'What is it?', type: 'textarea' },
      { name: 'why_needed', label: 'Why is it needed?', type: 'textarea' },
      { name: 'how_it_works', label: 'How does it work?', type: 'textarea', rows: 6 },
      { name: 'real_example', label: 'Real-world example', type: 'textarea', rows: 5 },
      { name: 'exercise', label: 'Practical exercise', type: 'textarea' },
      { name: 'links', label: 'Related knowledge', type: 'links' },
    ],
  },
  commands: {
    label: 'Command',
    singular: 'command',
    plural: 'commands',
    heading: 'Command Library',
    intro: 'Commands worth keeping, with what they do and how they go wrong.',
    emptyHint: 'Save a command the next time you have to look one up twice.',
    relatedLabel: 'Related concepts',
    progressFields: ['purpose', 'explanation', 'expected_output', 'common_mistakes'],
    sections: [
      { field: 'command', label: 'Command', mode: 'code', copy: true },
      { field: 'purpose', label: 'Purpose', prompt: 'When would you reach for this?' },
      { field: 'explanation', label: 'Explanation', prompt: 'What does each part of the command do?' },
      { field: 'expected_output', label: 'Expected output', mode: 'code', prompt: 'What does success look like?' },
      { field: 'common_mistakes', label: 'Common mistakes', prompt: 'How could this go wrong?' },
    ],
    form: [
      { name: 'title', label: 'Title', required: true },
      { name: 'command', label: 'Command', type: 'code', required: true, rows: 3 },
      { name: 'category', label: 'Category', type: 'category', third: true },
      { name: 'tags', label: 'Tags', type: 'tags', third: true },
      { name: 'entry_date', label: 'Date', type: 'date', third: true },
      { name: 'purpose', label: 'Purpose', type: 'textarea', rows: 2 },
      { name: 'explanation', label: 'Explanation', type: 'textarea' },
      { name: 'expected_output', label: 'Expected output', type: 'code', rows: 3 },
      { name: 'common_mistakes', label: 'Common mistakes', type: 'textarea' },
      { name: 'links', label: 'Related concepts', type: 'links' },
    ],
  },
  errors: {
    label: 'Error',
    singular: 'error record',
    plural: 'error records',
    heading: 'Error Archive',
    intro: 'Each failure traced from the original message to a verified fix.',
    emptyHint: 'The next error you hit is worth recording, especially once you fix it.',
    relatedLabel: 'Related records',
    progressFields: ['root_cause', 'investigation', 'solution', 'files_affected', 'verification', 'lessons'],
    numbered: true,
    sections: [
      { field: 'error_message', label: 'Original error message', mode: 'code', tone: 'danger' },
      { field: 'root_cause', label: 'Root cause', prompt: 'Why did this really happen, beneath the symptom?' },
      { field: 'investigation', label: 'Investigation process', prompt: 'What did you check, in what order, and what did it show?' },
      { field: 'solution', label: 'Solution', prompt: 'What exact change fixed it? This record stays Open until you fill this in.' },
      { field: 'files_affected', label: 'Files affected', mode: 'code', prompt: 'Which files changed?' },
      { field: 'verification', label: 'Verification result', prompt: 'How did you prove the fix worked?' },
      { field: 'lessons', label: 'Lessons learned', prompt: 'What will you do differently next time?' },
    ],
    form: [
      { name: 'title', label: 'Title', required: true },
      { name: 'error_message', label: 'Original error message', type: 'code', required: true, rows: 6 },
      { name: 'category', label: 'Category', type: 'category', third: true },
      { name: 'tags', label: 'Tags', type: 'tags', third: true },
      { name: 'entry_date', label: 'Date', type: 'date', third: true },
      { name: 'root_cause', label: 'Root cause', type: 'textarea' },
      { name: 'investigation', label: 'Investigation process', type: 'textarea', rows: 6 },
      { name: 'solution', label: 'Solution', type: 'textarea' },
      { name: 'files_affected', label: 'Files affected', type: 'code', rows: 3 },
      { name: 'verification', label: 'Verification result', type: 'textarea' },
      { name: 'lessons', label: 'Lessons learned', type: 'textarea' },
      { name: 'links', label: 'Related records', type: 'links' },
    ],
  },
};

KIND_UI.workflows = {
  label: 'Workflow',
  singular: 'workflow',
  plural: 'workflows',
  heading: 'Workflows',
  intro: 'Repeatable implementation procedures: the goal, the steps in order, and how to prove they worked.',
  emptyHint: 'Write down the next procedure you had to piece together from several sources.',
  relatedLabel: 'Related records',
  progressFields: ['goal', 'prerequisites', 'verification', 'pitfalls'],
  numbered: true,
  sections: [
    { field: 'goal', label: 'Goal', prompt: 'What does this workflow achieve, and when do you use it?' },
    { field: 'prerequisites', label: 'Prerequisites', prompt: 'What must be true before you start?' },
    { field: 'steps', label: 'Steps', mode: 'code', copy: true },
    { field: 'verification', label: 'Verification', prompt: 'How do you prove it worked?' },
    { field: 'pitfalls', label: 'Pitfalls', prompt: 'Where does it usually go wrong?' },
  ],
  form: [
    { name: 'title', label: 'Title', required: true },
    { name: 'goal', label: 'Goal', type: 'textarea', rows: 2 },
    { name: 'category', label: 'Category', type: 'category', third: true },
    { name: 'tags', label: 'Tags', type: 'tags', third: true },
    { name: 'entry_date', label: 'Date', type: 'date', third: true },
    { name: 'prerequisites', label: 'Prerequisites', type: 'textarea', rows: 3 },
    { name: 'steps', label: 'Steps', type: 'code', required: true, rows: 8 },
    { name: 'verification', label: 'Verification', type: 'textarea', rows: 3 },
    { name: 'pitfalls', label: 'Pitfalls', type: 'textarea', rows: 3 },
    { name: 'links', label: 'Related records', type: 'links' },
  ],
};

export const CAPTURE_DESTINATIONS = { commands: 'Command Library', errors: 'Error Archive', knowledge: 'Knowledge Library', workflows: 'Workflows' };

export const MODE_LABELS = { explain: 'Explain-back', rebuild: 'Rebuild', quiz: 'Assessment', review: 'Review' };
export const RATING_LABELS = { 1: 'Again', 2: 'Hard', 3: 'Good', 4: 'Easy' };

export function progress(kind, record) {
  const fields = KIND_UI[kind].progressFields;
  return { done: fields.filter((f) => record[f]?.trim()).length, total: fields.length };
}

export const isResolved = (record) => Boolean(record.solution?.trim());
