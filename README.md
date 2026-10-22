<p align="center">
  <img src="assets/logo.png" alt="Blush CSS logo" width="128" />
</p>

<h1 align="center">Blush CSS</h1>

<p align="center">
  <strong>A reset with superpowers.</strong><br />
  Pretty &amp; semantic by default.
</p>

<p align="center">
  Good HTML looks right out of the box; classes only add layout and tone.
</p>

<p align="center">
  <a href="https://github.com/forwalk-org/blush-css/blob/main/LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-e11d48" /></a>
  <img alt="Built on Tailwind CSS v4" src="https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss&amp;logoColor=white" />
  <img alt="Classless" src="https://img.shields.io/badge/classless-by_default-1f2937" />
  <img alt="No JavaScript" src="https://img.shields.io/badge/JavaScript-none-1f2937" />
</p>

<p align="center">
  <a href="https://forwalk-org.github.io/blush-css/">Website</a> &middot;
  <a href="https://forwalk-org.github.io/blush-css/demo/blush-demo.html">Full component demo</a> &middot;
  <a href="#quick-start">Quick start</a> &middot;
  <a href="#two-ways-to-use-blush">Two ways to use Blush</a> &middot;
  <a href="#themes-and-tokens">Themes</a> &middot;
  <a href="#classes">Classes</a> &middot;
  <a href="#license">License</a>
</p>

---

- No classes required for clean, semantic HTML
- One stylesheet, no JavaScript
- Standalone, or the foundation of a Tailwind project

A classless CSS framework built on Tailwind CSS v4 (`@apply`). Reach for utilities only to structure layout or apply semantic tones to components and text.

Blush works two ways: as a **standalone stylesheet** (one compiled file, no Tailwind in your project), or as the **foundation of a Tailwind project**, where it gives you a reasonable, pretty default plus themed design tokens, and Tailwind's own utilities do the rest. See [Two ways to use Blush](#two-ways-to-use-blush).

```html
<link rel="stylesheet" href="dist/blush.css" />

<main class="wrapper stack">
  <h1>Hello</h1>
  <p>Plain HTML, styled.</p>
  <button>Save</button>
  <button class="outlined negative">Delete</button>
</main>
```

## The design philosophy

**Minimalist, spacious, semantic.**

Blush CSS stems from a simple core idea: semantic HTML should be naturally beautiful and well-crafted out of the box, without forcing you to clutter tags with utility classes. It embraces a minimalist aesthetic and an airy feel through generous spacing and fluid typography. By driving visual states directly through ARIA attributes and `role` semantics, accessibility and aesthetics become inextricably linked—ensuring that a well-structured document is visually expressive by default.

Utilities aren't meant to style every single element—they are a curated boutique designed for just two purposes: building layout structure (`.wrapper`, `.stack`, `.cluster`, `.auto-grid`) and adding a quick touch of sparkle and character through semantic tones (`.positive`, `.negative`, `.warning`, `.accent`, `.muted`). And whenever you need a bespoke exception or fine-tuned control, the full power and flexibility of Tailwind CSS v4 sits right under the hood, ready to use.

## The rule

> **Attributes say what it is. Classes say how it looks.**
>
> Attributes (`aria-*`, `role`, `data-theme`) say what something **is** or what
> **state** it is in. Classes adjust layout or express a tone.

## Quick start

```sh
npm install tailwindcss @tailwindcss/cli
npx @tailwindcss/cli -i src/blush.css -o dist/blush.css            # development
npx @tailwindcss/cli -i src/blush.css -o dist/blush.css --minify   # production
```

Switch theme with `data-theme` on `<html>` or on any container:

```html
<html lang="en" data-theme="dark">
  <section data-theme="primary">…</section>
  <!-- nested themes repaint their own surface -->
</html>
```

## Two ways to use Blush

### 1. Standalone `project.css`

Compile Blush once and link the result. Your pages get the reset, the semantic styles, the four themes and Blush's opt-in classes (`.wrapper`, `.stack`, `.positive`, `.outlined`, …). Nothing else is needed: no Tailwind in your project, no build step on your side.

```html
<link rel="stylesheet" href="dist/blush.css" />
```

### 2. As the foundation of a Tailwind project

