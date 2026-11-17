// 코드 해부 사전. Every entry explains one piece of code in plain Korean.
//
//   short   one line shown on hover
//   read    how the token reads inside a sentence ("이 줄 해석")
//   body    the longer explanation shown when clicked (paragraphs)
//   example optional code, itself explorable
//   deeper  ids to click into next ("더 깊이")
//   sql     true when this token can make JPA send SQL (🔶)
//
// Words are matched exactly; RULES below handle families such as getXxx().

export const TERMS = {
  // ── 기호 ────────────────────────────────────────────────
  dot: {
    label: '.  (점)',
    short: '"~의" 또는 "~에게 시킨다". 왼쪽 것이 가진 기능/값을 꺼낸다.',
    read: '의',
    body: [
      '점은 "왼쪽 객체에게 오른쪽 일을 시킨다"는 뜻입니다. `store.getName()` = "store야, 네 이름 알려줘".',
      '점이 여러 개 이어지면(메서드 체이닝) 왼쪽부터 차례로 실행하고, 앞 결과에게 다음 일을 시킵니다. `store.getReviews().size()` = store에게 리뷰 목록을 받고 → 그 목록에게 개수를 묻는다.',
    ],
    deeper: ['object', 'method', 'chaining'],
  },
  chaining: {
    label: '메서드 체이닝',
    short: 'a.b().c() 처럼 점을 이어서, 앞 결과에게 다음 일을 시키는 것.',
    body: [
      '읽는 법: 왼쪽에서 오른쪽으로, "결과를 받아서 → 다음". 괄호가 닫힐 때마다 값 하나가 생긴다고 생각하세요.',
      '`store.getReviews().size()` 는 두 단계입니다: ① `store.getReviews()` → 리뷰 목록(List) 하나가 생김 ② 그 List에게 `.size()` → 숫자 하나가 생김.',
      '어디서 막혔는지 모르겠으면 한 단계씩 변수로 쪼개 보세요.',
    ],
    example: 'List<Review> reviews = store.getReviews();\nint count = reviews.size();',
    deeper: ['method', 'return'],
  },
  semicolon: {
    label: ';  (세미콜론)',
    short: '문장 끝. 한국어의 마침표.',
    read: '(끝)',
    body: ['자바는 줄바꿈이 아니라 세미콜론으로 문장이 끝난 것을 압니다. 빠뜨리면 "\';\' expected" 컴파일 에러.'],
    deeper: [],
  },
  parens: {
    label: '( )  (괄호)',
    short: '메서드 이름 뒤의 괄호 = "지금 실행해!". 안에는 재료(인자)를 넣는다.',
    body: [
      '`size` 는 기능의 이름이고, `size()` 는 그 기능을 실행하라는 뜻입니다. 괄호가 비어 있으면 재료 없이 실행.',
      '`findById(1L)` 처럼 괄호 안의 값을 인자(argument)라고 합니다. if/for 뒤의 괄호는 조건을 담습니다.',
    ],
    deeper: ['method', 'argument'],
  },
  braces: {
    label: '{ }  (중괄호)',
    short: '코드 묶음(블록)의 시작과 끝. 클래스, 메서드, if, for의 몸통.',
    body: ['열린 `{` 와 닫힌 `}` 사이가 한 덩어리입니다. 그 안에서 만든 변수는 밖에서 못 씁니다(스코프).'],
    deeper: ['scope'],
  },
  generic: {
    label: '< >  (제네릭)',
    short: '"무엇이 담긴" 상자인지 적는 표시. List<Store> = Store만 담는 목록.',
    body: [
      '`List<Store>` 는 "Store 객체만 들어가는 List"입니다. 다른 것을 넣으려고 하면 컴파일 에러로 미리 막아 줍니다.',
      '`Optional<Store>`, `Map<Long, Store>` 처럼 상자 종류 뒤에 내용물 타입을 적습니다.',
    ],
    deeper: ['List', 'type'],
  },
  assign: {
    label: '=  (대입)',
    short: '오른쪽 값을 왼쪽 변수에 넣는다. 수학의 "같다"가 아님.',
    read: '←',
    body: ['`int count = 3;` = count라는 상자에 3을 넣는다. 같은지 비교는 `==` (기본형) 또는 `.equals()` (객체).'],
    deeper: ['variable', 'equals'],
  },
  arrow: {
    label: '->  (람다 화살표)',
    short: '이름 없는 짧은 함수. 왼쪽 = 받는 값, 오른쪽 = 할 일.',
    body: ['`s -> s.getName()` = "s를 받으면 s의 이름을 돌려줘". stream, forEach, 정렬 기준에 자주 씁니다.'],
    deeper: ['stream'],
  },
  methodref: {
    label: '::  (메서드 참조)',
    short: '람다의 줄임말. Store::getName = s -> s.getName()',
    body: ['`map(Store::getName)` 은 `map(s -> s.getName())` 과 같습니다.'],
    deeper: ['arrow'],
  },

  // ── 자바 기본 ───────────────────────────────────────────
  object: {
    label: '객체 (object)',
    short: '데이터(필드) + 기능(메서드)을 함께 가진 하나의 "물건". 클래스로 찍어 낸 실물.',
    body: [
      '클래스가 붕어빵 틀이면 객체는 붕어빵입니다. `Store` 는 틀, `store` 변수에 들어 있는 것이 맛집 하나(객체).',
      '객체에게 일을 시킬 때 점(.)을 씁니다.',
    ],
    deeper: ['class', 'variable', 'method'],
  },
  class: {
    label: '클래스 (class)',
    short: '객체를 만드는 설계도. 이름이 대문자로 시작한다 (Store, Review).',
    read: '',
    body: [
      '필드(가진 값)와 메서드(할 수 있는 일)를 적어 둔 설계도입니다.',
      '자바 규칙: 클래스 이름은 대문자로 시작(Store), 변수·메서드는 소문자로 시작(store, getName).',
    ],
    deeper: ['object', 'field', 'Entity'],
  },
  variable: {
    label: '변수 (variable)',
    short: '값을 담은 이름표 붙은 상자. 소문자로 시작한다.',
    body: [
      '`Store store = ...` 에서 앞의 `Store` 는 상자 종류(타입), 뒤의 `store` 는 상자 이름(변수).',
      '객체 변수에는 객체 자체가 아니라 "객체가 있는 위치(참조)"가 들어 있습니다. 그래서 두 변수가 같은 객체를 가리킬 수 있습니다.',
    ],
    deeper: ['type', 'object'],
  },
  type: {
    label: '타입 (type)',
    short: '값의 종류. int(정수), String(글자), Store(맛집 객체), List<Review>(리뷰 목록)…',
    body: ['자바는 변수마다 타입을 정해야 합니다. 타입이 맞지 않으면 실행 전에 컴파일 에러로 알려 줍니다.'],
    deeper: ['int', 'String', 'generic'],
  },
  field: {
    label: '필드 (field)',
    short: '객체가 가진 값. Store의 name, area, reviews 같은 것.',
    body: ['엔티티의 필드는 보통 DB 테이블의 컬럼과 1:1로 대응합니다. 단, `@OneToMany` 필드(reviews)는 컬럼이 아니라 다른 테이블을 가리킵니다.'],
    deeper: ['Entity', 'getter'],
  },
  method: {
    label: '메서드 (method)',
    short: '객체가 할 수 있는 일. 이름 뒤에 ( )를 붙여 실행한다.',
    body: [
      '메서드는 재료(인자)를 받아 일을 하고, 결과(반환값)를 돌려줄 수 있습니다.',
      '이름으로 하는 일을 짐작하세요: get = 꺼내기, set = 바꾸기, find = 찾기, save = 저장, is/has = 예/아니오 질문.',
    ],
    deeper: ['parens', 'return', 'getter'],
  },
  argument: {
    label: '인자 (argument)',
    short: '메서드에 넘기는 재료. findById(1L)의 1L.',
    body: ['메서드 선언 쪽에서는 매개변수(parameter), 호출하는 쪽에서 넣는 실제 값은 인자(argument)라고 부릅니다.'],
    deeper: ['method'],
  },
  return: {
    label: 'return (반환)',
    short: '메서드가 일을 끝내고 결과를 돌려준다.',
    read: '돌려준다',
    body: ['`return count;` 를 만나면 메서드가 즉시 끝나고 count를 호출한 쪽에 돌려줍니다. 반환 타입이 void면 돌려주는 값이 없습니다.'],
    deeper: ['method', 'void'],
  },
  void: { label: 'void', short: '돌려주는 값이 없음.', body: ['일만 하고 결과를 돌려주지 않는 메서드의 반환 타입입니다.'], deeper: ['return'] },
  scope: { label: '스코프 (scope)', short: '변수를 쓸 수 있는 범위. 선언된 { } 안.', body: ['for 문 안에서 만든 변수는 for 문 밖에서 쓸 수 없습니다.'], deeper: ['braces'] },
  getter: {
    label: 'getter (getXxx)',
    short: 'get + 필드이름 = 그 필드 값을 꺼내 주는 메서드.',
    body: [
      '`getName()` 은 name 필드를 꺼냅니다. Lombok의 `@Getter` 를 붙이면 자동으로 만들어집니다.',
      'JPA 엔티티에서 주의: 연관관계 필드의 getter(`getReviews()`, `getStore()`)는 LAZY일 때 프록시를 돌려주고, 그 안을 쓰는 순간 SQL이 나갈 수 있습니다.',
    ],
    deeper: ['field', 'LAZY', 'proxy'],
  },
  setter: {
    label: 'setter (setXxx)',
    short: 'set + 필드이름 = 그 필드 값을 바꾸는 메서드.',
    body: ['JPA에서는 setter로 값을 바꾸기만 해도 트랜잭션이 끝날 때 UPDATE가 나갑니다(변경 감지). 실무에서는 setter 대신 `changeName()` 처럼 의미 있는 메서드를 선호합니다.'],
    deeper: ['dirtyChecking'],
  },
  equals: { label: 'equals / ==', short: '객체가 "같은 내용"인지는 equals, 기본형 값 비교는 ==.', body: ['문자열 비교를 `==` 로 하면 내용이 같아도 false가 나올 수 있습니다. 문자열은 `a.equals(b)`.'], deeper: ['String'] },
  new: { label: 'new', short: '설계도(클래스)로 새 객체를 만든다.', read: '새로 만든', body: ['`new Store()` = Store 객체 하나를 메모리에 새로 만든다. JPQL의 `select new Dto(...)` 는 조회 결과로 DTO 객체를 바로 만든다는 뜻.'], deeper: ['object', 'DTO'] },
  this: { label: 'this', short: '"나 자신(이 객체)".', body: ['`this.name = name;` = 내 필드 name에 받은 값 name을 넣는다. 이름이 같을 때 구분하려고 씁니다.'], deeper: ['field'] },
  for: {
    label: 'for 반복문',
    short: '목록의 각 항목마다 { } 안을 반복한다.',
    read: '각각에 대해 반복',
    body: [
      '`for (Store store : stores)` = stores 목록에서 하나씩 꺼내 store라고 부르며 반복.',
      'JPA 주의: 반복문 안에서 연관 데이터를 꺼내면 반복 횟수만큼 SQL이 나갑니다 = N+1. 결함의 무늬 1번 "반복문 안의 조회".',
    ],
    deeper: ['nPlusOne'],
  },
  if: { label: 'if', short: '조건이 참일 때만 실행.', read: '만약', body: ['결함의 무늬 2번 "읽기 → 자바 검사(if) → 저장"에 주의: 동시에 여러 요청이 오면 검사와 저장 사이에 값이 바뀔 수 있습니다.'], deeper: ['conditionalUpdate'] },
  int: { label: 'int / long', short: '정수. long은 더 큰 정수(id에 주로 사용). 1L의 L = long.', body: ['`(long) x` 는 x를 long으로 바꾼다(형변환).'], deeper: ['type'] },
  String: { label: 'String', short: '글자(문자열) 타입.', body: ['큰따옴표로 감싼 값 "부산". 비교는 equals.'], deeper: ['equals'] },
  public: { label: 'public / private', short: '접근 범위. public = 어디서나, private = 이 클래스 안에서만.', body: ['엔티티 필드는 보통 private으로 숨기고 getter로 꺼냅니다(캡슐화).'], deeper: ['field'] },
  static: { label: 'static', short: '객체가 아니라 클래스에 하나만 있는 것.', body: ['`Math.max()` 처럼 객체를 만들지 않고 클래스 이름으로 바로 씁니다.'], deeper: ['class'] },
  final: { label: 'final', short: '한 번 넣으면 못 바꾸는 값.', body: ['Spring에서 `private final StoreRepository storeRepository;` + 생성자 주입이 표준 모양입니다.'], deeper: ['DI'] },
  null: { label: 'null', short: '"아무것도 가리키지 않음". null에 점(.)을 찍으면 NullPointerException.', body: ['findById 결과가 없을 수 있어서 Optional로 감쌉니다.'], deeper: ['Optional'] },
  exception: { label: '예외 (Exception)', short: '실행 중 생긴 문제. throw로 던지고 try-catch로 잡는다.', body: ['조건부 UPDATE 결과가 0행이면 예외를 던져 "실패"를 알리는 것이 사건 3·5의 정답 모양입니다.'], deeper: ['conditionalUpdate'] },

  // ── 컬렉션 ──────────────────────────────────────────────
  List: {
    label: 'List',
    short: '순서가 있는 목록. 같은 값이 여러 번 들어갈 수 있다.',
    body: ['`List<Store>` = 맛집 목록. 자주 쓰는 기능: `size()` 개수, `get(0)` 첫 번째, `add(x)` 추가, `isEmpty()` 비었나.'],
    deeper: ['generic', 'size', 'collection'],
  },
  collection: {
    label: '컬렉션',
    short: '여러 값을 담는 상자들(List, Set, Map)의 통칭.',
    body: ['JPA에서 `@OneToMany` 필드는 컬렉션입니다. LAZY라서 처음엔 비어 있는 프록시 컬렉션이고, 처음 열 때 SQL이 나갑니다.'],
    deeper: ['List', 'LAZY'],
  },
  size: {
    label: 'size()',
    short: '목록 안의 개수를 센다.',
    read: '개수를 센다',
    body: [
      '`list.size()` 는 int 하나를 돌려줍니다.',
      'JPA 함정: LAZY 컬렉션(`store.getReviews()`)에 `.size()` 를 부르면 개수를 세려고 그 순간 DB에서 리뷰를 전부 가져옵니다 → 🔶 SQL 1번. 반복문 안이면 N번.',
    ],
    example: '(long) store.getReviews().size()   // 🔶 맛집마다 SQL 1번',
    deeper: ['LAZY', 'nPlusOne'],
    sql: true,
  },
  add: { label: 'add()', short: '목록에 하나 추가.', read: '추가한다', body: ['JPA 주의: mappedBy 쪽 컬렉션(거울)에만 add하면 DB의 외래키는 안 바뀝니다.'], deeper: ['mappedBy'] },
  get: { label: 'get()', short: '목록에서 n번째, 또는 Optional에서 값 꺼내기.', read: '꺼낸다', body: ['`list.get(0)` 첫 번째. `optional.get()` 은 값이 없으면 예외 → orElseThrow 권장.'], deeper: ['Optional'] },
  stream: { label: 'stream()', short: '목록을 컨베이어 벨트에 올려 걸러내고(filter) 바꾸고(map) 모으는(collect) 방식.', read: '하나씩 흘려서', body: ['for 반복문의 다른 모양입니다. 그래서 stream 안에서 연관 데이터를 꺼내도 N+1이 됩니다.'], deeper: ['arrow', 'nPlusOne'] },
  map: { label: 'map()', short: 'stream의 각 항목을 다른 값으로 바꾼다.', read: '바꿔서', body: ['`stores.stream().map(Store::getName)` = 맛집들을 이름들로.'], deeper: ['stream'] },
  filter: { label: 'filter()', short: 'stream에서 조건에 맞는 것만 남긴다.', read: '골라서', body: [], deeper: ['stream'] },
  toList: { label: 'toList() / collect()', short: 'stream 결과를 다시 List로 모은다.', read: '목록으로 모은다', body: [], deeper: ['stream', 'List'] },
  Optional: {
    label: 'Optional',
    short: '"값이 있을 수도, 없을 수도 있는" 상자. findById의 반환 타입.',
    body: ['`findById(id).orElseThrow()` = 있으면 꺼내고 없으면 예외. `.get()` 은 없을 때 터지므로 피하세요.'],
    deeper: ['null', 'findById'],
  },
  orElseThrow: { label: 'orElseThrow()', short: 'Optional에 값이 없으면 예외를 던지고, 있으면 꺼낸다.', read: '꺼낸다(없으면 예외)', body: [], deeper: ['Optional', 'exception'] },

  // ── Spring ─────────────────────────────────────────────
  Repository: {
    label: 'Repository (저장소)',
    short: 'DB와 대화하는 담당. 메서드 이름만으로 SQL을 만들어 준다.',
    body: [
      '`StoreRepository extends JpaRepository<Store, Long>` 만 써도 findAll, findById, save, delete가 생깁니다.',
      '요청 흐름: Controller(주문 받기) → Service(요리) → Repository(창고 담당) → DB.',
    ],
    deeper: ['findAll', 'queryMethod', 'layers'],
  },
  Service: { label: 'Service', short: '실제 업무 규칙을 처리하는 층. 보통 @Transactional이 여기 붙는다.', body: ['검사(권한, 잔액), 계산, 여러 Repository 호출을 묶습니다.'], deeper: ['layers', 'Transactional'] },
  Controller: { label: 'Controller', short: '요청(URL)을 받아 Service에 넘기고 화면/JSON을 돌려주는 층.', body: ['`@GetMapping("/stores")` 처럼 주소와 메서드를 연결합니다.'], deeper: ['layers'] },
  layers: {
    label: '요청 한 번이 지나가는 길',
    short: '브라우저 → Controller → Service → Repository → DB, 그리고 다시 거꾸로.',
    body: [
      '식당 비유: Controller = 홀 직원(주문 받기), Service = 주방장(조리 규칙), Repository = 창고 담당, DB = 창고.',
      '결함 사건의 "용의자" 단계에서는 이 순서대로 한 줄씩 따라갑니다.',
    ],
    example: '@GetMapping("/stores")\npublic String list(Model model) {\n    model.addAttribute("stores", storeService.findStoreList());\n    return "stores/list";\n}',
    deeper: ['Controller', 'Service', 'Repository'],
  },
  DI: { label: '의존성 주입 (DI)', short: '필요한 객체를 Spring이 알아서 넣어 준다.', body: ['`private final StoreRepository storeRepository;` 를 생성자로 받으면 Spring이 만들어 둔 Repository를 넣어 줍니다. 직접 new 하지 않습니다.'], deeper: ['final'] },
  Transactional: {
    label: '@Transactional',
    short: '안의 DB 작업을 한 묶음으로. 전부 성공하거나 전부 취소(롤백).',
    body: [
      '트랜잭션이 열려 있는 동안 영속성 컨텍스트가 살아 있어서 LAZY 로딩과 변경 감지가 동작합니다.',
      '주의: @Transactional만으로 동시성 문제가 해결되지 않습니다. 두 요청이 같은 옛 값을 동시에 읽는 것은 막지 못합니다.',
      '`readOnly = true` 는 조회 전용(변경 감지 안 함).',
    ],
    deeper: ['persistenceContext', 'conditionalUpdate'],
  },

  // ── JPA ────────────────────────────────────────────────
  Entity: {
    label: '@Entity (엔티티)',
    short: 'DB 테이블 한 줄(행)과 짝이 되는 자바 클래스.',
    body: ['`@Entity class Store` ↔ store 테이블. 필드 ↔ 컬럼. JPA(Hibernate)가 이 짝을 보고 SQL을 대신 만듭니다.'],
    deeper: ['field', 'ManyToOne', 'OneToMany'],
  },
  ManyToOne: {
    label: '@ManyToOne',
    short: '"여러 개가 하나에 속한다". 리뷰 N개 → 맛집 1개. 외래키를 가진 쪽(주인). 기본 EAGER.',
    body: [
      '`Review.store` 에 붙습니다. review 테이블의 store_id 컬럼이 이 필드입니다.',
      '기본값 EAGER라서 리뷰를 JPQL로 여러 개 읽으면 맛집을 따로따로 또 읽습니다(측정 52번). 실무에서는 `fetch = FetchType.LAZY` 로 바꿉니다.',
    ],
    deeper: ['owner', 'EAGER', 'LAZY'],
    sql: true,
  },
  OneToMany: {
    label: '@OneToMany',
    short: '"하나가 여러 개를 가진다". 맛집 1개 → 리뷰 N개. 보통 mappedBy(거울). 기본 LAZY.',
    body: ['`Store.reviews` 에 붙습니다. 이 필드는 테이블 컬럼이 아니라 review 테이블을 거꾸로 바라보는 거울입니다. 처음 열 때 SQL이 나갑니다.'],
    deeper: ['mappedBy', 'LAZY', 'nPlusOne'],
  },
  mappedBy: {
    label: 'mappedBy',
    short: '"나는 주인이 아니라 거울이다(읽기 전용)". 값은 상대 필드 이름.',
    body: ['`@OneToMany(mappedBy = "store")` = Review의 store 필드가 주인이다. 거울에만 add해도 DB는 안 바뀝니다(측정: store_id null).'],
    deeper: ['owner'],
  },
  owner: {
    label: '연관관계의 주인',
    short: '외래키 값을 실제로 바꿀 수 있는 쪽 = 외래키 컬럼이 있는 테이블의 필드 (Review.store).',
    body: ['외래키는 항상 N(다) 쪽 테이블에 있습니다 → review.store_id. 그래서 주인은 Review.store.'],
    deeper: ['mappedBy', 'ManyToOne'],
  },
  LAZY: {
    label: 'LAZY (지연 로딩)',
    short: '연관 데이터를 "쓰는 순간" 가져온다. 그전까지는 프록시(껍데기).',
    read: '',
    body: [
      '식당 비유: 후기 목록을 달라고 하면 처음엔 번호만 적힌 주문서(프록시)를 줍니다. 펼쳐 보는 순간 창고(DB)에 다녀옵니다.',
      '오해: "LAZY로 바꾸면 N+1이 사라진다" → X. 반복문에서 펼쳐 보면 그대로 N번 나갑니다(측정 11번).',
      '트랜잭션이 끝난 뒤에 펼치면 LazyInitializationException.',
    ],
    deeper: ['proxy', 'nPlusOne', 'lazyInit'],
  },
  EAGER: {
    label: 'EAGER (즉시 로딩)',
    short: '엔티티를 가져올 때 연관 데이터도 바로 가져온다.',
    body: ['오해: "EAGER는 한 번에 읽는다" → X. findAll(JPQL)로 읽으면 목록 1번 + 연관 데이터 따로따로(측정 52번). 예측하기 어려워서 실무는 LAZY + fetch join.'],
    deeper: ['LAZY', 'fetchJoin'],
  },
  proxy: {
    label: '프록시',
    short: '진짜 객체 대신 넣어 둔 껍데기. id(번호)만 알고, 다른 값이 필요하면 그때 DB에 간다.',
    body: ['`getReferenceById(1L)` 직후 SQL 0번, `getId()` 0번(번호는 앎), `getName()` 1번(진짜 값 필요).'],
    deeper: ['LAZY', 'lazyInit'],
  },
  lazyInit: {
    label: 'LazyInitializationException',
    short: '트랜잭션(세션)이 끝난 뒤 프록시를 열려고 해서 나는 에러.',
    body: ['DB가 느려서가 아닙니다. 해결: Service(@Transactional 안)에서 필요한 값을 꺼내 DTO로 만들어 넘기거나 fetch join.'],
    deeper: ['Transactional', 'DTO'],
  },
  nPlusOne: {
    label: 'N+1 문제',
    short: '목록 1번 + 목록의 각 줄마다 1번씩 = 1 + N번 SQL. 맛집 50곳 → 51번.',
    body: [
      '목록을 한 번 가져온 다음(1), 반복문에서 각 항목의 연관 데이터를 꺼낼 때마다(N) SQL이 추가로 나갑니다.',
      '해결 4가지: fetch join(2번) · @EntityGraph · batch size(6번) · DTO 직접 조회(1번, 사건 1 정답).',
    ],
    example: 'List<Store> stores = storeRepository.findAll();   // 1번\nfor (Store store : stores) {\n    store.getReviews().size();                       // N번\n}',
    deeper: ['LAZY', 'fetchJoin', 'DTO'],
  },
  fetchJoin: {
    label: 'fetch join',
    short: '연관 데이터를 처음 조회할 때 JOIN으로 한 번에 같이 가져오기.',
    body: ['`select s from Store s left join fetch s.reviews` → 맛집과 리뷰를 SQL 한 번에. 주의: 컬렉션 fetch join + 페이징은 같이 쓰기 어렵습니다.'],
    deeper: ['nPlusOne', 'JPQL'],
  },
  DTO: {
    label: 'DTO',
    short: '화면/응답에 필요한 값만 담아 나르는 상자. 엔티티가 아님.',
    body: ['`select new StoreListDto(s.id, s.name, count(r)) ... group by s` 처럼 DTO로 바로 조회하면 SQL 1번. 엔티티가 아니라서 수정(변경 감지)은 못 합니다.'],
    deeper: ['nPlusOne', 'new'],
  },
  persistenceContext: {
    label: '영속성 컨텍스트',
    short: '트랜잭션 동안 JPA가 들고 있는 엔티티 보관함. 1차 캐시 + 변경 감지.',
    body: ['같은 id를 두 번 찾으면 두 번째는 보관함에서(SQL 1번). 처음 꺼낼 때 스냅샷을 찍어 두고 커밋 때 비교합니다.'],
    deeper: ['dirtyChecking', 'Transactional'],
  },
  dirtyChecking: {
    label: '변경 감지 (dirty checking)',
    short: 'save를 안 불러도, 꺼낸 엔티티 값을 바꾸면 커밋 때 UPDATE가 자동으로 나간다.',
    body: ['findById + 값 변경 = SQL 2번(select + update). 벌크 UPDATE는 보관함을 거치지 않아 옛 값이 남음 → clearAutomatically.'],
    deeper: ['persistenceContext'],
  },
  conditionalUpdate: {
    label: '조건부 UPDATE',
    short: 'DB가 검사와 변경을 한 문장으로: update … set point = point - 100 where id = ? and point >= 100',
    body: [
      '결함의 무늬 2번(읽기 → 자바 검사 → 저장)의 해결책. 자바에서 if로 검사하면 동시에 들어온 요청 둘이 같은 값을 보고 둘 다 통과합니다.',
      'DB의 UPDATE 한 문장은 행 잠금 안에서 검사와 변경을 같이 하므로 안전합니다. 반환된 행 수가 0이면 실패 → 예외.',
    ],
    example: '@Modifying\n@Query("update Coupon c set c.used = true where c.id = :id and c.used = false")\nint use(@Param("id") Long id);',
    deeper: ['Modifying', 'exception'],
  },
  JPQL: { label: 'JPQL', short: '엔티티·필드 이름으로 쓰는 SQL. from Store s (테이블명 아님).', body: ['@Query 안에 씁니다. Hibernate가 실제 SQL로 바꿉니다.'], deeper: ['Query'] },
  Query: { label: '@Query', short: 'Repository 메서드에 직접 JPQL을 적는다.', body: ['메서드 이름 규칙으로 표현하기 어려운 조회(join fetch, 집계, DTO)를 쓸 때.'], deeper: ['JPQL', 'Modifying', 'Param'] },
  Modifying: { label: '@Modifying', short: 'update/delete JPQL에 필수. 반환값 = 바뀐 행 수.', body: ['`clearAutomatically = true` 를 주면 실행 후 영속성 컨텍스트를 비워 옛 값 문제를 막습니다.'], deeper: ['conditionalUpdate', 'dirtyChecking'] },
  Param: { label: '@Param', short: 'JPQL의 :id 와 메서드 인자를 이름으로 짝 지어 준다.', body: ['`where s.id = :id` ↔ `@Param("id") Long id`'], deeper: ['Query'] },
  queryMethod: {
    label: '쿼리 메서드 (이름 → SQL)',
    short: 'find/exists/count/delete + By + 필드 + And/Or/OrderBy 규칙으로 SQL이 자동 생성.',
    body: ['`existsByMemberIdAndStoreId(m, s)` → `where member_id = ? and store_id = ?`', '결함의 무늬 3번 "확인 후 저장": existsBy… 다음 줄에 save가 오면 동시 요청에 중복 저장될 수 있습니다 → UNIQUE 제약.'],
    deeper: ['Repository', 'unique'],
    sql: true,
  },
  unique: { label: 'UNIQUE 제약', short: 'DB가 "같은 조합은 한 줄만" 지키게 하는 규칙.', body: ['`@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"member_id", "store_id"}))` 사건 2·7의 정답.'], deeper: ['queryMethod'] },
  findAll: {
    label: 'findAll()',
    short: '테이블의 모든 행을 가져온다. 🔶 SQL 1번 (select … from store).',
    read: '전부 가져오고',
    body: ['N+1의 "1"이 바로 이것입니다. 연관관계가 EAGER면 추가 SQL이 더 나갈 수 있습니다.'],
    deeper: ['nPlusOne', 'EAGER'],
    sql: true,
  },
  findById: { label: 'findById()', short: 'id로 한 행을 찾는다. 결과는 Optional. 🔶 SQL 1번 (1차 캐시에 있으면 0번).', read: 'id로 찾고', body: [], deeper: ['Optional', 'persistenceContext'], sql: true },
  findAllById: { label: 'findAllById()', short: '여러 id를 한 번에 조회 (where id in (…)). 없는 id는 결과에서 빠진다.', read: '여러 id를 한 번에 찾고', body: ['사건 8 정답: AI가 준 번호 목록을 DB와 대조해서 실제로 있는 것만 남깁니다.'], deeper: ['nPlusOne'], sql: true },
  getReferenceById: { label: 'getReferenceById()', short: 'SQL 없이 프록시(껍데기)만 받는다. 값을 읽을 때 SQL.', read: '껍데기를 받고', body: ['없는 id여도 이 순간엔 에러가 안 나고, 나중에 값을 읽을 때 EntityNotFoundException (사건 8의 500 에러).'], deeper: ['proxy'] },
  save: { label: 'save()', short: '새 엔티티는 INSERT, 이미 있는 것은 merge.', read: '저장한다', body: ['이미 영속 상태인 엔티티는 save를 안 불러도 변경 감지로 UPDATE됩니다.'], deeper: ['dirtyChecking'], sql: true },

  // ── defect-lab 전용 getter ──────────────────────────────
  getReviews: {
    label: 'getReviews()',
    short: '이 맛집의 리뷰 목록을 꺼낸다. @OneToMany LAZY → 아직 비어 있는 프록시 컬렉션.',
    read: '리뷰 목록을 꺼내서',
    body: [
      '`Store.reviews` 필드의 getter입니다. 이 필드는 `@OneToMany(mappedBy = "store")` 이고 기본 LAZY입니다.',
      'getReviews()만 부르면 아직 SQL이 안 나갑니다. 그 목록에 `.size()` 처럼 안을 들여다보는 순간 🔶 `select … from review where store_id = ?` 가 나갑니다.',
    ],
    deeper: ['getter', 'OneToMany', 'LAZY', 'size'],
    sql: true,
  },
  getStore: { label: 'getStore()', short: '이 리뷰/찜이 속한 맛집. @ManyToOne → 기본 EAGER (LAZY로 바꿨다면 프록시).', read: '맛집을 꺼내서', body: [], deeper: ['ManyToOne', 'proxy'], sql: true },
  getWriter: { label: 'getWriter()', short: '리뷰 작성자(Member). @ManyToOne 기본 EAGER.', read: '작성자를 꺼내서', body: ['defect-lab에서 fetch join 후에도 SQL이 2번인 이유: 작성자가 EAGER라서 따로 한 번 더.'], deeper: ['ManyToOne', 'EAGER'], sql: true },

  // ── SQL ────────────────────────────────────────────────
  select: { label: 'SELECT', short: '테이블에서 데이터를 읽는다.', read: '읽는다', body: ['`select 컬럼 from 테이블 where 조건`'], deeper: ['where', 'join'] },
  where: { label: 'WHERE', short: '조건에 맞는 행만.', read: '조건:', body: [], deeper: ['select'] },
  join: { label: 'JOIN', short: '두 테이블을 외래키로 이어 붙여 한 번에 읽는다.', body: ['left join = 오른쪽에 짝이 없어도 왼쪽 행은 남긴다 (리뷰 0개인 맛집도 목록에 나옴).'], deeper: ['fetchJoin', 'owner'] },
  groupBy: { label: 'GROUP BY / COUNT', short: '같은 값끼리 묶어서 개수를 센다.', body: ['`count(r) … group by s` = 맛집별 리뷰 수. 사건 1의 DTO 쿼리.'], deeper: ['DTO'] },
  update: { label: 'UPDATE', short: '행의 값을 바꾼다.', read: '바꾼다', body: [], deeper: ['conditionalUpdate'] },

  // ── 셸 / 환경 ───────────────────────────────────────────
  executionPolicy: {
    label: 'Set-ExecutionPolicy',
    short: 'PowerShell이 스크립트(.ps1) 실행을 허용할지 정하는 규칙을 바꾼다.',
    body: ['`-Scope CurrentUser RemoteSigned` = 나에게만, 내 컴퓨터에서 만든 스크립트는 허용 + 인터넷에서 받은 것은 서명 필요. 개발자 권장 설정.'],
    deeper: ['scopeFlag', 'remoteSigned'],
  },
  scopeFlag: { label: '-Scope CurrentUser', short: '이 설정을 "현재 사용자(나)"에게만 적용. 관리자 권한 불필요.', body: ['생략하면 컴퓨터 전체(LocalMachine)에 적용하려고 해서 관리자 권한이 필요합니다.'], deeper: ['executionPolicy'] },
  remoteSigned: { label: 'RemoteSigned', short: '내 컴퓨터 스크립트는 OK, 인터넷에서 받은 스크립트는 서명이 있어야 실행.', body: ['Restricted(전부 막음)보다 편하고, Unrestricted/Bypass(전부 허용)보다 안전합니다.'], deeper: ['executionPolicy'] },
  gradlew: { label: 'gradlew', short: '프로젝트에 들어 있는 Gradle 실행기. 빌드·테스트·실행.', body: ['Windows PowerShell에서는 `.\\gradlew.bat test`. 앞의 `.\\` = 지금 폴더.'], deeper: [] },
  git: { label: 'git', short: '코드 변경 기록(버전 관리) 도구.', body: ['pull = 받아오기, add = 담기, commit = 기록, push = 올리기.'], deeper: [] },
  npm: { label: 'npm', short: 'Node.js 프로그램을 설치·실행하는 도구. npm start = package.json의 start 실행.', body: [], deeper: ['executionPolicy'] },
};

