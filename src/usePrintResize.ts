import { useCallback, useRef } from 'react';
import type { Rect } from './printLayout.types';

type Handle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

const MIN_WIDTH = 80;
const MIN_HEIGHT = 60;

interface UsePrintResizeOptions {
  rect: Rect;
  scale: number;
  paperWidth: number;
  paperHeight: number;
  onUpdate: (rect: Rect) => void;
}

export function usePrintResize({ rect, scale, paperWidth, paperHeight, onUpdate }: UsePrintResizeOptions) {
  const resizeRef = useRef<{ handle: Handle; startX: number; startY: number; origRect: Rect } | null>(null);

  const onHandlePointerDown = useCallback(
    (handle: Handle, e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      resizeRef.current = {
        handle,
        startX: e.clientX,
        startY: e.clientY,
        origRect: { ...rect },
      };

      const onMove = (ev: PointerEvent) => {
        if (!resizeRef.current) return;
        const { handle: h, startX, startY, origRect: o } = resizeRef.current;
        const dx = (ev.clientX - startX) / scale;
        const dy = (ev.clientY - startY) / scale;

        let { x, y, width, height } = o;

        if (h.includes('w')) {
          const maxDx = width - MIN_WIDTH;
          const clampedDx = Math.max(-x, Math.min(maxDx, dx));
          x = o.x + clampedDx;
          width = o.width - clampedDx;
        }
        if (h.includes('e') || h === 'e') {
          width = Math.max(MIN_WIDTH, Math.min(paperWidth - o.x, o.width + dx));
        }

        if (h.includes('n') && h !== 'ne' && h !== 'nw' ? h === 'n' : h.startsWith('n')) {
          const maxDy = height - MIN_HEIGHT;
          const clampedDy = Math.max(-y, Math.min(maxDy, dy));
          y = o.y + clampedDy;
          height = o.height - clampedDy;
        }
        if (h.includes('s')) {
          height = Math.max(MIN_HEIGHT, Math.min(paperHeight - o.y, o.height + dy));
        }

        if (h === 'n' || h === 'nw' || h === 'ne') {
          const maxDy = o.height - MIN_HEIGHT;
          const clampedDy = Math.max(-o.y, Math.min(maxDy, dy));
          y = o.y + clampedDy;
          height = o.height - clampedDy;
        }

        onUpdate({
          x: Math.round(x),
          y: Math.round(y),
          width: Math.round(width),
          height: Math.round(height),
        });
      };

      const onUp = () => {
        resizeRef.current = null;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [rect, scale, paperWidth, paperHeight, onUpdate]
  );

  const handles: Handle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

  return { handles, onHandlePointerDown };
}
