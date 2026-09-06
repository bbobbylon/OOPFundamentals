/* ============================================================================
 * tracks-data.js — the single source of truth for DevHub's track/section/page
 * structure. Extracted from app.html (2026-08-27) so content pages can look up
 * their own track + section (e.g. for the notebook feature) without embedding
 * this whole array a second time. app.html still defines `const TRACKS` from
 * this — nothing about the hub's own rendering changed.
 * ========================================================================== */
window.DEVHUB_TRACKS = [
  {
    id: 'web-fundamentals', icon: '🌐', label: 'Web Fundamentals',
    desc: 'The true zero-starting-point before Angular/React/TypeScript make sense: HTML, CSS, plain JavaScript, the DOM, and how browsers actually render a page',
    sections: [
      { label: 'Foundations', pages: [
        { title: 'HTML Fundamentals — Structure, Forms & Accessibility', file: 'web-html-fundamentals-visualizer.html', level: 'beginner' },
        { title: 'CSS Fundamentals — Box Model, Selectors & Specificity',  file: 'web-css-fundamentals-visualizer.html',  level: 'beginner' },
        { title: 'CSS Layout — Flexbox, Grid & Responsive Design',        file: 'web-css-layout-visualizer.html',        level: 'beginner' },
      ]},
      { label: 'JavaScript in the Browser', pages: [
        { title: 'JavaScript Fundamentals — Variables, Functions & Closures', file: 'web-js-fundamentals-visualizer.html', level: 'beginner' },
        { title: 'The DOM & Events — Selecting, Manipulating & Delegation',   file: 'web-dom-events-visualizer.html',      level: 'beginner' },
        { title: 'Async JavaScript — Promises, async/await & fetch()',       file: 'web-js-async-visualizer.html',        level: 'intermediate' },
      ]},
      { label: 'How Browsers Work', pages: [
        { title: 'How Browsers Work — Parsing, Render Tree, Layout & Paint', file: 'web-browser-rendering-visualizer.html', level: 'intermediate' },
      ]},
    ]
  },
  {
    id: 'java-oop', icon: '☕', label: 'Java — OOP & Language',
    desc: 'Core OOP, design patterns, generics, streams, concurrency, and JVM internals',
    sections: [
      { label: 'OOP Core', pages: [
        { title: 'Encapsulation',            file: 'encapsulation-visualizer.html',              level: 'beginner' },
        { title: 'Inheritance',              file: 'inheritance-visualizer.html',                level: 'beginner' },
        { title: 'Polymorphism',             file: 'polymorphism-visualizer.html',               level: 'beginner' },
        { title: 'Abstraction',              file: 'abstraction-visualizer.html',                level: 'beginner' },
        { title: 'SOLID Principles',         file: 'solid-visualizer.html',                      level: 'intermediate' },
      ]},
      { label: 'Design Patterns', pages: [
        { title: 'Head First: Strategy 🦆',  file: 'head-first-strategy-visualizer.html',        level: 'beginner' },
        { title: 'Head First: Observer 🌦️',  file: 'head-first-observer-visualizer.html',        level: 'beginner' },
        { title: 'Head First: Decorator ☕',  file: 'head-first-decorator-visualizer.html',       level: 'beginner' },
        { title: 'Head First: Factory 🍕',   file: 'head-first-factory-visualizer.html',         level: 'intermediate' },
        { title: 'Head First: Singleton 🍫', file: 'head-first-singleton-visualizer.html',       level: 'intermediate' },
        { title: 'Head First: Command 📺',   file: 'head-first-command-visualizer.html',         level: 'intermediate' },
        { title: 'Head First: Adapter+Facade 🦃', file: 'head-first-adapter-facade-visualizer.html', level: 'intermediate' },
        { title: 'Head First: Template Method ☕', file: 'head-first-template-method-visualizer.html', level: 'intermediate' },
        { title: 'Head First: State 🎰',     file: 'head-first-state-visualizer.html',           level: 'intermediate' },
        { title: 'Head First: Iterator+Composite 🍽️', file: 'head-first-iterator-composite-visualizer.html', level: 'intermediate' },
        { title: 'Head First: Proxy 🪞',    file: 'head-first-proxy-visualizer.html',            level: 'advanced' },
        { title: 'Head First: Compound+MVC 🎛️', file: 'head-first-compound-mvc-visualizer.html', level: 'advanced' },
        { title: 'Design Patterns',          file: 'design-patterns-visualizer.html',            level: 'intermediate' },
        { title: 'Design Patterns II',       file: 'java-design-patterns2-visualizer.html',      level: 'advanced' },
      ]},
      { label: 'Language Basics', pages: [
        { title: 'Variables & Types',        file: 'java-variables-types-visualizer.html',       level: 'beginner' },
        { title: 'Operators',                file: 'java-operators-visualizer.html',             level: 'beginner' },
        { title: 'Control Flow',             file: 'java-control-flow-visualizer.html',          level: 'beginner' },
        { title: 'Strings',                  file: 'java-strings-visualizer.html',               level: 'beginner' },
        { title: 'Exceptions',              file: 'exceptions-visualizer.html',                 level: 'beginner' },
      ]},
      { label: 'Core Library', pages: [
        { title: 'Generics',                file: 'generics-visualizer.html',                   level: 'intermediate' },
        { title: 'Collections',             file: 'collections-visualizer.html',                level: 'intermediate' },
        { title: 'Streams & Lambdas',       file: 'streams-visualizer.html',                   level: 'intermediate' },
        { title: 'Functional Java',         file: 'java-functional-visualizer.html',            level: 'intermediate' },
        { title: 'Optional',                file: 'java-optional-visualizer.html',              level: 'intermediate' },
        { title: 'Date & Time',             file: 'java-datetime-visualizer.html',              level: 'intermediate' },
        { title: 'Concurrency',             file: 'concurrency-visualizer.html',                level: 'advanced' },
        { title: 'Concurrency Advanced',    file: 'java-concurrency-advanced-visualizer.html',  level: 'expert' },
        { title: 'JVM Memory',              file: 'jvm-memory-visualizer.html',                 level: 'advanced' },
      ]},
      { label: 'Java Advanced', pages: [
        { title: 'Enums',                   file: 'java-enums-visualizer.html',                 level: 'intermediate' },
        { title: 'Records & Sealed',        file: 'java-records-sealed-visualizer.html',        level: 'advanced' },
        { title: 'Inner Classes',           file: 'java-inner-classes-visualizer.html',         level: 'intermediate' },
        { title: 'Annotations',             file: 'java-annotations-visualizer.html',           level: 'advanced' },
        { title: 'Reflection',              file: 'java-reflection-visualizer.html',            level: 'advanced' },
        { title: 'Comparable & Comparator', file: 'java-comparable-comparator-visualizer.html', level: 'intermediate' },
        { title: 'Regex',                   file: 'java-regex-visualizer.html',                 level: 'intermediate' },
        { title: 'I/O & NIO',              file: 'java-io-nio-visualizer.html',                level: 'advanced' },
        { title: 'Networking',              file: 'java-networking-visualizer.html',            level: 'advanced' },
        { title: 'Modern Java',             file: 'modern-java-visualizer.html',               level: 'intermediate' },
      ]},
    ]
  },
  {
    id: 'data-structures', icon: '🌲', label: 'Data Structures & Algorithms',
    desc: 'Classic structures, complexity, sorting, searching, and recursion',
    sections: [
      { label: 'Core Structures', pages: [
        { title: 'Linked List',             file: 'linked-list-visualizer.html',                level: 'beginner' },
        { title: 'Stack & Queue',           file: 'stack-queue-visualizer.html',                level: 'beginner' },
        { title: 'Hash Map',                file: 'hashmap-visualizer.html',                    level: 'beginner' },
        { title: 'Binary Search Tree',      file: 'bst-visualizer.html',                        level: 'intermediate' },
        { title: 'Graph',                   file: 'graph-visualizer.html',                      level: 'intermediate' },
      ]},
      { label: 'Advanced Structures', pages: [
        { title: 'Arrays Deep Dive',        file: 'ds-arrays-visualizer.html',                  level: 'intermediate' },
        { title: 'Linked Lists Advanced',   file: 'ds-linked-lists-visualizer.html',            level: 'intermediate' },
        { title: 'Trees Advanced',          file: 'ds-trees-visualizer.html',                   level: 'intermediate' },
        { title: 'Hash Tables',             file: 'ds-hash-tables-visualizer.html',             level: 'intermediate' },
        { title: 'Heaps',                   file: 'ds-heaps-visualizer.html',                   level: 'advanced' },
        { title: 'Tries',                   file: 'ds-tries-visualizer.html',                   level: 'advanced' },
        { title: 'Graphs Advanced',         file: 'ds-graphs-advanced-visualizer.html',         level: 'advanced' },
        { title: 'Disjoint Sets',           file: 'ds-disjoint-sets-visualizer.html',           level: 'advanced' },
        { title: 'Dynamic Programming',     file: 'ds-dynamic-programming-visualizer.html',     level: 'expert' },
      ]},
      { label: 'Algorithms', pages: [
        { title: 'Big-O Complexity',        file: 'big-o-visualizer.html',                      level: 'beginner' },
        { title: 'Sorting Algorithms',      file: 'sorting-visualizer.html',                    level: 'intermediate' },
        { title: 'Searching',               file: 'searching-visualizer.html',                  level: 'intermediate' },
        { title: 'Recursion',               file: 'recursion-visualizer.html',                  level: 'intermediate' },
        { title: 'Two Pointers & Sliding Window', file: 'ds-two-pointer-sliding-window-visualizer.html', level: 'intermediate' },
        { title: 'Backtracking',            file: 'ds-backtracking-visualizer.html',            level: 'advanced' },
      ]},
    ]
  },
  {
    id: 'spring-boot', icon: '🍃', label: 'Spring Boot',
    desc: 'REST APIs, JPA, Security, Testing, and production-grade Spring patterns',
    sections: [
      { label: 'Core', pages: [
        { title: 'Architecture',            file: 'spring-boot-architecture-visualizer.html',   level: 'beginner' },
        { title: 'Dependency Injection & IoC', file: 'spring-boot-di-ioc-visualizer.html',       level: 'beginner' },
        { title: 'Auto-Configuration Magic', file: 'spring-boot-auto-configuration-deep-visualizer.html', level: 'advanced' },
        { title: 'Request Lifecycle',       file: 'spring-boot-request-lifecycle-visualizer.html', level: 'intermediate' },
        { title: 'REST API',                file: 'spring-boot-rest-api-visualizer.html',        level: 'beginner' },
        { title: 'DTOs & Mapping',          file: 'spring-boot-dtos-mapping-deep-visualizer.html', level: 'intermediate' },
        { title: 'Data & JPA',              file: 'spring-boot-data-jpa-visualizer.html',        level: 'intermediate' },
        { title: 'Security',                file: 'spring-boot-security-visualizer.html',        level: 'intermediate' },
        { title: 'Security Filter Chain',   file: 'spring-boot-security-filter-chain-deep-visualizer.html', level: 'advanced' },
        { title: 'Testing',                 file: 'spring-boot-testing-visualizer.html',         level: 'intermediate' },
        { title: 'Testing Secured Endpoints', file: 'spring-boot-testing-security-deep-visualizer.html', level: 'advanced' },
        { title: 'Configuration',           file: 'spring-boot-configuration-visualizer.html',   level: 'intermediate' },
        { title: 'Actuator',                file: 'spring-boot-actuator-visualizer.html',        level: 'intermediate' },
        { title: 'Lombok & Code Generation', file: 'spring-boot-lombok-visualizer.html',          level: 'beginner' },
      ]},
      { label: 'Data Layer', pages: [
        { title: 'Transactions',            file: 'spring-boot-transactions-visualizer.html',    level: 'intermediate' },
        { title: 'Propagation & Isolation', file: 'spring-boot-transactions-deep-visualizer.html', level: 'advanced' },
        { title: 'Pagination & Sorting',    file: 'spring-boot-pagination-visualizer.html',      level: 'intermediate' },
        { title: 'JPA Specs & Projections', file: 'spring-boot-data-specs-visualizer.html',     level: 'advanced' },
        { title: 'N+1 & Fetch Strategies',  file: 'spring-boot-jpa-fetching-deep-visualizer.html', level: 'advanced' },
        { title: 'Flyway Migrations',       file: 'spring-boot-flyway-visualizer.html',          level: 'intermediate' },
        { title: 'Caching',                 file: 'spring-boot-caching-visualizer.html',         level: 'intermediate' },
        { title: 'Caching Internals',       file: 'spring-boot-caching-internals-deep-visualizer.html', level: 'advanced' },
      ]},
      { label: 'APIs & Communication', pages: [
        { title: 'Validation',              file: 'spring-boot-validation-visualizer.html',      level: 'intermediate' },
        { title: 'REST API Design',         file: 'spring-boot-api-design-deep-visualizer.html', level: 'intermediate' },
        { title: 'OpenAPI / Swagger',       file: 'spring-boot-openapi-visualizer.html',         level: 'intermediate' },
        { title: 'JSON Serialization',      file: 'spring-boot-serialization-deep-visualizer.html', level: 'advanced' },
        { title: 'REST Client',             file: 'spring-boot-rest-client-visualizer.html',     level: 'intermediate' },
        { title: 'WebSocket',               file: 'spring-boot-websocket-visualizer.html',       level: 'advanced' },
        { title: 'CORS & Preflight',        file: 'spring-boot-cors-deep-visualizer.html',       level: 'advanced' },
        { title: 'GraphQL',                 file: 'spring-boot-graphql-visualizer.html',         level: 'advanced' },
        { title: 'gRPC & Protocol Buffers', file: 'spring-boot-grpc-visualizer.html',            level: 'advanced' },
      ]},
      { label: 'Security & Identity', pages: [
        { title: 'Method Security (@PreAuthorize)', file: 'spring-boot-method-security-deep-visualizer.html', level: 'advanced' },
        { title: 'Multi-IDM Claim Mapping', file: 'spring-boot-multi-idm-claims-deep-visualizer.html', level: 'expert' },
        { title: 'Declarative HTTP Clients (@HttpExchange)', file: 'spring-boot-http-exchange-deep-visualizer.html', level: 'advanced' },
        { title: 'BFF & Token Relay',       file: 'spring-boot-bff-token-relay-deep-visualizer.html', level: 'expert' },
        { title: 'Rate Limiting & Lockout', file: 'spring-boot-rate-limiting-deep-visualizer.html', level: 'advanced' },
        { title: 'Refresh Token Rotation',  file: 'spring-boot-refresh-token-rotation-deep-visualizer.html', level: 'advanced' },
        { title: 'CSRF Protection',         file: 'spring-boot-csrf-deep-visualizer.html',       level: 'advanced' },
      ]},
      { label: 'Production & Ops', pages: [
        { title: 'Logging',                 file: 'spring-boot-logging-visualizer.html',         level: 'intermediate' },
        { title: 'Profiles Deep Dive',      file: 'spring-boot-profiles-visualizer.html',        level: 'advanced' },
        { title: 'Bean Lifecycle',          file: 'spring-boot-bean-lifecycle-visualizer.html',  level: 'advanced' },
        { title: 'Async & Scheduling',      file: 'spring-boot-async-scheduling-visualizer.html',level: 'advanced' },
        { title: '@Async & Thread Pools',   file: 'spring-boot-async-threads-deep-visualizer.html', level: 'advanced' },
        { title: 'Observability & Tracing', file: 'spring-boot-observability-deep-visualizer.html', level: 'advanced' },
      ]},
      { label: 'Advanced Patterns', pages: [
        { title: 'OAuth2 Resource Server',  file: 'spring-boot-oauth2-resource-server-visualizer.html', level: 'advanced' },
        { title: 'IDM Integration (OAuth2)', file: 'spring-boot-idm-oauth2-deep-visualizer.html', level: 'advanced' },
        { title: 'Application Events',      file: 'spring-boot-events-visualizer.html',          level: 'advanced' },
        { title: 'Spring Batch',            file: 'spring-boot-batch-visualizer.html',           level: 'expert' },
        { title: 'Microservices Patterns',  file: 'spring-boot-microservices-visualizer.html',   level: 'expert' },
        { title: 'Resilience4j',            file: 'spring-boot-resilience4j-visualizer.html',    level: 'expert' },
      ]},
      { label: 'Debugging', pages: [
        { title: 'Debugging Proxies',       file: 'spring-boot-debugging-proxies-deep-visualizer.html', level: 'advanced' },
        { title: 'Actuator & Logs',         file: 'spring-boot-debugging-actuator-deep-visualizer.html', level: 'intermediate' },
        { title: 'Remote Debug & Breakpoints', file: 'spring-boot-debugging-remote-deep-visualizer.html', level: 'advanced' },
      ]},
    ]
  },
  {
    id: 'angular', icon: '🅰️', label: 'Angular',
    desc: 'Components, signals, routing, forms, state management, and build tools',
    sections: [
      { label: 'Fundamentals', pages: [
        { title: 'Components',              file: 'angular-components-visualizer.html',          level: 'beginner' },
        { title: 'Data Binding',            file: 'angular-binding-visualizer.html',             level: 'beginner' },
        { title: 'Event Handling & onClick', file: 'angular-events-deep-visualizer.html',         level: 'beginner' },
        { title: 'Directives',              file: 'angular-directives-visualizer.html',          level: 'beginner' },
        { title: 'Pipes',                   file: 'angular-pipes-visualizer.html',               level: 'beginner' },
        { title: 'Services & DI',           file: 'angular-services-visualizer.html',            level: 'beginner' },
        { title: 'CLI Project Structure',   file: 'angular-cli-project-visualizer.html',         level: 'beginner' },
        { title: 'Component Lifecycle',     file: 'angular-lifecycle-visualizer.html',           level: 'intermediate' },
        { title: 'Component Communication', file: 'angular-communication-visualizer.html',       level: 'intermediate' },
        { title: 'Angular v14+ Features',   file: 'angular-v14-plus-visualizer.html',            level: 'intermediate' },
        { title: 'Angular 21 — New Features', file: 'angular-v21-visualizer.html',               level: 'advanced' },
      ]},
      { label: 'Routing', pages: [
        { title: 'Routing',                 file: 'angular-routing-visualizer.html',             level: 'intermediate' },
        { title: 'Routing Advanced',        file: 'angular-routing-advanced-visualizer.html',    level: 'advanced' },
        { title: 'Functional Guards',       file: 'angular-functional-guards-visualizer.html',   level: 'advanced' },
        { title: 'Lazy Loading & @defer',   file: 'angular-lazy-loading-visualizer.html',        level: 'advanced' },
        { title: '@defer Deferrable Views', file: 'angular-defer-deep-visualizer.html',          level: 'advanced' },
      ]},
      { label: 'Forms', pages: [
        { title: 'Reactive Forms',          file: 'angular-forms-visualizer.html',               level: 'intermediate' },
        { title: 'Template-Driven Forms',   file: 'angular-template-forms-visualizer.html',      level: 'intermediate' },
        { title: 'Form Arrays',             file: 'angular-form-array-visualizer.html',          level: 'advanced' },
        { title: 'Custom Form Controls',    file: 'angular-custom-form-controls-visualizer.html',level: 'advanced' },
        { title: 'Forms & FormData Handling', file: 'angular-forms-data-deep-visualizer.html',   level: 'intermediate' },
      ]},
      { label: 'State & Reactivity', pages: [
        { title: 'Signals',                 file: 'angular-signals-visualizer.html',             level: 'intermediate' },
        { title: 'Signals Deep Dive',       file: 'angular-signals-deep-visualizer.html',        level: 'advanced' },
        { title: 'Signals ↔ RxJS Interop',  file: 'angular-signals-rxjs-interop-deep-visualizer.html', level: 'advanced' },
        { title: 'RxJS',                    file: 'angular-rxjs-visualizer.html',                level: 'intermediate' },
        { title: 'RxJS Operators',          file: 'angular-rxjs-operators-visualizer.html',      level: 'advanced' },
        { title: 'RxJS Operators Lab',      file: 'angular-rxjs-operators-lab-visualizer.html',  level: 'beginner' },
        { title: 'RxJS Flattening (live)',  file: 'angular-rxjs-flattening-deep-visualizer.html', level: 'intermediate' },
        { title: 'NgRx',                    file: 'angular-ngrx-visualizer.html',                level: 'advanced' },
        { title: 'NgRx Signal Store',       file: 'angular-ngrx-signal-store-visualizer.html',   level: 'advanced' },
        { title: 'SignalStore Patterns',    file: 'angular-signal-store-patterns-deep-visualizer.html', level: 'advanced' },
        { title: 'State Patterns',          file: 'angular-state-patterns-visualizer.html',      level: 'advanced' },
        { title: 'RxJS Multicasting',       file: 'angular-rxjs-multicasting-visualizer.html',   level: 'advanced' },
        { title: 'RxJS Custom Operators',   file: 'angular-rxjs-custom-operators-visualizer.html', level: 'expert' },
      ]},
      { label: 'HTTP & Performance', pages: [
        { title: 'HTTP Client',             file: 'angular-http-visualizer.html',                level: 'intermediate' },
        { title: 'Pagination Deep Dive',    file: 'angular-pagination-deep-visualizer.html',     level: 'intermediate' },
        { title: 'HTTP Interceptors',       file: 'angular-interceptors-advanced-visualizer.html',level: 'advanced' },
        { title: 'Error Handling (E2E)',    file: 'angular-error-handling-deep-visualizer.html', level: 'advanced' },
        { title: 'OpenAPI → Typed Client',  file: 'angular-openapi-client-deep-visualizer.html', level: 'advanced' },
        { title: 'Change Detection',        file: 'angular-change-detection-visualizer.html',    level: 'advanced' },
        { title: 'Change Detection Internals', file: 'angular-change-detection-deep-visualizer.html', level: 'advanced' },
        { title: 'Performance',             file: 'angular-performance-visualizer.html',         level: 'advanced' },
        { title: 'SSR & Hydration',         file: 'angular-ssr-hydration-visualizer.html',       level: 'advanced' },
        { title: 'PWA',                     file: 'angular-pwa-visualizer.html',                 level: 'advanced' },
      ]},
      { label: 'Auth & Identity', pages: [
        { title: 'OIDC Login (Code + PKCE)',file: 'angular-oidc-login-deep-visualizer.html',     level: 'advanced' },
        { title: 'Access Tokens & Refresh', file: 'angular-token-lifecycle-deep-visualizer.html',level: 'advanced' },
        { title: 'Route Guards & Claims',   file: 'angular-route-guards-deep-visualizer.html',   level: 'advanced' },
        { title: 'Auth State (Signals)',    file: 'angular-auth-state-signals-deep-visualizer.html', level: 'advanced' },
        { title: 'Reactive Forms (Auth)',   file: 'angular-auth-forms-deep-visualizer.html',     level: 'intermediate' },
      ]},
      { label: 'Templates & UI', pages: [
        { title: 'Built-in Control Flow',   file: 'angular-control-flow-visualizer.html',        level: 'intermediate' },
        { title: 'Control Flow & @for track', file: 'angular-control-flow-internals-deep-visualizer.html', level: 'advanced' },
        { title: 'Content Projection',      file: 'angular-content-projection-visualizer.html',  level: 'intermediate' },
        { title: 'View Encapsulation',      file: 'angular-view-encapsulation-visualizer.html',  level: 'intermediate' },
        { title: 'ViewChild & ContentChild',file: 'angular-viewchild-visualizer.html',           level: 'intermediate' },
        { title: 'Dynamic Components',      file: 'angular-dynamic-components-visualizer.html',  level: 'advanced' },
        { title: 'Custom Directives',       file: 'angular-custom-directives-visualizer.html',   level: 'advanced' },
        { title: 'Animations',              file: 'angular-animations-visualizer.html',          level: 'intermediate' },
        { title: 'Angular Material & CDK',  file: 'angular-material-cdk-visualizer.html',        level: 'intermediate' },
      ]},
      { label: 'Testing', pages: [
        { title: 'Testing (TestBed & Pyramid)', file: 'angular-testing-visualizer.html',         level: 'intermediate' },
        { title: 'Vitest & .spec.ts',       file: 'angular-vitest-visualizer.html',              level: 'intermediate' },
        { title: 'E2E Testing (Playwright & Cypress)', file: 'angular-e2e-playwright-visualizer.html', level: 'intermediate' },
      ]},
      { label: 'Architecture & Build', pages: [
        { title: 'Standalone Migration',    file: 'angular-standalone-migration-visualizer.html',level: 'advanced' },
        { title: 'DI Advanced',             file: 'angular-di-advanced-visualizer.html',         level: 'advanced' },
        { title: 'DI & Injector Tree',      file: 'angular-di-hierarchy-deep-visualizer.html',   level: 'advanced' },
        { title: 'Workspace & Libraries',   file: 'angular-workspace-libraries-visualizer.html', level: 'advanced' },
        { title: 'Lazy Loading & Preloading', file: 'angular-lazy-loading-deep-visualizer.html', level: 'advanced' },
        { title: 'esbuild Build System',    file: 'angular-build-esbuild-visualizer.html',       level: 'advanced' },
        { title: 'Zoneless Mode',           file: 'angular-zoneless-mode-visualizer.html',       level: 'expert' },
        { title: 'Zoneless Change Detection', file: 'angular-zoneless-deep-visualizer.html',      level: 'expert' },
      ]},
      { label: 'Debugging', pages: [
        { title: 'ExpressionChanged Error', file: 'angular-debugging-change-detection-deep-visualizer.html', level: 'advanced' },
        { title: 'Debugging RxJS',          file: 'angular-debugging-rxjs-deep-visualizer.html',  level: 'advanced' },
        { title: 'Browser & Angular DevTools', file: 'angular-debugging-devtools-deep-visualizer.html', level: 'intermediate' },
      ]},
      { label: '🍳 Common Recipes', pages: [
        { title: 'Recipe: API → Reactive Form', file: 'angular-recipe-api-form-visualizer.html',     level: 'intermediate' },
        { title: 'Recipe: Batch File Upload',    file: 'angular-recipe-batch-upload-visualizer.html', level: 'intermediate' },
      ]},
    ]
  },
  {
    id: 'typescript', icon: '🔷', label: 'TypeScript',
    desc: 'Type system, generics, advanced patterns, and TypeScript best practices',
    sections: [
      { label: 'Foundations', pages: [
        { title: 'Why TypeScript?',          file: 'typescript-why-visualizer.html',             level: 'beginner' },
        { title: 'Fundamentals',             file: 'typescript-fundamentals-visualizer.html',    level: 'beginner' },
        { title: 'Object Types',             file: 'typescript-object-types-deep-visualizer.html', level: 'intermediate' },
        { title: 'Classes',                  file: 'typescript-classes-visualizer.html',         level: 'beginner' },
        { title: 'Class Internals',          file: 'typescript-classes-internals-deep-visualizer.html', level: 'intermediate' },
        { title: 'Functions',                file: 'typescript-functions-visualizer.html',       level: 'beginner' },
        { title: 'Overloads & Signatures',   file: 'typescript-functions-overloads-deep-visualizer.html', level: 'intermediate' },
        { title: 'Arrays & Tuples',          file: 'typescript-arrays-tuples-visualizer.html',   level: 'beginner' },
        { title: 'Modules',                  file: 'typescript-modules-visualizer.html',         level: 'intermediate' },
        { title: 'Declarations (.d.ts)',     file: 'typescript-declarations-visualizer.html',    level: 'intermediate' },
      ]},
      { label: 'Type System', pages: [
        { title: 'Type Narrowing',           file: 'typescript-narrowing-visualizer.html',       level: 'intermediate' },
        { title: 'Control-Flow Analysis',    file: 'typescript-narrowing-cfa-deep-visualizer.html', level: 'advanced' },
        { title: 'Discriminated Unions',     file: 'typescript-discriminated-unions-visualizer.html', level: 'intermediate' },
        { title: 'Inference & as const',     file: 'typescript-inference-visualizer.html',       level: 'intermediate' },
        { title: 'Structural vs Nominal',    file: 'typescript-structural-typing-deep-visualizer.html', level: 'intermediate' },
        { title: 'Type Guards',              file: 'typescript-type-guards-visualizer.html',     level: 'intermediate' },
        { title: 'unknown, any & never',     file: 'typescript-top-bottom-types-deep-visualizer.html', level: 'intermediate' },
        { title: 'Generics',                file: 'typescript-generics-visualizer.html',        level: 'intermediate' },
        { title: 'Generic Inference',       file: 'typescript-generic-inference-deep-visualizer.html', level: 'intermediate' },
        { title: 'keyof & Indexed Access',  file: 'typescript-keyof-indexed-deep-visualizer.html', level: 'intermediate' },
        { title: 'Utility Types',           file: 'typescript-utility-types-visualizer.html',   level: 'intermediate' },
        { title: 'Conditional Types',       file: 'typescript-conditional-types-visualizer.html',level: 'advanced' },
        { title: 'Mapped Types',            file: 'typescript-mapped-types-visualizer.html',    level: 'advanced' },
        { title: 'Template Literal Types',  file: 'typescript-template-literal-types-visualizer.html', level: 'advanced' },
        { title: 'Type-Level Programming Lab', file: 'typescript-type-level-lab-visualizer.html', level: 'expert' },
        { title: 'Type Patterns',           file: 'typescript-type-patterns-visualizer.html',   level: 'advanced' },
        { title: 'Type Variance',           file: 'typescript-variance-visualizer.html',        level: 'expert' },
      ]},
      { label: 'Advanced', pages: [
        { title: 'Decorators',              file: 'typescript-decorators-visualizer.html',      level: 'advanced' },
        { title: 'Maps, Sets & WeakMap',    file: 'typescript-maps-sets-visualizer.html',       level: 'intermediate' },
        { title: 'Async Patterns',          file: 'typescript-async-patterns-visualizer.html',  level: 'advanced' },
      ]},
    ]
  },
  {
    id: 'app-config', icon: '⚙️', label: 'App Configuration',
    desc: 'tsconfig, package.json, angular.json, and runtime configuration files',
    sections: [
      { label: 'TypeScript Config', pages: [
        { title: 'tsconfig Basics',         file: 'config-tsconfig-visualizer.html',            level: 'intermediate' },
        { title: 'tsconfig All Options',    file: 'config-tsconfig-advanced-visualizer.html',   level: 'advanced' },
      ]},
      { label: 'Node & Packages', pages: [
        { title: 'package.json Basics',     file: 'config-package-json-visualizer.html',        level: 'beginner' },
        { title: 'package.json Advanced',   file: 'config-package-json-advanced-visualizer.html',level: 'advanced' },
      ]},
      { label: 'Angular Build', pages: [
        { title: 'angular.json Basics',     file: 'config-angular-json-visualizer.html',        level: 'intermediate' },
        { title: 'angular.json Builders',   file: 'config-angular-json-advanced-visualizer.html',level: 'advanced' },
        { title: 'index.html Config',       file: 'config-index-html-visualizer.html',          level: 'intermediate' },
      ]},
      { label: 'Runtime Config', pages: [
        { title: 'app.config Basics',       file: 'config-app-config-visualizer.html',          level: 'intermediate' },
        { title: 'app.config Providers',    file: 'config-app-config-providers-visualizer.html',level: 'advanced' },
        { title: 'Environment & Runtime',   file: 'config-environment-runtime-visualizer.html', level: 'intermediate' },
      ]},
      { label: 'Maven', pages: [
        { title: 'pom.xml',                 file: 'config-pom-xml-visualizer.html',             level: 'intermediate' },
      ]},
    ]
  },
  {
    id: 'interview', icon: '🎯', label: 'Interview Prep',
    desc: 'Algorithm patterns, coding Q&A, system design, and Java deep-dives',
    sections: [
      { label: 'Algorithm Patterns', pages: [
        { title: 'Arrays & Strings',        file: 'interview-arrays-strings-visualizer.html',   level: 'intermediate' },
        { title: 'Linked Lists',            file: 'interview-linked-lists-visualizer.html',     level: 'intermediate' },
        { title: 'Trees',                   file: 'interview-trees-visualizer.html',            level: 'intermediate' },
        { title: 'Dynamic Programming',     file: 'interview-dynamic-programming-visualizer.html',level: 'advanced' },
        { title: 'Graphs',                  file: 'interview-graphs-visualizer.html',           level: 'advanced' },
        { title: 'Sorting & Searching',     file: 'interview-sorting-searching-visualizer.html',level: 'intermediate' },
        { title: 'HashMaps & Sets',         file: 'interview-hashmaps-sets-visualizer.html',    level: 'intermediate' },
        { title: 'Stacks & Queues',         file: 'interview-stacks-queues-visualizer.html',    level: 'intermediate' },
        { title: 'Backtracking',            file: 'interview-backtracking-visualizer.html',     level: 'advanced' },
      ]},
      { label: 'Q&A Guides', pages: [
        { title: 'Java OOP Questions',      file: 'interview-java-oop-visualizer.html',         level: 'intermediate' },
        { title: 'Java Concurrency Q&A',    file: 'interview-java-concurrency-visualizer.html', level: 'advanced' },
        { title: 'System Design',           file: 'interview-system-design-visualizer.html',    level: 'advanced' },
        { title: 'Spring + Angular Q&A',    file: 'interview-spring-angular-visualizer.html',   level: 'advanced' },
      ]},
    ]
  },
  {
    id: 'tools', icon: '🛠️', label: 'Dev Tools',
    desc: 'Docker, Maven, Git, HTTP, and SQL essentials',
    sections: [
      { label: 'Docker', pages: [
        { title: 'Docker Concepts',         file: 'docker-concepts-visualizer.html',            level: 'beginner' },
        { title: 'Dockerfile',              file: 'docker-dockerfile-visualizer.html',          level: 'beginner' },
        { title: 'Images & Containers',     file: 'docker-images-containers-visualizer.html',   level: 'beginner' },
        { title: 'Networking',              file: 'docker-networking-visualizer.html',          level: 'intermediate' },
        { title: 'Docker Compose',          file: 'docker-compose-visualizer.html',             level: 'intermediate' },
        { title: 'Spring Boot + Docker',    file: 'docker-spring-boot-visualizer.html',         level: 'intermediate' },
      ]},
      { label: 'Maven', pages: [
        { title: 'Lifecycle',               file: 'maven-lifecycle-visualizer.html',            level: 'beginner' },
        { title: 'POM Structure',           file: 'maven-pom-visualizer.html',                  level: 'beginner' },
        { title: 'Dependencies',            file: 'maven-dependencies-visualizer.html',         level: 'intermediate' },
        { title: 'Plugins',                 file: 'maven-plugins-visualizer.html',              level: 'intermediate' },
        { title: 'Multi-module Projects',   file: 'maven-multimodule-visualizer.html',          level: 'advanced' },
      ]},
      { label: 'Git', pages: [
        { title: 'Git Basics',              file: 'git-visualizer.html',                        level: 'beginner' },
        { title: 'Branching',               file: 'git-branching-visualizer.html',              level: 'beginner' },
        { title: 'Collaboration',           file: 'git-collaboration-visualizer.html',          level: 'intermediate' },
        { title: 'Rebase',                  file: 'git-rebase-visualizer.html',                 level: 'advanced' },
        { title: 'Advanced Git',            file: 'git-advanced-visualizer.html',               level: 'advanced' },
      ]},
      { label: 'Web & DB', pages: [
        { title: 'HTTP & REST',             file: 'http-rest-visualizer.html',                  level: 'beginner' },
        { title: 'SQL',                     file: 'sql-visualizer.html',                        level: 'beginner' },
        { title: 'System Design',           file: 'system-design-visualizer.html',              level: 'advanced' },
      ]},
    ]
  },
  {
    id: 'cloud', icon: '☁️', label: 'Cloud — AWS',
    desc: 'Core AWS services: compute, storage, networking, containers, and serverless',
    sections: [
      { label: 'AWS', pages: [
        { title: 'AWS Overview',            file: 'aws-overview-visualizer.html',               level: 'beginner' },
        { title: 'IAM',                     file: 'aws-iam-visualizer.html',                    level: 'intermediate' },
        { title: 'VPC & Networking',        file: 'aws-vpc-visualizer.html',                    level: 'intermediate' },
        { title: 'EC2',                     file: 'aws-ec2-visualizer.html',                    level: 'intermediate' },
        { title: 'S3',                      file: 'aws-s3-visualizer.html',                     level: 'beginner' },
        { title: 'RDS',                     file: 'aws-rds-visualizer.html',                    level: 'intermediate' },
        { title: 'ECS',                     file: 'aws-ecs-visualizer.html',                    level: 'advanced' },
        { title: 'Lambda',                  file: 'aws-lambda-visualizer.html',                 level: 'intermediate' },
        { title: 'CloudWatch',              file: 'aws-cloudwatch-visualizer.html',             level: 'intermediate' },
        { title: 'API Gateway',             file: 'aws-api-gateway-visualizer.html',            level: 'advanced' },
        { title: 'Load Balancing & Auto Scaling', file: 'aws-load-balancing-visualizer.html',   level: 'advanced' },
      ]},
      { label: 'Architecture & Operations', pages: [
        { title: 'Choosing Compute: EC2 vs Lambda vs ECS vs EKS', file: 'aws-compute-decision-visualizer.html', level: 'intermediate' },
        { title: 'Storage Deep Dive: EBS vs EFS vs S3',           file: 'aws-storage-deep-visualizer.html',      level: 'advanced' },
        { title: 'Infrastructure as Code: CloudFormation & CDK',  file: 'aws-iac-visualizer.html',               level: 'advanced' },
        { title: 'Cost Management & Optimization',                file: 'aws-cost-visualizer.html',              level: 'intermediate' },
      ]},
    ]
  },
  {
    id: 'azure', icon: '🟦', label: 'Cloud — Azure',
    desc: 'Core Azure for developers (the AZ-204 surface): ARM & RBAC, App Service, Functions, containers, Blob Storage, Cosmos DB, and Key Vault + managed identities',
    sections: [
      { label: 'Foundations', pages: [
        { title: 'Azure Overview — ARM, RBAC & Resource Groups', file: 'azure-overview-visualizer.html',          level: 'beginner' },
      ]},
      { label: 'Compute', pages: [
        { title: 'App Service — Deploy, Slots & Scale',          file: 'azure-app-service-visualizer.html',       level: 'intermediate' },
        { title: 'Functions — Triggers, Scale & Durable',        file: 'azure-functions-visualizer.html',         level: 'intermediate' },
        { title: 'Containers — ACR, ACI & Container Apps',       file: 'azure-containers-visualizer.html',        level: 'advanced' },
      ]},
      { label: 'Data & Storage', pages: [
        { title: 'Blob Storage — Auth, SAS & Lifecycle',         file: 'azure-storage-visualizer.html',           level: 'intermediate' },
        { title: 'Cosmos DB — Partitions, RUs & Consistency',    file: 'azure-cosmos-visualizer.html',            level: 'advanced' },
      ]},
      { label: 'Security', pages: [
        { title: 'Key Vault & Managed Identities',               file: 'azure-keyvault-identity-visualizer.html', level: 'advanced' },
      ]},
    ]
  },
  {
    id: 'gcp', icon: '🟢', label: 'Cloud — GCP',
    desc: 'Core Google Cloud for developers (the Associate Cloud Engineer surface): projects, IAM & resource hierarchy, Compute Engine & GKE, Cloud Run & Functions, Storage/Firestore/BigQuery, and Secret Manager + Workload Identity Federation',
    sections: [
      { label: 'Foundations', pages: [
        { title: 'GCP Overview — Projects, Resource Hierarchy & IAM', file: 'gcp-overview-visualizer.html',        level: 'beginner' },
      ]},
      { label: 'Compute', pages: [
        { title: 'Compute Engine — VMs, Templates & MIGs',       file: 'gcp-compute-engine-visualizer.html',      level: 'intermediate' },
        { title: 'GKE — Pods, Deployments & Autopilot',          file: 'gcp-gke-visualizer.html',                 level: 'advanced' },
        { title: 'Cloud Run & Functions — Serverless',           file: 'gcp-serverless-visualizer.html',          level: 'intermediate' },
      ]},
      { label: 'Data & Storage', pages: [
        { title: 'Cloud Storage — Signed URLs & Lifecycle',      file: 'gcp-storage-visualizer.html',             level: 'intermediate' },
        { title: 'Cloud SQL, Firestore & BigQuery',              file: 'gcp-databases-visualizer.html',           level: 'advanced' },
      ]},
      { label: 'Security', pages: [
        { title: 'IAM Policies, Service Accounts & Secret Manager', file: 'gcp-iam-secrets-visualizer.html',      level: 'advanced' },
      ]},
    ]
  },
  {
    id: 'identity', icon: '🔐', label: 'Identity & Auth',
    desc: 'JWTs, tokens & signing keys, OAuth2/OIDC, Microsoft Entra ID (Azure AD), and Ping Identity',
    sections: [
      { label: 'Tokens, Keys & Signing', pages: [
        { title: 'Tokens, Keys & Signing',       file: 'identity-keys-signing-deep-visualizer.html', level: 'advanced' },
      ]},
      { label: 'Entra ID (Azure AD)', pages: [
        { title: 'Entra Overview',               file: 'entra-overview-visualizer.html',         level: 'intermediate' },
        { title: 'OAuth2 & OIDC',                file: 'entra-oauth-oidc-visualizer.html',       level: 'advanced' },
        { title: 'App Registration',             file: 'entra-app-registration-visualizer.html', level: 'intermediate' },
        { title: 'JWT Tokens',                   file: 'entra-jwt-tokens-visualizer.html',       level: 'advanced' },
        { title: 'Spring + Angular Integration', file: 'entra-spring-angular-visualizer.html',   level: 'advanced' },
      ]},
      { label: 'Ping Identity', pages: [
        { title: 'Ping Overview',           file: 'ping-overview-visualizer.html',               level: 'intermediate' },
        { title: 'Platform (AM/IDM/DS/IG)', file: 'ping-platform-deep-visualizer.html',          level: 'intermediate' },
        { title: 'Auth Journeys & Trees',   file: 'ping-am-journeys-deep-visualizer.html',        level: 'advanced' },
        { title: 'CIAM & Adaptive Auth',    file: 'ping-ciam-patterns-deep-visualizer.html',      level: 'advanced' },
        { title: 'Federation',              file: 'ping-federation-visualizer.html',             level: 'advanced' },
        { title: 'OAuth',                   file: 'ping-oauth-visualizer.html',                  level: 'advanced' },
        { title: 'Provisioning',            file: 'ping-provisioning-visualizer.html',           level: 'advanced' },
        { title: 'Integration',             file: 'ping-integration-visualizer.html',            level: 'advanced' },
        { title: 'PingOne Admin',           file: 'ping-admin-visualizer.html',                  level: 'intermediate' },
      ]},
      { label: 'Authorization Patterns', pages: [
        { title: 'RBAC & Authorization Deep Dive', file: 'rbac-deep-visualizer.html',             level: 'advanced' },
      ]},
      { label: 'Web App Security', pages: [
        { title: 'XSS & SQL Injection',        file: 'appsec-injection-xss-visualizer.html',   level: 'advanced' },
        { title: 'OWASP Top 10',               file: 'appsec-owasp-top10-visualizer.html',     level: 'intermediate' },
      ]},
      { label: '🍳 Common Recipes', pages: [
        { title: 'Recipe: Password Complexity & Strength', file: 'identity-recipe-password-complexity-visualizer.html', level: 'intermediate' },
      ]},
    ]
  },
  {
    id: 'debugging', icon: '🐛', label: 'Debugging',
    desc: 'Find bugs faster: the network/auth round-trip, reading errors, and stack-specific gotchas',
    sections: [
      { label: 'Full-Stack Auth & HTTP', pages: [
        { title: 'CORS Failures',           file: 'debugging-cors-visualizer.html',           level: 'intermediate' },
        { title: 'Auth: 401 vs 403',        file: 'debugging-auth-401-403-visualizer.html',   level: 'intermediate' },
        { title: 'JWTs: decode & diagnose', file: 'debugging-jwt-visualizer.html',            level: 'advanced' },
      ]},
      { label: 'Technique & Stack Traces', pages: [
        { title: 'Reading Stack Traces',    file: 'debugging-stack-traces-visualizer.html',   level: 'intermediate' },
        { title: 'The Debugging Method',    file: 'debugging-method-visualizer.html',         level: 'intermediate' },
        { title: 'Log vs Debugger',         file: 'debugging-logging-vs-stepping-visualizer.html', level: 'intermediate' },
        { title: 'Debug Like a Pro: The Toolbox', file: 'debugging-pro-toolbox-visualizer.html', level: 'advanced' },
      ]},
    ]
  },
  {
    id: 'playground', icon: '🧪', label: 'Playgrounds',
    desc: 'Live, hands-on sandboxes — fire real requests and watch the real responses',
    sections: [
      { label: 'Live sandboxes', pages: [
        { title: 'TypeScript Playground',   file: 'typescript-playground-visualizer.html',    level: 'intermediate' },
        { title: 'Python Playground',       file: 'python-playground-visualizer.html',        level: 'intermediate' },
        { title: 'Shell Playground',        file: 'shell-playground-visualizer.html',         level: 'intermediate' },
        { title: 'API Playground',          file: 'api-playground-visualizer.html',           level: 'intermediate' },
        { title: 'JWT & Auth Playground',   file: 'jwt-playground-visualizer.html',           level: 'intermediate' },
        { title: 'Spring Boot Playground',  file: 'spring-boot-playground-visualizer.html',   level: 'intermediate' },
        { title: 'SQL Playground',          file: 'sql-playground-visualizer.html',           level: 'intermediate' },
        { title: 'Auth & Identity (Live)',  file: 'auth-identity-live-visualizer.html',       level: 'intermediate' },
      ]},
    ]
  },
  {
    id: 'coding-practice', icon: '🧑‍💻', label: 'Coding Practice (IDE)',
    desc: 'The missing piece the rest of the app can\'t give you: an actual code editor and hidden test suite. Write the function, press Run, get graded — real JavaScript/TypeScript/Python execution in your browser, no server required',
    sections: [
      { label: 'Data Structures & Algorithms', pages: [
        { title: 'Arrays & Strings',        file: 'practice-arrays-strings.html',              level: 'beginner' },
        { title: 'Linked Lists',            file: 'practice-linked-lists.html',                level: 'intermediate' },
        { title: 'Trees',                   file: 'practice-trees.html',                       level: 'intermediate' },
        { title: 'Graphs',                  file: 'practice-graphs.html',                      level: 'advanced' },
        { title: 'Stacks & Queues',         file: 'practice-stacks-queues.html',               level: 'intermediate' },
        { title: 'Hashmaps & Sets',         file: 'practice-hashmaps-sets.html',               level: 'intermediate' },
        { title: 'Sorting & Searching',     file: 'practice-sorting-searching.html',           level: 'intermediate' },
        { title: 'Dynamic Programming',     file: 'practice-dynamic-programming.html',         level: 'advanced' },
        { title: 'Backtracking',            file: 'practice-backtracking.html',                level: 'advanced' },
      ]},
    ]
  },
  {
    id: 'python', icon: '🐍', label: 'Python',
    desc: 'Python from first principles to expert: syntax, OOP, functions, decorators, generators, exceptions, type hints, async/await, FastAPI — plus a live in-browser interpreter',
    sections: [
      { label: 'Core Language', pages: [
        { title: 'Python Fundamentals',         file: 'python-fundamentals-visualizer.html',        level: 'beginner' },
        { title: 'Functions & Scope (LEGB)',    file: 'python-functions-visualizer.html',           level: 'beginner' },
        { title: 'Collections & Comprehensions', file: 'python-collections-visualizer.html',        level: 'beginner' },
        { title: 'Python OOP',                  file: 'python-oop-visualizer.html',                 level: 'beginner' },
        { title: 'Pattern Matching (match)',     file: 'python-pattern-matching-visualizer.html',    level: 'intermediate' },
      ]},
      { label: 'Functions & Patterns', pages: [
        { title: 'Decorators',                  file: 'python-decorators-visualizer.html',          level: 'intermediate' },
        { title: 'Generators & Iterators',      file: 'python-generators-visualizer.html',          level: 'intermediate' },
        { title: 'itertools & functools',       file: 'python-itertools-functools-visualizer.html', level: 'intermediate' },
        { title: 'Descriptors & Metaclasses',    file: 'python-descriptors-metaclasses-visualizer.html', level: 'advanced' },
      ]},
      { label: 'Robust Code', pages: [
        { title: 'Exceptions & Error Handling', file: 'python-errors-visualizer.html',              level: 'intermediate' },
        { title: 'Type Hints & Protocols',      file: 'python-type-hints-visualizer.html',          level: 'intermediate' },
        { title: 'Context Managers',            file: 'python-context-managers-visualizer.html',    level: 'intermediate' },
        { title: 'Advanced Typing',             file: 'python-advanced-typing-visualizer.html',     level: 'advanced' },
        { title: 'Pydantic v2',                  file: 'python-pydantic-visualizer.html',            level: 'intermediate' },
      ]},
      { label: 'Async & Web', pages: [
        { title: 'Async / Await & asyncio',     file: 'python-async-visualizer.html',               level: 'intermediate' },
        { title: 'FastAPI Deep Dive',            file: 'python-fastapi-deep-visualizer.html',        level: 'intermediate' },
        { title: 'Django — MVT, ORM & Admin',   file: 'python-django-visualizer.html',              level: 'intermediate' },
        { title: 'Flask — Routing & Blueprints', file: 'python-flask-visualizer.html',              level: 'beginner' },
      ]},
      { label: 'Concurrency & the GIL', pages: [
        { title: 'The GIL, Threads & Processes', file: 'python-gil-visualizer.html',                 level: 'advanced' },
      ]},
      { label: 'Data &amp; Tooling', pages: [
        { title: 'Dataclasses',                  file: 'python-dataclasses-visualizer.html',         level: 'intermediate' },
        { title: 'pytest',                       file: 'python-pytest-visualizer.html',              level: 'intermediate' },
        { title: 'Packaging & Environments',     file: 'python-packaging-visualizer.html',           level: 'intermediate' },
      ]},
      { label: '🍳 Common Recipes', pages: [
        { title: 'Recipe: Validate & Parse Request Data', file: 'python-recipe-validate-parse-visualizer.html', level: 'intermediate' },
      ]},
    ]
  },
  {
    id: 'data-science', icon: '📊', label: 'Data Science & ML',
    desc: 'From raw data to a trained model: NumPy/pandas, cleaning & EDA, visualization, the ML fundamentals (train/test, bias-variance), regression/classification, evaluation, clustering/PCA, and neural networks/PyTorch',
    sections: [
      { label: 'Data Tooling', pages: [
        { title: 'NumPy & Pandas — Arrays, Vectorization & DataFrames', file: 'datasci-numpy-pandas-visualizer.html',           level: 'beginner' },
        { title: 'Data Cleaning & EDA — Missing Data & Outliers',       file: 'datasci-data-cleaning-eda-visualizer.html',      level: 'beginner' },
        { title: 'Data Visualization — Matplotlib, Seaborn & Choosing the Right Chart', file: 'datasci-visualization-visualizer.html', level: 'beginner' },
      ]},
      { label: 'ML Fundamentals', pages: [
        { title: 'ML Fundamentals — Supervised vs Unsupervised, Bias-Variance', file: 'datasci-ml-fundamentals-visualizer.html', level: 'intermediate' },
        { title: 'Regression & Classification — Linear/Logistic, Trees & Forests', file: 'datasci-regression-classification-visualizer.html', level: 'intermediate' },
        { title: 'Model Evaluation — Precision, Recall, F1 & ROC-AUC',  file: 'datasci-model-evaluation-visualizer.html',        level: 'intermediate' },
        { title: 'Clustering & PCA — K-Means & Dimensionality Reduction', file: 'datasci-clustering-pca-visualizer.html',        level: 'advanced' },
      ]},
      { label: 'Deep Learning', pages: [
        { title: 'Neural Networks Fundamentals — Perceptrons, Backprop & Gradient Descent', file: 'datasci-neural-networks-visualizer.html', level: 'advanced' },
        { title: 'Deep Learning in Practice — CNNs, RNNs & PyTorch',    file: 'datasci-deep-learning-pytorch-visualizer.html',  level: 'advanced' },
      ]},
    ]
  },
  {
    id: 'ai-engineering', icon: '🧠', label: 'AI / LLM Engineering',
    desc: 'How to actually build with LLMs: the transformer architecture, tokenization & sampling, prompt engineering, embeddings/vector search, RAG, tool-calling agents, wiring an LLM API into a real backend, fine-tuning vs RAG vs prompting & LLMOps, and AI safety/guardrails',
    sections: [
      { label: 'Foundations', pages: [
        { title: 'Transformers & Attention — The Architecture Behind Every LLM', file: 'genai-transformers-attention-visualizer.html', level: 'intermediate' },
        { title: 'How LLMs Work — Tokenization, Next-Token Prediction & Sampling', file: 'genai-how-llms-work-visualizer.html',       level: 'beginner' },
      ]},
      { label: 'Building with LLMs', pages: [
        { title: 'Prompt Engineering — Zero/Few-Shot, Chain-of-Thought & System Prompts', file: 'genai-prompt-engineering-visualizer.html', level: 'beginner' },
        { title: 'Embeddings & Vector Databases — Semantic Search',           file: 'genai-embeddings-vector-db-visualizer.html',  level: 'intermediate' },
        { title: 'RAG — Retrieval-Augmented Generation',                     file: 'genai-rag-visualizer.html',                   level: 'intermediate' },
        { title: 'Tool Use & Agents — Function Calling & the Plan/Act/Observe Loop', file: 'genai-tool-calling-agents-visualizer.html', level: 'intermediate' },
        { title: 'LLM API Integration — Calling Claude/OpenAI from a Backend, Streaming', file: 'genai-llm-api-integration-visualizer.html', level: 'intermediate' },
      ]},
      { label: 'Production AI', pages: [
        { title: 'Fine-Tuning vs RAG vs Prompting & LLMOps — Choosing the Right Approach', file: 'genai-finetuning-llmops-visualizer.html', level: 'advanced' },
        { title: 'AI Safety & Guardrails — Prompt Injection, Jailbreaks & PII Handling', file: 'genai-safety-guardrails-visualizer.html', level: 'advanced' },
      ]},
    ]
  },
  {
    id: 'react', icon: '⚛️', label: 'React',
    desc: 'JSX & the rendering model, Fiber, the full hooks set, state & data, Suspense, refs/portals, RSC, and TypeScript',
    sections: [
      { label: 'Core & Rendering Model', pages: [
        { title: 'React Fundamentals',           file: 'react-fundamentals-visualizer.html',         level: 'beginner' },
        { title: 'JSX & the Virtual DOM',        file: 'react-jsx-vdom-visualizer.html',             level: 'beginner' },
        { title: 'Rendering, Commit & Lifecycle',file: 'react-rendering-lifecycle-visualizer.html',  level: 'intermediate' },
        { title: 'Reconciliation & Fiber',       file: 'react-reconciliation-fiber-visualizer.html', level: 'advanced' },
        { title: 'Synthetic Events',             file: 'react-events-visualizer.html',               level: 'intermediate' },
      ]},
      { label: 'Hooks', pages: [
        { title: 'Hooks Deep Dive',              file: 'react-hooks-visualizer.html',                level: 'intermediate' },
        { title: 'useEffect In Depth',           file: 'react-useeffect-deep-visualizer.html',       level: 'intermediate' },
        { title: 'useReducer & useContext',      file: 'react-usereducer-usecontext-visualizer.html',level: 'intermediate' },
        { title: 'Custom Hooks',                 file: 'react-custom-hooks-visualizer.html',         level: 'intermediate' },
        { title: 'Concurrent Hooks',             file: 'react-concurrent-visualizer.html',           level: 'advanced' },
      ]},
      { label: 'State & Data', pages: [
        { title: 'State Management',             file: 'react-state-management-visualizer.html',     level: 'intermediate' },
        { title: 'Redux Toolkit & Zustand',      file: 'react-redux-zustand-visualizer.html',        level: 'intermediate' },
        { title: 'Context API Deep Dive',        file: 'react-context-deep-visualizer.html',         level: 'intermediate' },
        { title: 'Data Fetching & TanStack Query',file: 'react-data-fetching-visualizer.html',       level: 'intermediate' },
        { title: 'Suspense & Error Boundaries',  file: 'react-suspense-error-boundaries-visualizer.html', level: 'intermediate' },
      ]},
      { label: 'App Building', pages: [
        { title: 'React Router v6',              file: 'react-router-visualizer.html',               level: 'intermediate' },
        { title: 'Next.js App Router & RSC',     file: 'react-nextjs-app-router-visualizer.html',    level: 'advanced' },
        { title: 'Animation (Framer Motion)',    file: 'react-animation-visualizer.html',            level: 'intermediate' },
        { title: 'Styling (Tailwind & CSS-in-JS)',file: 'react-styling-visualizer.html',             level: 'intermediate' },
        { title: 'Forms & Validation',           file: 'react-forms-visualizer.html',                level: 'intermediate' },
        { title: 'Performance & Rendering',      file: 'react-performance-visualizer.html',          level: 'advanced' },
        { title: 'Refs, forwardRef & Portals',   file: 'react-refs-portals-visualizer.html',         level: 'intermediate' },
        { title: 'Server Components & Actions',  file: 'react-server-components-visualizer.html',     level: 'advanced' },
        { title: 'TypeScript with React',        file: 'react-typescript-visualizer.html',           level: 'intermediate' },
      ]},
      { label: 'Testing & Quality', pages: [
        { title: 'Testing (RTL + Vitest)',       file: 'react-testing-visualizer.html',              level: 'intermediate' },
        { title: 'Accessibility (a11y)',         file: 'react-accessibility-visualizer.html',        level: 'intermediate' },
      ]},
      { label: '🍳 Common Recipes', pages: [
        { title: 'Recipe: API → Controlled Form', file: 'react-recipe-api-form-visualizer.html',     level: 'intermediate' },
      ]},
    ]
  },
  {
    id: 'nodejs', icon: '🟢', label: 'Node.js & TypeScript Backend',
    desc: 'The JavaScript backend: the single-threaded event loop & runtime, Express, NestJS (Spring-style DI), and Fastify',
    sections: [
      { label: 'Runtime', pages: [
        { title: 'Runtime & the Event Loop',     file: 'node-fundamentals-visualizer.html',         level: 'beginner' },
      ]},
      { label: 'Web Frameworks', pages: [
        { title: 'Express — Middleware & Routing', file: 'node-express-visualizer.html',             level: 'beginner' },
        { title: 'NestJS — Spring-style DI',      file: 'node-nestjs-visualizer.html',              level: 'intermediate' },
        { title: 'Fastify — Schemas & Hooks',     file: 'node-fastify-visualizer.html',             level: 'intermediate' },
      ]},
      { label: 'Data Layer', pages: [
        { title: 'Talking to a Database (pg & Prisma)', file: 'node-database-visualizer.html',      level: 'intermediate' },
      ]},
      { label: 'Auth & Security', pages: [
        { title: 'Auth — JWT, Sessions & Middleware', file: 'node-auth-visualizer.html',           level: 'intermediate' },
      ]},
    ]
  },
  {
    id: 'csharp', icon: '🟣', label: 'C# & .NET',
    desc: 'Microsoft\'s Spring-cousin stack: C# for Java devs, ASP.NET Core (pipeline + DI), async/await, and Entity Framework Core',
    sections: [
      { label: 'Language', pages: [
        { title: 'C# for a Java Developer',      file: 'csharp-fundamentals-visualizer.html',       level: 'beginner' },
        { title: 'async / await & Tasks',        file: 'csharp-async-visualizer.html',              level: 'intermediate' },
      ]},
      { label: 'ASP.NET Core', pages: [
        { title: 'Pipeline, DI & Endpoints',     file: 'aspnet-core-visualizer.html',               level: 'intermediate' },
        { title: 'Entity Framework Core',        file: 'entity-framework-visualizer.html',          level: 'intermediate' },
      ]},
      { label: 'Auth & Security', pages: [
        { title: 'Auth — JWT Bearer, Policies & Claims', file: 'aspnet-auth-visualizer.html',       level: 'intermediate' },
      ]},
    ]
  },
  {
    id: 'go', icon: '🐿️', label: 'Go',
    desc: 'Go types, goroutines, interfaces, error handling, HTTP servers, and generics',
    sections: [
      { label: 'Core Language', pages: [
        { title: 'Go Fundamentals',              file: 'go-fundamentals-visualizer.html',            level: 'beginner' },
        { title: 'Structs & Methods',            file: 'go-structs-methods-visualizer.html',         level: 'beginner' },
        { title: 'Goroutines & Channels',        file: 'go-goroutines-channels-visualizer.html',     level: 'intermediate' },
        { title: 'Interfaces & Embedding',       file: 'go-interfaces-visualizer.html',              level: 'intermediate' },
        { title: 'Error Handling',               file: 'go-error-handling-visualizer.html',          level: 'intermediate' },
        { title: 'defer, panic & recover',       file: 'go-defer-panic-recover-visualizer.html',     level: 'intermediate' },
      ]},
      { label: 'Concurrency & Runtime', pages: [
        { title: 'The context Package',          file: 'go-context-visualizer.html',                 level: 'intermediate' },
        { title: 'sync & Worker Pools',          file: 'go-sync-visualizer.html',                    level: 'intermediate' },
        { title: 'Runtime: Scheduler & GC',      file: 'go-runtime-visualizer.html',                 level: 'advanced' },
      ]},
      { label: 'HTTP & Systems', pages: [
        { title: 'HTTP Server & Middleware',     file: 'go-http-server-visualizer.html',             level: 'intermediate' },
        { title: 'Web Frameworks (Gin/Echo/Fiber)', file: 'go-web-frameworks-visualizer.html',       level: 'intermediate' },
        { title: 'gRPC & Protocol Buffers',      file: 'go-grpc-visualizer.html',                    level: 'advanced' },
        { title: 'Generics (Go 1.18+)',          file: 'go-generics-visualizer.html',                level: 'advanced' },
      ]},
      { label: 'Standard Library & Data', pages: [
        { title: 'Standard Library Tour',        file: 'go-stdlib-visualizer.html',                  level: 'intermediate' },
        { title: 'database/sql',                 file: 'go-database-sql-visualizer.html',            level: 'intermediate' },
      ]},
      { label: 'Testing & Tooling', pages: [
        { title: 'Packages & Modules',           file: 'go-packages-modules-visualizer.html',        level: 'beginner' },
        { title: 'Testing',                      file: 'go-testing-visualizer.html',                 level: 'intermediate' },
      ]},
    ]
  },
  {
    id: 'php', icon: '🐘', label: 'PHP & Laravel',
    desc: 'PHP’s shared-nothing request model and the Laravel framework: lifecycle, routing, middleware, and Eloquent ORM',
    sections: [
      { label: 'Language & Runtime', pages: [
        { title: 'PHP Fundamentals & the Request Model', file: 'php-fundamentals-visualizer.html',    level: 'beginner' },
      ]},
      { label: 'Laravel', pages: [
        { title: 'Laravel — Lifecycle, Eloquent & Middleware', file: 'laravel-visualizer.html',  level: 'intermediate' },
      ]},
    ]
  },
  {
    id: 'ruby', icon: '💎', label: 'Ruby & Rails',
    desc: 'Ruby’s pure-object model (everything is a message, blocks, mixins, duck typing) and the Rails framework: lifecycle, Active Record, MVC',
    sections: [
      { label: 'Language & Object Model', pages: [
        { title: 'Ruby Fundamentals & the Object Model', file: 'ruby-fundamentals-visualizer.html', level: 'beginner' },
      ]},
      { label: 'Ruby on Rails', pages: [
        { title: 'Rails — Lifecycle, Active Record & MVC', file: 'rails-visualizer.html',  level: 'intermediate' },
      ]},
    ]
  },
  {
    id: 'rust', icon: '🦀', label: 'Rust',
    desc: 'Rust’s ownership, borrowing & the borrow checker (memory safety without a GC), then the async web stack — Tokio & Axum',
    sections: [
      { label: 'Core Language', pages: [
        { title: 'Ownership, Borrowing & the Borrow Checker', file: 'rust-fundamentals-visualizer.html', level: 'beginner' },
      ]},
      { label: 'Async & Web', pages: [
        { title: 'Web — Axum, Tokio & Type-Driven Handlers', file: 'rust-web-visualizer.html',  level: 'intermediate' },
      ]},
    ]
  },
  {
    id: 'stacks', icon: '🏗️', label: 'Full-Stack Stacks',
    desc: 'How the layers combine into real stacks: SPA + REST (Angular + Spring), MERN, server-rendered monoliths (Rails/Laravel), and compiled API + SPA (Go/Rust)',
    sections: [
      { label: 'Putting It Together', pages: [
        { title: 'Full-Stack Web Stacks Compared', file: 'web-stacks-visualizer.html', level: 'intermediate' },
        { title: 'Full-Stack Round-Trip (deep)', file: 'fullstack-request-roundtrip-deep-visualizer.html', level: 'advanced' },
        { title: 'From git push to Production (capstone)', file: 'production-deployment-visualizer.html', level: 'intermediate' },
      ]},
    ]
  },
  {
    id: 'mulesoft', icon: '🔌', label: 'MuleSoft',
    desc: 'Enterprise integration with Anypoint: Mule flows, the Mule Event & DataWeave, then API-led connectivity and the Anypoint API Gateway',
    sections: [
      { label: 'Mule Runtime', pages: [
        { title: 'Flows, the Mule Event & DataWeave', file: 'mulesoft-fundamentals-visualizer.html', level: 'beginner' },
      ]},
      { label: 'Anypoint Platform', pages: [
        { title: 'API-Led Connectivity & the Gateway', file: 'mulesoft-api-led-visualizer.html', level: 'intermediate' },
      ]},
    ]
  },
  {
    id: 'kubernetes', icon: '⎈', label: 'Kubernetes',
    desc: 'Container orchestration: pods, deployments, services, config, and Helm charts',
    sections: [
      { label: 'Core Concepts', pages: [
        { title: 'Kubernetes Fundamentals',       file: 'kubernetes-fundamentals-visualizer.html',          level: 'beginner' },
        { title: 'Deployments & Scaling',         file: 'kubernetes-deployments-visualizer.html',           level: 'intermediate' },
        { title: 'Services & Networking',         file: 'kubernetes-services-networking-visualizer.html',   level: 'intermediate' },
        { title: 'ConfigMaps & Secrets',          file: 'kubernetes-config-secrets-visualizer.html',        level: 'intermediate' },
        { title: 'RBAC & Service Accounts',       file: 'kubernetes-rbac-visualizer.html',                  level: 'intermediate' },
      ]},
      { label: 'Production', pages: [
        { title: 'Spring Boot on Kubernetes',     file: 'kubernetes-spring-boot-visualizer.html',           level: 'advanced' },
        { title: 'Helm Charts',                   file: 'kubernetes-helm-visualizer.html',                  level: 'intermediate' },
      ]},
    ]
  },
  {
    id: 'devops', icon: '♾️', label: 'DevOps & CI/CD',
    desc: 'Ship code automatically and provision infra from code: CI/CD pipelines (GitHub Actions), Infrastructure as Code (Terraform), and deploying a real Spring Boot + Angular stack on Render',
    sections: [
      { label: 'Delivery', pages: [
        { title: 'CI/CD Pipelines (GitHub Actions)', file: 'devops-cicd-pipeline-visualizer.html',           level: 'beginner' },
        { title: 'Deployment Strategies (Blue-Green, Canary, Flags, GitOps)', file: 'devops-deployment-strategies-visualizer.html', level: 'intermediate' },
      ]},
      { label: 'Infrastructure as Code', pages: [
        { title: 'Terraform — plan / apply / state',  file: 'devops-iac-terraform-visualizer.html',           level: 'intermediate' },
      ]},
      { label: 'Deploying on Render', pages: [
        { title: 'Render — from git push to live URL', file: 'render-deploys-visualizer.html',                level: 'beginner' },
        { title: 'Blueprints (render.yaml)',       file: 'render-blueprints-visualizer.html',                 level: 'intermediate' },
        { title: 'Postgres, Env Vars & Secrets',   file: 'render-databases-env-visualizer.html',              level: 'intermediate' },
        { title: 'Spring Boot + Angular on Render', file: 'render-spring-angular-visualizer.html',            level: 'advanced' },
      ]},
    ]
  },
  {
    id: 'sql', icon: '🗄️', label: 'SQL & Databases',
    desc: 'SQL fundamentals, indexes, transactions, advanced queries, normalization, and PostgreSQL',
    sections: [
      { label: 'Fundamentals', pages: [
        { title: 'SQL Fundamentals',              file: 'sql-fundamentals-visualizer.html',                 level: 'beginner' },
        { title: 'Indexes & Query Plans',         file: 'sql-indexes-visualizer.html',                      level: 'intermediate' },
        { title: 'Transactions & ACID',           file: 'sql-transactions-visualizer.html',                 level: 'intermediate' },
      ]},
      { label: 'Advanced', pages: [
        { title: 'Advanced Queries (CTE, Window)', file: 'sql-advanced-queries-visualizer.html',            level: 'intermediate' },
        { title: 'Database Normalization',        file: 'sql-normalization-visualizer.html',                level: 'intermediate' },
        { title: 'PostgreSQL Deep Dive',          file: 'sql-postgres-visualizer.html',                     level: 'advanced' },
        { title: 'Replication & High Availability', file: 'sql-replication-visualizer.html',                level: 'advanced' },
        { title: 'Partitioning & Sharding',       file: 'sql-partitioning-visualizer.html',                 level: 'advanced' },
      ]},
      { label: 'NoSQL', pages: [
        { title: 'Redis (Cache, Key-Value, Pub/Sub)', file: 'nosql-redis-visualizer.html',                  level: 'intermediate' },
        { title: 'Document & Wide-Column Stores',  file: 'nosql-document-wide-column-visualizer.html',      level: 'intermediate' },
      ]},
    ]
  },
  {
    id: 'shell', icon: '⌨️', label: 'Shell & Scripting',
    desc: 'The command line for real work — navigation, Bash scripting, PowerShell objects, and Windows CMD/batch, shown side by side',
    sections: [
      { label: 'Foundations', pages: [
        { title: 'CLI Basics',                    file: 'shell-cli-basics-visualizer.html',                 level: 'beginner' },
      ]},
      { label: 'The Three Shells', pages: [
        { title: 'Bash Scripting (.sh)',          file: 'shell-bash-visualizer.html',                       level: 'beginner' },
        { title: 'PowerShell',                    file: 'shell-powershell-visualizer.html',                 level: 'intermediate' },
        { title: 'CMD & Batch Files',             file: 'shell-cmd-visualizer.html',                        level: 'beginner' },
      ]},
      { label: 'Cloud CLIs', pages: [
        { title: 'The AWS CLI',                   file: 'shell-aws-cli-visualizer.html',                    level: 'intermediate' },
        { title: 'The Azure CLI (az)',            file: 'shell-azure-cli-visualizer.html',                  level: 'intermediate' },
        { title: 'The gcloud CLI',                file: 'shell-gcloud-cli-visualizer.html',                 level: 'intermediate' },
      ]},
    ]
  },
  {
    id: 'exam-prep', icon: '🎓', label: 'Exam Prep — Practice Tests',
    desc: 'Timed, scored practice exams with per-domain breakdowns and instant explanations — measure your certification readiness, not just your reading',
    sections: [
      { label: 'Your readiness', pages: [
        { title: 'Readiness Dashboard',           file: 'exam-readiness.html',                              level: 'beginner' },
        { title: 'Learning Paths',                file: 'learning-paths.html',                              level: 'beginner' },
        { title: 'My Notebook 📓',                file: 'notebook.html',                                    level: 'beginner' },
      ]},
      { label: 'Cloud Certifications', pages: [
        { title: 'AWS Cloud Practitioner',        file: 'exam-aws-practitioner.html',                       level: 'beginner' },
        { title: 'AWS Developer Associate',       file: 'exam-aws-developer.html',                          level: 'intermediate' },
        { title: 'AWS Solutions Architect Assoc.', file: 'exam-aws-sa-associate.html',                      level: 'advanced' },
        { title: 'Azure Developer (AZ-204)',      file: 'exam-azure-developer.html',                        level: 'intermediate' },
        { title: 'GCP Associate Cloud Engineer',  file: 'exam-gcp-ace.html',                                level: 'intermediate' },
      ]},
      { label: 'Language & Framework Certifications', pages: [
        { title: 'Java SE 21 Developer (OCP)',    file: 'exam-java-ocp.html',                               level: 'intermediate' },
        { title: 'Spring Professional',           file: 'exam-spring-professional.html',                    level: 'advanced' },
        { title: 'Angular (v17+)',                file: 'exam-angular.html',                                level: 'intermediate' },
        { title: 'TypeScript',                    file: 'exam-typescript.html',                             level: 'intermediate' },
      ]},
      { label: 'Identity & Security', pages: [
        { title: 'OAuth 2.0 · OIDC · JWT',        file: 'exam-identity-access.html',                        level: 'advanced' },
      ]},
      { label: 'Developer Tools', pages: [
        { title: 'Git',                           file: 'exam-git.html',                                    level: 'beginner' },
      ]},
      { label: 'Containers & DevOps', pages: [
        { title: 'Docker',                        file: 'exam-docker.html',                                 level: 'intermediate' },
        { title: 'Kubernetes',                    file: 'exam-kubernetes.html',                             level: 'advanced' },
      ]},
      { label: 'Data & APIs', pages: [
        { title: 'SQL',                           file: 'exam-sql.html',                                    level: 'intermediate' },
        { title: 'HTTP & REST APIs',              file: 'exam-http-rest.html',                              level: 'intermediate' },
      ]},
      { label: 'Coding Interview', pages: [
        { title: 'Data Structures & Algorithms',  file: 'exam-dsa-interview.html',                          level: 'intermediate' },
      ]},
      { label: 'Zero-to-Hero Certifications', pages: [
        { title: 'Web Fundamentals',              file: 'exam-web-fundamentals.html',                      level: 'beginner' },
        { title: 'Data Science & ML',             file: 'exam-data-science.html',                          level: 'intermediate' },
        { title: 'AI / LLM Engineering',          file: 'exam-ai-engineering.html',                        level: 'intermediate' },
      ]},
      { label: 'Flashcards (spaced repetition)', pages: [
        { title: 'AWS Services',                  file: 'flashcards-aws.html',                              level: 'beginner' },
        { title: 'Azure Services',                file: 'flashcards-azure.html',                            level: 'beginner' },
        { title: 'GCP Services',                  file: 'flashcards-gcp.html',                              level: 'beginner' },
        { title: 'Big-O Cheat Sheet',             file: 'flashcards-bigo.html',                             level: 'beginner' },
        { title: 'HTTP Status Codes',             file: 'flashcards-http.html',                             level: 'beginner' },
        { title: 'Spring Annotations',            file: 'flashcards-spring.html',                           level: 'beginner' },
        { title: 'OAuth · OIDC · JWT Terms',      file: 'flashcards-oauth.html',                            level: 'intermediate' },
        { title: 'TypeScript',                    file: 'flashcards-typescript.html',                       level: 'beginner' },
        { title: 'Angular',                       file: 'flashcards-angular.html',                          level: 'beginner' },
        { title: 'SQL',                           file: 'flashcards-sql.html',                              level: 'beginner' },
        { title: 'Git Commands',                  file: 'flashcards-git.html',                              level: 'beginner' },
        { title: 'Docker',                        file: 'flashcards-docker.html',                           level: 'beginner' },
        { title: 'Kubernetes',                    file: 'flashcards-kubernetes.html',                       level: 'intermediate' },
        { title: 'Web Fundamentals',              file: 'flashcards-web-fundamentals.html',                 level: 'beginner' },
        { title: 'Data Science & ML',             file: 'flashcards-data-science.html',                     level: 'intermediate' },
        { title: 'AI / LLM Engineering',          file: 'flashcards-ai-engineering.html',                   level: 'intermediate' },
      ]},
    ]
  },
  {
    id: 'ai-dev', icon: '🤖', label: 'AI-Assisted Development',
    desc: 'How AI coding assistants actually work: the landscape of tools, GitHub Copilot mode by mode, and Claude Code\'s plan/act/verify tool loop',
    sections: [
      { label: 'The Landscape', pages: [
        { title: 'AI Coding Assistants — The Landscape', file: 'ai-assistants-overview-visualizer.html', level: 'beginner' },
      ]},
      { label: 'Tool Deep Dives', pages: [
        { title: 'GitHub Copilot — Autocomplete to Agent', file: 'github-copilot-visualizer.html',        level: 'intermediate' },
        { title: 'Claude Code — Plan, Act, Verify',        file: 'claude-code-visualizer.html',           level: 'intermediate' },
      ]},
    ]
  },
];

