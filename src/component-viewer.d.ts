/// <reference types="jquery" />

/**
 * Type definitions for ComponentViewer jQuery plugin v3.
 * @see https://github.com/ — implementation: component-viewer.js
 */

/** Theme name used by the viewer chrome. */
type ComponentViewerTheme = 'dark' | 'light';

/** Which URL field `resolveUrl` is being asked to supply. */
type ComponentViewerUrlType = 'src' | 'zoomUrl' | 'thumbnailUrl';

/** Trigger values stored on the instance while `beforeCollectItems` runs. */
type ComponentViewerBeforeCollectTrigger =
  | 'init'
  | 'click'
  | 'open'
  | 'next'
  | 'prev'
  | 'goTo'
  | 'refresh';

/**
 * Context set on the instance after `beforeOpen` calls `proceed(openOptions)` without `gateContent`.
 * Passed through for use in `resolveUrl` and similar hooks.
 */
interface ComponentViewerOpenContext {
  [key: string]: unknown;
}

/**
 * Payload for `beforeOpen` / video gate: show HTML in the stage until the user proceeds.
 */
interface ComponentViewerGateContent {
  /** HTML string, jQuery object, or DOM node to render in the gate UI. */
  html?: string | JQuery | HTMLElement;
  /** Called when the user activates proceed; return value becomes `_videoBeforePlayContext` for video. */
  onProceed?: () => ComponentViewerOpenContext | void;
}

interface ComponentViewerBeforeOpenProceedArg {
  /** When set, shows gated UI instead of loading the item until the user proceeds. */
  gateContent?: ComponentViewerGateContent;
  [key: string]: unknown;
}

interface ComponentViewerBeforeCollectContext {
  /** Why the items list is being rebuilt. */
  trigger?: ComponentViewerBeforeCollectTrigger;
  /** Matched `.cv-item` node for click-driven collection. */
  $element?: JQuery;
  /** Native event when `trigger` is `'click'`. */
  originalEvent?: Event;
  /** Argument passed to `open()` when `trigger` is `'open'`. */
  openArg?: unknown;
  /** Target index when `trigger` is `'goTo'`. */
  index?: number;
}

interface ComponentViewerStageOnlyOptions {
  /** When true, hide chrome; only stage and prev/next remain. */
  enabled?: boolean;
  /** Hide prev/next buttons in stage-only mode. */
  hideNavigation?: boolean;
}

interface ComponentViewerCarouselOptions {
  enabled?: boolean;
  /** Show carousel scroll arrows when item count exceeds this (default 4). */
  navThreshold?: number;
}

interface ComponentViewerSlideshowOptions {
  enabled?: boolean;
  /** Advance interval in seconds (default 4). */
  interval?: number;
  /** When true, slideshow starts when the overlay opens. */
  autoStart?: boolean;
  /** `'interval'`: timer only; `'onEnd'`: also advance when video/audio ends. */
  advanceMedia?: 'interval' | 'onEnd';
  /** Show a progress bar for the current interval. */
  showProgress?: boolean;
  /** Hide the footer slideshow button (e.g. when using autoStart only). */
  hideSlideshowButton?: boolean;
}

interface ComponentViewerMinimizeOptions {
  enabled?: boolean;
}

interface ComponentViewerToolbarFlags {
  download?: boolean;
  zoom?: boolean;
  extractText?: boolean;
  /**
   * When true and `resolveMarkdownToggleUrl` is set, HTML items with a markdown-like extension
   * get a toolbar toggle to swap iframe URL between rendered and source.
   */
  toggleSource?: boolean;
}

interface ComponentViewerZoomOptions {
  min?: number;
  max?: number;
  step?: number;
  wheelStep?: number;
  showPercentage?: boolean;
  /** Called when image zoom level changes: current scale, active item, viewer instance. */
  onZoom?: (scale: number, item: ComponentViewerItem, inst: ComponentViewerInstance) => void;
  /**
   * When set to a zoom scale threshold, swap to `item.zoomUrl` / high-res URL at or above this level.
   */
  loadHighResUrlAt?: number | false;
}

interface ComponentViewerPdfOptions {
  workerSrc?: string | null;
  cMapUrl?: string | null;
  cMapPacked?: boolean;
  annotations?: boolean;
  autoFit?: boolean;
  autoFitMinScale?: number;
  autoFitMaxScale?: number;
  twoPageView?: boolean;
  extractText?: boolean;
}

