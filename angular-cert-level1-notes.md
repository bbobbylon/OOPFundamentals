# Angular Developer Certification — Level 1 Training Notes

**Source:** certificates.dev › Angular › Dashboard › Training › Level 1
**Captured:** 2026-07-12 · **Progress at capture:** 28 / 28 (complete)
**Account:** Robert Oliver Jr (robeoliver@deloitte.com)

> **What this is.** Level 1 is the **knowledge / "junior developer"** track: **7 chapters,
> 28 items**, made of **lessons + pop quizzes only — there are NO coding challenges**
> (those are Level 2's hands-on "developer" track). The topics are the same fundamentals
> as Level 2 but abbreviated; every resource link here is a **subset** of the Level 2 set.
>
> Because the teaching content overlaps almost entirely with Level 2, this file keeps the
> **Level 1 structure, its own pop-quiz question list, and each lesson's links**, with
> concise notes and a pointer to the deeper write-up for shared topics:
> **➡ see [`angular-cert-level2-notes.md`](angular-cert-level2-notes.md) for full notes.**

**Legend:** 📄 docs · ✉️ angulartraining newsletter · 📝 blog (Medium wall) · 🌐 MDN/TS · 🎯 pop quiz

---

## Level 1 vs Level 2 at a glance

| | **Level 1 (this file)** | **Level 2** |
|---|---|---|
| Positioning | Recognize Angular **knowledge** | Prove Angular **development** skill |
| Chapters | **7** | **9** |
| Items | 28 | 49 |
| Format | Lessons + **pop quizzes only** | Lessons + quizzes + **coding challenges** |
| Chapter 9 | — | Tesla "Car Configurator" build |
| Exam coding | minimal | StackBlitz coding tasks |

Level 1 chapter map: **0** Start Here · **1** Basics of Angular · **2** Angular Components · **3** TypeScript Essentials · **4** Directives & Pipes · **5** Services & DI · **6** Angular Router · **7** Angular Forms. (Level 2 splits TS/JS into its own chapter, adds RxJS as a standalone chapter, and adds the challenge roundup.)

---

## Chapter 0 — Start Here
- **Welcome** only (no "What do I need?" setup lesson — that's Level 2). 7 chapters, sequential order recommended; Discord community + "Submit Feedback".

---

## Chapter 1 — Basics of Angular

**Lessons:** AngularJS vs Angular · The Angular CLI · Conventions & Style Guide · Features of the framework · Angular Modules and Standalone. **Two pop quizzes.**

**Links:**
- 📄 Release history — <https://github.com/angular/angular/releases>
- 📄 CLI command reference — <https://angular.dev/cli> · 📄 Intro to CLI — <https://angular.dev/tools/cli> · 📄 StackBlitz — <https://stackblitz.com/>
- 📄 Style guide — <https://angular.dev/style-guide>
- 📄 Overview — <https://angular.dev/overview> · ✉️ Directives vs components — <https://www.angulartraining.com/daily-newsletter/when-to-create-a-directive-vs-a-component/> · ✉️ Custom pipes — <https://www.angulartraining.com/daily-newsletter/how-to-create-custom-pipes/> · ✉️ When to use services — <https://www.angulartraining.com/daily-newsletter/using-services-to-cache-data/>
- ✉️ NgModules — <https://www.angulartraining.com/daily-newsletter/what-you-need-to-know-about-ngmodules/> · 📄 `@NgModule` — <https://angular.dev/api/core/NgModule> · ✉️ Standalone — <https://www.angulartraining.com/daily-newsletter/what-are-standalone-components/> · PDF cheatsheet — <https://www.angulartraining.com/daily-newsletter/wp-content/uploads/2023/05/Standalone-Components-Cheatsheet.pdf>

**Notes (condensed — full detail in L2 §Ch1):** AngularJS (v1) unsupported since Jan 2022; Angular = v2+ (now v22). CLI (`ng`) verbs: `new/generate/serve/build/test/add/lint/e2e/update/deploy/config/version`; **`ng serve`** compiles + serves in dev. Style guide: hyphenated file names, feature-folder structure, `inject()` over constructor DI, shared component prefix (never `ng`). Building blocks: components, templates, directives, services+DI, signals. **Standalone is the v22 default** (`standalone:true`, `imports:[]`, `bootstrapApplication`); NgModules are legacy.

### 🎯 Ch.1 pop-quiz questions
- Which CLI command compiles & serves locally in dev mode? → **`ng serve`**
- Which one is **not** a valid Angular CLI command?
- What does Angular refer to? → the modern framework (v2+)
- Which rule is part of the style-guide conventions?
- Which one of these concepts does **not** exist in Angular?
- Which of the following statements is true?
- What's the main language of Angular? → **TypeScript**
- When do we need to create or use Angular services?

---

## Chapter 2 — Angular Components

**Lessons:** Component Selector & Decorators · Expressions & Data Bindings · Control Flow with Blocks · Signals. **Two pop quizzes.**

**Links:**
- 📄 Selectors — <https://angular.dev/guide/components/selectors#choosing-a-selector> · ✉️ Selectors are CSS — <https://www.angulartraining.com/daily-newsletter/the-power-of-angular-selectors/> · 📄 Inputs — <https://angular.dev/guide/components/inputs> · 📄 Outputs — <https://angular.dev/guide/components/outputs>
- 📄 Bindings — <https://angular.dev/guide/templates/binding> · 📄 **Expression syntax** — <https://angular.dev/guide/templates/expression-syntax> · ✉️ Anti-pattern: method in template — <https://www.angulartraining.com/daily-newsletter/anti-pattern-series-calling-a-method-in-a-template/>
- 📝 New control flow — <https://blog.angulartraining.com/angular-17-new-control-flow-syntax-4fbec4772d04> · ✉️ `@let` — <https://www.angulartraining.com/daily-newsletter/let-for-local-variables-in-angular-views/> · 📄 `@if` — <https://angular.dev/guide/templates/control-flow#conditionally-display-content-with-if-else-if-and-else> · 📄 `@for` — <https://angular.dev/guide/templates/control-flow#repeat-content-with-the-for-block> · 📄 `@switch` — <https://angular.dev/guide/templates/control-flow#conditionally-display-content-with-the-switch-block>
- ✉️ Change detection illustrated — <https://www.angulartraining.com/daily-newsletter/angular-change-detection-illustrated/> · 📄 Writable signals — <https://angular.dev/guide/signals#writable-signals> · 📄 What are signals — <https://angular.dev/guide/signals#what-are-signals>

**Notes (condensed — full detail in L2 §Ch2):** Selector kinds element/attribute/class; prefix + no `ng`. `input()`/`input.required()` signals, `output()`; legacy `@Input`/`@Output`. Bindings: `[prop]`, `[attr.x]`, `[class.x]`, `[style.x]`, `(event)`, `{{ }}`. `@if/@for(track!)/@switch` replace `*ngIf/*ngFor/ngSwitch`; `@empty`, `@let`. Signals: `signal()`, `.set()`, `.update()`, `computed()` (lazy+memoized), `effect()`.

**➕ Level-1-specific detail — what template expressions may/may not contain** (from the `expression-syntax` doc):
- **Allowed:** literals (string/number/boolean/object/array/null/RegExp/template string), globals `undefined`/`$any`, `$`-locals (`$index`), operators (arithmetic, comparison, logical, `??`, optional chaining `?.`, non-null `!`, pipes `|`).
- **Not allowed:** variable/function/class **declarations**, `new`, `++`/`--`, bitwise `& | ^`, destructuring, comma operator, BigInt literals.
- **Event handlers are statements** → they **allow assignment** but **disallow pipes**. Members are `this`-implied; `?.` returns `undefined` (JS-aligned).

### 🎯 Ch.2 pop-quiz questions
- Which `@for` block option is required? → **`track`**
- Which option is **not** a valid Angular selector?
- What decorator passes data to a component? → **`@Input`** (or `input()`)
- Is there anything wrong with the following template? (usually: a **method called in the template** = anti-pattern)

---

## Chapter 3 — TypeScript Essentials

**Lessons:** TypeScript (classes, everyday types). **One pop quiz.**

**Links:** 🌐 What is TS — <https://www.typescriptlang.org/> · 🌐 Classes — <https://www.typescriptlang.org/docs/handbook/2/classes.html> · 🌐 Everyday types — <https://www.typescriptlang.org/docs/handbook/2/everyday-types.html>

**Notes (condensed — full detail in L2 §Ch3):** primitives lowercase; arrays `T[]`/`Array<T>`; optional `x?`; unions `A|B` + narrowing; literal types; `type` vs `interface`; classes (fields, `readonly`, access modifiers, **parameter properties**, getters/setters, `static`, `abstract`, generics, `implements`/`extends`). **Interface vs class:** an interface is a **compile-time-only** contract (erased at runtime, no implementation/constructor); a class is a runtime value you can instantiate and that can hold logic.

### 🎯 Ch.3 pop-quiz questions
- What is the type of the variable …? (type-inference reading)
- What is the difference between an interface and a class in TypeScript? → interface = type-only/erased; class = runtime + implementation
- Which of the following code examples does **not** compile?

---

## Chapter 4 — Directives and Pipes

**Lessons:** Basics of directives and blocks · Pipes. **One pop quiz.**

**Links:** 📄 `ngFor` — <https://angular.dev/api/common/NgFor?tab=usage-notes> · 📄 `ngIf` — <https://angular.dev/api/common/NgIf?tab=usage-notes> · 📄 Structural directives — <https://angular.dev/guide/directives/structural-directives> · 📄 Attribute directives — <https://angular.dev/guide/directives/attribute-directives> · 📄 Built-in directives — <https://angular.dev/guide/directives#built-in-attribute-directives> · 📄 Control-flow blocks — <https://angular.dev/guide/templates/control-flow> · 📄 Pipes API — <https://angular.dev/api?type=pipe#angular_common> · 📄 Pipe syntax — <https://angular.dev/guide/templates/pipes#overview> · 📄 How pipes work — <https://angular.dev/guide/templates/pipes#how-pipes-work>

**Notes (condensed — full detail in L2 §Ch4):** three directive kinds (component / attribute / structural); built-ins `NgClass`/`NgStyle`/`NgModel`; `*` desugars to `<ng-template>` (one per element). Pipes transform with `|`, built-ins (`date/currency/uppercase/async/json/percent/slice/keyvalue`), params `:`, chaining, **pure by default** (recompute only on input reference change); custom pipe = `@Pipe` + `PipeTransform.transform`.

### 🎯 Ch.4 pop-quiz questions
- Which of the following is **not** an Angular directive?
- Correct syntax for pipe parameters? → `value | pipe:arg1:arg2`
- What is a directive?
- Which pipe does **not** exist in Angular?

---

## Chapter 5 — Services and Dependency Injection

**Lessons:** Basics of Dependency Injection · Characteristics of Services. **One pop quiz.**

**Links:** 📄 Provide a dependency — <https://angular.dev/guide/di/defining-dependency-providers> · ✉️ `inject()` — <https://www.angulartraining.com/daily-newsletter/the-inject-function/> · 📄 `@Service` vs `@Injectable` — <https://angular.dev/guide/di/creating-and-using-services#when-to-use-service-vs-injectable> · ✉️ Provider config — <https://www.angulartraining.com/daily-newsletter/dependency-injection-and-provider-config/> · 📄 What are services — <https://angular.dev/essentials/dependency-injection#what-are-services> · ✉️ Too many services — <https://www.angulartraining.com/daily-newsletter/anti-pattern-series-using-too-many-services/>

**Notes (condensed — full detail in L2 §Ch5):** DI supplies dependencies; `inject()` (injection context) vs constructor DI; `providedIn:'root'` = app **singleton** (tree-shakeable); component-level provider = scoped instance; strategies `useClass/useValue/useFactory/useExisting` + tokens. Services are singletons that persist for the app's life → good for caching (BehaviorSubject / signal). `@Service` = implicit-root sugar (`inject()`-only); `@Injectable` = constructor DI / advanced providers.

### 🎯 Ch.5 pop-quiz questions
- Which decorator registers a class as a service? → **`@Injectable`**
- Can the following class be injected as-is?
- How many instances of a `providedIn:'root'` service can exist? → **one** (singleton)
- Which service makes HTTP requests? → **`HttpClient`**

---

## Chapter 6 — Angular Router

**Lessons:** routing basics (config, outlet, links, HashLocationStrategy) · guards · route parameters.

**Links:** 📄 Route config — <https://angular.dev/guide/routing/define-routes#managing-routes-in-your-application> · 📄 Router outlet — <https://angular.dev/guide/routing/show-routes-with-outlets> · 📄 Router links — <https://angular.dev/guide/routing/navigate-to-routes> · 📄 HashLocationStrategy — <https://angular.dev/api/common/HashLocationStrategy> · 📄 Guards — <https://angular.dev/guide/routing/route-guards> · 📝 Legacy vs functional guards — <https://blog.angulartraining.com/router-utility-functions-in-angular-14-8d843b50d2e2> · ✉️ Route parameters — <https://www.angulartraining.com/daily-newsletter/accessing-route-information-with-angular/>

**Notes (condensed — full detail in L2 §Ch6):** `Routes` array + `provideRouter`; `:id` params; first-match-wins; `**` wildcard; `redirectTo`; `children`. `<router-outlet>`, `routerLink`, `routerLinkActive`; `HashLocationStrategy` for legacy. Functional guards `CanActivate/CanActivateChild/CanDeactivate/CanMatch/Resolve` return `boolean|UrlTree|Observable`. Read params via `ActivatedRoute.paramMap`/`queryParamMap`/`snapshot` or input binding. *(Level 1 does **not** cover lazy loading / `@defer` — that's Level 2 only.)*

### 🎯 Ch.6 pop-quiz questions
- Which service manages routing? → **`Router`** (config via `provideRouter`/`RouterModule`)
- Config with `products/:productId` → `/products/21` renders `ProductDetailsComponent`
- Which **is** an existing router guard function? → e.g. `CanActivate` / `CanMatch`

---

## Chapter 7 — Angular Forms

**Lessons:** FormControl & basic validation · template reference variables · reactive vs template-driven · signals with forms. **Pop quiz.**

**Links:** 📝 5 tips on FormControl — <https://blog.angulartraining.com/5-tips-on-using-angular-formcontrol-710ca338b896> · ✉️ Basic validation — <https://www.angulartraining.com/daily-newsletter/basic-form-validation-with-angular/> · ✉️ Template reference variables — <https://www.angulartraining.com/daily-newsletter/template-reference-variables/> · 📄 Reactive setup — <https://angular.dev/guide/forms#setup-in-reactive-forms> · 📄 Template-driven setup — <https://angular.dev/guide/forms#setup-in-template-driven-forms> · ✉️ Which to choose — <https://www.angulartraining.com/daily-newsletter/reactive-or-template-driven-forms/> · ✉️ Template-driven w/ signals — <https://www.angulartraining.com/daily-newsletter/tutorial-architecting-forms-with-signals/>

**Notes (condensed — full detail in L2 §Ch8):** `FormControl`/`FormGroup`/`FormArray`; validators (`required`/`pattern`/`min`/`max`/`minlength`); state CSS classes `ng-valid|invalid`, `ng-pristine|dirty`, `ng-untouched|touched`. Reactive (`[formControl]`, `FormBuilder`, sync, functions) vs template-driven (`[(ngModel)]`, directives, async). `#f="ngForm"` exposes the form; `model()` signals bind two-way with `ngModel`.

### 🎯 Ch.7 pop-quiz questions
- Which service creates reactive forms? → **`FormBuilder`**
- Which CSS class is **not** auto-managed by Angular forms? (real ones: `ng-valid/invalid`, `ng-pristine/dirty`, `ng-untouched/touched`)
- Which statement about template-driven forms is correct?
- How to choose between reactive and template-driven forms?

---

## Appendix — access & capture notes
- Auth-gated (redirects to `/angular/login`); rendered server-side via **Nuxt**, so all 7 chapters + 60 unique links are in the initial HTML. Captured with the `jwt` browser cookie (session-scoped; expires). **28/28 complete.**
- **No coding challenges exist in Level 1** — for hands-on practice see [`angular-cert-practice.md`](angular-cert-practice.md) (authored challenges per chapter) and the Level 2 challenges / [`angular-cert-level2-ch9-walkthroughs.md`](angular-cert-level2-ch9-walkthroughs.md).
- Medium-walled blog links (control-flow, router utility fns, FormControl tips) are preserved but summarized from docs — open them logged-in for the originals.
- **Beyond the chapters:** the official exam-topic list is broader than the chapter walls — see the [Supplement in the L2 notes](angular-cert-level2-notes.md#supplement--exam-adjacent-topics-authored-not-in-the-chapters) (`ng-content`, change detection/OnPush, HttpClient, provider shapes, Subjects, redirects/wildcards, FormArray, pure pipes, sanitization, `ViewEncapsulation`…). The junior exam is 50 MCQs in 40 min; those MCQ-sweep topics (S.10 especially) are fair game at Level 1 too.
