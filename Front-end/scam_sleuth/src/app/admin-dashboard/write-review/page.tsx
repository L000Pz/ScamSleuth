"use client";

import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Editor } from '@tinymce/tinymce-react';
import { ArrowLeft, Save } from 'lucide-react';
import { getScamTypes, submitReview } from './actions';

interface ScamType {
  scam_type_id: number;
  scam_type: string;
}

interface ReviewForm {
  title: string;
  scam_type_id: number;
  content: string;
}

export default function WriteReviewPage() {
  const router = useRouter();
  const editorRef = useRef<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scamTypes, setScamTypes] = useState<ScamType[]>([]);
  const [form, setForm] = useState<ReviewForm>({
    title: '',
    scam_type_id: 1,
    content: '',
  });

  useEffect(() => {
    const fetchScamTypes = async () => {
      const result = await getScamTypes();
      
      if (result.success && result.data) {
        setScamTypes(result.data);
        // Set default scam type if available
        if (result.data.length > 0) {
          setForm(prev => ({ ...prev, scam_type_id: result.data[0].scam_type_id }));
        }
      } else {
        setError(result.error || 'Failed to fetch scam types');
      }
    };

    fetchScamTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const content = editorRef.current?.getContent();
      
      if (!content) {
        setError('Content is required');
        return;
      }

      if (!form.title.trim()) {
        setError('Title is required');
        return;
      }

      // Log the form data before submission
      console.log('Submitting form data:', {
        content,
        title: form.title,
        scam_type_id: form.scam_type_id,
      });

      // Prepare the data according to API requirements
      const reviewData = {
        content,
        title: form.title.trim(),
        scam_type_id: form.scam_type_id,
        review_date: new Date().toISOString(),
        media: []
      };

      const result = await submitReview(reviewData);

      if (result.success) {
        // Navigate back to reviews page after successful submission
        router.push('/admin-dashboard/reviews');
      } else {
        setError(result.error || 'Failed to submit review');
        console.error('Submission error:', result.error);
      }
    } catch (error) {
      const err = error as Error;
      console.error('Error submitting review:', err);
      setError(err?.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="p-4 text-red-500">
        {error}
      </div>
    );
  }

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
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter review title"
                required
              />
            </div>

            {/* Scam Type Select */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Scam Type
              </label>
              <select
                value={form.scam_type_id}
                onChange={(e) => setForm(prev => ({ ...prev, scam_type_id: Number(e.target.value) }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                required
              >
                {scamTypes.map((type) => (
                  <option key={type.scam_type_id} value={type.scam_type_id}>
                    {type.scam_type}
                  </option>
                ))}
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