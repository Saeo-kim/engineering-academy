// Example records for the first run. Each is stored with is_sample = 1, shown
// with an EXAMPLE badge, and removable in one click. Seeding happens once, so
// removing the examples never brings them back.

const KNOWLEDGE = [
  {
    key: 'n-plus-one',
    daysAgo: 2,
    title: 'Why N+1 queries happen in JPA',
    category: 'Spring Boot',
    capture_type: 'ai_explanation',
    tags: ['jpa', 'hibernate', 'performance'],
    content:
      'Hibernate: select * from orders\nHibernate: select * from customer where id=?\nHibernate: select * from customer where id=?\nHibernate: select * from customer where id=?',
    what_is_it:
      'An N+1 query problem is one query to load a list, followed by one more query for each row in that list to load a related object.',
    why_needed:
      'It is invisible in development with ten rows and painful in production with ten thousand. Recognising the pattern in logs is what lets you fix it before users feel it.',
    how_it_works:
      '`@ManyToOne` and `@OneToMany` relations can be lazy. A lazy relation is a proxy that runs a SELECT the first time you touch it.\n\nLoop over 100 orders and call `order.getCustomer().getName()`, and that is 100 separate SELECTs on top of the original one.',
    real_example:
      '```java\n@Query("select o from Order o join fetch o.customer")\nList<Order> findAllWithCustomer();\n```\nThe `join fetch` loads orders and customers in a single SELECT.',
    exercise:
      'Set `spring.jpa.show-sql=true`, load a list endpoint and count the SELECTs. Add `join fetch`, then confirm the count drops to one.',
  },
  {
    key: 'event-loop',
    daysAgo: 5,
    title: 'The JavaScript event loop in practice',
    category: 'JavaScript',
    capture_type: 'note',
    tags: ['async', 'promises'],
    content: 'Promise callbacks ran before my setTimeout(fn, 0). Why?',
    what_is_it:
      'The event loop is how a single-threaded JavaScript runtime schedules work: run the current task, drain the microtask queue, then take the next task.',
    why_needed: 'It explains the order of async code, and why one long loop freezes a page or a Node server.',
    how_it_works:
      '`setTimeout` callbacks are tasks. Promise callbacks are microtasks. All queued microtasks run before the next task starts, so a resolved promise beats a zero-delay timeout.',
    real_example:
      '```js\nsetTimeout(() => console.log("timeout"), 0);\nPromise.resolve().then(() => console.log("promise"));\nconsole.log("sync");\n// sync, promise, timeout\n```',
    exercise: 'Predict the output of three nested promises and a timeout, write your answer down, then run it.',
  },
  {
    key: 'rebase',
    daysAgo: 9,
    title: 'Merge vs. rebase: what actually changes',
    category: 'Git / GitHub',
    capture_type: 'note',
    tags: ['git', 'history'],
    content: 'Rebase rewrites commits. Their hashes change even when the code is identical.',
    what_is_it: 'Two ways to combine branches. Merge adds a commit with two parents. Rebase replays your commits on top of another branch.',
    why_needed: 'Choosing wrongly on a shared branch forces teammates to reconcile rewritten history.',
    how_it_works:
      'A commit hash covers its content and its parent. Replaying a commit onto a new parent therefore creates a new commit with a new hash.',
    real_example: 'Rebase a private feature branch onto `main` before opening a PR. Never rebase a branch others have pulled.',
    exercise: '',
  },
  {
    key: 'index',
    daysAgo: 14,
    title: 'How a B-tree index speeds up a WHERE clause',
    category: 'SQL / Database',
    capture_type: 'note',
    tags: ['indexes', 'postgres'],
    content: 'EXPLAIN went from Seq Scan to Index Scan after adding the index.',
    what_is_it: 'A sorted tree of column values that point to rows, so the database can find matches without reading the whole table.',
    why_needed: 'Without one, each lookup costs time proportional to table size.',
    how_it_works: '',
    real_example: '',
    exercise: '',
  },
  {
    key: 'prompt-context',
    daysAgo: 1,
    title: 'Giving an AI assistant the full error, not a summary',
    category: 'AI Tools',
    capture_type: 'ai_explanation',
    tags: ['claude-code', 'debugging'],
    content: 'Paste the complete stack trace and the command that triggered it. Summaries drop the line that matters.',
    what_is_it: '',
    why_needed: '',
    how_it_works: '',
    real_example: '',
    exercise: '',
  },
];