If your project already uses Tailwind CSS v4, import Blush's modules after Tailwind. Blush becomes a **reset with superpowers**: semantic HTML looks right from the first line, and every Blush token is also a Tailwind token, so you keep building with Tailwind's utilities on top of a themed default.

```css
/* app.css */
@import 'tailwindcss';

/* Foundation: tokens, themes, reboot and semantic styles */
@import './blush/src/theme/tokens.css';
@import './blush/src/theme/derived.css';
@import './blush/src/theme/themes.css';
@import './blush/src/theme/icons.css';
@import './blush/src/base/reboot.css';
@import './blush/src/semantic/hero.css';
@import './blush/src/semantic/typography.css';
/* … the other semantic/ files, in the order listed in src/blush.css */

/* Optional: Blush's own classes. Leave them out to use Tailwind alone. */
/* @import './blush/src/utilities/tone.css'; */
/* @import './blush/src/utilities/outlined.css'; */
```

Import the modules rather than `src/blush.css`: that entry file imports Tailwind itself with `source(none)`, and in your project Tailwind is already there, with your own sources. Import Blush's utilities before your own custom ones so yours win at equal specificity.

**Blush's classes are optional.** The components read plain custom properties, so Tailwind can drive them directly:

```html
<!-- a tone without .positive: --tone is just a custom property -->
<button class="[--tone:var(--color-valid)]">Approve</button>

<!-- layout dials and Tailwind utilities side by side -->
<section
  class="bg-surface-soft border border-border rounded-control p-6 [--layout-gap:2rem]"
>
  <h2 class="text-accent">Plain HTML, Tailwind on top</h2>
  <div class="flex items-center gap-3">…</div>
</section>
```

#### Theme tokens as Tailwind utilities

Blush registers its semantic tokens in Tailwind (`@theme static`), so they become utilities. Tailwind puts the property first: the token `--color-accent` gives `bg-accent`, `text-accent`, `border-accent`, `ring-accent`, `fill-accent`, with opacity modifiers (`bg-accent/10`) like any color.

| Token                                               | Utilities                                                  |
| --------------------------------------------------- | ---------------------------------------------------------- |
| `--color-accent`                                    | `bg-accent` `text-accent` `border-accent` `ring-accent`    |
| `--color-accent-soft`                               | `bg-accent-soft`                                           |
| `--color-surface`                                   | `bg-surface`                                               |
| `--color-surface-soft`                              | `bg-surface-soft`                                          |
| `--color-text`                                      | `text-text`                                                |
| `--color-muted`                                     | `text-muted`                                               |
| `--color-border`                                    | `border-border` `divide-border`                            |
| `--color-contrast`                                  | `text-contrast` (text over accent / valid / invalid fills) |
| `--color-valid` `--color-invalid` `--color-warning` | `bg-valid` `text-invalid` `border-warning` …               |
| `--radius-control`                                  | `rounded-control`                                          |
| `--font-sans` `--font-mono`                         | `font-sans` `font-mono`                                    |

The tokens are CSS variables resolved where the class is used, so they follow the active theme: set `data-theme="dark"` on `<html>` or on any container and `bg-surface`, `text-accent` and the rest repaint with it. There is no `dark:` variant to write. Variables are always emitted; a utility is generated only when your markup uses it.

## Structure

```
src/
  blush.css              entry point: imports everything, in order
  theme/                 layer: theme
    tokens.css           token names registered in Tailwind (@theme)
    derived.css          default formulas for derived colors, fonts, hero scrim, rhythm
    themes.css           light, dark, primary, secondary (+ how to write yours)
    icons.css            SVG icons as data-URIs
  base/                  layer: base
    reboot.css           page colors, font, selection, nested themes
  semantic/              layer: components - NO classes
    hero.css             header[role="banner"]
    typography.css       headings, text, lists, code, table
    layout.css           main, article, aside, nav, page header and footer
    media.css            figure, picture, iframe, embed
    data.css             progress, meter, mark, time, quotes, abbr
    buttons.css          button, [role="button"], input[type=submit|button|reset]
    forms/
      fields.css         label, inputs, select, textarea, aria-invalid, fieldset
      choices.css        checkbox, radio, switch
      range.css          input[type=range]
    group.css            [role="group"]: stepper, segmented control
    containers.css       details, dialog, menu
    feedback.css         aria-expanded/selected/current, role=alert|status
    busy.css             [aria-busy="true"]
  utilities/             layer: utilities - opt-in classes
    tone.css             .positive .negative .warning .accent .muted
    outlined.css         .outlined
    media.css            .cover .overlay .overlay-<position>
    layout.css           .wrapper .wrapper.wide .stack .cluster .auto-grid
dist/
  blush.css              compiled with Tailwind v4
```

