import React, { useRef, useCallback } from 'react';
import { IconLock, IconUnlock } from './icons';
import type { PrintMapElementData, Rect } from './printLayout.types';
import { usePrintDrag } from './usePrintDrag';
import { usePrintResize } from './usePrintResize';
import { useDuplicateMap } from './useDuplicateMap';
import type { Map as MapLibreMap } from 'maplibre-gl';

interface PrintMapFrameProps {
  element: PrintMapElementData;
  isSelected: boolean;
  isExporting?: boolean;
  scale: number;
  paperWidth: number;
  paperHeight: number;
  sourceMap: MapLibreMap | null;
  onSelect: (id: string) => void;
  onUpdate: (element: PrintMapElementData) => void;
  onFocusChange: (id: string, focused: boolean) => void;
  onToggleLock: (id: string) => void;
}

const PrintMapFrame: React.FC<PrintMapFrameProps> = ({
  element,
  isSelected,
  isExporting = false,
  scale,
  paperWidth,
  paperHeight,
  sourceMap,
  onSelect,
  onUpdate,
  onFocusChange,
  onToggleLock,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const handleRectUpdate = useCallback(
    (rect: Rect) => onUpdate({ ...element, rect }),
    [element, onUpdate]
  );

  const { onPointerDown: onDragPointerDown } = usePrintDrag({
    rect: element.rect,
    scale,
    paperWidth,
    paperHeight,
    onUpdate: handleRectUpdate,
  });

  const { handles, onHandlePointerDown } = usePrintResize({
    rect: element.rect,
    scale,
    paperWidth,
    paperHeight,
    onUpdate: handleRectUpdate,
  });

  useDuplicateMap({
    sourceMap,
    containerRef: mapContainerRef,
    focused: element.focused,
    width: element.rect.width,
    height: element.rect.height,
  });

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(element.id);
    },
    [element.id, onSelect]
  );

  const handleOverlayDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!element.locked) onFocusChange(element.id, true);
    },
    [element.id, element.locked, onFocusChange]
  );

  const handleLockClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleLock(element.id);
    },
    [element.id, onToggleLock]
  );

  const { rect } = element;
  const disableInteraction = isExporting;
  const isLocked = !!element.locked;

  const classNames = [
    'mgl-le-element',
    'mgl-le-map-frame',
    isSelected ? 'mgl-le-selected' : '',
    element.focused ? 'mgl-le-focused' : '',
    isLocked ? 'mgl-le-locked' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classNames}
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        pointerEvents: disableInteraction || isLocked ? 'none' : undefined,
        cursor: isLocked ? 'default' : undefined,
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!disableInteraction && !isLocked) onSelect(element.id);
      }}
    >
      <div
        ref={mapContainerRef}
        className="mgl-le-map-container"
        style={{ position: 'absolute', inset: 0, pointerEvents: isLocked ? 'none' : undefined }}
      />

      {!element.focused && !disableInteraction && !isLocked && (
        <div
          className="mgl-le-map-overlay"
          onPointerDown={onDragPointerDown}
          onClick={handleOverlayClick}
          onDoubleClick={handleOverlayDoubleClick}
        />
      )}

      {isLocked && !disableInteraction && (
        <div
          className="mgl-le-map-overlay"
          style={{ cursor: 'default', pointerEvents: 'none' }}
        />
      )}

      {isSelected && !element.focused && !disableInteraction && !isLocked &&
        handles.map((h) => (
          <div
            key={h}
            className={`mgl-le-resize-handle mgl-le-resize-${h}`}
            onPointerDown={(e) => onHandlePointerDown(h, e)}
          />
        ))}

      {element.focused && !disableInteraction && (
        <div className="mgl-le-focus-indicator">
          Pan/Zoom mode — click outside to exit
        </div>
      )}

      <button
        className="mgl-le-lock-btn"
        style={isLocked ? { pointerEvents: 'auto' } : undefined}
        onClick={handleLockClick}
        title={isLocked ? 'Unlock element' : 'Lock element'}
      >
        {isLocked ? <IconLock size={14} /> : <IconUnlock size={14} />}
      </button>
    </div>
  );
};

export default PrintMapFrame;
