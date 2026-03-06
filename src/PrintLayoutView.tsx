import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import type { Map as MapLibreMap } from 'maplibre-gl';
import type { Editor } from '@tiptap/react';
import type {
  PrintLayoutState,
  PrintElement,
  PrintTextElementData,
  PrintImageElementData,
  PaperSize,
  Orientation,
} from './printLayout.types';
import {
  createInitialState,
  DEFAULT_TEXT_STYLE,
  getPaperDimensions,
} from './printLayout.types';
import PrintToolbar from './PrintToolbar';
import PrintPaper from './PrintPaper';
import PrintTextStylePanel from './PrintTextStylePanel';
import { downloadPng, downloadPdf, downloadSvg, printLayout } from './printCapture';

interface PrintLayoutViewProps {
  map: MapLibreMap | null;
  isVisible: boolean;
  onClose: () => void;
}

let textIdCounter = 0;
let imageIdCounter = 0;

const PrintLayoutView: React.FC<PrintLayoutViewProps> = ({ map, isVisible, onClose }) => {
  const paperRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);

  const [state, setState] = useState<PrintLayoutState>(() =>
    createInitialState('A4', 'landscape')
  );

  useEffect(() => {
    if (isVisible) {
      setState(createInitialState('A4', 'landscape'));
      textIdCounter = 0;
      imageIdCounter = 0;
    }
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const focused = state.elements.find((el) => el.type === 'map' && el.focused);
        if (focused) {
          handleFocusMapFrame(focused.id, false);
        } else {
          onClose();
        }
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && !activeEditor) {
        if (state.selectedElementId) {
          const el = state.elements.find((e) => e.id === state.selectedElementId);
          if ((el?.type === 'text' || el?.type === 'image') && !el?.locked) {
            handleDeleteSelected();
          }
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isVisible, state.elements, state.selectedElementId, activeEditor]);

  const handlePaperSizeChange = useCallback((size: PaperSize) => {
    setState((prev) => {
      const newDims = getPaperDimensions(size, prev.orientation);
      const oldDims = getPaperDimensions(prev.paperSize, prev.orientation);
      const scaleX = newDims.widthPx / oldDims.widthPx;
      const scaleY = newDims.heightPx / oldDims.heightPx;
      return {
        ...prev,
        paperSize: size,
        elements: prev.elements.map((el) => ({
          ...el,
          rect: {
            x: Math.round(el.rect.x * scaleX),
            y: Math.round(el.rect.y * scaleY),
            width: Math.round(el.rect.width * scaleX),
            height: Math.round(el.rect.height * scaleY),
          },
        })),
      };
    });
  }, []);

  const handleOrientationChange = useCallback((orientation: Orientation) => {
    setState((prev) => {
      const newDims = getPaperDimensions(prev.paperSize, orientation);
      const oldDims = getPaperDimensions(prev.paperSize, prev.orientation);
      const scaleX = newDims.widthPx / oldDims.widthPx;
      const scaleY = newDims.heightPx / oldDims.heightPx;
      return {
        ...prev,
        orientation,
        elements: prev.elements.map((el) => ({
          ...el,
          rect: {
            x: Math.round(el.rect.x * scaleX),
            y: Math.round(el.rect.y * scaleY),
            width: Math.round(el.rect.width * scaleX),
            height: Math.round(el.rect.height * scaleY),
          },
        })),
      };
    });
  }, []);

  const handleDpiChange = useCallback((dpi: number) => {
    setState((prev) => ({ ...prev, dpi }));
  }, []);

  const handleAddText = useCallback(() => {
    textIdCounter += 1;
    const newText: PrintTextElementData = {
      id: `text-${textIdCounter}`,
      type: 'text',
      rect: { x: 100, y: 100, width: 200, height: 40 },
      text: '<p>Double-click to edit</p>',
      style: { ...DEFAULT_TEXT_STYLE },
    };
    setState((prev) => ({
      ...prev,
      elements: [...prev.elements, newText],
      selectedElementId: newText.id,
    }));
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImageFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      imageIdCounter += 1;
      const newImage: PrintImageElementData = {
        id: `image-${imageIdCounter}`,
        type: 'image',
        rect: { x: 100, y: 100, width: 200, height: 200 },
        src,
        objectFit: 'contain',
      };
      setState((prev) => ({
        ...prev,
        elements: [...prev.elements, newImage],
        selectedElementId: newImage.id,
      }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDeleteSelected = useCallback(() => {
    setState((prev) => {
      const el = prev.elements.find((e) => e.id === prev.selectedElementId);
      if (!el || (el.type !== 'text' && el.type !== 'image')) return prev;
      return {
        ...prev,
        elements: prev.elements.filter((e) => e.id !== prev.selectedElementId),
        selectedElementId: null,
      };
    });
  }, []);

  const handleSelectElement = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, selectedElementId: id }));
  }, []);

  const handleUpdateElement = useCallback((updated: PrintElement) => {
    setState((prev) => ({
      ...prev,
      elements: prev.elements.map((el) => (el.id === updated.id ? updated : el)),
    }));
  }, []);

  const handleFocusMapFrame = useCallback((id: string, focused: boolean) => {
    setState((prev) => ({
      ...prev,
      selectedElementId: focused ? id : prev.selectedElementId,
      elements: prev.elements.map((el) =>
        el.id === id && el.type === 'map' ? { ...el, focused } : el
      ),
    }));
  }, []);

  const handleToggleLock = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      elements: prev.elements.map((el) =>
        el.id === id ? { ...el, locked: !el.locked } : el
      ),
    }));
  }, []);

  const handleEditorReady = useCallback((editor: Editor | null) => {
    setActiveEditor(editor);
  }, []);

  const dims = useMemo(
    () => getPaperDimensions(state.paperSize, state.orientation),
    [state.paperSize, state.orientation]
  );

  const handlePrint = useCallback(() => printLayout(), []);

  const handleDownloadPng = useCallback(async () => {
    if (!paperRef.current || isExporting) return;
    setIsExporting(true);
    try {
      await downloadPng({ paperElement: paperRef.current, dpi: state.dpi, dims });
    } finally {
      setIsExporting(false);
    }
  }, [state.dpi, dims, isExporting]);

  const handleDownloadPdf = useCallback(async () => {
    if (!paperRef.current || isExporting) return;
    setIsExporting(true);
    try {
      await downloadPdf({ paperElement: paperRef.current, dpi: state.dpi, dims });
    } finally {
      setIsExporting(false);
    }
  }, [state.dpi, dims, isExporting]);

  const handleDownloadSvg = useCallback(async () => {
    if (!paperRef.current || isExporting) return;
    setIsExporting(true);
    try {
      await downloadSvg({
        paperElement: paperRef.current,
        dpi: state.dpi,
        dims,
        elements: state.elements,
      });
    } finally {
      setIsExporting(false);
    }
  }, [state.dpi, state.elements, dims, isExporting]);

  if (!isVisible) return null;

  return (
    <div className="mgl-le-overlay">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageFileChange}
      />
      <PrintToolbar
        state={state}
        isExporting={isExporting}
        onPaperSizeChange={handlePaperSizeChange}
        onOrientationChange={handleOrientationChange}
        onDpiChange={handleDpiChange}
        onAddText={handleAddText}
        onAddImage={handleAddImage}
        onDeleteSelected={handleDeleteSelected}
        onPrint={handlePrint}
        onDownloadPng={handleDownloadPng}
        onDownloadPdf={handleDownloadPdf}
        onDownloadSvg={handleDownloadSvg}
        onClose={onClose}
      />

      <PrintPaper
        state={state}
        sourceMap={map}
        isExporting={isExporting}
        onSelectElement={handleSelectElement}
        onUpdateElement={handleUpdateElement}
        onFocusMapFrame={handleFocusMapFrame}
        onToggleLock={handleToggleLock}
        onEditorReady={handleEditorReady}
        paperRef={paperRef}
      />

      {activeEditor && (
        <PrintTextStylePanel editor={activeEditor} />
      )}
    </div>
  );
};

export default PrintLayoutView;
