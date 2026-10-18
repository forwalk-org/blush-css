# Changelog

## Unreleased

### Changed

- `hgroup` eyebrow now scales with the title level instead of staying at a fixed
  size. Fluid bands for `h1` and `h2` (`--eyebrow-size`, set with `:has()`), and
  0.75-0.8rem from `h3` down, so it stays legible on phones. No class needed.
  (`src/semantic/typography.css`)

### Fixed

- Theme editor: dragging a color picker no longer lags. Changes are applied once
  per animation frame (the latest value wins), the alpha is read once per drag,
  and the other rows are refreshed only when the picker is released.
  (`demo/blush-theme-editor.js`)

### Performance

- Theme editor: `refresh()` resolves all colors with a single style
  recalculation (`resolveAll`) instead of one per row, which also speeds up
  theme switching and reset.
- Theme editor: saving to `localStorage` is debounced (200 ms) and flushed on
  `pagehide`.
