// Built-in study curriculum. Unlike seed.js examples these are real study
// records (is_sample = 0): "Remove examples" never deletes them. They are
// installed once per database, tracked by a meta flag, so editing or deleting
// a record is never undone on the next start.
//
// Sources: the JPA + AI code verification study guide (defect lab),
// plus general computer basics, prompt writing and PowerShell setup.

import { KNOWLEDGE_V2, LINKS_V2, WORKFLOWS_V2 } from './curriculum2.js';

const L = (...lines) => lines.join('\n');

const KNOWLEDGE = [
  // ── 0. How to study ──────────────────────────────────────
  {
    key: 'how-to-learn',
    capture_type: 'note',
    title: 'A study method for when you keep not understanding the same thing',
    category: 'Other',
    tags: ['study method', 'start'],
    content: 'It feels familiar when you read it, but when you close the book you cannot explain it. You are reading the same material for the third time.',
    what_is_it: L(
      'This is a study method based on "pulling it out to check" rather than "understanding by reading."',
      '',
      'Reading alone makes the brain confuse "I have seen this" with "I know this." That is why re-reading the same material does not help on an exam.',
    ),
    why_needed: L(
      'The problem is not that you cannot understand. The step where you check whether you understood was missing.',
      '',
      'This app forces that check in: Explain it back, Rebuild (write it again), and Review (spaced repetition).',
    ),
    how_it_works: L(
      'Daily routine (one concept = 25 minutes):',
      '',
      '1. Read for 5 minutes: remember one analogy only. Do not try to memorize everything.',
      '2. Dissect code for 5 minutes: paste code you do not understand into the **Code Explainer** (left menu) and hover over each word.',
      '3. Explain from memory for 5 minutes: press Explain it back. If the score is below 60, reread only the missing words.',
      '4. Write it by hand for 5 minutes: Rebuild challenge. 80 or more passes.',
      '5. One question for 5 minutes: write what you still do not get in the form "I understand up to ___, but not ___." Ask that sentence as-is to a teacher or an AI.',
      '',
      'If you feel like re-reading the same thing: do not reread it. Grade yourself 1 to 4 in the Review Center. Reread only the items you keep rating 2 or below.',
    ),
    real_example: L(
      'When you do not understand `store.getReviews().size();`',
      '',
      'Bad approach: reread the N+1 section of the guide from the beginning.',
      'Good approach: paste it into the Code Explainer → hover `getReviews` → "fetch the review list" → click → "lazy loading" → click → "proxy." You can see exactly where you got stuck. Study only that one place.',
    ),
    exercise: 'Pick one line of code you got stuck on today and paste it into the Code Explainer. Write down the last term you clicked. That is the part you really do not know.',
  },

  // ── 1. Computer basics ───────────────────────────────────
  {
    key: 'pc-parts',
    capture_type: 'note',
    title: 'Four computer parts: CPU · RAM · storage · GPU',
    category: 'Computer Basics',
    tags: ['computer basics', 'specs', 'ram'],
    content: 'Spec sheet example: Intel Core i5-12400 / RAM 16GB DDR4 / SSD 512GB NVMe / Intel UHD 730',
    what_is_it: L(
      'Think of a computer as a restaurant:',
      '',
      '- **CPU** = the chef. Does the actual calculations. Core count = number of chefs; GHz = how fast their hands move.',
      '- **RAM (memory)** = the countertop. Holds the ingredients you are working with right now. The bigger it is, the more dishes (programs) you can work on at once. It empties when the power is off.',
      '- **Storage (SSD/HDD)** = the warehouse. Keeps everything when the power is off. Files and installed programs live here. An SSD is a fast warehouse; an HDD is a slow, cheap one.',
      '- **GPU (graphics card)** = the plating specialist. Handles screens, games, video, and AI calculations.',
    ),
    why_needed: L(
      'Most of the reasons development slows down come down to too little RAM.',
      'IntelliJ (2–4 GB) + several Chrome tabs (2–4 GB) + MySQL (0.5–1 GB) + a Spring Boot app (0.5–1 GB) + Windows (3 GB) easily goes past 10 GB.',
    ),
    how_it_works: L(
      'When you run a program: it is taken from the warehouse (SSD) → put on the countertop (RAM) → the chef (CPU) processes it → the result is drawn on the screen (GPU).',
      '',
      'When the countertop (RAM) is full, Windows uses part of the warehouse (SSD) as temporary counter space (virtual memory, or the page file). The warehouse is dozens of times slower than the countertop, so the computer starts to "stutter."',
      '',
      'How to check your computer\'s specs:',
      '- `Ctrl + Shift + Esc` → Task Manager → Performance tab: CPU, memory, disk, and GPU usage',
      '- `Win + Pause` or Settings → System → About: CPU name and RAM size',
    ),
    real_example: L(
      'RAM guidelines for developers (2026):',
      '```text',
      '8GB   fine for studying the web. IntelliJ + Chrome + MySQL together will stutter',
      '16GB  enough for courses and team projects (recommended minimum)',
      '32GB  room for Docker, several projects, and even local AI models',
      '```',
      'When buying a laptop, check in this order: 16GB RAM or more → 512GB SSD or more → a CPU from the last three years at mid-range (i5/Ryzen 5) or better is enough.',
    ),
    exercise: 'Open Task Manager → Performance → Memory and write down "In use" and "Available." Also write down the difference before and after you open IntelliJ.',
  },
  {
    key: 'folders-paths',
    capture_type: 'snippet',
    title: 'Folders · files · paths: how a computer finds a file',
    category: 'Computer Basics',
    tags: ['computer basics', 'folders', 'paths'],
    content: 'C:\\Users\\KHBS_D_26\\Desktop\\SAEO-WORKSPACE\\engineering-academy\\server\\index.js',
    what_is_it: L(
      '- **File** = one sheet of paper. Its name plus extension (`.java`, `.html`, `.md`) shows what it is.',
      '- **Folder (directory)** = a binder. You can keep putting folders inside folders (a tree structure).',
      '- **Path** = the address of a document. `C:\\Users\\name\\Desktop\\file.txt`',
      '- **Drive** = the top drawer of the cabinet (`C:`, `D:`).',
    ),
    why_needed: L(
      'Many development errors are "file not found": `No such file or directory`, `cannot find path`, `ClassNotFoundException`.',
      'If you can read a path, half of these errors are solved straight away.',
    ),
    how_it_works: L(
      '**Absolute path**: the full address starting from the drive. `C:\\Users\\KHBS_D_26\\Desktop`',
      '**Relative path**: an address based on the folder you are in now.',
      '- `.` = this folder, `..` = one folder up',
      '- `.\\gradlew.bat` = run gradlew.bat in this folder',
      '',
      '**Folders a Windows developer should know**',
      '- `C:\\Users\\yourname` (= `~`, `%USERPROFILE%`): your home folder',
      '- `Desktop`, `Documents`, `Downloads`: inside your home folder',
      '- `AppData`: hidden folder. Program settings and caches (`.gradle`, npm cache, etc.)',
      '- `C:\\Program Files`: installed programs',
      '- Folders starting with a dot (`.git`, `.idea`, `.gradle`) are settings folders. They are usually hidden.',
      '',
      '**Showing hidden files and extensions**: File Explorer → View → Show → tick "File name extensions" and "Hidden items." Developers should keep both on.',
      '',
      '**The PATH environment variable**: why typing `java`, `node`, or `git` alone runs the program. Windows searches the folders listed in PATH, in order, to find it. "Command not found" means the program is not in PATH.',
    ),
    real_example: L(
      '```powershell',
      'pwd                    # which folder am I in now?',
      'ls                     # what is in this folder?',
      'cd ..                  # go one folder up',
      'cd ~\\Desktop          # go to the Desktop in your home folder',
      'explorer .             # open this folder in File Explorer',
      '```',
      'Rule for keeping development folders tidy: one project = one folder = one Git repository. Paths with no spaces, brackets, or non-English characters cause fewer errors (for example, `final-personal` rather than `(personal) final project`).',
    ),
    exercise: 'Open PowerShell, run `cd ~\\Desktop\\SAEO-WORKSPACE`, then `ls`. Write down the folder names you see and one line about what each project is.',
  },
  {
    key: 'shortcuts-windows',
    capture_type: 'note',
    title: 'Computer shortcuts: Windows · browser · text editing',
    category: 'Computer Basics',
    tags: ['computer basics', 'shortcuts'],
    content: 'Doing mouse-driven tasks with the keyboard saves about 30 minutes a day.',
    what_is_it: 'A way to run frequent actions with a single key combination. Developers copy, paste, and switch windows hundreds of times a day, so the savings add up.',
    why_needed: 'Each trip your hand makes from the keyboard to the mouse and back breaks your focus. Learn three shortcuts a week from the table below.',
    how_it_works: L(
      '**Windows basics**',
      '```text',
      'Ctrl + C / X / V      copy / cut / paste',
      'Ctrl + Z / Y          undo / redo',
      'Ctrl + A              select all',
      'Ctrl + S              save',
      'Ctrl + F              find',
      'Win + V               clipboard history (pick from several things you copied)',
      'Alt + Tab             switch windows',
      'Win + D               show the desktop',
      'Win + E               File Explorer',
      'Win + ← / →           snap a window to half the screen (code and guide side by side)',
      'Win + Shift + S       capture part of the screen (for taking pictures of errors)',
      'Ctrl + Shift + Esc    Task Manager (close frozen programs, check memory)',
      'Win + .               emoji and special characters',
      'Win + R               Run dialog (type cmd, powershell, notepad)',
      'F2                    rename',
      'Alt + F4              close window',
      '```',
      '',
      '**Browser (Chrome / Edge)**',
      '```text',
      'Ctrl + T / W          new tab / close tab',
      'Ctrl + Shift + T      reopen the tab you just closed',
      'Ctrl + L              jump to the address bar',
      'Ctrl + Tab            next tab',
      'F5 / Ctrl + F5        refresh / hard refresh that ignores the cache (when CSS does not change)',
      'F12                   developer tools (Console, Network)',
      'Ctrl + + / - / 0      zoom in / out / reset',
      '```',
      '',
      '**Text editing (works almost everywhere)**',
      '```text',
      'Ctrl + ← / →          move by word',
      'Shift + arrow keys    select',
      'Ctrl + Shift + ←/→    select by word',
      'Home / End            start / end of line',
      'Ctrl + Backspace      delete by word',
      '```',
    ),
    real_example: 'When an error appears: capture it with `Win + Shift + S` → paste with `Ctrl + V` into Claude or your team chat. Copying the error text (`Ctrl + C`) is even better than a screenshot, because an AI can read it exactly.',
    exercise: 'This week, learn three: `Win + V`, `Win + ← / →`, and `Ctrl + Shift + T`. Deliberately use each one five times a day.',
  },
  {
    key: 'shortcuts-ide',
    capture_type: 'note',
    title: 'Developer tool shortcuts: IntelliJ · VS Code',
    category: 'Computer Basics',
    tags: ['shortcuts', 'intellij', 'vscode'],
    content: 'Knowing just "Shift twice" in IntelliJ removes the time spent looking for files.',
    what_is_it: 'Keyboard methods for moving around code, searching, and running it inside an IDE (integrated development environment).',
    why_needed: 'Studying code, like the guide\'s "find the [A-3] number with Ctrl + Shift + F," comes down to finding things quickly.',
    how_it_works: L(
      '**IntelliJ IDEA (Windows)**',
      '```text',
      'Shift twice          search everywhere (files, classes, settings)',
      'Ctrl + N              find a class',
      'Ctrl + Shift + N      find a file',
      'Ctrl + Shift + F      find text across the whole project',
      'Ctrl + B / Ctrl+click go to definition (where is this method?)',
      'Ctrl + Alt + ←        go back to the previous position (the most important one!)',
      'Alt + F7              who uses this method?',
      'Ctrl + E              recent files',
      'Alt + Enter           suggestions to fix a red underline',
      'Ctrl + Alt + L        format code',
      'Shift + F10           run',
      'Ctrl + Shift + F10    run the test under the cursor',
      'Ctrl + /              toggle comment',
      'Ctrl + D              duplicate line',
      'Ctrl + Y              delete line',
      'Shift + F6            rename (updates every use)',
      '```',
      '',
      '**VS Code**',
      '```text',
      'Ctrl + P              find a file',
      'Ctrl + Shift + P      command palette',
      'Ctrl + `              open the terminal',
      'F12                   go to definition',
      'Alt + ←               back to the previous position',
      'Alt + ↑ / ↓           move a line up or down',
      'Ctrl + D              add the next occurrence of the same word to the selection',
      '```',
    ),
    real_example: 'When you do not know what `store.getReviews()` is: press `Ctrl + B` on `getReviews` → jump to the reviews field in Store.java → check `@OneToMany(mappedBy = "store")` → press `Ctrl + Alt + ←` to return to where you were.',
    exercise: 'In the defect lab, open `StoreService` with `Ctrl + N`, press `Ctrl + B` on `findAll`, then press `Ctrl + Alt + ←` to come back.',
  },

  // ── 2. JPA exam ──────────────────────────────────────────
  {
    key: 'jpa-exam-structure',
    capture_type: 'note',
    title: 'The JPA exam format: four topics × three question types',
    category: 'Spring Boot',
    tags: ['jpa', 'exam', 'defect-lab'],
    content: 'Source: the JPA + AI code verification study guide (exam map)',
    what_is_it: L(
      'Four exam topics:',
      '- **A Relationship mapping**: "Which table holds the foreign key?", "Which side is the owner?", explaining mappedBy',
      '- **B Lazy loading · proxies · N+1**: look at code and answer "How many SQL statements are sent?", LazyInitializationException, and how to fix it (the topic people get wrong most)',
      '- **C Persistence context · dirty checking**: "Why is it saved when I never called save?", the first-level cache, values after a bulk UPDATE',
      '- **D JPQL · Repository**: method name → SQL, select new, @Query/@Modifying',
      '',
      'Three question types:',
      '- **Read the code and answer**: a code snippet → pick the SQL count, the loading type, or the resulting value',
      '- **Essay**: "Explain ~" → checked for the key terms it contains',
      '- **Hands-on**: fix one line / write it from scratch',
    ),
    why_needed: 'JPA is hard because of SQL you cannot see. The exam ultimately asks whether you can answer "Does this line send SQL?" for each line.',
    how_it_works: L(
      'The study order the guide recommends:',
      '1. A five-question diagnostic',
      '2. Read the six-part explanation for your weakest topic (analogy · one-page diagram · line-by-line code reading · measurement table · common misconceptions · three exam points)',
      '3. Practice questions on that topic',
      '4. Redo your mistakes from the error notebook',
      '5. A 20-question mock exam, 30 minutes',
      '6. The night before: print the cheat sheet (one A4 page)',
      '',
      'Exam data (shared by all numeric questions): 50 restaurants, 3 reviews per restaurant (150 total), 1 author, 10 favourites.',
    ),
    real_example: L(
      'Essay example: "Explain the N+1 problem"',
      'Key terms: one query to load the list, a loop, related entities, lazy loading, N extra queries, solved with fetch join or DTO',
    ),
    exercise: 'Without looking, write the four topic names. Then, for each topic, write one line you remember from its "three exam points."',
  },
  {
    key: 'n-plus-one-ko',
    capture_type: 'snippet',
    title: 'The N+1 problem: 51 SQL queries hidden in a restaurant list',
    category: 'SQL / Database',
    tags: ['jpa', 'n+1', 'exam', 'topic b'],
    content: L(
      'List<Store> stores = storeRepository.findAll();   // 🔶 1 SQL',
      'for (Store store : stores) {',
      '    long count = store.getReviews().size();       // 🔶 1 SQL per restaurant',
      '}',
    ),
    what_is_it: L(
      '**Fetching a list once, then fetching related data once more for each row in the list.**',
      'With 50 restaurants, that is 1 + 50 = 51 SQL queries. N = the number of items in the list.',
      '',
      'Restaurant analogy: a customer asks for the review list. At first they get an order slip with only a number (a proxy). Each time the customer opens one, the kitchen visits the warehouse (the database). Open all 50 one by one and the warehouse is visited 50 times.',
    ),
    why_needed: 'With 10 items in development the problem does not show. Once the service has 10,000 items, the screen becomes slow. No SQL appears anywhere in the code, so it is hard to find.',
    how_it_works: L(
      'One-page diagram (SQL timeline):',
      '```',
      ' Code                                    SQL sent',
      ' ─────────────────────────────────────  ──────────────────────────────────',
      ' stores = storeRepository.findAll();    select … from store              (1)',
      ' for (Store store : stores) {',
      '   store.getReviews().size();           select … from review where store_id = 1',
      '   store.getReviews().size();           select … from review where store_id = 2',
      '   …  (repeats N times, once per restaurant)  …                           (N)',
      ' }',
      '                                        total = 1 + N  (50 restaurants → 51)',
      '```',
      '',
      'Why this happens: `Store.reviews` is `@OneToMany`, so the default is **LAZY**. findAll does not load the reviews; it only leaves placeholders (proxies). The SELECT runs at the moment you actually look inside, such as with `.size()`.',
      '',
      'Common misconceptions:',
      '- "Switching to LAZY removes N+1." No. Reading inside a loop still sends one query per item.',
      '- "EAGER reads everything at once." No. Reading with JPQL loads things separately, so there are even more queries (measurement 52).',
      '- "A fetch join always takes 1 query." No. In this project, the EAGER author causes a second query.',
    ),
    real_example: L(
      'Four ways to fix it (measured values from the defect lab):',
      '```',
      'fetch join     @Query("select s from Store s left join fetch s.reviews")   → 2 queries',
      'EntityGraph    @EntityGraph(attributePaths = "reviews")                      → same as fetch join',
      'batch size     spring.jpa.properties.hibernate.default_batch_fetch_size=10   → 6 queries',
      'Direct DTO     select new StoreListDto(s.id, s.name, ..., count(r))',
      '               from Store s left join s.reviews r group by s                → 1 query (the correct code)',
      '```',
      'Answer to case 1: add an aggregate DTO query to StoreRepository, and have StoreService use it. 51 SQL queries → 1.',
    ),
    exercise: 'Set `spring.jpa.show-sql=true` (or org.hibernate.SQL: debug), open the restaurant list, and count the select lines in the console. After you fix it, count again and check that it is 1.',
  },
  {
    key: 'lazy-proxy',
    capture_type: 'snippet',
    title: 'Lazy loading (LAZY) · eager loading (EAGER) · proxies',
    category: 'Spring Boot',
    tags: ['jpa', 'lazy', 'exam', 'topic b'],
    content: '@ManyToOne defaults to EAGER, @OneToMany defaults to LAZY',
    what_is_it: L(
      '- **LAZY (lazy loading)**: fetches related data at the moment it is used.',
      '- **EAGER (eager loading)**: fetches related data right away when the entity is fetched.',
      '- **Proxy**: the placeholder put in place of the real object when LAZY is used. It only knows the id (number).',
    ),
    why_needed: 'To answer "Does this line send SQL?", you must know whether each relationship is LAZY or EAGER.',
    how_it_works: L(
      'Default table (memorize):',
      '```',
      '@ManyToOne   EAGER   (Review.store, Review.writer)',
      '@OneToOne    EAGER',
      '@OneToMany   LAZY    (Store.reviews)',
      '@ManyToMany  LAZY',
      '```',
      'A way to remember: "Ends in One means one item, so EAGER (right away); ends in Many means many, so LAZY (later)."',
      '',
      'Recommended in practice: set `fetch = FetchType.LAZY` everywhere, and use fetch join only where it is needed.',
      '',
      '`getReferenceById(id)`: 0 SQL right after the call; `getId()`: 0 SQL (the number is already known); `getName()`: 1 SQL (the real value is needed).',
      '',
      '**LazyInitializationException**: the error thrown when a proxy is opened after its transaction (session) has ended. It is not because the database is slow. Fix: inside the transaction, read the values you need into a DTO and pass that on.',
    ),
    real_example: 'After `zzimRepository.findAll()`, calling `zzim.getStore().getName()` inside a loop → 11 queries even with LAZY (1 + 10 favourites). Evidence that LAZY does not prevent N+1.',
    exercise: 'Open the Review entity. Write down the fetch setting on the store and writer fields. If nothing is written there, say what the default is.',
  },
  {
    key: 'owner-mappedby',
    capture_type: 'snippet',
    title: 'Relationship owner · foreign key · mappedBy',
    category: 'Spring Boot',
    tags: ['jpa', 'relationship', 'exam', 'topic a'],
    content: '@OneToMany(mappedBy = "store") private List<Review> reviews;',
    what_is_it: L(
      '- **Foreign key (FK)**: a number column that points to a row in another table. It always lives on the N (many) side → `review.store_id`',
      '- **Owner**: the field that can actually change the foreign key value → `Review.store`',
      '- **mappedBy**: marks "I am not the owner; I am a mirror (read-only)" → `Store.reviews`',
    ),
    why_needed: 'If you put a value only on the mirror side (the mappedBy side), the database does not change. In the exam this often appears as "Why is it not saved?"',
    how_it_works: L(
      '```text',
      'store table              review table',
      '┌────┬──────┐            ┌────┬─────────┬──────────┐',
      '│ id │ name │            │ id │ content │ store_id │ ← the foreign key lives here (N side)',
      '└────┴──────┘            └────┴─────────┴──────────┘',
      '',
      'Store.reviews  (mappedBy="store")  = mirror, read-only',
      'Review.store   (@ManyToOne)        = owner; change this to change store_id',
      '```',
    ),
    real_example: 'If you only do `store.getReviews().add(review)` and never call `review.setStore(store)` → review.store_id stays null (measured). This is why you create a convenience method that sets both sides.',
    exercise: 'Fill in the blanks: "The foreign key lives in the ___ table, the owner is the ___ field, and mappedBy means ___."',
  },
  {
    key: 'persistence-context',
    capture_type: 'note',
    title: 'Persistence context · dirty checking · first-level cache',
    category: 'Spring Boot',
    tags: ['jpa', 'persistence', 'exam', 'topic c'],
    content: 'Why does an UPDATE happen even though I never called save()?',
    what_is_it: L(
      '**Persistence context** = the "entity store" JPA keeps during a transaction.',
      '- **First-level cache**: if you find the same id twice in one transaction, the second lookup comes from the store (1 SQL in total).',
      '- **Dirty checking**: when an entity is first loaded, JPA takes a snapshot. At commit it compares the current values with the snapshot, and if anything changed it sends an UPDATE automatically.',
    ),
    why_needed: 'You need to be able to explain symptoms like "It was saved even though I did not call save" and "I changed the database but I get the old value back."',
    how_it_works: L(
      '```',
      '@Transactional',
      'void rename(Long id) {',
      '    Store s = storeRepository.findById(id).get();  // 1 SELECT + take a snapshot',
      '    s.changeName("new name");                       // no SQL (only memory changes)',
      '}                                                   // at commit: compare with snapshot → 1 UPDATE',
      '```',
      'Measured: findById + changing a value = 2 SQL (select + update).',
      '',
      'A bulk UPDATE (`@Modifying @Query("update ...")`) changes the database directly, bypassing the store, so the store keeps the old value. Fix: `@Modifying(clearAutomatically = true)`.',
      '',
      'In `@Transactional(readOnly = true)`, changed values are not saved.',
    ),
    real_example: 'Case 2 (favourite count 13): in Java, `store.getZzimCount() + 1` then save → 100 people read the same old value at once, and updates are lost. Fix: run `update store set zzim_count = zzim_count + 1` directly in the database.',
    exercise: 'If you call findById twice for the same id within one transaction, how many SQL statements run? Write the answer and the reason.',
  },
  {
    key: 'jpql-repository',
    capture_type: 'snippet',
    title: 'JPQL · Repository method names → SQL',
    category: 'Spring Boot',
    tags: ['jpa', 'jpql', 'exam', 'topic d'],
    content: 'existsByMemberIdAndStoreId(memberId, storeId)',
    what_is_it: L(
      '- **Query methods**: if you write just the method name following the rules, Spring Data JPA builds the SQL for you.',
      '- **JPQL**: SQL written with entity and field names rather than table names. `from Store s` (not the table name store).',
    ),
    why_needed: 'Topic D of the exam: guess the SQL from the method name, and tell apart when to use @Query and @Modifying.',
    how_it_works: L(
      '```',
      'find / exists / count / delete  +  By  +  field  +  And / Or / OrderBy',
      '',
      'findByName(name)                       → where name = ?',
      'existsByMemberIdAndStoreId(m, s)       → where member_id = ? and store_id = ?',
      'countByStoreId(id)                     → select count(*) ... where store_id = ?',
      'findByAreaOrderByZzimCountDesc(a)      → where area = ? order by zzim_count desc',
      '```',
      '- update and delete JPQL require `@Modifying`. The return value = the number of rows changed (int).',
      '- Match `:id` with `@Param("id")`.',
      '- `select new package.Dto(...)` fetches only the values you need → 1 SQL.',
    ),
    real_example: L(
      'Shape of the correct answer for cases 3 and 5 (conditional UPDATE):',
      '```java',
      '@Modifying',
      '@Query("update Customer c set c.point = c.point - :amount where c.id = :id and c.point >= :amount")',
      'int usePoint(@Param("id") Long id, @Param("amount") int amount);',
      '// returns 0 → not enough balance → throw an exception',
      '```',
    ),
    exercise: 'Write the where clause of the SQL that `deleteByStoreIdAndMemberId` produces.',
  },

  // ── 3. AI code verification ──────────────────────────────
  {
    key: 'defect-patterns',
    capture_type: 'note',
    title: 'Four patterns of defects in AI code (summary of nine defect-lab cases)',
    category: 'AI Tools',
    tags: ['ai code verification', 'exam', 'defect-lab'],
    content: 'The code looks fine on screen. Run the tests and 13 of 15 show red.',
    what_is_it: L(
      'Four defect shapes that keep appearing in AI-written code:',
      '```text',
      'Pattern                 How to spot it                              Cases    Direction of the fix',
      'Lookup inside a loop    related data fetched inside for/stream      1, (8)   DTO query, fetch join, findAllById',
      'Read → Java check → save  if-check and value change after findById   2, 3, 5   a single UPDATE where the database checks and changes',
      'Check, then save        save right after existsBy…                  2, 7     UNIQUE constraint + exception handling',
      'Trust the input         id from the URL, user text, AI answer, external response  4,6,8,9  owner check, th:text, database check, timeout',
      '```',
    ),
    why_needed: 'Instead of memorizing nine cases separately, group them into four patterns. Then you can find defects even in code you have never seen. Use this table too when you write the first line of the team verification log.',
    how_it_works: L(
      'Case → pattern → result:',
      '1 restaurant list N+1 → lookup inside a loop → 51 SQL → 1',
      '2 favourite count 13 → read/check/save + check-then-save → 13 → 100',
      '3 using more points than available → read/check/save → conditional UPDATE',
      '4 editing someone else\'s review + XSS → trusting input → 302 → 403, th:utext → th:text',
      '5 coupon used 4 times → read/check/save → 4 → 1',
      '6 viewing a customer of the shop next door → trusting input → 200 → 403, mask the phone number',
      '7 seven bookmark lines → check-then-save → UNIQUE constraint, 7 → 1',
      '8 AI-suggested tourist spot 9999 → trusting input → check against the database with findAllById',
      '9 weather server delay → trusting input → 1-second timeout + notice message, 5179 ms → about 1 second',
    ),
    real_example: L(
      'Frequently asked questions:',
      '- I added @Transactional, so why do I still have a concurrency problem? → A transaction only groups work into one unit. A plain MySQL select reads without locks, so it does not stop two requests from reading the same value.',
      '- What if I add synchronized? → It only works when there is one server. Let the database enforce the rule; that is safer.',
      '- The tests turn green when I change them? → Tests are the requirements. Changing a test to make it pass hides the defect. Do not follow the AI when it suggests this.',
    ),
    exercise: 'Search your team project for `existsBy` with Ctrl + Shift + F. If there is a save on the very next line, that is the "check, then save" pattern. Write one line about it in the verification log.',
  },

  // ── 4. Prompts ───────────────────────────────────────────
  {
    key: 'prompt-writing',
    capture_type: 'note',
    title: 'How to write a good prompt: a six-part template',
    category: 'AI Tools',
    tags: ['prompt', 'claude', 'ai'],
    content: 'Bad example: "Why does this not work?"  →  Good example: what you wanted to do / where / what you did / what came out / what you expected / what you want back',
    what_is_it: 'A message that asks an AI to do work. Like handing work to a new team member, good results need context + goal + a definition of "done."',
    why_needed: L(
      'An AI does not know your screen, your folders, or your level. It fills in missing information by guessing, and guesses are often wrong.',
      'A good prompt = a message the AI does not need to guess from.',
    ),
    how_it_works: L(
      '**Six-part template**',
      '```text',
      '1. Goal        : what you want to do (one sentence)',
      '2. Context     : which project, which file, which technology (Java 21, Spring Boot 3.4 ...)',
      '3. What I did  : what you have already tried',
      '4. Evidence    : the full error text, logs, and the real result (copy, do not summarize)',
      '5. My level    : for example, "I am a beginner at JPA; I know up to proxies"',
      '6. Done when   : what form you want back (code only / explanation first / three-line summary / until the tests pass)',
      '```',
      '',
      '**Seven good habits**',
      '1. Paste the full error. A summary drops the line that matters.',
      '2. Ask for one thing at a time. Split big work into steps.',
      '3. Include the "why": "It is for a presentation, so keep it short" → the AI judges correctly.',
      '4. Give one example: "in this shape," followed by a sample.',
      '5. Say what not to do: "Do not change the test code."',
      '6. Ask for verification: "After you fix it, run the tests and show me the result numbers."',
      '7. If the answer looks wrong, do not rewrite the request; continue from it: "Item 2 is good, but item 3 is wrong; the reason is ..."',
      '',
      '**The AI code verification view (linked to the exam)**',
      'Code the AI gives you is one kind of "trust the input" defect. Always do this: run it → test it → check the numbers → add one line to the verification log.',
    ),
    real_example: L(
      '```text',
      '[Goal] I want to fix the N+1 problem in defect-lab case 1.',
      '[Context] Spring Boot 3.4, JPA. StoreService.findStoreList() and StoreRepository.',
      '[What I did] I changed Store.reviews to EAGER, but the SQL count went up.',
      '[Evidence] Mission1 failed: expected: <1> but was: <51>',
      '[My level] I know the LAZY/EAGER defaults, but not the difference between fetch join and a DTO query.',
      '[Done when] Give me two hints first, not the answer code. Do not change the test code.',
      '```',
    ),
    exercise: 'Rewrite one question you asked an AI today using the six-part template. Write down which part was missing.',
  },
  {
    key: 'focusflow-guide',
    capture_type: 'note',
    title: 'How to work through exam study and tasks with Focus_Flow',
    category: 'Other',
    tags: ['focusflow', 'work', 'exam'],
    content: 'On its first run, Focus_Flow creates the "JPA exam · AI code verification prep" project automatically (in versions after develop).',
    what_is_it: L(
      'Focus_Flow = my app that breaks down to-dos into "project → assigned work → Task → Work Step."',
      'Engineering Academy = the app that checks whether I understood what I learned along the way.',
      '',
      'Dividing the roles: **Focus_Flow decides "what and when"; Academy checks "did I understand it."**',
    ),
    why_needed: 'When there is a lot to study, most of your energy goes into deciding what to start with. Focus_Flow picks one Task for today, and Academy checks whether you understood it.',
    how_it_works: L(
      '**The project structure it creates automatically**',
      '```text',
      'Project: JPA exam · AI code verification prep (11/18 ~ 11/28)',
      ' ├ Stage 1 preparation (11/18)   run defect-lab, confirm tests 2/15, five diagnostic questions',
      ' ├ Stage 2 concepts (11/19~21)   A·B·C·D  ← six Work Steps per Task',
      ' ├ Stage 3 cases (11/22~26)      cases 1–9 ← six Work Steps per Task (report → green light)',
      ' └ Stage 4 exam (11/27~28)       error notebook, mock exam, cheat sheet, 60-second explanation',
      'Workflow templates: "Six-step defect case investigation," "Six-part JPA concept study"',
      '```',
      '',
      '**Daily routine (it works for work tasks too)**',
      '1. Morning: in the Focus_Flow Overview, pick only one to three Tasks for today.',
      '2. Open a Task and go through its Work Steps from the top, one at a time. A step is complete only when you fill in its "record this" note.',
      '3. Save any stuck code or error straight away with Quick Capture in Academy.',
      '4. Evening: spend 10 minutes in the Academy Review Center. Add one line to the Daily Report in Focus_Flow.',
      '5. Friday: check the verification log (4_AI code verification log.xlsx). It is also registered as a Focus_Flow deadline.',
    ),
    real_example: L(
      'Continuing on a laptop right away:',
      '```powershell',
      'cd ~\\Desktop',
      'git clone git@github.com:Saeo-kim/FOCUS_FLOW.git',
      'cd FOCUS_FLOW\\Focus_Flow',
      'git switch feature/study-plan',
      'copy application-local.properties.example application-local.properties',
      'notepad application-local.properties   # enter the MySQL password',
      '.\\start-focusflow.bat',
      '```',
    ),
    exercise: 'Start Focus_Flow, open the "Case 1" Task, and check that its six Work Steps appear. In the "Report" step (step 1), write the symptoms you saw on screen.',
  },
];

