// src/components/editor/lexicalHtmlConversion.ts
import { $getRoot, LexicalEditor } from 'lexical';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';

/**
 * Convert Lexical editor state to HTML string
 * This function must be called within the editor context
 */
export function getHtmlFromEditor(editor: LexicalEditor): Promise<string> {
  return new Promise((resolve) => {
    editor.update(() => {
      const html = $generateHtmlFromNodes(editor);
      resolve(html);
    });
  });
}

/**
 * Helper function to set HTML content in the Lexical editor
 * This should be called within a useEffect or other appropriate context
 */
export function setHtmlToEditor(editor: LexicalEditor, html: string): void {
  if (!html || !editor) return;

  try {
    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(html, 'text/html');
      
      const root = $getRoot();
      // Clear editor first
      root.clear();
      
      try {
        // Generate Lexical nodes from DOM
        const nodes = $generateNodesFromDOM(editor, dom);
        
        // Append all nodes to the editor
        if (nodes && nodes.length > 0) {
          nodes.forEach(node => {
            root.append(node);
          });
        } 
      } catch (error) {
        console.error('Error importing HTML into Lexical:', error);
        // The error handling could be improved here
      }
    });
  } catch (error) {
    console.error('Error setting HTML in Lexical editor:', error);
  }
}

/**
 * React component for HTML to Lexical conversion 
 * This should be used within the LexicalComposer context
 */
export function HtmlToLexicalPlugin({ 
  html, 
  editor 
}: { 
  html: string;
  editor: LexicalEditor;
}): null {
  if (html && editor) {
    setHtmlToEditor(editor, html);
  }
  
  return null;
}