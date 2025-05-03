// src/components/editor/ToolbarPlugin.tsx
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
} from "lexical";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
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

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [blockType, setBlockType] = useState<string>("paragraph");
  const [isBlockTypeDropdownOpen, setIsBlockTypeDropdownOpen] = useState(false);
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
      } else {
        setBlockType("paragraph");
      }
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
  };

  const formatNumberedList = () => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  };

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $wrapNodes(selection, () => $createQuoteNode());
      }
    });
  };

  // Function to display the current block type in the dropdown button
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
      
      {/* Block Type Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors w-40"
          onClick={() => setIsBlockTypeDropdownOpen(!isBlockTypeDropdownOpen)}
          title="Text Style"
        >
          <span className="flex items-center gap-2 text-sm font-medium truncate">
            {getCurrentBlockIcon()}
            {getBlockTypeDisplayName()}
          </span>
          <svg 
            className={`transition-transform duration-200 ${isBlockTypeDropdownOpen ? 'rotate-180' : ''}`}
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
          <div className="absolute z-10 mt-1 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-1 overflow-hidden">
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
      <button
        className={`p-2 rounded hover:bg-gray-100 ${
          blockType === "ul" ? "bg-gray-200" : ""
        }`}
        onClick={formatBulletList}
        title="Bullet List"
      >
        • List
      </button>
      <button
        className={`p-2 rounded hover:bg-gray-100 ${
          blockType === "ol" ? "bg-gray-200" : ""
        }`}
        onClick={formatNumberedList}
        title="Numbered List"
      >
        1. List
      </button>
      <button
        className={`p-2 rounded hover:bg-gray-100`}
        onClick={formatQuote}
        title="Quote"
      >
        "Quote"
      </button>
    </div>
  );
}