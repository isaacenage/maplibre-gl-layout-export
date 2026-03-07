import React, { useCallback, useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import FontSize from './tiptapFontSize';
import type { Editor } from '@tiptap/react';
import { IconLock, IconUnlock } from './icons';
import type { PrintTextElementData, Rect } from './printLayout.types';
import { usePrintDrag } from './usePrintDrag';
import { usePrintResize } from './usePrintResize';

interface PrintTextElementProps {
  element: PrintTextElementData;
  isSelected: boolean;
  scale: number;
  paperWidth: number;
  paperHeight: number;
  onSelect: (id: string) => void;
  onUpdate: (element: PrintTextElementData) => void;
  onToggleLock: (id: string) => void;
  onEditorReady?: (editor: Editor | null) => void;
}

const PrintTextElement: React.FC<PrintTextElementProps> = ({
  element,
  isSelected,
  scale,
  paperWidth,
  paperHeight,
  onSelect,
  onUpdate,
  onToggleLock,
  onEditorReady,
}) => {
  const [editing, setEditing] = useState(false);

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

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      TextStyle,
      FontFamily,
      Color,
      TextAlign.configure({
        types: ['paragraph'],
      }),
      Underline,
      FontSize,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    immediatelyRender: false,
    content: element.text,
    editable: false,
    onUpdate: ({ editor: ed }) => {
      onUpdate({ ...element, text: ed.getHTML() });
    },
  });

  useEffect(() => {
    if (editing && editor) {
      onEditorReady?.(editor);
    } else {
      onEditorReady?.(null);
    }
  }, [editing, editor, onEditorReady]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(editing);
      if (editing) {
        editor.commands.focus('end');
      }
    }
  }, [editing, editor]);

  useEffect(() => {
    if (!isSelected && editing) {
      setEditing(false);
    }
  }, [isSelected, editing]);

  useEffect(() => {
    if (editor && !editing && editor.getHTML() !== element.text) {
      editor.commands.setContent(element.text, { emitUpdate: false });
    }
  }, [element.text, editor, editing]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!element.locked) setEditing(true);
  }, [element.locked]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditing(false);
      }
      e.stopPropagation();
    },
    []
  );

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

  const { rect, style: textStyle } = element;

  const classNames = [
    'mgl-le-element',
    'mgl-le-text-element',
    isSelected ? 'mgl-le-selected' : '',
    editing ? 'mgl-le-editing' : '',
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
        fontFamily: textStyle.fontFamily,
        fontSize: textStyle.fontSize,
        fontWeight: textStyle.fontWeight,
        fontStyle: textStyle.fontStyle,
        color: textStyle.color,
        textAlign: textStyle.textAlign,
        cursor: element.locked ? 'default' : undefined,
        pointerEvents: element.locked ? 'none' : undefined,
      }}
      onClick={handleClick}
      onPointerDown={editing || element.locked ? undefined : onDragPointerDown}
      onDoubleClick={handleDoubleClick}
      onKeyDown={editing ? handleKeyDown : undefined}
    >
      {editing ? (
        <EditorContent
          editor={editor}
          style={{ width: '100%', height: '100%', outline: 'none' }}
        />
      ) : (
        <div
          style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
          dangerouslySetInnerHTML={{ __html: element.text }}
        />
      )}

      {isSelected && !editing && !element.locked &&
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

export default PrintTextElement;
