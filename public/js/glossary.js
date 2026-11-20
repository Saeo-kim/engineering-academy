// Code Explainer glossary. Every entry explains one piece of code in plain English.
//
//   short   one line shown on hover
//   read    how the token reads inside a sentence ("explain this line")
//   body    the longer explanation shown when clicked (paragraphs)
//   example optional code, itself explorable
//   deeper  ids to click into next ("Go deeper")
//   sql     true when this token can make JPA send SQL (🔶)
//
// Words are matched exactly; RULES below handle families such as getXxx().

export const TERMS = {
  // ── Symbols ─────────────────────────────────────────────
  dot: {
    label: '.  (dot)',
    short: '"of" or "ask to do". Takes out the function or value the left side has.',
    read: 'of',
    body: [
      'A dot means "ask the object on the left to do the thing on the right." `store.getName()` = "store, tell me your name."',
      'When dots chain (method chaining), they run left to right, each step asking the previous result for the next thing. `store.getReviews().size()` = ask store for its review list, then ask that list for its count.',
    ],
    deeper: ['object', 'method', 'chaining'],
  },
  chaining: {
    label: 'method chaining',
    short: 'Dots strung together, like a.b().c(), where each step works on the previous result.',
    body: [
      'How to read it: left to right, "take the result, then do the next thing." Think of each closing bracket as producing one value.',
      '`store.getReviews().size()` has two steps: (1) `store.getReviews()` produces one review list (List); (2) `.size()` on that List produces one number.',
      'If you get stuck, split the chain into one variable per step.',
    ],
    example: 'List<Review> reviews = store.getReviews();\nint count = reviews.size();',
    deeper: ['method', 'return'],
  },
  semicolon: {
    label: ';  (semicolon)',
    short: 'End of a statement, like a full stop in a sentence.',
    read: '(end)',
    body: ['Java ends a statement at a semicolon, not at a line break. Leaving one out causes a "\';\' expected" compile error.'],
    deeper: [],
  },
  parens: {
    label: '( )  (parentheses)',
    short: 'Parentheses after a method name mean "run it now!" Ingredients (arguments) go inside.',
    body: [
      '`size` is the name of the function; `size()` means run that function. Empty parentheses mean it runs with no ingredients.',
      'A value inside the parentheses, like the `1L` in `findById(1L)`, is called an argument. The parentheses after if/for hold the condition.',
    ],
    deeper: ['method', 'argument'],
  },
  braces: {
    label: '{ }  (curly braces)',
    short: 'The start and end of a block of code: the body of a class, method, if, or for.',
    body: ['Everything between an opening `{` and a closing `}` is one unit. Variables created inside cannot be used outside (scope).'],
    deeper: ['scope'],
  },
  generic: {
    label: '< >  (generics)',
    short: 'Marks what kind of thing a container holds. List<Store> = a list that holds only Store objects.',
    body: [
      '`List<Store>` means "a List that holds only Store objects." Putting anything else in is blocked at compile time.',
      '`Optional<Store>` and `Map<Long, Store>` write the type of the contents after the container type.',
    ],
    deeper: ['List', 'type'],
  },
  assign: {
    label: '=  (assignment)',
    short: 'Puts the value on the right into the variable on the left. Not "equals" as in maths.',
    read: '←',
    body: ['`int count = 3;` puts 3 into a box named count. To compare, use `==` (primitive values) or `.equals()` (objects).'],
    deeper: ['variable', 'equals'],
  },
  arrow: {
    label: '->  (lambda arrow)',
    short: 'A short function with no name. Left = the value received, right = what to do with it.',
    body: ['`s -> s.getName()` means "given s, return s\'s name." Often used with streams, forEach, and sort orders.'],
    deeper: ['stream'],
  },
  methodref: {
    label: '::  (method reference)',
    short: 'Shorthand for a lambda. Store::getName = s -> s.getName()',
    body: ['`map(Store::getName)` is the same as `map(s -> s.getName())`.'],
    deeper: ['arrow'],
  },

  // ── Java basics ─────────────────────────────────────────
  object: {
    label: 'object',
    short: 'One "thing" that has both data (fields) and abilities (methods). A real instance made from a class.',
    body: [
      'If a class is a cookie cutter, an object is one cookie. `Store` is the cutter; the thing held by the `store` variable is one restaurant (an object).',
      'You ask an object to do something with a dot (.).',
    ],
    deeper: ['class', 'variable', 'method'],
  },
  class: {
    label: 'class',
    short: 'The blueprint for creating objects. Names start with a capital letter (Store, Review).',
    read: '',
    body: [
      'A blueprint listing the fields (values it holds) and methods (what it can do).',
      'Java convention: class names start with a capital letter (Store); variables and methods start with a lowercase letter (store, getName).',
    ],
    deeper: ['object', 'field', 'Entity'],
  },
  variable: {
    label: 'variable',
    short: 'A labelled box holding a value. Starts with a lowercase letter.',
    body: [
      'In `Store store = ...`, the first `Store` is the type of box, and the second `store` is the name of the box (the variable).',
      'An object variable holds not the object itself but "where the object is" (a reference). So two variables can point to the same object.',
    ],
    deeper: ['type', 'object'],
  },
  type: {
    label: 'type',
    short: 'The kind of a value: int (whole number), String (text), Store (restaurant object), List<Review> (list of reviews)…',
    body: ['Java requires every variable to have a type. If the types do not match, the compiler reports an error before the program runs.'],
    deeper: ['int', 'String', 'generic'],
  },
  field: {
    label: 'field',
    short: 'A value an object holds, such as name, area, or reviews on a Store.',
    body: ['An entity\'s fields usually map one-to-one to columns in a database table. But an `@OneToMany` field (reviews) is not a column; it points to another table.'],
    deeper: ['Entity', 'getter'],
  },
  method: {
    label: 'method',
    short: 'Something an object can do. Run it by adding ( ) after the name.',
    body: [
      'A method takes ingredients (arguments), does work, and can give back a result (return value).',
      'Guess what it does from its name: get = fetch, set = change, find = look up, save = store, is/has = a yes/no question.',
    ],
    deeper: ['parens', 'return', 'getter'],
  },
  argument: {
    label: 'argument',
    short: 'An ingredient passed to a method. The 1L in findById(1L).',
    body: ['On the declaration side these are called parameters; the actual values passed in at the call site are called arguments.'],
    deeper: ['method'],
  },
  return: {
    label: 'return',
    short: 'The method finishes its work and gives back a result.',
    read: 'gives back',
    body: ['When `return count;` runs, the method ends immediately and hands count back to the caller. A return type of void means nothing is handed back.'],
    deeper: ['method', 'void'],
  },
  void: { label: 'void', short: 'No value is returned.', body: ['The return type of a method that does work but gives back nothing.'], deeper: ['return'] },
  scope: { label: 'scope', short: 'The range where a variable can be used: inside the { } where it is declared.', body: ['A variable created inside a for loop cannot be used after the loop ends.'], deeper: ['braces'] },
  getter: {
    label: 'getter (getXxx)',
    short: 'get + field name = a method that returns that field\'s value.',
    body: [
      '`getName()` returns the name field. Adding Lombok\'s `@Getter` generates it automatically.',
      'Watch out in JPA entities: getters for relationship fields (`getReviews()`, `getStore()`) return a proxy when LAZY, and using it can trigger SQL.',
    ],
    deeper: ['field', 'LAZY', 'proxy'],
  },
  setter: {
    label: 'setter (setXxx)',
    short: 'set + field name = a method that changes that field\'s value.',
    body: ['In JPA, just changing a value through a setter sends an UPDATE when the transaction ends (dirty checking). In practice, people prefer meaningful methods such as `changeName()` over bare setters.'],
    deeper: ['dirtyChecking'],
  },
  equals: { label: 'equals / ==', short: 'Use equals to check whether two objects have the same content; use == to compare primitive values.', body: ['Comparing strings with `==` can return false even when the text is the same. Compare strings with `a.equals(b)`.'], deeper: ['String'] },
  new: { label: 'new', short: 'Creates a new object from a blueprint (class).', read: 'create a new', body: ['`new Store()` creates one new Store object in memory. In JPQL, `select new Dto(...)` builds a DTO object directly from the query result.'], deeper: ['object', 'DTO'] },
  this: { label: 'this', short: '"Myself" (this object).', body: ['`this.name = name;` puts the received value name into my field name. Used to tell apart names that are the same.'], deeper: ['field'] },
  for: {
    label: 'for loop',
    short: 'Repeats the { } body once for each item in a list.',
    read: 'for each',
    body: [
      '`for (Store store : stores)` takes items from the stores list one at a time, calling each one store, and repeats.',
      'JPA warning: fetching related data inside a loop sends one SQL per iteration = N+1. Pattern 1 of the defect catalogue: "lookup inside a loop."',
    ],
    deeper: ['nPlusOne'],
  },
  if: { label: 'if', short: 'Runs only when the condition is true.', read: 'if', body: ['Watch out for defect pattern 2, "read → check in Java → save": when several requests arrive at once, the value can change between the check and the save.'], deeper: ['conditionalUpdate'] },
  int: { label: 'int / long', short: 'Whole numbers. long holds larger numbers (often used for ids). The L in 1L means long.', body: ['`(long) x` converts x to a long (type casting).'], deeper: ['type'] },
  String: { label: 'String', short: 'The text (string) type.', body: ['A value in double quotes, such as "Busan". Compare strings with equals.'], deeper: ['equals'] },
  public: { label: 'public / private', short: 'Access level. public = visible everywhere; private = only inside this class.', body: ['Entity fields are usually private, read through getters (encapsulation).'], deeper: ['field'] },
  static: { label: 'static', short: 'Belongs to the class itself, not to an object: there is only one.', body: ['`Math.max()` is used directly through the class name, without creating an object.'], deeper: ['class'] },
  final: { label: 'final', short: 'A value that cannot be changed after it is set.', body: ['In Spring, `private final StoreRepository storeRepository;` plus constructor injection is the standard pattern.'], deeper: ['DI'] },
  null: { label: 'null', short: '"Points to nothing." Using a dot on null throws a NullPointerException.', body: ['A findById result may be missing, so it is wrapped in an Optional.'], deeper: ['Optional'] },
  exception: { label: 'exception', short: 'A problem that happens while running. Thrown with throw and caught with try-catch.', body: ['A conditional UPDATE that changes 0 rows throws an exception to report failure; that is the correct shape for the answers to cases 3 and 5.'], deeper: ['conditionalUpdate'] },

  // ── Collections ─────────────────────────────────────────
  List: {
    label: 'List',
    short: 'An ordered list. The same value can appear more than once.',
    body: ['`List<Store>` is a list of restaurants. Common methods: `size()` count, `get(0)` first item, `add(x)` append, `isEmpty()` check whether it is empty.'],
    deeper: ['generic', 'size', 'collection'],
  },
  collection: {
    label: 'collection',
    short: 'The general name for containers that hold many values (List, Set, Map).',
    body: ['In JPA, an `@OneToMany` field is a collection. It is LAZY, so it starts as an empty proxy collection, and SQL runs the first time it is opened.'],
    deeper: ['List', 'LAZY'],
  },
  size: {
    label: 'size()',
    short: 'Counts the items in a list.',
    read: 'count',
    body: [
      '`list.size()` returns one int.',
      'JPA trap: calling `.size()` on a LAZY collection (`store.getReviews()`) loads all the reviews from the database just to count them → 🔶 one SQL. Inside a loop, that is one SQL per iteration.',
    ],
    example: '(long) store.getReviews().size()   // 🔶 one SQL per restaurant',
    deeper: ['LAZY', 'nPlusOne'],
    sql: true,
  },
  add: { label: 'add()', short: 'Adds one item to a list.', read: 'add', body: ['JPA warning: adding only to the mappedBy side (the mirror) does not change the foreign key in the database.'], deeper: ['mappedBy'] },
  get: { label: 'get()', short: 'Gets the nth item from a list, or the value out of an Optional.', read: 'get', body: ['`list.get(0)` is the first item. `optional.get()` throws an exception if there is no value; prefer orElseThrow.'], deeper: ['Optional'] },
  stream: { label: 'stream()', short: 'Puts a list on a conveyor belt to filter, transform (map), and collect the items.', read: 'one at a time', body: ['A different shape of a for loop. So fetching related data inside a stream still causes N+1.'], deeper: ['arrow', 'nPlusOne'] },
  map: { label: 'map()', short: 'Turns each item in a stream into a different value.', read: 'transform', body: ['`stores.stream().map(Store::getName)` turns the restaurants into their names.'], deeper: ['stream'] },
  filter: { label: 'filter()', short: 'Keeps only the stream items that match a condition.', read: 'select', body: [], deeper: ['stream'] },
  toList: { label: 'toList() / collect()', short: 'Gathers a stream result back into a List.', read: 'gather into a list', body: [], deeper: ['stream', 'List'] },
  Optional: {
    label: 'Optional',
    short: 'A box that may or may not hold a value. The return type of findById.',
    body: ['`findById(id).orElseThrow()` gets the value if present, and throws if not. Avoid `.get()`, which blows up when there is no value.'],
    deeper: ['null', 'findById'],
  },
  orElseThrow: { label: 'orElseThrow()', short: 'If the Optional has no value, throws an exception; otherwise gives back the value.', read: 'get (throws if missing)', body: [], deeper: ['Optional', 'exception'] },

  // ── Spring ──────────────────────────────────────────────
  Repository: {
    label: 'Repository',
    short: 'Talks to the database. Writes SQL for you from method names alone.',
    body: [
      'Just extending `JpaRepository<Store, Long>` on `StoreRepository` gives you findAll, findById, save, and delete.',
      'Request flow: Controller (takes the order) → Service (cooks) → Repository (warehouse keeper) → database.',
    ],
    deeper: ['findAll', 'queryMethod', 'layers'],
  },
  Service: { label: 'Service', short: 'The layer that handles real business rules. @Transactional usually goes here.', body: ['Groups checks (permissions, balances), calculations, and calls to several Repositories.'], deeper: ['layers', 'Transactional'] },
  Controller: { label: 'Controller', short: 'The layer that receives a request (URL), passes it to a Service, and returns a page or JSON.', body: ['Links a URL and a method, for example `@GetMapping("/stores")`.'], deeper: ['layers'] },
  layers: {
    label: 'one request\'s path',
    short: 'Browser → Controller → Service → Repository → database, and back again.',
    body: [
      'Restaurant analogy: Controller = front-of-house (takes orders), Service = head chef (cooking rules), Repository = warehouse keeper, database = the warehouse.',
      'In the defect investigation, follow this order one line at a time.',
    ],
    example: '@GetMapping("/stores")\npublic String list(Model model) {\n    model.addAttribute("stores", storeService.findStoreList());\n    return "stores/list";\n}',
    deeper: ['Controller', 'Service', 'Repository'],
  },
  DI: { label: 'dependency injection (DI)', short: 'Spring provides the objects you need automatically.', body: ['Receiving `private final StoreRepository storeRepository;` through the constructor means Spring passes in the Repository it has already created. You do not call new yourself.'], deeper: ['final'] },
  Transactional: {
    label: '@Transactional',
    short: 'Groups the database work inside it into one unit: all succeed, or all are undone (rollback).',
    body: [
      'While a transaction is open, the persistence context stays alive, so LAZY loading and dirty checking work.',
      'Caution: @Transactional alone does not solve concurrency problems. It does not stop two requests from reading the same old value at the same time.',
      '`readOnly = true` marks a read-only transaction (no dirty checking).',
    ],
    deeper: ['persistenceContext', 'conditionalUpdate'],
  },

  // ── JPA ─────────────────────────────────────────────────
  Entity: {
    label: '@Entity',
    short: 'A Java class that matches one row of a database table.',
    body: ['`@Entity class Store` ↔ the store table. Fields ↔ columns. JPA (Hibernate) reads this mapping and writes the SQL for you.'],
    deeper: ['field', 'ManyToOne', 'OneToMany'],
  },
  ManyToOne: {
    label: '@ManyToOne',
    short: '"Many belong to one." N reviews → 1 restaurant. The side that holds the foreign key (the owner). Defaults to EAGER.',
    body: [
      'Placed on `Review.store`. The store_id column in the review table is this field.',
      'The default is EAGER, so reading several reviews with JPQL also loads each restaurant separately (measurement 52). In practice, change it to `fetch = FetchType.LAZY`.',
    ],
    deeper: ['owner', 'EAGER', 'LAZY'],
    sql: true,
  },
  OneToMany: {
    label: '@OneToMany',
    short: '"One has many." 1 restaurant → N reviews. Usually mappedBy (the mirror). Defaults to LAZY.',
    body: ['Placed on `Store.reviews`. This field is not a table column; it is a mirror that looks back at the review table. SQL runs the first time it is opened.'],
    deeper: ['mappedBy', 'LAZY', 'nPlusOne'],
  },
  mappedBy: {
    label: 'mappedBy',
    short: '"I am the mirror, not the owner (read-only)." The value is the name of the field on the other side.',
    body: ['`@OneToMany(mappedBy = "store")` means the store field on Review is the owner. Adding only to the mirror does not change the database (measured: store_id stays null).'],
    deeper: ['owner'],
  },
  owner: {
    label: 'owner of the relationship',
    short: 'The side that can actually change the foreign key value = the table that has the foreign key column (Review.store).',
    body: ['The foreign key always lives on the N (many) side → review.store_id. So the owner is Review.store.'],
    deeper: ['mappedBy', 'ManyToOne'],
  },
  LAZY: {
    label: 'LAZY (lazy loading)',
    short: 'Fetches related data at the moment it is used. Until then, a proxy (placeholder).',
    read: '',
    body: [
      'Restaurant analogy: ask for the review list and you get an order slip with only a number (a proxy). The database is visited the moment you open it.',
      'Myth: "switching to LAZY removes N+1." No. Opening each one inside a loop still sends N queries (measurement 11).',
      'Opening it after the transaction has ended throws LazyInitializationException.',
    ],
    deeper: ['proxy', 'nPlusOne', 'lazyInit'],
  },
  EAGER: {
    label: 'EAGER (eager loading)',
    short: 'When the entity is fetched, related data is fetched right away too.',
    body: ['Myth: "EAGER reads everything in one go." No. Reading with findAll (JPQL) takes one query for the list, plus separate queries for each related item (measurement 52). It is hard to predict, so in practice people use LAZY + fetch join.'],
    deeper: ['LAZY', 'fetchJoin'],
  },
  proxy: {
    label: 'proxy',
    short: 'A placeholder standing in for the real object. It knows only the id (number); it goes to the database only when another value is needed.',
    body: ['Right after `getReferenceById(1L)`: 0 SQL; `getId()`: 0 SQL (the number is already known); `getName()`: 1 SQL (the real value is needed).'],
    deeper: ['LAZY', 'lazyInit'],
  },
  lazyInit: {
    label: 'LazyInitializationException',
    short: 'The error thrown when a proxy is opened after its transaction (session) has ended.',
    body: ['Not because the database is slow. Fix: inside the Service (within @Transactional), read the values you need into a DTO and pass that on, or use a fetch join.'],
    deeper: ['Transactional', 'DTO'],
  },
  nPlusOne: {
    label: 'N+1 problem',
    short: 'One query for the list + one per row = 1 + N queries. 50 restaurants → 51 queries.',
    body: [
      'The list is fetched once (1), then every time a loop reads related data for an item (N), another SQL runs.',
      'Four fixes: fetch join (2) · @EntityGraph · batch size (6) · direct DTO query (1; the answer to case 1).',
    ],
    example: 'List<Store> stores = storeRepository.findAll();   // 1 query\nfor (Store store : stores) {\n    store.getReviews().size();                       // N queries\n}',
    deeper: ['LAZY', 'fetchJoin', 'DTO'],
  },
  fetchJoin: {
    label: 'fetch join',
    short: 'Fetches related data in the same JOIN as the first query.',
    body: ['`select s from Store s left join fetch s.reviews` → restaurants and reviews in one SQL. Caution: a collection fetch join is hard to combine with paging.'],
    deeper: ['nPlusOne', 'JPQL'],
  },
  DTO: {
    label: 'DTO',
    short: 'A box that carries only the values a screen or response needs. Not an entity.',
    body: ['Querying straight into a DTO, as in `select new StoreListDto(s.id, s.name, count(r)) ... group by s`, is one SQL. Because it is not an entity, it cannot be changed through dirty checking.'],
    deeper: ['nPlusOne', 'new'],
  },
  persistenceContext: {
    label: 'persistence context',
    short: 'The entity store JPA keeps during a transaction. Acts as a first-level cache plus dirty checking.',
    body: ['A second lookup of the same id comes from the store (0 SQL). When an entity is first loaded, a snapshot is taken and compared at commit.'],
    deeper: ['dirtyChecking', 'Transactional'],
  },
  dirtyChecking: {
    label: 'dirty checking',
    short: 'Even without calling save, changing a loaded entity\'s value sends an UPDATE automatically at commit.',
    body: ['findById + changing a value = 2 SQL (select + update). A bulk UPDATE skips the store, so old values remain → clearAutomatically.'],
    deeper: ['persistenceContext'],
  },
  conditionalUpdate: {
    label: 'conditional UPDATE',
    short: 'The database does the check and the change in one statement: update … set point = point - 100 where id = ? and point >= 100',
    body: [
      'The fix for defect pattern 2 (read → check in Java → save). Checking with if in Java lets two requests that arrive together both see the same value and both pass.',
      'A single UPDATE statement checks and changes inside a row lock, so it is safe. If the number of rows returned is 0, it failed → throw an exception.',
    ],
    example: '@Modifying\n@Query("update Coupon c set c.used = true where c.id = :id and c.used = false")\nint use(@Param("id") Long id);',
    deeper: ['Modifying', 'exception'],
  },
  JPQL: { label: 'JPQL', short: 'SQL written with entity and field names. "from Store s" uses the class name, not the table name.', body: ['Written inside @Query. Hibernate turns it into the actual SQL.'], deeper: ['Query'] },
  Query: { label: '@Query', short: 'Write JPQL directly on a Repository method.', body: ['Used for queries that are hard to express through method names: join fetch, aggregates, DTOs.'], deeper: ['JPQL', 'Modifying', 'Param'] },
  Modifying: { label: '@Modifying', short: 'Required on update/delete JPQL. The return value = number of rows changed.', body: ['With `clearAutomatically = true`, the persistence context is emptied after running, which prevents stale-value problems.'], deeper: ['conditionalUpdate', 'dirtyChecking'] },
  Param: { label: '@Param', short: 'Pairs the :id in JPQL with a method argument by name.', body: ['`where s.id = :id` ↔ `@Param("id") Long id`'], deeper: ['Query'] },
  queryMethod: {
    label: 'query method (name → SQL)',
    short: 'find/exists/count/delete + By + field + And/Or/OrderBy: the rules generate the SQL automatically.',
    body: ['`existsByMemberIdAndStoreId(m, s)` → `where member_id = ? and store_id = ?`', 'Defect pattern 3, "check, then save": if a save follows an existsBy… line, simultaneous requests can insert duplicates → use a UNIQUE constraint.'],
    deeper: ['Repository', 'unique'],
    sql: true,
  },
  unique: { label: 'UNIQUE constraint', short: 'A database rule that only one row may exist for a given combination.', body: ['`@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"member_id", "store_id"}))` is the answer to cases 2 and 7.'], deeper: ['queryMethod'] },
  findAll: {
    label: 'findAll()',
    short: 'Fetches every row in the table. 🔶 1 SQL (select … from store).',
    read: 'fetch all',
    body: ['This is the "1" in N+1. If the relationship is EAGER, more SQL can follow.'],
    deeper: ['nPlusOne', 'EAGER'],
    sql: true,
  },
  findById: { label: 'findById()', short: 'Finds one row by id. The result is an Optional. 🔶 1 SQL (0 if it is already in the first-level cache).', read: 'find by id', body: [], deeper: ['Optional', 'persistenceContext'], sql: true },
  findAllById: { label: 'findAllById()', short: 'Looks up several ids at once (where id in (…)). Ids that do not exist are left out of the result.', read: 'find several ids at once', body: ['The answer to case 8: check the list of numbers from AI against the database and keep only the ones that really exist.'], deeper: ['nPlusOne'], sql: true },
  getReferenceById: { label: 'getReferenceById()', short: 'Gets only a proxy (placeholder), with no SQL. SQL runs when a value is read.', read: 'get a placeholder', body: ['Even for a missing id, no error occurs at this moment; the error comes later, when a value is read: EntityNotFoundException (the 500 error in case 8).'], deeper: ['proxy'] },
  save: { label: 'save()', short: 'A new entity is INSERTed; an existing one is merged.', read: 'store', body: ['An entity already in the persistence context is updated by dirty checking, even without calling save.'], deeper: ['dirtyChecking'], sql: true },

  // ── Defect lab only: getters ────────────────────────────
  getReviews: {
    label: 'getReviews()',
    short: 'Fetches this restaurant\'s review list. @OneToMany LAZY → an empty proxy collection until opened.',
    read: 'fetch the review list and',
    body: [
      'This is the getter for the `Store.reviews` field. The field is `@OneToMany(mappedBy = "store")` and LAZY by default.',
      'Calling getReviews() alone sends no SQL yet. The moment you look inside, as with `.size()`, 🔶 `select … from review where store_id = ?` runs.',
    ],
    deeper: ['getter', 'OneToMany', 'LAZY', 'size'],
    sql: true,
  },
  getStore: { label: 'getStore()', short: 'The restaurant this review or favourite belongs to. @ManyToOne → EAGER by default (a proxy if you changed it to LAZY).', read: 'fetch the restaurant and', body: [], deeper: ['ManyToOne', 'proxy'], sql: true },
  getWriter: { label: 'getWriter()', short: 'The review author (Member). @ManyToOne defaults to EAGER.', read: 'fetch the author and', body: ['Why the defect lab still runs two SQL statements after a fetch join: the author is EAGER, so it is loaded separately, one more time.'], deeper: ['ManyToOne', 'EAGER'], sql: true },

  // ── SQL ─────────────────────────────────────────────────
  select: { label: 'SELECT', short: 'Reads data from a table.', read: 'read', body: ['`select columns from table where condition`'], deeper: ['where', 'join'] },
  where: { label: 'WHERE', short: 'Only the rows that match the condition.', read: 'condition:', body: [], deeper: ['select'] },
  join: { label: 'JOIN', short: 'Joins two tables on a foreign key and reads them together in one go.', body: ['left join = keep the left-hand rows even when there is no match on the right (a restaurant with 0 reviews still appears in the list).'], deeper: ['fetchJoin', 'owner'] },
  groupBy: { label: 'GROUP BY / COUNT', short: 'Groups equal values together and counts them.', body: ['`count(r) … group by s` = number of reviews per restaurant. The DTO query in case 1.'], deeper: ['DTO'] },
  update: { label: 'UPDATE', short: 'Changes values in a row.', read: 'change', body: [], deeper: ['conditionalUpdate'] },

  // ── Shell and environment ───────────────────────────────
  executionPolicy: {
    label: 'Set-ExecutionPolicy',
    short: 'Changes the rule that decides whether PowerShell may run scripts (.ps1).',
    body: ['`-Scope CurrentUser RemoteSigned` = scripts you create on this computer are allowed for you only, while scripts downloaded from the internet must be signed. A recommended developer setting.'],
    deeper: ['scopeFlag', 'remoteSigned'],
  },
  scopeFlag: { label: '-Scope CurrentUser', short: 'Applies this setting only to the "current user" (you). No administrator rights needed.', body: ['Without it, PowerShell applies the change to the whole computer (LocalMachine), which needs administrator rights.'], deeper: ['executionPolicy'] },
  remoteSigned: { label: 'RemoteSigned', short: 'Scripts on your computer run; scripts downloaded from the internet must have a signature to run.', body: ['More practical than Restricted (blocks everything), and safer than Unrestricted/Bypass (allows everything).'], deeper: ['executionPolicy'] },
  gradlew: { label: 'gradlew', short: 'The Gradle runner included in the project. Builds, tests, and runs.', body: ['In Windows PowerShell, `.\\gradlew.bat test`. The leading `.\\` means "this folder."'], deeper: [] },
  git: { label: 'git', short: 'A tool that records code changes (version control).', body: ['pull = fetch changes, add = stage, commit = record, push = upload.'], deeper: [] },
  npm: { label: 'npm', short: 'A tool that installs and runs Node.js programs. npm start = runs the start script in package.json.', body: [], deeper: ['executionPolicy'] },
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
  [/^get([A-Z]\w*)$/, (m) => ({ label: `${m[0]}()`, short: `getter: returns the ${cap(m[1])} value.`, read: `fetch the ${cap(m[1])} and`, body: [`get + ${m[1]} → a method that returns the ${cap(m[1])} field. For a relationship field it may be a LAZY proxy.`], deeper: ['getter', 'LAZY'] })],
  [/^set([A-Z]\w*)$/, (m) => ({ label: `${m[0]}()`, short: `setter: changes the ${cap(m[1])} value.`, read: `change the ${cap(m[1])} and`, body: [], deeper: ['setter', 'dirtyChecking'] })],
  [/^(is|has)([A-Z]\w*)$/, (m) => ({ label: `${m[0]}()`, short: `Yes/no question: is it ${cap(m[2])}?`, read: `ask whether it is ${cap(m[2])} and`, body: ['Returns a boolean (true/false).'], deeper: ['if'] })],
  [/^(find|exists|count|delete)\w*By\w+$/, (m) => ({ label: `${m[0]}()`, short: `Query method: SQL generated from the name rules (${m[1]} … By …). 🔶`, read: `${m[1] === 'exists' ? 'check whether it exists and' : m[1] === 'count' ? 'count and' : m[1] === 'delete' ? 'delete and' : 'find and'}`, body: [splitQueryMethod(m[0])], deeper: ['queryMethod'], sql: true })],
  [/^[A-Z]\w*Repository$/, (m) => ({ label: m[0], short: `Repository for the ${m[0].replace('Repository', '')} table (in charge of the database store).`, read: '', body: [], deeper: ['Repository'] })],
  [/^[a-z]\w*Repository$/, (m) => ({ label: m[0], short: `Repository variable: the ${m[0].replace('Repository', '')} store that Spring injected.`, read: `from the ${m[0].replace('Repository', '')} store`, body: [], deeper: ['Repository', 'DI'] })],
  [/^[A-Z]\w*(Dto|DTO|Response|Request)$/, (m) => ({ label: m[0], short: 'A box that carries values (DTO). Not an entity.', read: '', body: [], deeper: ['DTO'] })],
  [/^[A-Z]\w*Service$/, (m) => ({ label: m[0], short: 'Service class that handles business rules.', read: '', body: [], deeper: ['Service'] })],
  [/^[a-z]\w*Service$/, (m) => ({ label: m[0], short: 'Service variable: the business handler that Spring injected.', read: '', body: [], deeper: ['Service', 'DI'] })],
  [/^[A-Z]\w*Controller$/, (m) => ({ label: m[0], short: 'Controller class that receives requests.', read: '', body: [], deeper: ['Controller'] })],
  [/^@\w+$/, (m) => ({ label: m[0], short: 'Annotation: a "label" attached to a class, method, or field. Spring and JPA read it and change behaviour.', read: '', body: ['A tag starting with @ adds extra rules to the code beneath it. For anything not in the glossary, use Ctrl + click in IntelliJ to see its definition.'], deeper: ['class'] })],
  [/^[A-Z][A-Za-z0-9]*$/, (m) => ({ label: m[0], short: `Class (type) name: the blueprint for ${m[0]} objects.`, read: '', body: ['Starts with a capital letter, so it is usually a class. For a class in your project, open it with Ctrl + click in IntelliJ.'], deeper: ['class', 'type'] })],
];