// Words that point to an entry under another name.
const ALIASES = {
  '.': 'dot', ';': 'semicolon', '(': 'parens', ')': 'parens', '{': 'braces', '}': 'braces', '<': 'generic', '>': 'generic',
  '=': 'assign', '->': 'arrow', '::': 'methodref', '==': 'equals',
  ArrayList: 'List', Set: 'collection', Map: 'collection', long: 'int', Long: 'int', Integer: 'int', private: 'public', protected: 'public',
  '@Entity': 'Entity', '@ManyToOne': 'ManyToOne', '@OneToMany': 'OneToMany', '@OneToOne': 'ManyToOne', '@Transactional': 'Transactional',
  '@Query': 'Query', '@Modifying': 'Modifying', '@Param': 'Param', '@Service': 'Service', '@Repository': 'Repository',
  '@Controller': 'Controller', '@RestController': 'Controller', '@GetMapping': 'Controller', '@PostMapping': 'Controller',
  '@RequiredArgsConstructor': 'DI', '@Autowired': 'DI', '@Getter': 'getter', '@Setter': 'setter', '@EntityGraph': 'fetchJoin',
  '@Id': 'Entity', '@Column': 'field', '@JoinColumn': 'owner', '@Table': 'unique',
  LAZY: 'LAZY', EAGER: 'EAGER', FetchType: 'LAZY', fetch: 'fetchJoin', JpaRepository: 'Repository',
  Transactional: 'Transactional', forEach: 'for', while: 'for', else: 'if', isEmpty: 'size', orElse: 'Optional',
  equals: 'equals', class: 'class', interface: 'class', extends: 'class', implements: 'class', boolean: 'type', double: 'int',
  throw: 'exception', try: 'exception', catch: 'exception', RuntimeException: 'exception', IllegalArgumentException: 'exception',
  AccessDeniedException: 'exception', EntityNotFoundException: 'getReferenceById', LazyInitializationException: 'lazyInit',
  collect: 'toList', Collectors: 'toList',
  SELECT: 'select', FROM: 'select', WHERE: 'where', JOIN: 'join', LEFT: 'join', GROUP: 'groupBy', COUNT: 'groupBy', UPDATE: 'update', SET: 'update',
  'Set-ExecutionPolicy': 'executionPolicy', '-Scope': 'scopeFlag', CurrentUser: 'scopeFlag', RemoteSigned: 'remoteSigned',
  Restricted: 'remoteSigned', Unrestricted: 'remoteSigned', Bypass: 'remoteSigned',
  'gradlew.bat': 'gradlew', '.\\gradlew.bat': 'gradlew', './gradlew': 'gradlew',
};

