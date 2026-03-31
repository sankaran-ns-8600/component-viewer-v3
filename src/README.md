# ComponentViewer v3

A modular jQuery plugin for previewing attachments (images, video, audio, PDF, code, markdown, HTML) in a full-screen overlay with zoom/pan, keyboard navigation, carousel, slideshow, and OCR text extraction.

## What's new in v3

- **Modular architecture**: include only the renderers and features you need, or use the full bundle for drop-in compatibility with v2.
- **WCAG on by default**: focus trap, ARIA attributes, and keyboard labels are enabled out of the box.
- **Explicit instance passing**: renderers receive `inst` and `overlay` as parameters instead of reading a global singleton — cleaner, more testable code.
- **Fixed CSS**: removed Less-only syntax (`~"..."`) for pure CSS deployment; reduced `!important` usage.
- **Improved security**: markdown rendered through `textContent` assignment by default; DOMPurify integration point for hosts who need raw HTML.
- **Smaller footprint**: core + image renderer is ~2.5 KB gzipped; add only what you use.

## Quick start

### Full bundle (same API as v2)

```html
<link rel="stylesheet" href="component-viewer.css" />
<script src="jquery.min.js"></script>
<script src="component-viewer.js"></script>
```

### Modular (pick what you need)

```html
<link rel="stylesheet" href="component-viewer.css" />
<script src="jquery.min.js"></script>
<script src="src/utils.js"></script>
<script src="src/core.js"></script>
<script src="src/renderer-image.js"></script>
<!-- Only include if you need PDF -->
<script src="src/renderer-pdf.js"></script>
```

### Initialize

```javascript
$('#gallery').componentViewer({
  toolbar: { download: true, zoom: true }
});
```

## File structure

```
component-viewer-v3/
├── src/
│   ├── utils.js              # Shared helpers, constants, security, I18N
│   ├── core.js               # Overlay, lifecycle, toolbar, keyboard, theme
│   ├── renderer-image.js     # Image (zoom, pan, pinch, hi-res swap)
│   ├── renderer-video.js     # Video (jPlayer + native fallback, HD)
│   ├── renderer-audio.js     # Audio (jPlayer + native fallback)
│   ├── renderer-pdf.js       # PDF (PDF.js with full controls)
│   ├── renderer-inline.js    # Inline code (line numbers, syntax highlight)
│   ├── renderer-markdown.js  # Markdown (marked.js or minimal parser)
│   ├── renderer-html.js      # HTML iframe
│   ├── feature-carousel.js   # Thumbnail strip
│   ├── feature-slideshow.js  # Auto-advance slideshow
│   ├── feature-minimize.js   # Minimize/restore FAB
│   ├── feature-comments.js   # Attachment comment panel
│   ├── feature-poll.js       # Poll option row
│   └── feature-extract.js    # OCR text overlay
├── component-viewer.js       # Full bundle (all modules)
├── component-viewer.css      # Styles
├── documentation.html        # API documentation
├── example.html              # Live demo
├── README.md                 # This file
├── ARCHITECTURE.md           # Module design and registration system
└── CHANGELOG.md              # Version history
```

## Documentation

Open [documentation.html](documentation.html) in a browser for the full API reference, interactive playground, and examples.

## License

MIT

## Author

[Sankaran N](https://www.linkedin.com/in/sankaran-natarajan-238b0214a/)
