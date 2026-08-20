# Angular Certification — Per-Chapter Practice Challenges (with solutions)

**Companion to:** [`angular-cert-level1-notes.md`](angular-cert-level1-notes.md) · [`angular-cert-level2-notes.md`](angular-cert-level2-notes.md) · [`angular-cert-level2-ch9-walkthroughs.md`](angular-cert-level2-ch9-walkthroughs.md) · 🎨 [`angular-cert-visual-guide.html`](angular-cert-visual-guide.html) *(interactive visualizers + quiz — open in any browser, zero dependencies)*

> **Why this file exists.** The official **Level 2** course only ships coding challenges for
> some chapters (Components, Directives/Pipes, Services, Router, RxJS, Forms + the Ch9
> roundup) — **Chapters 1 (Basics) and 3 (JS/TS) have none**, and **Level 1 has no coding
> challenges at all**. This file gives **every topic a hands-on challenge with a complete,
> runnable solution and an explanation of what it drills**, so you can practice each chapter
> end-to-end. All solutions use **modern standalone Angular (v18+), Signals, `inject()`, and
> new control flow**. Try each **before** reading its solution.

**How to run any of these:** `ng new practice --standalone`, drop the component in, or paste
into a fresh **StackBlitz** Angular project (the same editor the real exam uses).

