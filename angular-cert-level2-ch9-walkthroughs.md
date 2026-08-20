# Level 2 · Chapter 9 — Car Configurator: Full Solution Walkthroughs

**Companion to:** [`angular-cert-level2-notes.md`](angular-cert-level2-notes.md) (§ Chapter 9)
**Style:** modern **standalone** Angular (v18+), **Signals**-first, `inject()`, new control flow (`@if`/`@for`).

> **What this is.** A complete, runnable reference solution for the 4-part Tesla-style
> "Car Configurator" challenge, with **every meaningful line explained**. The challenge
> boilerplate ships types and a stubbed `configurator.service`; the exact JSON field names
> in the graded project may differ slightly from what's shown here — treat the **shapes**
> as the contract and rename fields to match `src/app/models.type.ts` if needed. The logic,
> signal patterns, routing, and guards are what the exam is really testing.

---

## 0. The mental model

Four screens, one shared state object living in a **service** (so it survives navigation):

```
Step 1  ─ pick Model + Color ─────────────┐
Step 2  ─ pick Config + Options ──────────┤──►  ConfiguratorService (signals)
Step 3  ─ read-only summary + total price ┘         │
                                                    └─►  computed() total price
```

**Why signals?** Each screen both *reads* current state (to pre-select dropdowns) and
*writes* to it. Signals give us: (a) synchronous reads for template binding, (b) automatic
recomputation of the image and the total price via `computed()`, and (c) OnPush-friendly
change detection with zero manual `ChangeDetectorRef` calls.

### API contract (as used here)
- `GET http://localhost:4200/models` → `CarModel[]`
- `GET http://localhost:4200/options/:modelCode` → `CarOptions`
- Images live under `https://interstate21.com/tesla-app/images/` (the API returns image URLs / codes).

---

## 1. Data model — `src/app/models.type.ts`

```typescript
// A single paint color available for a model.
export interface Color {
  code: string;        // machine code, e.g. "white"
  description: string; // human label, e.g. "Pearl White Multi-Coat"
  price: number;       // surcharge in USD (0 for the free color)
  imageUrl: string;    // full car image for THIS model + color
}

// A car model plus the colors it can be painted.
export interface CarModel {
  code: string;        // e.g. "MODEL_X"  ← used in /options/:code
  description: string; // e.g. "Model X"
  colors: Color[];     // selectable paints
}

// One trim/config for a model (drives range, speed, price).
export interface Config {
  id: number;
  description: string; // e.g. "Performance"
  range: number;       // miles
  speed: number;       // mph (max speed)
  price: number;       // base price in USD for this config
}

// Response of /options/:modelCode
export interface CarOptions {
  configs: Config[];   // available trims
  yoke: boolean;       // is the yoke steering wheel available on this model?
  towHitch: boolean;   // is the tow hitch available on this model?
}
```

**Line-by-line intent**
- `Color.price` is a *surcharge* — the free color is `0`; premium paints add to the total.
- `CarModel.code` is the join key: you pass it to `/options/:code` in Step 2.
- `Config.price` is the trim's **base** price; the running total is `config.price + color.price + options`.
- `CarOptions.yoke` / `.towHitch` are **availability** flags — a checkbox only *appears* when its flag is `true`. The two paid options cost **$1,000 each**.

---

## 2. The state service — `src/app/configurator.service.ts`

This is the heart of the challenge. Shown in its **final** form (covers Parts 1–4); each block is annotated.

