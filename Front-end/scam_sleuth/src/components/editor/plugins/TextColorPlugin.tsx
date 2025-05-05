// src/components/editor/plugins/ColorToolbarPlugin.tsx
import { $getSelection, $isRangeSelection } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Type } from 'lucide-react';
import { $patchStyleText } from '@lexical/selection';

// Define standard color options
const TEXT_COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'Red', value: '#E14048' }, // Matching your app's red color
  { name: 'Orange', value: '#FF5722' },
  { name: 'Yellow', value: '#FFC107' },
  { name: 'Green', value: '#4CAF50' },
  { name: 'Blue', value: '#2196F3' },
  { name: 'Purple', value: '#9C27B0' },
  { name: 'Grey', value: '#9E9E9E' },
];

const BACKGROUND_COLORS = [
  { name: 'Default', value: 'transparent' },
  { name: 'Red', value: '#FFEBEE' },
  { name: 'Orange', value: '#FFF3E0' },
  { name: 'Yellow', value: '#FFFDE7' },
  { name: 'Green', value: '#E8F5E9' },
  { name: 'Blue', value: '#E3F2FD' },
  { name: 'Purple', value: '#F3E5F5' },
  { name: 'Grey', value: '#F5F5F5' },
];

export default function ColorToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [textColorMenuOpen, setTextColorMenuOpen] = useState(false);
  const [bgColorMenuOpen, setBgColorMenuOpen] = useState(false);
  const [currentTextColor, setCurrentTextColor] = useState(TEXT_COLORS[0]);
  const [currentBgColor, setCurrentBgColor] = useState(BACKGROUND_COLORS[0]);
  const textMenuRef = useRef<HTMLDivElement>(null);
  const bgMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close menus when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (textMenuRef.current && !textMenuRef.current.contains(event.target as Node)) {
        setTextColorMenuOpen(false);
      }
      if (bgMenuRef.current && !bgMenuRef.current.contains(event.target as Node)) {
        setBgColorMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Using $patchStyleText instead of selection.formatText
  const applyTextColor = (color: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, {
          color: color,
        });
      }
    });
  };

  const applyBgColor = (color: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, {
          backgroundColor: color,
        });
      }
    });
  };

  return (
    <div className="flex items-center space-x-1">
      {/* Text Color Dropdown */}
      <div className="relative" ref={textMenuRef}>
        <button
          type="button"
          className="flex items-center px-2 py-1 rounded hover:bg-gray-100 gap-1"
          onClick={() => {
            setTextColorMenuOpen(!textColorMenuOpen);
            setBgColorMenuOpen(false);
          }}
          title="Text Color"
        >
          <Type size={16} style={{ color: currentTextColor.value }} />
          <ChevronDown size={14} />
        </button>

        {textColorMenuOpen && (
          <div className="absolute left-0 top-full mt-1 p-2 bg-white border border-gray-200 rounded-md shadow-lg z-10">
            <div className="grid grid-cols-4 gap-1 w-40">
              {TEXT_COLORS.map((color) => (
                <button
                  key={color.value}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center"
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                  onClick={() => {
                    applyTextColor(color.value);
                    setCurrentTextColor(color);
                    setTextColorMenuOpen(false);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Background Color Dropdown */}
      <div className="relative" ref={bgMenuRef}>
        <button
          type="button"
          className="flex items-center px-2 py-1 rounded hover:bg-gray-100 gap-1"
          onClick={() => {
            setBgColorMenuOpen(!bgColorMenuOpen);
            setTextColorMenuOpen(false);
          }}
          title="Background Color"
        >
          <div 
            className="w-4 h-4 border border-gray-300 rounded" 
            style={{ backgroundColor: currentBgColor.value }}
          />
          <ChevronDown size={14} />
        </button>

        {bgColorMenuOpen && (
          <div className="absolute left-0 top-full mt-1 p-2 bg-white border border-gray-200 rounded-md shadow-lg z-10">
            <div className="grid grid-cols-4 gap-1 w-40">
              {BACKGROUND_COLORS.map((color) => (
                <button
                  key={color.value}
                  className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center"
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                  onClick={() => {
                    applyBgColor(color.value);
                    setCurrentBgColor(color);
                    setBgColorMenuOpen(false);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}