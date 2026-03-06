import type { Map as MapLibreMap, IControl } from 'maplibre-gl';
import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import PrintLayoutView from './PrintLayoutView';

export type { PaperSize, Orientation, PrintElement, PrintLayoutState } from './printLayout.types';

export interface LayoutExportControlOptions {
  /** Position of the control button on the map. Default: 'top-right' */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * MapLibre GL JS control that adds a print/export layout button to the map.
 *
 * @example
 * ```ts
 * import { LayoutExportControl } from '@isaacenage/maplibre-gl-layout-export';
 * import '@isaacenage/maplibre-gl-layout-export/style.css';
 *
 * map.addControl(new LayoutExportControl());
 * ```
 */
export class LayoutExportControl implements IControl {
  private _map: MapLibreMap | null = null;
  private _container: HTMLDivElement | null = null;
  private _overlayContainer: HTMLDivElement | null = null;
  private _root: Root | null = null;
  private _isVisible = false;

  onAdd(map: MapLibreMap): HTMLElement {
    this._map = map;

    this._container = document.createElement('div');
    this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';

    const button = document.createElement('button');
    button.className = 'mgl-le-trigger-btn';
    button.type = 'button';
    button.title = 'Print / Export Layout';
    button.setAttribute('aria-label', 'Print / Export Layout');
    button.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`;
    button.addEventListener('click', () => this._toggle());

    this._container.appendChild(button);

    // Create overlay container for React
    this._overlayContainer = document.createElement('div');
    this._overlayContainer.id = 'mgl-le-overlay-root';
    document.body.appendChild(this._overlayContainer);
    this._root = createRoot(this._overlayContainer);
    this._render();

    return this._container;
  }

  onRemove(): void {
    this._isVisible = false;
    if (this._root) {
      this._root.unmount();
      this._root = null;
    }
    if (this._overlayContainer) {
      this._overlayContainer.remove();
      this._overlayContainer = null;
    }
    if (this._container) {
      this._container.remove();
      this._container = null;
    }
    this._map = null;
  }

  /** Programmatically open the layout view. */
  open(): void {
    this._isVisible = true;
    this._render();
  }

  /** Programmatically close the layout view. */
  close(): void {
    this._isVisible = false;
    this._render();
  }

  private _toggle(): void {
    this._isVisible = !this._isVisible;
    this._render();
  }

  private _render(): void {
    if (!this._root) return;
    this._root.render(
      createElement(PrintLayoutView, {
        map: this._map,
        isVisible: this._isVisible,
        onClose: () => this.close(),
      })
    );
  }
}

// Also export the React component for advanced usage
export { default as PrintLayoutView } from './PrintLayoutView';
