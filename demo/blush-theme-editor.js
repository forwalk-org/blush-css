/*!
 * Blush theme editor: live editor for theme and derived tokens.
 *
 * Stand-alone: one script, no dependency on the project's styles. The panel
 * lives in a Shadow DOM with its own neutral palette, so it stays usable even
 * while you are breaking the theme you are editing.
 *
 * Usage: add it in <head>, after the stylesheets, so the saved theme is
 * applied before the first paint:
 *
 *   <link rel="stylesheet" href="dist/blush.css" />
 *   <script src="blush-theme-editor.js"></script>
 *
 * Options (attributes on the script tag):
 *   data-storage-key="blush-theme-editor"   localStorage key
 *   data-open                               start with the panel open
 *
 * What it does
 *   - Reads the themes from the stylesheets: every `[data-theme="name"]`
 *     selector (inside @layer, @media, nested rules...) becomes a theme.
 *     Cross-origin stylesheets cannot be read and are skipped.
 *   - Reads the editable tokens from the same rules (--color-*, --font-*,
 *     --radius-*, --hero-*); the eight Blush public tokens go first, then the
 *     derived tokens in groups (surface, fields, choices, range, fonts, hero).
 *   - Each derived row says where its value comes from: `formula` (default in
 *     derived.css), `theme` (set by the theme) or `edited` (your override).
 *   - Remembers the chosen theme and your edits (per theme) in localStorage.
 *   - Exports the current theme as CSS (copy or download): public tokens,
 *     whatever the theme sets itself, and your edits.
 *
 * Project configuration (optional): define `window.BlushThemeEditorConfig`
 * before this script to list the project's own tokens and groups.
 *   tokens:      extra token prefixes to read, e.g. ['--tag-']
 *   groups:      [[title, [tokens], open?]], same format as the derived groups
 *   groupsTitle: heading of that section (default 'Project')
 * Project tokens get the same formula / theme / edited marker as derived ones.
 *
 * Page API: window.BlushThemeEditor { themes(), set(name), open(), close() }
 * Event:    'blush-theme-change' on window, detail: { theme }
 */