const COMMANDS = [
  {
    key: 'execution-policy',
    title: 'Allow PowerShell scripts to run (Set-ExecutionPolicy)',
    category: 'DevOps',
    tags: ['powershell', 'windows', 'environment setup'],
    command: 'Set-ExecutionPolicy -Scope CurrentUser RemoteSigned',
    purpose: 'Allows the .ps1 scripts that npm, gradlew, and similar tools use to run in PowerShell. You only need to do this once on a new computer or laptop.',
    explanation: L(
      'By default Windows blocks PowerShell scripts (.ps1) from running (Restricted). This stops malicious scripts from running secretly.',
      '',
      '- `Set-ExecutionPolicy` = changes the execution policy (the rule)',
      '- `-Scope CurrentUser` = applies only to **you (the current user)**, not the whole computer. No administrator rights needed.',
      '- `RemoteSigned` = scripts you create on this computer may run; scripts downloaded from the internet must have a signature (an ID) to run.',
      '',
      'Policy levels: Restricted (blocks everything) < AllSigned < **RemoteSigned (recommended for developers)** < Unrestricted < Bypass (allows everything, risky)',
    ),
    expected_output: L(
      'If a message asks you to confirm the policy change, enter Y.',
      'To check: `Get-ExecutionPolicy -List` → the CurrentUser line shows RemoteSigned',
    ),
    common_mistakes: L(
      '- Running it without `-Scope` → it tries to apply to LocalMachine and fails with "administrator rights required."',
      '- Setting `Unrestricted` or `Bypass` to avoid the hassle → scripts downloaded from the internet also run without checks, which is risky.',
      '- If a .ps1 you downloaded still will not open, do not lower the policy. Check its contents first, then run `Unblock-File filename.ps1`.',
    ),
  },
  {
    key: 'gradle-mission-test',
    title: 'Run one defect-lab case test only',
    category: 'Java',
    tags: ['gradle', 'defect-lab', 'exam'],
    command: '.\\gradlew.bat test --tests "*Mission1*"',
    purpose: 'Quickly runs the test for one case, to check for red or green.',
    explanation: '`.\\` = the folder you are in, `gradlew.bat` = the Gradle runner included in the project, `--tests "*Mission1*"` = only tests whose names contain Mission1.',
    expected_output: 'BUILD SUCCESSFUL (green) or FAILED + expected: <1> but was: <51> (red)',
    common_mistakes: 'Running it outside the project folder (where gradlew.bat is) → "is not recognized." Check first with `ls` that gradlew.bat is listed. For the concurrency cases (2, 3, 5, 7), run it three times.',
  },
  {
    key: 'show-sql',
    title: 'See the SQL JPA sends in the console',
    category: 'Spring Boot',
    tags: ['jpa', 'n+1', 'debugging'],
    command: 'logging.level.org.hibernate.SQL=debug',
    purpose: 'To count "invisible SQL" such as N+1 with your own eyes.',
    explanation: 'Put this in application.properties (or application.yml). Hibernate then prints every SQL statement it runs to the console. Adding `spring.jpa.properties.hibernate.format_sql=true` makes the output easier to read by breaking lines. `generate_statistics=true` also gives SQL counts per request.',
    expected_output: 'Hibernate: select s1_0.id, s1_0.name ... from store s1_0',
    common_mistakes: 'Turning on both this and `spring.jpa.show-sql=true` prints each SQL twice. Use just one.',
  },
];