const cap = (s) => s.charAt(0).toLowerCase() + s.slice(1);

// Families of names, tried after exact words. Each returns a generated entry.
const RULES = [
  [/^get([A-Z]\w*)$/, (m) => ({ label: `${m[0]}()`, short: `getter: ${cap(m[1])} 값을 꺼낸다.`, read: `${cap(m[1])}을(를) 꺼내서`, body: [`get + ${m[1]} → ${cap(m[1])} 필드를 돌려주는 메서드입니다. 연관관계 필드라면 LAZY 프록시일 수 있습니다.`], deeper: ['getter', 'LAZY'] })],
  [/^set([A-Z]\w*)$/, (m) => ({ label: `${m[0]}()`, short: `setter: ${cap(m[1])} 값을 바꾼다.`, read: `${cap(m[1])}을(를) 바꾸고`, body: [], deeper: ['setter', 'dirtyChecking'] })],
  [/^(is|has)([A-Z]\w*)$/, (m) => ({ label: `${m[0]}()`, short: `예/아니오 질문: ${cap(m[2])}인가?`, read: `${cap(m[2])}인지 묻고`, body: ['boolean(true/false)을 돌려줍니다.'], deeper: ['if'] })],
  [/^(find|exists|count|delete)\w*By\w+$/, (m) => ({ label: `${m[0]}()`, short: `쿼리 메서드: 이름 규칙으로 SQL 자동 생성 (${m[1]} … By …). 🔶`, read: `DB에서 ${m[1] === 'exists' ? '있는지 확인하고' : m[1] === 'count' ? '개수를 세고' : m[1] === 'delete' ? '지우고' : '찾고'}`, body: [splitQueryMethod(m[0])], deeper: ['queryMethod'], sql: true })],
  [/^[A-Z]\w*Repository$/, (m) => ({ label: m[0], short: `${m[0].replace('Repository', '')} 테이블 담당 Repository (DB 창고 담당).`, read: '', body: [], deeper: ['Repository'] })],
  [/^[a-z]\w*Repository$/, (m) => ({ label: m[0], short: `Repository 변수: Spring이 넣어 준 ${m[0].replace('Repository', '')} 창고 담당.`, read: `${m[0].replace('Repository', '')} 저장소에서`, body: [], deeper: ['Repository', 'DI'] })],
  [/^[A-Z]\w*(Dto|DTO|Response|Request)$/, (m) => ({ label: m[0], short: '값을 나르는 상자(DTO). 엔티티가 아님.', read: '', body: [], deeper: ['DTO'] })],
  [/^[A-Z]\w*Service$/, (m) => ({ label: m[0], short: '업무 규칙 담당 Service 클래스.', read: '', body: [], deeper: ['Service'] })],
  [/^[a-z]\w*Service$/, (m) => ({ label: m[0], short: 'Service 변수: Spring이 넣어 준 업무 담당.', read: '', body: [], deeper: ['Service', 'DI'] })],
  [/^[A-Z]\w*Controller$/, (m) => ({ label: m[0], short: '요청을 받는 Controller 클래스.', read: '', body: [], deeper: ['Controller'] })],
  [/^@\w+$/, (m) => ({ label: m[0], short: '어노테이션: 클래스/메서드/필드에 붙이는 "표시". Spring·JPA가 보고 동작을 바꾼다.', read: '', body: ['@ 로 시작하는 표시는 그 아래 코드에 추가 규칙을 붙입니다. 사전에 없는 것은 IntelliJ에서 Ctrl + 클릭으로 설명을 보세요.'], deeper: ['class'] })],
  [/^[A-Z][A-Za-z0-9]*$/, (m) => ({ label: m[0], short: `클래스(타입) 이름: ${m[0]} 객체의 설계도.`, read: '', body: ['대문자로 시작하면 보통 클래스입니다. 프로젝트 안의 클래스라면 IntelliJ에서 Ctrl + 클릭으로 열어 보세요.'], deeper: ['class', 'type'] })],
];

