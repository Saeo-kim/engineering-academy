// Module 03 (File Types) and Module 04 (Configuration).
import { lesson, moduleOf } from './helpers.js';

const tree = (text) => '```\n' + text.trim() + '\n```';

const typeLesson = (id, ext, minutes, summary, answers, extra) => lesson(id, ext, minutes, summary, answers, extra);

export const MODULE_03 = moduleOf(
  'file-types',
  'Module 03: File Types',
  'Beginner',
  'Thirteen kinds of files you meet in a project, one at a time. For each one: what it holds, who reads it, and where it goes. Knowing this lets you read an unfamiliar project quickly.',
  ['Guess a file\'s role from its extension alone.', 'Tell source files apart from configuration files.', 'Explain the role and the pitfalls of Dockerfile, .gitignore, and .env.'],
  [
    typeLesson(
      'type-java',
      '.java',
      15,
      '`.java` is a source code file written in the Java language. The compiler reads it and turns it into `.class` files, which are what actually run.',
      {
        what: 'A file usually contains one class, and the file name must match the class name. For example, `UserController.java` contains `class UserController`.',
        why: 'It lets you write logic in a form people can read and change. Computers cannot run this file directly, so it must be compiled first.',
        where: 'In Spring Boot, it lives under `src/main/java`, in folders that match the package name. The package name must match the folder structure.',
        missing: 'If the file name and the class name differ, compilation fails. If the file is missing, the whole feature it contains is gone.',
        connects: 'Other `.java` files bring the class in with `import`, and Spring reads annotations (such as `@RestController`) and connects things automatically.',
        usage: 'Controller, Service, Repository, Entity, and DTO are all `.java` files. Modules 4 and 5 cover them in detail.',
      },
      {
        keyTerms: [
          ['compile', 'Turning source (.java) into executable bytecode (.class).'],
          ['package', 'A namespace that groups classes. It must match the folder structure.'],
        ],
        example: tree(`
src/main/java/com/example/blog/
└── UserController.java
    package com.example.blog;
    public class UserController { ... }
`),
        practice: 'Open a `.java` file, find the `package` line and the class with the same name as the file, and check that both names match the folder structure.',
        check: [
          { q: 'Does a `.java` file run directly?', a: 'Not directly. It must first be compiled into `.class` files.' },
          { q: 'What happens if the file name and the class name differ?', a: 'You get a compile error. A public class must have the same name as its file.' },
        ],
      },
    ),
    typeLesson(
      'type-html',
      '.html',
      12,
      '`.html` is a document the browser reads to draw a screen. It describes the structure of titles, paragraphs, buttons, and input boxes.',
      {
        what: 'HTML is a language for saying "what is there." CSS handles the look and JavaScript handles the behaviour; HTML sets only the skeleton.',
        why: 'Every web screen begins with an HTML document. It is the first file the browser receives.',
        where: 'Static pages go in `static`, and pages the server fills with data go in `templates`.',
        missing: 'Without `index.html`, visiting the address gives a blank page or a 404.',
        connects: 'HTML loads CSS with `<link>` and JavaScript with `<script>`, and points to images and other pages with `href` and `src`.',
        usage: 'The skeleton of every screen the server sends, such as a login screen or a list screen, is HTML.',
      },
      {
        keyTerms: [['tag', 'An element wrapped in angle brackets, such as `<h1>`.']],
        example: tree(`
src/main/resources/templates/index.html
<link href="/css/style.css">   ← connects CSS
<script src="/js/app.js">      ← connects JS
`),
        practice: 'In `index.html`, find the `<link>` and `<script>` tags, and write down which folder each one points to.',
        check: [
          { q: 'What does HTML define, and what does CSS define?', a: 'HTML defines the structure of the screen (what is there); CSS defines the look (how it appears).' },
          { q: 'How does an HTML file load other files?', a: 'Through the paths in the `<link>`, `<script>`, and `<img>` tags.' },
        ],
      },
    ),
    typeLesson(
      'type-css',
      '.css',
      12,
      '`.css` is a style sheet that sets the colour, size, and layout of HTML elements.',
      {
        what: 'CSS (Cascading Style Sheets) says "how it looks." It selects elements with selectors and sets the look with properties such as `color` or `margin`.',
        why: 'Separating structure (HTML) from look (CSS) means you can change the design without rewriting the HTML.',
        where: 'In Spring Boot it usually goes in `static/css`, because the browser requests it directly as a static file.',
        missing: 'Without CSS, the screen shows with the browser\'s default look. A wrong path shows a 404 in the browser console.',
        connects: 'The HTML `<link href>` loads this file, and class names (`class="card"`) connect to its selectors.',
        usage: 'Button colours, card shapes, and mobile layouts are all defined here.',
      },
      {
        keyTerms: [['selector', 'The rule that picks which elements a CSS rule applies to, such as `.card` or `h1`.']],
        example: tree(`
static/css/style.css
.card { padding: 16px; border: 1px solid #ccc; }
`),
        practice: 'Add `h1 { color: teal; }` to `style.css`, and check that the heading colour on the page changes.',
        check: [
          { q: 'Which folder should a CSS file go in?', a: 'In Spring Boot, usually `static/css`.' },
          { q: 'When CSS is not applied, what should you check first?', a: 'That the `<link>` path in the HTML matches the file\'s location.' },
        ],
      },
    ),
    typeLesson(
      'type-js',
      '.js',
      12,
      '`.js` is a JavaScript code file that runs in the browser or in Node.js. It handles behaviour on the screen: clicks, input, and requests.',
      {
        what: 'JavaScript is the language that writes program logic. In the browser it changes HTML with `document`, and it calls server APIs with `fetch`.',
        why: 'HTML and CSS alone cannot make a button that saves data. Behaviour is handled by JavaScript.',
        where: 'The browser receives this file directly, so it usually goes in `static/js` or in the frontend `src` folder.',
        missing: 'Without it, buttons do not respond and data is not sent to the server. A wrong path shows a 404 in the console.',
        connects: 'The HTML `<script src>` loads the file, and `fetch(\'/api/...\')` connects it to the server API.',
        usage: 'This course app keeps one file per screen, such as `public/js/views/courses.js`, which is a common approach.',
      },
      {
        keyTerms: [
          ['fetch', 'A function that sends a request to the server from the browser.'],
          ['module', 'A unit for splitting code across files with `import` and `export`.'],
        ],
        example: tree(`
static/js/app.js
fetch('/api/courses').then((r) => r.json())
`),
        practice: 'Create a JavaScript file that shows `alert("hello")` when a button is clicked, and load it with a `<script>` tag in the HTML.',
        check: [
          { q: 'Are JavaScript and Java the same language?', a: 'No. Despite the similar names, they are different languages.' },
          { q: 'Which function does JavaScript use to fetch server data?', a: '`fetch`.' },
        ],
      },
    ),
    typeLesson(
      'type-json',
      '.json',
      12,
      '`.json` is a text file that writes data as `{ "name": value }`. It is the most common format for passing data between programs.',
      {
        what: 'JSON (JavaScript Object Notation) is a structure of keys and values. Values can be text, numbers, lists, or other objects.',
        why: 'A common format was needed that people can read and programs can analyse easily.',
        where: 'It is mostly used for project settings (`package.json`), sample data, and API responses.',
        missing: 'If the JSON syntax is wrong (a missing comma, missing quotes), the program reading it reports an error.',
        connects: 'An API response arrives as JSON and becomes a JavaScript object; in Java, Jackson converts it into a DTO.',
        usage: 'Objects returned by a Spring `@RestController` are converted to JSON and sent to the browser.',
      },
      {
        keyTerms: [['serialization', 'Converting an object into a text format such as JSON.']],
        example: tree(`
{
  "name": "my-blog",
  "version": "1.0.0"
}
`),
        practice: 'Create a small JSON file, remove one comma to see the error, then fix it.',
        check: [
          { q: 'Can I write comments in a JSON file?', a: 'Standard JSON has no comments. If you need comments, use another format such as YAML.' },
          { q: 'What does `package.json` contain?', a: 'The name, version, dependencies, and run commands of a Node.js project.' },
        ],
      },
    ),
    typeLesson(
      'type-xml',
      '.xml',
      10,
      '`.xml` is a text file that describes data and structure with tags. You often see it in older Java configuration and in Maven\'s `pom.xml`.',
      {
        what: 'XML writes structure with opening and closing tags, such as `<project><version>1.0</version></project>`. It looks like HTML, but you choose the tag names yourself.',
        why: 'It was designed to define the structure of data strictly, so many tools can read the same document.',
        where: 'A Maven project keeps its build configuration in `pom.xml` at the root. Older Spring configurations may also use XML in `resources`.',
        missing: 'Without the Maven `pom.xml`, the Maven build cannot start at all.',
        connects: 'Dependencies listed in `pom.xml` are downloaded by Maven and included in the result under `target`.',
        usage: 'Adding a `<dependency>` to a Maven project\'s `pom.xml` brings a library into the project.',
      },
      {
        keyTerms: [['dependency', 'A list of external libraries that a project uses.']],
        example: tree(`
pom.xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>
`),
        practice: 'In `pom.xml` or `build.gradle`, find the list of dependencies and write down three library names.',
        check: [
          { q: 'How are XML and HTML alike, and how do they differ?', a: 'Both use tags, but XML lets you choose the tag names freely, while HTML uses a fixed set of tags.' },
          { q: 'What is the name of the Maven configuration file?', a: '`pom.xml`.' },
        ],
      },
    ),
    typeLesson(
      'type-yml',
      '.yml',
      12,
      '`.yml` (or `.yaml`) is a configuration format that shows structure with indentation. Spring Boot\'s `application.yml` is the best-known example.',
      {
        what: 'YAML shows hierarchy with indentation: `port: 8080` indented under `server:`. The number of spaces carries meaning, so spaces are used instead of tabs.',
        why: 'It is easier to read than JSON and allows comments, which suits configuration that people edit.',
        where: 'Spring Boot reads `src/main/resources/application.yml`. You can split it per environment, such as `application-prod.yml`.',
        missing: 'Without it, the app runs with defaults. Wrong indentation applies settings to the wrong place or ignores them.',
        connects: 'Values such as `spring.datasource.url` flow into Java through `@Value` or configuration classes.',
        usage: 'Ports, database addresses, and log levels are set here. Module 4 covers this in detail.',
      },
      {
        keyTerms: [['indentation', 'The spaces that show hierarchy in YAML. Tabs are not used.']],
        example: tree(`
server:
  port: 8080
spring:
  datasource:
    url: jdbc:h2:mem:testdb
`),
        practice: 'In `application.yml`, find `server.port`, change the value, then try indenting one line incorrectly to see what happens.',
        check: [
          { q: 'How does YAML show hierarchy?', a: 'With indentation (spaces).' },
          { q: 'What is an advantage of YAML over JSON?', a: 'It allows comments and is easier for people to read and edit.' },
        ],
      },
    ),
    typeLesson(
      'type-properties',
      '.properties',
      10,
      '`.properties` is the simplest configuration file: one `key=value` per line. It was used for a long time in Java configuration, and Spring Boot supports it.',
      {
        what: 'You write one setting per line, such as `server.port=8080`. Instead of hierarchy, names are split with dots (`.`).',
        why: 'It is simple and can be read anywhere, so it is often used for small settings and translated messages.',
        where: 'Spring Boot reads `src/main/resources/application.properties`. Translation files for messages also go in `resources`.',
        missing: 'Without it, the default settings apply. If the name to the left of `=` is wrong, the setting is not applied.',
        connects: 'It does the same job as YAML, so keeping both files in one project makes it unclear which one wins.',
        usage: 'Screen messages are split across languages with `messages.properties`.',
      },
      {
        keyTerms: [['key', 'The name of a setting, such as `server.port`.']],
        example: tree(`
server.port=8080
spring.datasource.url=jdbc:h2:mem:testdb
`),
        practice: 'Put `server.port=9090` in `application.properties`, run the app, and check the address changed. Then also put the same value in a `yml` file and find out which one wins.',
        check: [
          { q: 'What format does one line of a `.properties` file use?', a: '`key=value`.' },
          { q: 'What problem happens if you use both properties and yml?', a: 'If the same key is in both places, it is unclear which value applies.' },
        ],
      },
    ),
    typeLesson(
      'type-gradle',
      '.gradle',
      12,
      '`.gradle` is the project configuration file that the Gradle build tool reads. It lists dependencies, plugins, and how to build.',
      {
        what: '`build.gradle` is a script written in Groovy or Kotlin syntax. `plugins` turns on features, and `dependencies` adds libraries.',
        why: 'Writing the build method as code means anyone can run the same command and get the same result.',
        where: 'It sits directly under the root. Together with `settings.gradle`, it defines the project name and structure.',
        missing: 'Without it, Gradle commands fail. Missing dependencies cause compile errors.',
        connects: 'It reads `src` as source, writes results to `build`, and includes `application.yml` as a resource.',
        usage: 'With one line for the Spring Boot plugin, you get `bootRun` and the ability to build a jar.',
      },
      {
        keyTerms: [
          ['plugin', 'An extension that adds features to the build.'],
          ['dependencies', 'The list of libraries the project uses.'],
        ],
        example: tree(`
plugins {
  id 'org.springframework.boot' version '3.3.0'
}
dependencies {
  implementation 'org.springframework.boot:spring-boot-starter-web'
}
`),
        practice: 'In the `dependencies` block of `build.gradle`, find three library names and guess what feature each one provides.',
        check: [
          { q: 'What is the name of the Gradle build configuration file?', a: '`build.gradle` (or `build.gradle.kts`).' },
          { q: 'What happens when you add a dependency?', a: 'At build time, that library is downloaded and included in the project.' },
        ],
      },
    ),
    typeLesson(
      'type-md',
      '.md',
      10,
      '`.md` (Markdown) is a document written with light formatting. It is most often used for project descriptions such as `README.md`.',
      {
        what: 'Markdown is a text format that writes formatting with symbols: `#` for headings, `-` for lists, and `` `code` `` for code. Opened in an editor you see plain text; opened in a browser it appears as a formatted page.',
        why: 'It is easy to keep explanations next to code, and it shows up directly on GitHub and in Git repositories.',
        where: 'The `README.md` in the project root is the most important. If you have more documents, put them in a `docs/` folder.',
        missing: 'Without a README, someone seeing the project for the first time cannot tell its purpose or how to run it.',
        connects: '`README.md` lists run commands and describes folders, pointing to other files such as `build.gradle` and `src`.',
        usage: 'The description shown on the first page of a GitHub repository is the root `README.md`.',
      },
      {
        keyTerms: [['README', 'The first document that introduces a project and how to run it.']],
        example: tree(`
# My Blog
## How to run
./gradlew bootRun
`),
        practice: 'Open the project\'s `README.md` and check whether it lists run commands. If it does not, write two lines describing how to run the project.',
        check: [
          { q: 'Is `README.md` an executable file?', a: 'No. It is a document that people read.' },
          { q: 'What should a README include?', a: 'The purpose of the project, the run commands, and an explanation of the folder structure.' },
        ],
      },
    ),
    typeLesson(
      'type-env',
      '.env',
      12,
      '`.env` is a file that writes environment variables (passwords, addresses) as `name=value`. It supplies values that differ per run environment from outside the code.',
      {
        what: 'When the program runs, the `.env` file is read and its lines become environment variables. For example `DB_PASSWORD=...`. The file name starts with a dot, which makes it a hidden file.',
        why: 'If secret values are written in code, they leak to GitHub. Moving them into environment variables keeps the values out of the code, so you can publish the code and still hide the values.',
        where: 'It goes in the root. However, a real `.env` containing values is never committed to Git; only an example, `.env.example`, is.',
        missing: 'Without it, values such as the database password are empty, so the app may not start or may fail to connect.',
        connects: 'The program reads `.env` and passes the values on as `process.env` or Spring environment variables. `.gitignore` excludes this file.',
        usage: 'This course project also uses `.env.example` to show which variable names are needed, while the real `.env` is git-ignored.',
      },
      {
        keyTerms: [
          ['environment variable', 'A name-value pair the run environment gives to a program.'],
          ['secret', 'A value that must not leak, such as a password or API key.'],
        ],
        example: tree(`
.env              ← real values (never committed to Git)
DB_PASSWORD=...

.env.example      ← an example with only names (committed to Git)
DB_PASSWORD=
`),
        practice: 'Check whether the project has `.env.example`. If it does, list the variable names it contains. Do not write real values.',
        check: [
          { q: 'Why must a real password not be written in `application.yml`?', a: 'That file is usually committed to Git, where anyone can see it.' },
          { q: 'Why is `.env.example` committed to Git?', a: 'To tell other people which variable names are needed. It contains no real values.' },
        ],
      },
    ),
    typeLesson(
      'type-gitignore',
      '.gitignore',
      12,
      '`.gitignore` is a list of files and folders that Git should not track. It keeps build output, secret values, and personal settings out of the repository.',
      {
        what: 'Write one pattern per line. For example, `build/` means the whole build folder, and `*.log` means all log files.',
        why: 'Committing build output or secrets by mistake makes the repository bloated and leaks the secrets. The list prevents this in advance.',
        where: 'It goes in the repository root. You can place one in subfolders too, but a single file at the root is usually enough.',
        missing: 'Without it, `build`, `.env`, and IDE settings files all become candidates for commits, cluttering the repository and possibly exposing secrets.',
        connects: 'It excludes `.env`, `build/`, `target/`, and `node_modules/`, drawing the line between the repository and local files.',
        usage: 'When you create a new Spring Boot project, Gradle generates a default `.gitignore` along with it.',
      },
      {
        keyTerms: [['pattern', 'A rule that selects file names with wildcards (`*`).']],
        example: tree(`
build/
target/
.env
*.log
.idea/
`),
        practice: 'Open the project\'s `.gitignore` and check whether it contains `build` and `.env`. If not, write down what you would add.',
        check: [
          { q: 'Does a file listed in `.gitignore` leave the repository if it was already committed?', a: 'No. Files already tracked must be removed separately with `git rm --cached`.' },
          { q: 'Why put the `build/` folder in `.gitignore`?', a: 'It is a result that can always be recreated, and keeping it would bloat the repository without need.' },
        ],
      },
    ),
    typeLesson(
      'type-dockerfile',
      'Dockerfile',
      15,
      'A Dockerfile is a recipe that lists, line by line, the environment the app needs to run (operating system, Java, files). Building an image from it lets the same environment run on any server.',
      {
        what: '`FROM` picks the base image, `COPY` puts files in, and `CMD` sets the run command. Each line becomes one layer of the image.',
        why: 'It solves the problem of "it works on my machine" by recording the run environment itself in a file.',
        where: 'Usually it sits in the project root, named `Dockerfile` with no extension.',
        missing: 'Without it, you must set up the environment by hand on each deployment server. This course project defines its Node.js image with a Dockerfile too.',
        connects: 'The `COPY` lines point to folders such as `src` and `public`, and `.dockerignore` works alongside it to name files to leave out of the image.',
        usage: 'Cloud servers (Render, Railway, and others) read the Dockerfile to build a container and run it.',
      },
      {
        keyTerms: [
          ['image', 'A blueprint bundle of a run environment and its files.'],
          ['container', 'A running instance of an image.'],
          ['.dockerignore', 'The list of files not to copy when building an image.'],
        ],
        example: tree(`
FROM node:22-alpine      ← base environment
WORKDIR /app
COPY server ./server     ← copy files
CMD ["node", "server/index.js"]   ← run command
`),
        practice: 'Read each line of the Dockerfile and write what it prepares. Also check whether `.dockerignore` lists `.env`.',
        check: [
          { q: 'What file extension does a Dockerfile have?', a: 'None. The file name itself is `Dockerfile`.' },
          { q: 'What is the benefit of having a Dockerfile?', a: 'The same run environment can be created automatically on any server.' },
        ],
      },
    ),
  ],
  {
    title: 'File type cards',
    description: 'Make cards for eight file types you picked out of a project.',
    deliverables: ['Eight cards, one per file type, describing its role', 'Where the secret values are kept, and the result of checking .gitignore', 'If there is a Dockerfile, a description of what each line does'],
  },
);

