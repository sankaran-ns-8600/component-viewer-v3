#!/usr/bin/env node
/**
 * Concatenates all src/ modules into component-viewer.js (full bundle).
 * Run: node scripts/build-bundle.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

const MODULES = [
  'utils.js', 'core.js', 'renderer-image.js', 'renderer-video.js',
  'renderer-audio.js', 'renderer-pdf.js', 'renderer-inline.js',
  'renderer-markdown.js', 'renderer-html.js', 'feature-carousel.js',
  'feature-slideshow.js', 'feature-minimize.js', 'feature-comments.js',
  'feature-poll.js', 'feature-extract.js',
];

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

let bundle = `/**\n * ComponentViewer — Full Bundle\n * All modules concatenated in dependency order.\n * License: ${pkg.license} | Author: ${pkg.author}\n */\n`;

for (const mod of MODULES) {
  const filePath = path.join(SRC, mod);
  if (!fs.existsSync(filePath)) {
    console.warn(`WARNING: ${mod} not found, skipping`);
    continue;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').length;
  bundle += `\n/* ====== ${mod} (${lines} lines) ====== */\n\n`;
  bundle += content;
  bundle += '\n';
  console.log(`  ${mod}: ${lines} lines`);
}

const outPath = path.join(ROOT, 'component-viewer.js');
fs.writeFileSync(outPath, bundle, 'utf8');
const totalLines = bundle.split('\n').length;
console.log(`\nBundle written: ${outPath} (${totalLines} lines)`);
