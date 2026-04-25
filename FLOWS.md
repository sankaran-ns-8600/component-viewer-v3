# ComponentViewer — Complete flow reference

This document lists **every major runtime flow** in the plugin so humans and **AI coding assistants** can reason about behavior without guessing. Conventions:

- **Instance** = `ComponentViewer` created per `$(container).componentViewer(opts)`.
- **Overlay** = singleton DOM + state in `$.fn.componentViewer._cv.Overlay` (one visible viewer at a time).
- **CV** = `$.fn.componentViewer._cv` (bridge: `registerRenderer`, `registerFeature`, `renderers`, `features`, `Utils`, `Overlay`).

---

## 1. Bootstrap and module loading

| Step | What happens |
|------|----------------|
| 1 | Scripts load in order: `utils.js` → `core.js` → optional `renderer-*.js` / `feature-*.js`. |
| 2 | `core.js` defines `DEFAULTS`, `Overlay`, `ComponentViewer`, jQuery plugin `$.fn.componentViewer`, static `$.componentViewer`, and assigns `$.fn.componentViewer._cv = CV`. |
| 3 | Each renderer file calls `CV.registerRenderer(type, fn)`. Each feature file calls `CV.registerFeature(name, initFn)`. |
| 4 | First `$(...).componentViewer(...)` invocation calls `Overlay._bindKeydownCaptureOnce()` so **document capture-phase keydown** is registered once. |
| 5 | `Overlay.ensure()` runs on first open: builds the overlay DOM once, `_bindEvents()`, `_bindTooltip()`, sets `built = true`, then runs **every** registered feature’s `initFn(Overlay, Utils)` once. |

**AI note:** Features patch methods onto `overlay` (e.g. `_buildCarousel`, `_startSlideshowProgress`). If a module is not loaded, those methods are missing and core guards with `typeof fn === 'function'`.

---

## 2. Plugin initialization (per container)

| Step | What happens |
|------|----------------|
| 1 | `new ComponentViewer($container, options)` merges `DEFAULTS` with user options; normalizes `stageOnly` and `minimize`. |
| 2 | Sets `inst._beforeCollectContext = { trigger: 'init' }`. |
| 3 | Calls `inst._collectItems(done)` where `done` binds delegated click handler `_bindClicks()`. |

---

## 3. Item collection (`_collectItems` / `_doCollectItems`)

| Step | What happens |
|------|----------------|
| 1 | If `opts.beforeCollectItems` is set: **async** form `(viewer, proceed) => { ...; proceed(); }` or **sync** `(viewer) => { ... }`. |
| 2 | After hook (or immediately): `_doCollectItems()`. |
| 3 | If `opts.items` is a non-empty array → `inst.items = opts.items.slice()` (DOM scan skipped). |
| 4 | Else → for each `container.find(selector)`, build a default item from `data-*` / `href` / `img[src]`, then optionally `opts.itemData($el, defaultItem)`; push to `inst.items` with `item.$el` set. |
| 5 | Clears `inst._beforeCollectContext`. |

**Triggers** that set `_beforeCollectContext` before collection: `init`, `click`, `open`, `next`, `prev`, `goTo`, `refresh`, `restore` (minimize restore path).

---

## 4. Opening from a user click (delegated capture)

| Step | What happens |
|------|----------------|
| 1 | Capture-phase listener on container; finds `closest(opts.selector)`. |
| 2 | `preventDefault` + `stopImmediatePropagation`. |
| 3 | `_beforeCollectContext = { trigger: 'click', $element, originalEvent }`. |
| 4 | `_collectItems` → re-scan items → find item whose `$el` matches clicked node → `open($matched)`. |
| 5 | If viewer already open on same instance and minimized → `_applyMinimizedUi(false)` first. |

---

## 5. Programmatic `inst.open(indexOrElement)`

| Step | What happens |
|------|----------------|
| 1 | `_beforeCollectContext = { trigger: 'open', openArg }`. |
| 2 | `_collectItems` → must have `items.length > 0`. |
| 3 | Resolve `idx`: number clamped to range, or DOM element matched against `items[i].$el`. |
| 4 | **If `beforeOpen` is not set:** set `idx`, reset slideshow pause flags, `_openContext = {}`, `Overlay.open(inst)`. |
| 5 | **If `beforeOpen` is set:** set `idx`, slideshow flags, `_beforeOpenPhase = 'loading'`, `_pendingGateContent = null`, `_openContext = {}`, then `Overlay.open(inst)` immediately (overlay visible in loading state), then async `beforeOpen(item, $matched, proceed)`. |

---

## 6. `beforeOpen` gate and proceed