function splitQueryMethod(name) {
  const [, verb, rest] = /^(find|exists|count|delete)\w*?By(\w+)$/.exec(name) ?? [];
  if (!rest) return '';
  const cond = rest
    .replace(/OrderBy(\w+?)(Desc|Asc)?$/, (_, f, d) => ` order by ${snake(f)}${d ? ` ${d.toLowerCase()}` : ''}`)
    .split(/(And|Or)(?=[A-Z])/)
    .map((p) => (p === 'And' ? ' and ' : p === 'Or' ? ' or ' : p.startsWith(' order') ? p : `${snake(p)} = ?`))
    .join('');
  return `이 이름이 만드는 SQL: ${verb === 'exists' ? 'select 1' : verb === 'count' ? 'select count(*)' : verb === 'delete' ? 'delete' : 'select …'} … where ${cond}`;
}
const snake = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();

// Look up a token in context. `next` / `prev` are the neighbouring significant tokens.
export function lookup(token, { prev = '', next = '' } = {}) {
  if (Object.hasOwn(TERMS, token)) return { id: token, ...TERMS[token] };
  const alias = ALIASES[token];
  if (alias) return { id: alias, ...TERMS[alias] };
  for (const [pattern, make] of RULES) {
    const m = pattern.exec(token);
    if (m) return { id: `gen:${token}`, generated: true, ...make(m) };
  }
  if (/^[a-z_$][\w$]*$/.test(token)) {
    if (next === '(') return { id: `gen:${token}`, generated: true, label: `${token}()`, short: `메서드 호출: ${token} 기능을 실행한다.`, read: `${token} 하고`, body: ['사전에 없는 메서드입니다. IntelliJ에서 Ctrl + 클릭으로 어디에 정의되어 있는지 보세요.'], deeper: ['method', 'parens'] };
    if (prev === '.') return { id: `gen:${token}`, generated: true, label: token, short: `필드: 앞 객체가 가진 ${token} 값.`, read: token, body: [], deeper: ['field', 'dot'] };
    return { id: `gen:${token}`, generated: true, label: token, short: `변수: ${token} 이라는 이름표가 붙은 값(객체).`, read: token, body: ['소문자로 시작하는 이름은 보통 변수입니다. 어디서 처음 만들어졌는지(= 오른쪽에 무엇을 넣었는지) 위로 올라가 찾아보세요.'], deeper: ['variable', 'object'] };
  }
  return null;
}