```typescript
import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { CarModel, CarOptions, Color, Config } from './models.type';

@Injectable({ providedIn: 'root' })          // one shared singleton for all steps
export class ConfiguratorService {
  private http = inject(HttpClient);          // functional DI (no constructor needed)

  // ── Step 1 state ─────────────────────────────────────────────
  // The boilerplate ships this: all models, loaded once from the API.
  // toSignal converts the one-shot HTTP Observable into a Signal<CarModel[]>.
  readonly allModels = toSignal(
    this.http.get<CarModel[]>('/models'),
    { initialValue: [] as CarModel[] },       // never undefined → templates stay simple
  );

  // Current selections are writable signals (null = "nothing picked yet").
  readonly currentModel = signal<CarModel | null>(null);
  readonly currentColor = signal<Color | null>(null);

  // ── Step 2 state ─────────────────────────────────────────────
  readonly currentConfig = signal<Config | null>(null);
  readonly hasYoke       = signal(false);      // is the $1,000 yoke selected?
  readonly hasTowHitch   = signal(false);      // is the $1,000 tow hitch selected?

  // Options for the chosen model (configs + availability flags), loaded on demand.
  readonly currentOptions = signal<CarOptions | null>(null);

  // ── Derived (computed) state ─────────────────────────────────
  // Total price recomputes automatically whenever any dependency signal changes.
  readonly totalPrice = computed(() => {
    const config = this.currentConfig();
    const color  = this.currentColor();
    if (!config) return 0;                     // no config yet → nothing to total
    return config.price
         + (color?.price ?? 0)                 // premium paint surcharge
         + (this.hasYoke()     ? 1000 : 0)     // each option is $1,000
         + (this.hasTowHitch() ? 1000 : 0);
  });

  // Convenience flags the guards and templates read.
  readonly isStep1Complete = computed(() => !!this.currentModel() && !!this.currentColor());
  readonly isStep2Complete = computed(() => !!this.currentConfig());

  // ── Actions (Step 1) ─────────────────────────────────────────
  selectModel(model: CarModel | null): void {
    this.currentModel.set(model);
    // BUG FIX #1 + #3: changing the model must reset everything downstream,
    // otherwise a tow hitch / config from the old model "sticks".
    this.currentColor.set(null);
    this.resetConfigStep();
    if (model) this.loadOptions(model.code);   // fetch this model's trims/options
    else this.currentOptions.set(null);
  }

  selectColor(color: Color | null): void {
    this.currentColor.set(color);
  }

  // ── Actions (Step 2) ─────────────────────────────────────────
  private loadOptions(modelCode: string): void {
    this.http
      .get<CarOptions>(`/options/${modelCode}`)
      .subscribe(options => this.currentOptions.set(options));
  }

  selectConfig(config: Config | null): void {
    this.currentConfig.set(config);
  }

  toggleYoke(checked: boolean): void      { this.hasYoke.set(checked); }
  toggleTowHitch(checked: boolean): void  { this.hasTowHitch.set(checked); }

  // Clears everything the config step owns (used on model change).
  private resetConfigStep(): void {
    this.currentConfig.set(null);
    this.hasYoke.set(false);
    this.hasTowHitch.set(false);
  }
}
```

**Why each choice matters**
- `providedIn: 'root'` → **singleton**: Step 1 writes, Step 3 reads the *same* instance. (If you provided it per-component, each screen would get its own empty copy — a classic bug.)
- `toSignal(http.get(...), {initialValue: []})` → the models list is a signal you can `@for` over directly; `initialValue` guarantees it's never `undefined`, so `@for (m of allModels(); ...)` never explodes on first render.
- `signal<T | null>(null)` for selections → `null` cleanly represents "not chosen", which the guards test.
- **`computed(totalPrice)`** is the Part-3 requirement done right: it *derives* from `currentConfig`, `currentColor`, `hasYoke`, `hasTowHitch`. Change any of them anywhere (even from Step 1) and Step 3's total updates with no manual wiring.
- `?? 0` and `?.` guard against `null` while a color/config isn't chosen yet.

---

## 3. Part 1 — Model & Color selection (`step1.component`)

**Requirements:** load models from `/models`; two dropdowns (model, color); show the correct image when both are chosen; hold state in signals.

```typescript
import { Component, computed, inject } from '@angular/core';
import { ConfiguratorService } from '../configurator.service';
import { CarModel, Color } from '../models.type';

@Component({
  selector: 'app-step1',
  standalone: true,
  templateUrl: './step1.component.html',
})
export class Step1Component {
  protected cfg = inject(ConfiguratorService);  // template reads cfg.* signals

  // The image to show = the selected color's imageUrl (only once a color is picked).
  protected imageUrl = computed(() => this.cfg.currentColor()?.imageUrl ?? '');

  // Dropdown change handlers translate the raw <select> value → the domain object.
  onModelChange(code: string): void {
    const model = this.cfg.allModels().find(m => m.code === code) ?? null;
    this.cfg.selectModel(model);                // service resets color/config (bug-safe)
  }

  onColorChange(code: string): void {
    const color = this.cfg.currentModel()?.colors.find(c => c.code === code) ?? null;
    this.cfg.selectColor(color);
  }
}
```