function splitQueryMethod(name) {
  const [, verb, rest] = /^(find|exists|count|delete)\w*?By(\w+)$/.exec(name) ?? [];
  if (!rest) return '';
  const cond = rest
    .replace(/OrderBy(\w+?)(Desc|Asc)?$/, (_, f, d) => ` order by ${snake(f)}${d ? ` ${d.toLowerCase()}` : ''}`)
    .split(/(And|Or)(?=[A-Z])/)
    .map((p) => (p === 'And' ? ' and ' : p === 'Or' ? ' or ' : p.startsWith(' order') ? p : `${snake(p)} = ?`))
    .join('');
  return `SQL this name generates: ${verb === 'exists' ? 'select 1' : verb === 'count' ? 'select count(*)' : verb === 'delete' ? 'delete' : 'select …'} … where ${cond}`;
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
    if (next === '(') return { id: `gen:${token}`, generated: true, label: `${token}()`, short: `Method call: runs the ${token} operation.`, read: `${token}, then`, body: ['This method is not in the glossary. Use Ctrl + click in IntelliJ to see where it is defined.'], deeper: ['method', 'parens'] };
    if (prev === '.') return { id: `gen:${token}`, generated: true, label: token, short: `Field: the ${token} value held by the object before the dot.`, read: token, body: [], deeper: ['field', 'dot'] };
    return { id: `gen:${token}`, generated: true, label: token, short: `Variable: a value (object) labelled ${token}.`, read: token, body: ['Names starting with a lowercase letter are usually variables. Look upward to find where the value was first created (what was put on the right-hand side).'], deeper: ['variable', 'object'] };
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
  ['Reading symbols', ['dot', 'chaining', 'parens', 'semicolon', 'braces', 'generic', 'assign', 'arrow', 'methodref']],
  ['Java basics', ['object', 'class', 'variable', 'type', 'field', 'method', 'argument', 'return', 'getter', 'setter', 'new', 'for', 'if', 'Optional', 'exception']],
  ['Collections', ['List', 'collection', 'size', 'add', 'stream', 'map', 'filter']],
  ['Spring', ['layers', 'Controller', 'Service', 'Repository', 'DI', 'Transactional']],
  ['JPA', ['Entity', 'ManyToOne', 'OneToMany', 'owner', 'mappedBy', 'LAZY', 'EAGER', 'proxy', 'nPlusOne', 'fetchJoin', 'DTO', 'lazyInit', 'persistenceContext', 'dirtyChecking', 'JPQL', 'queryMethod', 'Query', 'Modifying', 'conditionalUpdate', 'unique']],
  ['SQL', ['select', 'where', 'join', 'groupBy', 'update']],
  ['PowerShell and tools', ['executionPolicy', 'scopeFlag', 'remoteSigned', 'gradlew', 'npm', 'git']],
];
