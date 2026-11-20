// Module 07: Project Reading Lab. Each lesson is a hands-on step on a real repository.
import { lesson, moduleOf } from './helpers.js';

const tree = (text) => '```\n' + text.trim() + '\n```';

export const MODULE_07 = moduleOf(
  'reading-lab',
  'Project Reading Lab',
  '프로젝트 읽기 실습',
  'Intermediate',
  '실제 GitHub 저장소 하나를 골라 처음부터 끝까지 읽습니다. 폴더의 역할 찾기, 파일 살펴보기, 의존 관계 추적, 요청 흐름 따라가기, 구조 지도 그리기까지 여섯 단계를 차례로 합니다.',
  ['낯선 저장소의 폴더 역할을 설명할 수 있다.', '파일 하나가 무엇에 의존하는지 추적할 수 있다.', '요청 하나를 브라우저에서 백엔드까지 따라갈 수 있다.', '프로젝트 구조 지도를 그릴 수 있다.'],
  [
    lesson(
      'lab-explore-repo',
      'Explore a real GitHub repository',
      '실제 GitHub 저장소 둘러보기',
      20,
      '실습의 첫 단계는 읽을 저장소를 고르고 내려받아, README와 최상위 구조를 훑어보는 것입니다. 코드를 읽기 전에 "무엇을 위한 프로젝트인지"부터 파악합니다.',
      {
        what: 'GitHub에서 저장소 페이지를 열고, README와 최상위 폴더 목록을 봅니다. 그다음 `git clone`으로 내려받으면 같은 구조가 내 PC에 생깁니다.',
        why: '큰 프로젝트를 처음부터 한 파일씩 읽으면 길을 잃습니다. 목적과 최상위 구조를 먼저 알면 어디를 읽을지 정할 수 있습니다.',
        where: '실습 대상은 README가 있고, 빌드 설정 파일(`build.gradle` 또는 `package.json`)이 루트에 있는 작은 프로젝트가 좋습니다.',
        missing: 'README나 설정 파일이 없으면 프로젝트를 실행하는 방법을 알기 어렵습니다. 이때는 `src`의 진입점(시작 파일)부터 찾습니다.',
        connects: 'README는 실행 명령을 알려 주고, 설정 파일은 어떤 폴더를 소스로 쓰는지 알려 주며, 두 가지가 함께 프로젝트의 지도가 됩니다.',
        usage: '새 회사에 들어가 기존 저장소를 처음 받을 때 하는 첫 작업이 정확히 이것입니다.',
      },
      {
        keyTerms: [
          ['git clone', '원격 저장소를 내 PC에 복사하는 명령.'],
          ['진입점 (entry point)', '프로그램이 시작되는 파일. Spring에서는 `@SpringBootApplication`이 붙은 클래스입니다.'],
        ],
        example: tree(`
$ git clone https://github.com/<owner>/<repo>.git
$ cd <repo>
$ ls                 ← 최상위 구조 확인
README.md  build.gradle  src/
`),
        practice: '작은 공개 Spring Boot 저장소 하나를 clone하고, README에 적힌 실행 명령과 최상위 폴더 목록을 3줄로 요약하세요.',
        check: [
          { q: '프로젝트를 읽기 전에 가장 먼저 볼 두 가지는?', a: 'README(목적과 실행 방법)와 최상위 구조(빌드 설정, src 등)입니다.' },
          { q: 'README가 없으면 무엇부터 찾나요?', a: '빌드 설정 파일과 진입점 클래스(`@SpringBootApplication`)를 찾습니다.' },
        ],
      },
    ),
    lesson(
      'lab-folder-responsibilities',
      'Identify folder responsibilities',
      '폴더의 역할 파악하기',
      20,
      '최상위부터 한 단계씩 폴더를 열어 "이 폴더는 소스인가, 리소스인가, 결과물인가"를 표로 정리합니다. 이름과 위치를 근거로 역할을 추측하고, 확인합니다.',
      {
        what: '각 폴더에 대해 세 가지를 적습니다: 역할(소스, 리소스, 테스트, 결과물), 고쳐도 되는가(Yes/No), 근거(이름, 위치, 설정 파일).',
        why: '폴더 역할을 알면 어디를 고치고 어디를 건드리면 안 되는지 알 수 있습니다. `build`는 고치면 안 되고, `src`는 고쳐야 합니다.',
        where: '최상위와 `src` 아래 두 단계를 먼저 봅니다. 더 깊은 곳은 필요할 때만 엽니다.',
        missing: '역할을 추측하지 않고 확인하지 않으면, 결과물 폴더를 고쳐 다음 빌드에서 변경이 사라지는 실수를 합니다.',
        connects: '설정 파일(`build.gradle`)이 어떤 폴더를 소스와 결과물로 쓰는지 알려 줍니다. 이 연결을 확인하면 추측이 확인으로 바뀝니다.',
        usage: '코드 리뷰에서 "이 파일은 생성된 파일이니 직접 고치지 마세요"라고 말하는 판단이 이 과정에서 나옵니다.',
      },
      {
        keyTerms: [['역할 표 (responsibility table)', '폴더와 역할, 수정 가능 여부를 한눈에 적은 표.']],
        example: tree(`
폴더          역할           고쳐도 되나?   근거
src/main      소스+리소스    Yes           소스 위치 (build.gradle)
build/        결과물         No            빌드가 만듦
.gradle/      빌드 캐시      No            도구가 관리
`),
        practice: '실습 저장소의 폴더 역할 표를 만드세요. 최소 6개 폴더를 넣고, 각 행마다 근거를 한 가지씩 적으세요.',
        check: [
          { q: '`build` 폴더를 직접 고치면 안 되는 이유는?', a: '빌드할 때마다 `src`로부터 다시 만들어져서 직접 고친 내용이 사라지기 때문입니다.' },
          { q: '폴더 역할을 어떻게 확인하나요?', a: '폴더 이름, 위치, 그리고 설정 파일이 그 폴더를 어떻게 쓰는지 확인합니다.' },
        ],
      },
    ),
    lesson(
      'lab-inspect-files',
      'Inspect individual files',
      '개별 파일 살펴보기',
      25,
      '역할을 알게 된 폴더에서 파일 하나를 골라 구조를 읽습니다. 파일의 목적, 주요 선언(클래스, 함수, 설정 키), 그리고 다른 파일을 가리키는 줄을 찾습니다.',
      {
        what: '파일을 열면 위에서부터 `package`, `import`, 어노테이션, 클래스 선언 순서로 읽습니다. 설정 파일이라면 키 목록을 봅니다.',
        why: '파일 하나를 제대로 읽으면, 그 파일이 무엇을 책임지고 무엇에 기대는지 알 수 있습니다. 이것이 모든 추적의 출발점입니다.',
        where: '파일의 위치(패키지 경로, 폴더)가 역할을 말해 줍니다. 예: `controller` 폴더의 파일은 요청을 받는 역할입니다.',
        missing: '내용을 읽지 않고 이름만으로 판단하면, 이름과 실제 역할이 다른 파일(예: "Util"이라는 이름이지만 업무 로직이 든 파일)을 놓칩니다.',
        connects: '`import`는 다른 파일을 가리키고, 어노테이션(`@Service`, `@Value`)은 Spring이 다른 구성 요소와 연결하는 표시입니다.',
        usage: '버그를 고칠 때 가장 먼저 하는 일이 문제가 난 파일을 열어 `import`와 호출 관계를 확인하는 것입니다.',
      },
      {
        keyTerms: [
          ['import', '다른 파일의 클래스나 함수를 가져오는 선언.'],
          ['어노테이션 (annotation)', '`@`로 시작하는 표시. Spring이 역할을 판단하는 근거가 됩니다.'],
        ],
        example: tree(`
package com.example.blog.service;        ← 위치: service 계층
import com.example.blog.repository.CourseRepository;  ← 의존: Repository
@Service                                 ← 역할: 업무 계층
public class CourseService { ... }
`),
        practice: '파일 하나를 골라 `package`, `import`, 어노테이션, 클래스 선언을 각각 표시하고, 이 파일이 가져오는 다른 파일 목록을 적으세요.',
        check: [
          { q: '파일을 읽을 때 가장 먼저 보는 줄 3가지는?', a: '`package`(위치), `import`(의존), 클래스 선언과 어노테이션(역할)입니다.' },
          { q: '`import`는 무엇을 알려 주나요?', a: '이 파일이 어떤 다른 파일에 기대는지 알려 줍니다.' },
        ],
      },
    ),
    lesson(
      'lab-trace-dependencies',
      'Trace file dependencies',
      '파일 의존 관계 추적하기',
      25,
      '파일 하나에서 출발해 그 파일이 가져오는 것과 그것을 가져가는 것을 따라가며, 의존 관계의 그물을 그립니다.',
      {
        what: '의존(dependency)은 "A가 B를 쓴다"는 관계입니다. A의 `import`와 호출을 보면 나가는 화살표, B에서 "A를 찾는 검색 결과"를 보면 들어오는 화살표가 됩니다.',
        why: '의존 관계를 모르면, 한 파일을 고쳤을 때 어디가 깨지는지 알 수 없습니다. 추적하면 영향 범위를 미리 알 수 있습니다.',
        where: '검색 도구(IDE의 "Find Usages", 또는 저장소 검색)로 이름을 찾습니다.',
        missing: '의존 관계를 확인하지 않고 고치면 다른 기능이 깨졌는데 원인을 모르는 상태가 됩니다.',
        connects: 'Controller → Service → Repository처럼 계층 규칙에 따라 화살표가 정리되면, 규칙을 어긴 의존(예: Controller → Repository 직접)도 쉽게 보입니다.',
        usage: '리팩터링 전에 "이 메서드를 누가 호출하나"를 찾는 작업이 바로 의존 추적입니다.',
      },
      {
        keyTerms: [
          ['의존 (dependency)', '한 파일이 다른 파일의 기능을 사용하는 관계.'],
          ['영향 범위 (blast radius)', '한 변경이 영향을 주는 파일의 범위.'],
        ],
        example: tree(`
CourseController ──▶ CourseService ──▶ CourseRepository ──▶ Course(Entity)
      ▲
      └── 누가 호출하나? → 검색으로 확인
`),
        practice: '`Service` 클래스 하나를 골라, 그것을 호출하는 파일을 모두 찾아 목록으로 적고, 의존 화살표를 그려 보세요.',
        check: [
          { q: '"이 클래스를 누가 쓰나?"를 찾는 방법은?', a: 'IDE의 Find Usages나 저장소에서 클래스 이름으로 검색합니다.' },
          { q: '의존 추적이 중요한 이유는?', a: '고친 부분이 다른 기능에 어떤 영향을 주는지 미리 알 수 있기 때문입니다.' },
        ],
      },
    ),
    lesson(
      'lab-request-flow',
      'Follow a request from browser to backend and back',
      '요청 흐름 따라가기 (브라우저 → 백엔드 → 브라우저)',
      30,
      '화면의 버튼 하나를 골라, 클릭부터 화면 갱신까지 거치는 모든 파일을 순서대로 적습니다. 요청이 나가는 길과 응답이 돌아오는 길을 모두 확인합니다.',
      {
        what: '예: 코스 목록 열기. HTML 링크 → JavaScript 라우터 → `fetch(\'/api/courses\')` → Controller → Service → Repository → DB → DTO → JSON → JavaScript 렌더링 → HTML 갱신.',
        why: '흐름을 한 번 끝까지 따라가 보면, 프론트엔드와 백엔드가 어떻게 이어지는지 실제로 이해하게 됩니다. 이것이 프로젝트 구조를 "읽을 수 있다"는 증거입니다.',
        where: '브라우저의 개발자 도구 Network 탭에서 실제 요청 주소를 보고, 그 주소를 프로젝트에서 검색합니다.',
        missing: '흐름의 한 부분을 못 찾으면, 대개 주소가 두 곳에서 조금씩 다르거나(철자, `/` 유무), 인증 단계가 빠진 경우입니다.',
        connects: '요청 주소 → Controller의 매핑 → Service 메서드 → Repository 메서드 → Entity → DTO → JSON 필드 → JavaScript 변수 → DOM 요소.',
        usage: '"화면에 데이터가 안 나와요" 문제를 해결하는 기본 절차가 이 흐름을 끝까지 따라가는 것입니다.',
      },
      {
        keyTerms: [
          ['요청 흐름 (request flow)', '사용자 동작이 서버를 거쳐 다시 화면에 나타나기까지의 경로.'],
          ['개발자 도구 (DevTools)', '브라우저에서 요청과 응답을 직접 보는 도구.'],
        ],
        example: tree(`
1. 링크 클릭        index.html  (<a href="#/courses">)
2. 라우터           main.js     (해시 주소 → 화면 함수)
3. 데이터 요청      views/courses.js → api.js → fetch(\'/api/courses\')
4. 서버 접수        CourseController.list()
5. 업무 처리        CourseService → CourseRepository → DB
6. 응답 조립        CourseDto → JSON
7. 화면 갱신        views/courses.js → components.js → DOM
`),
        practice: '브라우저에서 "코스 목록"을 열고 Network 탭에서 `/api/courses` 요청을 찾아, 위 7단계의 파일 이름을 실제 프로젝트에서 찾아 적으세요.',
        check: [
          { q: '요청이 서버에 도착하면 가장 먼저 만나는 파일은?', a: 'Controller입니다. 주소 매핑으로 찾습니다.' },
          { q: '응답이 화면에 나타나려면 거치는 JavaScript 파일은?', a: '화면을 그리는 view 파일과, 요청을 보내는 API 호출 파일입니다.' },
        ],
      },
    ),
    lesson(
      'lab-architecture-map',
      'Draw a project architecture map',
      '프로젝트 구조 지도 그리기',
      30,
      '지금까지 찾은 폴더, 파일, 의존 관계, 요청 흐름을 한 장의 지도로 그립니다. 이 지도가 있으면 다음 기능을 읽을 때 처음부터 헤매지 않습니다.',
      {
        what: '지도는 세 층으로 그립니다: 폴더 층(무엇이 어디 있는가), 파일 층(주요 파일과 역할), 흐름 층(요청이 지나가는 화살표). 세 가지를 색이나 선으로 구분합니다.',
        why: '머릿속에만 있는 구조는 며칠 뒤 잊힙니다. 종이나 문서에 그려 두면 팀원에게도 설명할 수 있고, 새 기능을 어디에 넣을지 결정할 수 있습니다.',
        where: '지도는 저장소의 `docs/` 폴더에 Markdown이나 그림 파일로 두면 가장 좋습니다.',
        missing: '지도를 그리지 않으면 프로젝트가 커질수록 "이 기능은 어디 있지?"를 매번 다시 찾아야 합니다.',
        connects: '지도의 화살표는 6번 모듈의 연결 규칙과 같아야 합니다. 규칙과 다른 화살표가 있다면, 그것이 설계 문제의 신호입니다.',
        usage: '새 팀원 온보딩 문서나 설계 회의 자료에 이 지도가 가장 먼저 들어갑니다.',
      },
      {
        keyTerms: [['아키텍처 지도 (architecture map)', '프로젝트의 구성 요소와 연결을 한눈에 보여 주는 그림.']],
        example: tree(`
[브라우저]
  index.html ─ main.js ─ views/courses.js ─ api.js
                                              │ fetch /api/courses
[서버]                                        ▼
  CourseController → CourseService → CourseRepository → [DB]
        └── CourseDto (응답) ◀──────────────────┘
`),
        practice: '실습 저장소 하나의 구조 지도를 그리세요. 폴더 3개 이상, 주요 파일 5개 이상, 요청 흐름 화살표 1개 이상을 포함하고, 규칙을 어긴 의존이 있다면 표시하세요.',
        check: [
          { q: '구조 지도에 반드시 들어가야 하는 세 가지는?', a: '폴더 구조, 주요 파일과 역할, 요청이 지나가는 흐름입니다.' },
          { q: '지도의 화살표가 계층 규칙과 다르면 무엇을 뜻하나요?', a: '계층을 건너뛴 의존이 있다는 뜻이며, 설계를 점검해야 한다는 신호입니다.' },
        ],
      },
    ),
  ],
  {
    title: '실제 저장소 구조 지도',
    description: '공개 Spring Boot 저장소 하나를 골라 6단계 실습을 모두 마친 뒤 결과를 한 장으로 정리합니다.',
    deliverables: ['폴더 역할 표', '주요 파일 5개의 역할과 의존 관계', '화면 버튼 하나의 요청 흐름 (브라우저 → 백엔드 → 브라우저)', '구조 지도 한 장'],
  },
);

