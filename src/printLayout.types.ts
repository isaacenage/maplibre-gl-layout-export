export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  color: string;
  textAlign: 'left' | 'center' | 'right';
}

export interface PrintTextElementData {
  id: string;
  type: 'text';
  rect: Rect;
  text: string;
  style: TextStyle;
  locked?: boolean;
}

export interface PrintMapElementData {
  id: string;
  type: 'map';
  rect: Rect;
  focused: boolean;
  locked?: boolean;
}

export interface PrintImageElementData {
  id: string;
  type: 'image';
  rect: Rect;
  src: string;
  objectFit: 'contain' | 'cover' | 'fill';
  locked?: boolean;
}

export type PrintElement = PrintTextElementData | PrintMapElementData | PrintImageElementData;

export type PaperSize = 'A4' | 'A3' | 'Letter' | 'Legal';
export type Orientation = 'landscape' | 'portrait';

export interface PaperDimensions {
  widthMm: number;
  heightMm: number;
  widthPx: number;
  heightPx: number;
}

export const PAPER_SIZES: Record<PaperSize, { widthMm: number; heightMm: number }> = {
  A4: { widthMm: 210, heightMm: 297 },
  A3: { widthMm: 297, heightMm: 420 },
  Letter: { widthMm: 216, heightMm: 279 },
  Legal: { widthMm: 216, heightMm: 356 },
};

const MM_TO_PX = 96 / 25.4;

export function getPaperDimensions(size: PaperSize, orientation: Orientation): PaperDimensions {
  const base = PAPER_SIZES[size];
  const isLandscape = orientation === 'landscape';
  const widthMm = isLandscape ? base.heightMm : base.widthMm;
  const heightMm = isLandscape ? base.widthMm : base.heightMm;
  return {
    widthMm,
    heightMm,
    widthPx: Math.round(widthMm * MM_TO_PX),
    heightPx: Math.round(heightMm * MM_TO_PX),
  };
}

export interface PrintLayoutState {
  paperSize: PaperSize;
  orientation: Orientation;
  elements: PrintElement[];
  selectedElementId: string | null;
  dpi: number;
}

export const DEFAULT_TEXT_STYLE: TextStyle = {
  fontFamily: 'Arial',
  fontSize: 16,
  fontWeight: 'normal',
  fontStyle: 'normal',
  color: '#000000',
  textAlign: 'left',
};

export function createInitialState(paperSize: PaperSize, orientation: Orientation): PrintLayoutState {
  const dims = getPaperDimensions(paperSize, orientation);
  const mapRect: Rect = {
    x: 40,
    y: 40,
    width: dims.widthPx - 80,
    height: dims.heightPx - 80,
  };
  return {
    paperSize,
    orientation,
    elements: [
      { id: 'map-1', type: 'map', rect: mapRect, focused: false },
    ],
    selectedElementId: 'map-1',
    dpi: 300,
  };
}
