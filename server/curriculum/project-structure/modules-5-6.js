// Module 05 (Backend Architecture) and Module 06 (Frontend Architecture).
import { lesson, moduleOf } from './helpers.js';

const tree = (text) => '```\n' + text.trim() + '\n```';

export const MODULE_05 = moduleOf(
  'backend',
  'Module 05: Backend Architecture',
  'Intermediate',
  'How a request flows from arrival to response through Controller, Service, Repository, Entity, and DTO. You will learn what each one is responsible for and how they connect.',
  ['Tell apart the responsibilities of each layer (Controller, Service, Repository).', 'Explain why Entity and DTO are separated.', 'Draw the path that one request takes through several files.'],
  [
    lesson(
      'backend-controller',
      'Controller',
      15,
      'A Controller is the layer that receives requests (HTTP) from a browser or another program, decides which feature to run, and returns the result as a response.',
      {
        what: 'It is a Java class marked `@RestController` or `@Controller`. `@GetMapping("/courses")` links an address to a method. It is the reception desk for requests.',
        why: 'It separates how a request arrives (address, format, authentication) from the actual work (calculating, saving). Keep the reception desk thin and leave the work to the Service.',
        where: 'Put it in the `.../controller/` folder. Split it into one file per feature, following the address rules.',
        missing: 'Without a Controller, the browser cannot use any feature at any address. If two addresses clash, the error says which handler is ambiguous.',
        connects: 'The Controller calls a Service and turns the result (a DTO) into JSON for the response. For HTML, it returns the name of a screen in `templates`.',
        usage: 'The method marked `@GetMapping("/api/courses")` is the entry point of the "course list API."',
      },
      {
        keyTerms: [
          ['HTTP request', 'A question the browser sends to the server, made of an address, a method (GET/POST), and a body.'],
          ['endpoint', 'The combination of an address and a method that receives a request.'],
        ],
        example: tree(`
controller/CourseController.java
@RestController
@RequestMapping("/api/courses")
public class CourseController {
  @GetMapping                  // GET /api/courses
  public List<CourseDto> list() { return courseService.list(); }
}
`),
        practice: 'Open a Controller file, list every `@GetMapping` and `@PostMapping` line, and write the address each one produces.',
        check: [
          { q: 'What is the most important job of a Controller?', a: 'To receive the request, call the right Service, and return the result as a response.' },
          { q: 'What problem comes from putting a lot of calculation logic in a Controller?', a: 'The same calculation is hard to reuse elsewhere, and testing becomes complicated.' },
        ],
        videoQuery: 'spring boot controller service repository layers explained',
      },
    ),
    lesson(
      'backend-service',
      'Service',
      15,
      'A Service is the layer that decides "what must be done." It checks the rules, and combines several Repositories to complete one feature.',
      {
        what: 'It is a class marked `@Service`. For example, "mark a lesson as completed" checks progress, saves the completion record, and finds the next lesson. The Service groups all of that work together.',
        why: 'Collecting business rules in one place means the web screen, the API, and the tests all follow the same rule in the same way.',
        where: 'Put it in the `.../service/` folder. It sits between the Controller and the Repository.',
        missing: 'Without a Service, rules scatter across each Controller, so fixing one place leaves the others unchanged, which causes bugs.',
        connects: 'The Controller calls the Service, and the Service reads and writes data through Repositories. The result returns to the Controller as a DTO.',
        usage: 'Checking whether a payment is allowed, checking permissions, and updating several tables together all go in the Service.',
      },
      {
        keyTerms: [
          ['business logic', 'Business rules written as code.'],
          ['transaction', 'A unit where several changes all succeed or are all cancelled. Services usually group them.'],
        ],
        example: tree(`
service/CourseService.java
@Service
public class CourseService {
  public void complete(Long lessonId) {
    // 1. check progress  2. save completion  3. find the next lesson
  }
}
`),
        practice: 'Pick a Service method, write down the Repository methods it calls, and state in one sentence the business rule that it implements.',
        check: [
          { q: 'What is the difference between a Service and a Controller?', a: 'The Controller receives requests and passes them on; the Service does the work according to the business rules.' },
          { q: 'Why should a Service not return HTTP status codes?', a: 'The same business work may also run in a different context (a batch job, a test), so it must not depend on HTTP.' },
        ],
      },
    ),
    lesson(
      'backend-repository',
      'Repository',
      15,
      'A Repository is the layer that talks to the database. It handles saving, reading, updating, and deleting. The Service does not write SQL directly; it works with data through a Repository.',
      {
        what: 'It is an interface written like `interface ...Repository extends JpaRepository<...>`. Spring Data JPA creates the implementation for you. In this course app, `repository.js` plays the same role.',
        why: 'Separating how data is stored (SQL, files, memory) from the Service means you can change the database without changing the business code.',
        where: 'Put it in the `.../repository/` folder. It pairs with an Entity.',
        missing: 'Without a Repository, the Service must write SQL itself, which mixes business logic with storage code.',
        connects: 'The Repository works with Entity classes, and the Service calls it. When no data exists, it returns `Optional.empty()`.',
        usage: 'Basic methods such as `findById`, `save`, and `findAll` are used directly from the Repository.',
      },
      {
        keyTerms: [
          ['Repository pattern', 'A design that gathers data-access code in one layer.'],
          ['JPA', 'The standard Java way to connect objects with database tables.'],
        ],
        example: tree(`
repository/CourseRepository.java
public interface CourseRepository extends JpaRepository<Course, Long> {
  List<Course> findByCategory(String category);
}
`),
        practice: 'Find a Repository interface, write down the method names inside it, and guess what query each method performs.',
        check: [
          { q: 'Why keep the Service from writing SQL directly?', a: 'So that changing the storage method does not require changing the business code, and so that the roles stay separate.' },
          { q: 'What is the relationship between a Repository and an Entity?', a: 'The Repository is the gateway that saves and reads Entity objects.' },
        ],
      },
    ),
    lesson(
      'backend-entity',
      'Entity',
      15,
      'An Entity is a Java class that represents one row of a database table. It is marked `@Entity`, and each field corresponds to one column.',
      {
        what: 'For example: `@Entity class Course { @Id Long id; String title; }`. One object of this class is one row of the `course` table.',
        why: 'Working with data as objects instead of SQL strings reduces mistakes and makes code easier to read.',
        where: 'Put it in the `.../entity/` or `.../domain/` folder. It is the key file that defines the database structure.',
        missing: 'Without an Entity, no table is created and the Repository has nothing to work on.',
        connects: 'The Repository saves Entities, and the Service changes them. When sending data out in a response, the Entity is converted to a DTO.',
        usage: 'Changing an Entity field also changes the database column, so changing it without a migration can break existing data.',
      },
      {
        keyTerms: [
          ['Entity', 'A class that corresponds to a database table.'],
          ['table', 'A structure that stores data in rows and columns.'],
          ['primary key', 'The value that tells rows apart. Marked with `@Id`.'],
        ],
        example: tree(`
entity/Course.java
@Entity
public class Course {
  @Id Long id;
  String title;      // the title column of the course table
}
`),
        practice: 'Find an Entity class, list the field marked `@Id` and the other fields, and draw how each one would look as a table column.',
        check: [
          { q: 'What does one Entity object correspond to in a table?', a: 'One row.' },
          { q: 'What should you watch out for when changing an Entity field?', a: 'That the database column and the existing data still match.' },
        ],
      },
    ),
    lesson(
      'backend-dto',
      'DTO',
      15,
      'A DTO (Data Transfer Object) is an object that carries only the data passed between layers or returned from the API. It does not send the Entity as it is; it picks just the values needed.',
      {
        what: 'For example: `record CourseDto(String title, int minutes)`. From an Entity with many fields, it can carry only the two the screen needs.',
        why: 'Sending the Entity directly exposes internal fields such as passwords and IDs. A DTO also lets the API shape stay the same even when the database structure changes.',
        where: 'Put it in a `.../dto/` folder, or near the Controller.',
        missing: 'Without DTOs, the Entity goes out in responses, leaking sensitive information or tying the API format to the database structure.',
        connects: 'The Service converts an Entity to a DTO and gives it to the Controller, which returns the DTO as JSON. Requests are also received as DTOs.',
        usage: 'Almost all list and detail screen data in REST APIs are DTOs.',
      },
      {
        keyTerms: [
          ['DTO', 'A transport-only object that carries just the data that moves between layers.'],
          ['mapping', 'Copying values between an Entity and a DTO.'],
        ],
        example: tree(`
dto/CourseSummary.java
public record CourseSummary(Long id, String title, int lessonCount) {}
`),
        practice: 'Look at what values an API response contains, and for each one connect it to the Entity field it came from.',
        check: [
          { q: 'Give two reasons for using a DTO.', a: 'It exposes only the needed values (security), and it separates the database structure from the API format.' },
          { q: 'Are a DTO and an Entity the same kind of object?', a: 'No. An Entity is for storage; a DTO is for transfer.' },
        ],
      },
    ),
    lesson(
      'backend-relationships',
      'Relationships between these components',
      20,
      'One request goes down through Controller → Service → Repository → Entity, becomes a DTO, and goes back up through the Controller as a response.',
      {
        what: 'Each layer calls only the layer directly below it. For example, the Controller does not call the Repository directly; it calls the Service. This rule is the core of the layered structure.',
        why: 'When the rule is followed, you can predict the scope of any change to any file. Once calls start skipping layers, every file becomes tangled with the others.',
        where: 'The folder structure shows these relationships directly: `controller`, `service`, `repository`, `entity`, `dto`.',
        missing: 'Skipping a layer (for example, a Controller calling a Repository directly) leaves out business rules and makes testing hard.',
        connects: 'The Controller connects to the Service, the Service connects to Repositories and Entities, and the Repository connects to the database. DTOs travel between the Controller and the Service.',
        usage: 'When first reading a project, start at `controller` and follow `service` and then `repository`. That lets you trace a feature from start to finish.',
      },
      {
        keyTerms: [['layered architecture', 'A design that splits roles into layers, where each upper layer calls only the layer below it.']],
        example: tree(`
Browser → Controller → Service → Repository → DB
                ↑          ↓
               DTO      Entity
`),
        practice: 'Pick a feature (for example, the course list), find its Controller, Service, Repository, Entity, and DTO files, and connect them with arrows.',
        check: [
          { q: 'Can a Controller call a Repository directly?', a: 'It can, but it is not recommended. Going through the Service keeps business rules from being skipped.' },
          { q: 'What is the order a request follows on its way to becoming a response?', a: 'It goes down Controller → Service → Repository → Entity, then becomes a DTO and goes back up through the Controller as the response.' },
        ],
      },
    ),
  ],
  {
    title: 'Backend flow map',
    description: 'Pick one feature and trace it from the Controller down to the database, then draw a map.',
    deliverables: ['Five files for the chosen feature (Controller, Service, Repository, Entity, DTO)', 'A diagram with arrows for the request → response flow', 'Any place where a layer is skipped, marked'],
  },
);