| Step | What happens |
|------|----------------|
| 1 | `proceed(arg)` is called by host code. |
| 2 | If `arg.gateContent.html` → store `_pendingGateContent`, clear open context. Else → `_openContext = arg || {}`, clear gate. |
| 3 | `Overlay._finishBeforeOpenProceed(inst)` runs. |
| 4 | If gate HTML → `_showGateContent`: stage shows gate DOM; `[data-cv-gate-proceed]` click merges `onProceed()` into `_openContext`, clears gate, calls `loadItem()`. |
| 5 | Else → `loadItem()`. |

---

## 7. `Overlay.open(instance)` — shell visible

| Step | What happens |
|------|----------------|
| 1 | `ensure()` if needed. |
| 2 | `activeInstance = instance`, clear swipe/minimize snapshot state. |
| 3 | WCAG: dialog attributes, `aria-label` on controls, saved `_focusBeforeOpen`. |
| 4 | Theme, RTL, zoom slider bounds, nav buttons, carousel toggle visibility, fullscreen/minimize toggles, tooltips, stage-only class, slideshow footer class. |
| 5 | `cv-visible`, `visible = true`, `body` overflow hidden. |
| 6 | Window `resize.cv-extract-overlay`: if extract overlay present, remove it and deactivate extract toolbar button. |
| 7 | Branch: `_beforeOpenPhase === 'loading'` → `_enterBeforeOpenLoading` (loader, hide footer/toolbar/carousel). Else if pending gate → `_showGateContent`. Else → `loadItem()`. |
| 8 | WCAG: delayed focus to close button or nav (stage-only rules apply). |

---

## 8. `loadItem(opts)` → `_loadItemCore`

| Step | What happens |
|------|----------------|
| 1 | Optional carousel rebuild/selection (if feature loaded). |
| 2 | If `opts.transition` and stage has children → add exit class, after ~280ms call `_loadItemCore(inst, true)`; else `_loadItemCore(inst, false)`. |
| 3 | **`_loadItemCore` sequence:** |
| 3a | `onLoading(item, inst)` if set. |
| 3b | `_prepareStage`: destroy previous result (`result.destroy()`), empty stage, hide loader, clear toolbar toggles, `_resetZoomPan()`. |
| 3c | `_updateHeader` (title, counter, html special cases). |
| 3d | `_renderContent` → see §9. |
| 3e | `_applyLayoutClasses` (pdf body classes, light stage background for image/inline/markdown). |
| 3f | `_updateCommentPanel` (normalize comments, show toggle, render first comment). |
| 3g | Store `inst._currentResult`; inline content cache if applicable. |
| 3h | `_resolveToolbar` (§10). |
| 3i | Poll row update if feature present. |
| 3j | `_updateNavButtons`, `_preloadAdjacentImages` (images). |
| 3k | Carousel selection update if present. |
| 3l | `onOpen(item, $stage, inst)`. |
| 3m | If **not** fade transition: `onComplete(item, inst)`. |
| 3n | `_startSlideshowTimer` (§16). |
| 3o | `_applyFadeIn`: if fading, runs `onComplete` after animation ends instead of step 3m. |

---

## 9. Content rendering (`_renderContent`)

| Step | What happens |
|------|----------------|
| 1 | Reset flags: `_isCustomRendered`, `_isImageItem`, `_isPdfItem`, `_isHtmlItem`. |
| 2 | If `opts.onRender` → call it. If stage has children → `_isCustomRendered = true`. |
| 3 | If not custom: set image/pdf/html flags from `type`; call `CV.renderers[type](item, $stage, inst, Overlay)` if registered. |
| 4 | If stage still empty → `builtInUnsupportedRenderer`. |
| 5 | Return `result` (object with optional `toolbar`, `destroy`, `inlineContent`, `imageError`, etc.). |

**Built-in `error` renderer** is registered in core for explicit error items.

---

## 10. Toolbar resolution (`_resolveToolbar`)

| Step | What happens |
|------|----------------|
| 1 | Branches by content type: HTML has special path (zoom hidden, optional slideshow button, optional HTML/MD source toggle). |
| 2 | PDF / image / inline / markdown / video / audio each have dedicated branches merging **default buttons** with `result.toolbar`, download, extract text (`canShowExtractText` + `extractText`), slideshow button from feature, etc. |
| 3 | `_buildToolbar` renders button rows; zoom widget shown only for image when applicable. |

---

## 11. Closing (`Overlay.close`)

| Step | What happens |
|------|----------------|
| 1 | Hide tooltip, shortcuts popup. |
| 2 | Clear slideshow timer. |
| 3 | Exit fullscreen if overlay was fullscreen. |
| 4 | `onCleanup(item, inst)` before teardown animation. |
| 5 | After timeout (~300ms): `_destroyCurrent`, `onClose(item, inst)`, remove visibility, restore `body` overflow, clear WCAG attributes, empty stage, reset zoom, clear `activeInstance`, **remove overlay DOM**, `built = false`, restore focus to `_focusBeforeOpen`. |