**Index**
1. [Basics of Angular](#1--basics-of-angular) · 2. [Components](#2--components) · 3. [JavaScript & TypeScript](#3--javascript--typescript) · 4. [Directives & Pipes](#4--directives--pipes) · 5. [Services & DI](#5--services--dependency-injection) · 6. [Router](#6--router) · 7. [RxJS](#7--rxjs-observables) · 8. [Forms](#8--forms) · 9. [**Trial exam — Job Search App**](#9--trial-exam-coding-challenge--job-search-app-captured)

---

## 1 · Basics of Angular
*(no official challenge — this fills the gap)*

### 🧑‍💻 Challenge — "Bootstrap a standalone greeting"
Create a **standalone** root component `AppComponent` that:
1. Bootstraps **without any NgModule** (`bootstrapApplication`).
2. Shows a greeting whose name comes from a **signal**.
3. Has a button that cycles the greeting language (English → Spanish → French → back).
4. Uses the **new control flow** to show a 🎉 only when the language is French.

### ✅ Solution
```typescript
// main.ts — no AppModule anywhere
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent)
  .catch(err => console.error(err));            // always handle bootstrap rejection
```
```typescript
// app.component.ts
import { Component, computed, signal } from '@angular/core';

const HELLOS = ['Hello', 'Hola', 'Bonjour'] as const;  // literal tuple → typed values

@Component({
  selector: 'app-root',
  standalone: true,                             // v22 default, shown for clarity
  template: `
    <h1>{{ greeting() }}, Bobby!</h1>
    @if (isFrench()) { <p>🎉 Vive Angular</p> }
    <button (click)="next()">Change language</button>
  `,
})
export class AppComponent {
  private index = signal(0);                              // writable state
  protected greeting = computed(() => HELLOS[this.index()]);   // derived text
  protected isFrench = computed(() => this.greeting() === 'Bonjour');

  next(): void {
    this.index.update(i => (i + 1) % HELLOS.length);      // wrap around
  }
}
```
**Drills:** standalone bootstrap (no NgModule), `signal()`/`computed()`/`.update()`, `@if`, `as const` literal types. **Exam tie-in:** "which function bootstraps the app?" → `bootstrapApplication`.

---

## 2 · Components
*(reinforces the official "movie-item input" challenge)*

### 🧑‍💻 Challenge — "Star-rating component (input + output + signal)"
Build `<app-star-rating>` that:
1. Takes a **required** `max` input (number of stars) and an optional `value` input (default 0).
2. Renders `max` stars; the first `value` are filled (★), the rest empty (☆).
3. On clicking a star, sets the rating and **emits** a `rated` output with the new value.
4. Uses `@for` with `track`.

### ✅ Solution
```typescript
import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  template: `
    @for (star of stars(); track star) {
      <span (click)="rate(star)" style="cursor:pointer;font-size:1.5rem">
        {{ star <= current() ? '★' : '☆' }}
      </span>
    }
    <small>{{ current() }} / {{ max() }}</small>
  `,
})
export class StarRatingComponent {
  max = input.required<number>();               // build error if not provided
  value = input(0);                             // default 0

  protected current = signal(this.value());     // local editable copy of the input
  protected stars = () => Array.from({ length: this.max() }, (_, i) => i + 1); // [1..max]

  protected rated = output<number>();

  rate(star: number): void {
    this.current.set(star);                     // update view
    this.rated.emit(star);                      // notify parent
  }
}
```
```html
<!-- parent usage -->
<app-star-rating [max]="5" [value]="3" (rated)="onRated($event)" />
```
**Drills:** `input.required()`, default `input()`, `output()` + `emit`, `$event`, signal for local state, `@for (track)`. **Gotcha:** reading `this.value()` in a field initializer captures the *initial* input — fine here; for live sync you'd use a `computed` or `effect`. **Exam tie-in:** "decorator to pass data in" → `@Input`/`input()`.

---

## 3 · JavaScript & TypeScript
*(no official challenge — this fills the gap)*

### 🧑‍💻 Challenge — "Type-safe cart summary"
Given a `CartItem` union, write a **typed** `summarize(items)` that:
1. Uses a **discriminated union** for `physical` vs `digital` items (digital has no shipping).
2. Uses **destructuring with defaults** and the **`??`** operator.
3. Returns `{ count, total }` where physical items add `$5` shipping each.
4. Is fully typed — no `any`.

### ✅ Solution
```typescript
interface BaseItem { name: string; price: number; }
interface Physical extends BaseItem { kind: 'physical'; weight?: number; }
interface Digital  extends BaseItem { kind: 'digital'; }
type CartItem = Physical | Digital;             // discriminated union on `kind`

interface Summary { count: number; total: number; }

function summarize(items: CartItem[] = []): Summary {   // default param
  return items.reduce<Summary>(
    (acc, item) => {
      const { price = 0, kind } = item;         // destructuring + default
      const shipping = kind === 'physical' ? 5 : 0;  // narrowed by discriminant
      return { count: acc.count + 1, total: acc.total + price + shipping };
    },
    { count: 0, total: 0 },
  );
}

// Usage
const cart: CartItem[] = [
  { kind: 'physical', name: 'Mug', price: 12 },
  { kind: 'digital',  name: 'E-book', price: 8 },
];
const { total } = summarize(cart);              // total = 12 + 5 + 8 = 25
console.log(total ?? 'n/a');                     // 25
```
**Drills:** discriminated unions + narrowing (`kind === 'physical'` unlocks `weight`), destructuring with defaults, `??`, generics on `reduce<Summary>`, default parameters, no `any`. **Exam tie-in:** "which code does not compile?" / "type of the variable?" — reading narrowed types.

---

## 4 · Directives & Pipes
*(reinforces the official highlight + pipe challenges)*

### 🧑‍💻 Challenge — "Custom `appTooltip` directive + `truncate` pipe"
1. **Directive** `[appTooltip]`: on **mouseenter**, set the host's `title` to the directive's input string; clear on **mouseleave** (use the modern `host` object, not decorators).
2. **Pipe** `truncate`: `{{ text | truncate:10 }}` cuts to N chars and appends `…` if longer (default N = 20).

### ✅ Solution
```typescript
// tooltip.directive.ts
import { Directive, ElementRef, inject, input } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true,
  host: {                                       // modern replacement for @HostListener
    '(mouseenter)': 'show()',
    '(mouseleave)': 'hide()',
  },
})
export class TooltipDirective {
  appTooltip = input('');                       // the tooltip text
  private el = inject(ElementRef<HTMLElement>);

  show(): void { this.el.nativeElement.title = this.appTooltip(); }
  hide(): void { this.el.nativeElement.removeAttribute('title'); }
}
```
```typescript
// truncate.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncate', standalone: true })   // pure by default → cheap
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit = 20): string {
    if (!value) return '';
    return value.length > limit ? value.slice(0, limit) + '…' : value;
  }
}
```
```html
<p [appTooltip]="'Full product name here'">{{ 'Full product name here' | truncate:10 }}</p>
<!-- renders: "Full produ…" with a hover title of the full text -->
```
**Drills:** attribute directive, `host` bindings, `inject(ElementRef)`, `input()` on a directive, custom pipe implementing `PipeTransform`, default pipe param, purity. **Exam tie-in:** "correct pipe parameter syntax" → `value | pipe:arg`.

---

## 5 · Services & Dependency Injection
*(reinforces the official favorites challenge)*

### 🧑‍💻 Challenge — "Singleton `CartService` with signal state"
Create `CartService` (`providedIn:'root'`) that:
1. Holds items in a **signal** array.
2. `add(item)`, `remove(id)`, and a **`computed`** `total`.
3. Is injected with `inject()` into a component that shows the count + total.
4. Proves it's a **singleton** (two components share state).

### ✅ Solution
```typescript
// cart.service.ts
import { Injectable, computed, signal } from '@angular/core';

export interface Item { id: number; name: string; price: number; }

@Injectable({ providedIn: 'root' })             // one instance app-wide
export class CartService {
  private _items = signal<Item[]>([]);          // private writable
  readonly items = this._items.asReadonly();    // expose read-only
  readonly total = computed(() => this._items().reduce((s, i) => s + i.price, 0));

  add(item: Item): void {
    this._items.update(list => [...list, item]);        // immutable update
  }
  remove(id: number): void {
    this._items.update(list => list.filter(i => i.id !== id));
  }
}
```
```typescript
// any.component.ts
import { Component, inject } from '@angular/core';
import { CartService } from './cart.service';

@Component({
  selector: 'app-cart-badge',
  standalone: true,
  template: `<span>{{ cart.items().length }} items — {{ cart.total() | currency }}</span>`,
})
export class CartBadgeComponent {
  protected cart = inject(CartService);         // same instance everywhere
}
```
**Drills:** `providedIn:'root'` singleton, `signal` + `.asReadonly()` encapsulation, immutable `.update()`, `computed` derived total, `inject()`. **Exam tie-in:** "how many instances of a root service?" → **one**.

---

## 6 · Router
*(reinforces the official movie-details routing challenge)*

### 🧑‍💻 Challenge — "Guarded, lazy, param-bound product routes"
1. Routes: `/products` (list), `/products/:id` (**lazy-loaded** detail), `**` → a 404 component.
2. The detail route **binds `:id` to a component input** (no `ActivatedRoute` injection).
3. A `authGuard` (functional) blocks `/products` unless a signal `isLoggedIn` is true, else redirects to `/login`.

### ✅ Solution
```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./login.component').then(m => m.LoginComponent) },
  { path: 'products', canActivate: [authGuard],
    loadComponent: () => import('./products.component').then(m => m.ProductsComponent) },
  { path: 'products/:id', canActivate: [authGuard],
    loadComponent: () => import('./product-detail.component').then(m => m.ProductDetailComponent) },
  { path: '**', loadComponent: () => import('./not-found.component').then(m => m.NotFoundComponent) },
];
```
```typescript
// main.ts — enable input binding for route params
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes, withComponentInputBinding())],  // ← binds :id to inputs
});
```
```typescript
// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};
```
```typescript
// product-detail.component.ts — no ActivatedRoute needed
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  template: `<h2>Product #{{ id() }}</h2>`,
})
export class ProductDetailComponent {
  id = input.required<string>();                // populated from the :id path param
}
```
**Drills:** `Routes`, `redirectTo`/`pathMatch`, `**` wildcard, `loadComponent` lazy loading, `withComponentInputBinding()` (route param → input), functional `CanActivateFn` returning a `UrlTree`. **Exam tie-in:** "which component renders at `/products/21`?" and "requirement for `loadComponent`?" (standalone).

---

## 7 · RxJS Observables
*(reinforces the official async-pipe challenge)*

### 🧑‍💻 Challenge — "Debounced type-ahead search with `switchMap`"
Given a search `FormControl`, build an `Observable<string[]>` `results$` that:
1. Debounces keystrokes by 300 ms and ignores unchanged values.
2. Uses **`switchMap`** to cancel the previous HTTP call.
3. Recovers from errors with **`catchError`** (empty list).
4. Is rendered with the **`async` pipe** (no manual subscribe/unsubscribe).

### ✅ Solution
```typescript
import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [ReactiveFormsModule, AsyncPipe],
  template: `
    <input [formControl]="query" placeholder="Search…" />
    <ul>
      @for (r of results$ | async; track r) { <li>{{ r }}</li> }
    </ul>
  `,
})
export class SearchComponent {
  private http = inject(HttpClient);
  protected query = new FormControl('', { nonNullable: true });