;(() => {
  'use strict'
  if (window.BlushThemeEditor) return

  const script = document.currentScript
  const KEY = (script && script.dataset.storageKey) || 'blush-theme-editor'
  const root = document.documentElement
  const PUBLIC = [
    '--color-accent', '--color-surface', '--color-text', '--color-contrast',
    '--color-invalid', '--color-valid', '--color-warning', '--radius-control',
  ]
  // Derived tokens (formulas in src/theme/derived.css), grouped as in themes.css.
  const DERIVED = [
    ['Surface and text', ['--color-muted', '--color-border', '--color-surface-soft', '--color-accent-soft', '--color-heading']],
    ['Fields', ['--color-field', '--color-field-hover', '--color-field-border', '--color-field-border-hover',
      '--color-focus-ring', '--color-valid-ring', '--color-invalid-ring']],
    ['Checkbox, radio, switch', ['--color-choice', '--color-choice-check', '--color-choice-border-hover'], true],
    ['Range', ['--color-range-track', '--color-range-track-hover', '--color-range-track-active', '--color-range-glow']],
    ['Fonts', ['--font-text', '--font-heading', '--font-hero']],
    ['Hero', ['--hero-overlay']],
  ]
  const CONFIG = window.BlushThemeEditorConfig || {}
  const PROJECT = CONFIG.groups || []
  const DERIVED_ALL = [...DERIVED, ...PROJECT].flatMap(([, list]) => list)
  const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const TOKEN = new RegExp(`^(--(color|font|radius|hero)-${(CONFIG.tokens || []).map((p) => `|${escapeRe(p)}`).join('')})`)
  const THEME_SEL = /\[data-theme\s*=\s*["']?([\w-]+)["']?\s*\]/g
  const STACKS = [
    "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    "Georgia, 'Times New Roman', serif",
    "ui-monospace, 'Cascadia Code', Menlo, Consolas, monospace",
  ]

  /* ---------- storage: { theme, open, overrides: { [theme]: { [var]: value } } } */
  const load = () => {
    try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} }
  }
  const state = Object.assign({ overrides: {} }, load())
  let saveTimer = 0
  const flush = () => {
    clearTimeout(saveTimer)
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* private mode */ }
  }
  // Debounced: dragging a picker or typing would otherwise write on every event.
  const save = () => { clearTimeout(saveTimer); saveTimer = setTimeout(flush, 200) }
  window.addEventListener('pagehide', flush)

  /* ---------- theme + overrides on <html> (applied right away: no flash) */
  const initialTheme = root.getAttribute('data-theme')
  let applied = []
  const clearApplied = () => { applied.forEach((v) => root.style.removeProperty(v)); applied = [] }
  const applyOverrides = (theme) => {
    clearApplied()
    for (const [k, v] of Object.entries(state.overrides[theme] || {})) {
      root.style.setProperty(k, v)
      applied.push(k)
    }
  }
  if (state.theme) {
    root.setAttribute('data-theme', state.theme)
    applyOverrides(state.theme)
  }

  /* ---------- discovery: themes and tokens defined in the stylesheets */
  let themes = []
  let tokens = []
  let declared = new Map() // theme name -> tokens that theme sets itself
  function scan() {
    const t = new Set(), k = new Set(), d = new Map()
    // `ctx` is the enclosing theme / :root rule: once a nested @supports rule
    // appears, the declarations that follow it are CSSNestedDeclarations (no
    // selectorText) and still belong to that rule.
    const take = (r, ctx) => {
      for (const p of r.style) {
        if (!TOKEN.test(p)) continue
        k.add(p)
        for (const n of ctx.names) (d.get(n) || d.set(n, new Set()).get(n)).add(p)
      }
    }
    const walk = (rules, ctx) => {
      for (const r of rules) {
        let next = ctx
        if (r.selectorText) {
          const names = [...r.selectorText.matchAll(THEME_SEL)].map((m) => m[1])
          names.forEach((n) => t.add(n))
          next = names.length || /:root|\[data-theme\s*\]/.test(r.selectorText) ? { names } : null
          if (next) take(r, next)
        } else if (ctx && r.style) {
          take(r, ctx)
        }
        if (r.cssRules) walk(r.cssRules, next) // @layer, @media, @supports, nesting
      }
    }
    for (const sheet of document.styleSheets) {
      try { walk(sheet.cssRules, null) } catch { /* cross-origin sheet */ }
    }
    if (!t.size) document.querySelectorAll('[data-theme]').forEach((e) => t.add(e.dataset.theme))
    themes = [...t]
    declared = d
    const rest = [...k].filter((v) => !PUBLIC.includes(v)).sort()
    tokens = [...PUBLIC.filter((v) => k.has(v) || !k.size), ...rest]
  }

  /* ---------- color helpers */
  const probe = document.createElement('i')
  probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none'
  const px = Object.assign(document.createElement('canvas'), { width: 1, height: 1 }).getContext('2d', { willReadFrequently: true })

  /** Resolves a custom property to { hex, alpha } as the page really renders it. */
  function resolve(name) {
    probe.style.color = `var(${name})`
    root.appendChild(probe)
    const css = getComputedStyle(probe).color
    probe.remove()
    return toRgba(css)
  }

  /** Same as resolve() for many names: one style recalculation instead of one each. */
  function resolveAll(names) {
    const probes = names.map((n) => {
      const p = probe.cloneNode()
      p.style.color = `var(${n})`
      return p
    })
    root.append(...probes)
    const css = probes.map((p) => getComputedStyle(p).color)
    probes.forEach((p) => p.remove())
    return new Map(names.map((n, i) => [n, toRgba(css[i])]))
  }

  function toRgba(css) {
    px.clearRect(0, 0, 1, 1)
    px.fillStyle = '#000'
    px.fillStyle = css
    px.fillRect(0, 0, 1, 1)
    const d = px.getImageData(0, 0, 1, 1).data
    return { hex: '#' + [d[0], d[1], d[2]].map((n) => n.toString(16).padStart(2, '0')).join(''), alpha: d[3] / 255 }
  }

  /** #rrggbb (+ alpha) to an oklch() string. */
  function hexToOklch(hex, alpha = 1) {
    const lin = (c) => ((c /= 255) > 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92)
    const [r, g, b] = [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16)))
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969597 * b)
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
    const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
    const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
    const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
    const C = Math.hypot(a, bb)
    const h = ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360
    const A = alpha < 1 ? ` / ${Math.round(alpha * 100)}%` : ''
    return `oklch(${(L * 100).toFixed(1)}% ${+C.toFixed(4)} ${h.toFixed(1)}${A})`
  }

  /* ---------- actions */
  const theme = () => root.getAttribute('data-theme') || ''
  function setTheme(name) {
    if (theme() !== name) root.setAttribute('data-theme', name)
    state.theme = name
    applyOverrides(name)
    save()
    window.dispatchEvent(new CustomEvent('blush-theme-change', { detail: { theme: name } }))
  }
  function setVar(name, value) {
    root.style.setProperty(name, value)
    if (!applied.includes(name)) applied.push(name)
    ;(state.overrides[theme()] ||= {})[name] = value
    save()
  }
  function resetVar(name) {
    root.style.removeProperty(name)
    applied = applied.filter((v) => v !== name)
    delete (state.overrides[theme()] || {})[name]
    save()
  }
  const overridden = (name) => name in (state.overrides[theme()] || {})
  const byTheme = (name) => !!declared.get(theme())?.has(name)
  /** Where a derived token's value comes from: your edit, the theme, or the default formula. */
  const origin = (name) => (overridden(name) ? 'edited' : byTheme(name) ? 'theme' : 'formula')

  function exportCss() {
    const cs = getComputedStyle(root)
    const lines = tokens
      .filter((v) => PUBLIC.includes(v) || byTheme(v) || overridden(v))
      .map((v) => `    ${v}: ${cs.getPropertyValue(v).trim()};`)
    return `/* Blush theme "${theme()}", exported by blush-theme-editor */\n@layer theme {\n  [data-theme="${theme()}"] {\n${lines.join('\n')}\n  }\n}\n`
  }

  /* ---------- panel (Shadow DOM, own styles) */
  const CSS = `
    :host { all: initial; --bg:#fff; --fg:#1b1b1f; --mut:#6b6b76; --line:#d9d9e0; --acc:#2f6fdb; --soft:#f3f3f6;
      font: 13px/1.4 system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; color-scheme: light dark }
    @media (prefers-color-scheme: dark) { :host { --bg:#1d1d22; --fg:#ececf1; --mut:#9a9aa6; --line:#3a3a44; --soft:#26262d } }
    * { box-sizing: border-box }
    button, input, select { font: inherit; color: inherit }
    .fab { position: fixed; top: 62px; right: 0px; z-index: 2147483000; padding: 6px 10px; border: 1px solid var(--line);
      border-radius: 8px 0 0 8px; background: var(--bg); color: var(--fg); cursor: pointer; box-shadow: 0 2px 8px #0003 }
    .panel { position: fixed; top: 0; right: 0; bottom: 0; width: min(100vw, 360px); z-index: 2147483001; display: flex;
      flex-direction: column; background: var(--bg); color: var(--fg); border-left: 1px solid var(--line);
      box-shadow: -4px 0 16px #0003; transform: translateX(105%); transition: transform .25s }
    .panel.open { transform: none }
    @media (prefers-reduced-motion: reduce) { .panel { transition: none } }
    header { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 12px 14px; border-bottom: 1px solid var(--line) }
    h2 { margin: 0; font-size: 14px }
    .body { flex: 1; overflow: auto; padding: 12px 14px; display: grid; gap: 12px; align-content: start }
    .bar { display: flex; flex-wrap: wrap; gap: 6px }
    button.b { padding: 5px 9px; border: 1px solid var(--line); border-radius: 6px; background: var(--soft); cursor: pointer }
    button.b:hover { border-color: var(--acc) }
    select, input[type=text] { width: 100%; padding: 5px 7px; border: 1px solid var(--line); border-radius: 6px; background: var(--bg) }
    select:focus, input:focus, button:focus-visible { outline: 2px solid var(--acc); outline-offset: 1px }
    h3 { margin: 4px 0 0; font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: var(--mut) }
    .row { display: grid; grid-template-columns: 1fr; gap: 3px }
    .row label { font-weight: 600; font-size: 12px; display: flex; justify-content: space-between; gap: 6px }
    .row label i { font-style: normal; color: var(--acc) }
    .ctl { display: flex; gap: 6px; align-items: center }
    input[type=color] { flex: none; width: 34px; height: 30px; padding: 2px; border: 1px solid var(--line); border-radius: 6px; background: none; cursor: pointer }
    .ctl input[type=text] { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 12px }
    .x { flex: none; width: 26px; height: 26px; border: 1px solid var(--line); border-radius: 6px; background: none; cursor: pointer; visibility: hidden }
    .row.ov .x { visibility: visible }
    .note { color: var(--mut); font-size: 12px; margin: 0 }
    details { border: 1px solid var(--line); border-radius: 8px; padding: 6px 10px }
    summary { cursor: pointer; font-weight: 600 }
    details[open] > summary { margin-bottom: 8px }
    details .row { margin-top: 8px }`

  const host = document.createElement('div')
  const sh = host.attachShadow({ mode: 'open' })
  let fab, panel, body, sel
  const rows = new Map()

  const el = (tag, props = {}, ...kids) => {
    const e = Object.assign(document.createElement(tag), props)
    kids.forEach((c) => e.append(c))
    return e
  }
  const isColor = (n) => n.startsWith('--color-')

  function row(name) {
    const color = isColor(name)
    const text = el('input', { type: 'text', spellcheck: false, ariaLabel: name })
    const x = el('button', { className: 'x', type: 'button', title: DERIVED_ALL.includes(name) ? 'Back to the formula / theme value' : 'Back to the stylesheet value', textContent: '↺' })
    const picker = color ? el('input', { type: 'color', ariaLabel: `${name} picker` }) : null
    if (name.startsWith('--font-')) text.setAttribute('list', 'be-stacks')
    const mark = el('i', { textContent: '' })
    const wrap = el('div', { className: 'row' },
      el('label', {}, name.slice(2), mark),
      el('div', { className: 'ctl' }, ...(picker ? [picker] : []), text, x))

    // Events fire far faster than the page can restyle: keep only the latest
    // value and apply it once per frame.
    let frame = 0, pending = null, alpha = null
    const schedule = (apply) => {
      pending = apply
      if (!frame) frame = requestAnimationFrame(() => {
        frame = 0
        const run = pending
        pending = null
        run && run()
      })
    }

    text.addEventListener('input', () => {
      const v = text.value.trim()
      if (!v) return
      schedule(() => {
        setVar(name, v)
        if (picker) picker.value = resolve(name).hex
        refresh(name)
      })
    })
    if (picker) {
      picker.addEventListener('input', () => {
        alpha ??= resolve(name).alpha // read once per drag, not on every event
        const v = hexToOklch(picker.value, alpha)
        schedule(() => {
          setVar(name, v)
          text.value = v
        })
      })
      // Released: update the derived rows once.
      picker.addEventListener('change', () => {
        alpha = null
        cancelAnimationFrame(frame)
        frame = 0
        if (pending) pending() // never drop the last value
        pending = null
        refresh(name)
      })
    }
    x.addEventListener('click', () => { resetVar(name); refresh() })
    rows.set(name, { wrap, text, picker, mark })
    return wrap
  }

  /** Syncs every control with the computed values; `skip` keeps the control being edited. */
  function refresh(skip) {
    const cs = getComputedStyle(root)
    const colors = resolveAll([...rows].filter(([, r]) => r.picker).map(([n]) => n))
    for (const [name, r] of rows) {
      const ov = overridden(name)
      r.wrap.classList.toggle('ov', ov)
      r.mark.textContent = DERIVED_ALL.includes(name) ? origin(name) : ov ? 'edited' : ''
      if (name === skip) continue
      r.text.value = cs.getPropertyValue(name).trim()
      if (r.picker) r.picker.value = colors.get(name).hex
    }
    if (sel && sel.value !== theme()) sel.value = theme()
  }

  function build() {
    rows.clear()
    sel = el('select', { ariaLabel: 'Theme' }, ...themes.map((t) => el('option', { value: t, textContent: t })))
    sel.addEventListener('change', () => { setTheme(sel.value); refresh() })
    const bar = el('div', { className: 'bar' },
      el('button', { className: 'b', type: 'button', textContent: 'Reset theme' }),
      el('button', { className: 'b', type: 'button', textContent: 'Copy CSS' }),
      el('button', { className: 'b', type: 'button', textContent: 'Download CSS' }))
    const [reset, copy, down] = bar.children
    reset.addEventListener('click', () => {
      Object.keys(state.overrides[theme()] || {}).forEach(resetVar)
      delete state.overrides[theme()]
      save(); refresh()
    })
    copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(exportCss()); copy.textContent = 'Copied' }
      catch { copy.textContent = 'Copy failed' }
      setTimeout(() => (copy.textContent = 'Copy CSS'), 1200)
    })
    down.addEventListener('click', () => {
      const a = el('a', { href: URL.createObjectURL(new Blob([exportCss()], { type: 'text/css' })), download: `theme-${theme()}.css` })
      a.click(); URL.revokeObjectURL(a.href)
    })

    const core = tokens.filter((t) => PUBLIC.includes(t))
    const rest = tokens.filter((t) => !PUBLIC.includes(t) && !DERIVED_ALL.includes(t))
    const group = (title, list, open = false) =>
      el('details', { open }, el('summary', { textContent: `${title} (${list.length})` }), ...list.map(row))
    const kids = [
      el('div', {}, el('h3', { textContent: 'Theme' }), sel),
      bar,
      el('p', { className: 'note', textContent: `${themes.length} themes read from the stylesheets. Edits are kept per theme in this browser.` }),
      el('h3', { textContent: 'Core tokens' }), ...core.map(row),
    ]
    const derived = DERIVED
      .map(([title, list, open]) => [title, list.filter((t) => tokens.includes(t)), open])
      .filter(([, list]) => list.length)
    if (derived.length) {
      kids.push(
        el('h3', { textContent: 'Derived (overridable)' }),
        el('p', { className: 'note', textContent: 'Computed from the core tokens unless the theme sets them. Edit to override, ↺ to go back.' }),
        ...derived.map(([title, list, open]) => group(title, list, open)))
    }
    const project = PROJECT
      .map(([title, list, open]) => [title, list.filter((t) => tokens.includes(t)), open])
      .filter(([, list]) => list.length)
    if (project.length) {
      kids.push(
        el('h3', { textContent: CONFIG.groupsTitle || 'Project' }),
        ...project.map(([title, list, open]) => group(title, list, open)))
    }
    if (rest.length) {
      const colors = rest.filter(isColor), others = rest.filter((t) => !isColor(t))
      kids.push(el('h3', { textContent: 'Other' }))
      if (colors.length) kids.push(group('Colors', colors))
      if (others.length) kids.push(group('Fonts, radius, hero', others))
    }
    body.replaceChildren(...kids)
    refresh()
  }

  function mount() {
    if (host.isConnected) return
    const list = el('datalist', { id: 'be-stacks' }, ...STACKS.map((s) => el('option', { value: s })))
    fab = el('button', { className: 'fab', type: 'button', textContent: 'Theme', ariaExpanded: 'false' })
    body = el('div', { className: 'body' })
    const close = el('button', { className: 'b', type: 'button', textContent: 'Close' })
    panel = el('section', { className: 'panel', ariaLabel: 'Theme editor' },
      el('header', {}, el('h2', { textContent: 'Theme editor' }), close), body, list)
    sh.append(el('style', { textContent: CSS }), fab, panel)
    document.body.append(host)
    const toggle = (open) => {
      panel.classList.toggle('open', open)
      fab.ariaExpanded = String(open)
      state.open = open; save()
    }
    api.open = () => toggle(true)
    api.close = () => toggle(false)
    fab.addEventListener('click', () => toggle(!panel.classList.contains('open')))
    close.addEventListener('click', () => toggle(false))
    document.addEventListener('keydown', (e) => e.key === 'Escape' && toggle(false))
    toggle(state.open ?? script?.hasAttribute('data-open') ?? false)
  }

  /* ---------- init: runs when the DOM is ready and again when every sheet has loaded */
  function init() {
    scan()
    if (themes.length) {
      const dark = matchMedia('(prefers-color-scheme: dark)').matches && themes.includes('dark') ? 'dark' : null
      const want = [state.theme, initialTheme, dark, themes[0]].find((t) => t && themes.includes(t))
      setTheme(want)
    }
    mount()
    build()
  }

  const api = {
    themes: () => themes.slice(),
    set: (name) => { if (themes.includes(name)) { setTheme(name); refresh() } },
    open() {}, close() {},
  }
  window.BlushThemeEditor = api

  // Another script (or DevTools) changing data-theme keeps the panel in sync.
  new MutationObserver(() => {
    if (theme() !== state.theme && themes.includes(theme())) { setTheme(theme()); refresh() }
  }).observe(root, { attributes: true, attributeFilter: ['data-theme'] })

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
  else init()
  window.addEventListener('load', init)
})()
