import React from 'react';
import { IconPng, IconPdf, IconSvg, IconText, IconImage } from './icons';
import type { PaperSize, Orientation, PrintLayoutState } from './printLayout.types';

interface PrintToolbarProps {
  state: PrintLayoutState;
  isExporting?: boolean;
  onPaperSizeChange: (size: PaperSize) => void;
  onOrientationChange: (orientation: Orientation) => void;
  onDpiChange: (dpi: number) => void;
  onAddText: () => void;
  onAddImage: () => void;
  onDeleteSelected: () => void;
  onPrint: () => void;
  onDownloadPng: () => void;
  onDownloadPdf: () => void;
  onDownloadSvg: () => void;
  onClose: () => void;
}

const PrintToolbar: React.FC<PrintToolbarProps> = ({
  state,
  isExporting = false,
  onPaperSizeChange,
  onOrientationChange,
  onDpiChange,
  onAddText,
  onAddImage,
  onDeleteSelected,
  onPrint,
  onDownloadPng,
  onDownloadPdf,
  onDownloadSvg,
  onClose,
}) => {
  const selectedEl = state.selectedElementId
    ? state.elements.find((e) => e.id === state.selectedElementId)
    : null;
  const canDelete = selectedEl?.type === 'text' || selectedEl?.type === 'image';

  return (
    <div className="mgl-le-toolbar">
      <span className="mgl-le-toolbar-title">Print Layout</span>

      <div className="mgl-le-separator" />

      <label className="mgl-le-toolbar-label">Paper:</label>
      <select
        value={state.paperSize}
        onChange={(e) => onPaperSizeChange(e.target.value as PaperSize)}
      >
        <option value="A4">A4</option>
        <option value="A3">A3</option>
        <option value="Letter">Letter</option>
        <option value="Legal">Legal</option>
      </select>

      <select
        value={state.orientation}
        onChange={(e) => onOrientationChange(e.target.value as Orientation)}
      >
        <option value="landscape">Landscape</option>
        <option value="portrait">Portrait</option>
      </select>

      <label className="mgl-le-toolbar-label">DPI:</label>
      <select value={state.dpi} onChange={(e) => onDpiChange(Number(e.target.value))}>
        <option value={96}>96</option>
        <option value={150}>150</option>
        <option value={200}>200</option>
        <option value={300}>300</option>
      </select>

      <div className="mgl-le-separator" />

      <button onClick={onAddText} disabled={isExporting} title="Add Text">
        <IconText size={18} />
      </button>
      <button onClick={onAddImage} disabled={isExporting} title="Add Image">
        <IconImage size={18} />
      </button>
      {canDelete && (
        <button onClick={onDeleteSelected} disabled={isExporting} className="mgl-le-btn-danger">
          Delete
        </button>
      )}

      <div className="mgl-le-spacer" />

      <button onClick={onDownloadPng} disabled={isExporting} title="Export to PNG">
        <IconPng size={18} />
      </button>
      <button onClick={onDownloadPdf} disabled={isExporting} title="Export to PDF">
        <IconPdf size={18} />
      </button>
      <button onClick={onDownloadSvg} disabled={isExporting} title="Export to SVG">
        <IconSvg size={18} />
      </button>
      <button className="mgl-le-btn-primary" onClick={onPrint} disabled={isExporting}>
        Print
      </button>

      <div className="mgl-le-separator" />

      <button onClick={onClose} disabled={isExporting} className="mgl-le-btn-close">
        Close
      </button>
    </div>
  );
};

export default PrintToolbar;