Layer order is the one Tailwind declares: `theme, base, components, utilities`.

| Layer        | Holds                                                                                                             |
| ------------ | ----------------------------------------------------------------------------------------------------------------- |
| `theme`      | design tokens only: colors, radius, fonts, icons                                                                  |
| `base`       | reboot: page background, selection, nested themes                                                                 |
| `components` | semantic styles: native elements, `role` and `aria-*` states. No classes are required, none are used as selectors |
| `utilities`  | opt-in classes: tones, outlined buttons, media overlays, layout                                                   |

Utilities sit in the highest layer, so they win without `!important`.

## Themes and tokens

Four built-in themes: `light` (the default, on `:root`), `dark`, `primary` and `secondary`.

A theme sets the **public tokens** (required):

| Token              | Meaning                                       |
| ------------------ | --------------------------------------------- |
| `--color-accent`   | brand color, default button fill              |
| `--color-surface`  | page background                               |
| `--color-text`     | body text                                     |
| `--color-contrast` | text on top of accent / valid / invalid fills |
| `--color-invalid`  | error / destructive                           |
| `--color-valid`    | success                                       |
| `--color-warning`  | caution                                       |
| `--radius-control` | corner radius of buttons and fields           |

and may override any **derived token** (optional). Derived tokens a theme leaves out are computed from the public ones by the formulas in `theme/derived.css`, so a theme with eight values is already complete:

- base: `--color-muted`, `--color-border`, `--color-surface-soft`, `--color-accent-soft`, `--color-heading`
- forms: `--color-field`, `--color-field-hover`, `--color-field-border`, `--color-field-border-hover`, `--color-focus-ring`, `--color-valid-ring`, `--color-invalid-ring`
- choices and range: `--color-choice` (checked fill, defaults to the accent), `--color-choice-border-hover`, `--color-choice-check`, `--color-range-track` (`-hover`, `-active`), `--color-range-glow`

Fonts are optional too: `--font-text` (page text, buttons and fields; default the system sans, `--font-sans`), `--font-heading` (h1-h6, follows `--font-text`) and `--font-hero` (headings inside `<header role="banner">`, follows `--font-heading`). Blush ships no web font: to use one, load it in your page and set the variable in a theme. The hero scrim is `--hero-overlay`.

Derived tokens are declared on `[data-theme]`, not only on `:root`: a custom property that contains `var()` is resolved where it is declared, so every element that carries a theme recomputes its own derived colors. Only the public tokens, `--color-muted`, `--color-border`, `--color-surface-soft` and `--color-accent-soft` are registered in Tailwind (`bg-accent`, `text-muted`, `border-border`, `rounded-control`, …); the rest are plain custom properties read through `var()`.

## What is styled without classes

| Area       | Elements, roles and states                                                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Text       | `h1`–`h6` (fluid scale), `hgroup` (eyebrow, title, subtitle), `p`, `a`, `ul` `ol` `dl`, `ins` `del`, `code` `kbd` `samp` `pre`, `table`               |
| Page       | `main`, `article`, `aside`, `nav`, page-level `header` and `footer`, `header[role="banner"]` (hero)                                                   |
| Media      | `figure`, `picture`, `iframe`, `embed`                                                                                                                |
| Data       | `progress`, `meter`, `mark`, `time`, `data`, `blockquote`, `q`, `cite`, `abbr`                                                                        |
| Buttons    | `button`, `[role="button"]`, `input[type=submit\|button\|reset]`, file selector                                                                       |
| Forms      | `label`, text/search/date/time/number inputs, `select`, `textarea`, `small` helper text, `fieldset`, checkbox, radio, switch (`role="switch"`), range |
| Containers | `details`/`summary`, `dialog` (modal and `role="region"` banner), `menu` (`role="menu"`)                                                              |
| Groups     | `[role="group"]`: stepper, input + button, segmented control                                                                                          |
| States     | `aria-busy`, `aria-invalid`, `aria-disabled`, `aria-pressed`, `aria-selected`, `aria-current`, `aria-expanded`, `disabled`, `fieldset[disabled]`      |
| Notices    | `role="alert"` and `role="status"`                                                                                                                    |