interface ComponentViewerMarkdownOptions {
  /** Toolbar button to toggle rendered markdown vs raw source. */
  toggleRawView?: boolean;
}

interface ComponentViewerInlineOptions {
  /** Use `window.hljs` when present for syntax highlighting. */
  syntaxHighlight?: boolean;
  /** Return language id (e.g. `'javascript'`) for Highlight.js; if null, inferred from item. */
  getLanguage?: ((item: ComponentViewerItem) => string | null) | null;
}

interface ComponentViewerVideoOptions {
  onGetHdUrl?: (item: ComponentViewerItem, inst: ComponentViewerInstance) => string | null | undefined;
  canShowHDButton?: (item: ComponentViewerItem, inst: ComponentViewerInstance) => boolean;
  /**
   * Gate video playback: call `proceed()` to start jPlayer, or `proceed({ gateContent })` to show gate UI.
   * Fourth argument is the stage jQuery wrapper for the current item.
   */
  beforeVideoPlay?: (
    item: ComponentViewerItem,
    inst: ComponentViewerInstance,
    proceed: (arg?: ComponentViewerBeforeOpenProceedArg) => void,
    $stage: JQuery
  ) => void;
  autoplay?: boolean;
}

interface ComponentViewerAudioOptions {
  autoplay?: boolean;
}

interface ComponentViewerPollOptionOptions {
  enabled?: boolean;
  mode?: 'radio' | 'checkbox';
  /**
   * @param selected - true/false for checkbox; for radio, true when selected.
   * @param element - DOM node of the bound `.cv-item` (if any).
   */
  onSelect?: (
    item: ComponentViewerItem,
    selected: boolean,
    viewer: ComponentViewerInstance,
    element: Element | null
  ) => void;
}

interface ComponentViewerErrorInfo {
  type?: string;
  message?: string;
  item?: ComponentViewerItem;
  $stage?: JQuery;
}

/**
 * Return value from `onRender` or a registered renderer; drives toolbar and teardown.
 */
interface ComponentViewerRenderResult {
  /** Footer toolbar entries (in addition to built-in zoom/download logic). */
  toolbar?: ComponentViewerToolbarEntry[];
  /** Called when switching items or closing the overlay. */
  destroy?: () => void;
  /** When true, built-in toolbar is reduced (e.g. image error state). */
  imageError?: boolean;
  /** Inline renderer may expose raw content for copy/extract features. */
  inlineContent?: string | null;
}

type ComponentViewerToolbarEntry =
  | ToolbarItem
  | 'separator'
  | '-'
  | HTMLElement
  | JQuery;

/**
 * A single attachment or programmatic item shown in the viewer.
 */
interface ComponentViewerItem {
  /** Renderer key: `image`, `video`, `audio`, `pdf`, `inline`, `markdown`, `html`, etc. */
  type?: string;
  /** Shown in the header. */
  title?: string;
  /** Main content URL. */
  src?: string | null;
  /** URL used for the download button. */
  downloadUrl?: string | null;
  /** High-res URL for zoom / HD. */
  zoomUrl?: string | null;
  fileExt?: string | null;
  fileSize?: string | number | null;
  thumbnailUrl?: string | null;
  /** Alternate HD stream URL for video (jPlayer). */
  hdUrl?: string | null;
  message?: string | null;
  /** For `html` type or inline HTML snippets. */
  html?: string | null;
  /** For `inline` / fetched text content. */
  content?: string | null;
  author?: string | null;
  /** Short description shown in the attachment-comment panel when enabled. */
  comment?: string | null;
  /** Multiple comments when `showAttachmentComment` and comment navigation are used. */
  comments?: unknown[] | undefined;
  pollOptionLabel?: string | null;
  pollOptionId?: string | number | null;
  pollOptionSelected?: boolean;
  /** jPlayer `supplied` formats for video/audio (e.g. `['m4v', 'mp4']`). */
  supplied?: string[] | null;
  /** jQuery wrapper for the DOM node this item was collected from (items-from-DOM only). */
  $el?: JQuery;
  [key: string]: unknown;
}

/**
 * Custom footer toolbar button descriptor.
 */
