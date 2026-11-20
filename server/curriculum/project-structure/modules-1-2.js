// Module 01 (Project Anatomy) and Module 02 (Folder Roles).
import { lesson, moduleOf } from './helpers.js';

const tree = (text) => '```\n' + text.trim() + '\n```';

export const MODULE_01 = moduleOf(
  'anatomy',
  'Module 01: Project Anatomy',
  'Beginner',
  'The basic units that make up a project: project, repository, folder, file, path, root, and source versus resources. You need these words exactly before you can read anything else.',
  ['Explain the difference between a project and a repository.', 'Read a file path and find the root directory.', 'Tell source code apart from resources.'],
  [
    lesson(
      'project-vs-repository',
      'Project vs Repository',
      15,
      'A project (project) is the whole collection of files gathered for one purpose. A repository (repository, or "repo" for short) is the place where Git records how those files have changed over time.',
      {
        what: 'A project is "all the files gathered to build something." It includes source code, configuration files, documents, and even images. A repository is the space where Git manages that project. Inside the hidden `.git` folder are all the change records (commits).',
        why: 'To share one project between several people, go back to an earlier state, and track which line changed, when, and why, you need a repository. The project decides what you build; the repository records how it changed.',
        where: 'The top-level folder of a repository is the project root. The `.git` folder is usually hidden in the root, next to project files such as `src` and `build.gradle`.',
        missing: 'Without `.git`, the project still runs, but you cannot undo mistakes, see the history, or merge work with others. Conversely, `.git` without project files gives you nothing to build.',
        connects: 'The repository watches the whole project. Files listed in `.gitignore` are left out of the repository, and changes to the rest are recorded as commits.',
        usage: 'When you `git clone` a Spring Boot project from GitHub, the folder you get is both a project and a repository. You will do this in the Project Reading Lab later in this course.',
      },
      {
        keyTerms: [
          ['project', 'A collection of files gathered for one purpose.'],
          ['repository (repo)', 'The place that keeps a project\'s files and change history. Git manages it.'],
          ['commit', 'One recorded change in a repository. It keeps "when, who, and what changed."'],
        ],
        example: tree(`
my-blog/            ← the project, and the repository root
├── .git/           ← the repository\'s change history (usually hidden)
├── .gitignore      ← the list of files the repository leaves out
├── build.gradle    ← project configuration
└── src/            ← the project\'s source code
`),
        practice: 'Pick a folder on your computer and check whether it contains a `.git` folder. If it does, it is a repository; if not, it is just a project folder. Write one sentence describing the difference.',
        check: [
          { q: 'What does a repository do?', a: 'It records and manages the change history (commits) of files. It does not create the project files themselves.' },
          { q: 'Can a project without a `.git` folder still run?', a: 'Yes. Running depends on the source and configuration. However, you cannot track its change history or merge it with other people\'s work.' },
        ],
        videoQuery: 'git repository vs project folder explained beginner',
      },
    ),
    lesson(
      'folder-vs-directory',
      'Folder vs Directory',
      10,
      'A folder (folder) and a directory (directory) refer to the same thing. Screens call them folders; commands and technical documents call them directories.',
      {
        what: 'A directory is the box a file system uses to group files. Windows Explorer and macOS Finder label it "folder," while the terminal (`ls`, `cd`) and technical documents say "directory." Directories can contain other directories, which creates a hierarchy.',
        why: 'Once you have hundreds of files, scattering them is a problem. Grouping them in directories lets you tell what a file is for just from its name.',
        where: 'Directories split by role inside a project. For example, source code goes in `src`, configuration in `config`, and output in `build`. The location itself tells you the role.',
        missing: 'If every file sits in one directory, you cannot tell source from configuration. Build tools read only files in the places they expect, so files in the wrong place are ignored or cannot be found.',
        connects: 'Directories connect to each other through `..` (up) and `.` (here). Build tools and frameworks find files through agreed conventions, such as "read everything under this directory."',
        usage: 'Spring Boot finds classes automatically under the `src/main/java` directory. The location of a directory is its operating rule.',
      },
      {
        keyTerms: [
          ['directory', 'A box that groups files. Screens call it a folder.'],
          ['hierarchy', 'Directories inside directories, forming a tree shape.'],
          ['convention', 'An agreed rule that tools follow in order to read files from fixed places.'],
        ],
        example: tree(`
src/                    ← a directory (folder)
└── main/               ← a directory inside it
    └── java/           ← the directory where Java source goes
`),
        practice: 'In Explorer or a terminal, find three directories in the project and write down the kind of files each one contains.',
        check: [
          { q: 'What is the difference between "folder" and "directory"?', a: 'They refer to almost the same thing. Folder is the everyday word on screens; directory is the word in commands and technical documents.' },
          { q: 'Why does the location of a directory matter?', a: 'Tools are designed to read fixed locations. If a file is in the wrong place, the tool cannot find it or ignores it.' },
        ],
      },
    ),
    lesson(
      'file-and-extension',
      'File and File Extension',
      15,
      'A file (file) is one unit of data. A file extension (file extension) is the short label after the last dot in the name, showing what kind of file it is.',
      {
        what: 'A file is a unit with content, such as text, code, or an image. The extension is the short label after the last dot, as in `.java` in `UserController.java`. The operating system and editors use the extension to decide which program opens the file.',
        why: 'A computer cannot easily tell a file\'s type from its content alone. The extension is the simplest agreement that tells both people and tools "this is Java code."',
        where: 'The extension is at the very end of the file name. Source files usually sit under `src`, and configuration files under `config` or `src/main/resources`, each with its extension.',
        missing: 'If the extension is missing or wrong, editors show the wrong colours or build tools ignore the file. For example, `Main.java.txt` is not compiled by the Java compiler.',
        connects: 'Build tools choose files by extension. For example, `.java` is compiled; `.html` and `.css` are read by the browser.',
        usage: 'In a Spring Boot project, `.java` holds logic, `.properties` and `.yml` hold configuration, and `.html` holds screen templates. The extension alone hints at the role.',
      },
      {
        keyTerms: [
          ['file', 'A unit of data with content.'],
          ['file extension', 'The "dot plus letters" at the end of a file name, marking the file type.'],
          ['file name', 'The full name of a file, including its extension.'],
        ],
        example: tree(`
UserController.java      ← extension .java: Java source code
application.yml          ← extension .yml: configuration file
index.html               ← extension .html: a web page
`),
        practice: 'Pick five files with different extensions in a project, and write one line for each explaining what the extension means.',
        check: [
          { q: 'What is the extension of `README.md`?', a: '`.md`. It is a Markdown document file.' },
          { q: 'If I rename a file to `.txt`, does it become a Java file?', a: 'No. Only the name changes; the content stays the same. To be a Java file, the content must be written in Java syntax.' },
        ],
      },
    ),
    lesson(
      'file-path',
      'File Path',
      15,
      'A file path (file path) is the address that says where a file is. It lists the folder names from the root onward, separated by `/`.',
      {
        what: 'There are two kinds of paths. An absolute path starts from the root, such as `/` or `C:\\`, and is the full address. A relative path starts from where you are now. For example, `src/main/java/App.java`.',
        why: 'A project can contain several files with the same name. A path is the only exact way to point to "which file in which folder."',
        where: 'Paths written in configuration files or code are usually relative to the project root, so knowing where the root is matters most.',
        missing: 'A wrong path produces the error "No such file or directory." Running from the wrong location is especially dangerous, because the same relative path then points to a different file.',
        connects: 'Paths in Spring\'s `@Value` or `spring.config.import`, HTML\'s `<link href="/css/style.css">`, and Gradle\'s `sourceSets` all connect to files through paths.',
        usage: 'The `/css/style.css` in HTML maps to `src/main/resources/static/css/style.css`. Once you can read paths, you can trace which file a screen uses.',
      },
      {
        keyTerms: [
          ['absolute path', 'The full address starting from the root (`/`) or a drive (`C:\\`).'],
          ['relative path', 'An address relative to the current location. Uses `./` and `../`.'],
          ['separator', 'The character that separates folders in a path. Web and Gradle use `/`.'],
        ],
        example: tree(`
Project root: my-blog/

Absolute path: /home/me/my-blog/src/main/java/App.java
Relative path: src/main/java/App.java     (seen from the root)
               ../my-blog/src/...         (seen from another folder)
`),
        practice: 'Pick a file in the project and write its relative path from the root. Open the file in Explorer to confirm the path is correct.',
        check: [
          { q: 'What is the difference between an absolute path and a relative path?', a: 'An absolute path is the full address from the root; a relative path starts from where you are now.' },
          { q: 'What does `../` mean?', a: 'It means the directory one level up.' },
        ],
      },
    ),
    lesson(
      'root-directory',
      'Root Directory',
      10,
      'The root directory (root directory) is the outermost folder of a project. The build configuration files are here, and most relative paths start from this location.',
      {
        what: 'The root is the folder you see first when you open a project. To distinguish it from the root of the whole file system (`/`), it is usually called the project root.',
        why: 'It gathers all the paths and tool settings into one place where they start. When the root is clear, every file can be found in the same way.',
        where: 'The root usually contains `build.gradle` or `pom.xml`, `README.md`, `.gitignore`, `src`, and the build output folder.',
        missing: 'Run from the wrong place and `./gradlew build` fails with "gradlew: not found," and the configuration files cannot be found either. This is a common mistake made by running commands from a subfolder.',
        connects: 'The root `build.gradle` knows `src` is the source, writes results to `build`, and `application.yml` is read from `src/main/resources`. All of them are relative to the root.',
        usage: 'In a Spring Boot project, `./gradlew bootRun` must always be run from the root, so that `build.gradle` and `src` can be found.',
      },
      {
        keyTerms: [
          ['project root', 'The outermost folder of a project, where the configuration files are.'],
          ['working directory', 'The location a command runs from. This is why you run commands from the root.'],
        ],
        example: tree(`
my-blog/                ← project root
├── build.gradle        ← build configuration
├── settings.gradle
├── gradlew             ← build command run from the root
├── src/                ← source
└── build/              ← output
`),
        practice: 'Open a terminal and check your current location with `pwd` (or `cd`). Confirm you are in the root, where `build.gradle` is listed. If not, find which folder you are in instead.',
        check: [
          { q: 'What happens if you run the build command inside the `src` folder?', a: 'It fails because it cannot find `build.gradle`. Build commands are normally run from the project root.' },
          { q: 'How can you tell which folder is the root?', a: 'It is the outermost folder that contains the build configuration file (`build.gradle` or `pom.xml`) together with the `src` folder.' },
        ],
      },
    ),
    lesson(
      'source-vs-resources',
      'Source Code vs Resources',
      15,
      'Source code (source code) is the program instructions people write, which are compiled or interpreted. Resources (resources) are the configuration, templates, static files, and data that a program only reads while it runs.',
      {
        what: 'Source code is logic written in files such as `.java` or `.ts`. Resources are files that are not code but are needed to run: `application.yml`, HTML templates, CSS, images, and translation files.',
        why: 'Separating logic from configuration lets you change behaviour by editing configuration, without touching code. A person changing screen design and a person writing logic need to touch the same files less.',
        where: 'In Spring Boot, source goes in `src/main/java` and resources in `src/main/resources`. The names of these two directories divide the roles.',
        missing: 'If a resource is in the source folder, the build tool does not include it in the program, so running fails with "file not found." Putting source in the resources folder means it is not compiled.',
        connects: 'Source code reads configuration values from resources, such as `@Value("${app.name}")`. Templates receive data from source model objects to build a screen.',
        usage: 'When you build a Spring Boot app, the contents of `src/main/resources` are packed inside the executable (jar). That is why one jar file alone can run both the configuration and the screens.',
      },
      {
        keyTerms: [
          ['source code', 'Program instructions written by people.'],
          ['resources', 'Configuration, templates, static files, and data that code only reads.'],
          ['compile', 'The process of turning source code into a form that can run.'],
        ],
        example: tree(`
src/main/java/...        ← source code (.java): compiled
src/main/resources/
├── application.yml      ← resource: configuration
├── static/css/app.css   ← resource: static file
└── templates/index.html ← resource: template
`),
        practice: 'Pick two source files and two resource files in the project. Sort each one as "a person wrote the logic" or "read only, while the program runs."',
        check: [
          { q: 'Is `application.yml` source code or a resource?', a: 'A resource. It is configuration read while the program runs, not logic.' },
          { q: 'What problem happens if a resource is placed in `src/main/java`?', a: 'It is treated as something to compile, so it is awkward to use as a resource, and it may not be found where expected.' },
        ],
        videoQuery: 'spring boot src/main/java vs src/main/resources explained',
      },
    ),
  ],
  {
    title: 'Robot teardown report',
    description: 'Pick one real project and draw its root-level structure as a one-page map.',
    deliverables: ['A list of the top-level folders and files under the root', 'A table separating source from resources, with one line of description for each item', 'Three files with their relative paths written out'],
  },
);

