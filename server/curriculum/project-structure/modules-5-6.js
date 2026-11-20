// Module 05 (Backend Architecture) and Module 06 (Frontend Architecture).
import { lesson, moduleOf } from './helpers.js';

const tree = (text) => '```\n' + text.trim() + '\n```';

export const MODULE_05 = moduleOf(
  'backend',
  'Backend Architecture',
  '백엔드 구조',
  'Intermediate',
  '요청이 들어와 응답이 나갈 때까지 Controller, Service, Repository, Entity, DTO가 각자 맡는 일과 서로 연결되는 방식을 배웁니다.',
  ['각 계층(Controller, Service, Repository)의 책임을 구분할 수 있다.', 'Entity와 DTO를 왜 나누는지 설명할 수 있다.', '요청 한 번이 여러 파일을 거치는 경로를 그릴 수 있다.'],
  [
    lesson(
      'backend-controller',
      'Controller',
      '컨트롤러',
      15,
      'Controller는 브라우저나 다른 프로그램의 요청(HTTP)을 받아, 어떤 기능을 실행할지 정하고, 결과를 응답으로 돌려주는 계층입니다.',
      {
        what: '`@RestController`나 `@Controller`가 붙은 자바 클래스입니다. `@GetMapping("/courses")`처럼 주소와 메서드를 연결합니다. 요청을 받는 "접수 창구"입니다.',
        why: '요청을 받는 방법(주소, 형식, 인증)과 실제 일(계산, 저장)을 나누기 위해 존재합니다. 창구는 얇게 두고 일은 Service에 맡깁니다.',
        where: '`src/main/java/.../controller/` 폴더에 둡니다. 주소 규칙에 따라 기능별 파일로 나눕니다.',
        missing: 'Controller가 없으면 브라우저가 어떤 주소로도 기능을 쓸 수 없습니다. 주소가 겹치면 어느 쪽이 처리할지 오류가 납니다.',
        connects: 'Controller는 Service를 호출하고, Service의 결과(DTO)를 JSON으로 바꿔 응답합니다. HTML을 반환하는 경우는 `templates`의 화면 이름을 돌려줍니다.',
        usage: '`@GetMapping("/api/courses")`가 붙은 메서드가 "코스 목록 API"의 시작점입니다.',
      },
      {
        keyTerms: [
          ['HTTP 요청 (request)', '브라우저가 서버에 보내는 질문. 주소, 메서드(GET/POST), 본문으로 이루어집니다.'],
          ['엔드포인트 (endpoint)', '요청을 받는 주소와 메서드의 조합.'],
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
        practice: 'Controller 파일 하나를 찾아 `@GetMapping`이나 `@PostMapping` 줄을 모두 적고, 각각 어떤 주소가 되는지 적어 보세요.',
        check: [
          { q: 'Controller의 가장 중요한 역할은?', a: '요청을 받아 올바른 Service를 호출하고, 결과를 응답으로 돌려주는 것입니다.' },
          { q: 'Controller에 계산 로직을 많이 쓰면 생기는 문제는?', a: '같은 계산을 다른 곳에서 재사용하기 어렵고, 테스트가 복잡해집니다.' },
        ],
        videoQuery: 'spring boot controller service repository layers explained',
      },
    ),
    lesson(
      'backend-service',
      'Service',
      '서비스',
      15,
      'Service는 "무엇을 해야 하는가"를 정하는 계층입니다. 규칙을 검사하고, 여러 Repository를 조합해 하나의 기능을 완성합니다.',
      {
        what: '`@Service`가 붙은 클래스입니다. 예: "수강 완료 처리하기"는 진도를 확인하고, 완료 기록을 저장하고, 다음 강의를 찾는 일을 묶습니다.',
        why: '업무 규칙을 한 곳에 모아 두면, 같은 규칙을 웹 화면과 API와 테스트가 모두 같은 방식으로 따릅니다.',
        where: '`.../service/` 폴더에 둡니다. Controller와 Repository 사이에 놓입니다.',
        missing: 'Service가 없으면 규칙이 Controller마다 흩어져, 한 곳을 고쳐도 다른 곳은 그대로인 버그가 생깁니다.',
        connects: 'Controller가 Service를 부르고, Service가 Repository로 데이터를 읽고 씁니다. 결과는 DTO로 Controller에 돌아갑니다.',
        usage: '결제 가능 여부 확인, 권한 확인, 여러 테이블을 함께 바꾸는 작업이 Service에 들어갑니다.',
      },
      {
        keyTerms: [
          ['비즈니스 로직 (business logic)', '업무 규칙을 코드로 옮긴 것.'],
          ['트랜잭션 (transaction)', '여러 변경을 전부 성공하거나 전부 취소하는 단위. Service에서 주로 묶습니다.'],
        ],
        example: tree(`
service/CourseService.java
@Service
public class CourseService {
  public void complete(Long lessonId) {
    // 1. 진도 확인  2. 완료 저장  3. 다음 강의 찾기
  }
}
`),
        practice: 'Service 메서드 하나를 골라 그 안에서 호출하는 Repository 메서드를 적고, 그 메서드가 해결하는 업무 규칙을 한 문장으로 적어 보세요.',
        check: [
          { q: 'Service와 Controller의 차이는?', a: 'Controller는 요청을 받아 전달하고, Service는 업무 규칙에 따라 일을 처리합니다.' },
          { q: 'Service 안에 HTTP 응답 코드를 쓰면 안 되는 이유는?', a: '같은 업무를 웹이 아닌 다른 방식(배치, 테스트)에서도 쓰려면 HTTP에 묶이면 안 되기 때문입니다.' },
        ],
      },
    ),
    lesson(
      'backend-repository',
      'Repository',
      '리포지토리',
      15,
      'Repository는 데이터베이스와 대화하는 계층입니다. 저장, 조회, 수정, 삭제를 담당하며, Service는 SQL을 직접 쓰지 않고 Repository를 통해 데이터를 다룹니다.',
      {
        what: '`interface ...Repository extends JpaRepository<...>`처럼 쓰는 인터페이스입니다. Spring Data JPA가 구현을 만들어 줍니다. 이 course 앱에서는 `repository.js`가 같은 역할을 합니다.',
        why: '데이터 저장 방식(SQL, 파일, 메모리)을 Service와 분리하면, DB를 바꿔도 업무 코드는 그대로 둘 수 있습니다.',
        where: '`.../repository/` 폴더에 둡니다. Entity와 짝을 이룹니다.',
        missing: 'Repository가 없으면 Service가 SQL을 직접 써야 해서 업무와 저장 코드가 뒤섞입니다.',
        connects: 'Repository는 Entity 클래스를 다루고, Service에서 호출됩니다. 데이터가 없으면 `Optional.empty()`를 돌려줍니다.',
        usage: '`findById`, `save`, `findAll` 같은 기본 메서드가 Repository에서 바로 쓰입니다.',
      },
      {
        keyTerms: [
          ['Repository 패턴', '데이터 접근 코드를 한 계층에 모으는 설계 방식.'],
          ['JPA', 'Java에서 객체와 데이터베이스 테이블을 연결하는 표준 방식.'],
        ],
        example: tree(`
repository/CourseRepository.java
public interface CourseRepository extends JpaRepository<Course, Long> {
  List<Course> findByCategory(String category);
}
`),
        practice: 'Repository 인터페이스를 하나 찾아 그 안의 메서드 이름을 적고, 각 메서드가 어떤 조회를 하는지 추측해 적어 보세요.',
        check: [
          { q: 'Service가 SQL을 직접 쓰지 않게 하는 이유는?', a: '저장 방식을 바꿔도 업무 코드를 고치지 않게 하고, 역할을 분리하기 위해서입니다.' },
          { q: 'Repository와 Entity의 관계는?', a: 'Repository는 Entity를 저장하고 조회하는 창구입니다.' },
        ],
      },
    ),
    lesson(
      'backend-entity',
      'Entity',
      '엔티티',
      15,
      'Entity는 데이터베이스 테이블 한 줄을 자바 객체로 나타낸 클래스입니다. `@Entity`가 붙고, 필드 하나가 열 하나에 대응합니다.',
      {
        what: '예: `@Entity class Course { @Id Long id; String title; }`. 이 클래스의 객체 하나가 `course` 테이블의 한 줄입니다.',
        why: '데이터를 다룰 때 SQL 문자열 대신 객체로 다루면 실수가 줄고 코드가 읽기 쉬워집니다.',
        where: '`.../entity/` 또는 `.../domain/` 폴더에 둡니다. 데이터베이스 구조를 정하는 핵심 파일입니다.',
        missing: 'Entity가 없으면 테이블이 만들어지지 않고 Repository가 데이터를 다룰 대상이 없습니다.',
        connects: 'Repository가 Entity를 저장하고, Service가 Entity를 바꿉니다. 응답으로 내보낼 때는 DTO로 옮깁니다.',
        usage: 'Entity의 필드를 바꾸면 데이터베이스 열도 바뀌므로, 마이그레이션 없이 바꾸면 기존 데이터가 깨질 수 있습니다.',
      },
      {
        keyTerms: [
          ['엔티티 (Entity)', '데이터베이스 테이블과 대응하는 클래스.'],
          ['테이블 (table)', '행과 열로 데이터를 저장하는 구조.'],
          ['기본 키 (primary key)', '행을 구별하는 값. `@Id`로 표시합니다.'],
        ],
        example: tree(`
entity/Course.java
@Entity
public class Course {
  @Id Long id;
  String title;      // course 테이블의 title 열
}
`),
        practice: 'Entity 클래스 하나를 찾아 `@Id`가 붙은 필드와 나머지 필드를 적고, 각각 테이블의 열로 어떻게 보일지 그려 보세요.',
        check: [
          { q: 'Entity 한 객체는 테이블에서 무엇에 해당하나요?', a: '테이블의 한 행(row)입니다.' },
          { q: 'Entity 필드를 바꾸면 무엇을 조심해야 하나요?', a: '데이터베이스 열과 기존 데이터가 맞는지 확인해야 합니다.' },
        ],
      },
    ),
    lesson(
      'backend-dto',
      'DTO',
      'DTO (데이터 전송 객체)',
      15,
      'DTO(Data Transfer Object)는 계층 사이나 API 응답에서 주고받을 데이터만 담은 객체입니다. Entity를 그대로 내보내지 않고, 필요한 값만 골라 옮깁니다.',
      {
        what: '예: `record CourseDto(String title, int minutes)`. Entity의 여러 필드 중 화면에 필요한 두 개만 담을 수 있습니다.',
        why: 'Entity를 그대로 내보내면 비밀번호나 내부 ID까지 노출됩니다. 또 데이터베이스 구조가 바뀌어도 API 형식은 유지할 수 있습니다.',
        where: '`.../dto/` 폴더나 Controller 근처에 둡니다.',
        missing: 'DTO가 없으면 Entity가 응답에 그대로 나가 민감한 정보가 노출되거나, 응답 형식이 DB 구조에 묶입니다.',
        connects: 'Service가 Entity를 DTO로 바꾸어 Controller에 주고, Controller는 DTO를 JSON으로 응답합니다. 요청 본문도 DTO로 받습니다.',
        usage: 'REST API 응답의 모든 목록과 상세 화면 데이터가 대부분 DTO입니다.',
      },
      {
        keyTerms: [
          ['DTO', '계층 사이를 오가는 데이터만 담은 전달용 객체.'],
          ['매핑 (mapping)', 'Entity와 DTO 사이에서 값을 옮기는 일.'],
        ],
        example: tree(`
dto/CourseSummary.java
public record CourseSummary(Long id, String title, int lessonCount) {}
`),
        practice: 'API 응답에 어떤 값이 들어 있는지 보고, 그 값이 Entity의 어떤 필드에서 왔는지 연결해 적어 보세요.',
        check: [
          { q: 'DTO를 쓰는 이유 두 가지는?', a: '필요한 값만 노출해 보안을 지키고, 데이터베이스 구조와 API 형식을 분리하기 위해서입니다.' },
          { q: 'DTO와 Entity는 같은 객체인가요?', a: '다릅니다. Entity는 저장을 위한 객체이고, DTO는 전달을 위한 객체입니다.' },
        ],
      },
    ),
    lesson(
      'backend-relationships',
      'Relationships between these components',
      '백엔드 구성 요소의 관계',
      20,
      '요청 한 번은 Controller → Service → Repository → Entity 순서로 내려갔다가, DTO로 바뀌어 Controller를 거쳐 응답으로 올라옵니다.',
      {
        what: '각 계층은 바로 아래 계층만 부릅니다. 예: Controller는 Repository를 직접 부르지 않고 Service를 부릅니다. 이 규칙이 계층 구조의 핵심입니다.',
        why: '규칙을 지키면 어느 파일을 고쳐도 영향 범위를 예측할 수 있습니다. 직접 부르기 시작하면 모든 파일이 서로 얽힙니다.',
        where: '폴더 구조가 이 관계를 그대로 보여 줍니다: `controller`, `service`, `repository`, `entity`, `dto`.',
        missing: '계층을 건너뛰면(예: Controller가 Repository 직접 호출) 업무 규칙이 빠지고, 테스트가 어려워집니다.',
        connects: 'Controller는 Service에, Service는 Repository와 Entity에, Repository는 데이터베이스에 연결됩니다. DTO는 Controller와 Service 사이를 오갑니다.',
        usage: '프로젝트를 처음 읽을 때 `controller`에서 시작해 `service`, `repository` 순서로 따라가면 기능 하나를 추적할 수 있습니다.',
      },
      {
        keyTerms: [['계층 구조 (layered architecture)', '역할별로 층을 나누고 위 층이 아래 층만 부르는 구조.']],
        example: tree(`
브라우저 → Controller → Service → Repository → DB
                ↑          ↓
               DTO      Entity
`),
        practice: '프로젝트에서 기능 하나(예: 코스 목록)를 골라 Controller, Service, Repository, Entity, DTO 파일을 찾아 화살표로 연결해 그리세요.',
        check: [
          { q: 'Controller가 Repository를 직접 불러도 되나요?', a: '가능은 하지만 권장되지 않습니다. Service를 거쳐야 업무 규칙이 빠지지 않습니다.' },
          { q: '요청이 응답으로 나가기까지 거치는 순서는?', a: 'Controller → Service → Repository → Entity로 내려갔다가, DTO가 되어 Controller를 거쳐 응답으로 나갑니다.' },
        ],
      },
    ),
  ],
  {
    title: '백엔드 흐름 지도',
    description: '기능 하나를 골라 Controller부터 DB까지 추적해 지도를 그립니다.',
    deliverables: ['선택한 기능의 파일 5개 (Controller, Service, Repository, Entity, DTO)', '요청 → 응답 흐름 화살표 그림', '계층을 건너뛴 곳이 있다면 표시'],
  },
);

export const MODULE_06 = moduleOf(
  'frontend',
  'Frontend Architecture',
  '프론트엔드 구조',
  'Intermediate',
  '브라우저 화면이 어떻게 만들어지는지 HTML, 템플릿, 정적 리소스, CSS, JavaScript, 컴포넌트를 나눠 보고, 프론트엔드와 백엔드가 어떻게 연결되는지 배웁니다.',
  ['HTML 화면이 어떤 파일들로 이루어지는지 설명할 수 있다.', 'Template과 Static Resource를 구분할 수 있다.', '브라우저와 백엔드가 주고받는 경로를 설명할 수 있다.'],
  [
    lesson(
      'frontend-html',
      'HTML',
      'HTML 문서',
      12,
      'HTML은 화면의 뼈대입니다. 제목, 본문, 입력칸, 버튼이 어떤 순서로 있는지 적고, 다른 파일을 연결하는 시작점입니다.',
      {
        what: '`<!doctype html>`로 시작하는 문서입니다. `<head>`에는 제목과 불러올 CSS·JS를, `<body>`에는 실제 화면 내용을 적습니다.',
        why: '브라우저는 HTML을 먼저 받아야 화면을 만들 수 있습니다. 모든 것의 출발점입니다.',
        where: '정적이면 `static`, 서버가 채우면 `templates`에 둡니다. 이 course 앱은 `public/index.html`에 둡니다.',
        missing: 'HTML이 없으면 화면 자체가 없습니다. `<script>`나 `<link>`의 경로가 틀리면 기능과 스타일만 빠집니다.',
        connects: 'HTML은 CSS(`<link>`), JavaScript(`<script>`), 이미지(`<img>`)를 불러오고, 서버 API 주소는 JavaScript가 호출합니다.',
        usage: '앱의 뼈대가 되는 `index.html`에는 모든 화면이 들어갈 자리(`<main id="view">`)가 있습니다.',
      },
      {
        keyTerms: [['DOM', '브라우저가 HTML을 읽어 만든 객체 트리. JavaScript가 이것을 바꿉니다.']],
        example: tree(`
<head>
  <link rel="stylesheet" href="/css/style.css">
  <script type="module" src="/js/main.js"></script>
</head>
<body><main id="view"></main></body>
`),
        practice: 'HTML 파일의 `<head>`에서 불러오는 파일 목록을 적고, 각 파일이 어느 폴더에 있는지 확인하세요.',
        check: [
          { q: 'HTML 문서의 `<head>`와 `<body>`는 무엇이 다른가요?', a: '`<head>`는 설정과 불러올 파일, `<body>`는 화면에 보이는 내용입니다.' },
          { q: 'HTML이 다른 파일을 찾는 방법은?', a: '`href`, `src` 속성에 적힌 경로를 브라우저가 따라갑니다.' },
        ],
      },
    ),
    lesson(
      'frontend-templates',
      'Templates',
      '템플릿 (서버 렌더링)',
      12,
      '템플릿은 서버가 데이터를 넣어 완성하는 HTML 틀입니다. 브라우저는 완성된 HTML만 받습니다.',
      {
        what: 'Thymeleaf 같은 템플릿 엔진이 `${...}` 자리에 값을 넣습니다. 결과는 평범한 HTML입니다.',
        why: '사용자마다 다른 내용(이름, 목록)을 보여 주려면 서버가 HTML을 만들어야 합니다.',
        where: 'Spring Boot는 `src/main/resources/templates`에서 찾습니다.',
        missing: '템플릿이 없거나 이름이 틀리면 "template not found" 오류가 나고 화면이 뜨지 않습니다.',
        connects: 'Controller가 템플릿 이름과 데이터를 함께 반환하면, 템플릿 엔진이 둘을 합칩니다.',
        usage: '서버가 목록을 렌더링하는 관리자 화면이나 메일 본문이 템플릿으로 만들어집니다.',
      },
      {
        keyTerms: [['렌더링 (rendering)', '데이터와 틀을 합쳐 최종 화면을 만드는 과정.']],
        example: tree(`
templates/index.html
<h1 th:text="\${title}">제목</h1>
`),
        practice: '템플릿의 빈칸 하나를 찾고, 그 값이 Controller의 어느 줄에서 넘어오는지 찾아 보세요.',
        check: [
          { q: '템플릿과 정적 HTML의 차이는?', a: '템플릿은 서버가 데이터를 넣어 완성하고, 정적 HTML은 그대로 보냅니다.' },
          { q: '템플릿 파일은 어느 폴더에 있나요?', a: '`src/main/resources/templates`입니다.' },
        ],
      },
    ),
    lesson(
      'frontend-static-resources',
      'Static Resources',
      '정적 리소스 (프론트엔드 관점)',
      12,
      '정적 리소스는 CSS, JavaScript, 이미지처럼 서버가 가공하지 않고 전달하는 파일입니다. 브라우저가 URL로 직접 요청합니다.',
      {
        what: '`/css/app.css`, `/js/app.js`, `/img/logo.png` 같은 주소가 정적 리소스입니다. 파일 경로와 URL이 같은 규칙으로 대응합니다.',
        why: '변하지 않는 파일을 매번 서버 코드로 만들 필요가 없습니다. 브라우저 캐시에 저장해 두고 재사용할 수 있어 빠릅니다.',
        where: 'Spring Boot는 `static`, 이 course 앱은 `public` 폴더에 둡니다.',
        missing: '정적 리소스가 없으면 스타일과 스크립트가 없어 화면이 깨집니다.',
        connects: 'HTML의 `<link>`와 `<script>`가 이 URL을 요청하고, 서버는 같은 경로의 파일을 찾아 보냅니다.',
        usage: 'Service Worker(`sw.js`)와 `manifest.webmanifest`도 정적 리소스이며 앱을 설치 가능하게 합니다.',
      },
      {
        keyTerms: [['URL 매핑', '요청 주소를 폴더의 파일 경로에 대응시키는 규칙.']],
        example: tree(`
static/css/app.css   →  요청: /css/app.css
static/js/app.js     →  요청: /js/app.js
`),
        practice: '브라우저 개발자 도구의 Network 탭에서 페이지 하나를 열고, 정적 리소스 요청 3개의 주소와 대응하는 파일 경로를 적어 보세요.',
        check: [
          { q: '정적 리소스의 URL과 파일 경로는 어떻게 대응하나요?', a: '폴더 기준으로 같은 경로를 가리킵니다. 예: `/css/app.css`는 `static/css/app.css`입니다.' },
          { q: '정적 리소스를 바꾸면 서버를 다시 빌드해야 하나요?', a: '보통 파일을 바꾸고 다시 배포하면 됩니다. 브라우저 캐시 때문에 새로고침이 필요할 수 있습니다.' },
        ],
      },
    ),
    lesson(
      'frontend-css',
      'CSS',
      'CSS 스타일',
      12,
      'CSS는 HTML 요소의 색, 간격, 크기, 반응형 배치를 정합니다. 구조와 모양을 나누는 가장 중요한 파일입니다.',
      {
        what: '선택자(예: `.card`)로 요소를 고르고, 속성(예: `padding`)으로 모양을 정합니다. 미디어 쿼리(`@media`)로 화면 폭에 따라 모양을 바꿉니다.',
        why: '디자인을 HTML과 분리하면, 같은 화면 구조에 다른 디자인을 입히거나 모바일 레이아웃만 따로 고칠 수 있습니다.',
        where: '`static/css`(또는 `public/css`)에 두고, HTML의 `<link>`로 불러옵니다.',
        missing: 'CSS가 없으면 화면이 브라우저 기본 모양으로 보여 글자가 겹치거나 버튼이 작게 보입니다.',
        connects: '`class` 속성이 CSS의 선택자와 연결됩니다. 이름을 바꾸면 스타일이 적용되지 않습니다.',
        usage: '모바일에서 메뉴를 아래로 옮기는 스타일이 `@media (max-width: 820px)` 안에 들어갑니다.',
      },
      {
        keyTerms: [['미디어 쿼리 (media query)', '화면 폭 같은 조건에 따라 CSS를 바꾸는 규칙.']],
        example: tree(`
.card { padding: 16px; }
@media (max-width: 820px) {
  .card { padding: 12px; }
}
`),
        practice: '`@media` 규칙을 찾아 어떤 화면 폭에서 바뀌는지 적고, 그 폭을 휴대폰 크기와 비교해 보세요.',
        check: [
          { q: 'CSS 선택자 `.card`는 HTML의 무엇과 연결되나요?', a: '`class="card"`가 붙은 요소와 연결됩니다.' },
          { q: '미디어 쿼리는 무엇을 하나요?', a: '화면 폭 같은 조건에 따라 다른 스타일을 적용합니다.' },
        ],
      },
    ),
    lesson(
      'frontend-javascript',
      'JavaScript',
      'JavaScript 동작',
      15,
      'JavaScript는 화면을 바꾸고 사용자의 동작에 반응하고, 서버 API를 불러 데이터를 가져오는 코드입니다.',
      {
        what: '버튼 클릭을 감지하고(`addEventListener`), DOM을 바꾸고, `fetch`로 서버에 요청합니다. 이 course 앱의 `public/js/` 파일들이 모두 이 일을 합니다.',
        why: 'HTML과 CSS만으로는 데이터가 바뀌는 화면을 만들 수 없습니다. 동작은 JavaScript가 맡습니다.',
        where: '`static/js`나 `public/js`에 두고, HTML의 `<script>`로 불러옵니다. 모듈로 나누면 `import`로 필요한 것만 가져옵니다.',
        missing: '없으면 버튼이 반응하지 않고, 데이터가 서버로 전송되지 않습니다.',
        connects: 'JavaScript는 HTML의 요소를 찾아(`document.getElementById`) 바꾸고, `fetch(\'/api/...\')`로 백엔드 Controller를 호출합니다.',
        usage: '로그인 후 대시보드 데이터를 가져와 화면에 그리는 일이 JavaScript의 가장 흔한 역할입니다.',
      },
      {
        keyTerms: [['이벤트 (event)', '클릭, 입력, 로드처럼 브라우저에서 일어나는 사건.']],
        example: tree(`
button.addEventListener('click', async () => {
  const data = await fetch(\'/api/courses\').then((r) => r.json());
  render(data);
});
`),
        practice: 'JavaScript 파일에서 `fetch`를 찾아 어떤 API 주소를 부르는지 적고, 그 주소에 해당하는 Controller 메서드를 찾아 보세요.',
        check: [
          { q: 'JavaScript가 서버 데이터를 가져올 때 쓰는 함수는?', a: '`fetch`입니다.' },
          { q: 'JavaScript와 Java 백엔드는 어떻게 연결되나요?', a: '브라우저가 HTTP 요청(fetch)을 보내고, Java Controller가 응답(JSON)을 돌려줍니다.' },
        ],
      },
    ),
    lesson(
      'frontend-components',
      'Components',
      '컴포넌트 (화면 조각)',
      12,
      '컴포넌트는 화면을 재사용 가능한 조각으로 나눈 것입니다. 카드 하나, 헤더 하나, 입력 폼 하나가 각각 컴포넌트가 됩니다.',
      {
        what: 'React나 Vue에서는 함수나 파일 하나가 컴포넌트입니다. 이 course 앱처럼 바닐라 JavaScript에서는 `components.js`에 만든 `pageHeader`, `emptyState` 같은 함수가 컴포넌트 역할을 합니다.',
        why: '같은 모양을 여러 번 쓰면 코드가 중복되고, 고칠 때 여러 곳을 바꿔야 합니다. 조각으로 만들면 한 곳만 고치면 됩니다.',
        where: '`src/components`(React), `public/js/components.js`(바닐라)처럼 공용 폴더에 둡니다.',
        missing: '컴포넌트가 없으면 같은 카드 모양을 화면마다 복사해 씁니다. 디자인을 바꿀 때 빠뜨리기 쉽습니다.',
        connects: '화면 파일(view)이 컴포넌트를 불러 조립합니다. 컴포넌트는 데이터를 받아 모양만 그립니다.',
        usage: '버튼, 카드, 빈 상태 메시지처럼 여러 화면에 나오는 요소가 컴포넌트로 만들어집니다.',
      },
      {
        keyTerms: [
          ['컴포넌트 (component)', '재사용하는 화면 조각.'],
          ['props', '컴포넌트에 넘기는 입력값 (React 용어). 바닐라에서는 함수 인자가 같은 역할입니다.'],
        ],
        example: tree(`
public/js/components.js
export function emptyState(title, body) { ... }   ← 여러 화면에서 재사용
`),
        practice: '화면 파일 하나를 열어 두 번 이상 나오는 모양을 찾고, 그것을 컴포넌트 함수로 옮긴다면 어떤 인자를 받을지 적어 보세요.',
        check: [
          { q: '컴포넌트의 장점은?', a: '같은 모양을 재사용해 중복을 줄이고, 고칠 때 한 곳만 바꾸면 됩니다.' },
          { q: '컴포넌트는 서버 데이터를 직접 가져와야 하나요?', a: '보통 화면(view)이 데이터를 가져와 컴포넌트에 넘기고, 컴포넌트는 그리기만 합니다.' },
        ],
      },
    ),
    lesson(
      'frontend-backend-connection',
      'Frontend and Backend Connections',
      '프론트엔드와 백엔드의 연결',
      20,
      '프론트엔드(브라우저의 HTML·CSS·JS)와 백엔드(서버의 Java 코드)는 HTTP 요청과 응답으로 연결됩니다. 브라우저가 요청하고, 서버가 응답합니다.',
      {
        what: '브라우저의 JavaScript가 `fetch(\'/api/courses\')`로 요청을 보냅니다. 서버 Controller가 받아 데이터를 JSON으로 응답하고, JavaScript가 그 데이터로 화면을 그립니다.',
        why: '화면과 데이터 처리를 분리하면, 같은 API를 웹 화면과 모바일 앱이 함께 쓸 수 있습니다.',
        where: 'API 주소는 Controller의 `@RequestMapping`과 JavaScript의 `fetch` 주소가 같아야 연결됩니다.',
        missing: '주소가 틀리면 404, 인증이 없으면 401이 나옵니다. JSON 형식이 맞지 않으면 화면이 빈칸으로 보입니다.',
        connects: '흐름은 `브라우저 HTML → JavaScript → fetch → Controller → Service → Repository → DB`로 가고, 응답은 같은 길을 거꾸로 옵니다.',
        usage: '이 course 앱에서 코스 목록을 열면 `/api/courses`가 호출되고, 그 결과로 화면이 그려집니다. 7번 모듈에서 직접 추적합니다.',
      },
      {
        keyTerms: [
          ['API', '프로그램끼리 정해진 주소와 형식으로 데이터를 주고받는 약속.'],
          ['JSON 응답', '서버가 보내는 데이터 형식. 보통 객체와 목록.'],
        ],
        example: tree(`
브라우저 (JS)  ── GET /api/courses ──▶  Controller
                                          │
                                       Service → Repository → DB
                                          │
브라우저 (JS)  ◀──── JSON 응답 ─────────── DTO
`),
        practice: '브라우저 개발자 도구에서 페이지 하나를 열고 `/api`로 시작하는 요청을 찾아, 같은 주소를 가진 Controller 메서드를 프로젝트에서 찾아 보세요.',
        check: [
          { q: '프론트엔드와 백엔드는 무엇으로 연결되나요?', a: 'HTTP 요청과 응답입니다. 보통 JSON 형식의 데이터를 주고받습니다.' },
          { q: '화면은 정상인데 데이터가 비어 보인다면 가장 먼저 볼 것은?', a: '브라우저의 Network 탭에서 API 응답 내용과 상태 코드(200, 401, 404)를 확인합니다.' },
        ],
      },
    ),
  ],
  {
    title: '화면과 API 연결 지도',
    description: '화면 하나를 골라 HTML에서 DB까지의 경로를 그립니다.',
    deliverables: ['화면 하나의 HTML, JavaScript, CSS 파일 목록', '그 화면이 부르는 API 주소와 Controller 메서드', '요청과 응답 흐름 그림'],
  },
);
