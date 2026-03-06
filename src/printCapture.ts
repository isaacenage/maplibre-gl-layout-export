import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import maplibregl from 'maplibre-gl';
import type { Map as MapLibreMap } from 'maplibre-gl';
import type { PaperDimensions } from './printLayout.types';

interface CaptureOptions {
  paperElement: HTMLElement;
  dpi: number;
  dims: PaperDimensions;
}

async function captureMapToImage(
  liveMap: MapLibreMap,
  width: number,
  height: number,
  pixelRatio = 1
): Promise<string> {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-99999px';
  container.style.top = '-99999px';
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;
  container.style.visibility = 'hidden';
  document.body.appendChild(container);

  try {
    const offscreen = new (maplibregl as any).Map({
      container,
      style: liveMap.getStyle(),
      center: liveMap.getCenter(),
      zoom: liveMap.getZoom(),
      pitch: liveMap.getPitch(),
      bearing: liveMap.getBearing(),
      preserveDrawingBuffer: true,
      attributionControl: false,
      interactive: false,
      fadeDuration: 0,
      pixelRatio,
    }) as MapLibreMap;

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Offscreen map idle timeout'));
      }, 15000);

      const onIdle = () => {
        clearTimeout(timeout);
        offscreen.off('idle', onIdle);
        resolve();
      };
      offscreen.on('idle', onIdle);
    });

    await new Promise((r) => requestAnimationFrame(r));

    const canvas = offscreen.getCanvas();
    const dataUrl = canvas.toDataURL('image/png');

    offscreen.remove();
    return dataUrl;
  } finally {
    document.body.removeChild(container);
  }
}

async function captureToCanvas({ paperElement, dpi }: CaptureOptions): Promise<HTMLCanvasElement> {
  const scale = dpi / 96;

  const mapContainers = paperElement.querySelectorAll('.mgl-le-map-container');
  const injected: { container: Element; img: HTMLImageElement; hiddenEls: HTMLElement[] }[] = [];

  for (const container of Array.from(mapContainers)) {
    const canvas = container.querySelector('canvas.maplibregl-canvas') as HTMLCanvasElement | null;
    if (!canvas) continue;

    const mapContainer = container as HTMLElement;
    const mapInstance = (mapContainer as any)._maplibre_map as MapLibreMap | undefined;

    let dataUrl: string | null = null;

    if (mapInstance) {
      try {
        dataUrl = await captureMapToImage(
          mapInstance,
          mapContainer.clientWidth,
          mapContainer.clientHeight,
          scale
        );
      } catch {
        // Fall back to direct canvas capture
      }
    }

    if (!dataUrl) {
      try {
        dataUrl = canvas.toDataURL('image/png');
      } catch {
        continue;
      }
    }

    const img = document.createElement('img');
    img.src = dataUrl;
    img.style.position = 'absolute';
    img.style.inset = '0';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'fill';
    img.style.imageRendering = 'crisp-edges';
    img.style.zIndex = '9999';

    const hiddenEls: HTMLElement[] = [];
    for (const child of Array.from(container.children) as HTMLElement[]) {
      if (child.style.display !== 'none') {
        hiddenEls.push(child);
        child.style.display = 'none';
      }
    }

    container.appendChild(img);
    injected.push({ container, img, hiddenEls });
  }

  const paper = paperElement;
  const originalTransform = paper.style.transform;
  paper.style.transform = 'none';

  try {
    const result = await html2canvas(paperElement, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        clonedDoc.querySelectorAll('.mgl-le-resize-handle, .mgl-le-map-overlay, .mgl-le-lock-btn').forEach((el) => {
          (el as HTMLElement).style.display = 'none';
        });
        clonedDoc.querySelectorAll('.mgl-le-selected').forEach((el) => {
          (el as HTMLElement).style.outline = 'none';
        });
        clonedDoc.querySelectorAll('.mgl-le-focused').forEach((el) => {
          (el as HTMLElement).style.outline = 'none';
        });
      },
    });

    return result;
  } finally {
    paper.style.transform = originalTransform;
    for (const { container, img, hiddenEls } of injected) {
      container.removeChild(img);
      for (const el of hiddenEls) {
        el.style.display = '';
      }
    }
  }
}

