// components/TinyMCEEditor.tsx
'use client';

import { Editor } from '@tinymce/tinymce-react';
import { useRef } from 'react';

interface TinyMCEEditorProps {
  value: string;
  onChange: (content: string) => void;
  height?: number;
  placeholder?: string;
  direction?: 'ltr' | 'rtl';
}

export default function TinyMCEEditor({ 
  value, 
  onChange, 
  height = 500,
  placeholder = 'Start writing...',
  direction = 'ltr'
}: TinyMCEEditorProps) {
  const editorRef = useRef<any>(null);

  return (
    <Editor
      tinymceScriptSrc="/tinymce/tinymce.min.js"
      onInit={(evt, editor) => editorRef.current = editor}
      value={value}
      onEditorChange={onChange}
      init={{
        height,
        menubar: true,  // این رو true کن تا منوی بالا بیاد
        
        // plugins اصلی
        plugins: [
          'advlist',        // لیست پیشرفته
          'autolink',
          'lists',
          'link',
          'image',
          'charmap',
          'preview',
          'anchor',
          'searchreplace',
          'visualblocks',
          'code',
          'fullscreen',
          'insertdatetime',
          'media',
          'table',
          'help',
          'wordcount',
          'codesample',
          'emoticons',
          'directionality',
          'visualchars',
          'nonbreaking',
          'pagebreak',
          'quickbars',
          'save'
        ],
        
        // Toolbar با font controls
        toolbar: 
          'undo redo | ' +
          'blocks | ' +                    // این جایگزین formatselect شده
          'fontfamily fontsize | ' +       // این‌ها controls فونت هستن
          'bold italic underline strikethrough | ' +
          'forecolor backcolor | ' +
          'alignleft aligncenter alignright alignjustify | ' +
          'bullist numlist outdent indent | ' +
          'ltr rtl | ' +
          'link image media table blockquote codesample emoticons | ' +
          'removeformat code fullscreen help',
        
        // فونت‌ها (جدید)
        font_family_formats: 
          'Arial=arial,helvetica,sans-serif; ' +
          'Arial Black=arial black,sans-serif; ' +
          'Comic Sans MS=comic sans ms,sans-serif; ' +
          'Courier New=courier new,monospace; ' +
          'Georgia=georgia,serif; ' +
          'Impact=impact,sans-serif; ' +
          'Tahoma=tahoma,sans-serif; ' +
          'Times New Roman=times new roman,times,serif; ' +
          'Trebuchet MS=trebuchet ms,sans-serif; ' +
          'Verdana=verdana,sans-serif; ' +
          'IRANSans=IRANSans,tahoma; ' +
          'Vazir=Vazir,tahoma; ' +
          'Yekan=Yekan,tahoma',
        
        // اندازه فونت (جدید)
        font_size_formats: '8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt 48pt',
        
        // فرمت‌های heading
        block_formats: 
          'Paragraph=p; ' +
          'Heading 1=h1; ' +
          'Heading 2=h2; ' +
          'Heading 3=h3; ' +
          'Heading 4=h4; ' +
          'Heading 5=h5; ' +
          'Heading 6=h6',
        
        // تنظیمات تصویر
        image_advtab: true,
        image_caption: true,
        
        // تنظیمات لینک
        link_default_target: '_blank',
        
        // تنظیمات کد
        codesample_languages: [
          { text: 'HTML/XML', value: 'markup' },
          { text: 'JavaScript', value: 'javascript' },
          { text: 'TypeScript', value: 'typescript' },
          { text: 'CSS', value: 'css' },
          { text: 'PHP', value: 'php' },
          { text: 'Python', value: 'python' },
          { text: 'Java', value: 'java' },
          { text: 'C#', value: 'csharp' },
          { text: 'SQL', value: 'sql' },
        ],
        
        // رنگ‌ها
        color_cols: 8,
        
        // Quick toolbar
        quickbars_selection_toolbar: 'bold italic underline | blocks | forecolor backcolor',
        
        // استایل محتوا
        content_style: 
          'body { ' +
          '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; ' +
          '  font-size: 14px; ' +
          '  line-height: 1.6; ' +
          '  color: #333; ' +
          '  padding: 10px; ' +
          '} ' +
          'img { max-width: 100%; height: auto; } ' +
          'table { border-collapse: collapse; width: 100%; } ' +
          'table td, table th { border: 1px solid #ddd; padding: 8px; }',
        
        branding: false,
        promotion: false,
        placeholder,
        directionality: direction,
      }}
    />
  );
}