```html
<!-- step1.component.html -->
<label>
  Model
  <select data-test="model-selector"
          [value]="cfg.currentModel()?.code ?? ''"
          (change)="onModelChange($any($event.target).value)">
    <option value="" disabled>Choose a model</option>
    @for (model of cfg.allModels(); track model.code) {
      <option [value]="model.code">{{ model.description }}</option>
    }
  </select>
</label>

@if (cfg.currentModel(); as model) {           <!-- color list depends on chosen model -->
  <label>
    Color
    <select data-test="color-selector"
            [value]="cfg.currentColor()?.code ?? ''"
            (change)="onColorChange($any($event.target).value)">
      <option value="" disabled>Choose a color</option>
      @for (color of model.colors; track color.code) {
        <option [value]="color.code">{{ color.description }}</option>
      }
    </select>
  </label>
}

@if (imageUrl(); as url) {                       <!-- image only when a color is set -->
  <img [src]="url" alt="Selected car" data-test="car-image" />
}
```

**Line-by-line highlights**
- `[value]="cfg.currentModel()?.code ?? ''"` — **binds the select back to state**. This is what makes Part-4 **Bug #3** ("returning to Step 1 doesn't show the current selection") *not happen* in the first place: the dropdown is driven by the signal, so navigating back re-selects automatically.
- `(change)="onModelChange($any($event.target).value)"` — `<select>` emits the string `value`; `$any(...)` sidesteps the `EventTarget` typing in the template.
- `@for (... ; track model.code)` — `track` is **required** in the new control flow and should be a stable id.
- `@if (cfg.currentModel(); as model)` — colors can't be listed until a model exists; the `as model` alias avoids calling the signal twice.
- `computed(() => currentColor()?.imageUrl ?? '')` — image is **derived**, not stored; pick a new color and it updates for free.
- `data-test` attributes are kept verbatim (the grader queries them).

---

## 4. Part 2 — Config Options (`step2.component` + routing + guard)

**Requirements:** add `/step1` and `/step2` routes + nav links; **block Step 2 until car+color chosen**; fetch `/options/:modelCode`; show yoke/tow-hitch checkboxes **only when available** (unchecked by default, $1,000 each); on config select show range/speed/cost.

### 4a. Routes — `src/app/app.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { step2Guard } from './guards/step2.guard';
import { step3Guard } from './guards/step3.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'step1', pathMatch: 'full' },
  { path: 'step1', loadComponent: () => import('./step1/step1.component').then(m => m.Step1Component) },
  { path: 'step2', canActivate: [step2Guard],
    loadComponent: () => import('./step2/step2.component').then(m => m.Step2Component) },
  { path: 'step3', canActivate: [step3Guard],
    loadComponent: () => import('./step3/step3.component').then(m => m.Step3Component) },
];
```
- `canActivate: [step2Guard]` enforces "no Step 2 until Step 1 done" at the **router** level (defense the nav link can't bypass by typing the URL).
- `loadComponent` lazy-loads each step (standalone-component lazy loading — a Ch.6 concept reused here).

### 4b. Guard — `src/app/guards/step2.guard.ts`

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ConfiguratorService } from '../configurator.service';

export const step2Guard: CanActivateFn = () => {
  const cfg = inject(ConfiguratorService);     // functional guard → inject() inside
  const router = inject(Router);
  // Allowed only if Step 1 is complete; otherwise redirect back to Step 1.
  return cfg.isStep1Complete() ? true : router.createUrlTree(['/step1']);
};
```
- A **functional guard** (modern style): returns `true` to allow, or a `UrlTree` to redirect.
- Reads the `isStep1Complete` computed signal — single source of truth for "car + color chosen".

### 4c. Nav links — `app.component.html`