Every interactive element has a `:focus-visible` style, disabled is covered in its three forms (native, ARIA, inherited from a fieldset), and motion respects `prefers-reduced-motion`.

## Classes

### Tone and text color

| Class       | Sets                              | Use                                     |
| ----------- | --------------------------------- | --------------------------------------- |
| `.positive` | tone `--color-valid`              | success / confirm                       |
| `.negative` | tone `--color-invalid`            | danger / destructive                    |
| `.warning`  | tone `--color-warning`            | caution                                 |
| `.accent`   | filled button in the current tone | promote a neutral button, undo `.muted` |
| `.muted`    | neutral button surface            | secondary actions                       |

On buttons a tone is the fill. On every other element the same classes color the text: `<p class="positive">`, `<span class="accent">`, `<small class="muted">` (`.muted` uses `--color-muted`). Buttons keep their own text color (`--btn-fg`) so a tinted button stays readable. `color` inherits, so a class on a container colors its text; the tone variable `--tone` itself never leaks to children. On a checkbox, radio or switch a tone class sets the checked color (`<input type="checkbox" class="positive">`); to recolor a whole group set `--color-choice` on a form, fieldset or theme.

Inside a `<form>`, every button except the submit one is a secondary action and starts neutral; `.accent` turns it back into a filled button.

### Shape

`.outlined` turns a filled button into an outline button: transparent fill, tone-colored text and border, 10% tint on hover. It combines with the tone classes in any order (`class="outlined positive"`). It follows `tone.css` in the cascade, so it also wins over `.muted` and `.accent`.

### Media

`.cover` fills its parent (`object-fit: cover`); `.overlay` is a content layer over it, placed with `.overlay-top-left`, `-top`, `-top-right`, `-center-left`, `-center`, `-center-right`, `-bottom-left` (default), `-bottom`, `-bottom-right` or `-full`. The parent is detected with `:has()`, so no wrapper class is needed. Dials: `--overlay-color`, `--overlay-padding`.

### Layout

| Class           | Result                                                             |
| --------------- | ------------------------------------------------------------------ |
| `.wrapper`      | centered column with fluid side gutters                            |
| `.wrapper.wide` | same column, default maximum width 20% larger (78rem)              |
| `.stack`        | vertical flow with even spacing; children lose their block margins |
| `.cluster`      | wrapping row, for buttons, tags and meta                           |
| `.auto-grid`    | responsive grid: as many columns as fit                            |

Dials: `--layout-width` (65rem; applies to `.wide` too), `--layout-gutter`, `--layout-gap`, `--layout-min`. Gutter, gap and minimum column come from Tailwind's scale (`--spacing`, `--container-3xs`).

### Other dials

`--measure` (text width in `main`/`article`, 65ch), `--dialog-width` (32rem), `--busy-size`, `--busy-blur`, `--busy-transition-duration`, `--hero-overlay`, `--hero-min-height`. Components expose their colors as `--btn-*` (buttons) and `--data-*` / `--meter-*` (progress, meter) so utilities never need to know a component's selectors.

## Tailwind compatibility

Blush classes are an opt-in layer on top of Tailwind: higher-level utilities that never replace Tailwind's own. Names that Tailwind already uses were avoided (`.outlined`, `.wrapper`, `.auto-grid`), defaults reuse Tailwind's scale (`--spacing`, `--container-*`, `--radius-*`, the default palette), and no `!important` is used.

In the standalone build, Blush's entry file imports Tailwind with `source(none)`, so the build scans nothing but Blush itself and carries no Tailwind utility you did not ask for. To use Tailwind classes in your own markup there, add `@source` in your entry CSS (see [Customize and rebuild](#customize-and-rebuild)). In a Tailwind project, import the modules instead and Tailwind scans your sources as usual (see [Two ways to use Blush](#two-ways-to-use-blush)).

## Browser support

