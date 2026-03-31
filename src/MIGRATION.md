# Migration from v2 to v3

## Full bundle — zero changes needed

If you use `component-viewer.js` (the full bundle), v3 is a **drop-in replacement** for v2. All options, callbacks, public API methods, CSS class names, and `data-*` attributes work identically.

```html
<!-- v2 -->
<script src="component-viewer-v2/component-viewer.js"></script>

<!-- v3 — same API, same behavior -->
<script src="component-viewer-v3/component-viewer.js"></script>
```

## Behavioral change: `wcag` defaults to `true`

In v2, `wcag` defaulted to `false`. In v3 it defaults to `true`, which means:

- Focus trap is active (Tab cycles inside the overlay)
- Focus is saved on open and restored on close
- ARIA attributes (`role="dialog"`, `aria-modal`, `aria-label`) are applied
- Screen reader announcements for title/counter changes

If you relied on the old default, explicitly set `wcag: false`:

```javascript
$('#gallery').componentViewer({ wcag: false });
```

## Modular usage (new in v3)

To reduce bundle size, include only the modules you need:

```html
<!-- Required: utils + core -->
<script src="src/utils.js"></script>
<script src="src/core.js"></script>

<!-- Image viewer with zoom/pan -->
<script src="src/renderer-image.js"></script>

<!-- Add PDF support -->
<script src="src/renderer-pdf.js"></script>

<!-- Add carousel thumbnails -->
<script src="src/feature-carousel.js"></script>
```

Content types without a registered renderer show the "unsupported" fallback card with a download button (same as v2 behavior for unknown types).

## CSS change: Less syntax removed

If you were serving `component-viewer.css` through a Less compiler, the `~"min(...)"` syntax is now replaced with standard CSS `min()`. No action needed if you serve CSS directly to browsers (which is the recommended approach).

## No other breaking changes

- All option names, types, and defaults (except `wcag`) are unchanged.
- All callback signatures are unchanged.
- All public API methods (`open`, `close`, `next`, `prev`, `goTo`, `refresh`, `destroy`, `showLoader`, `hideLoader`, `showStripMessage`, `setTheme`, `currentItem`) are unchanged.
- `$.fn.componentViewer.defaults`, `.Icons`, `.defaultStrings`, `.getActive()` are unchanged.
- `$.componentViewer(options)` static factory is unchanged.