```html
<nav>
  <a routerLink="step1" routerLinkActive="active">1 · Model</a>
  <a routerLink="step2" routerLinkActive="active">2 · Config</a>
  <a routerLink="step3" routerLinkActive="active">3 · Summary</a>
</nav>
<router-outlet />
```
- `routerLink` for SPA nav; `routerLinkActive="active"` highlights the current step. (Even if the user clicks Step 2 early, the guard bounces them back.)

### 4d. Component — `step2.component`

```typescript
import { Component, inject } from '@angular/core';
import { ConfiguratorService } from '../configurator.service';
import { Config } from '../models.type';

@Component({ selector: 'app-step2', standalone: true, templateUrl: './step2.component.html' })
export class Step2Component {
  protected cfg = inject(ConfiguratorService);
  // Options were fetched by the service when the model was chosen in Step 1.

  onConfigChange(id: string): void {
    const config = this.cfg.currentOptions()?.configs.find(c => c.id === +id) ?? null;
    this.cfg.selectConfig(config);             // +id: <select> value is a string
  }
}
```

```html
<!-- step2.component.html -->
@if (cfg.currentOptions(); as options) {
  <label>
    Config
    <select data-test="config-selector"
            [value]="cfg.currentConfig()?.id ?? ''"
            (change)="onConfigChange($any($event.target).value)">
      <option value="" disabled>Choose a config</option>
      @for (config of options.configs; track config.id) {
        <option [value]="config.id">{{ config.description }}</option>
      }
    </select>
  </label>

  @if (cfg.currentConfig(); as config) {         <!-- show specs once a trim is picked -->
    <ul>
      <li>Range: {{ config.range }} miles</li>
      <li>Max speed: {{ config.speed }} mph</li>
      <li>Cost: {{ config.price | currency }}</li>
    </ul>
  }

  <!-- Options appear ONLY when the model supports them; unchecked by default -->
  @if (options.yoke) {
    <label>
      <input type="checkbox" data-test="yoke-checkbox"
             [checked]="cfg.hasYoke()"
             (change)="cfg.toggleYoke($any($event.target).checked)" />
      Yoke steering wheel (+{{ 1000 | currency }})
    </label>
  }
  @if (options.towHitch) {
    <label>
      <input type="checkbox" data-test="tow-hitch-checkbox"
             [checked]="cfg.hasTowHitch()"
             (change)="cfg.toggleTowHitch($any($event.target).checked)" />
      Tow hitch (+{{ 1000 | currency }})
    </label>
  }
}
```

**Highlights**
- `@if (options.yoke)` / `@if (options.towHitch)` — the checkbox **only renders** when the API says the option exists on this model (exactly the requirement). `[checked]` is bound to the signal so it reflects state (and resets to unchecked after a model change, per Bug #1).
- Specs (`range`/`speed`/`price | currency`) show only after a config is chosen (`@if (currentConfig())`).
- `+id` and `$any(...).checked` handle DOM string/boolean coercion.

---

## 5. Part 3 — Summary & Price (`step3.component` + guard)

**Requirements:** add `/step3`; block until Steps 1 & 2 complete; total via **`computed()`**; show each option's cost in **USD** + the total; going back and editing updates Step 3.

### 5a. Guard — `src/app/guards/step3.guard.ts`

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ConfiguratorService } from '../configurator.service';

export const step3Guard: CanActivateFn = () => {
  const cfg = inject(ConfiguratorService);
  const router = inject(Router);
  if (!cfg.isStep1Complete()) return router.createUrlTree(['/step1']);
  if (!cfg.isStep2Complete()) return router.createUrlTree(['/step2']); // BUG FIX #2
  return true;
};
```
- Two-stage check redirects to whichever step is unfinished. The `isStep2Complete` check is **Part-4 Bug #2** solved structurally: you cannot reach Step 3 without a config.

### 5b. Component — `step3.component`

```typescript
import { Component, inject } from '@angular/core';
import { ConfiguratorService } from '../configurator.service';

