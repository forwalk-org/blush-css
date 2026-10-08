# Blush CSS: development guidelines

Classless CSS framework built on Tailwind CSS v4 (`@apply`).
Semantic HTML looks right with no classes; classes only change how something looks.

## Core rule

- Attributes (`aria-*`, `role`, `data-theme`) say what an element **is** or what **state** it is in.
- Classes say how it should **look**.
- Never use `data-variant`, `data-state`, `data-cover` or `data-overlay` (deprecated, replaced by classes).

## Tailwind compatibility

Blush must coexist with Tailwind in any project, including ones that also use Tailwind utilities in their own markup.

- Blush classes are an opt-in layer **on top of Tailwind**: more structured, higher-level utilities. They never replace or override Tailwind's own.
- **Never reuse a Tailwind class name.** Before adding any class, check it does not exist in Tailwind v4 (`outline`, `container`, `grid`, `flex`, `stack`-like names, `overlay`, `muted`... verify each one). If it collides, choose another name (`.outlined`, `.wrapper`, `.auto-grid`).
- **Reuse Tailwind's default theme variables wherever possible** instead of inventing new ones: `--spacing`, `--text-*`, `--font-*`, `--radius-*`, `--shadow-*`, `--ease-*`, `--breakpoint-*`, and the default palette (`--color-red-500`, `--color-gray-200`...). Reference them with `var(--...)` or the `@apply` utilities that map to them (`gap-2`, `rounded-lg`, `shadow-xs`, `text-base`).
- Add a new token to `@theme` only when Tailwind has no equivalent (semantic roles such as `--color-accent`, `--color-surface`, `--radius-control`). Define semantic tokens by pointing at Tailwind's defaults (e.g. `--color-accent: var(--color-indigo-600)`) rather than hardcoding values.
- Never overwrite or redefine Tailwind's default values (`--color-red-500`, `--spacing`...) unless intentional and documented. Prefer Blush-specific names for component dials (`--btn-*`, `--layout-*`, `--tone`).
- Prefer Tailwind scale utilities over arbitrary values (`px-5`, not `px-[1.25rem]`). Use `[...]` arbitrary values only to read a variable or when no scale value fits.
- Blush classes live in `@layer utilities`, so they sit at the same level as Tailwind utilities. Keep each class single-purpose so it composes with Tailwind classes and does not fight them.
- Blush classes only assign custom properties or a small, well-defined set of declarations. They must never restyle properties that a Tailwind utility on the same element would reasonably set (e.g. do not set padding or colors directly in `.wrapper`-like helpers beyond their documented job).
- Document the collision check in the header's `Why these names` section whenever a name was chosen to avoid Tailwind.

## Commands

- Build: `npx @tailwindcss/cli -i src/blush.css -o dist/blush.css`
- Dev: `npm run dev`
- Never edit `dist/`: it is generated.

## Architecture

Layer order: `theme, base, components, utilities`.

- `src/theme/`: tokens (`@theme`), derived colors, themes, icons.
- `src/base/`: reboot, page colors, font, selection, nested themes.
- `src/semantic/`: element, role and aria styling, in `@layer components`. **No classes allowed here.**
- `src/utilities/`: opt-in classes (`.positive`, `.outlined`, `.wrapper`...), in `@layer utilities`. They win by layer order, so **never use `!important`**.
- Every new file must be imported in `src/blush.css` in the correct order.

## Design conventions

- Colors, spacing and fonts come from tokens/custom properties only. Never hardcode values.
- Tone and shape are independent: `.positive` only sets `--tone`; `.outlined` only changes fill and border. They must combine in any order.
- `--tone` is registered as non-inheriting. It must not leak to children.
- Avoid names that collide with Tailwind (`.outline`, `.container`, `.grid`). Use `.outlined`, `.wrapper`, `.auto-grid`.
- Buttons use one hover model: every tone darkens its own fill through `--btn-bg-hover`.
- Stepper and segmented control come from structure (`[role="group"]`), not classes.

## Documentation and code conventions