/* ==== GENERATED: lesson → practice map (tmp_genpracticemap.mjs) ==== */
/* Derived from the banks by tmp_genpracticemap.mjs — do not hand-edit; run the
   generator instead. `node tmp_genpracticemap.mjs --check` fails if this is stale. */
window.DEVHUB_PRACTICE = {"titles":{"exam-ai-engineering.html":"AI / LLM Engineering","exam-angular.html":"Angular","exam-aws-developer.html":"AWS Developer Associate","exam-azure-developer.html":"Azure Developer (AZ-204)","exam-data-science.html":"Data Science &amp; ML","exam-docker.html":"Docker","exam-dsa-interview.html":"Coding Interview","exam-gcp-ace.html":"Google Cloud Associate Cloud Engineer (ACE)","exam-git.html":"Git","exam-http-rest.html":"HTTP &amp; REST APIs","exam-identity-access.html":"Identity &amp; Access","exam-java-ocp.html":"Java SE 21 Developer (OCP)","exam-kubernetes.html":"Kubernetes","exam-spring-professional.html":"Spring Professional","exam-sql.html":"SQL","exam-typescript.html":"TypeScript","exam-web-fundamentals.html":"Web Fundamentals","practice-arrays-strings.html":"Arrays &amp; Strings","practice-backtracking.html":"Backtracking","practice-dynamic-programming.html":"Dynamic Programming","practice-graphs.html":"Graphs","practice-hashmaps-sets.html":"Hashmaps &amp; Sets","practice-linked-lists.html":"Linked Lists","practice-sorting-searching.html":"Sorting &amp; Searching","practice-stacks-queues.html":"Stacks &amp; Queues","practice-trees.html":"Trees","flashcards-aws.html":"AWS Services","flashcards-azure.html":"Azure Services","flashcards-gcp.html":"GCP Services","flashcards-bigo.html":"Big-O Cheat Sheet","flashcards-http.html":"HTTP Status Codes","flashcards-spring.html":"Spring Annotations","flashcards-oauth.html":"OAuth 2.0","flashcards-typescript.html":"TypeScript","flashcards-angular.html":"Angular","flashcards-sql.html":"SQL","flashcards-git.html":"Git Commands","flashcards-docker.html":"Docker","flashcards-kubernetes.html":"Kubernetes","flashcards-web-fundamentals.html":"Web Fundamentals","flashcards-data-science.html":"Data Science &amp; ML","flashcards-ai-engineering.html":"AI / LLM Engineering"},"map":{"genai-transformers-attention-visualizer.html":{"exam":"exam-ai-engineering.html","deck":"flashcards-ai-engineering.html"},"genai-how-llms-work-visualizer.html":{"exam":"exam-ai-engineering.html","deck":"flashcards-ai-engineering.html"},"genai-prompt-engineering-visualizer.html":{"exam":"exam-ai-engineering.html","deck":"flashcards-ai-engineering.html"},"genai-embeddings-vector-db-visualizer.html":{"exam":"exam-ai-engineering.html","deck":"flashcards-ai-engineering.html"},"genai-rag-visualizer.html":{"exam":"exam-ai-engineering.html","deck":"flashcards-ai-engineering.html"},"genai-tool-calling-agents-visualizer.html":{"exam":"exam-ai-engineering.html","deck":"flashcards-ai-engineering.html"},"genai-llm-api-integration-visualizer.html":{"exam":"exam-ai-engineering.html","deck":"flashcards-ai-engineering.html"},"genai-finetuning-llmops-visualizer.html":{"exam":"exam-ai-engineering.html","deck":"flashcards-ai-engineering.html"},"genai-safety-guardrails-visualizer.html":{"exam":"exam-ai-engineering.html","deck":"flashcards-ai-engineering.html"},"angular-components-visualizer.html":{"exam":"exam-angular.html","deck":"flashcards-angular.html"},"angular-binding-visualizer.html":{"exam":"exam-angular.html","deck":"flashcards-angular.html"},"angular-communication-visualizer.html":{"exam":"exam-angular.html","deck":"flashcards-angular.html"},"angular-control-flow-visualizer.html":{"exam":"exam-angular.html","deck":"flashcards-angular.html"},"angular-content-projection-visualizer.html":{"exam":"exam-angular.html","deck":"flashcards-angular.html"},"angular-lifecycle-visualizer.html":{"exam":"exam-angular.html","deck":"flashcards-angular.html"},"angular-viewchild-visualizer.html":{"exam":"exam-angular.html","deck":"flashcards-angular.html"},"angular-signals-visualizer.html":{"exam":"exam-angular.html","deck":"flashcards-angular.html"},"angular-change-detection-visualizer.html":{"exam":"exam-angular.html","deck":"flashcards-angular.html"},"angular-change-detection-deep-visualizer.html":{"exam":"exam-angular.html","deck":"flashcards-angular.html"},"angular-zoneless-mode-visualizer.html":{"exam":"exam-angular.html","deck":"flashcards-angular.html"},"angular-services-visualizer.html":{"exam":"exam-angular.html","deck":"flashcards-angular.html"},"angular-di-advanced-visualizer.html":{"exam":"exam-angular.html","deck":"flashcards-angular.html"},"angular-di-hierarchy-deep-visualizer.html":{"exam":"exam-angular.html","deck":"flashcards-angular.html"},"angular-rxjs-visualizer.html":{"exam":"exam-angular.html","deck":"flashcards-angular.html"},"angular-rxjs-flattening-deep-visualizer.html":{"exam":"exam-angular.html","deck":"flashcards-angular.html"},"angular-debugging-rxjs-deep-visualizer.html":{"exam":"exam-angular.html","deck":"flashcards-angular.html"},"angular-routing-visualizer.html":{"exam":"exam-angular.html","deck":"flashcards-angular.html"},"angular-lazy-loading-visualizer.html":{"exam":"exam-angular.html","deck":"flashcards-angular.html"},"angular-route-guards-deep-visualizer.html":{"exam":"exam-angular.html","deck":"flashcards-angular.html"},"angular-forms-visualizer.html":{"exam":"exam-angular.html","deck":"flashcards-angular.html"},"angular-forms-data-deep-visualizer.html":{"exam":"exam-angular.html","deck":"flashcards-angular.html"},"angular-http-visualizer.html":{"exam":"exam-angular.html","deck":"flashcards-angular.html"},"angular-interceptors-advanced-visualizer.html":{"exam":"exam-angular.html","deck":"flashcards-angular.html"},"aws-s3-visualizer.html":{"exam":"exam-aws-developer.html","deck":"flashcards-aws.html"},"aws-lambda-visualizer.html":{"exam":"exam-aws-developer.html","deck":"flashcards-aws.html"},"aws-ec2-visualizer.html":{"exam":"exam-aws-developer.html","deck":"flashcards-aws.html"},"aws-rds-visualizer.html":{"exam":"exam-aws-developer.html","deck":"flashcards-aws.html"},"nosql-document-wide-column-visualizer.html":{"exam":"exam-aws-developer.html","deck":"flashcards-aws.html"},"aws-api-gateway-visualizer.html":{"exam":"exam-aws-developer.html","deck":"flashcards-aws.html"},"aws-iam-visualizer.html":{"exam":"exam-aws-developer.html","deck":"flashcards-aws.html"},"aws-vpc-visualizer.html":{"exam":"exam-aws-developer.html","deck":"flashcards-aws.html"},"aws-load-balancing-visualizer.html":{"exam":"exam-aws-developer.html","deck":"flashcards-aws.html"},"aws-ecs-visualizer.html":{"exam":"exam-aws-developer.html","deck":"flashcards-aws.html"},"aws-iac-visualizer.html":{"exam":"exam-aws-developer.html","deck":"flashcards-aws.html"},"devops-deployment-strategies-visualizer.html":{"exam":"exam-aws-developer.html","deck":"flashcards-aws.html"},"devops-cicd-pipeline-visualizer.html":{"exam":"exam-aws-developer.html","deck":"flashcards-aws.html"},"aws-cloudwatch-visualizer.html":{"exam":"exam-aws-developer.html","deck":"flashcards-aws.html"},"aws-overview-visualizer.html":{"exam":"exam-aws-developer.html","deck":"flashcards-aws.html"},"aws-cost-visualizer.html":{"exam":"exam-aws-developer.html","deck":"flashcards-aws.html"},"azure-overview-visualizer.html":{"exam":"exam-azure-developer.html","deck":"flashcards-azure.html"},"azure-app-service-visualizer.html":{"exam":"exam-azure-developer.html","deck":"flashcards-azure.html"},"azure-functions-visualizer.html":{"exam":"exam-azure-developer.html","deck":"flashcards-azure.html"},"azure-containers-visualizer.html":{"exam":"exam-azure-developer.html","deck":"flashcards-azure.html"},"azure-storage-visualizer.html":{"exam":"exam-azure-developer.html","deck":"flashcards-azure.html"},"azure-cosmos-visualizer.html":{"exam":"exam-azure-developer.html","deck":"flashcards-azure.html"},"azure-keyvault-identity-visualizer.html":{"exam":"exam-azure-developer.html","deck":"flashcards-azure.html"},"datasci-numpy-pandas-visualizer.html":{"exam":"exam-data-science.html","deck":"flashcards-data-science.html"},"datasci-data-cleaning-eda-visualizer.html":{"exam":"exam-data-science.html","deck":"flashcards-data-science.html"},"datasci-visualization-visualizer.html":{"exam":"exam-data-science.html","deck":"flashcards-data-science.html"},"datasci-ml-fundamentals-visualizer.html":{"exam":"exam-data-science.html","deck":"flashcards-data-science.html"},"datasci-regression-classification-visualizer.html":{"exam":"exam-data-science.html","deck":"flashcards-data-science.html"},"datasci-model-evaluation-visualizer.html":{"exam":"exam-data-science.html","deck":"flashcards-data-science.html"},"datasci-clustering-pca-visualizer.html":{"exam":"exam-data-science.html","deck":"flashcards-data-science.html"},"datasci-neural-networks-visualizer.html":{"exam":"exam-data-science.html","deck":"flashcards-data-science.html"},"datasci-deep-learning-pytorch-visualizer.html":{"exam":"exam-data-science.html","deck":"flashcards-data-science.html"},"docker-images-containers-visualizer.html":{"exam":"exam-docker.html","deck":"flashcards-docker.html"},"docker-concepts-visualizer.html":{"exam":"exam-docker.html","deck":"flashcards-docker.html"},"docker-dockerfile-visualizer.html":{"exam":"exam-docker.html","deck":"flashcards-docker.html"},"docker-spring-boot-visualizer.html":{"exam":"exam-docker.html","deck":"flashcards-docker.html"},"docker-networking-visualizer.html":{"exam":"exam-docker.html","deck":"flashcards-docker.html"},"docker-compose-visualizer.html":{"exam":"exam-docker.html","deck":"flashcards-docker.html"},"big-o-visualizer.html":{"exam":"exam-dsa-interview.html","deck":"flashcards-bigo.html"},"ds-hash-tables-visualizer.html":{"exam":"exam-dsa-interview.html","deck":"flashcards-bigo.html"},"recursion-visualizer.html":{"exam":"exam-dsa-interview.html","deck":"flashcards-bigo.html"},"ds-arrays-visualizer.html":{"exam":"exam-dsa-interview.html","deck":"flashcards-bigo.html"},"interview-arrays-strings-visualizer.html":{"exam":"exam-dsa-interview.html","practice":"practice-arrays-strings.html","deck":"flashcards-bigo.html"},"interview-hashmaps-sets-visualizer.html":{"exam":"exam-dsa-interview.html","practice":"practice-hashmaps-sets.html","deck":"flashcards-bigo.html"},"interview-linked-lists-visualizer.html":{"exam":"exam-dsa-interview.html","practice":"practice-linked-lists.html","deck":"flashcards-bigo.html"},"linked-list-visualizer.html":{"exam":"exam-dsa-interview.html","deck":"flashcards-bigo.html"},"ds-linked-lists-visualizer.html":{"exam":"exam-dsa-interview.html","deck":"flashcards-bigo.html"},"interview-stacks-queues-visualizer.html":{"exam":"exam-dsa-interview.html","practice":"practice-stacks-queues.html","deck":"flashcards-bigo.html"},"stack-queue-visualizer.html":{"exam":"exam-dsa-interview.html","deck":"flashcards-bigo.html"},"bst-visualizer.html":{"exam":"exam-dsa-interview.html","deck":"flashcards-bigo.html"},"ds-trees-visualizer.html":{"exam":"exam-dsa-interview.html","deck":"flashcards-bigo.html"},"interview-trees-visualizer.html":{"exam":"exam-dsa-interview.html","practice":"practice-trees.html","deck":"flashcards-bigo.html"},"ds-heaps-visualizer.html":{"exam":"exam-dsa-interview.html","deck":"flashcards-bigo.html"},"interview-graphs-visualizer.html":{"exam":"exam-dsa-interview.html","practice":"practice-graphs.html","deck":"flashcards-bigo.html"},"ds-graphs-advanced-visualizer.html":{"exam":"exam-dsa-interview.html","deck":"flashcards-bigo.html"},"ds-disjoint-sets-visualizer.html":{"exam":"exam-dsa-interview.html","deck":"flashcards-bigo.html"},"graph-visualizer.html":{"exam":"exam-dsa-interview.html","deck":"flashcards-bigo.html"},"sorting-visualizer.html":{"exam":"exam-dsa-interview.html","deck":"flashcards-bigo.html"},"searching-visualizer.html":{"exam":"exam-dsa-interview.html","deck":"flashcards-bigo.html"},"interview-sorting-searching-visualizer.html":{"exam":"exam-dsa-interview.html","practice":"practice-sorting-searching.html","deck":"flashcards-bigo.html"},"interview-backtracking-visualizer.html":{"exam":"exam-dsa-interview.html","practice":"practice-backtracking.html","deck":"flashcards-bigo.html"},"interview-dynamic-programming-visualizer.html":{"exam":"exam-dsa-interview.html","practice":"practice-dynamic-programming.html","deck":"flashcards-bigo.html"},"ds-dynamic-programming-visualizer.html":{"exam":"exam-dsa-interview.html","deck":"flashcards-bigo.html"},"gcp-overview-visualizer.html":{"exam":"exam-gcp-ace.html","deck":"flashcards-gcp.html"},"gcp-compute-engine-visualizer.html":{"exam":"exam-gcp-ace.html","deck":"flashcards-gcp.html"},"gcp-gke-visualizer.html":{"exam":"exam-gcp-ace.html","deck":"flashcards-gcp.html"},"gcp-serverless-visualizer.html":{"exam":"exam-gcp-ace.html","deck":"flashcards-gcp.html"},"gcp-storage-visualizer.html":{"exam":"exam-gcp-ace.html","deck":"flashcards-gcp.html"},"gcp-databases-visualizer.html":{"exam":"exam-gcp-ace.html","deck":"flashcards-gcp.html"},"gcp-iam-secrets-visualizer.html":{"exam":"exam-gcp-ace.html","deck":"flashcards-gcp.html"},"git-visualizer.html":{"exam":"exam-git.html","deck":"flashcards-git.html"},"git-branching-visualizer.html":{"exam":"exam-git.html","deck":"flashcards-git.html"},"git-collaboration-visualizer.html":{"exam":"exam-git.html","deck":"flashcards-git.html"},"git-rebase-visualizer.html":{"exam":"exam-git.html","deck":"flashcards-git.html"},"git-advanced-visualizer.html":{"exam":"exam-git.html","deck":"flashcards-git.html"},"http-rest-visualizer.html":{"exam":"exam-http-rest.html","deck":"flashcards-http.html"},"fullstack-request-roundtrip-deep-visualizer.html":{"exam":"exam-http-rest.html","deck":"flashcards-http.html"},"spring-boot-rest-api-visualizer.html":{"exam":"exam-http-rest.html","deck":"flashcards-http.html"},"debugging-auth-401-403-visualizer.html":{"exam":"exam-http-rest.html","deck":"flashcards-http.html"},"spring-boot-validation-visualizer.html":{"exam":"exam-http-rest.html","deck":"flashcards-http.html"},"debugging-stack-traces-visualizer.html":{"exam":"exam-http-rest.html","deck":"flashcards-http.html"},"spring-boot-pagination-visualizer.html":{"exam":"exam-http-rest.html","deck":"flashcards-http.html"},"debugging-cors-visualizer.html":{"exam":"exam-http-rest.html","deck":"flashcards-http.html"},"debugging-jwt-visualizer.html":{"exam":"exam-http-rest.html","deck":"flashcards-http.html"},"entra-oauth-oidc-visualizer.html":{"exam":"exam-identity-access.html","deck":"flashcards-oauth.html"},"spring-boot-oauth2-resource-server-visualizer.html":{"exam":"exam-identity-access.html","deck":"flashcards-oauth.html"},"ping-oauth-visualizer.html":{"exam":"exam-identity-access.html","deck":"flashcards-oauth.html"},"spring-boot-idm-oauth2-deep-visualizer.html":{"exam":"exam-identity-access.html","deck":"flashcards-oauth.html"},"angular-token-lifecycle-deep-visualizer.html":{"exam":"exam-identity-access.html","deck":"flashcards-oauth.html"},"entra-jwt-tokens-visualizer.html":{"exam":"exam-identity-access.html","deck":"flashcards-oauth.html"},"angular-oidc-login-deep-visualizer.html":{"exam":"exam-identity-access.html","deck":"flashcards-oauth.html"},"jwt-playground-visualizer.html":{"exam":"exam-identity-access.html","deck":"flashcards-oauth.html"},"identity-keys-signing-deep-visualizer.html":{"exam":"exam-identity-access.html","deck":"flashcards-oauth.html"},"auth-identity-live-visualizer.html":{"exam":"exam-identity-access.html","deck":"flashcards-oauth.html"},"polymorphism-visualizer.html":{"exam":"exam-java-ocp.html"},"collections-visualizer.html":{"exam":"exam-java-ocp.html"},"abstraction-visualizer.html":{"exam":"exam-java-ocp.html"},"generics-visualizer.html":{"exam":"exam-java-ocp.html"},"streams-visualizer.html":{"exam":"exam-java-ocp.html"},"java-optional-visualizer.html":{"exam":"exam-java-ocp.html"},"concurrency-visualizer.html":{"exam":"exam-java-ocp.html"},"java-concurrency-advanced-visualizer.html":{"exam":"exam-java-ocp.html"},"exceptions-visualizer.html":{"exam":"exam-java-ocp.html"},"java-records-sealed-visualizer.html":{"exam":"exam-java-ocp.html"},"modern-java-visualizer.html":{"exam":"exam-java-ocp.html"},"java-variables-types-visualizer.html":{"exam":"exam-java-ocp.html"},"java-strings-visualizer.html":{"exam":"exam-java-ocp.html"},"java-functional-visualizer.html":{"exam":"exam-java-ocp.html"},"kubernetes-fundamentals-visualizer.html":{"exam":"exam-kubernetes.html","deck":"flashcards-kubernetes.html"},"kubernetes-deployments-visualizer.html":{"exam":"exam-kubernetes.html","deck":"flashcards-kubernetes.html"},"kubernetes-spring-boot-visualizer.html":{"exam":"exam-kubernetes.html","deck":"flashcards-kubernetes.html"},"kubernetes-services-networking-visualizer.html":{"exam":"exam-kubernetes.html","deck":"flashcards-kubernetes.html"},"kubernetes-config-secrets-visualizer.html":{"exam":"exam-kubernetes.html","deck":"flashcards-kubernetes.html"},"kubernetes-helm-visualizer.html":{"exam":"exam-kubernetes.html","deck":"flashcards-kubernetes.html"},"spring-boot-di-ioc-visualizer.html":{"exam":"exam-spring-professional.html","deck":"flashcards-spring.html"},"spring-boot-bean-lifecycle-visualizer.html":{"exam":"exam-spring-professional.html","deck":"flashcards-spring.html"},"spring-boot-debugging-proxies-deep-visualizer.html":{"exam":"exam-spring-professional.html","deck":"flashcards-spring.html"},"spring-boot-transactions-visualizer.html":{"exam":"exam-spring-professional.html","deck":"flashcards-spring.html"},"spring-boot-transactions-deep-visualizer.html":{"exam":"exam-spring-professional.html","deck":"flashcards-spring.html"},"spring-boot-jpa-fetching-deep-visualizer.html":{"exam":"exam-spring-professional.html","deck":"flashcards-spring.html"},"spring-boot-data-jpa-visualizer.html":{"exam":"exam-spring-professional.html","deck":"flashcards-spring.html"},"spring-boot-auto-configuration-deep-visualizer.html":{"exam":"exam-spring-professional.html","deck":"flashcards-spring.html"},"spring-boot-architecture-visualizer.html":{"exam":"exam-spring-professional.html","deck":"flashcards-spring.html"},"spring-boot-configuration-visualizer.html":{"exam":"exam-spring-professional.html","deck":"flashcards-spring.html"},"spring-boot-profiles-visualizer.html":{"exam":"exam-spring-professional.html","deck":"flashcards-spring.html"},"spring-boot-actuator-visualizer.html":{"exam":"exam-spring-professional.html","deck":"flashcards-spring.html"},"spring-boot-request-lifecycle-visualizer.html":{"exam":"exam-spring-professional.html","deck":"flashcards-spring.html"},"spring-boot-security-filter-chain-deep-visualizer.html":{"exam":"exam-spring-professional.html","deck":"flashcards-spring.html"},"spring-boot-security-visualizer.html":{"exam":"exam-spring-professional.html","deck":"flashcards-spring.html"},"spring-boot-method-security-deep-visualizer.html":{"exam":"exam-spring-professional.html","deck":"flashcards-spring.html"},"spring-boot-csrf-deep-visualizer.html":{"exam":"exam-spring-professional.html","deck":"flashcards-spring.html"},"spring-boot-testing-visualizer.html":{"exam":"exam-spring-professional.html","deck":"flashcards-spring.html"},"sql-fundamentals-visualizer.html":{"exam":"exam-sql.html","deck":"flashcards-sql.html"},"sql-advanced-queries-visualizer.html":{"exam":"exam-sql.html","deck":"flashcards-sql.html"},"sql-normalization-visualizer.html":{"exam":"exam-sql.html","deck":"flashcards-sql.html"},"sql-indexes-visualizer.html":{"exam":"exam-sql.html","deck":"flashcards-sql.html"},"sql-postgres-visualizer.html":{"exam":"exam-sql.html","deck":"flashcards-sql.html"},"sql-transactions-visualizer.html":{"exam":"exam-sql.html","deck":"flashcards-sql.html"},"sql-replication-visualizer.html":{"exam":"exam-sql.html","deck":"flashcards-sql.html"},"sql-partitioning-visualizer.html":{"exam":"exam-sql.html","deck":"flashcards-sql.html"},"typescript-fundamentals-visualizer.html":{"exam":"exam-typescript.html","deck":"flashcards-typescript.html"},"typescript-top-bottom-types-deep-visualizer.html":{"exam":"exam-typescript.html","deck":"flashcards-typescript.html"},"typescript-structural-typing-deep-visualizer.html":{"exam":"exam-typescript.html","deck":"flashcards-typescript.html"},"typescript-inference-visualizer.html":{"exam":"exam-typescript.html","deck":"flashcards-typescript.html"},"typescript-arrays-tuples-visualizer.html":{"exam":"exam-typescript.html","deck":"flashcards-typescript.html"},"typescript-narrowing-visualizer.html":{"exam":"exam-typescript.html","deck":"flashcards-typescript.html"},"typescript-type-guards-visualizer.html":{"exam":"exam-typescript.html","deck":"flashcards-typescript.html"},"typescript-discriminated-unions-visualizer.html":{"exam":"exam-typescript.html","deck":"flashcards-typescript.html"},"typescript-narrowing-cfa-deep-visualizer.html":{"exam":"exam-typescript.html","deck":"flashcards-typescript.html"},"typescript-generics-visualizer.html":{"exam":"exam-typescript.html","deck":"flashcards-typescript.html"},"typescript-generic-inference-deep-visualizer.html":{"exam":"exam-typescript.html","deck":"flashcards-typescript.html"},"typescript-keyof-indexed-deep-visualizer.html":{"exam":"exam-typescript.html","deck":"flashcards-typescript.html"},"typescript-declarations-visualizer.html":{"exam":"exam-typescript.html","deck":"flashcards-typescript.html"},"typescript-object-types-deep-visualizer.html":{"exam":"exam-typescript.html","deck":"flashcards-typescript.html"},"typescript-utility-types-visualizer.html":{"exam":"exam-typescript.html","deck":"flashcards-typescript.html"},"typescript-mapped-types-visualizer.html":{"exam":"exam-typescript.html","deck":"flashcards-typescript.html"},"typescript-conditional-types-visualizer.html":{"exam":"exam-typescript.html","deck":"flashcards-typescript.html"},"typescript-template-literal-types-visualizer.html":{"exam":"exam-typescript.html","deck":"flashcards-typescript.html"},"typescript-functions-overloads-deep-visualizer.html":{"exam":"exam-typescript.html","deck":"flashcards-typescript.html"},"typescript-functions-visualizer.html":{"exam":"exam-typescript.html","deck":"flashcards-typescript.html"},"typescript-why-visualizer.html":{"exam":"exam-typescript.html","deck":"flashcards-typescript.html"},"typescript-modules-visualizer.html":{"exam":"exam-typescript.html","deck":"flashcards-typescript.html"},"web-html-fundamentals-visualizer.html":{"exam":"exam-web-fundamentals.html","deck":"flashcards-web-fundamentals.html"},"web-css-fundamentals-visualizer.html":{"exam":"exam-web-fundamentals.html","deck":"flashcards-web-fundamentals.html"},"web-css-layout-visualizer.html":{"exam":"exam-web-fundamentals.html","deck":"flashcards-web-fundamentals.html"},"web-js-fundamentals-visualizer.html":{"exam":"exam-web-fundamentals.html","deck":"flashcards-web-fundamentals.html"},"web-dom-events-visualizer.html":{"exam":"exam-web-fundamentals.html","deck":"flashcards-web-fundamentals.html"},"web-js-async-visualizer.html":{"exam":"exam-web-fundamentals.html","deck":"flashcards-web-fundamentals.html"},"web-browser-rendering-visualizer.html":{"exam":"exam-web-fundamentals.html","deck":"flashcards-web-fundamentals.html"}}};
/* ==== END GENERATED ==== */