@Component({ selector: 'app-step3', standalone: true, templateUrl: './step3.component.html' })
export class Step3Component {
  protected cfg = inject(ConfiguratorService); // read-only screen: just reads signals
}
```

```html
<!-- step3.component.html -->
@if (cfg.currentModel(); as model) {
  <h2>{{ model.description }}</h2>

  @if (cfg.currentConfig(); as config) {
    <dl>
      <dt>Config ({{ config.description }})</dt> <dd>{{ config.price | currency }}</dd>

      @if (cfg.currentColor(); as color) {
        <dt>Color ({{ color.description }})</dt>  <dd>{{ color.price | currency }}</dd>
      }
      @if (cfg.hasYoke()) {
        <dt>Yoke steering wheel</dt>              <dd>{{ 1000 | currency }}</dd>
      }
      @if (cfg.hasTowHitch()) {
        <dt>Tow hitch</dt>                         <dd>{{ 1000 | currency }}</dd>
      }

      <dt><strong>Total</strong></dt>
      <dd data-test="total-price"><strong>{{ cfg.totalPrice() | currency }}</strong></dd>
    </dl>
  }
}
```

**Highlights**
- The whole screen is **read-only** — it binds signals, so editing Steps 1–2 and returning shows fresh numbers automatically (the "come back and see updated cost" requirement).
- Each line item is shown only when present (`@if` on color/yoke/tow hitch).
- `{{ ... | currency }}` formats USD (`$1,000.00`) — the challenge asks for "properly formatted USD".
- `cfg.totalPrice()` is the **`computed()`** signal from §2 — one declaration, always correct.

---

## 6. Part 4 — Bug Fixes (and why the above already fixes them)

The three reported bugs are all *state-lifecycle* bugs. The final service/guards above fix each; here's the mapping so you can articulate it in the exam:

| Bug | Symptom | Root cause | Fix (where) |
|---|---|---|---|
| **#1** | Tow hitch stays active after switching models (e.g. Model 3 shows a tow hitch it can't have) | Selecting a new model didn't reset option/config state | `selectModel()` calls `resetConfigStep()` **and** clears color — §2 |
| **#2** | Step 3 clickable before a config is chosen | Step-3 access only checked Step 1 | `step3Guard` also checks `isStep2Complete()` — §5a |
| **#3** | Returning to Step 1 doesn't show current model/color as selected | Dropdowns weren't bound back to state | `[value]` on both `<select>`s binds to `currentModel()/currentColor()` — §3 |

**The one-line principle:** *derive* what you can (`computed`), *bind both ways* (`[value]`/`[checked]` ↔ signals), and *centralize resets* in the service action that triggers them (`selectModel`). Do that and these bugs can't exist.

### If you must patch a buggy starter instead of rewriting
- **Bug #1:** in `selectModel`, after `currentModel.set(model)`, add `currentConfig.set(null); hasYoke.set(false); hasTowHitch.set(false); currentColor.set(null);` (and re-fetch options).
- **Bug #2:** add the `isStep2Complete()` redirect to `step3Guard` (or disable the Step 3 nav link with `[class.disabled]="!cfg.isStep2Complete()"` and a `CanActivate`).
- **Bug #3:** add `[value]="cfg.currentModel()?.code ?? ''"` / `[value]="cfg.currentColor()?.code ?? ''"` to the two selects.

---

## 7. Concepts this challenge exercises (exam cross-reference)

- **Signals**: `signal`, `.set`, `computed` (total price, completeness flags) — L2 §Ch2.4
- **Services & DI singleton**: shared `providedIn:'root'` state — L2 §Ch5
- **Router**: routes, `redirectTo`, `routerLink`/`routerLinkActive`, `<router-outlet>` — L2 §Ch6.1
- **Guards**: functional `CanActivateFn` returning `UrlTree` — L2 §Ch6.2
- **Lazy loading**: `loadComponent` per step — L2 §Ch6.3
- **Control flow**: `@if`/`@for (track)` — L2 §Ch2.3
- **Pipes**: `currency` for USD — L2 §Ch4.3
- **HttpClient + toSignal**: load `/models`, `/options/:code` — L2 §Ch7

> Rename fields to match the shipped `models.type.ts`, keep every `data-test` attribute, and
> you have a graded-challenge-ready solution that also reads as idiomatic modern Angular.
