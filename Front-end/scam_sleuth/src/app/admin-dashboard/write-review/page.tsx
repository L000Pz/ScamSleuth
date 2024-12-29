"use client";

import { Button } from '@/components/ui/button';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Editor } from '@tinymce/tinymce-react';
import { ArrowLeft, Save } from 'lucide-react';


interface ReviewForm {
  title: string;
  category: string;
  content: string;
}

export default function WriteReviewPage() {
  const router = useRouter();
  const editorRef = useRef<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<ReviewForm>({
    title: '',
    category: 'general',
    content: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const content = editorRef.current?.getContent();
      
      // Prepare the data to be sent
      const reviewData = {
        ...form,
        content,
        publishedAt: new Date().toISOString(),
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Review data:', reviewData);

      // Navigate back to reviews page after successful submission
      router.push('/admin-dashboard/reviews');
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin-dashboard/reviews')}
            className="p-2"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h2 className="text-[40px] font-bold">Write a Review</h2>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="rounded-full px-6 font-bold bg-black hover:bg-gray-800"
        >
          {isSubmitting ? (
            'Publishing...'
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Publish
            </>
          )}
        </Button>
      </div>

      {/* Main Content */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-background rounded-xl p-6 shadow-md">
          <div className="space-y-4">
            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter review title"
                required
              />
            </div>

            {/* Category Select */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              >
                <option value="general">General</option>
                <option value="security">Security</option>
                <option value="privacy">Privacy</option>
                <option value="technology">Technology</option>
                <option value="awareness">Awareness</option>
              </select>
            </div>
          </div>
        </div>

        {/* TinyMCE Editor */}
        <div className="bg-background rounded-xl p-6 shadow-md">
          <label className="block text-sm font-medium text-gray-500 mb-4">
            Content
          </label>
          <Editor
            onInit={(evt, editor) => editorRef.current = editor}
            init={{
              height: 500,
              menubar: false,
              plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
              ],
              toolbar: 'undo redo | blocks | ' +
                'bold italic forecolor | alignleft aligncenter ' +
                'alignright alignjustify | bullist numlist outdent indent | ' +
                'removeformat | help',
              content_style: 'body { font-family:Vazirmat,Helvetica,Arial,sans-serif; font-size:14px }'
            }}
          />
        </div>
      </form>
    </div>
  );
}