const ERRORS = [
  {
    key: 'ps-script-blocked',
    title: 'PowerShell: scripts cannot run on this system…',
    category: 'DevOps',
    tags: ['powershell', 'windows'],
    error_message: L(
      'npm : File C:\\Program Files\\nodejs\\npm.ps1 cannot be loaded because running scripts is disabled on this system.',
      'For more information, see about_Execution_Policies (https://go.microsoft.com/fwlink/?LinkID=135170).',
      '+ CategoryInfo          : SecurityError: (:) [], PSSecurityException',
      '+ FullyQualifiedErrorId : UnauthorizedAccess',
    ),
    root_cause: 'Windows\'s default PowerShell execution policy is Restricted, so scripts such as npm.ps1 are blocked.',
    investigation: '1. `UnauthorizedAccess` and `PSSecurityException` at the end of the error = a permissions problem.\n2. Check with `Get-ExecutionPolicy -List` → everything shows Undefined (= Restricted).',
    solution: 'Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, then enter Y.',
    files_affected: 'None (a Windows setting)',
    verification: '`npm -v` prints a version number.',
    lessons: 'Put this at the top of the list of first things to do when setting up a new computer or laptop. Do not lower the policy to Unrestricted.',
  },
  {
    key: 'lazy-init',
    title: 'LazyInitializationException: could not initialize proxy - no Session',
    category: 'Spring Boot',
    tags: ['jpa', 'lazy', 'exam'],
    error_message: 'org.hibernate.LazyInitializationException: failed to lazily initialize a collection of role: Store.reviews: could not initialize proxy - no Session',
    root_cause: 'After the transaction (session) ended, a controller or view tried to open LAZY related data (a proxy). This happens often in environments with open-in-view: false.',
    investigation: '1. "role: Store.reviews" in the error tells you which relationship it is.\n2. Find where that value is first touched (usually a Controller or a Thymeleaf template).\n3. Check whether that point is outside the @Transactional scope.',
    solution: 'In the Service (inside @Transactional), read the values you need ahead of time, turn them into a DTO, and return that. Or fetch them together with a fetch join.',
    files_affected: 'StoreService.java, StoreController.java',
    verification: 'The page displays correctly, and the SQL log shows no extra select.',
    lessons: 'This error is not caused by a slow database. Remember it as one sentence: "accessing a lazy value after the session has closed." Do not pass entities all the way to the screen; use DTOs.',
  },
];