interface ToolbarItem {
  /** DOM class suffix `cv-tb-{id}` when set. */
  id?: string;
  /** SVG/HTML string or a CSS class name for `<i class="cv-tb-icon ...">`. */
  icon?: string;
  visible?: boolean | ((item: ComponentViewerItem, inst: ComponentViewerInstance) => boolean);
  label?: string;
  tooltip?: string;
  showLabel?: boolean;
  className?: string;
  /** Single-letter shortcut (case-insensitive) bound while the overlay is open. */
  shortcutKey?: string;
  onClick?: (item: ComponentViewerItem, inst: ComponentViewerInstance) => void;
}

/**
 * Public options object for `$(el).componentViewer(options)` / `$.componentViewer(options)`.
 * All properties are optional; defaults match the plugin `defaults` object.
 */
interface ComponentViewerOptions {
  /** Non-empty array replaces DOM collection via `selector`. */
  items?: ComponentViewerItem[] | null;
  /** Elements under the container that open the viewer (default `.cv-item`). */
  selector?: string;
  loop?: boolean;
  /** Close when clicking the backdrop. */
  overlayClose?: boolean;
  keyboardNav?: boolean;
  /** When true, `?` opens a keyboard-shortcuts popup. */
  shortcutsPopup?: boolean;
  swipeNav?: boolean;
  swipeToClose?: boolean;
  canShowTooltip?: boolean;
  isRTL?: boolean;
  minimize?: boolean | ComponentViewerMinimizeOptions;
  showCounter?: boolean;
  preloadAdjacentImages?: boolean;
  /** `true` is normalized to `{ enabled: true, hideNavigation: false }`. */
  stageOnly?: boolean | ComponentViewerStageOnlyOptions;
  carousel?: ComponentViewerCarouselOptions;
  slideshow?: ComponentViewerSlideshowOptions | null;
  theme?: ComponentViewerTheme | string;
  themeToggle?: boolean;
  fullscreen?: boolean;
  toolbar?: ComponentViewerToolbarFlags;
  zoom?: ComponentViewerZoomOptions;
  markdown?: ComponentViewerMarkdownOptions;
  inline?: ComponentViewerInlineOptions;
  /**
   * Override inline body HTML after content is loaded; return string/HTML for `.cv-inline-body`.
   * When set, overrides built-in / Highlight.js rendering.
   */
  onInlineHtml?: ((content: string, item: ComponentViewerItem, inst: ComponentViewerInstance) => string) | null;
  toolbarItems?: ComponentViewerToolbarEntry[];
  pdf?: ComponentViewerPdfOptions;
  video?: ComponentViewerVideoOptions;
  audio?: ComponentViewerAudioOptions;
  supportedVideoFormats?: string[] | null;
  supportedAudioFormats?: string[] | null;
  /**
   * Map a DOM node to an item; return `null`/`undefined` to fall back to the default built item.
   */
  itemData?: ((element: JQuery, defaultItem: ComponentViewerItem) => ComponentViewerItem | null | undefined) | null;
  wcag?: boolean;
  pollOption?: ComponentViewerPollOptionOptions | null;
  showAttachmentComment?: boolean;
  canShowExtractText?: ((item: ComponentViewerItem, inst: ComponentViewerInstance) => boolean) | null;
  /**
   * Host OCR: call `done({ data: { lines: [...] } })` or `error(message)`.
   */
  extractText?:
    | ((
        item: ComponentViewerItem,
        inst: ComponentViewerInstance,
        done: (resp: unknown) => void,
        error: (message: string) => void
      ) => void)
    | null;
  /**
   * Runs after the overlay opens with a loader; call `proceed()` or `proceed({ gateContent })`.
   * For items-only mode, `element` may be empty if `item.$el` is missing.
   */
  beforeOpen?:
    | ((
        item: ComponentViewerItem,
        element: JQuery,
        proceed: (arg?: ComponentViewerBeforeOpenProceedArg) => void
      ) => void)
    | null;
  /**
   * Sync: `(viewer) => void`. Async: `(viewer, proceed) => void` — must call `proceed()`.
   */
  beforeCollectItems?:
    | ((viewer: ComponentViewerInstance) => void)
    | ((viewer: ComponentViewerInstance, proceed: () => void) => void)
    | null;
  onThemeChange?: ((theme: ComponentViewerTheme | string, inst: ComponentViewerInstance) => void) | null;
  resolveUrl?:
    | ((
        item: ComponentViewerItem,
        viewer: ComponentViewerInstance,
        urlType: ComponentViewerUrlType
      ) => string | null | undefined)
    | null;
  /**
   * For HTML+markdown toolbar toggle: return URL for iframe `src` when `isSource` is true (raw) or false (rendered).
   */
  resolveMarkdownToggleUrl?:
    | ((
        item: ComponentViewerItem,
        viewer: ComponentViewerInstance,
        isSource: boolean
      ) => string | null | undefined)
    | null;
  /** Full stage override; return a {@link ComponentViewerRenderResult}. */
  onRender?:
    | ((
        item: ComponentViewerItem,
        $stage: JQuery,
        inst: ComponentViewerInstance
      ) => ComponentViewerRenderResult | void)
    | null;
  /** Mutate or replace the default toolbar array for the current item. */
  onToolbar?:
    | ((
        item: ComponentViewerItem,
        defaultToolbar: ComponentViewerToolbarEntry[],
        viewer: ComponentViewerInstance
      ) => ComponentViewerToolbarEntry[] | void)
    | null;
  /** Return `true` to suppress the default error card. */
  onError?: ((info: ComponentViewerErrorInfo) => boolean | void) | null;
  onLoading?: ((item: ComponentViewerItem, inst: ComponentViewerInstance) => void) | null;
  onOpen?: ((item: ComponentViewerItem, $stage: JQuery, inst: ComponentViewerInstance) => void) | null;
  onComplete?: ((item: ComponentViewerItem, inst: ComponentViewerInstance) => void) | null;
  onCleanup?: ((item: ComponentViewerItem, inst: ComponentViewerInstance) => void) | null;
  onClose?: ((item: ComponentViewerItem, inst: ComponentViewerInstance) => void) | null;
  onDownload?: ((item: ComponentViewerItem, viewer: ComponentViewerInstance) => void) | null;
}

