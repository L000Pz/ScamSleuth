import React, { useState, useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection } from 'lexical';
import { $patchStyleText } from '@lexical/selection';
import { JSX } from 'react/jsx-runtime';

const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 72;
const DEFAULT_FONT_SIZE = 16;

export default function FontSizePlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [fontSize, setFontSize] = useState<number>(DEFAULT_FONT_SIZE);
  const [inputValue, setInputValue] = useState<string>(DEFAULT_FONT_SIZE.toString());
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const updateFontSize = () => {
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        // Check if selected nodes have fontSize style
        const node = selection.getNodes()[0];
        if (node) {
          const element = editor.getElementByKey(node.getKey());
          if (element) {
            const computedStyle = window.getComputedStyle(element);
            const currentSize = parseInt(computedStyle.fontSize);
            
            if (!isNaN(currentSize) && currentSize !== fontSize) {
              setFontSize(currentSize);
              setInputValue(currentSize.toString());
            }
          }
        }
      });
    };

    // Update when selection changes
    const removeSelectionListener = editor.registerUpdateListener(
      ({ editorState }) => {
        editorState.read(() => {
          updateFontSize();
        });
      }
    );

    return () => {
      removeSelectionListener();
    };
  }, [editor, fontSize]);

  const applyFontSize = (size: number) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      
      // Use $patchStyleText to apply the font size to the selected text
      $patchStyleText(selection, {
        'font-size': `${size}px`,
      });
    });
  };

  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + 1, MAX_FONT_SIZE);
    setFontSize(newSize);
    setInputValue(newSize.toString());
    applyFontSize(newSize);
  };

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - 1, MIN_FONT_SIZE);
    setFontSize(newSize);
    setInputValue(newSize.toString());
    applyFontSize(newSize);
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only update the input value, not the actual font size yet
    setInputValue(e.target.value);
  };
  
  const handleFontSizeBlur = () => {
    // Apply the font size when input loses focus
    const value = parseInt(inputValue, 10);
    if (isNaN(value)) {
      // Reset to current value if invalid
      setInputValue(fontSize.toString());
      return;
    }
    
    const newSize = Math.max(MIN_FONT_SIZE, Math.min(value, MAX_FONT_SIZE));
    setFontSize(newSize);
    setInputValue(newSize.toString());
    applyFontSize(newSize);
  };
  
  const handleFontSizeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Apply the font size when Enter is pressed
    if (e.key === 'Enter') {
      e.preventDefault();
      inputRef.current?.blur();
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <button
        type="button"
        onClick={decreaseFontSize}
        className="p-1 rounded hover:bg-gray-100 text-gray-600"
        aria-label="Decrease font size"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
      
      <div className="flex items-center border border-gray-300 rounded px-1">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleFontSizeChange}
          onBlur={handleFontSizeBlur}
          onKeyDown={handleFontSizeKeyDown}
          className="w-12 text-center focus:outline-none text-sm"
          aria-label="Font size"
        />
        <span className="text-xs text-gray-500">px</span>
      </div>
      
      <button
        type="button"
        onClick={increaseFontSize}
        className="p-1 rounded hover:bg-gray-100 text-gray-600"
        aria-label="Increase font size"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>
  );
}