**Note:** Single-item close uses this full path. Navigating between items uses `inst.next`/`prev`/`goTo` which call `onClose` on the **previous** item via `_firePrevClose` before changing index (see §12).

---

## 12. Navigation (`next` / `prev` / `goTo` / `_nav`)

| Step | What happens |
|------|----------------|
| 1 | Set `_beforeCollectContext` (`next` / `prev` / `goTo`). |
| 2 | `_collectItems` (list may refresh from DOM). |
| 3 | Clear slideshow timer. |
| 4 | `_firePrevClose(currentItem)` → **`onClose(item, inst)`** when navigating away. |
| 5 | Update `idx` (respect `loop`). |
| 6 | `Overlay.loadItem({ transition: true })` when opts request transition. |

**Overlay `_nav('prev'|'next')`** calls `activeInstance.prev/next` (optional transition from swipe).

---

## 13. Keyboard (capture on `document`, only when overlay visible)

**Order inside `_handleKeydown`:** early exit if not visible or `keyboardNav` false. Then:

1. `_handleShortcutKey` — `?` or `Shift+/` toggles shortcuts popup (if enabled).
2. `_handleEscapeKey` — closes shortcuts popup, or exits browser fullscreen, or **`close()`** overlay.
3. `_handleArrowKeys` — if media focused, ±5s seek; else **prev/next** item (RTL swaps direction).
4. `_handleZoomKeys` — `+`/`-`/`=` for image zoom or PDF zoom buttons; skipped if focus in input/textarea/select.
5. `_handleFocusTrap` — Tab cycles within shell or shortcuts popup when `wcag` true.
6. `_handleMediaKeys` — Space play/pause, `m` mute, `r` playback rate (when jPlayer/native controls present).
7. `_handleToolbarShortcuts` — `q` HD, `d` download, `p` print, `f` fullscreen, `t` theme, `c` carousel, `s` slideshow, `n` minimize, plus `data-cv-shortcut` custom buttons.

**AI note:** Returning `true` causes `preventDefault` + `stopPropagation` + `stopImmediatePropagation`.

---

## 14. Image zoom / pan / gestures

| Flow | Behavior |
|------|-----------|
| Slider / ± buttons | `_setZoom` → removes OCR overlay, clamps pan, `_applyTransform`, may load hi-res. |
| Wheel | Zoom toward cursor; removes OCR overlay; GIF may reset pan. |
| Pinch | Two-finger zoom with focal point; removes OCR overlay. |
| Pan | Mouse drag on stage when zoom > 1; **not** started on `.cv-extract-word` (text selection). |
| Double-click | Reset zoom to 1. |
| Hi-res | When zoom crosses `zoom.loadHighResUrlAt`, swap `img.src` to resolved `zoomUrl`/download URL; loader shown. |

`_applyTransform` applies CSS transform to `.cv-img-transform` / `.cv-image`; syncs `.cv-extract-layer` size to image metrics when extract feature is present.

---

## 15. OCR / extract text (`feature-extract.js` + toolbar)

| Step | What happens |
|------|----------------|
| 1 | Toolbar shows extract button when `canShowExtractText(item, inst)` is truthy. |
| 2 | Click runs `extractText(item, inst, doneCallback, errorCallback)` (host implements). |
| 3 | Host returns OCR payload; utils map boxes → DOM using reference size + `object-fit: contain` metrics (`getCvImageContentMetrics`), normalized coordinate inference (`inferNormalizedRefDenomFromMax`, optional `normalizedDenominator`). |
| 4 | **Zoom/pan/resize** removes overlay and deactivates toolbar state; user must trigger extract again. |

---

## 16. Slideshow (`feature-slideshow.js` + core timer)

| Step | What happens |
|------|----------------|
| 1 | Feature registers `_slideshowButtonItem`, `_startSlideshowProgress`, `_stopSlideshowProgress` on overlay. |
| 2 | Toolbar gets play/pause when `slideshow.enabled` and enough items. |
| 3 | After each `_loadItemCore`, **`_startSlideshowTimer`**: if paused or disabled, stop progress bar; else `setTimeout` → `inst.next({ transition: true })`. |
| 4 | `advanceMedia === 'onEnd'` wires `ended` on video/audio for advance. |
| 5 | `showProgress` animates footer progress bar during interval. |

---

## 17. Carousel (`feature-carousel.js`)

| Step | What happens |
|------|----------------|
| 1 | When `carousel.enabled`, `Overlay.open` shows carousel toggle; `_buildCarousel` fills thumbnails. |
| 2 | Thumbnail click → `goTo(index, { transition: true })` (typical). |
| 3 | Header toggle opens/closes carousel strip; prev/next scroll the strip. |
| 4 | `loadItem` refreshes selection and nav visibility. |