export async function downloadPng(options: CaptureOptions, filename = 'layout.png'): Promise<void> {
  const canvas = await captureToCanvas(options);
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export async function downloadPdf(options: CaptureOptions, filename = 'layout.pdf'): Promise<void> {
  const canvas = await captureToCanvas(options);
  const { dims } = options;

  const orientation = dims.widthMm > dims.heightMm ? 'landscape' : 'portrait';
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: [dims.widthMm, dims.heightMm],
  });

  const imgData = canvas.toDataURL('image/jpeg', 1.0);
  pdf.addImage(imgData, 'JPEG', 0, 0, dims.widthMm, dims.heightMm, undefined, 'NONE');
  pdf.save(filename);
}

export function printLayout(): void {
  window.print();
}

// ---------------------------------------------------------------------------
// SVG Export
// ---------------------------------------------------------------------------

interface SvgExportOptions extends CaptureOptions {
  elements: import('./printLayout.types').PrintElement[];
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function geometryToSvgPath(coords: number[][]): string {
  return coords
    .map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt[0].toFixed(2)},${pt[1].toFixed(2)}`)
    .join(' ');
}

function projectCoords(
  map: MapLibreMap,
  coords: number[],
  offsetX: number,
  offsetY: number
): [number, number] {
  const pt = map.project([coords[0], coords[1]] as [number, number]);
  return [pt.x + offsetX, pt.y + offsetY];
}

function featureToSvgElement(
  feature: maplibregl.MapGeoJSONFeature,
  map: MapLibreMap,
  offsetX: number,
  offsetY: number
): string {
  const geom = feature.geometry;
  const layer = feature.layer;
  const paint = (layer as Record<string, unknown>).paint as Record<string, unknown> | undefined;

  if (geom.type === 'Point') {
    const [cx, cy] = projectCoords(map, (geom as GeoJSON.Point).coordinates, offsetX, offsetY);
    const r = (paint?.['circle-radius'] as number) ?? 5;
    const fill = (paint?.['circle-color'] as string) ?? '#3388ff';
    const stroke = (paint?.['circle-stroke-color'] as string) ?? 'none';
    const strokeWidth = (paint?.['circle-stroke-width'] as number) ?? 0;
    return `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;
  }

  if (geom.type === 'LineString' || geom.type === 'MultiLineString') {
    const color = (paint?.['line-color'] as string) ?? '#3388ff';
    const width = (paint?.['line-width'] as number) ?? 2;
    const lines =
      geom.type === 'LineString'
        ? [(geom as GeoJSON.LineString).coordinates]
        : (geom as GeoJSON.MultiLineString).coordinates;
    const paths = lines.map((ring) => {
      const projected = ring.map((c) => projectCoords(map, c, offsetX, offsetY));
      return `<path d="${geometryToSvgPath(projected)}" fill="none" stroke="${color}" stroke-width="${width}" />`;
    });
    return paths.join('\n');
  }

  if (geom.type === 'Polygon' || geom.type === 'MultiPolygon') {
    const fill = (paint?.['fill-color'] as string) ?? '#3388ff';
    const opacity = (paint?.['fill-opacity'] as number) ?? 0.6;
    const stroke = (paint?.['line-color'] as string) ?? 'none';
    const strokeWidth = (paint?.['line-width'] as number) ?? 1;
    const polygons =
      geom.type === 'Polygon'
        ? [(geom as GeoJSON.Polygon).coordinates]
        : (geom as GeoJSON.MultiPolygon).coordinates;
    const paths = polygons.map((rings) => {
      const d = rings
        .map((ring) => {
          const projected = ring.map((c) => projectCoords(map, c, offsetX, offsetY));
          return geometryToSvgPath(projected) + ' Z';
        })
        .join(' ');
      return `<path d="${d}" fill="${fill}" fill-opacity="${opacity}" stroke="${stroke}" stroke-width="${strokeWidth}" />`;
    });
    return paths.join('\n');
  }

  return '';
}

