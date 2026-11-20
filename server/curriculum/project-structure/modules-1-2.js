// Module 01 (Project Anatomy) and Module 02 (Folder Roles).
import { lesson, moduleOf } from './helpers.js';

const tree = (text) => '```\n' + text.trim() + '\n```';

export const MODULE_01 = moduleOf(
  'anatomy',
  'Project Anatomy',
  '프로젝트의 구조',
  'Beginner',
  '프로젝트를 이루는 가장 기본 단위(프로젝트, 저장소, 폴더, 파일, 경로, 루트, 소스와 리소스)를 익힙니다. 이 단어들을 정확히 알아야 나머지 모든 내용을 읽을 수 있습니다.',
  ['프로젝트와 저장소의 차이를 설명할 수 있다.', '파일 경로를 읽고 루트 디렉터리를 찾을 수 있다.', '소스 코드와 리소스를 구분할 수 있다.'],
  [
    lesson(
      'project-vs-repository',
      'Project vs Repository',
      '프로젝트와 저장소',
      15,
      '프로젝트(project)는 하나의 목적을 위해 모인 모든 파일의 묶음이고, 저장소(repository, 줄여서 repo)는 그 파일들의 변경 이력을 Git이 기록해 둔 곳입니다.',
      {
        what: '프로젝트는 "무언가를 만들기 위해 모인 파일 전체"입니다. 소스 코드, 설정 파일, 문서, 이미지까지 포함합니다. 저장소는 그 프로젝트를 Git으로 관리하는 공간으로, `.git` 폴더 안에 모든 변경 기록(commit)이 들어 있습니다.',
        why: '같은 프로젝트를 여러 사람이 나눠 작업하고, 예전 상태로 되돌리고, 어느 줄이 언제 왜 바뀌었는지 추적하려면 저장소가 필요합니다. 프로젝트는 "무엇을 만드는가", 저장소는 "그 변화를 어떻게 기록하는가"를 담당합니다.',
        where: '저장소의 최상위 폴더가 곧 프로젝트의 루트입니다. `.git` 폴더는 보통 루트에 숨겨져 있고, 그 옆에 `src`, `build.gradle` 같은 프로젝트 파일이 있습니다.',
        missing: '`.git`이 없으면 프로젝트는 그대로 동작하지만, 변경 이력이 없어 실수를 되돌릴 수 없고 다른 사람과 합치기 어렵습니다. 반대로 프로젝트 파일 없이 `.git`만 있으면 빌드할 것이 없습니다.',
        connects: '저장소는 프로젝트 전체를 감시합니다. `.gitignore`에 적힌 파일은 저장소에서 제외되고, 나머지 파일의 변경은 commit으로 기록됩니다.',
        usage: 'GitHub에 올라가 있는 Spring Boot 프로젝트를 `git clone`으로 내려받으면, 받은 폴더가 곧 "프로젝트 + 저장소"입니다. 이 course의 Project Reading Lab에서 실제로 해 볼 작업입니다.',
      },
      {
        keyTerms: [
          ['프로젝트 (project)', '하나의 목적을 위해 모인 파일 전체.'],
          ['저장소 (repository)', '프로젝트의 파일과 변경 이력을 보관하는 곳. Git이 관리합니다.'],
          ['commit', '저장소에 기록하는 하나의 변경 단위. "언제, 누가, 무엇을 바꿨는지"가 남습니다.'],
        ],
        example: tree(`
my-blog/            ← 프로젝트이자 저장소의 루트
├── .git/           ← 저장소의 변경 이력 (보통 숨김)
├── .gitignore      ← 저장소에서 제외할 파일 목록
├── build.gradle    ← 프로젝트 설정
└── src/            ← 프로젝트의 소스 코드
`),
        practice: '내 컴퓨터에 있는 폴더 하나를 골라 `.git` 폴더가 있는지 확인하세요. 있으면 저장소이고, 없으면 그냥 프로젝트 폴더입니다. 두 경우의 차이를 한 문장으로 적어 보세요.',
        check: [
          { q: '저장소(repository)가 하는 일은 무엇인가요?', a: '파일들의 변경 이력(commit)을 기록하고 관리하는 것입니다. 프로젝트 파일 자체를 만드는 것은 아닙니다.' },
          { q: '`.git` 폴더가 없는 프로젝트도 실행할 수 있나요?', a: '네. 실행은 소스와 설정으로 결정됩니다. 다만 변경 이력을 추적하거나 여러 사람과 합칠 수 없습니다.' },
        ],
        videoQuery: 'git repository vs project folder explained beginner',
      },
    ),
    lesson(
      'folder-vs-directory',
      'Folder vs Directory',
      '폴더와 디렉터리',
      10,
      '폴더(folder)와 디렉터리(directory)는 같은 것을 가리키는 말입니다. 화면에서는 폴더라고 부르고, 명령어와 개발 문서에서는 디렉터리라고 부릅니다.',
      {
        what: '디렉터리는 파일 시스템이 파일을 묶어 두는 상자입니다. 윈도우 탐색기와 macOS Finder에서는 "폴더"라고 표시하고, 터미널(`ls`, `cd`)과 문서에서는 "디렉터리"라고 씁니다. 그 안에 다른 디렉터리를 넣을 수 있어서 계층 구조가 생깁니다.',
        why: '파일이 수백 개가 되면 한 곳에 모아 두기 어렵습니다. 디렉터리로 묶으면 "이 파일은 무슨 역할인가"를 이름만 보고도 알 수 있습니다.',
        where: '디렉터리는 프로젝트 안에서 역할에 따라 나뉩니다. 예를 들어 소스는 `src`, 설정은 `config`, 산출물은 `build`에 둡니다. 위치 자체가 역할을 말해 줍니다.',
        missing: '모든 파일을 한 디렉터리에 넣으면 어떤 파일이 소스이고 어떤 파일이 설정인지 구분할 수 없습니다. 빌드 도구는 정해진 위치의 파일만 읽기 때문에, 위치가 틀리면 파일이 무시되거나 찾지 못합니다.',
        connects: '디렉터리끼리는 `..`(상위)와 `.`(현재)으로 연결됩니다. 빌드 도구와 프레임워크는 "이 디렉터리 밑을 읽어라"라는 약속(convention)으로 파일을 찾습니다.',
        usage: 'Spring Boot는 `src/main/java` 디렉터리 밑의 클래스를 자동으로 찾습니다. 디렉터리 위치가 곧 동작 규칙입니다.',
      },
      {
        keyTerms: [
          ['디렉터리 (directory)', '파일을 묶는 상자. 화면에서는 폴더라고 부릅니다.'],
          ['계층 구조 (hierarchy)', '디렉터리 안에 디렉터리가 들어가 나무 모양을 이루는 구조.'],
          ['관례 (convention)', '도구가 정해진 위치를 읽도록 약속된 규칙.'],
        ],
        example: tree(`
src/                    ← 디렉터리(폴더)
└── main/               ← 그 안의 디렉터리
    └── java/           ← 자바 소스가 들어가는 디렉터리
`),
        practice: '터미널이나 탐색기에서 프로젝트 안의 디렉터리 3개를 찾고, 각 디렉터리에 어떤 종류의 파일이 있는지 적어 보세요.',
        check: [
          { q: '"폴더"와 "디렉터리"는 무엇이 다른가요?', a: '거의 같은 것을 가리킵니다. 화면에서는 폴더, 명령어와 기술 문서에서는 디렉터리라고 부릅니다.' },
          { q: '디렉터리 위치가 중요한 이유는?', a: '도구가 정해진 위치를 읽도록 약속되어 있어서, 위치가 틀리면 파일을 찾지 못하거나 무시하기 때문입니다.' },
        ],
      },
    ),
    lesson(
      'file-and-extension',
      'File and File Extension',
      '파일과 확장자',
      15,
      '파일(file)은 데이터가 담긴 한 덩어리이고, 확장자(file extension)는 이름 끝의 점 뒤 글자로 "이 파일은 어떤 종류인가"를 알려 주는 표시입니다.',
      {
        what: '파일은 글, 코드, 이미지처럼 내용을 가진 단위입니다. 확장자는 `UserController.java`에서 `.java`처럼 마지막 점 뒤에 붙는 짧은 표시입니다. 운영체제와 편집기는 확장자를 보고 어떤 프로그램으로 열지 정합니다.',
        why: '컴퓨터는 파일 내용만으로 종류를 쉽게 알 수 없습니다. 확장자는 사람과 도구 모두에게 "이 파일은 자바 코드다"라고 알려 주는 가장 간단한 약속입니다.',
        where: '확장자는 파일 이름의 맨 끝에 있습니다. 소스 파일은 보통 `src` 밑에, 설정 파일은 `config`나 `src/main/resources` 밑에 확장자와 함께 놓입니다.',
        missing: '확장자가 없거나 틀리면 편집기가 엉뚱한 색으로 칠하거나, 빌드 도구가 파일을 무시합니다. 예를 들어 `Main.java.txt`는 자바 컴파일러가 처리하지 않습니다.',
        connects: '빌드 도구는 확장자로 파일을 고릅니다. 예를 들어 `.java`는 컴파일 대상, `.html`과 `.css`는 브라우저가 읽는 대상입니다.',
        usage: 'Spring Boot 프로젝트에서 `.java`는 로직, `.properties`와 `.yml`은 설정, `.html`은 화면 템플릿으로 쓰입니다. 확장자 하나로 역할을 짐작할 수 있습니다.',
      },
      {
        keyTerms: [
          ['파일 (file)', '내용을 담은 데이터의 한 덩어리.'],
          ['확장자 (file extension)', '파일 이름 끝의 "점 + 글자"로 된 파일 종류 표시.'],
          ['파일 이름 (file name)', '확장자를 포함한 파일의 전체 이름.'],
        ],
        example: tree(`
UserController.java      ← 확장자 .java: 자바 소스 코드
application.yml          ← 확장자 .yml: 설정 파일
index.html               ← 확장자 .html: 웹 화면
`),
        practice: '프로젝트에서 확장자가 서로 다른 파일 5개를 고르고, 각 확장자가 무엇을 뜻하는지 한 줄씩 적어 보세요.',
        check: [
          { q: '`README.md`에서 확장자는 무엇인가요?', a: '`.md`입니다. Markdown 문서 파일이라는 뜻입니다.' },
          { q: '확장자를 `.txt`로 바꾸면 자바 파일이 되나요?', a: '아닙니다. 이름만 바뀌고 내용은 그대로입니다. 자바 파일이 되려면 자바 문법으로 쓰여 있어야 합니다.' },
        ],
      },
    ),
    lesson(
      'file-path',
      'File Path',
      '파일 경로',
      15,
      '파일 경로(file path)는 파일이 어디에 있는지 적은 주소입니다. 루트에서부터 차례로 디렉터리 이름을 `/`로 이어서 적습니다.',
      {
        what: '경로에는 두 종류가 있습니다. 절대 경로(absolute path)는 `/` 또는 `C:\\`에서 시작하는 전체 주소이고, 상대 경로(relative path)는 지금 있는 위치에서 찾아가는 주소입니다. 예: `src/main/java/App.java`.',
        why: '프로젝트에는 같은 이름의 파일이 여러 개 있을 수 있습니다. 경로는 "어느 폴더의 어느 파일인가"를 정확히 가리키는 유일한 방법입니다.',
        where: '설정 파일이나 코드 안에 적힌 경로는 대부분 프로젝트 루트를 기준으로 합니다. 그래서 루트가 어디인지가 가장 중요합니다.',
        missing: '경로가 틀리면 "파일을 찾을 수 없다(No such file or directory)" 오류가 납니다. 특히 실행 위치를 잘못 잡으면 같은 상대 경로가 전혀 다른 파일을 가리킵니다.',
        connects: 'Spring Boot의 `@Value`나 `spring.config.import`에 적힌 경로, HTML의 `<link href="/css/style.css">`, Gradle의 `sourceSets`는 모두 경로로 파일을 연결합니다.',
        usage: 'HTML 안의 `/css/style.css`는 `src/main/resources/static/css/style.css`로 연결됩니다. 경로를 읽을 수 있으면 "이 화면이 어떤 파일을 쓰는가"를 추적할 수 있습니다.',
      },
      {
        keyTerms: [
          ['절대 경로 (absolute path)', '루트(`/`)나 드라이브(`C:\\`)에서 시작하는 전체 주소.'],
          ['상대 경로 (relative path)', '현재 위치를 기준으로 한 주소. `./`, `../`를 씁니다.'],
          ['구분자 (separator)', '경로의 폴더를 나누는 기호. 웹과 Gradle에서는 `/`를 씁니다.'],
        ],
        example: tree(`
프로젝트 루트: my-blog/

절대 경로: /home/me/my-blog/src/main/java/App.java
상대 경로: src/main/java/App.java     (루트에서 보면)
            ../my-blog/src/...         (다른 폴더에서 보면)
`),
        practice: '프로젝트 안의 파일 하나를 골라 루트에서 시작하는 상대 경로를 적어 보세요. 그 파일을 탐색기에서 열어 경로가 맞는지 확인하세요.',
        check: [
          { q: '절대 경로와 상대 경로의 차이는?', a: '절대 경로는 루트에서 시작하는 전체 주소이고, 상대 경로는 지금 위치에서 시작하는 주소입니다.' },
          { q: '`../`는 무엇을 뜻하나요?', a: '한 단계 위의 디렉터리를 뜻합니다.' },
        ],
      },
    ),
    lesson(
      'root-directory',
      'Root Directory',
      '루트 디렉터리',
      10,
      '루트 디렉터리(root directory)는 프로젝트의 가장 바깥 폴더입니다. 빌드 설정 파일이 여기에 있고, 대부분의 상대 경로가 이 위치에서 출발합니다.',
      {
        what: '루트는 프로젝트를 열었을 때 가장 먼저 보이는 폴더입니다. 파일 시스템 전체의 루트(`/`)와 구분해서, 프로젝트 루트라고 부르는 것이 보통입니다.',
        why: '모든 경로와 도구 설정이 "어디서부터 시작하는가"를 한 곳으로 모으기 위해 존재합니다. 루트가 명확해야 어느 파일이든 같은 방식으로 찾을 수 있습니다.',
        where: '루트에는 보통 `build.gradle` 또는 `pom.xml`, `README.md`, `.gitignore`, `src`, 그리고 빌드 결과물 폴더가 있습니다.',
        missing: '루트를 잘못 잡으면 `./gradlew build`가 "gradlew: not found"로 실패하고, 설정 파일도 찾지 못합니다. 하위 폴더에서 명령을 실행해 생기는 흔한 실수입니다.',
        connects: '루트의 `build.gradle`은 `src`를 소스로 알고, `build`에 결과를 쓰고, `application.yml`은 `src/main/resources`에서 읽습니다. 모두 루트를 기준으로 합니다.',
        usage: 'Spring Boot 프로젝트에서 `./gradlew bootRun`은 반드시 루트에서 실행합니다. 그래야 `build.gradle`과 `src`를 찾을 수 있습니다.',
      },
      {
        keyTerms: [
          ['프로젝트 루트 (project root)', '프로젝트의 가장 바깥 폴더. 설정 파일이 있는 곳.'],
          ['작업 디렉터리 (working directory)', '명령을 실행하는 지금 위치. 루트에서 실행해야 하는 이유입니다.'],
        ],
        example: tree(`
my-blog/                ← 프로젝트 루트
├── build.gradle        ← 빌드 설정
├── settings.gradle
├── gradlew             ← 루트에서 실행하는 빌드 명령
├── src/                ← 소스
└── build/              ← 결과물
`),
        practice: '터미널을 열고 `pwd`(또는 `cd`)로 현재 위치를 확인한 뒤, 루트에 있는지 확인하세요. 루트에 `build.gradle`이 없다면 어느 폴더에 있는지 찾아 보세요.',
        check: [
          { q: '빌드 명령을 `src` 폴더 안에서 실행하면 무슨 일이 생기나요?', a: '`build.gradle`을 찾지 못해 실패합니다. 빌드 명령은 보통 프로젝트 루트에서 실행합니다.' },
          { q: '루트 디렉터리는 무엇으로 알 수 있나요?', a: '빌드 설정 파일(`build.gradle`, `pom.xml`)과 `src` 폴더가 함께 있는 가장 바깥 폴더입니다.' },
        ],
      },
    ),
    lesson(
      'source-vs-resources',
      'Source Code vs Resources',
      '소스 코드와 리소스',
      15,
      '소스 코드(source code)는 사람이 쓰고 컴파일하거나 해석하는 명령문이고, 리소스(resources)는 프로그램이 실행 중에 읽기만 하는 설정, 템플릿, 정적 파일, 데이터입니다.',
      {
        what: '소스 코드는 `.java`, `.ts`처럼 로직을 적은 파일입니다. 리소스는 `application.yml`, HTML 템플릿, CSS, 이미지, 번역 파일처럼 코드가 아니면서 실행에 필요한 파일입니다.',
        why: '로직과 설정을 나눠 두면 설정만 바꿔도 코드를 고치지 않고 동작을 바꿀 수 있습니다. 화면 디자인을 바꾸는 사람과 로직을 짜는 사람이 같은 파일을 덜 건드리게 됩니다.',
        where: 'Spring Boot에서 소스는 `src/main/java`, 리소스는 `src/main/resources`에 둡니다. 이 두 디렉터리 이름이 역할을 나눕니다.',
        missing: '리소스를 소스 폴더에 두면 빌드 도구가 실행 파일에 포함시키지 않아, 실행할 때 "파일이 없다"는 오류가 납니다. 반대로 소스를 리소스에 두면 컴파일되지 않습니다.',
        connects: '소스 코드는 `@Value("${app.name}")`처럼 리소스의 설정 값을 읽고, 템플릿은 소스의 모델 데이터를 받아 화면을 만듭니다.',
        usage: 'Spring Boot 앱을 빌드하면 `src/main/resources`의 내용이 실행 파일(jar) 안에 함께 들어갑니다. 그래서 jar 하나만 있어도 설정과 화면이 동작합니다.',
      },
      {
        keyTerms: [
          ['소스 코드 (source code)', '사람이 작성하는 프로그램 명령문.'],
          ['리소스 (resources)', '코드가 읽기만 하는 설정, 템플릿, 정적 파일, 데이터.'],
          ['컴파일 (compile)', '소스 코드를 실행 가능한 형태로 바꾸는 과정.'],
        ],
        example: tree(`
src/main/java/...        ← 소스 코드 (.java): 컴파일 대상
src/main/resources/
├── application.yml      ← 리소스: 설정
├── static/css/app.css   ← 리소스: 정적 파일
└── templates/index.html ← 리소스: 템플릿
`),
        practice: '프로젝트에서 소스 파일 2개와 리소스 파일 2개를 고르고, 각각 "사람이 로직을 쓴 것인가, 실행 중에 읽기만 하는 것인가"로 분류해 보세요.',
        check: [
          { q: '`application.yml`은 소스 코드인가요, 리소스인가요?', a: '리소스입니다. 로직이 아니라 실행 중에 읽는 설정입니다.' },
          { q: '리소스를 `src/main/java`에 두면 생기는 문제는?', a: '컴파일 대상으로 취급되어 리소스로 쓰기 어렵고, 기대한 위치에 없어 읽지 못할 수 있습니다.' },
        ],
        videoQuery: 'spring boot src/main/java vs src/main/resources explained',
      },
    ),
  ],
  {
    title: 'Robot teardown report',
    description: '실제 프로젝트 하나를 골라 루트에서부터 파일 구조를 한 장짜리 지도로 정리합니다.',
    deliverables: ['루트 디렉터리 아래 최상위 폴더와 파일의 목록', '소스와 리소스를 나눈 표 (각 항목 한 줄 설명)', '상대 경로로 적은 파일 3개'],
  },
);