All comments and docblocks are in English: short, factual, focused on *why*, not *what*.

### 1. File header docblock

Every file starts with a `/** ... */` block, in this order:

1. **Title line**: `LAYER / name` (e.g. `SEMANTIC / buttons`, `UTILITIES / layout`).
2. **Summary**: one short paragraph. What it styles. For semantic files, state which elements/roles it targets and that no classes are needed.
3. **Contract section**:
   - Semantic files: `Variable contract` (underlined with dashes). List each custom property set on the element, aligned in columns, with a one-line meaning and its fallback chain. Explain that utilities use these hooks, so they never need to know the file's selectors.
   - Utility files: `Dials (all optional)`. List each custom property, what it controls, and its default.
4. **States** (semantic files): `Semantic states (no class involved)`. List the `aria-*` / native attributes handled and their look.
5. **Usage** (utility files): minimal HTML example with real class names.
6. **Why these names** (only when naming is a decision): explain collisions with Tailwind.
7. **Footer lines**, always last:
   - `Reads:` tokens consumed (`--color-accent`, `--radius-control`...).
   - Cross-references to related files (`utilities/tone.css`, `busy.css`, `group.css`).
   - `Layer:` the cascade layer name.

### 2. Body structure

- Wrap everything in a single `@layer components { ... }` (semantic) or `@layer utilities { ... }` (utilities). Indent with 4 spaces.
- Split semantic files into numbered sections with a banner comment:

  ```css
  /* -------------------------------------------------------------
     1. Base: filled button in the current tone
     ------------------------------------------------------------- */
  ```

  Add a second indented line when the section needs context.
- Use short inline comments only for non-obvious decisions or browser limitations. Do not comment the obvious.
- Documented defaults in the header must match the code. Change both in the same commit.

### 3. Variable contract pattern

- A component computes its colors from a small set of custom properties declared on the element itself (`--btn-tone`, `--btn-bg`, `--btn-fg`, `--btn-border`, `--btn-bg-hover`, `--btn-border-hover`, `--btn-ring`).
- Base tone falls back through a chain: `var(--tone, var(--color-accent))`.
- Derived colors use `color-mix(in oklab, ...)` from the base tone or from `--color-text` / `--color-surface`. Use `oklab`, not `oklch`: the white and black operands have no hue, and browsers then interpolate a hue of 0, which tints every derived colour towards red or purple.
- Utilities only assign variables. They never restate component selectors.
- Neutral variants (e.g. `reset`, file selector) override the same variables instead of adding new rules.

### 4. Styling style

- In semantic files, use `@apply`, one concern per line (layout/box, typography, base colors, hover, active, focus), with a blank line between groups.
- Reference variables with arbitrary values: `bg-[color:var(--btn-bg)]`, `rounded-[var(--radius-control)]`.
- Use plain CSS when `@apply` cannot express it (pseudo-element states, `min()`, `repeat(auto-fit, minmax(...))`).
- Utility classes are plain CSS: one job per class, dials read as `var(--layout-x, default)` with the default inline.
- Group related selectors with `:is()`. Express state through attributes (`aria-pressed`, `aria-selected`, `aria-current`, `aria-disabled`, `disabled`, `fieldset[disabled]`), never through state classes.
- Always provide `focus-visible`, and cover disabled in all three forms (native, ARIA, inherited from a fieldset).
- Inline SVG icons inside controls size with the text (`1em`).

## Definition of done

- [ ] Build compiles with no errors
- [ ] Works in light, dark, primary and secondary themes
- [ ] `aria-*` states handled (invalid, busy, disabled, pressed...)
- [ ] Header docblock complete and in the right order
- [ ] Single `@layer` wrapper matching the folder
- [ ] No classes in `semantic/`; no component selectors in `utilities/`
- [ ] Colors only from tokens and `color-mix`
- [ ] Imported in `src/blush.css` in the right order
- [ ] README updated if a class or attribute was added

## Do not

- Add dependencies without asking.
- Introduce classes in the `semantic` layer.
- Use `!important`.
- Rewrite whole files for small edits.