const COMMANDS = [
  {
    key: 'find-port',
    daysAgo: 3,
    title: 'Find what is using a port (Windows)',
    category: 'DevOps',
    tags: ['windows', 'networking'],
    command: 'netstat -ano | findstr :8080',
    purpose: 'Identify the process holding a port when a server fails to start.',
    explanation:
      '`-a` lists all connections, `-n` keeps addresses numeric, and `-o` adds the owning process ID. `findstr` filters to the port.',
    expected_output: 'TCP    0.0.0.0:8080    0.0.0.0:0    LISTENING    12345',
    common_mistakes: 'Killing the PID without checking what it is first: `tasklist /FI "PID eq 12345"`.',
  },
  {
    key: 'undo-commit',
    daysAgo: 6,
    title: 'Undo the last commit but keep the changes',
    category: 'Git / GitHub',
    tags: ['git', 'recovery'],
    command: 'git reset --soft HEAD~1',
    purpose: 'Rewrite a commit made too early, without losing work.',
    explanation: '`--soft` moves the branch pointer back one commit and leaves your changes staged.',
    expected_output: 'No output. `git status` shows the changes as staged.',
    common_mistakes: 'Using `--hard`, which deletes the changes, or resetting a commit that was already pushed.',
  },
  {
    key: 'gradle-test',
    daysAgo: 11,
    title: 'Run one Spring Boot test class',
    category: 'Java',
    tags: ['gradle', 'testing'],
    command: './gradlew test --tests "com.example.OrderServiceTest"',
    purpose: 'Get fast feedback on one class instead of running the whole suite.',
    explanation: '`--tests` filters by class or method name and accepts wildcards.',
    expected_output: 'BUILD SUCCESSFUL in 8s',
    common_mistakes: 'Using the simple class name without a wildcard: write `*OrderServiceTest`.',
  },
];

const ERRORS = [
  {
    key: 'port-in-use',
    daysAgo: 3,
    title: 'Spring Boot fails to start: port 8080 in use',
    category: 'Spring Boot',
    tags: ['startup', 'ports'],
    error_message:
      "***************************\nAPPLICATION FAILED TO START\n***************************\n\nDescription:\nWeb server failed to start. Port 8080 was already in use.",
    root_cause: 'An earlier run of the app was still alive after its terminal was closed, so it kept the port.',
    investigation:
      '1. Read the message: the app itself is fine, and the port is taken.\n2. Ran `netstat -ano | findstr :8080` and got PID 12345.\n3. `tasklist` showed that PID was `java.exe`, a leftover run.',
    solution: 'Stopped the old process with `taskkill /PID 12345 /F`, then restarted.',
    files_affected: 'None (environment issue)',
    verification: 'App started and `GET /actuator/health` returned `{"status":"UP"}`.',
    lessons: 'Closing a terminal window does not always stop the process inside it. Look for the owner of the port before changing the port.',
  },
  {
    key: 'cors',
    daysAgo: 7,
    title: 'Blocked by CORS when calling the API from React',
    category: 'JavaScript',
    tags: ['cors', 'http'],
    error_message:
      "Access to fetch at 'http://localhost:8080/api/orders' from origin 'http://localhost:5173' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.",
    root_cause: 'The frontend and API run on different ports, so they are different origins, and the API did not allow that origin.',
    investigation:
      '1. The Network tab showed the request reached the server.\n2. The response had no `Access-Control-Allow-Origin` header.\n3. Confirmed that the browser enforces this, which is why curl succeeded.',
    solution: 'Added a Spring `CorsConfigurationSource` allowing `http://localhost:5173` in development only.',
    files_affected: 'src/main/java/com/example/config/SecurityConfig.java',
    verification: 'The fetch returned 200 and the header appeared in the response.',
    lessons: 'CORS is enforced by the browser, so a working curl proves nothing. Never answer it with `*` in production.',
  },
  {
    key: 'non-fast-forward',
    daysAgo: 1,
    title: 'git push rejected: non-fast-forward',
    category: 'Git / GitHub',
    tags: ['git', 'push'],
    error_message: ' ! [rejected]        main -> main (non-fast-forward)\nerror: failed to push some refs to origin',
    root_cause: '',
    investigation: 'Example of an unresolved record. It stays Open until a solution is written down.',
    solution: '',
    files_affected: '',
    verification: '',
    lessons: '',
  },
];