  protected results$ = this.query.valueChanges.pipe(
    debounceTime(300),                          // wait for a pause in typing
    distinctUntilChanged(),                     // skip if the text didn't change
    switchMap(term =>                           // cancel prior request on new term
      term
        ? this.http.get<string[]>(`/api/search?q=${term}`).pipe(
            catchError(() => of([])),           // on error → empty list, stream survives
          )
        : of([]),                               // empty query → no results
    ),
  );
}
```
**Drills:** `valueChanges`, `debounceTime`/`distinctUntilChanged`, **`switchMap`** (cancel-and-refetch), `catchError` + `of`, the **`async` pipe** (auto-unsubscribe → no leak). **Exam tie-in:** "common use case for `switchMap`" and "what does `.pipe()` do?".

---

## 8 · Forms
*(reinforces the official filter challenge)*

### 🧑‍💻 Challenge — "Reactive signup form with a custom cross-field validator"
Build a reactive form with `email`, `password`, `confirm` that:
1. `email` required + email format; `password` required + `minLength(8)`.
2. A **custom group validator** `passwordsMatch` flags a mismatch.
3. Shows errors only after a field is **touched**.
4. Disables submit while invalid; logs the value on submit.

### ✅ Solution
```typescript
import { Component, inject } from '@angular/core';
import {
  AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators,
} from '@angular/forms';