const WORKFLOWS = [
  {
    key: 'case-investigation',
    title: 'Six-step defect case investigation (hands-on exam practice for AI code verification)',
    category: 'AI Tools',
    tags: ['ai code verification', 'defect-lab', 'exam'],
    goal: 'Find one defect in AI-written code, fix it, prove the fix with numbers, and record it in the verification log.',
    prerequisites: 'defect-lab runs, MySQL (lab / lab1234) is on, tests can be run.',
    steps: L(
      '1. Report: in the running app, press the problem screen yourself.',
      '2. Scene: in IntelliJ, run the Mission test for that case → confirm red.',
      '3. Evidence: read the failure message and the [measurement] numbers. "What did I expect, and what came out?" (expected 1, but was 51).',
      '4. Suspects: go through Controller → Service → Repository, one line at a time. For each line ask, "Does SQL run here?"',
      '5. Culprit and fix: before looking at the answer, write one guess. Then change only src/main (never the tests).',
      '6. Green light: run again → check how the numbers changed → one line in the verification log (defect / evidence / before→after / cause / improvement / prevention).',
    ),
    verification: 'The Mission test is green. For the concurrency cases (2, 3, 5, 7), run it three times and get the same correct value all three times.',
    pitfalls: 'Making it green by changing the test (hiding the defect). Believing you fixed it with synchronized. Stopping after one passing run.',
  },
  {
    key: 'jpa-exam-routine',
    title: 'A 10-day routine for the JPA exam',
    category: 'Spring Boot',
    tags: ['jpa', 'exam', 'study method'],
    goal: 'Be able to explain all four topics, and predict the SQL count by reading code.',
    prerequisites: 'The study guide (HTML), defect-lab, and this app (Engineering Academy).',
    steps: L(
      'Day 1  Five-question diagnostic → decide the order of your weak topics',
      'Day 2  A Relationships: read the six parts → explain "relationship owner" in Academy',
      'Day 3  B N+1 · LAZY (the most important, two days): trace the one-page diagram by hand',
      'Day 4  B continued: explain in words the "reason" behind each number in the measurement table. Dissect unclear lines in the Code Explainer',
      'Day 5  C Persistence context → D JPQL',
      'Day 6–8  Cases 1 → 2 → 3, then 4·6, then 5·7 (try alone first), then 8·9',
      'Day 9  Error notebook + 20-question mock exam, 30 minutes',
      'Day 10 Print the A4 cheat sheet → hide the keywords and fill them in from memory → record a 60-second explanation of one defect',
    ),
    verification: 'In Academy Progress, all the JPA records are Explained (3/5) or higher. You can talk through the topics you got wrong on the mock exam.',
    pitfalls: 'Only rereading from the beginning. Memorizing measured numbers without knowing the reasons. Pushing the mock exam to the night before the real exam.',
  },
  {
    key: 'prompt-workflow',
    title: 'Getting work from an AI: five steps from prompt to verification',
    category: 'AI Tools',
    tags: ['prompt', 'ai code verification'],
    goal: 'Do not take AI results at face value. Only put verified results into your code.',
    prerequisites: 'The six-part prompt template (Knowledge Library).',
    steps: L(
      '1. Write: the six-part template (goal · context · what I did · evidence · my level · done when)',
      '2. Receive: read the explanation of "why it was changed this way" before the code.',
      '3. Dissect: put any line you do not understand into the Code Explainer and check it word by word.',
      '4. Verify: run it + test it + check the numbers (SQL count, response time, row count).',
      '5. Record: one line in the verification log + Academy Capture.',
    ),
    verification: 'You can explain each line of the code yourself (Explain it back scores 60 or higher).',
    pitfalls: 'Only writing "fix this." Sending a summary of the error. Accepting an AI suggestion to change the tests.',
  },
  {
    key: 'new-laptop',
    title: 'Continuing work in SAEO-WORKSPACE on a laptop',
    category: 'Git / GitHub',
    tags: ['git', 'laptop', 'environment setup'],
    goal: 'Work from the same up-to-date code on the lab PC and on the laptop.',
    prerequisites: 'Git, Node.js 22.13+, JDK 21, and MySQL 8 installed. An SSH key registered with GitHub (Saeo-kim).',
    steps: L(
      'Set-ExecutionPolicy -Scope CurrentUser RemoteSigned',
      'mkdir ~\\Desktop\\SAEO-WORKSPACE; cd ~\\Desktop\\SAEO-WORKSPACE',
      'git clone git@github.com:Saeo-kim/engineering-academy.git',
      'git clone git@github.com:Saeo-kim/owners-office.git',
      'git clone git@github.com:Saeo-kim/FOCUS_FLOW.git',
      'git clone git@github.com:Saeo-kim/saeo-labs.git',
      'git clone git@github.com:Saeo-kim/the-expansion.git',
      'git clone git@github.com:Saeo-kim/LiguaSpace.git',
      '# always before starting work',
      'git pull',
      '# always after finishing work',
      'git add -A; git commit -m "what and why"; git push',
    ),
    verification: '`git log -1` shows the same commit on both computers.',
    pitfalls: 'Starting work without pulling → conflicts. The data/ folder (your study-record database) is not uploaded to Git. To move it, copy the data/academy.db file directly.',
  },
];

