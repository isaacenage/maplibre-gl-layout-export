# maplibre-gl-layout-export

A print layout and export plugin for MapLibre GL JS. Build composable map layouts with draggable map frames, rich text labels, and images, then export to PNG, PDF, or SVG.

Works with any MapLibre GL JS project — vanilla JavaScript, TypeScript, React, Vue, Angular, or any other framework. No React code required from the consumer.

---

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start (Vanilla JS / TypeScript)](#quick-start-vanilla-js--typescript)
- [Quick Start (React)](#quick-start-react)
- [Usage with Bundlers](#usage-with-bundlers)
- [Usage with CDN (Script Tag)](#usage-with-cdn-script-tag)
- [API Reference](#api-reference)
- [Framework Examples](#framework-examples)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

- Drag-and-drop map frames with pan/zoom support inside the layout
- Rich text elements with full formatting (font family, size, bold, italic, underline, color, alignment, highlight)
- Image elements with drag, resize, and object-fit options
- Paper sizes: A4, A3, Letter, Legal
- Landscape and portrait orientations
- Configurable DPI (96, 150, 200, 300)
- Export to PNG, PDF, SVG, or browser print
- Lock/unlock individual elements
- Keyboard shortcuts (Escape to close, Delete to remove elements)
- Standard MapLibre GL JS `IControl` interface — works with `map.addControl()`

---

## Requirements

- MapLibre GL JS 3.x or 4.x
- A modern browser with WebGL support

The plugin uses React and Tiptap internally to render its editor UI. These are listed as peer dependencies and must be installed alongside the plugin, but you do not need to write any React code yourself.

---

## Installation

### Step 1: Install the plugin

```bash
npm install @isaacenage/maplibre-gl-layout-export
```

### Step 2: Install peer dependencies

The plugin requires the following peer dependencies. If your project does not already include them, install them:

```bash
npm install react react-dom maplibre-gl
```

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-text-style @tiptap/extension-font-family @tiptap/extension-color @tiptap/extension-text-align @tiptap/extension-underline @tiptap/extension-highlight
```

Or in a single command:

```bash
npm install react react-dom maplibre-gl @tiptap/react @tiptap/starter-kit @tiptap/extension-text-style @tiptap/extension-font-family @tiptap/extension-color @tiptap/extension-text-align @tiptap/extension-underline @tiptap/extension-highlight
```

If you are using yarn or pnpm, substitute accordingly:

```bash
yarn add react react-dom maplibre-gl @tiptap/react @tiptap/starter-kit @tiptap/extension-text-style @tiptap/extension-font-family @tiptap/extension-color @tiptap/extension-text-align @tiptap/extension-underline @tiptap/extension-highlight

pnpm add react react-dom maplibre-gl @tiptap/react @tiptap/starter-kit @tiptap/extension-text-style @tiptap/extension-font-family @tiptap/extension-color @tiptap/extension-text-align @tiptap/extension-underline @tiptap/extension-highlight
```

### Step 3: Import the CSS

The plugin ships its own stylesheet. You must import it for the layout UI to render correctly.

In a bundler (Vite, Webpack, Parcel, etc.):

```js
import '@isaacenage/maplibre-gl-layout-export/style.css';
```

Or link it directly in HTML if your setup copies node_modules assets:

```html
<link rel="stylesheet" href="node_modules/@isaacenage/maplibre-gl-layout-export/dist/style.css" />
```

Make sure you also have the MapLibre GL CSS loaded:

```js
import 'maplibre-gl/dist/maplibre-gl.css';
```

---

## Quick Start (Vanilla JS / TypeScript)

This is the simplest way to use the plugin. It works in any project that has a MapLibre GL JS map, regardless of framework.

```js
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { LayoutExportControl } from '@isaacenage/maplibre-gl-layout-export';
import '@isaacenage/maplibre-gl-layout-export/style.css';

const map = new maplibregl.Map({
  container: 'map',
  style: 'https://demotiles.maplibre.org/style.json',
  center: [0, 0],
  zoom: 2,
});

// Add the print/export control to the map
map.addControl(new LayoutExportControl(), 'top-right');
```

That is all. A printer icon button will appear in the top-right corner of the map. Clicking it opens the full-screen layout editor.

### Corresponding HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Map Layout Export</title>
  <style>
    body { margin: 0; }
    #map { width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script type="module" src="./main.js"></script>
</body>
</html>
```

---

## Quick Start (React)

If you are building a React application, you can either use the `IControl` approach above, or import the `PrintLayoutView` component directly for more control.

### Option A: Using the IControl (recommended)

```tsx
import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { LayoutExportControl } from '@isaacenage/maplibre-gl-layout-export';
import '@isaacenage/maplibre-gl-layout-export/style.css';

function MapComponent() {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [0, 0],
      zoom: 2,
    });

    map.addControl(new LayoutExportControl(), 'top-right');

    return () => map.remove();
  }, []);

  return <div ref={mapContainer} style={{ width: '100%', height: '100vh' }} />;
}
```

### Option B: Using the React component directly

For advanced use cases where you want to control visibility and integrate the layout view into your own UI:

```tsx
import { useState, useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { PrintLayoutView } from '@isaacenage/maplibre-gl-layout-export';
import '@isaacenage/maplibre-gl-layout-export/style.css';

function MapWithLayout() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [showLayout, setShowLayout] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    const m = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [0, 0],
      zoom: 2,
    });

    m.on('load', () => setMap(m));
    return () => m.remove();
  }, []);

  return (
    <>
      <div ref={mapContainer} style={{ width: '100%', height: '100vh' }} />
      <button onClick={() => setShowLayout(true)}>Open Layout</button>
      <PrintLayoutView
        map={map}
        isVisible={showLayout}
        onClose={() => setShowLayout(false)}
      />
    </>
  );
}
```

---

## Usage with Bundlers

The plugin ships both ESM and CommonJS builds. Modern bundlers (Vite, Webpack 5, Rollup, Parcel, esbuild) will automatically resolve the correct format.

| Bundler  | Format Resolved | Notes                                    |
|----------|-----------------|------------------------------------------|
| Vite     | ESM             | Works out of the box                     |
| Webpack 5| ESM or CJS      | Works out of the box                     |
| Rollup   | ESM             | Works out of the box                     |
| Parcel   | ESM             | Works out of the box                     |
| esbuild  | ESM or CJS      | Works out of the box                     |

No special bundler configuration is needed.

---

## Usage with CDN (Script Tag)

If you are not using a bundler, you can load the plugin via a CDN that serves npm packages (such as unpkg or jsDelivr). Note that you must also load all peer dependencies via script tags.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Map Layout Export</title>

  <!-- MapLibre GL CSS -->
  <link rel="stylesheet" href="https://unpkg.com/maplibre-gl/dist/maplibre-gl.css" />

  <!-- Plugin CSS -->
  <link rel="stylesheet" href="https://unpkg.com/@isaacenage/maplibre-gl-layout-export/dist/style.css" />

  <style>
    body { margin: 0; }
    #map { width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <div id="map"></div>

  <!-- Dependencies -->
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/maplibre-gl/dist/maplibre-gl.js"></script>

  <!-- Plugin (UMD/CJS) -->
  <script src="https://unpkg.com/@isaacenage/maplibre-gl-layout-export/dist/index.js"></script>

  <script>
    var map = new maplibregl.Map({
      container: 'map',
      style: 'https://demotiles.maplibre.org/style.json',
      center: [0, 0],
      zoom: 2,
    });

    // The plugin attaches to the global scope via CJS exports
    // Access may vary by CDN setup — check the browser console for the global name
  </script>
</body>
</html>
```

**Important:** CDN usage requires that the Tiptap extensions are also available at runtime. Because Tiptap does not publish UMD builds, the CDN approach may not work without a bundler for the Tiptap dependencies. The recommended approach is to use a bundler.

---

## API Reference

### LayoutExportControl

The main entry point. Implements the MapLibre GL JS `IControl` interface.

```ts
import { LayoutExportControl } from '@isaacenage/maplibre-gl-layout-export';

const control = new LayoutExportControl();
map.addControl(control, 'top-right');
```

**Methods:**

| Method    | Description                           |
|-----------|---------------------------------------|
| `open()`  | Programmatically open the layout view |
| `close()` | Programmatically close the layout view|

```ts
// Open the layout editor from your own button
document.getElementById('my-button').addEventListener('click', () => {
  control.open();
});
```

### PrintLayoutView (React component)

For React users who want direct control over the layout view.

```ts
import { PrintLayoutView } from '@isaacenage/maplibre-gl-layout-export';
```

**Props:**

| Prop        | Type              | Description                                |
|-------------|-------------------|--------------------------------------------|
| `map`       | `Map \| null`     | A MapLibre GL JS map instance              |
| `isVisible` | `boolean`         | Whether the layout editor is visible       |
| `onClose`   | `() => void`      | Callback when the user closes the editor   |

### Exported Types

The following TypeScript types are exported for advanced usage:

```ts
import type {
  PaperSize,       // 'A4' | 'A3' | 'Letter' | 'Legal'
  Orientation,     // 'landscape' | 'portrait'
  PrintElement,    // Union of text, map, and image element types
  PrintLayoutState // Full state of the layout editor
} from '@isaacenage/maplibre-gl-layout-export';
```

---

## Framework Examples

### Vue 3

```vue
<template>
  <div ref="mapContainer" style="width: 100%; height: 100vh" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { LayoutExportControl } from '@isaacenage/maplibre-gl-layout-export';
import '@isaacenage/maplibre-gl-layout-export/style.css';

const mapContainer = ref(null);
let map = null;

onMounted(() => {
  map = new maplibregl.Map({
    container: mapContainer.value,
    style: 'https://demotiles.maplibre.org/style.json',
    center: [0, 0],
    zoom: 2,
  });

  map.addControl(new LayoutExportControl(), 'top-right');
});

onUnmounted(() => {
  if (map) map.remove();
});
</script>
```

### Angular

```typescript
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import maplibregl from 'maplibre-gl';
import { LayoutExportControl } from '@isaacenage/maplibre-gl-layout-export';

@Component({
  selector: 'app-map',
  template: '<div #mapEl style="width: 100%; height: 100vh"></div>',
})
export class MapComponent implements OnInit, OnDestroy {
  @ViewChild('mapEl', { static: true }) mapEl!: ElementRef;
  private map?: maplibregl.Map;

  ngOnInit() {
    this.map = new maplibregl.Map({
      container: this.mapEl.nativeElement,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [0, 0],
      zoom: 2,
    });

    this.map.addControl(new LayoutExportControl(), 'top-right');
  }

  ngOnDestroy() {
    this.map?.remove();
  }
}
```

Make sure the CSS imports are included in your `angular.json` styles array or in a global stylesheet:

```css
@import 'maplibre-gl/dist/maplibre-gl.css';
@import '@isaacenage/maplibre-gl-layout-export/style.css';
```

### Svelte

```svelte
<script>
  import { onMount, onDestroy } from 'svelte';
  import maplibregl from 'maplibre-gl';
  import 'maplibre-gl/dist/maplibre-gl.css';
  import { LayoutExportControl } from '@isaacenage/maplibre-gl-layout-export';
  import '@isaacenage/maplibre-gl-layout-export/style.css';

  let mapContainer;
  let map;

  onMount(() => {
    map = new maplibregl.Map({
      container: mapContainer,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [0, 0],
      zoom: 2,
    });

    map.addControl(new LayoutExportControl(), 'top-right');
  });

  onDestroy(() => {
    if (map) map.remove();
  });
</script>

<div bind:this={mapContainer} style="width: 100%; height: 100vh;" />
```

---

## Configuration

### Control Position

The control button can be placed in any of the four MapLibre control positions:

```js
map.addControl(new LayoutExportControl(), 'top-left');
map.addControl(new LayoutExportControl(), 'top-right');    // default
map.addControl(new LayoutExportControl(), 'bottom-left');
map.addControl(new LayoutExportControl(), 'bottom-right');
```

### Layout Editor Features

Once the layout editor is open:

- **Paper size** can be changed from the toolbar dropdown (A4, A3, Letter, Legal)
- **Orientation** can be toggled between landscape and portrait
- **DPI** can be set to 96, 150, 200, or 300 for export resolution
- **Add Text** creates a rich text element. Double-click to edit. A formatting toolbar appears at the bottom of the screen during editing.
- **Add Image** opens a file picker to insert an image onto the layout
- **Map frames** can be double-clicked to enter pan/zoom mode. Click outside or press Escape to exit.
- **Lock/unlock** elements by clicking the lock icon that appears on hover
- **Delete** text and image elements by selecting them and clicking Delete in the toolbar, or pressing the Delete/Backspace key
- **Export** using the PNG, PDF, or SVG buttons in the toolbar, or use the Print button for the browser print dialog
- **Escape** closes the layout editor (or exits map pan/zoom mode first if active)

---

## Troubleshooting

### The layout editor does not open

Make sure you have imported the plugin CSS:

```js
import '@isaacenage/maplibre-gl-layout-export/style.css';
```

Without the CSS, the overlay renders but may not be visible or properly styled.

### Peer dependency warnings during install

Install all required peer dependencies listed in the [Installation](#installation) section. Every Tiptap extension listed is required for the rich text editor to function.

### Map canvas is blank in exports

The plugin creates an offscreen MapLibre map with `preserveDrawingBuffer: true` for capture. If your map style uses tiles from a server that requires authentication or has CORS restrictions, the export may produce a blank map. Ensure your tile server allows cross-origin requests.

### TypeScript errors

The plugin ships its own type declarations. If you encounter type conflicts, ensure your `tsconfig.json` has `"skipLibCheck": true` or that your versions of `@types/react` match the plugin's expected range (React 18+).

### Build size concerns

The plugin bundles `html2canvas` and `jspdf` as direct dependencies for PNG/PDF export. These add approximately 200KB to your bundle (before compression). React and all Tiptap packages are externalized and not bundled.

---

## License

MIT