export const MODULE_04 = moduleOf(
  'configuration',
  'Module 04: Configuration',
  'Beginner',
  'Configuration files and environment variables that change how a program behaves, and how development and production settings are kept apart.',
  ['Explain the roles of application.properties and application.yml.', 'Say what build.gradle decides.', 'Explain why development and production settings are kept separate.'],
  [
    lesson(
      'config-application-properties',
      'application.properties',
      12,
      '`application.properties` is the configuration file Spring Boot reads by default when it starts. You write the port, database address, and log level as `key=value`.',
      {
        what: 'Inside `src/main/resources/application.properties`, write one setting per line, such as `server.port=8080`. When this file exists, Spring uses those values by default.',
        why: 'It changes how the app runs without editing code. The same jar can run with different values.',
        where: 'Directly under `src/main/resources`. Spring reads this location (the classpath) automatically.',
        missing: 'Without it, Spring still runs with default values, but missing values such as the database connection can make startup fail.',
        connects: 'It can sit alongside `application.yml` in the same folder. If both contain the same key, Spring has a fixed rule for which value wins.',
        usage: 'Setting `spring.datasource.url` lets you use an in-memory H2 database for development and PostgreSQL in production.',
      },
      {
        keyTerms: [['key-value', 'A pair of a setting name and its value.']],
        example: tree(`
src/main/resources/application.properties
server.port=8080
spring.application.name=my-blog
`),
        practice: 'Change `server.port` to 9090, run the app, and check that the address you visit changes.',
        check: [
          { q: 'In which folder is application.properties?', a: '`src/main/resources`.' },
          { q: 'Do I need to change code to change a setting?', a: 'Usually not. Change the configuration file or environment variables instead.' },
        ],
      },
    ),
    lesson(
      'config-application-yml',
      'application.yml',
      12,
      '`application.yml` does the same job as `application.properties`, but writes hierarchy with indentation. Usually you use one of the two, not both.',
      {
        what: 'It shows hierarchy like `port: 8080` indented under `server:`. Comments (`#`) are allowed.',
        why: 'As settings grow, `.properties` repeats the same prefix over and over and gets long. YAML groups related settings together.',
        where: '`src/main/resources/application.yml`. Per-environment files (`application-prod.yml`) go in the same folder.',
        missing: 'Without it, the app runs with defaults. Wrong indentation puts settings in the wrong place.',
        connects: 'Writing `spring.profiles.active: prod` also reads `application-prod.yml`.',
        usage: 'Team projects group environment-specific settings into YAML blocks, and pass secret values as environment variables.',
      },
      {
        keyTerms: [['profile', 'A named set of settings for an environment, such as dev or prod.']],
        example: tree(`
server:
  port: 8080
spring:
  profiles:
    active: dev
`),
        practice: 'Write `spring.profiles.active: dev` in `application.yml`, create `application-dev.yml`, and give it a different port.',
        check: [
          { q: 'Which format can contain comments, `.properties` or `.yml`?', a: '`.yml`. `.properties` also allows `#` comments, but YAML is easier for expressing hierarchy.' },
          { q: 'What should you do if both files exist?', a: 'Standardize on one format. If the same key appears in both, it is confusing.' },
        ],
      },
    ),
    lesson(
      'config-build-gradle',
      'build.gradle',
      12,
      '`build.gradle` is the file that decides how the project is built and which libraries it uses. It is a different kind of file from run-time settings such as the port number.',
      {
        what: 'It contains `plugins` (features), `dependencies` (libraries), and `java` (Java version). This file is about how to build; what the app does once it runs is decided by `application.yml`.',
        why: 'The build method must be written as code, so that anyone who builds gets the same result.',
        where: 'In the project root. Together with `settings.gradle`, it defines the project structure.',
        missing: 'Without it, `./gradlew` does not work. Missing libraries make compilation or running fail.',
        connects: 'The libraries that dependencies bring in are included in the jar under `build`, and `src/main/resources` is included as resources.',
        usage: 'The first file to change when you upgrade the Spring Boot version or add a database driver.',
      },
      {
        keyTerms: [['build tool', 'A tool that compiles, tests, and packages source code. Gradle and Maven are the main examples.']],
        example: tree(`
plugins { id 'org.springframework.boot' version '3.3.0' }
java { toolchain { languageVersion = JavaLanguageVersion.of(21) } }
dependencies { implementation 'org.springframework.boot:spring-boot-starter-web' }
`),
        practice: 'In `build.gradle`, find the line that sets the Java version. Write down what changes if you set a different version (do not actually change it).',
        check: [
          { q: 'Should the port number be written in `build.gradle` or in `application.yml`?', a: '`application.yml`. `build.gradle` only decides how to build.' },
          { q: 'Which block do I edit to add a library?', a: 'The `dependencies` block.' },
        ],
      },
    ),
    lesson(
      'config-env-variables',
      'Environment Variables',
      15,
      'An environment variable is a name-value pair that the run environment gives a program. You use it to give each server a different value without editing a file.',
      {
        what: 'For example: `SPRING_DATASOURCE_URL=jdbc:postgresql://...`. Spring turns the environment variable name into a setting key automatically and overrides the matching value in `application.yml`.',
        why: 'Passwords and server addresses leak if they are written in code or configuration files. Supplying them from the run environment keeps the values out of the repository.',
        where: 'On a development PC, in a `.env` file or the IDE run settings; on a server, in the environment variable screen of the hosting service.',
        missing: 'If a required value is missing, the app stops at startup with an error such as "Could not resolve placeholder."',
        connects: 'Spring reads environment variables through placeholders such as `${DB_PASSWORD}`. Environment variables take precedence over the configuration files.',
        usage: 'Setting `ACADEMY_PASSWORD` as a secret value on Cloudflare or Render follows this approach.',
      },
      {
        keyTerms: [
          ['environment variable', 'A name-value setting supplied by the run environment.'],
          ['placeholder', 'A marker in a configuration file, written `${name}`, whose value is filled in later.'],
        ],
        example: tree(`
application.yml
  password: \${DB_PASSWORD}      ← the file holds no value

Run environment
  DB_PASSWORD=(supplied on the server only)
`),
        practice: 'In `application.yml`, find one placeholder, and write down where its value should come from.',
        check: [
          { q: 'If an environment variable and a configuration file disagree, which wins?', a: 'Usually the environment variable. That is why production values are supplied as environment variables instead of in files.' },
          { q: 'What problem comes from committing a secret value to Git?', a: 'Anyone with repository access can read it in the history, and a committed value stays exposed until it is changed.' },
        ],
      },
    ),
    lesson(
      'config-dev-vs-prod',
      'Development vs Production Configuration',
      15,
      'Development settings make experiments easy on your own PC. Production settings are set up to serve real users safely. Both are kept as separate settings.',
      {
        what: 'Development usually uses an in-memory database such as H2, verbose logging, and open settings. Production uses a real database, minimal logging, and secret values supplied as environment variables.',
        why: 'Using development values in production leads to data leaks, test data mixing into real data, and slow settings. Separating them reduces mistakes.',
        where: 'Keep them in the same `resources` folder, as separate files such as `application-dev.yml` and `application-prod.yml`.',
        missing: 'Without production settings, the app runs with development defaults, so data lives only in memory and disappears on restart. This is also why this course app uses a Durable Object for storage: so data is not lost.',
        connects: '`spring.profiles.active` chooses which file is read, and the production server supplies that value as an environment variable.',
        usage: 'The same jar runs with the `dev` profile on a developer PC and the `prod` profile on a server.',
      },
      {
        keyTerms: [
          ['profile', 'A name that chooses a set of environment-specific settings.'],
          ['in-memory database', 'A temporary database whose data disappears on restart. Used for development.'],
        ],
        example: tree(`
application-dev.yml     ← H2 in-memory database, verbose logging
application-prod.yml    ← the real database address is read from environment variables
`),
        practice: 'List three settings whose values should differ between development and production. Make a table, and for each one decide whether it belongs in a file or in an environment variable.',
        check: [
          { q: 'What happens if the development H2 in-memory database is used in production?', a: 'All the data is lost every time the server restarts.' },
          { q: 'Where should a production password go?', a: 'Not in a file, but in the run environment\'s environment variables (or a secret store).' },
        ],
      },
    ),
  ],
  {
    title: 'Per-environment settings table',
    description: 'Put the development and production settings of the same project side by side.',
    deliverables: ['A table of five values that differ between development and production', 'Where each secret value goes (environment variable)', 'Whether a change to each setting needs a rebuild'],
  },
);
