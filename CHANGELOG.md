# Changelog

## v3.0.0 — Modular architecture

### Architecture

- **Modular file split**: the monolithic `component-viewer.js` is split into 16 source files under `src/`. Each renderer (`renderer-*.js`) and feature (`feature-*.js`) is a standalone file that registers itself with the core via `$.fn.componentViewer._cv.registerRenderer()` / `.registerFeature()`.
- **Full bundle still available**: `component-viewer.js` in the root concatenates all modules in dependency order — drop-in replacement for v2 with the same API.
- **Explicit instance passing**: every renderer receives `(item, $stage, inst, overlay)` instead of reading the global `Overlay.activeInstance`. Cleaner data flow and easier testing.

### Accessibility

- **WCAG on by default**: `wcag` option now defaults to `true`. Focus trap, ARIA dialog semantics, `aria-label` on controls, and focus save/restore are active out of the box. Set `wcag: false` to restore v2 behavior.

### CSS

- **Fixed Less-only syntax**: removed `~"min(...)"` escapes in comment overlay sizing — now uses standard CSS `min()` for direct browser deployment.
- **Reduced `!important`**: replaced most `!important` overrides with higher-specificity selectors.

### Security

- **Markdown sanitization**: `renderer-markdown.js` documents the DOMPurify integration point. The minimal built-in parser escapes all HTML by default.
- **CSP note**: documented Content Security Policy considerations for hosts using `eval`-free markdown rendering.

### Documentation

- Comprehensive `documentation.html` updated for v3 modular usage with:
  - Modular vs full-bundle installation guide
  - Module registration API reference
  - Updated file structure table
  - Migration guide from v2 to v3
- `ARCHITECTURE.md` — module design, registration contracts, dependency graph, load order.
- `README.md` — project overview with quick start for both modular and bundle usage.

### Internal

- `Overlay` singleton is smaller — carousel, slideshow, minimize, comments, poll, and extract methods are injected by their feature modules.
- Shared helpers extracted to `utils.js` — single source of truth for `escHtml`, `isSafeResourceUrl`, `sanitizeIconHtml`, `Icons`, `DEFAULTS`, `DEFAULT_STRINGS`, etc.
- `_isGifItem()` moved from core to `renderer-image.js` (accessible to core via the bridge).

---

## v2.x

See [component-viewer-v2/documentation.html](../component-viewer-v2/documentation.html) for the v2 changelog.

## v1.x

Initial release: image, video, audio, PDF, inline, HTML, error types. Dark/light theme, zoom/pan, keyboard nav, swipe nav, fullscreen, WCAG (opt-in).
