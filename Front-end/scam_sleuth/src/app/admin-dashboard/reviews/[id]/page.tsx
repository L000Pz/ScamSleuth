"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowLeft, Trash2, Save, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getPublicReview, deleteReview, updateReview } from './actions';
import LexicalEditor from '@/components/LexicalEditor';
import { getHtmlFromEditor } from '@/components/editor/lexicalHtmlConversion';

interface ReviewData {
  id: string;
  title: string;
  date: string;
  content: string;
  media: Array<{
    media_id: number;
  }>;
}

export default function ReviewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [review, setReview] = useState<ReviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        setIsLoading(true);
        const result = await getPublicReview(params.id);
        
        if (result.success && result.data) {
          setReview(result.data);
          setEditedTitle(result.data.title);
        } else {
          setError(result.error || 'Failed to fetch review');
        }
      } catch (error) {
        setError('Failed to load review');
        console.error('Error fetching review:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReview();
  }, [params.id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      setIsDeleting(true);
      const result = await deleteReview(params.id);
      
      if (result.success) {
        router.push('/admin-dashboard/reviews');
        router.refresh();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditorChange = (editorState: any, editor: any) => {
    // Store a reference to the editor
    if (!editorRef.current) {
      editorRef.current = editor;
    }
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    if (!review) return;
    
    try {
      setIsSaving(true);
      
      // Get content from Lexical editor
      let content = '';
      if (editorRef.current) {
        content = await getHtmlFromEditor(editorRef.current);
      }

      if (!content) {
        alert('Content cannot be empty');
        setIsSaving(false);
        return;
      }

      if (!editedTitle.trim()) {
        alert('Title cannot be empty');
        setIsSaving(false);
        return;
      }

      const result = await updateReview({
        id: params.id,
        title: editedTitle.trim(),
        content
      });

      if (result.success) {
        // Update the local state to reflect changes
        setReview({
          ...review,
          title: editedTitle.trim(),
          content
        });
        setIsEditing(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error saving review:', error);
      alert('Failed to save review');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="flex justify-center items-center h-full text-red-500">
        {error || 'Review not found'}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2" 
          onClick={() => router.push('/admin-dashboard/reviews')}
        >
          <ArrowLeft size={20} />
          <span>Back to Reviews</span>
        </Button>

        <div className="flex gap-2">
          {isEditing ? (
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Save size={20} />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={toggleEdit}
            >
              <Edit size={20} />
              Edit
            </Button>
          )}

          <Button 
            variant="outline" 
            className="flex items-center gap-2 text-red-500 hover:text-red-700"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 size={20} />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden flex-1 flex flex-col">
        <div className="p-8 flex flex-col h-full">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Calendar size={16} />
              {review.date}
            </div>
            
            {isEditing ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full text-3xl font-bold p-2 border border-gray-300 rounded-lg mb-4"
              />
            ) : (
              <h1 className="text-3xl font-bold">{review.title}</h1>
            )}
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            {isEditing ? (
              <div className="flex-1 flex flex-col">
                <LexicalEditor
                  initialContent={review.content}
                  onChange={handleEditorChange}
                  height= "100%"
                />
              </div>
            ) : (
              <div 
                className="prose max-w-none mt-6 overflow-y-auto flex-1" 
                dangerouslySetInnerHTML={{ __html: review.content }} 
              />
            )}
          </div>

          {review.media && review.media.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-3">Evidence</h2>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {review.media.map((media, index) => (
                  <div key={media.media_id} className="rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={`http://localhost:8080/Media/mediaManager/Get?id=${media.media_id}`}
                      alt={`Evidence ${index + 1}`}
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}