---

## 18. Minimize / restore

| Step | What happens |
|------|----------------|
| 1 | Minimize button: `_captureMinimizedSnapshot`, `_applyMinimizedUi(true)` — overlay class, FAB, body scroll may restore. |
| 2 | Restore FAB: `_restoreFromMinimized` → `_beforeCollectContext = { trigger: 'restore' }`, `_collectItems`, then either reload from snapshot items or match `$el` and `loadItem()`. |

---

## 19. Attachment comments (`feature-comments` + core UI)

| Step | What happens |
|------|----------------|
| 1 | If `showAttachmentComment` and item has `comments` (or normalized list), header toggle shows; `_renderCommentAt` fills panel. |
| 2 | Prev/next cycles comments when multiple. |

Core defines `_normalizeComments`, `_renderCommentAt`; feature module extends overlay if needed.

---

## 20. Poll option row (`feature-poll.js`)

| Step | What happens |
|------|----------------|
| 1 | When item has poll fields, footer poll area shows; `_updatePollOption` (injected) updates selection UI. |

---

## 21. Theme and fullscreen

| Flow | Behavior |
|------|-----------|
| Theme toggle | Toggles `light`/`dark` on `inst.opts.theme`, updates class names, `onThemeChange`, `_syncThemeToggle`. |
| Fullscreen | Requests fullscreen on `.cv-overlay`; Escape exits fullscreen first; listeners sync icon. |

---

## 22. Swipe (touch)

| Flow | Behavior |
|------|-----------|
| Vertical swipe down | If `overlayClose` and `swipeToClose` → `close()`. |
| Horizontal swipe | If multiple items, `swipeNav` on, and **not** (image zoomed) → `_nav` prev/next. |

---

## 23. Stage-only mode

| Step | What happens |
|------|----------------|
| 1 | `stageOnly.enabled` adds `cv-stage-only` — chrome minimized per options. |
| 2 | `hideNavigation` hides prev/next. |
| 3 | Slideshow footer class may show for progress. |

---

## 24. `refresh()`

| Step | What happens |
|------|----------------|
| 1 | `_beforeCollectContext = { trigger: 'refresh' }`. |
| 2 | `_collectItems` → `_bindClicks`. |
| 3 | If was open and items remain → clamp idx, `loadItem()`. If was open and no items → `close()`. |

---

## 25. `destroy()`

| Step | What happens |
|------|----------------|
| 1 | Remove container click listener. |
| 2 | Remove `cv-instance` data. |
| 3 | If this instance is active → `Overlay.close()`. Else if no active instance, may remove orphan overlay DOM and reset `built`. |

---

## 26. Static helper `$.componentViewer(options)`

Creates a detached `<div>`, runs plugin on it, returns container — used for **items-only** / programmatic lists without scanning DOM.

---

## 27. `$.fn.componentViewer.getActive()`

Returns current `ComponentViewer` instance if overlay visible, else `null`.

---

## 28. Custom renderer / feature registration (extension flow)

| Kind | Contract |
|------|-----------|
| Renderer | `function (item, $stage, inst, overlay) { return { toolbar?: [...], destroy?: fn }; }` — register with `CV.registerRenderer('mytype', fn)`. |
| Feature | `function (overlay, utils) { /* attach methods to overlay */ }` — register with `CV.registerFeature('name', fn)`. Runs once in `Overlay.ensure()`. |

---

## 29. Callback summary (order of use)

| Callback | When |
|----------|------|
| `beforeCollectItems` | Before rebuilding `items`. |
| `beforeOpen` / `proceed` | After overlay shown in loading state; before main content. |
| `onLoading` | Start of `_loadItemCore`. |
| `onRender` | Before built-in renderers if it populates stage. |
| `onOpen` | After content + toolbar ready, before `onComplete` (non-fade). |
| `onComplete` | After load, or after fade-in animation if transition. |
| `onCleanup` | Early in `close` before animation completes. |
| `onClose` | After stage destroyed on close, or when **leaving** item via next/prev/goTo. |
| `onThemeChange` | Theme toggle. |
| `zoom.onZoom` | Zoom changes. |
| `onError` | Used by renderers/features when surfacing errors (see docs for exact call sites). |

---

## 30. Related files

| Area | Source |
|------|--------|
| Lifecycle, keyboard, zoom, open/close | `src/core.js` |
| Defaults and URL/security helpers | `src/utils.js` |
| Per-type rendering | `src/renderer-*.js` |
| Carousel, slideshow, minimize, comments, poll, extract | `src/feature-*.js` |
| Human docs | `documentation.html`, `ARCHITECTURE.md` |

---

*Generated for ComponentViewer. When in doubt, confirm behavior in `src/core.js` and the relevant `renderer-*` / `feature-*` module.*