Blush relies on modern CSS: `oklch()` and `color-mix()`, cascade layers, native nesting, `:has()`, `@property`, `@starting-style` and `transition-behavior: allow-discrete` (dialog animations). `details` animation uses `::details-content` and is skipped where unsupported, with no loss of function. Check these features against your target browsers.

## Bundling

Modules are mostly independent: copy `src/blush.css` and comment out the imports you do not need. Keep in mind:

- `theme/*` is always required: every module reads its tokens.
- `hero.css` reads `--hero-overlay` (from `derived.css`).
- `group.css` expects `buttons.css` and `forms/fields.css` for the elements it holds.
- `.outlined`, `.muted` and `.accent` drive the `--btn-*` variables of `semantic/buttons.css`.

Order matters: inside a layer the last declaration wins at equal specificity.

## Design notes

- **Type that reads on a phone.** The root size runs from 16px on phones to 18px on wide screens (`clamp(1rem, …, 1.125rem)`), so body text and form fields never drop below 16px and iOS does not zoom into a field on focus. Small print, eyebrows and helper text stay at 0.75rem or more.
- **Proportional rhythm.** Leading opens as text gets smaller: `h1` and the hero title at 0.9, then `h2` 1.0 through `h6` 1.4, subtitles, small print, captions and the hero description at 1.5 (`leading-normal`), body text at 1.625 (`leading-relaxed`). Block gaps are in em (`--typography-spacing-vertical`, 1.5em), so they follow each element's size.
- **Room for accents, sized by the title.** In an `hgroup` the title reserves space for accented capitals (È, À) from its own leading, `(1.1 − --leading) / 2` em: 0.1em on `h1`, 0.05em on `h2`, nothing from `h3` down. The eyebrow runs at `leading-none` with no margin, so the group is as compact as the accents allow.
- **Headings belong to what follows them.** The space above a heading is in rem (`--typography-spacing-top`, 40→72px) while the space below is 0.5em, so a heading sits close to its own text on every screen. `h6` is body-sized, set apart by uppercase and tracking.
- **Tabular figures where columns align.** Running text keeps proportional numerals; `table`, `ol`, `time` and `data` use tabular ones.
- **Tone and shape are independent.** A tone class only sets `--tone`; `.outlined` only changes the fill and border. They combine in any order. `--tone` is registered as non-inheriting, so a tone never leaks to children.
- **Buttons and text share the tone classes.** On a button the tone is the fill; on any other element it is the text color. Buttons keep `--btn-fg` so contrast is never lost.
- **`.outlined`, not `.outline`**, and **`.wrapper` / `.auto-grid`**, not `.container` / `.grid`: those names are Tailwind utilities and stay free.
- **Stepper by structure.** Buttons next to a `number` input in a `[role="group"]` get the compact square size without any class.
- **Native before custom.** `details`, `dialog` and `menu` are styled as they are; Blush adds no JavaScript and no wrapper classes.
- **Not repeated from Tailwind.** `[hidden]` and the `img` / `video` reset come from Tailwind's preflight, so `semantic/feedback.css` and `semantic/media.css` leave them out.
- **Notices need a role.** Only `role="alert"` and `role="status"` get a box; a bare `aria-live` region announces without changing how it looks.
- **One hover model for buttons.** Every look defines its own hover through `--btn-bg-hover`: tones darken their fill, `.muted` deepens its surface, `.outlined` adds a tint.
- **Reduced motion without `!important`.** The reduced-motion rules repeat the selectors they tone down and come after them, so source order decides.

---

## Creating a theme

A theme is a block of CSS custom properties selected by `data-theme`. It does not depend on how you use Blush: the same file works with the standalone stylesheet and on top of a Tailwind project.

### 1. Write it

Eight public tokens make a complete theme. Everything you leave out is computed from them by the formulas in `theme/derived.css`.

