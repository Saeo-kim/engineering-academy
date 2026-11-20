// Module 03 (File Types) and Module 04 (Configuration).
import { lesson, moduleOf } from './helpers.js';

const tree = (text) => '```\n' + text.trim() + '\n```';

const typeLesson = (id, ext, titleKo, minutes, summary, answers, extra) => lesson(id, ext, titleKo, minutes, summary, answers, extra);

export const MODULE_03 = moduleOf(
  'file-types',
  'File Types',
  '파일 종류',
  'Beginner',
  '프로젝트에서 자주 만나는 파일 종류 13가지를 하나씩 봅니다. 각 파일이 무엇을 담고, 누가 읽고, 어디에 두는지 알면 낯선 프로젝트도 빠르게 읽을 수 있습니다.',
  ['확장자만 보고 파일의 역할을 말할 수 있다.', '소스 파일과 설정 파일을 구분할 수 있다.', 'Dockerfile, .gitignore, .env의 역할과 주의점을 설명할 수 있다.'],
  [
    typeLesson(
      'type-java',
      '.java',
      '자바 소스 파일',
      15,
      '`.java`는 자바 언어로 쓴 소스 코드 파일입니다. 컴파일러가 읽어 `.class` 파일로 바꾸고, 그것이 실행됩니다.',
      {
        what: '한 파일에는 보통 클래스 하나가 들어 있고, 파일 이름은 클래스 이름과 같아야 합니다. 예: `UserController.java`에 `class UserController`.',
        why: '사람이 읽고 고칠 수 있는 형태로 로직을 적기 위해 존재합니다. 컴퓨터는 이 파일을 직접 실행하지 못하므로 컴파일이 필요합니다.',
        where: 'Spring Boot에서는 `src/main/java` 아래에 패키지 폴더와 함께 둡니다. 패키지 이름이 폴더 구조와 맞아야 합니다.',
        missing: '파일 이름과 클래스 이름이 다르면 컴파일 오류가 납니다. 파일이 빠지면 그 기능 전체가 없어집니다.',
        connects: '다른 `.java`가 `import`로 이 클래스를 가져오고, Spring이 어노테이션(`@RestController` 등)을 보고 자동으로 연결합니다.',
        usage: 'Controller, Service, Repository, Entity, DTO가 모두 `.java` 파일입니다. 4번 모듈과 5번 모듈에서 자세히 봅니다.',
      },
      {
        keyTerms: [
          ['컴파일 (compile)', '소스(.java)를 실행 가능한 바이트코드(.class)로 바꾸는 과정.'],
          ['패키지 (package)', '클래스를 묶는 이름 공간. 폴더 구조와 맞춥니다.'],
        ],
        example: tree(`
src/main/java/com/example/blog/
└── UserController.java
    package com.example.blog;
    public class UserController { ... }
`),
        practice: '`.java` 파일 하나를 열어 `package` 줄과 파일 이름의 클래스를 찾고, 두 이름이 폴더 구조와 맞는지 확인하세요.',
        check: [
          { q: '`.java` 파일은 실행되나요?', a: '바로 실행되지 않습니다. 먼저 컴파일되어 `.class`가 되어야 합니다.' },
          { q: '파일 이름과 클래스 이름이 다르면 무슨 일이 생기나요?', a: '컴파일 오류가 납니다. public 클래스는 파일 이름과 같아야 합니다.' },
        ],
      },
    ),
    typeLesson(
      'type-html',
      '.html',
      '웹 페이지 파일',
      12,
      '`.html`은 브라우저가 화면을 그리기 위해 읽는 문서입니다. 제목, 문단, 버튼, 입력칸의 구조를 적습니다.',
      {
        what: 'HTML은 "무엇이 있는가"를 적는 언어입니다. 모양은 CSS, 동작은 JavaScript가 맡고, HTML은 뼈대만 정합니다.',
        why: '모든 웹 화면은 결국 HTML 문서에서 출발합니다. 브라우저가 가장 먼저 받는 파일입니다.',
        where: '정적 페이지는 `static`, 서버가 데이터를 넣는 페이지는 `templates`에 둡니다.',
        missing: '`index.html`이 없으면 주소로 접속해도 빈 화면이나 404가 나옵니다.',
        connects: 'HTML은 `<link>`로 CSS를, `<script>`로 JavaScript를 불러오고, `href`와 `src`로 이미지와 다른 페이지를 가리킵니다.',
        usage: '로그인 화면, 목록 화면 등 서버가 보내는 화면의 뼈대가 모두 HTML입니다.',
      },
      {
        keyTerms: [['태그 (tag)', '`<h1>`처럼 꺾쇠로 감싼 요소 표시.']],
        example: tree(`
src/main/resources/templates/index.html
<link href="/css/style.css">   ← CSS 연결
<script src="/js/app.js">      ← JS 연결
`),
        practice: '`index.html`에서 `<link>`와 `<script>` 태그를 찾고, 각각 어느 폴더의 파일을 가리키는지 적어 보세요.',
        check: [
          { q: 'HTML은 무엇을 정하고, CSS는 무엇을 정하나요?', a: 'HTML은 화면의 구조(무엇이 있는가), CSS는 모양(어떻게 보이는가)을 정합니다.' },
          { q: 'HTML 파일 하나에서 다른 파일을 불러오는 방법은?', a: '`<link>`, `<script>`, `<img>` 태그의 경로를 씁니다.' },
        ],
      },
    ),
    typeLesson(
      'type-css',
      '.css',
      '스타일 시트 파일',
      12,
      '`.css`는 HTML 요소의 색, 크기, 배치를 정하는 스타일 파일입니다.',
      {
        what: 'CSS(Cascading Style Sheets)는 "어떻게 보이는가"를 적습니다. 선택자로 요소를 고르고, 속성(color, margin 등)으로 모양을 정합니다.',
        why: '구조(HTML)와 모양(CSS)을 나누면, 디자인을 바꿔도 HTML을 다시 쓸 필요가 없습니다.',
        where: 'Spring Boot에서는 보통 `static/css`에 둡니다. 브라우저가 직접 요청하는 정적 파일이기 때문입니다.',
        missing: 'CSS가 없으면 화면이 기본 스타일로만 보입니다. 경로가 틀리면 브라우저 콘솔에 404가 나옵니다.',
        connects: 'HTML의 `<link href>`가 이 파일을 부르고, 클래스 이름(`class="card"`)과 연결됩니다.',
        usage: '버튼 색, 카드 모양, 모바일 레이아웃처럼 화면 전체의 모양이 여기서 정해집니다.',
      },
      {
        keyTerms: [['선택자 (selector)', 'CSS가 어느 요소에 적용될지 고르는 규칙. 예: `.card`, `h1`.']],
        example: tree(`
static/css/style.css
.card { padding: 16px; border: 1px solid #ccc; }
`),
        practice: '`style.css`에 `h1 { color: teal; }`를 추가하고 페이지에서 제목 색이 바뀌는지 확인하세요.',
        check: [
          { q: 'CSS 파일은 어느 폴더에 두나요?', a: 'Spring Boot에서는 보통 `static/css`에 둡니다.' },
          { q: 'CSS가 적용되지 않을 때 가장 먼저 볼 것은?', a: 'HTML의 `<link>` 경로와 파일 위치가 맞는지 확인합니다.' },
        ],
      },
    ),
    typeLesson(
      'type-js',
      '.js',
      '자바스크립트 파일',
      12,
      '`.js`는 브라우저나 Node.js에서 실행되는 JavaScript 코드 파일입니다. 화면의 동작(클릭, 입력, 요청)을 맡습니다.',
      {
        what: 'JavaScript는 프로그램 로직을 적는 언어입니다. 브라우저에서는 `document`로 HTML을 바꾸고, 서버 API를 `fetch`로 부릅니다.',
        why: 'HTML과 CSS만으로는 버튼을 누르면 데이터를 저장하는 일을 할 수 없습니다. 동작은 JavaScript가 맡습니다.',
        where: '브라우저가 직접 받는 파일이므로 보통 `static/js`나 프론트엔드의 `src`에 둡니다.',
        missing: '없으면 버튼이 반응하지 않고, 데이터가 서버에 보내지지 않습니다. 파일 경로가 틀리면 콘솔에 404가 나옵니다.',
        connects: 'HTML의 `<script src>`가 파일을 불러오고, `fetch(\'/api/...\')`로 서버 API와 연결됩니다.',
        usage: '이 course 앱의 `public/js/views/courses.js`처럼 화면마다 파일을 나눠 두는 방식이 흔합니다.',
      },
      {
        keyTerms: [
          ['fetch', '브라우저에서 서버에 요청을 보내는 함수.'],
          ['모듈 (module)', '`import`/`export`로 파일을 나누어 쓰는 단위.'],
        ],
        example: tree(`
static/js/app.js
fetch(\'/api/courses\').then((r) => r.json())
`),
        practice: 'JavaScript 파일 하나를 만들어 버튼 클릭 시 `alert("안녕")`이 뜨도록 연결하고, HTML에서 `<script>` 태그로 불러오세요.',
        check: [
          { q: 'JavaScript와 Java는 같은 언어인가요?', a: '아닙니다. 이름만 비슷하고 서로 다른 언어입니다.' },
          { q: 'JavaScript가 서버 데이터를 가져올 때 쓰는 함수는?', a: '`fetch`입니다.' },
        ],
      },
    ),
    typeLesson(
      'type-json',
      '.json',
      'JSON 데이터 파일',
      12,
      '`.json`은 데이터를 `{ "이름": 값 }` 형태로 적은 텍스트 파일입니다. 프로그램끼리 데이터를 주고받을 때 가장 흔히 쓰입니다.',
      {
        what: 'JSON(JavaScript Object Notation)은 키와 값으로 이루어진 구조입니다. 값에는 글자, 숫자, 목록, 다른 객체가 들어갑니다.',
        why: '사람이 읽을 수 있으면서도 프로그램이 쉽게 분석할 수 있는 공통 형식이 필요했습니다.',
        where: '프로젝트 설정(`package.json`), 샘플 데이터, 그리고 API 응답이 주로 이 형식입니다.',
        missing: 'JSON 문법이 틀리면(쉼표 하나, 따옴표 누락) 읽는 프로그램이 오류를 냅니다.',
        connects: 'API 응답은 JSON으로 와서 JavaScript 객체가 되고, 자바에서는 Jackson이 DTO로 바꿉니다.',
        usage: 'Spring의 `@RestController`가 반환하는 객체는 JSON으로 바뀌어 브라우저로 갑니다.',
      },
      {
        keyTerms: [['직렬화 (serialization)', '객체를 JSON 같은 글자 형식으로 바꾸는 것.']],
        example: tree(`
{
  "name": "my-blog",
  "version": "1.0.0"
}
`),
        practice: '간단한 JSON 파일을 만들고, 쉼표를 하나 빼서 오류가 나는지 확인한 뒤 고쳐 보세요.',
        check: [
          { q: 'JSON 파일에 주석을 써도 되나요?', a: '표준 JSON에는 주석이 없습니다. 주석이 필요하면 YAML 같은 다른 형식을 씁니다.' },
          { q: '`package.json`은 무엇을 담나요?', a: 'Node.js 프로젝트의 이름, 버전, 의존성, 실행 명령을 담습니다.' },
        ],
      },
    ),
    typeLesson(
      'type-xml',
      '.xml',
      'XML 파일',
      10,
      '`.xml`은 태그로 데이터와 구조를 적는 텍스트 파일입니다. 오래된 Java 설정과 Maven의 `pom.xml`에서 많이 보입니다.',
      {
        what: 'XML은 `<project><version>1.0</version></project>`처럼 여는 태그와 닫는 태그로 구조를 적습니다. HTML과 모양이 비슷하지만 태그 이름을 마음대로 정합니다.',
        why: '데이터의 구조를 엄격하게 정의하고, 여러 도구가 같은 문서를 읽을 수 있게 하려고 만들어졌습니다.',
        where: 'Maven 프로젝트는 루트의 `pom.xml`에 빌드 설정을 적습니다. Spring에서도 오래된 설정이 `resources`에 XML로 있을 수 있습니다.',
        missing: 'Maven의 `pom.xml`이 없으면 Maven 빌드 자체가 시작되지 않습니다.',
        connects: '`pom.xml`의 의존성은 Maven이 내려받아 `target`의 결과물에 포함시킵니다.',
        usage: 'Maven 프로젝트의 `pom.xml`에서 `<dependency>`를 추가하면 라이브러리가 프로젝트에 들어옵니다.',
      },
      {
        keyTerms: [['의존성 (dependency)', '프로젝트가 쓰는 외부 라이브러리 목록.']],
        example: tree(`
pom.xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>
`),
        practice: '`pom.xml` 또는 `build.gradle`에서 의존성 목록을 찾아 라이브러리 이름 3개를 적어 보세요.',
        check: [
          { q: 'XML과 HTML은 무엇이 비슷하고 무엇이 다른가요?', a: '둘 다 태그를 쓰지만, XML은 태그 이름을 자유롭게 정하고 HTML은 정해진 태그만 씁니다.' },
          { q: 'Maven 설정 파일의 이름은?', a: '`pom.xml`입니다.' },
        ],
      },
    ),
    typeLesson(
      'type-yml',
      '.yml',
      'YAML 설정 파일',
      12,
      '`.yml`(또는 `.yaml`)은 들여쓰기로 구조를 나타내는 설정 파일 형식입니다. Spring Boot의 `application.yml`이 대표적입니다.',
      {
        what: 'YAML은 `server:` 아래에 들여쓴 `port: 8080`처럼 계층을 들여쓰기로 표현합니다. 들여쓰기 칸 수가 의미를 가지므로 탭 대신 공백을 씁니다.',
        why: 'JSON보다 읽기 쉽고 주석을 쓸 수 있어 사람이 고치는 설정에 적합합니다.',
        where: 'Spring Boot는 `src/main/resources/application.yml`을 읽습니다. 환경별로 `application-prod.yml`처럼 나눌 수 있습니다.',
        missing: '없으면 기본값으로 실행됩니다. 들여쓰기가 틀리면 설정이 엉뚱한 곳에 적용되거나 무시됩니다.',
        connects: '`spring.datasource.url` 같은 값이 자바의 `@Value`나 설정 클래스로 들어갑니다.',
        usage: '포트, DB 주소, 로그 수준을 여기서 정합니다. 4번 모듈에서 자세히 봅니다.',
      },
      {
        keyTerms: [['들여쓰기 (indentation)', 'YAML에서 계층을 나타내는 공백. 탭은 쓰지 않습니다.']],
        example: tree(`
server:
  port: 8080
spring:
  datasource:
    url: jdbc:h2:mem:testdb
`),
        practice: '`application.yml`에서 `server.port`를 찾아 값을 바꾸고, 들여쓰기를 한 칸 틀리게 했을 때 어떻게 되는지 확인하세요.',
        check: [
          { q: 'YAML에서 계층은 무엇으로 표현하나요?', a: '들여쓰기(공백)로 표현합니다.' },
          { q: 'JSON과 비교해 YAML의 장점은?', a: '주석을 쓸 수 있고 사람이 읽고 고치기 쉽습니다.' },
        ],
      },
    ),
    typeLesson(
      'type-properties',
      '.properties',
      'properties 설정 파일',
      10,
      '`.properties`는 `키=값` 한 줄씩 적는 가장 단순한 설정 파일입니다. Java 설정에서 오래 쓰였고, Spring Boot도 지원합니다.',
      {
        what: '`server.port=8080`처럼 한 줄에 한 설정을 적습니다. 계층 대신 점(`.`)으로 이름을 나눕니다.',
        why: '간단하고 어디서나 읽을 수 있어서, 작은 설정이나 번역 메시지에 많이 씁니다.',
        where: 'Spring Boot는 `src/main/resources/application.properties`를 읽습니다. 메시지 번역 파일도 `resources`에 둡니다.',
        missing: '없으면 기본 설정으로 동작합니다. `=` 왼쪽 이름이 틀리면 설정이 적용되지 않습니다.',
        connects: 'YAML과 같은 역할이므로 한 프로젝트에 두 파일을 함께 두면 우선순위가 헷갈립니다.',
        usage: '`messages.properties`로 화면 문구를 여러 언어로 나누는 데 쓰입니다.',
      },
      {
        keyTerms: [['키 (key)', '설정의 이름. 예: `server.port`.']],
        example: tree(`
server.port=8080
spring.datasource.url=jdbc:h2:mem:testdb
`),
        practice: '`application.properties`에 `server.port=9090`을 적고 실행한 뒤 접속 주소가 바뀌는지 확인하세요. 같은 값을 `yml`에도 적으면 어느 쪽이 이기는지 조사해 보세요.',
        check: [
          { q: '`.properties` 파일의 한 줄은 어떤 형식인가요?', a: '`키=값` 형식입니다.' },
          { q: 'properties와 yml을 함께 쓰면 생기는 문제는?', a: '같은 키가 두 곳에 있으면 어느 값이 적용되는지 헷갈립니다.' },
        ],
      },
    ),
    typeLesson(
      'type-gradle',
      '.gradle',
      'Gradle 빌드 파일',
      12,
      '`.gradle`은 Gradle 빌드 도구가 읽는 프로젝트 설정 파일입니다. 의존성, 플러그인, 빌드 방법을 적습니다.',
      {
        what: '`build.gradle`은 Groovy 또는 Kotlin 문법으로 쓴 스크립트입니다. `plugins`로 기능을 켜고, `dependencies`로 라이브러리를 추가합니다.',
        why: '빌드 방법을 코드로 적어 두면, 누구나 같은 명령으로 같은 결과를 얻을 수 있습니다.',
        where: '루트 바로 아래에 둡니다. `settings.gradle`과 함께 프로젝트 이름과 구조를 정합니다.',
        missing: '없으면 Gradle 명령이 실패합니다. 의존성이 빠지면 컴파일 오류가 납니다.',
        connects: '`src`를 소스로 읽고, `build`에 결과를 쓰며, `application.yml`을 리소스로 포함합니다.',
        usage: 'Spring Boot 플러그인 한 줄로 `bootRun`과 jar 만들기가 가능해집니다.',
      },
      {
        keyTerms: [
          ['플러그인 (plugin)', '빌드에 기능을 추가하는 확장.'],
          ['의존성 (dependencies)', '프로젝트가 쓰는 라이브러리 목록.'],
        ],
        example: tree(`
plugins {
  id 'org.springframework.boot' version '3.3.0'
}
dependencies {
  implementation 'org.springframework.boot:spring-boot-starter-web'
}
`),
        practice: '`build.gradle`의 `dependencies` 블록에서 라이브러리 이름을 3개 찾고, 각각 무슨 기능을 주는지 짐작해 적어 보세요.',
        check: [
          { q: 'Gradle 빌드 설정 파일의 이름은?', a: '`build.gradle`(또는 `build.gradle.kts`)입니다.' },
          { q: '의존성을 추가하면 무엇이 일어나나요?', a: '빌드할 때 그 라이브러리를 내려받아 프로젝트에 포함합니다.' },
        ],
      },
    ),
    typeLesson(
      'type-md',
      '.md',
      'Markdown 문서',
      10,
      '`.md`(Markdown)는 가벼운 서식으로 쓴 문서입니다. `README.md`처럼 프로젝트 설명서에 가장 많이 쓰입니다.',
      {
        what: 'Markdown은 `#` 제목, `-` 목록, `` `코드` ``처럼 기호로 서식을 표현하는 텍스트 형식입니다. 편집기로 열면 글자, 브라우저로 열면 정리된 문서로 보입니다.',
        why: '코드 옆에 설명을 함께 두기 쉽고, Git 저장소와 GitHub에서 바로 보입니다.',
        where: '프로젝트 루트의 `README.md`가 가장 중요합니다. 설명서가 여러 개라면 `docs/` 폴더에 둡니다.',
        missing: 'README가 없으면 처음 보는 사람이 프로젝트의 목적과 실행 방법을 알 수 없습니다.',
        connects: '`README.md`는 실행 명령과 폴더 설명을 적어 다른 파일(`build.gradle`, `src`)을 가리킵니다.',
        usage: 'GitHub 저장소 첫 화면에 보이는 설명이 바로 루트의 `README.md`입니다.',
      },
      {
        keyTerms: [['README', '프로젝트 소개와 실행 방법을 적은 첫 문서.']],
        example: tree(`
# My Blog
## 실행 방법
./gradlew bootRun
`),
        practice: '프로젝트의 `README.md`를 열어 실행 명령이 적혀 있는지 확인하고, 없다면 두 줄짜리 실행 방법을 직접 적어 보세요.',
        check: [
          { q: '`README.md`는 실행 파일인가요?', a: '아닙니다. 사람이 읽는 설명 문서입니다.' },
          { q: 'README에 무엇을 적으면 좋은가요?', a: '프로젝트 목적, 실행 명령, 폴더 구조 설명입니다.' },
        ],
      },
    ),
    typeLesson(
      'type-env',
      '.env',
      '환경 변수 파일',
      12,
      '`.env`는 `이름=값` 형식으로 환경 변수(비밀번호, 주소)를 적는 파일입니다. 실행 환경마다 다른 값을 코드 밖에서 주입하기 위해 씁니다.',
      {
        what: '`.env` 파일은 실행할 때 읽혀 환경 변수가 됩니다. 예: `DB_PASSWORD=...`. 파일 이름 앞에 점이 붙어 숨김 파일입니다.',
        why: '비밀 값을 코드에 적으면 GitHub에 올라가 유출됩니다. 환경 변수로 분리하면 코드는 공개해도 값은 숨길 수 있습니다.',
        where: '루트에 둡니다. 단, 실제 값이 든 `.env`는 절대 Git에 올리지 않고, 예시만 `.env.example`로 올립니다.',
        missing: '없으면 DB 비밀번호 같은 값이 비어 있어 앱이 시작하지 못하거나 연결에 실패합니다.',
        connects: '실행 프로그램이 `.env`를 읽어 `process.env`나 Spring의 환경 변수로 넘깁니다. `.gitignore`가 이 파일을 제외합니다.',
        usage: '이 course 프로젝트도 `.env.example`로 필요한 변수 이름을 알리고, 실제 `.env`는 git-ignore 처리합니다.',
      },
      {
        keyTerms: [
          ['환경 변수 (environment variable)', '실행 환경이 프로그램에 넘겨주는 이름-값 쌍.'],
          ['시크릿 (secret)', '유출되면 안 되는 값. 비밀번호, API 키.'],
        ],
        example: tree(`
.env              ← 실제 값 (Git에 올리지 않음)
DB_PASSWORD=...

.env.example      ← 이름만 적은 예시 (Git에 올림)
DB_PASSWORD=
`),
        practice: '프로젝트에 `.env.example`이 있는지 확인하고, 있다면 어떤 변수 이름이 적혀 있는지 목록으로 만들어 보세요. 실제 값은 적지 마세요.',
        check: [
          { q: '실제 비밀번호를 `application.yml`에 적으면 안 되는 이유는?', a: '그 파일은 보통 Git에 올라가 누구나 볼 수 있기 때문입니다.' },
          { q: '`.env.example`은 왜 Git에 올리나요?', a: '필요한 변수 이름을 다른 사람에게 알려 주기 위해서입니다. 실제 값은 없습니다.' },
        ],
      },
    ),
    typeLesson(
      'type-gitignore',
      '.gitignore',
      'Git 제외 목록',
      12,
      '`.gitignore`는 Git이 추적하지 않을 파일과 폴더를 적은 목록입니다. 빌드 결과, 비밀 값, 개인 설정을 저장소에서 빼 줍니다.',
      {
        what: '한 줄에 한 패턴을 적습니다. 예: `build/`는 build 폴더 전체, `*.log`는 로그 파일 전체를 뜻합니다.',
        why: '결과물이나 비밀 값을 실수로 커밋하면 저장소가 커지고 유출됩니다. 목록으로 미리 막습니다.',
        where: '저장소 루트에 둡니다. 하위 폴더에도 따로 둘 수 있지만 보통 루트 하나면 충분합니다.',
        missing: '없으면 `build`, `.env`, IDE 설정 파일이 모두 커밋 대상이 되어 저장소가 지저분해지고 비밀이 노출될 수 있습니다.',
        connects: '`.env`, `build/`, `target/`, `node_modules/`를 제외해 저장소와 로컬 파일의 경계를 정합니다.',
        usage: '새 Spring Boot 프로젝트를 만들면 Gradle이 기본 `.gitignore`를 함께 만들어 줍니다.',
      },
      {
        keyTerms: [['패턴 (pattern)', '파일 이름을 와일드카드(`*`)로 고르는 규칙.']],
        example: tree(`
build/
target/
.env
*.log
.idea/
`),
        practice: '프로젝트의 `.gitignore`를 열어 `build`, `.env`가 들어 있는지 확인하세요. 없다면 추가할 항목을 적어 보세요.',
        check: [
          { q: '`.gitignore`에 적은 파일은 이미 올라간 상태여도 빠지나요?', a: '아닙니다. 이미 추적 중인 파일은 `git rm --cached`로 따로 빼야 합니다.' },
          { q: '`build/` 폴더를 `.gitignore`에 넣는 이유는?', a: '결과물이라 언제든 다시 만들 수 있고, 저장소를 불필요하게 키우기 때문입니다.' },
        ],
      },
    ),
    typeLesson(
      'type-dockerfile',
      'Dockerfile',
      '컨테이너 빌드 설명서',
      15,
      'Dockerfile은 앱을 실행할 환경(운영체제, 자바, 파일)을 한 줄씩 적은 설명서입니다. 이 설명서로 컨테이너 이미지를 만들어 어느 서버에서나 같은 환경으로 실행합니다.',
      {
        what: '`FROM`으로 기반 이미지를 고르고, `COPY`로 파일을 넣고, `CMD`로 실행 명령을 정합니다. 각 줄이 이미지의 한 층(layer)이 됩니다.',
        why: '"내 컴퓨터에서는 되는데"라는 문제를 없애기 위해 실행 환경까지 파일로 기록합니다.',
        where: '보통 프로젝트 루트에 `Dockerfile`이라는 이름으로 둡니다. 확장자가 없습니다.',
        missing: '없으면 배포 서버마다 환경을 손으로 맞춰야 합니다. 이 course 프로젝트도 Node.js 이미지를 Dockerfile로 정의했습니다.',
        connects: '`COPY`가 가리키는 `src`, `public`과 `.dockerignore`가 함께 작동합니다. `.dockerignore`는 이미지에서 뺄 파일을 정합니다.',
        usage: '클라우드 서버(Render, Railway 등)는 이 Dockerfile을 읽어 컨테이너를 만들어 실행합니다.',
      },
      {
        keyTerms: [
          ['이미지 (image)', '실행 환경과 파일을 묶은 설계도 덩어리.'],
          ['컨테이너 (container)', '이미지를 실제로 실행한 상태.'],
          ['.dockerignore', '이미지를 만들 때 복사하지 않을 파일 목록.'],
        ],
        example: tree(`
FROM node:22-alpine      ← 기반 환경
WORKDIR /app
COPY server ./server     ← 파일 복사
CMD ["node", "server/index.js"]   ← 실행 명령
`),
        practice: 'Dockerfile의 각 줄을 한 줄씩 읽고 "이 줄은 무엇을 준비하는가"를 적어 보세요. `.dockerignore`에 `.env`가 있는지도 확인하세요.',
        check: [
          { q: 'Dockerfile은 어떤 확장자를 가지나요?', a: '확장자가 없습니다. 파일 이름 자체가 `Dockerfile`입니다.' },
          { q: 'Dockerfile이 있으면 어떤 장점이 있나요?', a: '어느 서버에서나 같은 실행 환경을 자동으로 만들 수 있습니다.' },
        ],
      },
    ),
  ],
  {
    title: '파일 종류 카드',
    description: '프로젝트에서 골라 낸 파일 8종을 카드로 정리합니다.',
    deliverables: ['확장자별 역할 카드 8장', '비밀 값이 어디에 있는지와 .gitignore 확인 결과', 'Dockerfile이 있다면 각 줄의 역할 설명'],
  },
);