// Cross-field validator: attached to the FormGroup, compares two controls.
function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const pw = group.get('password')?.value;
  const cf = group.get('confirm')?.value;
  return pw === cf ? null : { mismatch: true };  // null = valid
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <input formControlName="email" placeholder="Email" />
      @if (form.controls.email.touched && form.controls.email.invalid) {
        <small>Valid email required</small>
      }

      <input type="password" formControlName="password" placeholder="Password" />
      @if (form.controls.password.touched && form.controls.password.errors?.['minlength']) {
        <small>Min 8 characters</small>
      }

      <input type="password" formControlName="confirm" placeholder="Confirm" />
      @if (form.touched && form.errors?.['mismatch']) {
        <small>Passwords do not match</small>
      }

      <button [disabled]="form.invalid">Sign up</button>
    </form>
  `,
})
export class SignupComponent {
  private fb = inject(FormBuilder);

  protected form = this.fb.group(
    {
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm:  ['', Validators.required],
    },
    { validators: passwordsMatch },              // group-level validator
  );

  submit(): void {
    if (this.form.valid) console.log(this.form.getRawValue());
  }
}
```
**Drills:** `FormBuilder`, `Validators` (required/email/minLength), a **group-level custom validator** returning `ValidationErrors | null`, reading `.touched`/`.invalid`/`.errors`, `[disabled]` on submit, `getRawValue()`. **Exam tie-in:** "service to create reactive forms" → `FormBuilder`; "which CSS class isn't auto-managed" (real: `ng-touched`, `ng-dirty`, `ng-valid`).

