// src/components/editor/ToolbarPlugin.tsx with added text alignment functionality

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $getNodeByKey,
  ElementNode,
} from "lexical";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  HeadingTagType,
} from "@lexical/rich-text";
import { $wrapNodes } from "@lexical/selection";
import {
  $createParagraphNode,
  $getRoot,
  $createTextNode,
  $isParagraphNode,
} from "lexical";
import { $isListNode, ListNode } from "@lexical/list";
import { $createListNode, $isListItemNode } from "@lexical/list";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import React, { useCallback, useEffect, useState, useRef } from "react";
import FontSizePlugin from './plugins/FontSizePlugin';
import TextColorPlugin from './plugins/TextColorPlugin';

// Icons for text formatting options
const ParagraphIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 4v16"></path>
    <path d="M19 4v16"></path>
    <path d="M19 4H8.5a4.5 4.5 0 0 0 0 9H13"></path>
  </svg>
);

const Heading1Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12h16"></path>
    <path d="M4 6h16"></path>
    <path d="M4 18h12"></path>
  </svg>
);

const Heading2Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12h10"></path>
    <path d="M4 6h16"></path>
    <path d="M4 18h8"></path>
  </svg>
);

const Heading3Icon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12h8"></path>
    <path d="M4 6h16"></path>
    <path d="M4 18h6"></path>
  </svg>
);

const BulletListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

const NumberedListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="10" y1="6" x2="21" y2="6"></line>
    <line x1="10" y1="12" x2="21" y2="12"></line>
    <line x1="10" y1="18" x2="21" y2="18"></line>
    <path d="M4 6h1v4"></path>
    <path d="M4 10h2"></path>
    <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
  </svg>
);

const QuoteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
  </svg>
);

const LTRIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 5h14"></path>
    <path d="M3 12h9"></path>
    <path d="M3 19h5"></path>
    <path d="M19 19l-2-3"></path>
    <path d="M19 5l-2 3"></path>
    <path d="M21 12h-4"></path>
  </svg>
);

const RTLIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 5H7"></path>
    <path d="M21 12h-9"></path>
    <path d="M21 19h-5"></path>
    <path d="M5 19l2-3"></path>
    <path d="M5 5l2 3"></path>
    <path d="M3 12h4"></path>
  </svg>
);

// New icons for text alignment
const AlignLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="12" x2="15" y2="12"></line>
    <line x1="3" y1="18" x2="18" y2="18"></line>
  </svg>
);

const AlignCenterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="6" y1="12" x2="18" y2="12"></line>
    <line x1="4" y1="18" x2="20" y2="18"></line>
  </svg>
);

const AlignRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="9" y1="12" x2="21" y2="12"></line>
    <line x1="6" y1="18" x2="21" y2="18"></line>
  </svg>
);

const AlignJustifyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