export const MODULE_04 = moduleOf(
  'configuration',
  'Configuration',
  '설정',
  'Beginner',
  '프로그램의 동작을 바꾸는 설정 파일과 환경 변수, 그리고 개발 환경과 운영 환경을 어떻게 나누는지 배웁니다.',
  ['application.properties와 application.yml의 역할을 설명할 수 있다.', 'build.gradle이 무엇을 정하는지 말할 수 있다.', '개발 설정과 운영 설정을 나누는 이유를 설명할 수 있다.'],
  [
    lesson(
      'config-application-properties',
      'application.properties',
      '스프링 설정 파일 (properties)',
      12,
      '`application.properties`는 Spring Boot가 시작할 때 읽는 기본 설정 파일입니다. 포트, DB 주소, 로그 수준을 `키=값`으로 적습니다.',
      {
        what: '`src/main/resources/application.properties` 안에 `server.port=8080`처럼 한 줄에 한 설정을 적습니다. 이 파일이 있으면 Spring은 그 값을 기본으로 씁니다.',
        why: '코드를 고치지 않고 실행 방식을 바꾸기 위해 존재합니다. 같은 jar를 다른 값으로 실행할 수 있습니다.',
        where: '`src/main/resources` 바로 아래입니다. Spring이 이 위치(클래스패스)를 자동으로 읽습니다.',
        missing: '없어도 Spring은 기본값으로 실행되지만, DB 연결 같은 값이 없으면 시작에 실패할 수 있습니다.',
        connects: '같은 폴더의 `application.yml`과 함께 쓸 수 있으며, 두 파일에 같은 키가 있으면 우선순위가 정해져 있습니다.',
        usage: '`spring.datasource.url`로 개발용 H2 DB와 운영용 PostgreSQL을 나눠 설정합니다.',
      },
      {
        keyTerms: [['키-값 (key-value)', '설정 이름과 설정 값의 짝.']],
        example: tree(`
src/main/resources/application.properties
server.port=8080
spring.application.name=my-blog
`),
        practice: '`server.port`를 9090으로 바꾸고 실행해 접속 주소가 바뀌는지 확인하세요.',
        check: [
          { q: 'application.properties는 어느 폴더에 있나요?', a: '`src/main/resources`입니다.' },
          { q: '설정을 바꿀 때 코드를 수정해야 하나요?', a: '보통 아닙니다. 설정 파일이나 환경 변수를 바꾸면 됩니다.' },
        ],
      },
    ),
    lesson(
      'config-application-yml',
      'application.yml',
      '스프링 설정 파일 (yml)',
      12,
      '`application.yml`은 `application.properties`와 같은 일을 하지만 들여쓰기로 계층을 적는 형식입니다. 두 파일 중 하나만 쓰는 것이 보통입니다.',
      {
        what: '`server:` 아래에 들여쓴 `port: 8080`처럼 계층을 표현합니다. 주석(`#`)을 쓸 수 있습니다.',
        why: '설정이 많아지면 `.properties`는 같은 접두사를 계속 반복해야 해서 길어집니다. YAML은 묶어서 보여 줍니다.',
        where: '`src/main/resources/application.yml`입니다. 환경별 파일(`application-prod.yml`)도 같은 폴더에 둡니다.',
        missing: '없으면 기본값으로 실행됩니다. 들여쓰기가 틀리면 설정이 잘못된 곳에 적용됩니다.',
        connects: '`spring.profiles.active: prod`처럼 적으면 `application-prod.yml`을 함께 읽습니다.',
        usage: '팀 프로젝트는 YAML에 환경별 블록을 나누고, 비밀 값은 환경 변수로 넘깁니다.',
      },
      {
        keyTerms: [['프로파일 (profile)', '환경별로 다른 설정 묶음. 예: dev, prod.']],
        example: tree(`
server:
  port: 8080
spring:
  profiles:
    active: dev
`),
        practice: '`application.yml`에 `spring.profiles.active: dev`를 적고, `application-dev.yml`을 만들어 다른 포트를 지정해 보세요.',
        check: [
          { q: '`.properties`와 `.yml` 중 주석을 쓸 수 있는 것은?', a: '`.yml`입니다. `.properties`도 `#`으로 주석을 쓸 수 있지만, 계층 표현은 YAML이 더 읽기 쉽습니다.' },
          { q: '둘 다 있으면 어떻게 하나요?', a: '한 가지 형식으로 통일하는 것이 좋습니다. 같은 키가 두 곳에 있으면 헷갈립니다.' },
        ],
      },
    ),
    lesson(
      'config-build-gradle',
      'build.gradle',
      '빌드 설정 파일',
      12,
      '`build.gradle`은 프로젝트를 어떻게 빌드하고 어떤 라이브러리를 쓸지 정하는 파일입니다. 실행 설정(포트 등)과는 다른 종류입니다.',
      {
        what: '`plugins`(기능), `dependencies`(라이브러리), `java`(자바 버전)를 적습니다. 이 파일은 "빌드 방법"이고, 앱이 실행된 뒤의 동작은 `application.yml`이 정합니다.',
        why: '빌드 방법을 코드로 적어 두어야 누가 빌드해도 같은 결과가 나옵니다.',
        where: '프로젝트 루트에 있습니다. `settings.gradle`과 함께 프로젝트 구조를 정합니다.',
        missing: '없으면 `./gradlew`가 동작하지 않습니다. 라이브러리가 빠지면 컴파일이나 실행이 실패합니다.',
        connects: 'dependencies가 가져온 라이브러리는 `build`의 jar에 포함되고, `src/main/resources`는 리소스로 포함됩니다.',
        usage: 'Spring Boot 버전을 올리거나 DB 드라이버를 추가할 때 가장 먼저 고치는 파일입니다.',
      },
      {
        keyTerms: [['빌드 도구 (build tool)', '소스를 컴파일, 테스트, 패키징하는 도구. Gradle과 Maven이 대표적입니다.']],
        example: tree(`
plugins { id 'org.springframework.boot' version '3.3.0' }
java { toolchain { languageVersion = JavaLanguageVersion.of(21) } }
dependencies { implementation 'org.springframework.boot:spring-boot-starter-web' }
`),
        practice: '`build.gradle`에서 Java 버전이 적힌 줄을 찾고, 그 버전을 바꾸면 무엇이 달라지는지 적어 보세요(실제로 바꾸지는 마세요).',
        check: [
          { q: '포트 번호는 `build.gradle`과 `application.yml` 중 어디에 적나요?', a: '`application.yml`입니다. `build.gradle`은 빌드 방법만 정합니다.' },
          { q: '라이브러리를 추가하려면 어느 블록을 고치나요?', a: '`dependencies` 블록입니다.' },
        ],
      },
    ),
    lesson(
      'config-env-variables',
      'Environment Variables',
      '환경 변수',
      15,
      '환경 변수(environment variable)는 실행 환경이 프로그램에 넘겨주는 이름-값 쌍입니다. 파일을 고치지 않고 서버마다 다른 값을 줄 때 씁니다.',
      {
        what: '예: `SPRING_DATASOURCE_URL=jdbc:postgresql://...`. Spring은 환경 변수 이름을 설정 키로 자동 변환해 `application.yml`의 값을 덮어씁니다.',
        why: '비밀번호와 서버 주소는 코드나 설정 파일에 적으면 유출됩니다. 실행 환경에서 주입하면 저장소에는 값이 없습니다.',
        where: '개발 PC에서는 `.env` 또는 IDE 실행 설정, 서버에서는 호스팅 서비스의 환경 변수 화면에 둡니다.',
        missing: '필수 값이 없으면 앱이 시작하면서 "Could not resolve placeholder"처럼 오류를 내고 멈춥니다.',
        connects: 'Spring은 `${DB_PASSWORD}` 자리표시자로 환경 변수를 읽습니다. 우선순위는 환경 변수가 설정 파일보다 높습니다.',
        usage: 'Cloudflare와 Render에서 `ACADEMY_PASSWORD`를 비밀 값으로 넣는 것이 이 방식입니다.',
      },
      {
        keyTerms: [
          ['환경 변수 (environment variable)', '실행 환경이 주는 이름-값 설정.'],
          ['자리표시자 (placeholder)', '설정 파일에서 `${이름}`으로 값을 나중에 채우는 표시.'],
        ],
        example: tree(`
application.yml
  password: \${DB_PASSWORD}      ← 파일에는 값이 없음

실행 환경
  DB_PASSWORD=(서버에서만 주입)
`),
        practice: '`application.yml`에서 자리표시자를 하나 찾고, 그 값이 어디서 와야 하는지 적어 보세요.',
        check: [
          { q: '환경 변수 값이 설정 파일과 다르면 무엇이 이기나요?', a: '보통 환경 변수가 우선합니다. 그래서 운영 값을 파일 대신 환경 변수로 넣습니다.' },
          { q: '비밀 값을 Git에 올리면 생기는 문제는?', a: '누구나 저장소 기록에서 값을 볼 수 있고, 한 번 올린 값은 바꾸기 전까지 노출됩니다.' },
        ],
      },
    ),
    lesson(
      'config-dev-vs-prod',
      'Development vs Production Configuration',
      '개발 설정과 운영 설정',
      15,
      '개발 설정(development)은 내 PC에서 실험하기 쉽게, 운영 설정(production)은 실제 사용자를 안전하게 맞추도록 나눈 설정입니다.',
      {
        what: '개발은 H2 같은 메모리 DB, 상세 로그, 열린 설정이 흔합니다. 운영은 실제 DB, 최소 로그, 비밀 값을 환경 변수로 받는 설정입니다.',
        why: '개발용 값을 운영에 그대로 쓰면 데이터 유출, 실험 데이터 섞임, 느린 설정이 생깁니다. 나누어 두면 실수를 줄입니다.',
        where: '`application-dev.yml`과 `application-prod.yml`처럼 같은 `resources` 폴더에 나눠 둡니다.',
        missing: '운영 설정이 없으면 개발 기본값으로 실행되어 데이터가 메모리에만 남아 재시작하면 사라집니다. 이 course 앱이 Durable Object 저장소를 쓰는 이유도 데이터를 잃지 않기 위해서입니다.',
        connects: '`spring.profiles.active`가 어느 파일을 읽을지 고르고, 운영 서버는 그 값을 환경 변수로 넘깁니다.',
        usage: '같은 jar를 개발 PC에서는 `dev`, 서버에서는 `prod` 프로파일로 실행합니다.',
      },
      {
        keyTerms: [
          ['프로파일 (profile)', '환경별 설정 묶음을 고르는 이름.'],
          ['메모리 DB (in-memory database)', '재시작하면 데이터가 사라지는 임시 데이터베이스. 개발용으로 씁니다.'],
        ],
        example: tree(`
application-dev.yml     ← H2 메모리 DB, 상세 로그
application-prod.yml    ← 실제 DB 주소는 환경 변수에서 읽음
`),
        practice: '개발과 운영에서 달라야 하는 설정 값 3가지를 찾아 표로 적어 보세요. 각 값을 어디에 둘지(파일 또는 환경 변수) 정하세요.',
        check: [
          { q: '개발용 H2 메모리 DB를 운영에 쓰면 무슨 일이 생기나요?', a: '서버가 재시작할 때 모든 데이터가 사라집니다.' },
          { q: '운영 비밀번호는 어느 파일에 두는 것이 안전한가요?', a: '파일이 아니라 실행 환경의 환경 변수(또는 비밀 저장소)에 둡니다.' },
        ],
      },
    ),
  ],
  {
    title: '환경별 설정 표',
    description: '같은 프로젝트의 개발과 운영 설정을 나란히 비교합니다.',
    deliverables: ['개발과 운영에서 다른 값 5개의 표', '비밀 값이 들어갈 자리와 위치(환경 변수)', '설정을 바꿨을 때 재빌드가 필요한지 여부'],
  },
);
