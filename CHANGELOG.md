# Changelog

## Initial release — Modular architecture

### Architecture

- **Modular file split**: 16 source files under `src/`. Each renderer (`renderer-*.js`) and feature (`feature-*.js`) is a standalone file that registers itself with the core via `$.fn.componentViewer._cv.registerRenderer()` / `.registerFeature()`.
- **Full bundle**: `component-viewer.js` in the root concatenates all modules in dependency order for a single-file drop-in.
- **Explicit instance passing**: every renderer receives `(item, $stage, inst, overlay)` instead of reading a global `Overlay.activeInstance`. Cleaner data flow and easier testing.

### Accessibility

- **WCAG on by default**: `wcag` option defaults to `true`. Focus trap, ARIA dialog semantics, `aria-label` on controls, and focus save/restore are active out of the box. Set `wcag: false` to disable.

### CSS

- **Pure CSS**: no Less-only syntax — uses standard CSS `min()` and other native features for direct browser deployment.
- **Reduced `!important`**: most `!important` overrides replaced with higher-specificity selectors.

### Security

- **Markdown sanitization**: `renderer-markdown.js` documents the DOMPurify integration point. The minimal built-in parser escapes all HTML by default.
- **CSP note**: documented Content Security Policy considerations for hosts using `eval`-free markdown rendering.

### Documentation

- Comprehensive `documentation.html` with:
  - Modular vs full-bundle installation guide
  - Module registration API reference
  - Updated file structure table
- `ARCHITECTURE.md` — module design, registration contracts, dependency graph, load order.
- `README.md` — project overview with quick start for both modular and bundle usage.

### Internal

- `Overlay` singleton is smaller — carousel, slideshow, minimize, comments, poll, and extract methods are injected by their feature modules.
- Shared helpers extracted to `utils.js` — single source of truth for `escHtml`, `isSafeResourceUrl`, `sanitizeIconHtml`, `Icons`, `DEFAULTS`, `DEFAULT_STRINGS`, etc.
- `_isGifItem()` lives in `renderer-image.js` (accessible to core via the bridge).