export const MODULE_02 = moduleOf(
  'folder-roles',
  'Folder Roles',
  '폴더의 역할',
  'Beginner',
  '프로젝트 안의 대표 폴더(src, main, test, static, templates, config, resources, build, target, dist)가 각각 무엇을 위한 곳인지, 그리고 헷갈리는 세 가지(static, templates, config)가 어떻게 다른지 배웁니다.',
  ['폴더 이름만 보고 역할을 추측할 수 있다.', 'static, templates, config의 차이를 설명할 수 있다.', '결과물 폴더(build, target, dist)와 소스 폴더를 구분할 수 있다.'],
  [
    lesson(
      'folder-src',
      'src',
      '소스 폴더',
      12,
      '`src`(source)는 사람이 직접 쓰는 소스 코드와 리소스가 들어가는 폴더입니다. 프로젝트에서 가장 많이 열어 보는 곳입니다.',
      {
        what: '`src`는 "source"의 줄임말입니다. 그 안에 `main`(실제 앱)과 `test`(테스트)가 나뉘어 들어 있는 것이 Java/Spring 프로젝트의 표준 모양입니다.',
        why: '사람이 쓰는 파일과 빌드가 만드는 파일을 분명히 나누기 위해 존재합니다. `src`는 "여기만 고치면 된다"는 신호입니다.',
        where: '루트 바로 아래에 둡니다. 그래야 빌드 도구가 `src`를 찾아 컴파일할 수 있습니다.',
        missing: '`src`가 없으면 빌드할 소스가 없어 실행 파일을 만들 수 없습니다. 이름을 `source`처럼 바꾸면 Gradle 기본 설정이 찾지 못합니다.',
        connects: '`src/main`은 앱을 만들고, `src/test`는 같은 구조를 따라 테스트를 만듭니다. `build` 폴더는 `src`를 입력으로 받아 결과를 만듭니다.',
        usage: 'Spring Boot 프로젝트에서 우리가 고치는 거의 모든 코드는 `src/main/java` 아래에 있습니다.',
      },
      {
        keyTerms: [['src', '소스(source) 코드와 리소스를 담는 최상위 폴더.']],
        example: tree(`
my-blog/
└── src/
    ├── main/            ← 실제 앱
    └── test/            ← 테스트
`),
        practice: '프로젝트에서 `src`를 열고 그 아래 한 단계 폴더를 모두 적어 보세요. 각 폴더가 `main`과 `test` 중 어디에 속하는지 표시하세요.',
        check: [
          { q: '사람이 직접 고치는 코드는 보통 어느 폴더 아래에 있나요?', a: '`src` 아래입니다. Spring Boot에서는 `src/main`이 중심입니다.' },
          { q: '`build`와 `src`의 차이는?', a: '`src`는 사람이 쓴 것이고, `build`는 빌드 도구가 `src`로부터 만든 결과물입니다.' },
        ],
      },
    ),
    lesson(
      'folder-main',
      'main',
      '메인 폴더',
      12,
      '`src/main`은 실제로 실행되는 앱의 코드와 리소스가 들어가는 곳입니다. 테스트가 아닌 모든 것이 여기에 있습니다.',
      {
        what: '`src/main`은 두 개의 중요한 하위 폴더를 가집니다. `java`(자바 코드)와 `resources`(설정, 화면, 정적 파일)입니다.',
        why: '실제 앱과 테스트를 나눠야 테스트 코드가 실행 파일에 섞여 들어가지 않습니다. 이름 `main`은 "프로그램의 주인공"이라는 뜻으로 쓰입니다.',
        where: '`src` 바로 아래에 있습니다. Gradle과 Maven은 이 위치를 기본 소스로 인식합니다.',
        missing: '`main`이 없으면 Spring Boot는 앱 클래스를 찾지 못해 실행되지 않습니다.',
        connects: '`src/main/java`의 클래스는 `src/main/resources`의 설정을 읽습니다. 두 곳이 함께 하나의 앱을 만듭니다.',
        usage: 'Spring Boot 앱의 시작점(`@SpringBootApplication`이 붙은 클래스)은 `src/main/java` 아래에 있습니다.',
      },
      {
        keyTerms: [['main', '실제 앱의 소스와 리소스를 담는 폴더. 테스트와 구분됩니다.']],
        example: tree(`
src/main/
├── java/com/example/blog/     ← 자바 코드
└── resources/                 ← 설정, 화면, 정적 파일
`),
        practice: '`src/main/java` 안에서 `@SpringBootApplication`이 붙은 클래스를 찾아 파일 경로를 적어 보세요.',
        check: [
          { q: '`src/main`과 `src/test`는 무엇이 다른가요?', a: '`src/main`은 실행되는 앱이고, `src/test`는 앱을 검증하는 테스트 코드입니다.' },
          { q: '앱의 시작 클래스는 어디에 있나요?', a: '`src/main/java` 아래에 있습니다.' },
        ],
      },
    ),
    lesson(
      'folder-test',
      'test',
      '테스트 폴더',
      10,
      '`src/test`는 앱이 맞게 동작하는지 확인하는 테스트 코드를 담습니다. 실행 파일에는 들어가지 않습니다.',
      {
        what: '테스트 코드는 "이 함수에 이 값을 넣으면 이 결과가 나와야 한다"를 자동으로 확인하는 코드입니다. `src/test/java`에 `main`과 같은 패키지 구조로 씁니다.',
        why: '앱을 고칠 때마다 손으로 모든 기능을 확인하면 오래 걸리고 빠뜨립니다. 테스트는 같은 확인을 자동으로 반복합니다.',
        where: '`src/main`과 같은 높이에 둡니다. 그래야 빌드가 테스트 코드를 실행 파일과 분리할 수 있습니다.',
        missing: '테스트 폴더가 없으면 `./gradlew test`가 실행할 테스트가 없어 아무것도 확인하지 못합니다. 실패가 나도 알 수 없습니다.',
        connects: '테스트는 `src/main`의 클래스를 가져다 쓰고, 같은 이름의 클래스를 테스트합니다. 테스트 결과는 `build/reports`에 기록됩니다.',
        usage: '`UserServiceTest.java`처럼 `Service` 클래스를 검증하는 테스트가 `src/test/java`에 나란히 놓입니다.',
      },
      {
        keyTerms: [['테스트 (test)', '코드가 기대대로 동작하는지 자동으로 확인하는 코드.']],
        example: tree(`
src/test/java/com/example/blog/
└── UserServiceTest.java    ← src/main의 UserService를 검증
`),
        practice: '`src/test`가 있는지 확인하고, 있다면 테스트 파일 하나의 이름과 어떤 클래스를 검증하는지 적어 보세요.',
        check: [
          { q: '테스트 코드는 실행 파일(jar)에 들어가나요?', a: '보통 들어가지 않습니다. `src/test`는 테스트 실행에만 쓰입니다.' },
          { q: '테스트가 실패하면 무엇을 알 수 있나요?', a: '코드가 기대한 동작과 다르다는 것입니다. 실패 메시지와 리포트에서 어느 부분인지 찾을 수 있습니다.' },
        ],
      },
    ),
    lesson(
      'folder-static',
      'static',
      '정적 파일 폴더',
      15,
      '`static`은 서버가 계산하지 않고 그대로 브라우저에 보내는 파일(CSS, JavaScript, 이미지)을 담는 폴더입니다. 같은 파일이 누구에게나 같은 내용으로 나갑니다.',
      {
        what: '정적(static) 파일은 실행할 때 내용이 바뀌지 않는 파일입니다. `css/style.css`, `js/app.js`, `img/logo.png`가 그 예입니다. 서버는 파일을 찾아 그대로 복사해 보냅니다.',
        why: '스타일이나 스크립트는 사용자와 상관없이 같습니다. 이것을 서버 코드로 만들 이유가 없고, 그대로 보내면 빠르고 단순합니다.',
        where: 'Spring Boot에서는 `src/main/resources/static`에 둡니다. 이 폴더 이름을 Spring이 정해 두었기 때문에 URL 경로와 바로 대응합니다.',
        missing: '`static`이 없으면 `/css/style.css` 같은 요청에 404 오류가 나고 화면이 스타일 없이 깨집니다. 폴더 이름을 `public`으로 바꾸면 Spring 기본 설정이 찾지 못합니다.',
        connects: '`templates`의 HTML은 `<link href="/css/style.css">`로 `static` 파일을 부릅니다. URL의 `/css/...`가 폴더 `static/css/...`에 대응합니다.',
        usage: 'Spring Boot 프로젝트에서 로고, 공통 CSS, 공용 JavaScript를 둘 때 쓰는 기본 위치입니다.',
      },
      {
        keyTerms: [
          ['정적 파일 (static file)', '실행 시 내용이 바뀌지 않고 그대로 전달되는 파일.'],
          ['정적 리소스 (static resource)', '같은 뜻으로 쓰이는 말. 서버가 파일을 계산하지 않고 전달합니다.'],
        ],
        example: tree(`
src/main/resources/static/
├── css/style.css     → 브라우저 요청: /css/style.css
├── js/app.js         → 브라우저 요청: /js/app.js
└── img/logo.png      → 브라우저 요청: /img/logo.png
`),
        practice: '`static` 폴더에 CSS 파일 하나를 만들고, 브라우저에서 `http://localhost:8080/css/파일이름`으로 열어 보세요.',
        check: [
          { q: '`static` 파일의 내용이 사용자마다 달라지나요?', a: '아닙니다. 같은 파일이 같은 내용으로 나갑니다. 사용자마다 달라지는 내용은 템플릿이나 API가 만듭니다.' },
          { q: '브라우저의 `/css/style.css` 요청은 어느 폴더를 가리키나요?', a: '`src/main/resources/static/css/style.css`입니다.' },
        ],
      },
    ),
    lesson(
      'folder-templates',
      'templates',
      '템플릿 폴더',
      15,
      '`templates`는 서버가 데이터를 넣어 HTML 화면을 만들 때 쓰는 "빈칸이 있는 HTML" 파일을 담는 폴더입니다. 사용자마다 다른 내용을 여기서 채웁니다.',
      {
        what: '템플릿(template)은 틀이 되는 HTML입니다. 예를 들어 `${user.name}`처럼 빈칸을 두고, 서버가 실제 값을 넣어 완성된 HTML을 보냅니다. Spring Boot에서는 Thymeleaf가 이 일을 합니다.',
        why: '같은 화면 틀을 여러 번 쓰면서 내용만 바꾸고 싶을 때 필요합니다. 화면 구조를 한 파일에 두면 고치기 쉽습니다.',
        where: 'Spring Boot 기본 위치는 `src/main/resources/templates`입니다. 서버가 이 폴더에서 템플릿을 찾아 읽습니다.',
        missing: '`templates`가 없거나 파일 이름이 틀리면 "Template might not exist" 오류가 납니다. 컨트롤러가 반환한 이름과 파일 이름이 정확히 같아야 합니다.',
        connects: '`Controller`가 `return "index";`처럼 템플릿 이름을 반환하면, Spring은 `templates/index.html`을 찾아 데이터를 넣습니다.',
        usage: '로그인 화면, 목록 화면처럼 서버가 데이터를 채워 보여 주는 페이지가 모두 `templates` 안에 있습니다.',
      },
      {
        keyTerms: [
          ['템플릿 (template)', '빈칸이 있는 HTML 틀. 서버가 값을 넣어 완성합니다.'],
          ['렌더링 (rendering)', '템플릿과 데이터를 합쳐 최종 HTML을 만드는 과정.'],
        ],
        example: tree(`
src/main/resources/templates/
└── index.html        ← Controller가 "index"라고 반환하면 이 파일을 사용
`),
        practice: '`templates/index.html`을 만들고 `<h1>${title}</h1>`처럼 빈칸을 넣은 뒤, 컨트롤러에서 같은 이름의 값을 넘기는 흐름을 적어 보세요.',
        check: [
          { q: '템플릿은 정적 파일과 무엇이 다른가요?', a: '템플릿은 서버가 데이터를 넣어 매번 다른 HTML을 만들고, 정적 파일은 그대로 전달됩니다.' },
          { q: 'Controller가 "index"를 반환하면 어떤 파일을 찾나요?', a: '`templates/index.html`입니다.' },
        ],
      },
    ),
    lesson(
      'static-vs-templates-vs-config',
      'static vs templates vs config',
      '정적 파일 · 템플릿 · 설정 비교',
      15,
      '세 폴더는 모두 "코드가 아닌 파일"을 담지만 역할이 다릅니다. static은 그대로 전달, templates는 데이터를 넣어 완성, config는 프로그램의 동작 방식을 정합니다.',
      {
        what: 'static은 바뀌지 않는 CSS·JS·이미지, templates는 데이터를 넣어 만드는 HTML 틀, config는 포트·데이터베이스 주소·로그 수준 같은 실행 설정입니다. 세 가지 모두 리소스이지만 읽는 시점과 목적이 다릅니다.',
        why: '섞으면 생기는 문제가 큽니다. 설정 비밀번호를 `static`에 두면 브라우저에 그대로 노출되고, 화면 틀을 `config`에 두면 서버가 찾지 못합니다.',
        where: 'static과 templates는 `src/main/resources` 아래 같은 높이에 있습니다. 설정 파일(`application.yml`)도 같은 `resources`에 있지만 폴더 대신 파일 하나입니다.',
        missing: 'static을 빼면 스타일이 사라지고, templates를 빼면 화면이 만들어지지 않고, config를 빼면 Spring이 기본값으로 실행되어 DB 연결 등이 실패합니다.',
        connects: 'templates는 config의 값(예: 앱 이름)을 쓸 수 있고, static은 templates가 `<link>`로 부릅니다. config는 누가 누구를 읽는지 정하지 않고 전체 실행을 바꿉니다.',
        usage: '운영 서버에서 데이터베이스 주소만 바꿔도 같은 jar가 다른 DB를 쓰는 것은 config 덕분입니다. 같은 HTML을 여러 사용자에게 보여 주는 것은 templates 덕분입니다.',
      },
      {
        keyTerms: [
          ['static', '바뀌지 않고 그대로 전달되는 파일 (CSS, JS, 이미지).'],
          ['templates', '서버가 데이터를 넣어 HTML을 만드는 틀.'],
          ['config', '프로그램의 실행 방식을 정하는 설정 (포트, DB 주소, 비밀 값 자리).'],
        ],
        example: tree(`
src/main/resources/
├── application.yml     ← config: 포트, DB 주소
├── static/css/app.css  ← static: 그대로 전달
└── templates/index.html← templates: 데이터를 넣어 완성
`),
        practice: '아래 세 가지를 static, templates, config 중 하나로 분류하세요: (1) 로고 PNG, (2) 사용자 이름이 들어가는 인사말 화면, (3) 데이터베이스 주소. 이유를 한 문장씩 적으세요.',
        check: [
          { q: '비밀번호를 `static` 폴더에 두면 안 되는 이유는?', a: '`static` 파일은 누구나 브라우저에서 내려받을 수 있기 때문입니다. 비밀 값은 설정(환경 변수나 secret)으로 관리합니다.' },
          { q: '사용자 이름이 들어가는 화면은 어느 폴더에 두나요?', a: '`templates`입니다. 서버가 데이터를 넣어 만들어야 하기 때문입니다.' },
        ],
        videoQuery: 'spring boot static templates resources folder difference',
      },
    ),
    lesson(
      'folder-config',
      'config',
      '설정 폴더와 설정 파일',
      12,
      '`config`는 프로그램이 어떻게 실행될지 정하는 값을 담습니다. Spring Boot에서는 보통 `application.yml`이나 `application.properties` 파일이 이 역할을 합니다.',
      {
        what: '설정(config)은 코드를 고치지 않고 동작을 바꾸는 값입니다. 포트 번호, 데이터베이스 주소, 로그 수준이 대표적입니다. 일부 프로젝트는 `config/` 폴더를 따로 만들기도 합니다.',
        why: '같은 코드를 개발 PC, 테스트 서버, 실제 서비스에서 서로 다른 값으로 실행하려면 값을 코드 밖에 두어야 합니다.',
        where: 'Spring Boot는 `src/main/resources/application.yml`을 기본으로 읽습니다. 별도 `config/` 폴더는 프로젝트 규칙일 뿐 Spring이 자동으로 읽는 위치는 아닙니다.',
        missing: '설정이 없으면 Spring이 기본값(예: 포트 8080, 메모리 DB)으로 실행되어 운영 DB에 연결되지 않습니다.',
        connects: '`application.yml`의 값은 `@Value`나 `@ConfigurationProperties`로 자바 클래스에 들어갑니다. 빌드 설정(`build.gradle`)은 이 파일을 리소스로 포함합니다.',
        usage: '운영 서버는 `SPRING_DATASOURCE_URL` 같은 환경 변수로 `application.yml`의 값을 덮어씁니다. 파일을 고치지 않고 동작을 바꾸는 방식입니다.',
      },
      {
        keyTerms: [
          ['설정 (config, configuration)', '코드를 고치지 않고 실행 방식을 정하는 값.'],
          ['application.yml', 'Spring Boot의 기본 설정 파일.'],
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
        practice: '`application.yml`에서 포트 번호를 찾고, 그 값을 바꾸면 어떤 주소로 접속해야 하는지 적어 보세요.',
        check: [
          { q: 'Spring Boot가 기본으로 읽는 설정 파일 이름은?', a: '`application.yml` 또는 `application.properties`입니다.' },
          { q: '설정을 코드 안에 직접 쓰면 생기는 문제는?', a: '환경마다 값을 바꾸려면 코드를 고치고 다시 빌드해야 합니다.' },
        ],
      },
    ),
    lesson(
      'folder-resources',
      'resources',
      '리소스 폴더',
      10,
      '`resources`는 코드가 아닌 모든 파일을 담는 폴더입니다. 설정, 화면 템플릿, 정적 파일, 번역 파일이 여기에 들어갑니다.',
      {
        what: '`src/main/resources`는 실행 파일에 함께 들어가는 리소스의 시작점입니다. 그 아래에 `static`, `templates`, 설정 파일이 놓입니다.',
        why: '코드와 리소스를 나누면, 화면 디자인이나 설정만 바꿀 때 로직을 건드리지 않아도 됩니다.',
        where: 'Spring Boot의 표준 위치는 `src/main/resources`입니다. `src/main/java`와 나란히 있습니다.',
        missing: '리소스 폴더가 없으면 화면과 설정이 실행 파일에 들어가지 않아 앱이 기본값으로만 동작합니다.',
        connects: '`resources`의 파일은 빌드할 때 jar 안에 복사되고, 실행 중에 클래스패스(classpath)에서 읽힙니다.',
        usage: 'Spring Boot 프로젝트에서 설정, 화면, 정적 파일을 찾을 때 가장 먼저 보는 곳입니다.',
      },
      {
        keyTerms: [
          ['리소스 (resources)', '코드가 읽기만 하는 파일.'],
          ['클래스패스 (classpath)', '실행 중에 파일을 찾는 기준 위치. 빌드 후 jar 안이 여기에 해당합니다.'],
        ],
        example: tree(`
src/main/resources/
├── application.yml
├── static/
└── templates/
`),
        practice: '`src/main/resources` 안의 파일을 모두 나열하고, 각각 static, templates, 설정 중 어디에 속하는지 표시하세요.',
        check: [
          { q: '`resources` 폴더의 파일은 jar에 들어가나요?', a: '네. 빌드할 때 함께 포함되어 실행 중에 읽을 수 있습니다.' },
          { q: '`resources`와 `static`의 관계는?', a: '`static`은 `resources` 안에 있는 하위 폴더 중 하나입니다.' },
        ],
      },
    ),
    lesson(
      'folder-build',
      'build',
      '빌드 결과 폴더 (Gradle)',
      10,
      '`build`는 빌드 도구가 `src`와 설정으로부터 만든 결과물을 담는 폴더입니다. 사람이 고치는 곳이 아니므로 언제든 지우고 다시 만들 수 있습니다.',
      {
        what: 'Gradle 프로젝트에서 컴파일된 클래스(`.class`), jar 파일, 테스트 리포트가 `build` 안에 생깁니다. 이 모든 파일은 소스로부터 자동으로 만들어집니다.',
        why: '결과물을 소스와 섞으면 무엇을 고쳐야 하는지 헷갈립니다. 분리해 두면 `build`는 언제든 지워도 안전합니다.',
        where: '루트 바로 아래에 생깁니다. 빌드 도구가 기본으로 이 위치에 씁니다.',
        missing: '`build`가 없다는 것은 아직 빌드하지 않았다는 뜻입니다. 지워져도 `./gradlew build`로 다시 만들 수 있습니다.',
        connects: '빌드 도구는 `src`와 `build.gradle`을 읽어 `build`에 씁니다. 테스트 리포트도 `build/reports`에 들어갑니다.',
        usage: '`build/libs/app.jar`는 서버에 올리는 실행 파일입니다. 소스가 아니라 결과물이라는 점을 기억하세요.',
      },
      {
        keyTerms: [
          ['빌드 (build)', '소스 코드를 실행 가능한 결과물로 만드는 전체 과정.'],
          ['산출물 (artifact)', '빌드가 만든 결과 파일 (jar, 클래스, 리포트).'],
        ],
        example: tree(`
my-blog/
└── build/
    ├── classes/        ← 컴파일된 .class 파일
    ├── libs/app.jar    ← 실행 파일
    └── reports/        ← 테스트 결과
`),
        practice: '`./gradlew build`를 실행한 뒤 `build` 폴더가 생겼는지 확인하고, 그 안에 있는 `.jar` 파일 이름을 적어 보세요.',
        check: [
          { q: '`build` 폴더를 지워도 되나요?', a: '네. 소스로부터 다시 만들 수 있는 결과물이므로 지워도 됩니다. 소스 폴더 `src`는 지우면 안 됩니다.' },
          { q: '`build`를 Git에 올려야 하나요?', a: '보통 올리지 않습니다. `.gitignore`에 넣어 저장소에서 제외합니다.' },
        ],
      },
    ),
    lesson(
      'folder-target',
      'target',
      '빌드 결과 폴더 (Maven)',
      10,
      '`target`은 Maven이 빌드 결과를 담는 폴더입니다. 역할은 Gradle의 `build`와 같습니다. 어떤 빌드 도구를 쓰는지에 따라 이름이 달라집니다.',
      {
        what: 'Maven 프로젝트는 컴파일된 클래스와 jar를 `target`에 씁니다. 사람이 고치는 파일이 아니라 `pom.xml`과 `src`로부터 만들어지는 결과물입니다.',
        why: '빌드 도구마다 결과물 폴더 이름을 다르게 정했습니다. 이름만 보고 어느 도구가 쓰였는지 알 수 있습니다.',
        where: '루트 바로 아래에 생깁니다. `pom.xml`과 같은 높이에 있습니다.',
        missing: '`target`이 없으면 Maven 빌드를 아직 하지 않은 것입니다. 지워도 `mvn package`로 다시 만들 수 있습니다.',
        connects: '`pom.xml`이 빌드 방법을 정하고, `src`가 입력이며, `target`이 출력입니다.',
        usage: '`target/app.jar`를 서버에 올려 실행하는 Maven 기반 Spring 프로젝트가 많습니다.',
      },
      {
        keyTerms: [['target', 'Maven의 빌드 결과 폴더. Gradle에서는 `build`에 해당합니다.']],
        example: tree(`
my-blog/
├── pom.xml           ← Maven 설정 (Gradle의 build.gradle에 해당)
└── target/
    └── app.jar       ← 결과물
`),
        practice: 'Gradle 프로젝트인지 Maven 프로젝트인지 `build.gradle`과 `pom.xml` 중 어느 파일이 있는지로 판별하고, 결과물 폴더 이름을 적어 보세요.',
        check: [
          { q: 'Maven 프로젝트에서 결과물 폴더 이름은?', a: '`target`입니다.' },
          { q: '`target`과 `build`는 같은 역할인가요?', a: '네. 빌드 결과를 담는다는 점이 같고, 사용하는 빌드 도구에 따라 이름만 다릅니다.' },
        ],
      },
    ),
    lesson(
      'folder-dist',
      'dist',
      '배포용 결과 폴더 (frontend)',
      12,
      '`dist`(distribution)는 프론트엔드 도구(예: Vite, webpack)가 만든 배포용 파일을 담는 폴더입니다. 압축되고 합쳐진 HTML, JS, CSS가 들어 있습니다.',
      {
        what: '개발할 때 쓰는 여러 파일을 브라우저가 빠르게 읽도록 한데 묶은 결과가 `dist`입니다. 사람이 읽기 어려운 최적화된 파일이 많습니다.',
        why: '개발용 파일은 읽기 쉽지만 많고 크고, 배포용은 작고 빠릅니다. 두 목적을 나누기 위해 결과 폴더를 따로 둡니다.',
        where: '프론트엔드 프로젝트의 루트 아래에 생깁니다. Spring Boot 프로젝트라면 보통 `static`으로 옮겨 서버가 제공합니다.',
        missing: '`dist`가 없으면 배포할 파일이 없습니다. 지워도 빌드 명령으로 다시 만들 수 있습니다.',
        connects: '프론트엔드 빌드가 `src`를 읽어 `dist`에 쓰고, 서버는 `dist`(또는 옮긴 `static`)의 파일을 브라우저에 보냅니다.',
        usage: '많은 React·Vite 프로젝트가 `npm run build` 후 `dist`를 웹 서버에 올립니다.',
      },
      {
        keyTerms: [
          ['dist', '배포용 결과물 폴더 (distribution).'],
          ['번들 (bundle)', '여러 JS 파일을 하나 또는 몇 개로 묶은 결과.'],
        ],
        example: tree(`
frontend/
├── src/           ← 개발 소스
└── dist/          ← 배포용 결과 (수정 금지)
    ├── index.html
    └── assets/app.js
`),
        practice: '프론트엔드 프로젝트에서 `dist`와 `src`를 비교해, 같은 기능이 어느 쪽에서 더 읽기 쉬운지 적어 보세요.',
        check: [
          { q: '`dist`의 파일을 직접 고쳐도 되나요?', a: '안 됩니다. 다음 빌드에서 덮어쓰이므로, 고칠 것은 `src`에서 고칩니다.' },
          { q: '`dist`와 `build`는 무엇이 같은가요?', a: '둘 다 빌드가 만든 결과물을 담는 폴더라는 점이 같습니다.' },
        ],
      },
    ),
  ],
  {
    title: '폴더 지도 만들기',
    description: '같은 프로젝트에서 소스 폴더와 결과물 폴더를 찾아 역할 표를 만듭니다.',
    deliverables: ['src, build(또는 target), dist를 구분한 표', 'static, templates, config 세 폴더의 차이를 정리한 짧은 메모', '각 폴더를 고쳐도 되는지(Yes/No)와 이유'],
  },
);
