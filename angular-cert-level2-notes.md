# Angular Developer Certification — Level 2 Training Notes (Expanded)

**Source:** certificates.dev › Angular › Dashboard › Training › Level 2
**Captured:** 2026-07-12 · **Progress at capture:** 7 / 49 lessons complete
**Account:** Robert Oliver Jr (robeoliver@deloitte.com)

> **What this is.** The Level 2 training is a *self-study syllabus*: each lesson is a
> short set of curated resource links (mostly the official **angular.dev** docs,
> **angulartraining.com** daily-newsletter posts, **rxjs.dev**, **MDN**, and the
> **TypeScript** handbook) plus pop quizzes and downloadable coding challenges.
>
> This file captures **every resource link** in the training **and** distilled notes
> from the linked pages themselves — so you can study without chasing every tab. Links
> are kept inline for future reference. A handful of angulartraining *blog.* posts sit
> behind a Medium login wall that blocks automated fetching; those are flagged and the
> topic is summarized from the official docs / sibling articles instead.

**Legend:** 📄 = official docs · ✉️ = angulartraining newsletter · 📝 = angulartraining blog (Medium) · 🌐 = MDN/TypeScript · 🎯 = pop quiz · 🧑‍💻 = coding challenge

---

## Table of Contents
- [Program structure](#program-structure)
- [Chapter 0 — Start Here](#chapter-0--start-here)
- [Chapter 1 — Basics of Angular](#chapter-1--basics-of-angular)
- [Chapter 2 — Angular Components](#chapter-2--angular-components)
- [Chapter 3 — JavaScript and TypeScript](#chapter-3--javascript-and-typescript)
- [Chapter 4 — Directives and Pipes](#chapter-4--directives-and-pipes)
- [Chapter 5 — Services and Dependency Injection](#chapter-5--services-and-dependency-injection)
- [Chapter 6 — Angular Router](#chapter-6--angular-router)
- [Chapter 7 — RxJS Observables](#chapter-7--rxjs-observables)
- [Chapter 8 — Angular Forms](#chapter-8--angular-forms)
- [Chapter 9 — Challenge Roundup](#chapter-9--challenge-roundup)
- [Supplement — exam-adjacent topics](#supplement--exam-adjacent-topics-authored-not-in-the-chapters) *(authored gap-fill)*
- [Appendix — access notes](#appendix--access--capture-notes)

---

## Program structure

- **9 chapters.** Chapters 1–8 = lessons + pop quizzes + coding challenges. Chapter 9 = coding challenges only (mirrors the real exam format).
- Recommended to go **in sequential order** to build a foundation.
- Chapter 9 challenges are shaped like the certification exam's coding tasks.
- Community/support via **Discord** (invite in email) and the **"Submit Feedback"** link.
- The real exam runs in an **embedded StackBlitz IDE**.

---

## Chapter 0 — Start Here

### Welcome
Orientation letter. Structured way to practice Angular and get familiar with the official exam. Start at lesson 1, work sequentially, use the downloadable challenges for hands-on reps.

### What do I need? (setup)
**Tools & links:**
- 📄 Node.js (LTS required) — <https://nodejs.org/en>
- npm — bundled with Node; installs dependencies / manages packages
- 📄 WebStorm (recommended) — <https://www.jetbrains.com/webstorm/>
- 📄 VS Code — <https://code.visualstudio.com/> with extensions:
  - Angular Essentials — <https://marketplace.visualstudio.com/items?itemName=johnpapa.angular-essentials>
  - Auto Import — <https://marketplace.visualstudio.com/items?itemName=steoates.autoimport>
  - Angular Language Service — <https://marketplace.visualstudio.com/items?itemName=Angular.ng-template>
- 📄 StackBlitz (the exam's embedded IDE) — <https://stackblitz.com/>

---

## Chapter 1 — Basics of Angular

### 1.1 AngularJS vs Angular
- **Resource:** 📄 Angular release history — <https://github.com/angular/angular/releases>
- **AngularJS** = v1, **unsupported since January 2022**. **Angular** = the modern framework, released as Angular 2 (2016), now **v22 (mid-2026)**.

### 1.2 The Angular CLI
- **Resources:** 📄 Command reference — <https://angular.dev/cli> · 📄 Intro to the CLI — <https://angular.dev/tools/cli>
- The CLI (`@angular/cli`, binary **`ng`**) scaffolds, develops, tests, deploys, and maintains apps. Try online via StackBlitz before installing.
- **Key commands:**
  - `ng new` (`n`) — create a new workspace
  - `ng generate` (`g`) — generate/modify files from a schematic (component, service, pipe, directive, guard…)
  - `ng serve` (`s` / `dev`) — build + serve locally, rebuild on change (**dev-mode serve = the answer to the "compile and serve locally" quiz**)
  - `ng build` (`b`) — compile to `dist/`
  - `ng test` (`t`) — unit tests
  - `ng add` — add an external library with schematics
  - `ng lint` — run linting
  - `ng e2e` (`e`) — end-to-end tests
  - `ng update` — update workspace + dependencies
  - `ng deploy` — invoke a deploy builder
  - `ng config` — read/set values in `angular.json`
  - `ng extract-i18n` — extract i18n messages · `ng version` (`v`) · `ng run` (Architect target)
- **Concepts:** schematics generate/modify source; builders transform source → build output.

### 1.3 Conventions and Style Guide
- **Resources:** 📄 Angular style guide — <https://angular.dev/style-guide> · ✉️ ESLint for style feedback — <https://www.angulartraining.com/daily-newsletter/improve-your-code-with-eslint/>
- **File naming:** hyphens between words (`user-profile.ts`); tests end `.spec.ts`; component TS/HTML/CSS share a base name (`user-profile.ts` / `.html` / `.css`).
- **Structure:** all UI code under `src/`; bootstrap entry `main.ts`. **Organize by feature area, not by code type** (avoid blanket `components/`, `services/` folders). One concept per file; keep files small and focused.
- **DI:** prefer the **`inject()` function** over constructor parameter injection.
- **Components/directives:** share one app-specific **prefix**; group Angular properties (inputs, outputs, queries) before methods; use `protected` for template-only members; mark Angular-initialized props `readonly`; prefer `[class.x]`/`[style.x]` bindings over `ngClass`/`ngStyle`; name event handlers by the action, not the event; implement lifecycle-hook interfaces for type safety.
- **ESLint / angular-eslint:** lints both TS **and** HTML templates (catches e.g. bad `ngModel` two-way syntax); installed via Angular schematics; IDEs surface auto-fixes. It's the mechanism that "enforces the style guide automatically."

### 1.4 Features of the framework
- **Resources:** 📄 Overview — <https://angular.dev/overview> · ✉️ Directives vs components — <https://www.angulartraining.com/daily-newsletter/when-to-create-a-directive-vs-a-component/> · ✉️ Creating custom pipes — <https://www.angulartraining.com/daily-newsletter/how-to-create-custom-pipes/> · ✉️ When to use services — <https://www.angulartraining.com/daily-newsletter/using-services-to-cache-data/>
- **Core building blocks:** **Components** (encapsulated UI units), **Templates** (UI structure + binding), **Directives** (extend HTML / modify DOM), **Services + DI** (share logic), **Signals** (fine-grained reactivity). Plus SSR/SSG, routing (guards, lazy-load), forms, security-by-default (sanitization, trusted types), a Vite/esbuild build pipeline, and LTS releases.
- **Directive vs component — rule of thumb:** use a **directive** when the logic modifies attributes/behavior of *existing, varied* elements and you want reuse across element types (e.g. Angular Material's `mat-button` is a **directive** so it works on both `<button>` and `<a>`). Use a **component** for self-contained UI with its own template + state.

### 1.5 Angular Modules and Standalone
- **Resources:** ✉️ What you need to know about NgModules — <https://www.angulartraining.com/daily-newsletter/what-you-need-to-know-about-ngmodules/> · 📄 `@NgModule` config — <https://angular.dev/api/core/NgModule> · ✉️ Standalone components — <https://www.angulartraining.com/daily-newsletter/what-are-standalone-components/> · PDF cheatsheet — <https://www.angulartraining.com/daily-newsletter/wp-content/uploads/2023/05/Standalone-Components-Cheatsheet.pdf>
- **Why NgModules existed:** the TS compiler resolves TS imports, but HTML templates need a *separate* mechanism to know which components/directives/pipes are available — NgModules exposed those to the **template compiler** and enabled library sharing + lazy loading. `CommonModule` was auto-available.
- **Standalone (default in v22+):** add `standalone: true` (now the default) and list dependencies directly in the component's `imports: [...]`. No module wrapper; smaller builds; no circular-dependency headaches; supports lazy loading. NgModules are **legacy** and being phased out — you generally shouldn't create new ones.
- **Bootstrapping:** `bootstrapApplication(AppComponent, { providers: [...] })` instead of an `AppModule`.
```typescript
@Component({
  selector: 'app-root',
  standalone: true,          // default in modern Angular
  imports: [ButtonComponent],
  template: '<app-button />',
})
export class AppComponent {}
```

### 🎯 Pop Quiz topics (Ch.1)
- Which CLI command compiles + serves locally in dev mode? → `ng serve`
- What does "Angular" refer to? → the modern framework (v2+), not AngularJS
- Which rule is part of the style-guide conventions?
- Which is **not** a valid Angular CLI command?
- Which concept does **not** exist in Angular?
- What's the main language of Angular? → TypeScript
- Which function **bootstraps** the main component? → `bootstrapApplication()`

---

## Chapter 2 — Angular Components

### 2.1 Component Selector and Decorators
- **Resources:** 📄 Choosing a selector + prefixes — <https://angular.dev/guide/components/selectors#choosing-a-selector> · ✉️ Selectors are CSS selectors — <https://www.angulartraining.com/daily-newsletter/the-power-of-angular-selectors/> · 📄 Inputs — <https://angular.dev/guide/components/inputs> · 📄 Outputs — <https://angular.dev/guide/components/outputs> · 📄 viewChild queries — <https://angular.dev/guide/components/queries#view-queries> · 📄 contentChild queries — <https://angular.dev/guide/components/queries#content-queries>
- **Selector types:** element (`'profile-photo'`), attribute (`[dropzone]`, `button[type="reset"]`), class (`.menu-item`); `:not()` allowed, comma lists allowed; **no combinators/pseudo-elements**. Angular errors on an unknown custom tag (catches typos). Use a short consistent **prefix** (CLI default `app-`); **never use `ng`** (reserved).
- **Inputs (signal-based):** `value = input(0)` returns a read-only `InputSignal`, read as `value()`. Type inferred from default, or `input<number>()`. **Required:** `input.required<T>()` (build error if missing). **Alias:** `input(0, {alias:'sliderValue'})`. **Transform:** `input('', {transform: trimString})` + helpers `booleanAttribute`, `numberAttribute`. Inputs are recorded statically at compile time. Legacy `@Input()` decorator still fully supported.
- **Outputs (signal-based):** `changed = output<number>()`; emit with `this.changed.emit(7)`; parent reads `$event`. Custom events **don't bubble**. Alias via `output({alias:'valueChanged'})`. Legacy `@Output() x = new EventEmitter<T>()` still supported. Avoid "on" prefixes / native-event collisions.
- **Model (two-way):** `model()` creates an input+output pair for `[(x)]` binding (see 2.6).
- **Queries:** `viewChild()`/`viewChildren()` read the component's own template; `contentChild()`/`contentChildren()` read projected (`ng-content`) content. Signal-based queries are reactive and usable in `computed`/`effect` any time. Decorator equivalents (`@ViewChild` etc.) resolve at lifecycle points (`ngAfterViewInit` / `ngAfterContentInit`, or `ngOnInit` with `{static:true}`) and return a `QueryList` for the plural forms. Options: `read`, `required`, `descendants`. **Queries never pierce child-component boundaries.**

### 2.2 Expressions and Data Bindings
- **Resources:** 📄 Bindings — <https://angular.dev/guide/templates/binding> · 📄 Interpolation — <https://angular.dev/guide/templates/interpolation> · ✉️ Template reference variables — <https://www.angulartraining.com/daily-newsletter/template-reference-variables/> · ✉️ Anti-pattern: method in template — <https://www.angulartraining.com/daily-newsletter/anti-pattern-series-calling-a-method-in-a-template/>
- **Interpolation:** `{{ expr }}` renders dynamic text; also usable inside attribute strings (`alt="Photo of {{ firstName() }}"`).
- **Property binding:** `[disabled]="isFormValid()"`. **Attribute binding** (no DOM property, e.g. SVG/ARIA): `[attr.role]="listRole()"` (null → attribute removed). **Class:** `[class.expanded]="isExpanded()"` or `[class]="'a b'"`/array/object. **Style:** `[style.display]="…"`, units `[style.height.px]="h()"`, or `[style]="obj"`. **Event:** `(click)="save()"`.
- **Template reference variables:** `#name` on an element → access its DOM/component/directive instance elsewhere in the template. E.g. `<input #phone>` then `<button (click)="call(phone.value)">`. On a component `<app-hello #hello>` exposes its public members. A lightweight alternative to `ngModel` for reading input values.
- **Anti-pattern — methods in templates:** change detection re-evaluates template expressions after *every* event, so a method in the template is **called every cycle** (Angular can't know its output changed without calling it). Prefer **class properties**, **pipes** (run only when input changes), or **signals/`computed`**.

### 2.3 Control Flow with Blocks
- **Resources:** 📝 New control flow (intro) — <https://blog.angulartraining.com/angular-17-new-control-flow-syntax-4fbec4772d04> · ✉️ `@let` — <https://www.angulartraining.com/daily-newsletter/let-for-local-variables-in-angular-views/> · 📄 `@if` — <https://angular.dev/guide/templates/control-flow#conditionally-display-content-with-if-else-if-and-else> · 📄 `@for` — <https://angular.dev/guide/templates/control-flow#repeat-content-with-the-for-block> · 📄 `@switch` — <https://angular.dev/guide/templates/control-flow#conditionally-display-content-with-the-switch-block>
- `@if`/`@else if`/`@else` replaces `*ngIf` (no `ng-template`/`else` ref needed):
```html
@if (user.isAdmin) { <admin-panel /> } @else if (user.isGuest) { <guest /> } @else { <member /> }
```
- `@for` replaces `*ngFor` — **`track` is required** (replaces `trackBy`). Contextual vars: `$index`, `$first`, `$last`, `$even`, `$odd`. New `@empty` block:
```html
@for (item of items; track item.id) { <li>{{ item.name }}</li> } @empty { <li>No items</li> }
```
- `@switch`/`@case`/`@default` replaces `ngSwitch`.
- **`@let`** (v18.1+) declares a read-only local template variable (like `const`), scoped to the nearest block — great for de-duplicating a single `| async` subscription:
```html
@let data = (data$ | async);
@if (data) { <p>{{ data.name }}</p> }
```
- **Why:** control-flow blocks use native JS (no imported directive) → faster; `@for` is heavily optimized vs `*ngFor` on large arrays (docs cite up to ~90% improvement in cases). Legacy directives still work; migrate with `ng g @angular/core:control-flow`.

### 2.4 Signals
- **Resources:** 📄 Writable signals — <https://angular.dev/guide/signals#writable-signals> · 📄 What are signals — <https://angular.dev/guide/signals#what-are-signals> · ✉️ `computed()` — <https://www.angulartraining.com/daily-newsletter/signals-computed/> · ✉️ `effect()` — <https://www.angulartraining.com/daily-newsletter/signals-effect/> · ✉️ RxJS interop — <https://www.angulartraining.com/daily-newsletter/rxjs-and-signals-interoperability/> · 📝 Signal-based components — <https://blog.angulartraining.com/angular-signal-based-components-tutorial-4e4b4b1dfa96>
- **Signal** = a wrapper around a value that notifies consumers on change. Create with `signal(0)`, read by calling `count()`. Write with `.set(3)` or `.update(v => v + 1)`.
- **`computed()`** = read-only derived signal; **lazy** (runs on first read) and **memoized** (cached until a dependency changes); dependencies tracked dynamically. Replaces a lot of `combineLatest`/`switchMap` glue:
```typescript
const count = signal(0);
const doubled = computed(() => count() * 2);
```
- **`effect()`** = runs a side effect whenever a read signal changes; **returns nothing**. For logging/debugging/DOM side effects. By default **cannot write signals** (guards against infinite loops); override with the allow-writes option only if certain. Runs in an injection context.
- **OnPush + signals:** reading a signal in a template auto-marks the component for check when it changes. Equality defaults to `Object.is`; `untracked()` reads without creating a dependency.
- **RxJS interop (v16+):** `toSignal(obs$, {initialValue})` (Observable → Signal; signals always have a value) and `toObservable(sig)` (Signal → Observable, plays with `async` pipe). Enables gradual migration.

### 2.5 Lifecycle Hooks
- **Resources:** ✉️ App lifecycle — <https://www.angulartraining.com/daily-newsletter/lifecycle-of-angular-applications/> · ✉️ `ngOnDestroy` — <https://www.angulartraining.com/daily-newsletter/ngondestroy-lifecycle-hook/> · ✉️ `ngOnChanges` — <https://www.angulartraining.com/daily-newsletter/ngonchanges-lifecycle-hook/> · ✉️ `ngOnInit` — <https://www.angulartraining.com/daily-newsletter/ngoninit-lifecycle-hook/> · ✉️ Not unsubscribing (anti-pattern) — <https://www.angulartraining.com/daily-newsletter/anti-pattern-series-not-unsubscribing-from-observables/>
- **Order:** `ngOnChanges` → `ngOnInit` → `ngDoCheck` → `ngAfterContentInit`/`Checked` → `ngAfterViewInit`/`Checked` → `ngOnDestroy`.
- **`ngOnInit`** runs **once** after all `@Input()`s have their initial values — only truly justified when init logic depends on input values (the constructor runs *before* inputs are set).
- **`ngOnChanges(changes: SimpleChanges)`** fires whenever a bound input changes; each entry has `previousValue`, `currentValue`, `firstChange`. Common use: refetch when an id input changes.
- **`ngOnDestroy`** fires when the component is removed (e.g. `@if`/route change). Use it to **unsubscribe Observables, close sockets, clear `setInterval`/`setTimeout`**.
- **Memory-leak fix (preferred):** use the **`async` pipe** (auto-unsubscribes) or **`takeUntilDestroyed()`** (v16+) — ideally applied at the **service** level so all subscribers benefit; manual `ngOnDestroy` unsubscription is the fallback.
- **Lifetime note:** components are created/destroyed as they enter/leave the DOM; **services persist** for the app's life (per browser tab).

### 2.6 Other Important Topics
- **Resources:** ✉️ Signal-based query fns — <https://www.angulartraining.com/daily-newsletter/viewchild-and-contentchild-for-signal-based-queries/> · ✉️ Signal input fns — <https://www.angulartraining.com/daily-newsletter/whats-new-in-angular-17-1/> · 📄 `output` usage — <https://angular.dev/api/core/output?tab=usage-notes> · ✉️ `model()` — <https://www.angulartraining.com/daily-newsletter/model-for-signal-based-2-way-data-bindings/> · 📝 `ng-template` — <https://blog.angulartraining.com/what-is-ng-template-and-when-to-use-it-f875b46aa078> · ✉️ `ng-container` — <https://www.angulartraining.com/daily-newsletter/what-is-ng-container/>
- **`viewChild()`/`contentChild()` (v17.2+):** return signals, available immediately, reactive — replace `@ViewChild`/`@ContentChild` + `ngAfterViewInit`; can be `.required`; drive side effects via `effect()`/`computed()`.
- **`input()` (v17.1+):** signal inputs let you derive with `computed()` instead of `ngOnInit`/`ngOnChanges`; `input.required()` enforces a value.
- **`model()` (v17.2+):** signal-based two-way binding. Child declares `age = model<number>()`; parent binds `[(age)]="parentAge"` ("banana-in-a-box"). Update with `.set()`/`.update()` (arrow fns in TS, not templates). `model.required()` supported. Modern replacement for custom `ngModel`-style two-way binding.
- **`ng-template`:** defines a template fragment that **renders nothing by default**; render it via `*ngTemplateOutlet`/`ngTemplateOutlet` or by passing it as an `@Input`. Structural directives (`*ngIf`, `*select`) **desugar** into `<ng-template>`. *(Article is behind Medium's login wall.)*
- **`ng-container`:** a logical grouping element that **adds no DOM node**. Use it to apply a structural directive without an extra wrapper, or to host multiple structural directives (Angular allows only one per element):
```html
<ng-container *ngIf="ready">
  <div *ngFor="let item of items">{{ item }}</div>
</ng-container>
```

### 🎯 Pop Quiz topics (Ch.2)
- Required `@for` option → **`track`**.
- Which is **not** a valid Angular selector?
- Decorator to pass data into a component → `@Input` (or `input()`).
- Which template auto-renders the latest value of `data` when it changes? → interpolation `{{ data }}`.
- Render an `ng-template` named `myTemplate` **without** an extra wrapping `div` → `ng-container` + `ngTemplateOutlet`.
- Purpose of `@ViewChild` in an example.

### 🧑‍💻 Coding Challenge — "Create a Component Driven by Inputs"
- File `src/movie-item/movie-item.component.ts`; add a **required input** of type `Movie` (sample in `src/app.component.ts`).
- Render **Title**, **Release date** (unformatted), **Budget** as `$ {value} million`, **Duration** as `{value} min`.
- Pass the sample `movie` from `src/app.component.html`. Keep `data-test` attrs; `mini.css` available.

---

## Chapter 3 — JavaScript and TypeScript

### 3.1 JavaScript (modern essentials)
- **Resources:** 🌐 `var`/`let`/`const` — <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let> · 🌐 Template strings — <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals> · 🌐 Destructuring — <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment> · ✉️ Arrow functions — <https://www.angulartraining.com/daily-newsletter/everything-you-need-to-know-about-arrow-functions/> · 🌐 Nullish coalescing — <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing>
- **Scope:** `let`/`const` are block-scoped (vs `var` function-scoped); `const` can't be reassigned (object contents still mutable).
- **Template literals:** backticks with `${expr}` interpolation, multiline support, tagged templates (`tag\`...\``), `String.raw`. Escape backtick `` \` `` and `\${`.
- **Destructuring:** arrays `const [a, , c] = arr`, rest `const [a, ...rest] = arr`, defaults `const [a=10] = []`, swap `[a,b]=[b,a]`; objects `const {a, b} = obj`, rename `const {a: x} = obj`, defaults `const {a=10} = obj`, rest `const {a, ...rest} = obj`, nested `const {user:{name}} = obj`. Defaults evaluate only when needed. Destructuring `null`/`undefined` throws. Rest must be last.
- **Arrow functions:** `(a,b) => a+b`; single param needs no parens; **implicit return** for one-liners (braces need explicit `return`); **lexical `this`** (inherits from enclosing scope — key for class callbacks).
- **Nullish coalescing `??`:** falls back **only** on `null`/`undefined` (unlike `||`, which also falls back on `0`/`''`/`false`/`NaN`). E.g. `count ?? 42` keeps `0`; `count || 42` replaces it. Can't mix with `&&`/`||` without parentheses.

### 3.2 TypeScript (essentials)
- **Resources:** 🌐 What is TS — <https://www.typescriptlang.org/> · 🌐 Classes — <https://www.typescriptlang.org/docs/handbook/2/classes.html> · 🌐 Everyday types — <https://www.typescriptlang.org/docs/handbook/2/everyday-types.html> · 📝 Union types — <https://blog.angulartraining.com/union-types-in-typescript-2517a82a1ea0> · 🌐 Utility types — <https://www.typescriptlang.org/docs/handbook/utility-types.html> · 🌐 Constructor options — <https://www.typescriptlang.org/docs/handbook/2/classes.html#constructors> · 🌐 Enums — <https://www.typescriptlang.org/docs/handbook/enums.html>
- **Everyday types:** primitives `string`/`number`/`boolean` (lowercase); arrays `number[]` or `Array<number>` (`[number]` is a tuple); `any` disables checks; annotations follow the name (`let x: string`); optional props `last?: string`; **type assertions** `el as HTMLCanvasElement`; **literal types** `'left' | 'right'`; `strictNullChecks` forces null tests; non-null `x!`; also `bigint`, `symbol`.
- **Union types** `A | B`: value can be either; TS only allows operations valid for **all** members until you **narrow** (via `typeof`, `Array.isArray`, truthiness, discriminated properties). **Literal unions** (`'USD' | 'GBP'`) restrict to known values. *(Blog behind Medium; covered by the handbook.)*
- **Type aliases vs interfaces:** `type Point = {x:number}` names any type but can't reopen; `interface Point {}` is extendable and shows better in errors.
- **Classes:** fields (optional annotations/initializers), `readonly`, definite assignment `y!`; constructors (defaults/overloads, `super()` first in subclasses); **parameter properties** declare+init in one shot:
```typescript
class Params { constructor(public readonly x: number, private z: number) {} }
```
  getters/setters (`get`/`set`, can differ in type), access modifiers `public`(default)/`protected`/`private` (soft privacy vs JS `#`), `static` members, `abstract` classes/methods, generics `class Box<T>`, `implements`, `extends`. Arrow-function fields bind `this`.
- **Utility types:** `Partial<T>` (all optional), `Required<T>`, `Readonly<T>`, `Pick<T,K>`, `Omit<T,K>`, `Record<K,T>`, `Exclude<U,T>`, `Extract<T,U>`, `ReturnType<F>`, `Parameters<F>`.
- **Enums:** numeric (auto-increment from 0, supports **reverse mapping** `E[0]→"A"`), string (`Up="UP"`, no reverse map, better for debugging), `const enum` (inlined, erased from output). Modern alternative: `as const` objects.

### 🎯 Pop Quiz topics (Ch.3)
- `let a = otherValue ?? 21` → value of `a` depends only on null/undefined.
- `setCurrency(value: number, currency: 'USD' | 'GBP')` → which call satisfies the literal union?
- `enum UserResponse { No = 0, Yes = 1 }` → `console.log(UserResponse.Yes)` prints **`1`**.
- `function test(a, b, ...c)` → expects **2 named + rest** params.

---

## Chapter 4 — Directives and Pipes

### 4.1 Basics of directives and blocks
- **Resources:** 📄 `ngFor` usage — <https://angular.dev/api/common/NgFor?tab=usage-notes> · 📄 `ngIf` usage — <https://angular.dev/api/common/NgIf?tab=usage-notes> · 📄 Structural directives — <https://angular.dev/guide/directives/structural-directives> · 📄 Attribute directives — <https://angular.dev/guide/directives/attribute-directives> · 📄 Built-in directives — <https://angular.dev/guide/directives#built-in-attribute-directives> · 📄 Control-flow blocks — <https://angular.dev/guide/templates/control-flow> · 📄 Migration — <https://angular.dev/reference/migrations/control-flow>
- **Three directive kinds:** components (with templates), **attribute** directives (change appearance/behavior), **structural** directives (change DOM layout by adding/removing elements).
- **Built-in attribute directives:** `NgClass` (toggle a set of classes), `NgStyle` (set a set of styles), `NgModel` (two-way form binding). Prefer `[class.x]`/`[style.x]` for single class/style.
- **Structural directives:** the `*` shorthand desugars to `<ng-template>`. `<p *select="let data; from: source">` → `<ng-template select let-data [selectFrom]="source"><p>…</p></ng-template>`. Only one `*` per element (use `ng-container` for more). Modern control flow (`@if`/`@for`) has largely replaced `*ngIf`/`*ngFor`.

### 4.2 Custom Directives and Advanced Usage
- **Resources:** 📄 (custom directive vs component) — see structural/attribute docs above · ✉️ HostListener & HostBinding — <https://www.angulartraining.com/daily-newsletter/hostbinding-and-hostlistener/> · 📄 `@for` contextual vars — <https://angular.dev/guide/templates/control-flow#contextual-variables-in-for-blocks>
- **Custom attribute directive:** `ng g directive highlight`, decorate with a CSS attribute selector `[appHighlight]`, `inject(ElementRef)` for the host node, accept values via `input()`:
```typescript
@Directive({
  selector: '[appHighlight]',
  host: { '(mouseenter)': 'on()', '(mouseleave)': 'off()' },
})
export class HighlightDirective {
  appHighlight = input('');
  private el = inject(ElementRef);
  on() { this.el.nativeElement.style.backgroundColor = this.appHighlight(); }
  off() { this.el.nativeElement.style.backgroundColor = ''; }
}
```
- **`@HostBinding` / `@HostListener`** (decorator style): a directive has no template, so `@HostBinding('id') testId` does what `[id]` does in a component template, and `@HostListener('click') onClick()` does what `(click)` does. (Modern equivalent = the `host: {}` object above.)
- **Custom structural directive:** inject `TemplateRef` + `ViewContainerRef`, take an `input()`, call `viewContainerRef.createEmbeddedView(templateRef, context)`; microsyntax keys map to PascalCase (`from` → `selectFrom`).

### 4.3 Pipes
- **Resources:** 📄 Pipes API — <https://angular.dev/api?type=pipe#angular_common> · 📄 Pipe syntax — <https://angular.dev/guide/templates/pipes#overview> · 📄 How pipes work — <https://angular.dev/guide/templates/pipes#how-pipes-work> · 🌐 `String.split()` — <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split>
- **Pipes** transform data declaratively with `|`. **Built-in:** `date`, `currency`, `uppercase`/`lowercase`/`titlecase`, `async` (unwraps Promise/Observable), `json` (debug), `percent`, `number`/`decimal`, `slice`, `keyvalue`.
- **Syntax/params/chaining:** `{{ amount | currency }}`, `{{ date | date:'hh:mm':'UTC' }}`, chain left-to-right `{{ d | date | uppercase }}`.
- **Change detection:** pipes are **pure by default** — recompute only when the input **primitive or reference** changes (mutating an object/array in place won't trigger). This makes them the performant alternative to methods in templates. `pure: false` detects deep changes but carries a real performance penalty.
- **Custom pipe:** `ng g pipe kebabCase` → implement `PipeTransform.transform(value, ...args)`; give real types and default parameter values:
```typescript
@Pipe({ name: 'kebabCase' })
export class KebabCasePipe implements PipeTransform {
  transform(value: string): string { return value.toLowerCase().replace(/ /g, '-'); }
}
```

### 🎯 Pop Quiz topics (Ch.4)
- Which is **not** an Angular directive?
- Correct syntax for pipe parameters → `value | pipe:arg1:arg2`.

### 🧑‍💻 Coding Challenge — "Highlight a Movie on Mouse Over"
- Edit `src/highlight.directive.ts`; on **mouseover** add CSS class `highlight` (in `styles.css`) to the host; on **mouseout** remove it; apply the directive to `MovieItemComponent`. Hint: host bindings + listeners.

### 🧑‍💻 Coding Challenge — "Budget & Duration Pipes"
- `src/pipes/million-dollar.pipe.ts`: `"175"` → `"$175 million"`; `"175-200"` → `"$175 to $200 million"` (hint: `String.split('-')`).
- `src/pipes/min-to-duration.pipe.ts`: `"92"` → `"1h 32min"`. Wire both into `movie-item.component.ts`. Uses template strings + `??`.

---

## Chapter 5 — Services and Dependency Injection

### 5.1 Basics of Dependency Injection
- **Resources:** 📄 Provide a dependency — <https://angular.dev/guide/di/defining-dependency-providers> · ✉️ The `inject()` function — <https://www.angulartraining.com/daily-newsletter/the-inject-function/> · 📄 `@Service` vs `@Injectable` — <https://angular.dev/guide/di/creating-and-using-services#when-to-use-service-vs-injectable> · ✉️ Provider config — <https://www.angulartraining.com/daily-newsletter/dependency-injection-and-provider-config/>
- **DI** lets decorated classes (components, directives, pipes, injectables) declare dependencies that Angular's injector supplies. Two injection styles:
  - Constructor: `constructor(private svc: MyService) {}`
  - **`inject()` function:** `private svc = inject(MyService)` — works in field initializers, constructor bodies, and provider factory functions (i.e. an **injection context**). Required for **functional route guards/resolvers** and factory providers; the style-guide-preferred approach.
- **Provider config / `providedIn`:** `providedIn: 'root'` = app-wide **singleton** (tree-shakeable); providing in a **component** scopes an instance to that component + children; `'platform'` shares across apps on a tab (rare). Advanced strategies: `useClass`, `useValue`, `useFactory`, `useExisting`, plus **injection tokens** for non-class values.

### 5.2 Characteristics of Services
- **Resources:** 📄 Basics of services — <https://angular.dev/tutorials/first-app/09-services#conceptual-preview-of-services> · ✉️ Too many services (anti-pattern) — <https://www.angulartraining.com/daily-newsletter/anti-pattern-series-using-too-many-services/> · ✉️ Presentation vs container — <https://www.angulartraining.com/daily-newsletter/container-vs-presentation-components/>
- Services are **reusable shared logic/data**; create with `ng g service name` or `@Injectable()`. With `providedIn:'root'` there's **one shared singleton** for the whole app that stays in memory as long as the tab is open (great for caching to avoid redundant API calls).
- **Caching patterns:** a `BehaviorSubject` (replays latest to new subscribers) or a **signal** (read-only exposed value) held in the service.
- **`@Service` vs `@Injectable`:** `@Service` (newer sugar) → implicit root singleton, `inject()`-only. `@Injectable` → needed for **constructor DI**, advanced providers (`useClass`, etc.), or non-root scopes; requires `providedIn:'root'` for a root singleton.
- **Anti-pattern:** too many services — sometimes a plain function is enough.
- **Container vs presentation components:** *presentation* = reusable UI (buttons, cards) with only inputs/outputs, **no DI**; *container* = screen-level, **injects services**, feeds data down via inputs. Push DI up to containers to keep leaf UI reusable (this is the Ch.5 challenge's "pro tip").

### 🎯 Pop Quiz topics (Ch.5)
- Decorator that registers a class as a service → `@Injectable` (or `@Service`).
- Can an `@Injectable()` class depending on `HttpClient` be injected as-is? (yes if provided/`HttpClient` available)
- `@Injectable({ providedIn: 'root' })` → how many instances? → **one** (singleton).
- Correct syntax to inject `LoginService` into `LoginComponent`.

### 🧑‍💻 Coding Challenge — "Manage Favorite Movies"
- `src/services/favorites.service.ts`: a **signal** holding the favorites array (default `[]`); `toggleFavorite(movie)` add/remove; `isFavorite(movie)` → boolean.
- `movie-item.component.ts`: inputs/outputs to receive favorite state + emit star clicks; toggle the `active` CSS class (☆ ↔ ⭐). `app.component.ts` orchestrates the service. Pro tip: inputs/outputs instead of injecting everywhere = presentation/container split.

---

## Chapter 6 — Angular Router

### 6.1 Basics of Routing
- **Resources:** 📄 Route configuration — <https://angular.dev/guide/routing/define-routes#managing-routes-in-your-application> · 📄 Router outlet — <https://angular.dev/guide/routing/show-routes-with-outlets> · 📄 Router links — <https://angular.dev/guide/routing/navigate-to-routes> · ✉️ Bind router info to inputs — <https://www.angulartraining.com/daily-newsletter/angular-16-preview-binding-router-information-to-component-inputs>
- **Routes** = array of `{ path, component }` (usually `app.routes.ts`), registered via **`provideRouter(routes)`**. Dynamic segments use `:id` (`user/:id`); multiple params stack (`user/:id/:tab`).
- **Matching is first-match-wins** → order specific routes before generic. **Wildcard** `**` catches unmatched (404). **Redirects:** `{ path:'', redirectTo:'/blog', pathMatch:'full' }`. **Child routes** via `children: []`. Also `title`, `data`, and route-scoped `providers`.
- **`<router-outlet>`** marks where the matched component renders (routed content inserted as a sibling after the outlet); default name `'primary'`, supports **named outlets** and `activate`/`deactivate` events; **nested** routes need a second outlet.
- **`routerLink`:** `<a routerLink="profile">` for SPA navigation; `routerLinkActive="active"` toggles a class on the active link. `HashLocationStrategy` available for legacy/servers that can't do client-side URLs.
- **Bind router info to inputs (v16+):** enable `withComponentInputBinding()` (or `bindToComponentInputs:true`) → path params, query params, matrix params, and resolved `data` flow straight into matching `@Input()`s, so a component needn't inject `ActivatedRoute` and stays reusable:
```typescript
provideRouter(routes, withComponentInputBinding());
// component:  id = input<string>();   // from  path: 'details/:id'
```

### 6.2 Access Control with the Router
- **Resources:** 📄 Guards — <https://angular.dev/guide/routing/route-guards> · 📝 Legacy vs functional guards — <https://blog.angulartraining.com/router-utility-functions-in-angular-14-8d843b50d2e2> · ✉️ Route parameters — <https://www.angulartraining.com/daily-newsletter/accessing-route-information-with-angular/>
- **Guards** (modern = plain **functions**, using `inject()` inside):
  - **`CanActivate`** — can the user enter this route? (auth/authorization)
  - **`CanActivateChild`** — guards all children of a parent
  - **`CanDeactivate`** — can the user leave? (unsaved-changes confirm)
  - **`CanMatch`** — does this route *match* at all? If it rejects, routing falls through to other routes (feature flags, A/B, same path → different component)
  - **`Resolve`** — pre-fetch data before activation
  - Return `boolean` | `UrlTree`/`RedirectCommand` (redirect) | `Promise`/`Observable` of those.
  - ⚠️ Never rely on client-side guards as the sole access control — **always enforce on the server**.
- **Route parameters:** inject `ActivatedRoute`; `paramMap` (route params), `queryParamMap` (query string), `data` (resolved data) as Observables, or `.snapshot` for a one-time read. (Or bind to inputs per 6.1.)

### 6.3 Lazy Loading
- **Resources:** ✉️ Lazy-loading — <https://www.angulartraining.com/daily-newsletter/lazy-loading-for-better-angular-performance/> · ✉️ Lazy standalone — <https://www.angulartraining.com/daily-newsletter/lazy-loading-standalone-components/> · ✉️ `@defer` — <https://www.angulartraining.com/daily-newsletter/angular-17-lazy-loading-with-defer/>
- **Lazy loading** splits the bundle so chunks download **on demand** when a route activates → smaller initial bundle, faster first load, and code never shipped can't be reverse-engineered. One line in the router config:
```typescript
{ path: 'admin', loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent) }
{ path: 'admin', loadChildren: () => import('./admin/routes').then(m => m.ADMIN_ROUTES) }
```
- **`@defer`** lazy-loads any **standalone** component **without** the router, on a trigger:
  - triggers: `on idle`, `on viewport`, `on interaction`, `on hover`, `on timer(…)` (also `when <condition>`, `prefetch …`)
  - blocks: `@placeholder` (with `minimum`), `@loading` (with `after`/`minimum`), `@error`
```html
@defer (on viewport) { <app-heavy /> } @placeholder (minimum 500ms) { <p>Loading…</p> } @error { <p>Failed</p> }
```

### 🎯 Pop Quiz topics (Ch.6)
- Purpose of `<router-outlet>` → placeholder where routed components render.
- Config with `products/:productId` → `/products/21` renders `ProductDetailsComponent`.
- Which is **not** a real router guard function? (e.g. `CanLoad` is legacy/removed vs `CanMatch`).
- Requirement for `loadComponent: () => import(...).then(c => c.AdminComponent)` → the component must be **standalone**.

### 🧑‍💻 Coding Challenge — "Display Movie Details via Router"
- `home.component.ts` = landing page (movies list); `app.component.ts` renders just `<router-outlet />`.
- `app.routes.ts`: `''` → `HomeComponent`; `'details/:id'` → **lazy-load** `MovieDetailsComponent`. Wire the "Details" button in `MovieItemComponent` to navigate.

---

## Chapter 7 — RxJS Observables

### 7.1 Basics of RxJS
- **Resources:** 📝 Observables in 5 min — <https://blog.angulartraining.com/rxjs-observables-in-5-minutes-144abf13cac8> · 📄 Operators — <https://rxjs.dev/guide/operators> · 📝 Strategies to unsubscribe — <https://blog.angulartraining.com/how-to-automatically-unsubscribe-your-rxjs-observables-tutorial-2f98b0560298>
- **Observable** = a stream that emits values over time (user input, HTTP, timers). You **subscribe** to receive `next` values, an optional `error`, and a `complete`. **Cold** observables (e.g. `HttpClient`) start work per subscriber; **hot** ones are shared. Unsubscribe to avoid leaks (or let `async` pipe / `takeUntilDestroyed` do it). *(Intro blog behind Medium; concepts covered here + Ch.2.5.)*
- **Operators** are **pipeable** functions chained via **`.pipe()`**; each returns a **new** Observable (immutable). Categories: creation, transformation, filtering, combination. Import individually (tree-shaking).

### 7.2 Important Operators
- **Resources:** 📄 `map` — <https://rxjs.dev/api/index/function/map> · 📄 `filter` — <https://rxjs.dev/api/index/function/filter> · ✉️ `tap` — <https://www.angulartraining.com/daily-newsletter/rxjs-tap-operator/> · ✉️ `switchMap` — <https://www.angulartraining.com/daily-newsletter/rxjs-switchmap-operator/> · 📄 `combineLatest` — <https://rxjs.dev/api/index/function/combineLatest> · ✉️ Error handling — <https://www.angulartraining.com/daily-newsletter/error-handling-in-rxjs/> · 🌐 rxmarbles — <http://rxmarbles.com/> · ✉️ How to use RxMarbles — <https://www.angulartraining.com/daily-newsletter/how-to-learn-more-about-rxjs-operators/>
- **`map(fn)`** — transform each emitted value: `of(1,2,3).pipe(map(x => x*2))` → `2,4,6`.
- **`filter(pred)`** — emit only values passing the predicate: `.pipe(filter(v => v > 5))`.
- **`tap(fn)`** — side effect (log/debug) **without changing** the stream; a "spy."
- **`switchMap(fn)`** — map to an inner Observable and **cancel the previous inner subscription** when the source emits again. Ideal for **input → HTTP** (cancels stale requests). Contrast: `mergeMap` keeps all inner subs concurrent; `concatMap` queues them sequentially.
- **`combineLatest([a$, b$])`** — emit an array of the **latest** value from each source whenever any emits, **after every source has emitted once** (unlike `zip`, doesn't wait for all to re-emit).
- **Error handling:** an Observable that **errors emits nothing more**. `catchError(err => fallback$)` recovers by switching to another Observable (cached data, alt endpoint); `retry(n)` resubscribes; `throwError` creates an erroring stream.
- **`rxmarbles.com`** visualizes operator timing with marble diagrams.

### 🎯 Pop Quiz topics (Ch.7)
- Which statement about Observables is **incorrect**?
- What does `.pipe()` do? → chains operators, returns a new Observable.
- What does `map()` do? → transforms each value.
- Common `switchMap` use case → cancel-and-refetch on user input.

### 🧑‍💻 Coding Challenge — "Display Data with Observables"
- `movies.service.ts` now returns **Observables instead of Signals**. Update `home.component.ts` and `MovieDetailsComponent` to render them — hint: the **`async` pipe**. No visible change to the user.

---

## Chapter 8 — Angular Forms

### 8.1 Basics of Angular Forms
- **Resources:** 📝 5 tips on `FormControl` — <https://blog.angulartraining.com/5-tips-on-using-angular-formcontrol-710ca338b896> · ✉️ Basic validation — <https://www.angulartraining.com/daily-newsletter/basic-form-validation-with-angular/> · 📄 Reactive form setup — <https://angular.dev/guide/forms#setup-in-reactive-forms> · 📄 Template-driven setup — <https://angular.dev/guide/forms#setup-in-template-driven-forms>
- **Building blocks:** `FormControl` (one field's value + validity), `FormGroup` (a collection), `FormArray` (a dynamic list), `ControlValueAccessor` (bridges a control to a DOM element).
- **Validation:** built-in HTML/`Validators` — `required`, `pattern`, `min`/`max`, `minlength`/`maxlength`, input `type="email"`. Angular auto-toggles state CSS classes: `ng-valid`/`ng-invalid`, `ng-pristine`/`ng-dirty`, `ng-untouched`/`ng-touched`. Common UX: only show errors after touch:
```css
input.ng-invalid.ng-touched { border-color: red; }
```
- **Small-forms tip:** login/search forms can skip the Forms module entirely and read values via **template reference variables**.

### 8.2 Reactive and Template-Driven Forms
- **Resources:** ✉️ Custom validators (both) — <https://www.angulartraining.com/daily-newsletter/using-validation-functions-that-work-with-both-template-driven-and-reactive-forms/> · ✉️ Which to choose — <https://www.angulartraining.com/daily-newsletter/reactive-or-template-driven-forms/> · ✉️ Reactive forms observables — <https://www.angulartraining.com/daily-newsletter/reactive-forms-observables/> · ✉️ Template-driven with signals — <https://www.angulartraining.com/daily-newsletter/tutorial-architecting-forms-with-signals/>

| | **Reactive** | **Template-Driven** |
|---|---|---|
| Model | explicit in the class, immutable | implicit via directives, mutable |
| Binding | `[formControl]` / `formControlName` | `[(ngModel)]` |
| Validation | validator **functions** | validator **directives** |
| Data flow | synchronous | asynchronous |
| Testing | simpler (sync access) | needs change detection |
| Best for | dynamic/complex, RxJS-driven, autocomplete, on-the-fly validation | simple forms (signup, contact) |

- **Choosing:** dynamic fields / RxJS reactivity / autocomplete / async validation → **reactive**; otherwise template-driven is fine.
- **Custom validator (works with both):** a `ValidatorFn` returning `ValidationErrors | null`; expose it as a **static method** for reactive forms and wrap it in a **directive implementing `Validator`** for template-driven forms — single source of truth:
```typescript
export function ccValidator(): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null =>
    isValidCc(c.value) ? null : { creditCard: true };
}
```
- **Reactive forms observables:** every `AbstractControl` exposes **`valueChanges`** (emits on value change) and **`statusChanges`** (emits `VALID`/`INVALID`/`PENDING`/`DISABLED`). Combine with `debounceTime`/`switchMap` for live search; prefer `statusChanges` when validity (not raw value) drives logic. Enable a city field only after a valid zip, etc.
- **Signals with template-driven forms:** `model()` signals bind two-way with `ngModel`, giving reactive form state without importing reactive-forms machinery — good for reusable controls (e.g. a date-range picker) using native `min`/`max` attributes.

### 🎯 Pop Quiz topics (Ch.8)
- Which property is **not** valid on a `FormControl`?
- Service to create reactive forms → **`FormBuilder`**.
- Event emitted when a reactive control's value changes → **`valueChanges`**.
- Syntax to access the underlying `NgForm` in a template-driven form → `#f="ngForm"`.

### 🧑‍💻 Coding Challenge — "Add Filters to the Movies App"
- Filter movies by **title** and **year**. Capture input (simplest approach for a simple form), pass to `filterMovieList` from `movies.service` (returns a filtered-movies Observable), and render the filtered list.

---

## Chapter 9 — Challenge Roundup (exam-style, coding only)

A multi-part **Tesla-style "Car Configurator"** — a simplified <https://www.tesla.com/modelx/design>. Data comes from an included local API. Emphasis throughout on **Signals** for configuration state. Reference images: <https://interstate21.com/tesla-app/images/>.

### Part 1 — Model & Color selection
- Retrieve models/colors from **`http://localhost:4200/models`**. Types in `src/app/models.type.ts`; `configurator.service` has a Signal of all models.
- Complete `step1.component`: two selects (model, color); show the correct image when both chosen. Hint: hold selected model/color in Signals.

### Part 2 — Config Options
- Add routes `/step1` and `/step2` (renders `step2.component`) + nav links. **Block step 2** until car + color are chosen.
- Use **`/options/:modelCode`** for configs/options. Two options cost **$1,000 each**, shown (unchecked) only when available: **yoke steering wheel**, **tow hitch package** (API booleans). On config select, show **range, max speed, cost**.

### Part 3 — Summary and Price
- Add route `/step3` (renders `step3.component`); block until steps 1 & 2 complete. Compute **total price with a `computed()` Signal**; show each option's cost in **USD** + total; going back and changing must update step 3.

### Part 4 — Bug Fixes
- **Bug 1:** switching models keeps a previous "tow hitch" — reset all configs/colors on model change.
- **Bug 2:** step 3 clickable before a config is chosen — only enable when step 2 has a config.
- **Bug 3:** returning to step 1 doesn't reflect the current model/color — persist/show selection.

---

## Supplement — exam-adjacent topics (authored, not in the chapters)

> **Why this section exists.** The official exam-topic list is "Angular Basics, Components,
> Services, Modules, Pipes, TypeScript, Directives, RxJs, Router, Forms, JavaScript, and
> Signals", and the Mid-Level exam blurbs additionally call out **advanced CLI usage,
> component architecture, state management, complex routing, and optimization techniques**.
> The training's chapters brush past (or skip) the topics below, but they are fair game for
> MCQs and show up constantly in real Angular work — I audited the chapter notes above against
> that list and wrote up every gap. Everything here is **authored** (from angular.dev / MDN),
> not captured from the training.

### S.1 Content projection — `ng-content`
- A component renders caller-supplied markup where `<ng-content />` sits: `<app-card>Hello</app-card>` → the card's template decides *where* "Hello" lands. This is how wrapper/layout components (cards, dialogs, tabs) are built — the "component architecture" staple.
- **Multi-slot:** `<ng-content select="[card-title]" />` picks projected elements by CSS selector; a bare `<ng-content />` is the catch-all for everything unmatched. Force an element into a named slot with `ngProjectAs="[card-title]"`.
- **Gotchas (MCQ bait):** projection is **not** conditional rendering — projected content is instantiated by the *parent*, even if the child never places it. `<ng-content>` takes no structural directives; wrap it in `@if`-controlled containers instead. Use `<ng-container>` to group without emitting a DOM node.
- `contentChild()`/`contentChildren()` query what was **projected in** (light DOM); `viewChild()` queries the component's **own template** (view DOM) — the classic "which query do I need?" question.

### S.2 Change detection, Zone.js, and zoneless
- **Default strategy:** Zone.js monkey-patches async APIs (events, timers, promises, XHR); any of them firing triggers change detection **from the root over the whole component tree**, re-evaluating template expressions (why methods-in-templates are an anti-pattern, Ch.2.2).
- **`ChangeDetectionStrategy.OnPush`** (set in `@Component`): the component is checked only when ① an `@Input()`/`input()` **reference** changes (mutating the same object/array is invisible — spread into a new one), ② an event fires *inside* it, ③ an `async` pipe it uses emits, ④ a **signal** it reads changes, or ⑤ you call `ChangeDetectorRef.markForCheck()`.
- **Signals path:** signal reads register the component as a consumer, so Angular knows *exactly* which components to check — no tree walk. That's what makes **zoneless** possible: `provideZonelessChangeDetection()` in `bootstrapApplication` providers, drop the `zone.js` polyfill; events, signals, `async` pipe, and `markForCheck` become the only triggers (stable v20.2+, and the default in new v21+ apps).
- **Exam phrasing to expect:** "component doesn't update after mutating an array with OnPush — why?" → same reference; "which is NOT a change-detection trigger under OnPush?".

### S.3 HttpClient (the API every coding challenge uses)
- **Setup (standalone):** `provideHttpClient()` in the bootstrap `providers` — there is no `HttpClientModule` to import anymore (removed in v18+ style).
- **Typed calls:** `this.http.get<Job[]>('/api/jobs')` returns a **cold Observable** — nothing happens until subscribe; each subscribe = a new request (share with `shareReplay(1)` if needed). It emits **once then completes**, so no unsubscribe-leak worry for single calls.
- **Ergonomics:** `params: new HttpParams().set('q', term)` (immutable — chain the returns!), `headers: new HttpHeaders({...})`, `{ observe: 'response' }` for the full `HttpResponse`, errors arrive as `HttpErrorResponse` in the `error` callback / `catchError`.
- **Interceptors (functional, v15+):** `provideHttpClient(withInterceptors([authInterceptor]))` where `const authInterceptor: HttpInterceptorFn = (req, next) => next(req.clone({ setHeaders: { Authorization: 'Bearer …' } }))`. Requests are **immutable** — you must `clone()`. Classic uses: auth header, logging, global error toast, caching.
- **Signal bridge:** `jobs = toSignal(this.http.get<Job[]>('/api/jobs'), { initialValue: [] })` — one line from HTTP to template-ready signal.

### S.4 DI deep-dive — provider shapes, `InjectionToken`, hierarchy
- **Provider shapes** (`providers: [...]`): `MyService` (shorthand) ≡ `{ provide: MyService, useClass: MyService }`; swap implementations with `useClass`; alias with `useExisting`; constants with `useValue`; compute with `useFactory: (dep) => …, deps: […]`.
- **Non-class dependencies** (a config object, a URL string) can't use a TS interface as a token (interfaces vanish at runtime) → `export const API_URL = new InjectionToken<string>('api.url')`, provide `{ provide: API_URL, useValue: 'https://…' }`, consume `inject(API_URL)`.
- **Hierarchy:** resolution walks **component → parent components → route providers → root**. `providedIn: 'root'` = one tree-shakable app-wide instance (the norm); a component-level `providers: []` creates a **new instance per component** (each gets private state — how the Ch.5 quiz question about "each component gets its own copy" happens); `lazy`-loaded routes can scope services to a feature.
- **Resolution modifiers** with `inject()`: `inject(Foo, { optional: true })` (null instead of throw), `{ self: true }`, `{ skipSelf: true }`, `{ host: true }` — decorator equivalents `@Optional() @Self() @SkipSelf() @Host()`.

### S.5 Newer signal APIs (v19+ — appearing in exams as they stabilize)
- **`linkedSignal(() => source())`** — a **writable** signal that *resets* from a computation whenever its source changes, but can be locally overwritten in between. The canonical case: "selected item" that resets when the list reloads. `computed` = derived + read-only; `linkedSignal` = derived + writable.
- **`resource()` / `httpResource()`** — signal-native async loading: `user = httpResource<User>(() => `/api/users/${this.id()}`)` re-fetches automatically when `id()` changes and exposes `.value()`, `.isLoading()`, `.error()` signals (plus `.reload()`). Think "switchMap-on-a-signal without RxJS". (`httpResource` v19.2+; still maturing — know the shape, don't sweat minutiae.)
- **`afterRenderEffect()`** — effect that runs after the DOM renders (measuring layout etc.); the SSR-safe replacement for poking the DOM in `ngAfterViewInit`.

### S.6 RxJS beyond the chapter — Subjects & combination operators
- **`Subject`** = an Observable you push into manually (`subject.next(v)`) **and** can multicast to many subscribers (hot). Late subscribers get **nothing** until the next emission.
- **`BehaviorSubject(initial)`** = requires a start value, **replays the latest** value to every new subscriber, exposes `.value`. The pre-signals state-in-a-service pattern (Ch.5.2 caching) — and the exam's favorite "which Subject gives new subscribers the current value?" answer.
- **`ReplaySubject(n)`** = replays the last *n* values; **`AsyncSubject`** = emits only the final value on complete (rare).
- **`shareReplay(1)`** = turn a cold stream (e.g. `HttpClient`) into a cached shared one — dedupes N subscribers into one request.
- **Combination cheat-row:** `forkJoin([a$, b$])` waits for **all to complete**, emits once (Promise.all of RxJS — perfect for "fire 3 GETs, proceed when all done"); `combineLatest` re-emits latest-of-each on every emission (needs each to emit once first); `zip` pairs emissions index-by-index; `merge` interleaves; `concat` runs sequentially.
- **Flattening recap + the 4th one:** `switchMap` cancels the previous inner, `mergeMap` runs all concurrently, `concatMap` queues in order, **`exhaustMap` ignores new source emissions while the current inner is live** — the double-click/submit-spam guard.

### S.7 Router beyond the chapter — redirects, wildcards, children, preloading
- **Redirect & 404:** `{ path: '', redirectTo: '/home', pathMatch: 'full' }` — `pathMatch: 'full'` is **required** on empty-path redirects (prefix matching would match everything and loop). Wildcard **last**: `{ path: '**', component: PageNotFound }` (routes are first-match-wins, top-down — same top-down logic as the security matchers you know from Spring).
- **Child routes:** `children: [...]` render into a **nested `<router-outlet>`** inside the parent's template (layout-with-subpages); paths compose (`/admin` + `users` → `/admin/users`). Contrast `loadChildren: () => import('./admin/admin.routes')` — lazy-loads a whole child route array.
- **`routerLinkActive="active"`** adds a class when the link's route is active; `[routerLinkActiveOptions]="{ exact: true }"` stops `/` from matching everything — the "why is Home always highlighted?" bug.
- **Preloading:** lazy routes normally load on first navigation; `provideRouter(routes, withPreloading(PreloadAllModules))` downloads them in the background after startup — instant nav, small startup. (Custom strategies pick *which* to preload.)
- **Navigation guards return `UrlTree` too:** returning `router.parseUrl('/login')` from a guard redirects instead of just blocking — cleaner than injecting + calling `navigate` for side effects.

### S.8 Forms beyond the chapter — FormArray, async validators, set vs patch
- **`FormArray`** = the dynamic list: `aliases = this.fb.array([this.fb.control('')])`; template `@for (ctrl of aliases.controls; track $index)`; add/remove with `.push()`/`.removeAt(i)`. "Form where users add N phone numbers" → FormArray, every time.
- **`setValue` vs `patchValue`:** `setValue` demands the **complete** value shape (throws on missing keys — safety); `patchValue` updates any subset silently. `reset()` clears + returns to `pristine`/`untouched` (optionally to supplied values).
- **Async validators** (third argument: `this.fb.control('', [Validators.required], [uniqueEmailValidator])`) return `Observable<ValidationErrors|null>`/Promise; while pending, control status is **`PENDING`** (neither valid nor invalid — the MCQ trick). Pair with `updateOn: 'blur'` to avoid hammering the API per keystroke: `{ validators: […], asyncValidators: […], updateOn: 'blur' }`.
- **`ControlValueAccessor`** (know what it *is*): the interface (`writeValue`, `registerOnChange`, `registerOnTouched`, `setDisabledState`) that lets a **custom component** work with `ngModel`/`formControlName` — how every custom date-picker/star-rating plugs into both form systems.
- **Typed forms (v14+):** `FormControl<string>` infers through `.value`; `NonNullableFormBuilder` (or `{ nonNullable: true }`) makes `reset()` return the initial value instead of `null` — why `.getRawValue()` on our Ch.8 solutions is fully typed.

### S.9 Optimization & delivery (the "optimization techniques" bullet)
- **SSR + hydration:** `ng add @angular/ssr`; `provideClientHydration()` reuses the server-rendered DOM instead of destroying/re-rendering it — faster first paint, less flicker; **incremental hydration** (v19+) hydrates on `@defer`-style triggers. Event replay queues clicks that happen before hydration finishes.
- **`NgOptimizedImage`:** `<img ngSrc="hero.jpg" width="400" height="300" priority>` (import `NgOptimizedImage`) — enforces dimensions (no layout shift), lazy-loads non-priority images, warns on LCP misconfig. `priority` on the hero image is the headline exam fact.
- **Bundle budgets** (`angular.json` → `budgets`): build **warns/fails** when bundles exceed thresholds; `ng build` prod is the default config (tree-shaking, minification via esbuild). `ng build --configuration development` opts out.
- **The performance toolbox in one line each:** `@defer` (below-the-fold components) · route-level `loadComponent`/`loadChildren` (code splitting) · `withPreloading` (hide lazy latency) · OnPush/signals/zoneless (skip work) · `track` in `@for` (DOM reuse) · `shareReplay`/service caching (skip network) · SSR+hydration (first paint) · `NgOptimizedImage` (LCP).
- **Advanced CLI odds & ends:** `ng update` (migrates + rewrites code via schematics), `ng add` (install + configure), `ng g @angular/core:control-flow` (codemod to `@if`/`@for`), `ng build --stats-json` + esbuild analyzers for bundle forensics, multi-project **workspaces** (`projects/` + `ng g app`/`ng g library`).

### S.10 Security & template odds-and-ends (quick MCQ sweep)
- **Sanitization:** Angular auto-sanitizes interpolated/bound values by **context** (HTML/style/URL) — XSS-safe by default; `[innerHTML]` is sanitized too (scripts stripped). Escape hatch: `DomSanitizer.bypassSecurityTrust*()` — the answer to "how do you render trusted raw HTML," and the thing you almost never do.
- **`ViewEncapsulation`:** `Emulated` (default — scoped via generated `_ngcontent` attributes), `ShadowDom` (real shadow root), `None` (styles go global). Component styles don't leak out under Emulated; global styles still flow **in**.
- **Pure vs impure pipes:** pipes are **pure** by default — re-run only when the **input reference** changes (why mutating an array doesn't re-filter; also why pipes beat template methods). `pure: false` re-runs every CD cycle (how `async`/`json` behave; expensive — rare by design).
- **`async` pipe trifecta:** subscribes, unwraps, **auto-unsubscribes**, and marks OnPush components for check — the reason it's the default way to consume Observables in templates.
- **Two-way binding desugar:** `[(ngModel)]="x"` ≡ `[ngModel]="x" (ngModelChange)="x = $event"` — the "banana-in-a-box" MCQ, and the same contract `model()` implements for any `[(prop)]`.

### 🎯 Self-check questions for this supplement
- Multi-slot projection: how does content end up in `<ng-content select="[header]">`? (selector match or `ngProjectAs`)
- Under OnPush, why doesn't `this.items.push(x)` update the view? (same array reference)
- Which provider shape injects a plain config object? (`InjectionToken` + `useValue`)
- `computed` vs `linkedSignal`? (read-only derived vs writable-but-resets)
- Which Subject replays the latest value to late subscribers? (`BehaviorSubject`)
- Fire three requests, continue when **all** finish? (`forkJoin`)
- Why must an empty-path redirect set `pathMatch: 'full'`? (prefix match would always match)
- A control with a pending async validator — valid or invalid? (neither: `PENDING`)
- Default `ViewEncapsulation`? (`Emulated`)
- What three things does the `async` pipe do beyond unwrapping? (subscribe, unsubscribe, mark-for-check)

---

## Appendix — access & capture notes

- **Auth:** the training pages redirect to `/angular/login` when unauthenticated. The whole training renders server-side in a **Nuxt** app, so all chapter lesson text + links are in the initial HTML — one authenticated fetch captures the full syllabus. The `jwt` browser cookie authenticated the fetch on my side; **no separate login needed for me**. That cookie is session-scoped and will expire — re-capture needs a fresh one.
- **Blocked sources:** several `blog.angulartraining.com` posts sit behind Medium's `global-identity` login redirect that automated fetching can't follow (signal-based components tutorial, `ng-template`, union types, RxJS-in-5-min, `FormControl` tips). Those topics are summarized above from the official docs and sibling angulartraining newsletters instead; the original links are preserved so you can open them in a logged-in browser.
- **Coverage:** every external resource link in Chapters 0–8 is listed above (120 unique URLs); teaching content from the fetchable ones is distilled inline. Progress at capture: **7 / 49** lessons.
- **Supplement (2026-07-13):** audited the chapters against the official exam-topic list + Mid-Level focus areas (advanced CLI, component architecture, state management, complex routing, optimization) and authored the [Supplement](#supplement--exam-adjacent-topics-authored-not-in-the-chapters) covering every gap found: content projection, change detection/zoneless, HttpClient+interceptors, provider shapes/InjectionToken, linkedSignal/resource(), Subjects & combination operators, router redirects/children/preloading, FormArray/async validators, SSR/hydration/NgOptimizedImage/budgets, sanitization/encapsulation/pure pipes.
- **Trial exam:** the training also includes a shortened **trial exam** (a few MCQs + one simpler coding task). Its coding task — the **Job Search App** (DatePipe format bug + favorites truthiness bug) — is captured verbatim with a worked solution in [`angular-cert-practice.md` §9](angular-cert-practice.md). The trial MCQ set is the only remaining uncaptured artifact. Real-exam format for reference: **40 MCQs / 30 min / 29 to pass**, then **two StackBlitz coding tasks** (~105 min: a ~15-min bug fix + a feature build), with Angular/MDN docs available in-exam.