/**
 * Per-container plugin instance returned from `$(container).data('cv-instance')` or `getActive()`.
 */
interface ComponentViewerInstance {
  items: ComponentViewerItem[];
  idx: number;
  opts: ComponentViewerOptions;
  id: number;
  $container: JQuery;
  /** Open by index, jQuery object, or DOM element matching an item's `$el`. */
  open(indexOrElement?: number | JQuery | Element | null): void;
  close(): void;
  next(opts?: { transition?: boolean }): void;
  prev(opts?: { transition?: boolean }): void;
  goTo(index: number, opts?: { transition?: boolean }): void;
  currentItem(): ComponentViewerItem | undefined;
  setTheme(theme: ComponentViewerTheme | string): void;
  /** Re-scan items and reload if open. */
  refresh(): void;
  showLoader(): void;
  hideLoader(): void;
  showStripMessage(text: string, durationMs?: number): void;
  destroy(): void;
  /** Set by `beforeOpen` / `proceed` for URL resolution hooks. */
  _openContext?: ComponentViewerOpenContext | null;
  /** Set while `beforeCollectItems` runs (see docs). */
  _beforeCollectContext?: ComponentViewerBeforeCollectContext | null;
  /** Context from markdown/HTML video gate `onProceed` after the user proceeds. */
  _videoBeforePlayContext?: ComponentViewerOpenContext;
  [key: string]: unknown;
}

/** Built-in SVG/HTML snippets for header, toolbar, and media chrome. */
interface ComponentViewerIcons {
  close: string;
  prev: string;
  next: string;
  zoomIn: string;
  zoomOut: string;
  download: string;
  fileIcon: string;
  error: string;
  rotateCw: string;
  prevPage: string;
  nextPage: string;
  thumbnails: string;
  print: string;
  copy: string;
  extractText: string;
  twoPageView: string;
  themeLight: string;
  themeDark: string;
  fullscreen: string;
  fullscreenExit: string;
  minimize: string;
  restore: string;
  play: string;
  comment: string;
  [key: string]: string;
}