const LINKS = [
  ['knowledge:n-plus-one-ko', 'knowledge:lazy-proxy'],
  ['knowledge:n-plus-one-ko', 'knowledge:jpql-repository'],
  ['knowledge:n-plus-one-ko', 'commands:show-sql'],
  ['knowledge:n-plus-one-ko', 'knowledge:defect-patterns'],
  ['knowledge:lazy-proxy', 'errors:lazy-init'],
  ['knowledge:lazy-proxy', 'knowledge:owner-mappedby'],
  ['knowledge:persistence-context', 'knowledge:jpql-repository'],
  ['knowledge:jpa-exam-structure', 'workflows:jpa-exam-routine'],
  ['knowledge:jpa-exam-structure', 'knowledge:n-plus-one-ko'],
  ['knowledge:defect-patterns', 'workflows:case-investigation'],
  ['workflows:case-investigation', 'commands:gradle-mission-test'],
  ['knowledge:prompt-writing', 'workflows:prompt-workflow'],
  ['knowledge:focusflow-guide', 'workflows:jpa-exam-routine'],
  ['knowledge:focusflow-guide', 'workflows:new-laptop'],
  ['commands:execution-policy', 'errors:ps-script-blocked'],
  ['workflows:new-laptop', 'commands:execution-policy'],
  ['knowledge:pc-parts', 'knowledge:folders-paths'],
  ['knowledge:shortcuts-windows', 'knowledge:shortcuts-ide'],
  ['knowledge:how-to-learn', 'knowledge:prompt-writing'],
];

