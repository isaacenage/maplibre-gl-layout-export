import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import type { Map as MapLibreMap } from 'maplibre-gl';

interface UseDuplicateMapOptions {
  sourceMap: MapLibreMap | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
  focused: boolean;
  width: number;
  height: number;
  onMapReady?: (map: MapLibreMap) => void;
}

export function useDuplicateMap({ sourceMap, containerRef, focused, width, height, onMapReady }: UseDuplicateMapOptions) {
  const mapRef = useRef<MapLibreMap | null>(null);
  const initRef = useRef(false);

  const onMapReadyRef = useRef(onMapReady);
  onMapReadyRef.current = onMapReady;

  useEffect(() => {
    if (!sourceMap || !containerRef.current || initRef.current) return;
    initRef.current = true;

    const style = sourceMap.getStyle();
    const center = sourceMap.getCenter();
    const zoom = sourceMap.getZoom();
    const pitch = sourceMap.getPitch();
    const bearing = sourceMap.getBearing();

    const dupMap = new maplibregl.Map({
      container: containerRef.current,
      style,
      center,
      zoom,
      pitch,
      bearing,
      preserveDrawingBuffer: true,
      attributionControl: false,
      interactive: false,
      fadeDuration: 0,
    });

    mapRef.current = dupMap;

    // Store map instance on DOM element for printCapture to access
    (containerRef.current as any)._maplibre_map = dupMap;

    dupMap.once('load', () => {
      onMapReadyRef.current?.(dupMap);
    });

    return () => {
      if (mapRef.current) {
        if (containerRef.current) {
          delete (containerRef.current as any)._maplibre_map;
        }
        mapRef.current.remove();
        mapRef.current = null;
        initRef.current = false;
      }
    };
  }, [sourceMap, containerRef]);

  useEffect(() => {
    const m = mapRef.current;
    if (!m) return;

    if (focused) {
      m.dragPan.enable();
      m.scrollZoom.enable();
      m.doubleClickZoom.enable();
      m.touchZoomRotate.enable();
    } else {
      m.dragPan.disable();
      m.scrollZoom.disable();
      m.doubleClickZoom.disable();
      m.touchZoomRotate.disable();
    }
  }, [focused]);

  useEffect(() => {
    const m = mapRef.current;
    if (!m) return;
    const timer = setTimeout(() => m.resize(), 50);
    return () => clearTimeout(timer);
  }, [width, height]);

  return { mapRef };
}