function extractVectorLayers(
  map: MapLibreMap,
  offsetX: number,
  offsetY: number
): string {
  const features = map.queryRenderedFeatures();
  if (!features.length) return '';

  const seen = new Set<string>();
  const unique: maplibregl.MapGeoJSONFeature[] = [];
  for (const f of features) {
    const key = `${f.layer.id}:${f.id ?? ''}:${f.geometry.type}:${JSON.stringify(f.geometry).slice(0, 80)}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(f);
    }
  }

  const groups = new Map<string, maplibregl.MapGeoJSONFeature[]>();
  for (const f of unique) {
    const layerId = f.layer.id;
    const list = groups.get(layerId) ?? [];
    list.push(f);
    groups.set(layerId, list);
  }

  const svgGroups: string[] = [];
  for (const [layerId, layerFeatures] of groups) {
    const layerType = layerFeatures[0]?.layer.type;
    if (layerType === 'raster' || layerType === 'background') continue;

    const elements = layerFeatures
      .map((f) => featureToSvgElement(f, map, offsetX, offsetY))
      .filter(Boolean);
    if (elements.length) {
      svgGroups.push(`<g id="${escapeXml(layerId)}">\n${elements.join('\n')}\n</g>`);
    }
  }

  return svgGroups.join('\n');
}

function textElementToSvg(el: import('./printLayout.types').PrintTextElementData): string {
  const { rect, text, style } = el;
  return `<foreignObject x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}">
  <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: ${escapeXml(style.fontFamily)}; font-size: ${style.fontSize}px; font-weight: ${style.fontWeight}; font-style: ${style.fontStyle}; color: ${style.color}; text-align: ${style.textAlign}; width: 100%; height: 100%; overflow: hidden; padding: 4px; box-sizing: border-box;">
    ${text}
  </div>
</foreignObject>`;
}

async function buildSvgDocument(options: SvgExportOptions): Promise<string> {
  const { paperElement, dpi, dims, elements } = options;
  const { widthPx, heightPx } = dims;

  const mapContainers = paperElement.querySelectorAll('.mgl-le-map-container');
  const mapFrames: { map: MapLibreMap; offsetX: number; offsetY: number }[] = [];

  for (const container of Array.from(mapContainers)) {
    const mapContainer = container as HTMLElement;
    const mapInstance = (mapContainer as any)._maplibre_map as MapLibreMap | undefined;
    if (!mapInstance) continue;

    const paperRect = paperElement.getBoundingClientRect();
    const containerRect = mapContainer.getBoundingClientRect();
    const scale = widthPx / paperRect.width;
    const offsetX = (containerRect.left - paperRect.left) * scale;
    const offsetY = (containerRect.top - paperRect.top) * scale;

    mapFrames.push({ map: mapInstance, offsetX, offsetY });
  }

  let basemapImage = '';
  if (mapFrames.length > 0) {
    const frame = mapFrames[0];
    const mapEl = frame.map.getContainer();
    const rasterW = Math.round(mapEl.clientWidth * (dpi / 96));
    const rasterH = Math.round(mapEl.clientHeight * (dpi / 96));
    try {
      const dataUrl = await captureMapToImage(frame.map, rasterW, rasterH);
      const mapElement = elements.find((e) => e.type === 'map');
      if (mapElement) {
        basemapImage = `<image href="${dataUrl}" x="${mapElement.rect.x}" y="${mapElement.rect.y}" width="${mapElement.rect.width}" height="${mapElement.rect.height}" preserveAspectRatio="none" />`;
      }
    } catch {
      // Basemap capture failed, continue without it
    }
  }

  const vectorSvg = mapFrames
    .map((f) => extractVectorLayers(f.map, f.offsetX, f.offsetY))
    .filter(Boolean)
    .join('\n');

  const textSvg = elements
    .filter((e): e is import('./printLayout.types').PrintTextElementData => e.type === 'text')
    .map(textElementToSvg)
    .join('\n');

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${widthPx} ${heightPx}" width="${widthPx}" height="${heightPx}">`,
    `<rect width="100%" height="100%" fill="white" />`,
    basemapImage,
    vectorSvg,
    textSvg,
    `</svg>`,
  ].join('\n');
}

export async function downloadSvg(options: SvgExportOptions, filename = 'layout.svg'): Promise<void> {
  const svgString = await buildSvgDocument(options);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}