// Learning tracks shown on the Curriculum page, in study order.
export const TRACKS = [
  { id: 'start', title: '0. How to study when you are stuck', intro: 'Start here if you keep re-reading the same material. The order this app follows is explained here too.', items: ['knowledge:how-to-learn', 'knowledge:study-principles'] },
  {
    id: 'computer',
    title: '1. Computer basics',
    intro: 'Specs (RAM), folders and paths, shortcuts, and Bash. Half of development errors get stuck here.',
    items: ['knowledge:pc-parts', 'knowledge:folders-paths', 'knowledge:shortcuts-windows', 'knowledge:shortcuts-ide', 'knowledge:bash-basics', 'commands:execution-policy', 'errors:ps-script-blocked'],
  },
  {
    id: 'jpa',
    title: '2. JPA exam',
    intro: 'Exam structure → A relationships (how to read Review.store) → B EAGER · LAZY · N+1 → C persistence → D JPQL.',
    items: ['knowledge:jpa-exam-structure', 'knowledge:review-store-notation', 'knowledge:owner-mappedby', 'knowledge:eager-lazy-truth', 'knowledge:n-plus-one-ko', 'knowledge:lazy-proxy', 'errors:lazy-init', 'knowledge:persistence-context', 'knowledge:jpql-repository', 'commands:show-sql', 'workflows:jpa-exam-routine'],
  },
  {
    id: 'verify',
    title: '3. AI code verification (defect lab)',
    intro: 'Four defect patterns and the six-step case investigation.',
    items: ['knowledge:defect-patterns', 'workflows:case-investigation', 'commands:gradle-mission-test'],
  },
  { id: 'prompt', title: '4. How to write good prompts', intro: 'Getting work from an AI, and verifying the results.', items: ['knowledge:prompt-writing', 'workflows:prompt-workflow', 'knowledge:tokens-english'] },
  {
    id: 'claude',
    title: '5. Working with Claude (without being led by the AI)',
    intro: 'What Claude is, how to direct it and verify its work, and how much of an answer you need to understand.',
    items: ['knowledge:claude-what', 'knowledge:claude-dev', 'knowledge:claude-how-much', 'knowledge:workspace-registry'],
  },
  { id: 'focusflow', title: '6. Focus_Flow and your work setup', intro: 'What and when (Focus_Flow) + did I understand it (Academy) + working from anywhere.', items: ['knowledge:focusflow-guide', 'knowledge:actions-bot', 'workflows:new-laptop', 'workflows:laptop-migration'] },
];