// Words inside SQL / JPQL strings, case-insensitive.
const SQL_WORDS = { select: 'select', from: 'select', where: 'where', join: 'join', left: 'join', inner: 'join', on: 'join', fetch: 'fetchJoin', group: 'groupBy', by: 'groupBy', count: 'groupBy', update: 'update', set: 'update', new: 'DTO', and: 'where', or: 'where' };

export function lookupSql(word) {
  const id = SQL_WORDS[word.toLowerCase()];
  return id ? { id, ...TERMS[id] } : null;
}

export function term(id) {
  if (id.startsWith('gen:')) return lookup(id.slice(4));
  return Object.hasOwn(TERMS, id) ? { id, ...TERMS[id] } : null;
}

export const GLOSSARY_GROUPS = [
  ['기호 읽는 법', ['dot', 'chaining', 'parens', 'semicolon', 'braces', 'generic', 'assign', 'arrow', 'methodref']],
  ['자바 기본', ['object', 'class', 'variable', 'type', 'field', 'method', 'argument', 'return', 'getter', 'setter', 'new', 'for', 'if', 'Optional', 'exception']],
  ['컬렉션', ['List', 'collection', 'size', 'add', 'stream', 'map', 'filter']],
  ['Spring', ['layers', 'Controller', 'Service', 'Repository', 'DI', 'Transactional']],
  ['JPA 시험', ['Entity', 'ManyToOne', 'OneToMany', 'owner', 'mappedBy', 'LAZY', 'EAGER', 'proxy', 'nPlusOne', 'fetchJoin', 'DTO', 'lazyInit', 'persistenceContext', 'dirtyChecking', 'JPQL', 'queryMethod', 'Query', 'Modifying', 'conditionalUpdate', 'unique']],
  ['SQL', ['select', 'where', 'join', 'groupBy', 'update']],
  ['PowerShell · 도구', ['executionPolicy', 'scopeFlag', 'remoteSigned', 'gradlew', 'npm', 'git']],
];