---

## 9 · Trial-exam coding challenge — "Job Search App" (captured)
*(the actual coding challenge from the free trial exam — captured verbatim, solution worked below)*

> **Where this sits in the program.** The trial exam is a shortened dry-run of the real
> Mid-Level exam: fewer multiple-choice questions plus **one simpler coding task** — this one.
> The **real** exam is 40 MCQs in 30 minutes (need **29/40**) followed by **two** StackBlitz
> coding tasks (~105 min total): ① find-and-fix a bug in an existing app (~15 min), ② implement
> a feature from requirements. A toolbar gives you the task text, Angular docs, and MDN during
> the exam — so it tests *applying* docs, not memorizing them.

### 🧑‍💻 The challenge (verbatim)

> **Job Search App Code Challenge** — This is a simple Job Search that allows you to list, see
> details, and create a list of favorite jobs. However, there are currently some issues. Your
> task is to figure out why the issues exist and fix them!
>
> **Requirements**
> 1. Fix the bug causing the date format to not be `"02/24/2024"` on the job details screen
>    (two digits for day and month, year has 4 digits). 💡 *HINT: How do we format dates with Angular?*
> 2. Fix the bug causing the favorites rendering to be broken on the jobs page. There are no
>    favorites by default so all "star" icons on the jobs page must be **white, not yellow**.
> 3. Do **NOT** rename any existing variables.
> 4. Use proper types for your data. Do **NOT** use `any` or `Object` or `{}` as data types.
>
> **Other considerations:** keep any `data-test` attributes (removing them can invalidate your
> submission); code is linted — follow best practices.

### 🔍 What it's actually testing
Two tiny bugs, each mapping to one exam topic:
| Bug | Topic drilled |
|---|---|
| Wrong date format | **`DatePipe` format strings** (Ch.4 Pipes) |
| Stars yellow with zero favorites | **JS truthiness / state derivation** (Ch.3 + Ch.5) |

Plus two meta-requirements: **typing discipline** (write an interface instead of `any`) and
**not breaking the grader** (`data-test` attributes, no renames — the grader queries by them).

### ✅ Fix 1 — the date format (`DatePipe`)
The details template formats the date wrong — typically one of these starters:
```html
<!-- ① no pipe at all → prints the raw ISO string "2024-02-24T00:00:00Z" -->
<p>{{ job().publishedAt }}</p>
<!-- ② default pipe → "Feb 24, 2024" (mediumDate), not what's asked -->
<p>{{ job().publishedAt | date }}</p>
```
The fix is a **custom format string** on `DatePipe`:
```html
<p data-test="job-date">{{ job().publishedAt | date:'MM/dd/yyyy' }}</p>
```
```typescript
// details.component.ts — standalone components must import the pipe they use
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-job-details',
  imports: [DatePipe],          // ← forget this and the template won't compile
  templateUrl: './details.component.html',
})
```
**Format-token traps (favorite MCQ material):**
- `MM` = 2-digit **month**, `mm` = 2-digit **minutes** — `'mm/dd/yyyy'` gives you *minutes*/day/year and still renders, so it "works" until you look closely.
- `dd` = 2-digit day (`d` = 1-digit); `yyyy` = 4-digit year. Capital `YYYY` is the ISO *week-numbering* year — wrong around New Year.
- Equivalent in code (not needed here): `formatDate(value, 'MM/dd/yyyy', 'en-US')` from `@angular/common`.