const PACKS = [
  { flag: 'curriculum_ko_v1', ids: 'curriculum_ko_v1_ids', records: () => ({ knowledge: KNOWLEDGE, commands: COMMANDS, errors: ERRORS, workflows: WORKFLOWS }), links: () => LINKS },
  { flag: 'curriculum_ko_v2', ids: 'curriculum_ko_v2_ids', records: () => ({ knowledge: KNOWLEDGE_V2, workflows: WORKFLOWS_V2 }), links: () => LINKS_V2 },
];

function allIds(db) {
  const ids = {};
  for (const pack of PACKS) {
    const row = db.prepare('SELECT value FROM meta WHERE key = ?').get(pack.ids);
    if (row) Object.assign(ids, JSON.parse(row.value));
  }
  return ids;
}

// Installs every pack this database does not have yet. Returns how many were added.
export function installCurriculum(repo) {
  const { db, clean, insertRow, logActivity, transaction, orderedPair } = repo.internals;
  let installed = 0;
  for (const pack of PACKS) {
    if (db.prepare('SELECT 1 FROM meta WHERE key = ?').get(pack.flag)) continue;
    transaction(() => {
      const ids = {};
      for (const [kind, records] of Object.entries(pack.records())) {
        for (const { key, ...fields } of records) {
          const id = insertRow(kind, clean(kind, fields));
          ids[`${kind}:${key}`] = id;
          logActivity('created', kind, id, fields.title);
        }
      }
      db.prepare('INSERT INTO meta (key, value) VALUES (?, ?)').run(pack.ids, JSON.stringify(ids));
      const known = allIds(db);
      const link = db.prepare('INSERT OR IGNORE INTO links (a_kind, a_id, b_kind, b_id) VALUES (?, ?, ?, ?)');
      for (const [a, b] of pack.links()) {
        if (known[a] && known[b]) link.run(...orderedPair(a.split(':')[0], known[a], b.split(':')[0], known[b]));
      }
      db.prepare('INSERT INTO meta (key, value) VALUES (?, ?)').run(pack.flag, new Date().toISOString());
    });
    installed += 1;
  }
  return installed > 0;
}

// Tracks with live record titles and stages. Records the user deleted are skipped.
export function curriculum(repo, learning) {
  const { db } = repo.internals;
  const ids = allIds(db);
  return TRACKS.map((track) => ({
    ...track,
    items: track.items
      .map((ref) => {
        const [kind] = ref.split(':');
        const id = ids[ref];
        if (!id) return null;
        const record = db.prepare(`SELECT id, title FROM ${kind} WHERE id = ?`).get(id);
        if (!record) return null;
        let stage = 1;
        try {
          stage = learning.state(kind, id).stage;
        } catch {
          /* stage stays 1 */
        }
        return { kind, id, title: record.title, stage };
      })
      .filter(Boolean),
  }));
}