export const MODULE_02 = moduleOf(
  'folder-roles',
  'Module 02: Folder Roles',
  'Beginner',
  'What the main folders in a project (src, main, test, static, templates, config, resources, build, target, dist) are for, and how the three that are easy to confuse (static, templates, config) differ.',
  ['Guess a folder\'s role from its name alone.', 'Explain the difference between static, templates, and config.', 'Tell result folders (build, target, dist) apart from source folders.'],
  [
    lesson(
      'folder-src',
      'src',
      12,
      '`src` (source) is the folder that holds the source code and resources you write yourself. It is the place you open most often in a project.',
      {
        what: '`src` is short for "source." In a Java/Spring project the standard layout splits it into `main` (the real app) and `test` (tests).',
        why: 'It separates the files people write from the files the build creates. `src` is the signal that says "change things here."',
        where: 'It sits directly under the root, so the build tool can find `src` and compile it.',
        missing: 'Without `src` there is nothing to build, so no executable can be produced. Renaming it to something like `source` makes Gradle\'s default settings unable to find it.',
        connects: '`src/main` builds the app, and `src/test` follows the same structure to hold tests. The `build` folder takes `src` as input and produces the results.',
        usage: 'In a Spring Boot project, almost all the code you change lives under `src/main/java`.',
      },
      {
        keyTerms: [['src', 'The top-level folder that holds source code and resources.']],
        example: tree(`
my-blog/
└── src/
    ├── main/            ← the real app
    └── test/            ← tests
`),
        practice: 'Open `src` and list every folder one level below it. Mark whether each belongs to `main` or `test`.',
        check: [
          { q: 'Under which folder does the code a person edits usually live?', a: 'Under `src`. In Spring Boot, `src/main` is the centre.' },
          { q: 'What is the difference between `build` and `src`?', a: '`src` is what people write; `build` is the output the build tool produces from `src`.' },
        ],
      },
    ),
    lesson(
      'folder-main',
      'main',
      12,
      '`src/main` is where the code and resources of the app that actually runs are kept. Everything that is not a test lives here.',
      {
        what: '`src/main` has two important subfolders: `java` (Java code) and `resources` (configuration, screens, and static files).',
        why: 'Separating the real app from the tests keeps test code from being packaged into the executable. The name `main` means "the star of the program."',
        where: 'It sits directly under `src`. Gradle and Maven treat this location as the default source.',
        missing: 'Without `main`, Spring Boot cannot find the application class, so the app does not start.',
        connects: 'Classes in `src/main/java` read settings from `src/main/resources`. The two places together make one app.',
        usage: 'The starting point of a Spring Boot app (the class marked `@SpringBootApplication`) lives under `src/main/java`.',
      },
      {
        keyTerms: [['main', 'The folder that holds the source and resources of the real app, separate from tests.']],
        example: tree(`
src/main/
├── java/com/example/blog/     ← Java code
└── resources/                 ← configuration, screens, static files
`),
        practice: 'In `src/main/java`, find the class marked `@SpringBootApplication` and write its file path.',
        check: [
          { q: 'What is the difference between `src/main` and `src/test`?', a: '`src/main` is the app that runs; `src/test` is the test code that verifies the app.' },
          { q: 'Where is the application\'s starting class?', a: 'Under `src/main/java`.' },
        ],
      },
    ),
    lesson(
      'folder-test',
      'test',
      10,
      '`src/test` holds the test code that checks whether the app behaves correctly. It is not included in the executable.',
      {
        what: 'Test code automatically checks statements such as "if I give this function this value, this result should come out." It is written under `src/test/java` with the same package structure as `main`.',
        why: 'Checking every feature by hand after each change is slow and error-prone. Tests repeat the same checks automatically.',
        where: 'It sits at the same level as `src/main`. This lets the build run the tests separately from the executable.',
        missing: 'Without a test folder, `./gradlew test` has nothing to run and checks nothing. You would not know about failures.',
        connects: 'Tests use classes from `src/main` and test a class with a matching name. Test results are written to `build/reports`.',
        usage: 'A test such as `UserServiceTest.java`, which checks the `Service` class, sits next to it under `src/test/java`.',
      },
      {
        keyTerms: [['test', 'Code that checks automatically whether other code behaves as expected.']],
        example: tree(`
src/test/java/com/example/blog/
└── UserServiceTest.java    ← verifies UserService in src/main
`),
        practice: 'Check whether `src/test` exists. If it does, write down the name of one test file and which class it verifies.',
        check: [
          { q: 'Are test files packaged into the executable (jar)?', a: 'Usually not. `src/test` is used only when running tests.' },
          { q: 'What does a failing test tell you?', a: 'That the code behaves differently from what was expected. The failure message and report show where.' },
        ],
      },
    ),
    lesson(
      'folder-static',
      'static',
      15,
      '`static` is the folder for files (CSS, JavaScript, images) that the server sends to the browser as they are, without computing anything. The same file goes to everyone with the same content.',
      {
        what: 'Static files are files whose content does not change while the program runs. `css/style.css`, `js/app.js`, and `img/logo.png` are examples. The server finds the file and copies it out unchanged.',
        why: 'Styles and scripts are the same for every user. There is no reason to build them with server code; sending them as they are is fast and simple.',
        where: 'In Spring Boot, they go in `src/main/resources/static`. The folder name is fixed by Spring, so it lines up directly with the URL path.',
        missing: 'Without `static`, a request for `/css/style.css` returns a 404 error and the page appears broken without styles. Renaming the folder to `public` means Spring\'s default settings cannot find it.',
        connects: 'Templates in `templates` call `static` files with `<link href="/css/style.css">`. The URL `/css/...` corresponds to the folder `static/css/...`.',
        usage: 'In a Spring Boot project, this is the default place for logos, shared CSS, and shared JavaScript.',
      },
      {
        keyTerms: [
          ['static file', 'A file whose content does not change at run time and is sent as it is.'],
          ['static resource', 'The same idea under another name: the server delivers the file without computing it.'],
        ],
        example: tree(`
src/main/resources/static/
├── css/style.css     → browser request: /css/style.css
├── js/app.js         → browser request: /js/app.js
└── img/logo.png      → browser request: /img/logo.png
`),
        practice: 'Create a CSS file in the `static` folder, then open `http://localhost:8080/css/<filename>` in a browser.',
        check: [
          { q: 'Does the content of a static file change for different users?', a: 'No. The same file goes out with the same content. Content that differs per user is produced by templates or APIs.' },
          { q: 'Which folder does the browser request `/css/style.css` point to?', a: '`src/main/resources/static/css/style.css`.' },
        ],
      },
    ),
    lesson(
      'folder-templates',
      'templates',
      15,
      '`templates` is the folder for "HTML with blanks" that the server fills with data to build an HTML screen. Each user\'s content is filled in here.',
      {
        what: 'A template is an HTML skeleton. It has blanks such as `${user.name}`, and the server puts in the real values to send out finished HTML. In Spring Boot, Thymeleaf does this job.',
        why: 'When you want to show the same screen layout many times with different content, you need this. Keeping the screen structure in one file makes it easy to change.',
        where: 'The default location in Spring Boot is `src/main/resources/templates`. The server looks here for templates.',
        missing: 'If the template is missing or the name is wrong, you get "Template might not exist" and the screen does not appear. The name the controller returns must exactly match the file name.',
        connects: 'When a Controller returns a template name together with data, the template engine combines them.',
        usage: 'Pages that the server fills in with data, such as a login page or a list page, all live inside `templates`.',
      },
      {
        keyTerms: [
          ['template', 'An HTML skeleton with blanks that the server fills in.'],
          ['rendering', 'The process of combining a template and data to produce the final HTML.'],
        ],
        example: tree(`
src/main/resources/templates/
└── index.html        ← used when the Controller returns "index"
`),
        practice: 'Create `templates/index.html` with a blank such as `<h1>${title}</h1>`. Then write out the flow: the controller passes a value with the same name.',
        check: [
          { q: 'What is the difference between a template and static HTML?', a: 'A template is completed by the server with data, producing different HTML each time; static HTML is sent unchanged.' },
          { q: 'If the Controller returns "index", which file does Spring look for?', a: '`templates/index.html`.' },
        ],
      },
    ),
    lesson(
      'static-vs-templates-vs-config',
      'static vs templates vs config',
      15,
      'All three folders hold files that are not code, but they serve different purposes. static is sent as it is, templates are filled with data to be completed, and config decides how the program behaves.',
      {
        what: 'static holds unchanging CSS, JS, and images. templates holds HTML skeletons filled with data. config holds run-time settings such as ports, database addresses, and log levels. All three are resources, but they are read at different moments and for different purposes.',
        why: 'Mixing them causes serious problems. Putting a secret password in `static` exposes it in the browser unchanged, and putting a screen skeleton in `config` means the server cannot find it.',
        where: 'static and templates sit at the same level under `src/main/resources`. The configuration file (`application.yml`) is in the same `resources` folder too, but as a single file rather than a folder.',
        missing: 'Without static, styles disappear. Without templates, no screen is built. Without config, Spring starts with default values, and things such as the database connection fail.',
        connects: 'templates can use values from config (such as the app name), and static files are called by templates with `<link>`. config does not decide who reads whom; it changes the whole run.',
        usage: 'Changing only the database address on the production server lets the same jar use a different database, thanks to config. Showing the same HTML to many users is thanks to templates.',
      },
      {
        keyTerms: [
          ['static', 'Files that are sent unchanged (CSS, JS, images).'],
          ['templates', 'Skeletons the server fills with data to produce HTML.'],
          ['config', 'Settings that decide how the program runs (ports, database address, placeholders for secret values).'],
        ],
        example: tree(`
src/main/resources/
├── application.yml     ← config: port, database address
├── static/css/app.css  ← static: sent as it is
└── templates/index.html← templates: completed with data
`),
        practice: 'Sort these three into static, templates, or config: (1) the logo PNG, (2) a greeting screen that shows the user\'s name, (3) the database address. Give one sentence of reason for each.',
        check: [
          { q: 'Why must a password not be placed in the `static` folder?', a: 'Anyone can download static files from the browser. Secret values belong in configuration (environment variables or a secret store).' },
          { q: 'Which folder holds a screen that shows the user\'s name?', a: '`templates`, because the server has to fill in the data to build it.' },
        ],
      },
    ),
    lesson(
      'folder-config',
      'config',
      12,
      '`config` holds the values that decide how the program starts and runs. In Spring Boot, the configuration file `application.yml` or `application.properties` usually plays this role.',
      {
        what: 'Configuration is a value that changes behaviour without editing code: port numbers, the database address, and log levels are typical examples. Some projects also create a separate `config/` folder, but Spring does not read it automatically.',
        why: 'To run the same code with different values on a developer PC, a test server, and the real service, the values must live outside the code.',
        where: 'Spring Boot reads `src/main/resources/application.yml` by default. A separate `config/` folder is a project convention only; Spring does not read it automatically.',
        missing: 'Without configuration, Spring runs with defaults (for example port 8080 and an in-memory database), so it does not connect to the production database.',
        connects: 'Values in `application.yml` go into Java classes through `@Value` or `@ConfigurationProperties`. The build configuration (`build.gradle`) includes this file as a resource.',
        usage: 'Production servers override values in `application.yml` with environment variables such as `SPRING_DATASOURCE_URL`. Behaviour changes without editing the file.',
      },
      {
        keyTerms: [
          ['configuration', 'Values that decide how the program runs without editing code.'],
          ['application.yml', 'Spring Boot\'s default configuration file.'],
        ],
        example: tree(`
src/main/resources/
└── application.yml
    server:
      port: 8080
    spring:
      datasource:
        url: jdbc:h2:mem:testdb
`),
        practice: 'In `application.yml`, find the port number. Write down which address you would have to visit after you change it.',
        check: [
          { q: 'What is the name of the configuration file Spring Boot reads by default?', a: '`application.yml` or `application.properties`.' },
          { q: 'What problem comes from writing settings directly in code?', a: 'Changing values per environment means editing the code and building again.' },
        ],
      },
    ),
    lesson(
      'folder-resources',
      'resources',
      10,
      '`resources` holds every file that is not code. Configuration, screen templates, static files, and translation files live here.',
      {
        what: '`src/main/resources` is the starting point of the resources packed into the executable. `static`, `templates`, and the configuration files sit under it.',
        why: 'Separating code from resources lets you change screen design or configuration without touching logic.',
        where: 'The standard location in Spring Boot is `src/main/resources`, next to `src/main/java`.',
        missing: 'Without the resources folder, screens and configuration are not packed into the executable, so the app runs only with defaults.',
        connects: 'Files in `resources` are copied into the jar at build time, and read at run time from the classpath.',
        usage: 'In a Spring Boot project, this is the first place to look for configuration, screens, and static files.',
      },
      {
        keyTerms: [
          ['resources', 'Files that code only reads.'],
          ['classpath', 'The reference location where files are found at run time. After the build, the inside of the jar is this location.'],
        ],
        example: tree(`
src/main/resources/
├── application.yml
├── static/
└── templates/
`),
        practice: 'List every file inside `src/main/resources`, and mark whether each one belongs to static, templates, or configuration.',
        check: [
          { q: 'Are files in the `resources` folder included in the jar?', a: 'Yes. They are included at build time and can be read while the program runs.' },
          { q: 'How are `resources` and `static` related?', a: '`static` is one of the subfolders inside `resources`.' },
        ],
      },
    ),
    lesson(
      'folder-build',
      'build',
      10,
      '`build` holds the results the build tool produces from `src` and the configuration. People do not edit it, so you can delete it at any time and rebuild it.',
      {
        what: 'In a Gradle project, compiled classes (`.class`), the jar file, and test reports are created inside `build`. All of these are generated automatically from the source.',
        why: 'Mixing results with source makes it unclear what to change. Keeping them separate means `build` is always safe to delete.',
        where: 'It appears directly under the root. Build tools write here by default.',
        missing: 'If `build` does not exist, you have not built yet. Deleting it is safe, since `./gradlew build` recreates it.',
        connects: 'The build tool reads `src` and `build.gradle`, and writes to `build`. Test reports also go to `build/reports`.',
        usage: '`build/libs/app.jar` is the executable you upload to a server. Remember that it is a result, not source.',
      },
      {
        keyTerms: [
          ['build', 'The whole process of turning source code into a runnable result.'],
          ['artifact', 'A result file that a build produces (jar, classes, reports).'],
        ],
        example: tree(`
my-blog/
└── build/
    ├── classes/        ← compiled .class files
    ├── libs/app.jar    ← the executable
    └── reports/        ← test results
`),
        practice: 'Run `./gradlew build`, check that a `build` folder appears, and write down the name of the `.jar` file inside it.',
        check: [
          { q: 'Can I delete the `build` folder?', a: 'Yes. It is a result you can recreate from the source, so deleting it is safe. Never delete the source folder `src`.' },
          { q: 'Should `build` go into Git?', a: 'Usually not. Add it to `.gitignore` so the repository leaves it out.' },
        ],
      },
    ),
    lesson(
      'folder-target',
      'target',
      10,
      '`target` is the folder where Maven keeps its build results. It plays the same role as Gradle\'s `build`. The name depends on which build tool the project uses.',
      {
        what: 'A Maven project writes compiled classes and the jar to `target`. It is not a file people edit, but a result produced from `pom.xml` and `src`.',
        why: 'Build tools chose different result folder names. The name alone tells you which tool was used.',
        where: 'It appears directly under the root, at the same level as `pom.xml`.',
        missing: 'Without `target`, the Maven build has not been run yet. Deleting it is safe, since `mvn package` recreates it.',
        connects: '`pom.xml` decides how to build, `src` is the input, and `target` is the output.',
        usage: 'Many Maven-based Spring projects run by copying `target/app.jar` to a server.',
      },
      {
        keyTerms: [['target', 'Maven\'s build result folder. In Gradle, the equivalent is `build`.']],
        example: tree(`
my-blog/
├── pom.xml           ← Maven configuration (the equivalent of Gradle\'s build.gradle)
└── target/
    └── app.jar       ← the result
`),
        practice: 'Decide whether a project is Gradle or Maven by checking whether `build.gradle` or `pom.xml` is present, then write down the name of its result folder.',
        check: [
          { q: 'What is the result folder name in a Maven project?', a: '`target`.' },
          { q: 'Do `target` and `build` play the same role?', a: 'Yes. Both hold the build results; only the name depends on the build tool.' },
        ],
      },
    ),
    lesson(
      'folder-dist',
      'dist',
      12,
      '`dist` (distribution) is the folder where frontend tools (such as Vite or webpack) place the files for release. It holds compressed and combined HTML, JS, and CSS.',
      {
        what: 'The output that combines the many files used in development so the browser can load them quickly is `dist`. It has many optimized files that are hard for people to read.',
        why: 'Development files are easy to read but numerous and large; release files are small and fast. A separate result folder keeps the two purposes apart.',
        where: 'It appears under the root of the frontend project. In a Spring Boot project, it is usually moved to `static` so the server can serve it.',
        missing: 'Without `dist`, there is nothing to deploy. Deleting it is fine, since the build command recreates it.',
        connects: 'The frontend build reads `src` and writes to `dist`. The server then sends the files in `dist` (or in the moved `static` folder) to the browser.',
        usage: 'Many React and Vite projects run `npm run build` and then put `dist` on a web server.',
      },
      {
        keyTerms: [
          ['dist', 'The release output folder (distribution).'],
          ['bundle', 'The result of combining several JS files into one or a few.'],
        ],
        example: tree(`
frontend/
├── src/           ← development source
└── dist/          ← release output (do not edit)
    ├── index.html
    └── assets/app.js
`),
        practice: 'In a frontend project, compare `dist` and `src`. Write down which one is easier to read for the same feature.',
        check: [
          { q: 'Can I edit the files in `dist` directly?', a: 'No. The next build overwrites them, so make changes in `src`.' },
          { q: 'What do `dist` and `build` have in common?', a: 'Both are folders that hold the results of a build.' },
        ],
      },
    ),
  ],
  {
    title: 'Folder map',
    description: 'In the same project, find the source folders and the result folders and build a table of their roles.',
    deliverables: ['A table separating src, build (or target), and dist', 'A short note comparing static, templates, and config', 'For each folder, whether you may edit it (Yes/No) and why'],
  },
);