export const MODULE_06 = moduleOf(
  'frontend',
  'Module 06: Frontend Architecture',
  'Intermediate',
  'How a browser screen is built: HTML, templates, static resources, CSS, JavaScript, and components, with a look at how the frontend and backend connect.',
  ['Explain which files make up an HTML screen.', 'Tell apart Templates and Static Resources.', 'Describe the path that browser and backend exchange requests along.'],
  [
    lesson(
      'frontend-html',
      'HTML',
      12,
      'HTML is the skeleton of a screen. It says what comes in what order: titles, body text, input boxes, and buttons. It is also the starting point that connects to other files.',
      {
        what: 'It is a document that starts with `<!doctype html>`. The `<head>` holds the title and the CSS and JavaScript to load, and the `<body>` holds the actual screen content.',
        why: 'The browser must receive HTML first before it can draw anything. Everything starts here.',
        where: 'Static screens go in `static`, and screens the server fills go in `templates`. This course app keeps it in `public/index.html`.',
        missing: 'Without HTML there is no screen at all. A wrong path in `<script>` or `<link>` removes only the feature or the styling.',
        connects: 'HTML loads CSS (`<link>`), JavaScript (`<script>`), and images (`<img>`), and JavaScript calls the server APIs.',
        usage: 'The main `index.html` holds the placeholder (`<main id="view">`) where every screen is inserted.',
      },
      {
        keyTerms: [['DOM', 'The tree of objects the browser builds from HTML. JavaScript changes it.']],
        example: tree(`
<head>
  <link rel="stylesheet" href="/css/style.css">
  <script type="module" src="/js/main.js"></script>
</head>
<body><main id="view"></main></body>
`),
        practice: 'In the `<head>` of an HTML file, list the files it loads, and check which folder each one is in.',
        check: [
          { q: 'What is the difference between `<head>` and `<body>`?', a: '`<head>` holds settings and the files to load; `<body>` holds what is visible on the screen.' },
          { q: 'How does HTML find other files?', a: 'The browser follows the paths written in the `href` and `src` attributes.' },
        ],
      },
    ),
    lesson(
      'frontend-templates',
      'Templates',
      12,
      'A template is an HTML skeleton that the server completes by inserting data. The browser receives only the finished HTML.',
      {
        what: 'A template engine such as Thymeleaf inserts values at `${...}` positions. The result is plain HTML.',
        why: 'To show content that differs per user (names, lists), the server has to build the HTML.',
        where: 'Spring Boot looks for them in `src/main/resources/templates`.',
        missing: 'If the template is missing or its name is wrong, you get a "template not found" error and no screen appears.',
        connects: 'When a Controller returns a template name together with data, the template engine combines the two.',
        usage: 'Admin pages that render lists from the server, and email bodies, are built with templates.',
      },
      {
        keyTerms: [['rendering', 'The process of combining a template with data to produce the final screen.']],
        example: tree(`
templates/index.html
<h1 th:text="\${title}">Title</h1>
`),
        practice: 'Find a blank in a template, and trace which line of the Controller supplies its value.',
        check: [
          { q: 'What is the difference between a template and static HTML?', a: 'A template is completed with data by the server; static HTML is sent unchanged.' },
          { q: 'Where are template files kept?', a: '`src/main/resources/templates`.' },
        ],
      },
    ),
    lesson(
      'frontend-static-resources',
      'Static Resources',
      12,
      'Static resources are files such as CSS, JavaScript, and images that the server delivers without processing. The browser requests them directly by URL.',
      {
        what: 'Addresses such as `/css/app.css`, `/js/app.js`, and `/img/logo.png` are static resources. The file path and the URL correspond by the same rule.',
        why: 'Files that do not change do not need to be generated by server code every time. The browser can keep them in its cache and reuse them, which is fast.',
        where: 'Spring Boot uses `static`; this course app uses the `public` folder.',
        missing: 'Without static resources, styles and scripts are missing, and the screen breaks.',
        connects: 'The HTML `<link>` and `<script>` request these URLs, and the server finds the file at the matching path and sends it.',
        usage: 'The service worker (`sw.js`) and `manifest.webmanifest` are also static resources, and they make the app installable.',
      },
      {
        keyTerms: [['URL mapping', 'The rule that matches a request address to a file path in a folder.']],
        example: tree(`
static/css/app.css   →  request: /css/app.css
static/js/app.js     →  request: /js/app.js
`),
        practice: 'Open a page in the browser developer tools\' Network tab. For three static resource requests, write down the address and the file path it maps to.',
        check: [
          { q: 'How do a static resource\'s URL and its file path correspond?', a: 'They point to the same location in the folder structure. For example, `/css/app.css` is `static/css/app.css`.' },
          { q: 'Do I have to rebuild the server when I change a static resource?', a: 'Usually no. You change the file and redeploy it; the browser cache may require a refresh.' },
        ],
      },
    ),
    lesson(
      'frontend-css',
      'CSS',
      12,
      'CSS sets the colour, spacing, size, and responsive layout of HTML elements. It is the most important file for separating structure from look.',
      {
        what: 'Selectors (such as `.card`) pick elements, and properties (such as `padding`) set their look. Media queries (`@media`) change the look depending on the screen width.',
        why: 'Separating design from HTML means you can apply a different design to the same screen structure, or change only the mobile layout.',
        where: 'Keep it in `static/css` (or `public/css`) and load it with `<link>` in HTML.',
        missing: 'Without CSS, the screen shows with the browser\'s default look, and text overlaps or buttons look too small.',
        connects: 'The `class` attribute connects to CSS selectors. Renaming a class stops its styles from applying.',
        usage: 'The style that moves the menu below the content on mobile sits inside `@media (max-width: 820px)`.',
      },
      {
        keyTerms: [['media query', 'A rule that changes CSS depending on conditions such as screen width.']],
        example: tree(`
.card { padding: 16px; }
@media (max-width: 820px) {
  .card { padding: 12px; }
}
`),
        practice: 'Find a `@media` rule, write down the screen width at which it changes, and compare that width with a phone\'s screen size.',
        check: [
          { q: 'What does the CSS selector `.card` connect to in HTML?', a: 'Elements with `class="card"`.' },
          { q: 'What does a media query do?', a: 'It applies different styles depending on conditions such as the screen width.' },
        ],
      },
    ),
    lesson(
      'frontend-javascript',
      'JavaScript',
      15,
      'JavaScript changes the screen, responds to user actions, and fetches data from server APIs.',
      {
        what: 'It detects button clicks (`addEventListener`), changes the DOM, and sends requests with `fetch`. All the `public/js/` files in this course app do this work.',
        why: 'HTML and CSS alone cannot build a screen whose data changes. Behaviour is handled by JavaScript.',
        where: 'Keep it in `static/js` or `public/js`, and load it with `<script>` in HTML. Splitting into modules lets you import only what you need.',
        missing: 'Without it, buttons do not respond and data is not sent to the server.',
        connects: 'JavaScript finds HTML elements (`document.getElementById`) and changes them, and calls backend Controllers through `fetch(\'/api/...\')`.',
        usage: 'The most common job of JavaScript is fetching dashboard data after sign-in and drawing it on the screen.',
      },
      {
        keyTerms: [['event', 'Something that happens in the browser, such as a click, input, or load.']],
        example: tree(`
button.addEventListener('click', async () => {
  const data = await fetch('/api/courses').then((r) => r.json());
  render(data);
});
`),
        practice: 'In a JavaScript file, find `fetch`, write down which API address it calls, and find the Controller method that handles that address.',
        check: [
          { q: 'Which function does JavaScript use to fetch server data?', a: '`fetch`.' },
          { q: 'How do JavaScript and the Java backend connect?', a: 'The browser sends an HTTP request (fetch), and the Java Controller returns a response (JSON).' },
        ],
      },
    ),
    lesson(
      'frontend-components',
      'Components',
      12,
      'A component is a screen piece split into a reusable unit. A card, a header, or an input form each becomes a component.',
      {
        what: 'In React or Vue, a function or a file is a component. In plain JavaScript, like this course app, functions such as `pageHeader` and `emptyState` in `components.js` play the role of components.',
        why: 'When the same shape is used many times, the code is duplicated and each change must be made in several places. Making a piece into a component means changing only one place.',
        where: 'Keep them in a shared folder, such as `src/components` (React) or `public/js/components.js` (plain JavaScript).',
        missing: 'Without components, the same card shape is copied into each screen, and design changes are easy to miss.',
        connects: 'View files import components and assemble them. A component receives data and only draws the shape.',
        usage: 'Elements that appear on many screens, such as buttons, cards, and empty-state messages, are made into components.',
      },
      {
        keyTerms: [
          ['component', 'A reusable piece of the screen.'],
          ['props', 'The input values passed into a component (a React term). In plain JavaScript, function arguments play the same role.'],
        ],
        example: tree(`
public/js/components.js
export function emptyState(title, body) { ... }   ← reused on several screens
`),
        practice: 'Open a screen file and find a shape that appears twice or more. If you moved it into a component function, write down which arguments it would take.',
        check: [
          { q: 'What is the benefit of components?', a: 'They reduce duplication by reusing a shape, and a change needs to be made in only one place.' },
          { q: 'Should a component fetch server data itself?', a: 'Usually the view fetches the data and passes it to the component, which only draws it.' },
        ],
      },
    ),
    lesson(
      'frontend-backend-connection',
      'Frontend and Backend Connections',
      20,
      'The frontend (HTML, CSS, and JavaScript in the browser) and the backend (Java code on the server) connect through HTTP requests and responses. The browser requests, the server responds.',
      {
        what: 'The browser\'s JavaScript sends `fetch(\'/api/courses\')`. The server Controller receives it, returns the data as JSON, and JavaScript uses that data to draw the screen.',
        why: 'Separating the screen from data processing lets a web screen and a mobile app share the same API.',
        where: 'The API address must match in two places: the Controller\'s `@RequestMapping` and the JavaScript `fetch` address.',
        missing: 'A wrong address returns 404, and missing authentication returns 401. If the JSON shape does not match, the screen shows blank fields.',
        connects: 'The path runs `browser HTML → JavaScript → fetch → Controller → Service → Repository → DB`, and the response returns along the same path in reverse.',
        usage: 'In this course app, opening the course list calls `/api/courses`, and the screen is drawn from the result. You will trace this yourself in Module 7.',
      },
      {
        keyTerms: [
          ['API', 'An agreement between programs to exchange data at fixed addresses and in a fixed format.'],
          ['JSON response', 'The data format the server sends, usually objects and lists.'],
        ],
        example: tree(`
Browser (JS)  ── GET /api/courses ──▶  Controller
                                          │
                                       Service → Repository → DB
                                          │
Browser (JS)  ◀──── JSON response ─────── DTO
`),
        practice: 'In the browser developer tools, open a page, find a request starting with `/api`, and find the Controller method in the project that has the same address.',
        check: [
          { q: 'What connects the frontend and the backend?', a: 'HTTP requests and responses, usually exchanging data in JSON.' },
          { q: 'If the page looks fine but the data is empty, what should you check first?', a: 'The API response and its status code (200, 401, or 404) in the browser\'s Network tab.' },
        ],
      },
    ),
  ],
  {
    title: 'Screen-to-API map',
    description: 'Pick one screen and draw the path from its HTML to the database.',
    deliverables: ['The HTML, JavaScript, and CSS files of one screen', 'The API address that screen calls, and the Controller method that handles it', 'A diagram of the request and response flow'],
  },
);