const WORKFLOWS = [
  {
    key: 'feature-branch',
    daysAgo: 4,
    title: 'Ship a change through a feature branch and pull request',
    category: 'Git / GitHub',
    tags: ['git', 'pull-request'],
    goal: 'Get a change reviewed and merged into main without breaking main or rewriting anyone else’s history.',
    prerequisites: 'A clean working tree (`git status` shows nothing) and an up-to-date local main.',
    steps:
      'git switch main\ngit pull --ff-only\ngit switch -c feature/short-name\n# make the change, run the tests\ngit add -p\ngit commit -m "Explain why, not just what"\ngit push -u origin feature/short-name\n# open the pull request, address review, merge',
    verification: 'CI is green on the pull request, and after merging `git log --oneline main` shows the commit.',
    pitfalls: 'Branching from a stale main, which causes avoidable conflicts. Using `git add .` and committing unrelated files.',
  },
  {
    key: 'spring-endpoint',
    daysAgo: 8,
    title: 'Add a REST endpoint to a Spring Boot service',
    category: 'Spring Boot',
    tags: ['rest', 'testing'],
    goal: 'Expose a new read-only endpoint with validation and a test that proves it works.',
    prerequisites: 'The service builds and its existing tests pass.',
    steps:
      '1. Write a failing `@WebMvcTest` for GET /api/orders/{id}.\n2. Add a DTO record for the response.\n3. Add the controller method with `@GetMapping` and `@PathVariable`.\n4. Map not-found to 404 in a `@ControllerAdvice`.\n5. Run the test, then the whole suite.',
    verification: 'The new test passes, and `curl localhost:8080/api/orders/1` returns JSON with status 200.',
    pitfalls: 'Returning the JPA entity directly, which leaks fields and can trigger lazy-loading errors during serialisation.',
  },
];

const LINKS = [
  ['workflows:feature-branch', 'knowledge:rebase'],
  ['workflows:feature-branch', 'errors:non-fast-forward'],
  ['workflows:spring-endpoint', 'knowledge:n-plus-one'],
  ['commands:find-port', 'errors:port-in-use'],
  ['knowledge:rebase', 'errors:non-fast-forward'],
  ['knowledge:rebase', 'commands:undo-commit'],
  ['knowledge:event-loop', 'errors:cors'],
];

// [kind, key, days ago of each study event], so the activity chart is not blank.
const STUDY_HISTORY = [
  ['knowledge', 'n-plus-one', [2, 6, 13]],
  ['knowledge', 'event-loop', [1, 5, 12, 20]],
  ['errors', 'port-in-use', [3, 10]],
  ['commands', 'undo-commit', [4, 18]],
];

// [kind, key, mode, score, rating, days ago], so the learning pages are not blank.
const PRACTICE_HISTORY = [
  ['knowledge', 'event-loop', 'explain', 72, 3, 5],
  ['knowledge', 'event-loop', 'rebuild', 88, 3, 5],
  ['knowledge', 'event-loop', 'review', null, 3, 1],
  ['knowledge', 'n-plus-one', 'explain', 54, 2, 6],
  ['commands', 'undo-commit', 'rebuild', 100, 4, 4],
  ['errors', 'port-in-use', 'explain', 81, 3, 3],
];

