// Single source of truth for what each record type looks like.
// Adding a field: add a migration in db.js, then list the field here.

export const CATEGORIES = [
  'Programming',
  'Java',
  'Spring Boot',
  'JavaScript',
  'SQL / Database',
  'Git / GitHub',
  'DevOps',
  'Cloud / Deployment',
  'Security',
  'AI Tools',
  'Other',
];

// Quick Capture types. `kind` decides which collection the capture lands in.
export const CAPTURE_TYPES = [
  { id: 'command', label: 'Terminal command', kind: 'commands' },
  { id: 'output', label: 'Terminal output', kind: 'knowledge' },
  { id: 'error', label: 'Error message', kind: 'errors' },
  { id: 'workflow', label: 'Workflow steps', kind: 'workflows' },
  { id: 'snippet', label: 'Code snippet', kind: 'knowledge' },
  { id: 'ai_explanation', label: 'AI explanation', kind: 'knowledge' },
  { id: 'note', label: 'Technical note', kind: 'knowledge' },
];

const COMMON = ['title', 'category', 'tags', 'entry_date'];

export const RESOURCES = {
  knowledge: {
    table: 'knowledge',
    required: ['title'],
    text: ['content', 'capture_type', 'what_is_it', 'why_needed', 'how_it_works', 'real_example', 'exercise'],
    labels: {
      content: 'Captured content',
      what_is_it: 'What is it?',
      why_needed: 'Why is it needed?',
      how_it_works: 'How does it work?',
      real_example: 'Real-world example',
      exercise: 'Practical exercise',
    },
  },
  commands: {
    table: 'commands',
    required: ['title', 'command'],
    text: ['command', 'purpose', 'explanation', 'expected_output', 'common_mistakes'],
    labels: {
      command: 'Command',
      purpose: 'Purpose',
      explanation: 'Explanation',
      expected_output: 'Expected output',
      common_mistakes: 'Common mistakes',
    },
  },
  errors: {
    table: 'errors',
    required: ['title', 'error_message'],
    text: [
      'error_message',
      'root_cause',
      'investigation',
      'solution',
      'files_affected',
      'verification',
      'lessons',
    ],
    labels: {
      error_message: 'Original error',
      root_cause: 'Root cause',
      investigation: 'Investigation',
      solution: 'Solution',
      files_affected: 'Files affected',
      verification: 'Verification',
      lessons: 'Lessons learned',
    },
  },
  workflows: {
    table: 'workflows',
    required: ['title', 'steps'],
    text: ['goal', 'prerequisites', 'steps', 'verification', 'pitfalls'],
    labels: {
      goal: 'Goal',
      prerequisites: 'Prerequisites',
      steps: 'Steps',
      verification: 'Verification',
      pitfalls: 'Pitfalls',
    },
  },
};

for (const resource of Object.values(RESOURCES)) {
  resource.columns = [...COMMON, ...resource.text];
  resource.searchable = ['title', 'tags', 'category', ...resource.text.filter((f) => f !== 'capture_type')];
}

export const KINDS = Object.keys(RESOURCES);
export const isKind = (value) => Object.hasOwn(RESOURCES, value);
