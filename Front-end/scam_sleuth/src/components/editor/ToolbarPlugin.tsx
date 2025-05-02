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
import React, { useCallback, useEffect, useState } from "react";

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [blockType, setBlockType] = useState<string>("paragraph");

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
        // Properly type check for ListNode before accessing getListType
        setBlockType(($isListNode(element) && element.getListType() === "bullet") ? "ul" : "ol");
      } else if ($isListItemNode(element)) {
        // Check parent node if this is a list item
        const parent = element.getParent();
        if (parent && $isListNode(parent)) {
          // Now we know it's a ListNode, we can safely access getListType
          setBlockType(parent.getListType() === "bullet" ? "ul" : "ol");
        } else {
          // Default to paragraph if we can't determine
          setBlockType("paragraph");
        }
      } else {
        // Default to paragraph for any other node type
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

  const formatHeading = (headingSize: HeadingTagType) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $wrapNodes(selection, () => $createHeadingNode(headingSize));
      }
    });
  };

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $wrapNodes(selection, () => $createParagraphNode());
      }
    });
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

  return (
    <div className="toolbar flex items-center p-2 gap-1 border-b border-gray-300 flex-wrap">
      <button
        className={`p-2 rounded hover:bg-gray-100 ${
          blockType === "paragraph" ? "bg-gray-200" : ""
        }`}
        onClick={formatParagraph}
        title="Paragraph"
      >
        P
      </button>
      <button
        className={`p-2 rounded hover:bg-gray-100 ${
          blockType === "h1" ? "bg-gray-200" : ""
        }`}
        onClick={() => formatHeading("h1")}
        title="Heading 1"
      >
        H1
      </button>
      <button
        className={`p-2 rounded hover:bg-gray-100 ${
          blockType === "h2" ? "bg-gray-200" : ""
        }`}
        onClick={() => formatHeading("h2")}
        title="Heading 2"
      >
        H2
      </button>
      <button
        className={`p-2 rounded hover:bg-gray-100 ${
          blockType === "h3" ? "bg-gray-200" : ""
        }`}
        onClick={() => formatHeading("h3")}
        title="Heading 3"
      >
        H3
      </button>
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
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
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
    </div>
  );
}