```css
/* emerald.css */
@layer theme {
  [data-theme='emerald'] {
    /* Public tokens (required) */
    --color-accent: oklch(55% 0.15 160); /* brand color, default button fill */
    --color-surface: oklch(98% 0.01 160); /* page background */
    --color-text: oklch(20% 0.04 160); /* body text */
    --color-contrast: oklch(
      100% 0 0
    ); /* text over accent / valid / invalid fills */
    --color-invalid: oklch(55% 0.18 28); /* error, destructive */
    --color-valid: oklch(50% 0.15 140); /* success */
    --color-warning: oklch(65% 0.14 75); /* caution */
    --radius-control: 0.5rem; /* buttons and fields */

    /* Derived tokens (optional): hand-pick only what the formula gets wrong */
    --color-border: oklch(85% 0.03 160);
    --color-field: oklch(95% 0.02 160);

    /* Fonts and hero (optional) */
    --font-heading: 'Inter', system-ui, sans-serif;
    --hero-overlay: linear-gradient(
      90deg,
      oklch(98% 0.01 160 / 0.8) 30%,
      transparent
    );
  }
}
```

`@layer theme` keeps it next to the built-in themes. A theme has the same specificity as the default formulas, so source order decides: load yours after Blush. To make it the page default without an attribute, select `:root, [data-theme='emerald']`.

### 2. Load it

Standalone, after Blush:

```html
<link rel="stylesheet" href="dist/blush.css" />
<link rel="stylesheet" href="emerald.css" />
```

On a Tailwind project, import it after Blush's theme modules (see [Two ways to use Blush](#two-ways-to-use-blush)):

```css
@import './blush/src/theme/themes.css';
@import './emerald.css';
```

In both cases, apply it with `data-theme` on `<html>` or on any container; nested themes repaint their own surface and text. In a Tailwind project, `bg-accent`, `text-muted` and the other token utilities follow the active theme.

```html
<html lang="en" data-theme="emerald">
  <section data-theme="dark">…</section>
</html>
```

### 3. Check it

- `--color-contrast` must reach 4.5:1 over `--color-accent`, `--color-valid`, `--color-invalid` and `--color-warning`: every filled button uses it.
- Accent links and status text (`.positive`, `.negative`, `.warning`) need 4.5:1 on `--color-surface`; field borders 3:1. On a mid-tone surface no single color passes both as text and as a fill under white: pick a light or a dark surface, and a dark `--color-contrast` when the fills are light (as the built-in `dark` and `accent` themes do).
- Look at the tones (`.positive`, `.negative`, `.warning`), an `aria-invalid` field, a disabled control and a `details` block on your surface.
- Put the theme inside another one (`<div data-theme="emerald">` in a dark page) to confirm it repaints correctly.

## Customize and rebuild

### Change a theme without rebuilding

Because a theme is only custom properties, you can override tokens in plain CSS loaded after Blush. No compile step: this works in any page editor or online sandbox where you can link a stylesheet and add CSS.

```html
<link rel="stylesheet" href="dist/blush.css" />
<style>
  [data-theme='light'] {
    --color-accent: oklch(55% 0.17 330);
    --radius-control: 0;
  }
</style>
```

You can also edit tokens live in the browser DevTools: select `<html>` and change `--color-accent` in the Styles pane. Derived colors are computed from the public tokens on the same element, so borders, field backgrounds and hover states follow.

### Rebuild after changing the source

To change a token or a semantic style in `src/`, rebuild with the Tailwind CLI. `--watch` recompiles on every save:

```sh
npx @tailwindcss/cli -i src/blush.css -o dist/blush.css --watch
```

To keep your changes out of Blush's files, add an entry file that imports Blush and your theme:

```css
/* src/my-blush.css */
@import './blush.css';
@import './emerald.css';

/* Only if your markup uses Tailwind classes: Blush imports Tailwind with source(none) */
@source '../index.html';
```

```sh
npx @tailwindcss/cli -i src/my-blush.css -o dist/my-blush.css --minify
```

The conventions for editing the source (layers, naming, header docblocks) are in [`CLAUDE.md`](./CLAUDE.md).

## Author

Blush CSS is created and maintained by **Maurizio Melani** ([maurizio@forwalk.org](mailto:maurizio@forwalk.org)) for [Forwalk](https://forwalk.org), under the [forwalk-org](https://github.com/forwalk-org) organization on GitHub.

Issues and ideas are welcome on the [issue tracker](https://github.com/forwalk-org/blush-css/issues).

## License

Released under the [MIT License](./LICENSE). Copyright &copy; 2026 Maurizio Melani.

---

<p align="center">
  <sub>Blush CSS: a reset with superpowers. Built on Tailwind CSS v4.</sub>
</p>

