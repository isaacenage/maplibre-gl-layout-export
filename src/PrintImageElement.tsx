import React, { useCallback } from 'react';
import { IconLock, IconUnlock } from './icons';
import type { PrintImageElementData, Rect } from './printLayout.types';
import { usePrintDrag } from './usePrintDrag';
import { usePrintResize } from './usePrintResize';

interface PrintImageElementProps {
  element: PrintImageElementData;
  isSelected: boolean;
  scale: number;
  paperWidth: number;
  paperHeight: number;
  onSelect: (id: string) => void;
  onUpdate: (element: PrintImageElementData) => void;
  onToggleLock: (id: string) => void;
}

const PrintImageElement: React.FC<PrintImageElementProps> = ({
  element,
  isSelected,
  scale,
  paperWidth,
  paperHeight,
  onSelect,
  onUpdate,
  onToggleLock,
}) => {
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

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!element.locked) onSelect(element.id);
    },
    [element.id, element.locked, onSelect]
  );

  const handleLockClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleLock(element.id);
    },
    [element.id, onToggleLock]
  );

  const { rect } = element;

  const classNames = [
    'mgl-le-element',
    'mgl-le-image-element',
    isSelected ? 'mgl-le-selected' : '',
    element.locked ? 'mgl-le-locked' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classNames}
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        cursor: element.locked ? 'default' : undefined,
        pointerEvents: element.locked ? 'none' : undefined,
      }}
      onClick={handleClick}
      onPointerDown={element.locked ? undefined : onDragPointerDown}
    >
      <img
        src={element.src}
        alt=""
        draggable={false}
        style={{
          width: '100%',
          height: '100%',
          objectFit: element.objectFit,
          pointerEvents: 'none',
          display: 'block',
        }}
      />

      {isSelected && !element.locked &&
        handles.map((h) => (
          <div
            key={h}
            className={`mgl-le-resize-handle mgl-le-resize-${h}`}
            onPointerDown={(e) => onHandlePointerDown(h, e)}
          />
        ))}

      <button
        className="mgl-le-lock-btn"
        style={element.locked ? { pointerEvents: 'auto' } : undefined}
        onClick={handleLockClick}
        title={element.locked ? 'Unlock element' : 'Lock element'}
      >
        {element.locked ? <IconLock size={14} /> : <IconUnlock size={14} />}
      </button>
    </div>
  );
};

export default PrintImageElement;