// Define a type for text alignment options
type TextAlignment = 'left' | 'center' | 'right' | 'justify';

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [blockType, setBlockType] = useState<string>("paragraph");
  const [isBlockTypeDropdownOpen, setIsBlockTypeDropdownOpen] = useState(false);
  const [textDirection, setTextDirection] = useState<"ltr" | "rtl">("ltr");
  // Add text alignment state
  const [textAlignment, setTextAlignment] = useState<TextAlignment>("left");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));

      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();

      if ($isHeadingNode(element)) {
        setBlockType(element.getTag());
      } else if ($isParagraphNode(element)) {
        setBlockType("paragraph");
      } else if ($isListNode(element)) {
        setBlockType(($isListNode(element) && element.getListType() === "bullet") ? "ul" : "ol");
      } else if ($isListItemNode(element)) {
        const parent = element.getParent();
        if (parent && $isListNode(parent)) {
          setBlockType(parent.getListType() === "bullet" ? "ul" : "ol");
        } else {
          setBlockType("paragraph");
        }
      } else if ($isQuoteNode(element)) {
        setBlockType("quote");
      } else {
        setBlockType("paragraph");
      }

      // Check text direction and alignment by accessing editor DOM
      editor.getEditorState().read(() => {
        // In Lexical, we need to check the DOM element's direction and text-align
        if (element && element.getKey()) {
          try {
            // We need to access the DOM directly to get the direction and text-align
            const domElement = editor.getElementByKey(element.getKey());
            if (domElement) {
              const computedStyle = window.getComputedStyle(domElement);
              setTextDirection(computedStyle.direction as "ltr" | "rtl");
              
              // Set text alignment based on computed style
              const textAlign = computedStyle.textAlign as TextAlignment;
              setTextAlignment(textAlign);
            }
          } catch (error) {
            console.error("Error getting text properties:", error);
          }
        }
      });
    }
  }, [editor]);

  useEffect(() => {
    editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBlockTypeDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const formatHeading = (headingSize: HeadingTagType) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $wrapNodes(selection, () => $createHeadingNode(headingSize));
      }
    });
    setIsBlockTypeDropdownOpen(false);
  };

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $wrapNodes(selection, () => $createParagraphNode());
      }
    });
    setIsBlockTypeDropdownOpen(false);
  };

  const formatBulletList = () => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    setIsBlockTypeDropdownOpen(false);
  };

  const formatNumberedList = () => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    setIsBlockTypeDropdownOpen(false);
  };

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $wrapNodes(selection, () => $createQuoteNode());
      }
    });
    setIsBlockTypeDropdownOpen(false);
  };

  const setToLTR = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchorNode = selection.anchor.getNode();
        const element =
          anchorNode.getKey() === "root"
            ? anchorNode
            : anchorNode.getTopLevelElementOrThrow();
        
        // We need to set the dir attribute on the DOM element
        // First update the editor state
        if (element && element.getKey()) {
          // Set direction using the DOM API
          setTimeout(() => {
            const domElement = editor.getElementByKey(element.getKey());
            if (domElement) {
              domElement.dir = "ltr";
              setTextDirection("ltr");
            }
          }, 0);
        }
      }
    });
  };

  const setToRTL = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchorNode = selection.anchor.getNode();
        const element =
          anchorNode.getKey() === "root"
            ? anchorNode
            : anchorNode.getTopLevelElementOrThrow();
        
        // We need to set the dir attribute on the DOM element
        // First update the editor state
        if (element && element.getKey()) {
          // Set direction using the DOM API
          setTimeout(() => {
            const domElement = editor.getElementByKey(element.getKey());
            if (domElement) {
              domElement.dir = "rtl";
              setTextDirection("rtl");
            }
          }, 0);
        }
      }
    });
  };

  // New functions for text alignment
  const setTextAlign = (alignment: TextAlignment) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchorNode = selection.anchor.getNode();
        const element =
          anchorNode.getKey() === "root"
            ? anchorNode
            : anchorNode.getTopLevelElementOrThrow();
        
        if (element && element.getKey()) {
          setTimeout(() => {
            const domElement = editor.getElementByKey(element.getKey());
            if (domElement) {
              domElement.style.textAlign = alignment;
              setTextAlignment(alignment);
            }
          }, 0);
        }
      }
    });
  };

  // Function to display the current block type icon in the dropdown button
  const getCurrentBlockIcon = () => {
    switch (blockType) {
      case 'paragraph':
        return <ParagraphIcon />;
      case 'h1':
        return <Heading1Icon />;
      case 'h2':
        return <Heading2Icon />;
      case 'h3':
        return <Heading3Icon />;
      case 'ul':
        return <BulletListIcon />;
      case 'ol':
        return <NumberedListIcon />;
      case 'quote':
        return <QuoteIcon />;
      default:
        return <ParagraphIcon />;
    }
  };

  // Function to get the display name of the current block type
  const getBlockTypeDisplayName = () => {
    switch (blockType) {
      case 'paragraph':
        return 'Paragraph';
      case 'h1':
        return 'Heading 1';
      case 'h2':
        return 'Heading 2';
      case 'h3':
        return 'Heading 3';
      case 'ul':
        return 'Bullet List';
      case 'ol':
        return 'Numbered List';
      case 'quote':
        return 'Block Quote';
      default:
        return 'Paragraph';
    }
  };

  return (
    <div className="toolbar flex items-center p-2 gap-1 border-b border-gray-300 flex-wrap">
      <button
        className="p-2 rounded hover:bg-gray-100"
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        title="Undo"
      >
        ↩
      </button>
      <button
        className="p-2 rounded hover:bg-gray-100"
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        title="Redo"
      >
        ↪
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      {/* Block Type Dropdown with fixed width */}
      <div className="relative" ref={dropdownRef}>
        <button
          className="flex items-center justify-between px-3 py-2 rounded bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
          style={{ width: '180px' }}
          onClick={() => setIsBlockTypeDropdownOpen(!isBlockTypeDropdownOpen)}
          title="Text Style"
        >
          <span className="flex items-center gap-2 text-sm font-medium whitespace-nowrap overflow-hidden">
            <span className="flex-shrink-0">{getCurrentBlockIcon()}</span>
            <span className="truncate">{getBlockTypeDisplayName()}</span>
          </span>
          <svg 
            className={`flex-shrink-0 ml-1 transition-transform duration-200 ${isBlockTypeDropdownOpen ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg" 
            width="10" 
            height="6" 
            viewBox="0 0 10 6" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polyline points="1 1 5 5 9 1"></polyline>
          </svg>
        </button>
        
        {isBlockTypeDropdownOpen && (
          <div className="absolute z-10 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 overflow-hidden">
            {/* Dropdown Section: Text */}
            <div className="px-3 py-1 text-xs text-gray-500 font-medium uppercase">Text</div>
            <button
              className={`flex items-center gap-3 w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                blockType === "paragraph" ? "bg-gray-100 text-blue-600" : ""
              }`}
              onClick={formatParagraph}
            >
              <ParagraphIcon />
              <span>Paragraph</span>
            </button>
            <button
              className={`flex items-center gap-3 w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                blockType === "h1" ? "bg-gray-100 text-blue-600" : ""
              }`}
              onClick={() => formatHeading("h1")}
            >
              <Heading1Icon />
              <span className="text-lg font-bold">Heading 1</span>
            </button>
            <button
              className={`flex items-center gap-3 w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                blockType === "h2" ? "bg-gray-100 text-blue-600" : ""
              }`}
              onClick={() => formatHeading("h2")}
            >
              <Heading2Icon />
              <span className="text-base font-bold">Heading 2</span>
            </button>
            <button
              className={`flex items-center gap-3 w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                blockType === "h3" ? "bg-gray-100 text-blue-600" : ""
              }`}
              onClick={() => formatHeading("h3")}
            >
              <Heading3Icon />
              <span className="text-sm font-bold">Heading 3</span>
            </button>
            
            {/* Dropdown Section: Lists */}
            <div className="border-t border-gray-200 mt-1 pt-1">
              <div className="px-3 py-1 text-xs text-gray-500 font-medium uppercase">Lists</div>
              <button
                className={`flex items-center gap-3 w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                  blockType === "ul" ? "bg-gray-100 text-blue-600" : ""
                }`}
                onClick={formatBulletList}
              >
                <BulletListIcon />
                <span>Bullet List</span>
              </button>
              <button
                className={`flex items-center gap-3 w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                  blockType === "ol" ? "bg-gray-100 text-blue-600" : ""
                }`}
                onClick={formatNumberedList}
              >
                <NumberedListIcon />
                <span>Numbered List</span>
              </button>
            </div>
            
            {/* Dropdown Section: Quote */}
            <div className="border-t border-gray-200 mt-1 pt-1">
              <div className="px-3 py-1 text-xs text-gray-500 font-medium uppercase">Quote</div>
              <button
                className={`flex items-center gap-3 w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                  blockType === "quote" ? "bg-gray-100 text-blue-600" : ""
                }`}
                onClick={formatQuote}
              >
                <QuoteIcon />
                <span>Block Quote</span>
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="h-6 border-l border-gray-300 mx-1"></div>
      <FontSizePlugin />
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      <button
        className={`p-2 rounded hover:bg-gray-100 ${isBold ? "bg-gray-200" : ""}`}
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
        title="Bold"
      >
        <span className="font-bold">B</span>
      </button>
      <button
        className={`p-2 rounded hover:bg-gray-100 ${
          isItalic ? "bg-gray-200" : ""
        }`}
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }}
        title="Italic"
      >
        <span className="italic">I</span>
      </button>
      <button
        className={`p-2 rounded hover:bg-gray-100 ${
          isUnderline ? "bg-gray-200" : ""
        }`}
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        }}
        title="Underline"
      >
        <span className="underline">U</span>
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      <TextColorPlugin />
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      {/* Text Alignment Controls */}
      
      <div className="flex border border-gray-300 rounded overflow-hidden">
        <button
          className={`p-2 flex items-center justify-center transition-colors ${
            textAlignment === "left" ? "bg-gray-200" : "hover:bg-gray-100"
          }`}
          onClick={() => setTextAlign("left")}
          title="Align Left"
        >
          <AlignLeftIcon />
        </button>
        <button
          className={`p-2 flex items-center justify-center transition-colors ${
            textAlignment === "center" ? "bg-gray-200" : "hover:bg-gray-100"
          }`}
          onClick={() => setTextAlign("center")}
          title="Align Center"
        >
          <AlignCenterIcon />
        </button>
        <button
          className={`p-2 flex items-center justify-center transition-colors ${
            textAlignment === "right" ? "bg-gray-200" : "hover:bg-gray-100"
          }`}
          onClick={() => setTextAlign("right")}
          title="Align Right"
        >
          <AlignRightIcon />
        </button>
        <button
          className={`p-2 flex items-center justify-center transition-colors ${
            textAlignment === "justify" ? "bg-gray-200" : "hover:bg-gray-100"
          }`}
          onClick={() => setTextAlign("justify")}
          title="Justify"
        >
          <AlignJustifyIcon />
        </button>
      </div>
      
      {/* Text Direction Controls */}
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      <div className="flex border border-gray-300 rounded overflow-hidden">
        <button
          className={`p-2 flex items-center justify-center transition-colors ${
            textDirection === "ltr" ? "bg-gray-200" : "hover:bg-gray-100"
          }`}
          onClick={setToLTR}
          title="Left to Right"
        >
          <LTRIcon />
        </button>
        <button
          className={`p-2 flex items-center justify-center transition-colors ${
            textDirection === "rtl" ? "bg-gray-200" : "hover:bg-gray-100"
          }`}
          onClick={setToRTL}
          title="Right to Left"
        >
          <RTLIcon />
        </button>
      </div>
    </div>
  );
}