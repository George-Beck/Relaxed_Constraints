import React, { useState, useEffect, useRef } from 'react';
import { Article } from '../types/Article';

interface TextEditorProps {
  article?: Article | null;
  onSave: (article: Article) => void;
  onCancel: () => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({ article, onSave, onCancel }) => {
  const [title, setTitle] = useState(article?.title || '');
  const [content, setContent] = useState(article?.content || '');
  const [tags, setTags] = useState(article?.tags?.join(', ') || '');
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      alert('Title and content are required.');
      return;
    }

    const articleData: Article = {
      id: article?.id || '',
      title: title.trim(),
      content: content.trim(),
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      createdAt: article?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(articleData);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      setContent(newContent);
      
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const renderPreview = (text: string) => {
    return text
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4 text-green-300">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mb-3 text-green-300">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mb-2 text-green-300">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-green-200">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-green-300">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-green-900/30 px-1 py-0.5 rounded text-green-200">$1</code>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/^/, '<p class="mb-4">')
      .replace(/$/, '</p>');
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-green-800 p-4 bg-black/80">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-green-300">
            {article ? 'Edit Article' : 'New Article'} - TEXT_EDITOR v1.0
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-3 py-1 border border-green-600 hover:bg-green-900/30 transition-colors"
            >
              {showPreview ? 'EDIT' : 'PREVIEW'}
            </button>
            <div className="text-sm text-green-500">
              Ctrl+S: Save | ESC: Cancel
            </div>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-6xl mx-auto h-full flex">
          {/* Editor Panel */}
          <div className={`${showPreview ? 'w-1/2' : 'w-full'} h-full flex flex-col border-r border-green-800`}>
            <div className="p-4 border-b border-green-800">
              <input
                type="text"
                placeholder="Article title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent text-green-100 text-xl font-bold outline-none border-b border-green-800 pb-2 mb-3"
              />
              <input
                type="text"
                placeholder="Tags (comma separated)..."
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full bg-transparent text-green-300 text-sm outline-none"
              />
            </div>
            
            <div className="flex-1 p-4">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Start writing your article... (Markdown supported)"
                className="w-full h-full bg-transparent text-green-100 outline-none resize-none leading-relaxed"
                spellCheck="false"
              />
            </div>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="w-1/2 h-full overflow-y-auto p-6 bg-black/50">
              <h1 className="text-2xl font-bold mb-2 text-green-300">{title || 'Untitled Article'}</h1>
              {tags && (
                <div className="mb-6 text-sm text-green-500">
                  Tags: {tags.split(',').map(tag => tag.trim()).join(' • ')}
                </div>
              )}
              <div 
                className="prose prose-green max-w-none"
                dangerouslySetInnerHTML={{ __html: renderPreview(content) }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-green-800 p-4 bg-black/80">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-sm text-green-500">
            Lines: {content.split('\n').length} | Characters: {content.length}
          </div>
          <div className="flex space-x-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-green-600 hover:bg-green-900/30 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-800 hover:bg-green-700 transition-colors"
            >
              Save Article
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};