### ✅ Fix 2 — the favorites stars (truthiness bug)
"All stars yellow even though favorites start empty" means the *favorite?* check returns a
**truthy value for non-favorites**. The classic shapes (find yours by reading the star's
binding, then the method behind it):
```typescript
// ① THE classic: indexOf as a boolean — indexOf returns -1 when absent, and -1 is TRUTHY
isFavorite(job: Job) {
  return this.favorites.indexOf(job);      // ❌ -1 → truthy → every star lights up
}
// ② inverted binding in the template
[class.favorite]="!isFavorite(job)"        // ❌ negation flipped
// ③ ternary with the images swapped
[src]="isFavorite(job) ? 'white-star.svg' : 'yellow-star.svg'"   // ❌ arms reversed
```
Canonical fix — return a real `boolean`, comparing by **id** (not object reference, which
breaks the moment the list is re-fetched):
```typescript
isFavorite(job: Job): boolean {
  return this.favorites().some(f => f.id === job.id);   // ✅ true/false, id-based
}
```
```html
<!-- keep the data-test attribute exactly as shipped -->
<span class="star" data-test="favorite-star"
      [class.favorite]="jobsService.isFavorite(job)"
      (click)="jobsService.toggleFavorite(job)">★</span>
```
```css
.star { color: white; }          /* default: not a favorite */
.star.favorite { color: gold; }  /* only when the check is true */
```

### ✅ Requirement 4 — proper types (the part people lose points on)
The starter fetches jobs; type the whole pipeline instead of `any`:
```typescript
// job.type.ts — field names must match the starter's API payload
export interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  publishedAt: string;   // ISO date string — DatePipe accepts string | number | Date
}
```
```typescript
// jobs.service.ts — a signal-based favorites store (Level-2 house style)
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })            // one instance app-wide
export class JobsService {
  private http = inject(HttpClient);

  jobs = signal<Job[]>([]);
  favorites = signal<Job[]>([]);               // starts EMPTY → all stars white

  loadJobs(): void {
    this.http.get<Job[]>('/api/jobs')          // ← typed request, no `any` anywhere
      .subscribe(jobs => this.jobs.set(jobs));
  }

  isFavorite(job: Job): boolean {
    return this.favorites().some(f => f.id === job.id);
  }

  toggleFavorite(job: Job): void {
    this.favorites.update(favs =>
      this.isFavorite(job) ? favs.filter(f => f.id !== job.id) : [...favs, job]);
  }
}
```
**Drills:** `DatePipe` format strings + standalone pipe imports, truthiness (`indexOf` ≠ boolean), id-based comparison over reference equality, typed `HttpClient` calls, interface-first modeling, signal state.

> ⚠️ **Reconstruction caveat** (same as Ch9): the requirement text above is verbatim, but the
> starter's internals (exact field names, whether stars are `<img>` swaps or a CSS class) vary —
> when you open the real StackBlitz, match names to the shipped files. The two bug *categories*
> and their fixes are what's being graded and won't change.

---

## Practice coverage map

| Chapter / topic | Official challenge? | Practice here |
|---|---|---|
| 1 · Basics | ❌ none | ✅ standalone bootstrap greeting |
| 2 · Components | ✅ movie-item | ✅ star-rating (input/output/signal) |
| 3 · JS & TS | ❌ none | ✅ typed cart summary (unions/destructuring) |
| 4 · Directives & Pipes | ✅ highlight + pipes | ✅ tooltip directive + truncate pipe |
| 5 · Services & DI | ✅ favorites | ✅ singleton CartService |
| 6 · Router | ✅ movie-details | ✅ guarded lazy param-bound routes |
| 7 · RxJS | ✅ async pipe | ✅ debounced switchMap search |
| 8 · Forms | ✅ filters | ✅ signup + cross-field validator |
| 9 · Roundup | ✅ Car Configurator | see [ch9-walkthroughs](angular-cert-level2-ch9-walkthroughs.md) |
| Trial exam | ✅ Job Search App | ✅ captured verbatim + worked solution (above) |

Every chapter now has at least one runnable, exam-flavored coding exercise with a worked
solution — and the trial exam's coding challenge is captured with its fixes. The only training
artifact not in these notes is the trial exam's multiple-choice question set.
