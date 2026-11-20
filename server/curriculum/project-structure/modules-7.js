// Module 07: Project Reading Lab. Each lesson is a hands-on step on a real repository.
import { lesson, moduleOf } from './helpers.js';

const tree = (text) => '```\n' + text.trim() + '\n```';

export const MODULE_07 = moduleOf(
  'reading-lab',
  'Module 07: Project Reading Lab',
  'Intermediate',
  'Pick one real GitHub repository and read it from start to finish. Six steps in order: finding folder roles, inspecting files, tracing dependencies, following a request, and drawing a structure map.',
  ['Explain the role of each folder in an unfamiliar repository.', 'Trace what one file depends on.', 'Follow one request from the browser to the backend and back.', 'Draw a project structure map.'],
  [
    lesson(
      'lab-explore-repo',
      'Explore a real GitHub repository',
      20,
      'The first step is to choose a repository to read, download it, and skim the README and the top-level structure. Before reading code, find out what the project is for.',
      {
        what: 'Open the repository page on GitHub and look at the README and the list of top-level folders. Then `git clone` it to download the same structure to your computer.',
        why: 'Reading a large project file by file from the start gets you lost. Knowing the purpose and top-level structure first tells you where to read.',
        where: 'Choose a small project with a README and a build configuration file (`build.gradle` or `package.json`) in the root.',
        missing: 'Without a README or configuration file, it is harder to know how to run the project. In that case, start from the entry point (the file where the program begins), such as the class marked `@SpringBootApplication`.',
        connects: 'The README tells you the run commands, and the configuration file tells you which folders are source. Together they form the map of the project.',
        usage: 'When you join a new company and receive an existing repository for the first time, this is exactly the first task you do.',
      },
      {
        keyTerms: [
          ['git clone', 'The command that copies a remote repository to your computer.'],
          ['entry point', 'The file where a program starts. In Spring, it is the class marked `@SpringBootApplication`.'],
        ],
        example: tree(`
$ git clone https://github.com/<owner>/<repo>.git
$ cd <repo>
$ ls                 ← check the top-level structure
README.md  build.gradle  src/
`),
        practice: 'Clone a small public Spring Boot repository. Summarize the run commands in its README and the top-level folder list in three lines.',
        check: [
          { q: 'What two things should you look at before reading a project?', a: 'The README (purpose and how to run it) and the top-level structure (build configuration, src, and so on).' },
          { q: 'If there is no README, what should you look for first?', a: 'The build configuration file and the entry point class (`@SpringBootApplication`).' },
        ],
      },
    ),
    lesson(
      'lab-folder-responsibilities',
      'Identify folder responsibilities',
      20,
      'Open the folders one level at a time from the top, and build a table saying "is this source, resources, or output?" Guess roles from names and locations, then confirm them.',
      {
        what: 'For each folder, write three things: its role (source, resources, test, output), whether you may edit it (Yes/No), and the evidence (name, location, configuration files).',
        why: 'Knowing folder roles tells you what to change and what must not be touched. You must not change `build`, but `src` is where edits go.',
        where: 'Look at the top level and two levels inside `src` first. Open deeper levels only when you need them.',
        missing: 'If you guess roles without checking, you may edit an output folder and see your changes vanish on the next build.',
        connects: 'The configuration file (`build.gradle`) says which folders are source and output. Checking this connection turns the guess into a confirmed fact.',
        usage: 'In a code review, the comment "this file is generated, please do not edit it directly" comes from this step.',
      },
      {
        keyTerms: [['responsibility table', 'A table listing each folder, its role, and whether it can be edited.']],
        example: tree(`
Folder        Role           Editable?    Evidence
src/main      source + res   Yes          the source location (build.gradle)
build/        output         No           produced by the build
.gradle/      build cache    No           managed by the tool
`),
        practice: 'Make a folder-role table for the lab repository. Include at least six folders, and give one piece of evidence for each row.',
        check: [
          { q: 'Why must the `build` folder not be edited directly?', a: 'It is rebuilt from `src` every time you build, so direct edits disappear.' },
          { q: 'How do you confirm a folder\'s role?', a: 'Check its name, its location, and how the configuration files use it.' },
        ],
      },
    ),
    lesson(
      'lab-inspect-files',
      'Inspect individual files',
      25,
      'Pick one file in a folder whose role you now know, and read its structure. Find its purpose, its main declarations (classes, functions, configuration keys), and the lines that point to other files.',
      {
        what: 'Read a file from the top: `package`, then `import`, then annotations, then the class declaration. If it is a configuration file, read its list of keys.',
        why: 'Reading one file properly tells you what it is responsible for and what it depends on. This is where every trace begins.',
        where: 'The file\'s location (its package path or folder) tells you its role. For example, a file in the `controller` folder receives requests.',
        missing: 'If you judge by name alone without reading the content, you miss files whose name and role differ, such as a file called "Util" that actually holds business logic.',
        connects: '`import` points to other files. Annotations (`@Service`, `@Value`) are markers that Spring uses to connect things.',
        usage: 'When you fix a bug, the first thing you do is open the file with the problem and check its `import`s and call relationships.',
      },
      {
        keyTerms: [
          ['import', 'A declaration that brings in a class or function from another file.'],
          ['annotation', 'A marker beginning with `@`. Spring uses it to decide a class\'s role.'],
        ],
        example: tree(`
package com.example.blog.service;        ← location: the service layer
import com.example.blog.repository.CourseRepository;  ← dependency: a Repository
@Service                                 ← role: business layer
public class CourseService { ... }
`),
        practice: 'Pick a file and mark its `package`, `import`, annotations, and class declaration. Then list the other files it imports.',
        check: [
          { q: 'What are the three lines to read first in a file?', a: '`package` (location), `import` (dependencies), and the class declaration with its annotations (role).' },
          { q: 'What does an `import` tell you?', a: 'Which other files this file depends on.' },
        ],
      },
    ),
    lesson(
      'lab-trace-dependencies',
      'Trace file dependencies',
      25,
      'Starting from one file, follow what it imports and what imports it, and draw the network of dependencies.',
      {
        what: 'A dependency is the relationship "A uses B." Reading A\'s `import`s and calls gives arrows going out. Searching for A\'s name in B and other files gives arrows coming in.',
        why: 'Without knowing dependencies, you cannot tell what breaks when you change one file. Tracing them lets you know the scope of a change in advance.',
        where: 'Use a search tool (the IDE\'s "Find Usages," or repository search) to find the name.',
        missing: 'If you change code without checking its dependencies, something else breaks and you do not know why.',
        connects: 'When the Controller → Service → Repository arrows follow the layer rules, a dependency that breaks the rule (for example, a Controller calling a Repository directly) becomes easy to spot.',
        usage: 'Before refactoring, finding "who calls this method?" is exactly dependency tracing.',
      },
      {
        keyTerms: [
          ['dependency', 'A relationship in which one file uses the functions of another.'],
          ['blast radius', 'The range of files that a change affects.'],
        ],
        example: tree(`
CourseController ──▶ CourseService ──▶ CourseRepository ──▶ Course (Entity)
      ▲
      └── who calls it? → check with search
`),
        practice: 'Pick a `Service` class, find every file that calls it, list them, and draw the dependency arrows.',
        check: [
          { q: 'How do you find out "who uses this class"?', a: 'Use Find Usages in the IDE, or search the repository for the class name.' },
          { q: 'Why is dependency tracing important?', a: 'It tells you in advance how a change affects other features.' },
        ],
      },
    ),
    lesson(
      'lab-request-flow',
      'Follow a request from browser to backend and back',
      30,
      'Pick a button on the screen and write down, in order, every file it passes through from the click to the screen update. Check both the path the request takes out and the path the response takes back.',
      {
        what: 'For example, opening the course list: HTML link → JavaScript router → `fetch(\'/api/courses\')` → Controller → Service → Repository → DB → DTO → JSON → JavaScript rendering → HTML update.',
        why: 'Following the flow end to end once shows you how the frontend and backend actually connect. This is the proof that you can read a project structure.',
        where: 'Look at the real request address in the browser developer tools Network tab, then search the project for that address.',
        missing: 'If you cannot find a part of the flow, usually the address differs slightly in two places (spelling, a leading `/`), or an authentication step is missing.',
        connects: 'Request address → the Controller\'s mapping → Service method → Repository method → Entity → DTO → JSON field → JavaScript variable → DOM element.',
        usage: 'The basic procedure for "data does not appear on the screen" problems is to follow this flow to the end.',
      },
      {
        keyTerms: [
          ['request flow', 'The path a user action takes through the server and back to the screen.'],
          ['DevTools', 'Browser tools for seeing requests and responses directly.'],
        ],
        example: tree(`
1. Click the link       index.html  (<a href="#/courses">)
2. Router               main.js     (hash address → screen function)
3. Data request         views/courses.js → api.js → fetch('/api/courses')
4. Server reception     CourseController.list()
5. Business work        CourseService → CourseRepository → DB
6. Response assembly    CourseDto → JSON
7. Screen update        views/courses.js → components.js → DOM
`),
        practice: 'In the browser, open the course list and find the `/api/courses` request in the Network tab. Find the file names for the seven steps above in the real project.',
        check: [
          { q: 'Which file does a request reach first when it arrives at the server?', a: 'The Controller, found by its address mapping.' },
          { q: 'Which JavaScript files does a response pass through before it reaches the screen?', a: 'The view file that draws the screen, and the API-calling file that sends the request.' },
        ],
      },
    ),
    lesson(
      'lab-architecture-map',
      'Draw a project architecture map',
      30,
      'Combine the folders, files, dependencies, and request flow you have found into one map. With this map in hand, you will not get lost from the start the next time you read a feature.',
      {
        what: 'Draw the map in three layers: the folder layer (what is where), the file layer (key files and their roles), and the flow layer (arrows for the path a request takes). Distinguish the three with colours or lines.',
        why: 'A structure that exists only in your head fades in a few days. Drawing it on paper or in a document lets you explain it to teammates, and decide where a new feature belongs.',
        where: 'The best place for the map is a `docs/` folder in the repository, as Markdown or an image file.',
        missing: 'Without a map, as the project grows you must search again every time for "where is this feature?"',
        connects: 'The arrows on the map must match the connection rules from Module 6. Any arrow that breaks the rules is a signal of a design problem.',
        usage: 'The map goes first into onboarding documents for new team members and into design review material.',
      },
      {
        keyTerms: [['architecture map', 'A diagram showing a project\'s parts and how they connect.']],
        example: tree(`
[Browser]
  index.html ─ main.js ─ views/courses.js ─ api.js
                                              │ fetch /api/courses
[Server]                                      ▼
  CourseController → CourseService → CourseRepository → [DB]
        └── CourseDto (response) ◀────────────┘
`),
        practice: 'Draw a structure map of one repository you have studied. It must include at least three folders, five key files, and at least one request-flow arrow. If there is a dependency that breaks the layer rules, mark it.',
        check: [
          { q: 'What three things must an architecture map include?', a: 'The folder structure, the key files and their roles, and the flow a request follows.' },
          { q: 'What does it mean if an arrow on the map breaks the layer rules?', a: 'A layer is being skipped by a dependency, which is a signal that the design needs to be reviewed.' },
        ],
      },
    ),
  ],
  {
    title: 'Structure map of a real repository',
    description: 'Pick one public Spring Boot repository, complete the six steps of this lab, and summarize the results on a single page.',
    deliverables: ['A table of folder roles', 'The roles and dependencies of five key files', 'The request flow for one button (browser → backend → browser)', 'One structure map on a single page'],
  },
);
