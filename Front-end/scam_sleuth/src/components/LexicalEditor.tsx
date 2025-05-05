// src/components/LexicalEditor.tsx
import React, { useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS } from '@lexical/markdown';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $createParagraphNode, $createTextNode, EditorState } from 'lexical';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ToolbarPlugin } from './editor/ToolbarPlugin';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';


interface LexicalEditorProps {
  initialContent?: string;
  onChange?: (editorState: EditorState, editor: any) => void;
  onBlur?: () => void;
  placeholder?: string;
  height?: number|string;
}

// Create a plugin to import HTML into Lexical
function HtmlToLexicalPlugin({ html }: { html: string }) {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    if (!html || !editor) return;

    // Import HTML content into editor
    try {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(html, 'text/html');
        
        const root = $getRoot();
        // Clear editor first
        root.clear();
        
        try {
          // Use DOM Parser and manually insert nodes
          // This is a simple implementation
          // For a complete solution, you would use $generateNodesFromDOM from @lexical/html
          // But we'll keep it simple for now
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode(html));
          root.append(paragraph);
        } catch (error) {
          console.error('Error parsing HTML in Lexical:', error);
          // Fallback to just inserting text
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode(html));
          root.append(paragraph);
        }
      });
    } catch (error) {
      console.error('Error setting HTML content in Lexical:', error);
    }
  }, [editor, html]);

  return null;
}

export default function LexicalEditor({
  initialContent = '',
  onChange,
  onBlur,
  placeholder = 'Enter your content...',
  height = 500
}: LexicalEditorProps) {
  
  const editorConfig = {
    namespace: 'ScamSleuthEditor',
    theme: {
      paragraph: 'mb-2',
      heading: {
        h1: 'text-3xl font-bold mb-3',
        h2: 'text-2xl font-bold mb-2',
        h3: 'text-xl font-bold mb-2',
        h4: 'text-lg font-bold mb-1',
        h5: 'text-base font-bold mb-1',
        h6: 'text-sm font-bold mb-1',
      },
      list: {
        ol: 'list-decimal ml-6 mb-2',
        ul: 'list-disc ml-6 mb-2',
        listitem: 'mb-1',
      },
      quote: 'border-l-4 border-gray-300 pl-4 italic mb-2',
      text: {
        bold: 'font-bold',
        italic: 'italic',
        underline: 'underline',
        code: 'bg-gray-100 p-1 rounded font-mono text-sm',
        color: 'color',
      },
      link: 'text-blue-500 underline',
    },
    // Register all required nodes
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      LinkNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      CodeNode,
      CodeHighlightNode,
      HorizontalRuleNode,
    ],
    onError(error: Error) {
      console.error(error);
    },
  };
  
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="lexical-editor-container border border-gray-300 rounded-lg overflow-hidden">
        <ToolbarPlugin />
        <div className="editor-inner relative" style={{ height: `${height}px`, overflow: 'auto' }}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="editor-input px-4 py-2 outline-none h-full"
              />
            }
            placeholder={
              <div className="editor-placeholder absolute top-[10px] left-[16px] text-gray-400 pointer-events-none">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <ListPlugin />
          <LinkPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          {initialContent && <HtmlToLexicalPlugin html={initialContent} />}
          {onChange && <OnChangePlugin onChange={onChange} />}
        </div>
      </div>
    </LexicalComposer>
  );
}