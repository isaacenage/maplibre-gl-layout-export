import React, { useRef, useMemo, useCallback, useEffect, useState } from 'react';
import type { PrintLayoutState, PrintElement, PrintTextElementData, PrintMapElementData, PrintImageElementData } from './printLayout.types';
import { getPaperDimensions } from './printLayout.types';
import PrintTextElement from './PrintTextElement';
import PrintMapFrame from './PrintMapFrame';
import PrintImageElement from './PrintImageElement';
import type { Map as MapLibreMap } from 'maplibre-gl';
import type { Editor } from '@tiptap/react';

interface PrintPaperProps {
  state: PrintLayoutState;
  sourceMap: MapLibreMap | null;
  isExporting?: boolean;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (element: PrintElement) => void;
  onFocusMapFrame: (id: string, focused: boolean) => void;
  onToggleLock: (id: string) => void;
  onEditorReady?: (editor: Editor | null) => void;
  paperRef: React.Ref<HTMLDivElement>;
}

const PrintPaper: React.FC<PrintPaperProps> = ({
  state,
  sourceMap,
  isExporting = false,
  onSelectElement,
  onUpdateElement,
  onFocusMapFrame,
  onToggleLock,
  onEditorReady,
  paperRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const dims = useMemo(
    () => getPaperDimensions(state.paperSize, state.orientation),
    [state.paperSize, state.orientation]
  );

  useEffect(() => {
    const updateScale = () => {
      const container = containerRef.current;
      if (!container) return;
      const { clientWidth, clientHeight } = container;
      const padding = 48;
      const availW = clientWidth - padding * 2;
      const availH = clientHeight - padding * 2;
      const s = Math.min(availW / dims.widthPx, availH / dims.heightPx, 1);
      setScale(s);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [dims]);

  const handleBackdropClick = useCallback(() => {
    const focusedMap = state.elements.find((e) => e.type === 'map' && e.focused);
    if (focusedMap) {
      onFocusMapFrame(focusedMap.id, false);
    } else {
      onSelectElement(null);
    }
  }, [state.elements, onFocusMapFrame, onSelectElement]);

  return (
    <div ref={containerRef} className="mgl-le-paper-area">
      <div
        ref={paperRef}
        className="mgl-le-paper"
        style={{
          width: dims.widthPx,
          height: dims.heightPx,
          transform: `scale(${scale})`,
        }}
      >
        <div className="mgl-le-paper-backdrop" onClick={handleBackdropClick} />

        {state.elements.map((el) => {
          if (el.type === 'text') {
            return (
              <PrintTextElement
                key={el.id}
                element={el as PrintTextElementData}
                isSelected={state.selectedElementId === el.id}
                scale={scale}
                paperWidth={dims.widthPx}
                paperHeight={dims.heightPx}
                onSelect={onSelectElement}
                onUpdate={(updated) => onUpdateElement(updated)}
                onToggleLock={onToggleLock}
                onEditorReady={state.selectedElementId === el.id ? onEditorReady : undefined}
              />
            );
          }
          if (el.type === 'map') {
            return (
              <PrintMapFrame
                key={el.id}
                element={el as PrintMapElementData}
                isSelected={state.selectedElementId === el.id}
                isExporting={isExporting}
                scale={scale}
                paperWidth={dims.widthPx}
                paperHeight={dims.heightPx}
                sourceMap={sourceMap}
                onSelect={onSelectElement}
                onUpdate={(updated) => onUpdateElement(updated)}
                onFocusChange={onFocusMapFrame}
                onToggleLock={onToggleLock}
              />
            );
          }
          if (el.type === 'image') {
            return (
              <PrintImageElement
                key={el.id}
                element={el as PrintImageElementData}
                isSelected={state.selectedElementId === el.id}
                scale={scale}
                paperWidth={dims.widthPx}
                paperHeight={dims.heightPx}
                onSelect={onSelectElement}
                onUpdate={(updated) => onUpdateElement(updated)}
                onToggleLock={onToggleLock}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default PrintPaper;