/** Default English UI strings; override on `$.fn.componentViewer.defaultStrings` for I18N. */
interface ComponentViewerDefaultStrings {
  close?: string;
  fullscreen?: string;
  exitFullscreen?: string;
  attachments?: string;
  showAttachments?: string;
  scrollCarouselLeft?: string;
  scrollCarouselRight?: string;
  previousItem?: string;
  nextItem?: string;
  zoomOut?: string;
  zoomLevel?: string;
  zoomIn?: string;
  switchToLightMode?: string;
  switchToDarkMode?: string;
  minimize?: string;
  restoreViewer?: string;
  playSlideshow?: string;
  pauseSlideshow?: string;
  download?: string;
  downloadSource?: string;
  invalidImageUrl?: string;
  imageLoadFailed?: string;
  play?: string;
  pause?: string;
  playbackSpeed?: string;
  cyclePlaybackSpeed?: string;
  hd?: string;
  toggleHd?: string;
  mute?: string;
  unmute?: string;
  thumbnails?: string;
  previousPage?: string;
  nextPage?: string;
  rotate?: string;
  print?: string;
  extractText?: string;
  twoPageView?: string;
  singlePageView?: string;
  copy?: string;
  copiedToClipboard?: string;
  viewSource?: string;
  viewMarkdown?: string;
  htmlMdToggleSource?: string;
  htmlMdToggleMarkdown?: string;
  pdf?: string;
  previewNotAvailable?: string;
  file?: string;
  audio?: string;
  couldNotLoadFileInline?: string;
  noContentInline?: string;
  noHtmlProvided?: string;
  typeVideo?: string;
  typeCode?: string;
  typeHtml?: string;
  typeError?: string;
  carouselItemLabel?: string;
  playPause?: string;
  muteUnmute?: string;
  showShortcuts?: string;
  keyboardShortcuts?: string;
  toggleTheme?: string;
  toggleSlideshow?: string;
  pollUpdated?: string;
  toggleComment?: string;
  commentBy?: string;
  commentPrev?: string;
  commentNext?: string;
  commentCounter?: string;
  [key: string]: string | undefined;
}

/**
 * v3 internal bridge: renderers, features, overlay singleton, and shared `Utils`.
 * Prefer registering custom types via `registerRenderer` / `registerFeature` rather than mutating internals.
 */
interface ComponentViewerCvBridge {
  registerRenderer(type: string, fn: ComponentViewerRendererFn): void;
  registerFeature(name: string, fn: ComponentViewerFeatureInitFn): void;
  renderers: Record<string, ComponentViewerRendererFn | undefined>;
  features: Record<string, ComponentViewerFeatureInitFn | undefined>;
  /** Overlay singleton (DOM shell, loadItem, etc.). */
  Overlay: unknown;
  Utils: ComponentViewerUtils;
  DEFAULTS?: ComponentViewerOptions;
  DEFAULT_STRINGS?: ComponentViewerDefaultStrings;
  Icons?: ComponentViewerIcons;
}

type ComponentViewerRendererFn = (
  item: ComponentViewerItem,
  $stage: JQuery,
  inst: ComponentViewerInstance,
  overlay: unknown
) => ComponentViewerRenderResult | void;

/** Most features only receive `overlay`; some (e.g. extract) also receive `utils`. */
type ComponentViewerFeatureInitFn = (overlay: unknown, utils?: ComponentViewerUtils) => void;

/** Subset of helpers exposed on the bridge for extensions (full surface is implementation-defined). */
interface ComponentViewerUtils {
  DEFAULTS?: ComponentViewerOptions;
  DEFAULT_STRINGS?: ComponentViewerDefaultStrings;
  Icons?: ComponentViewerIcons;
  escHtml?(s: unknown): string;
  str?(inst: ComponentViewerInstance | null | undefined, key: string): string;
  isNullish?(x: unknown): boolean;
  [key: string]: unknown;
}

interface ComponentViewerJQueryPluginFunction {
  (options?: ComponentViewerOptions): JQuery;
  (method: string, ...args: any[]): any;
  /** Internal registration API and shared utilities. */
  _cv: ComponentViewerCvBridge;
  /** Default option values; safe to mutate for global overrides. */
  defaults: ComponentViewerOptions;
  Icons: ComponentViewerIcons;
  defaultStrings: ComponentViewerDefaultStrings;
  /** The instance currently owning the visible overlay, or `null`. */
  getActive(): ComponentViewerInstance | null;
}

declare module 'jquery' {
  interface JQuery<TElement = HTMLElement> {
    /**
     * Initialize ComponentViewer on each matched container, or invoke an instance method.
     * @example $(root).componentViewer({ items: [...] })
     * @example $(root).componentViewer('open', 0)
     */
    componentViewer(options?: ComponentViewerOptions): this;
    componentViewer(method: string, ...args: any[]): any;
  }

  interface JQueryStatic {
    /**
     * Creates a detached `<div>`, initializes ComponentViewer, and returns that jQuery object.
     */
    componentViewer(options?: ComponentViewerOptions): JQuery;

    fn: JQuery & {
      componentViewer: ComponentViewerJQueryPluginFunction;
    };
  }
}
