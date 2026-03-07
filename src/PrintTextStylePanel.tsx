import React, { useCallback } from 'react';
import type { Editor } from '@tiptap/react';

interface PrintTextStylePanelProps {
  editor: Editor;
}

const FONT_FAMILIES = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Garamond',
  'Palatino', 'Book Antiqua', 'Courier New', 'Lucida Console', 'Monaco',
  'Consolas', 'Trebuchet MS', 'Verdana', 'Tahoma', 'Impact',
  'Comic Sans MS', 'Brush Script MT', 'Didot', 'Futura', 'Optima',
  'Perpetua', 'Rockwell',
];
const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64];

const PrintTextStylePanel: React.FC<PrintTextStylePanelProps> = ({ editor }) => {
  const currentFont = editor.getAttributes('textStyle').fontFamily || 'Arial';
  const currentSize = parseInt(editor.getAttributes('textStyle').fontSize) || 16;

  const setFont = useCallback((family: string) => {
    editor.chain().focus().setFontFamily(family).run();
  }, [editor]);

  const setSize = useCallback((size: number) => {
    editor.chain().focus().setFontSize(`${size}px`).run();
  }, [editor]);

  return (
    <div className="mgl-le-text-style-panel">
      <select
        value={currentFont}
        onChange={(e) => setFont(e.target.value)}
      >
        {FONT_FAMILIES.map((f) => (
          <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
        ))}
      </select>

      <select
        value={currentSize}
        onChange={(e) => setSize(Number(e.target.value))}
      >
        {FONT_SIZES.map((s) => (
          <option key={s} value={s}>{s}px</option>
        ))}
      </select>

      <button
        className={editor.isActive('bold') ? 'mgl-le-active' : ''}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold"
      >
        <strong>B</strong>
      </button>

      <button
        className={editor.isActive('italic') ? 'mgl-le-active' : ''}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic"
      >
        <em>I</em>
      </button>

      <button
        className={editor.isActive('underline') ? 'mgl-le-active' : ''}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Underline"
      >
        <u>U</u>
      </button>

      <button
        className={editor.isActive('strike') ? 'mgl-le-active' : ''}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Strikethrough"
      >
        <s>S</s>
      </button>

      <div className="mgl-le-separator" />

      <button
        className={editor.isActive({ textAlign: 'left' }) ? 'mgl-le-active' : ''}
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        title="Align Left"
      >
        &#8801;L
      </button>
      <button
        className={editor.isActive({ textAlign: 'center' }) ? 'mgl-le-active' : ''}
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        title="Align Center"
      >
        &#8801;C
      </button>
      <button
        className={editor.isActive({ textAlign: 'right' }) ? 'mgl-le-active' : ''}
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        title="Align Right"
      >
        &#8801;R
      </button>
      <button
        className={editor.isActive({ textAlign: 'justify' }) ? 'mgl-le-active' : ''}
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        title="Justify"
      >
        &#8801;J
      </button>

      <div className="mgl-le-separator" />

      <input
        type="color"
        value={editor.getAttributes('textStyle').color || '#000000'}
        onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
        title="Text Color"
      />

      <input
        type="color"
        value={editor.getAttributes('highlight').color || '#ffff00'}
        onChange={(e) => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()}
        title="Highlight Color"
      />
    </div>
  );
};

export default PrintTextStylePanel;
