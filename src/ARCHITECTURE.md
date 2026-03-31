# ComponentViewer v3 — Architecture

## Design principles

1. **Modular by default**: each renderer and feature is a separate file that registers itself with the core. Users include only what they need.
2. **Explicit dependencies**: renderers receive `(item, $stage, inst, overlay)` instead of reading `Overlay.activeInstance`. This makes the data flow visible and testable.
3. **WCAG-first**: accessibility (focus trap, ARIA, keyboard labels) is on by default, not opt-in.
4. **Zero globals**: everything lives inside a jQuery IIFE. The only namespace is `$.fn.componentViewer` and the internal `$.fn.componentViewer._cv` bridge used by modules.
5. **Full-bundle compatibility**: `component-viewer.js` concatenates all modules in dependency order and exposes the same API as v2 — drop-in replacement.

## Module registration

### Internal bridge

The core exposes a lightweight registration object at `$.fn.componentViewer._cv`:

```javascript
$.fn.componentViewer._cv = {
  Overlay:    /* singleton */,
  Utils:      /* shared helpers */,
  renderers:  {},   // type → renderer function
  features:   {},   // name → feature init function
  registerRenderer: function (type, fn) { ... },
  registerFeature:  function (name, initFn) { ... }
};
```

### Renderer contract

A renderer is a function with this signature:

```javascript
function myRenderer(item, $stage, inst, overlay) {
  // Append content to $stage
  // Return { toolbar?: [...], destroy?: function() }
}
```

Register it:

```javascript
$.fn.componentViewer._cv.registerRenderer('mytype', myRenderer);
```

The core calls the registered renderer when `item.type === 'mytype'`. If no renderer is registered for a type, the unsupported card is shown.

### Feature contract

A feature is an init function called once when the overlay is built:

```javascript
function myFeature(overlay, utils) {
  // Extend overlay methods, bind events, etc.
}
```

Register it:

```javascript
$.fn.componentViewer._cv.registerFeature('myfeature', myFeature);
```

Features are initialized in registration order during `Overlay.ensure()`.

## Load order

When using individual `<script>` tags:

1. `utils.js` — must load first (constants, helpers, security)
2. `core.js` — depends on utils; creates Overlay, ComponentViewer, plugin bridge
3. Renderers (`renderer-*.js`) — depend on utils + core; order among renderers doesn't matter
4. Features (`feature-*.js`) — depend on utils + core; order among features doesn't matter

The full bundle (`component-viewer.js`) includes them in this order.

## Dependency graph

```
utils.js
    │
    ▼
core.js
    │
    ├──► renderer-image.js
    ├──► renderer-video.js
    ├──► renderer-audio.js
    ├──► renderer-pdf.js
    ├──► renderer-inline.js
    ├──► renderer-markdown.js
    ├──► renderer-html.js
    │
    ├──► feature-carousel.js
    ├──► feature-slideshow.js
    ├──► feature-minimize.js
    ├──► feature-comments.js
    ├──► feature-poll.js
    └──► feature-extract.js
```

## Changes from v2

### Breaking changes

- `wcag` defaults to `true` (was `false`). Set `wcag: false` to restore v2 behavior.
- CSS no longer uses Less syntax — deploy the `.css` file directly to browsers.

### Non-breaking changes

- All v2 options, callbacks, and public API methods work unchanged.
- The full bundle (`component-viewer.js`) is a drop-in replacement for v2's `component-viewer.js`.
- Renderers that are not included simply show the unsupported card for that type.

### Internal changes

- `Overlay` methods for carousel, slideshow, minimize, comments, poll, and extract are injected by their respective feature modules instead of being defined inline.
- Built-in renderers call `overlay` parameter methods instead of the global `Overlay` variable.
- `_isGifItem()` moved to renderer-image (available to core via the bridge).
- `syncCvImgTransformDimensions`, `getCvImageContentMetrics`, and OCR helpers moved to their respective modules.