const SEED_FLAG = 'sample_data_seeded';

export function seedIfFirstRun(repo) {
  const { db, clean, insertRow, logActivity, transaction, orderedPair } = repo.internals;
  if (db.prepare('SELECT 1 FROM meta WHERE key = ?').get(SEED_FLAG)) return false;

  const dateFor = (daysAgo, hour = 10) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour, 15, 0, 0);
    return d;
  };
  const localDay = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  transaction(() => {
    const ids = {};
    const insertAll = (kind, records) => {
      for (const { key, daysAgo, ...fields } of records) {
        const at = dateFor(daysAgo);
        const id = insertRow(kind, clean(kind, { ...fields, entry_date: localDay(at) }), {
          isSample: true,
          at: at.toISOString(),
        });
        ids[`${kind}:${key}`] = id;
        logActivity('created', kind, id, fields.title, true, at.toISOString());
      }
    };
    insertAll('knowledge', KNOWLEDGE);
    insertAll('commands', COMMANDS);
    insertAll('errors', ERRORS);
    insertAll('workflows', WORKFLOWS);

    const insertLink = db.prepare('INSERT OR IGNORE INTO links (a_kind, a_id, b_kind, b_id) VALUES (?, ?, ?, ?)');
    for (const [a, b] of LINKS) {
      const [aKind] = a.split(':');
      const [bKind] = b.split(':');
      insertLink.run(...orderedPair(aKind, ids[a], bKind, ids[b]));
    }

    for (const [kind, key, days] of STUDY_HISTORY) {
      const id = ids[`${kind}:${key}`];
      const title = [...KNOWLEDGE, ...COMMANDS, ...ERRORS, ...WORKFLOWS].find((r) => r.key === key).title;
      for (const daysAgo of [...days].sort((x, y) => y - x)) {
        logActivity('studied', kind, id, title, true, dateFor(daysAgo, 20).toISOString());
      }
      db.prepare(`UPDATE ${kind} SET last_studied_at = ?, study_count = ? WHERE id = ?`).run(
        dateFor(Math.min(...days), 20).toISOString(),
        days.length,
        id,
      );
    }
    const insertAttempt = db.prepare(
      'INSERT INTO attempts (kind, item_id, mode, response, score, rating, is_sample, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?)',
    );
    const ratedSoFar = new Map();
    for (const [kind, key, mode, score, rating, daysAgo] of PRACTICE_HISTORY) {
      const id = ids[`${kind}:${key}`];
      const at = dateFor(daysAgo, 21);
      insertAttempt.run(kind, id, mode, mode === 'review' ? '' : '(example answer)', score, rating, at.toISOString());
      const reps = (ratedSoFar.get(`${kind}:${id}`) ?? 0) + 1;
      ratedSoFar.set(`${kind}:${id}`, reps);
      const interval = reps === 1 ? 1 : 3;
      const due = new Date(at.getTime() + interval * 86_400_000);
      db.prepare(
        `INSERT INTO reviews (kind, item_id, due_at, interval_days, ease, reps, lapses, last_rating, last_reviewed_at)
         VALUES (?, ?, ?, ?, 2.5, ?, 0, ?, ?)
         ON CONFLICT (kind, item_id) DO UPDATE SET due_at = excluded.due_at, interval_days = excluded.interval_days,
           reps = excluded.reps, last_rating = excluded.last_rating, last_reviewed_at = excluded.last_reviewed_at`,
      ).run(kind, id, due.toISOString(), interval, rating >= 2 ? reps : 0, rating, at.toISOString());
    }
    db.prepare('INSERT INTO meta (key, value) VALUES (?, ?)').run(SEED_FLAG, new Date().toISOString());
  });
  return true;
}
