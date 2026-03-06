import { useCallback, useRef } from 'react';
import type { Rect } from './printLayout.types';

interface UsePrintDragOptions {
  rect: Rect;
  scale: number;
  paperWidth: number;
  paperHeight: number;
  onUpdate: (rect: Rect) => void;
}

export function usePrintDrag({ rect, scale, paperWidth, paperHeight, onUpdate }: UsePrintDragOptions) {
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: rect.x,
        origY: rect.y,
      };

      const onMove = (ev: PointerEvent) => {
        if (!dragRef.current) return;
        const dx = (ev.clientX - dragRef.current.startX) / scale;
        const dy = (ev.clientY - dragRef.current.startY) / scale;
        const newX = Math.max(0, Math.min(paperWidth - rect.width, dragRef.current.origX + dx));
        const newY = Math.max(0, Math.min(paperHeight - rect.height, dragRef.current.origY + dy));
        onUpdate({ ...rect, x: Math.round(newX), y: Math.round(newY) });
      };

      const onUp = () => {
        dragRef.current = null;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [rect, scale, paperWidth, paperHeight, onUpdate]
  );

  return { onPointerDown };
}
