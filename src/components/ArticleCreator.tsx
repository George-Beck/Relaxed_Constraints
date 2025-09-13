import React, { useState } from 'react';
import { Article } from '../types/Article';

interface ArticleCreatorProps {
  categories: { name: string; slug: string }[];
  onSave: (article: Article) => void;
  onCancel: () => void;
}

export const ArticleCreator: React.FC<ArticleCreatorProps> = ({ categories, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const handleSave = () => {
    if (!title.trim() || !content.trim() || !category) {
      alert('Please fill in title, content, and select a category.');
      return;
    }

    const article: Article = {
      id: `article_${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      category: category,
      date: new Date().toISOString().split('T')[0],
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    onSave(article);
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
    <div className="min-h-screen bg-black text-green-400 font-mono">
      {/* CRT Effect Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-900/5 to-transparent animate-pulse"></div>
        <div className="absolute inset-0" style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 0, 0.03) 2px,
            rgba(0, 255, 0, 0.03) 4px
          )`
        }}></div>
      </div>

      {/* Header */}
      <div className="border-b border-green-800 p-6 bg-black/80">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onCancel}
              className="text-green-400 hover:text-green-300 text-2xl transition-colors"
              title="Cancel"
            >
              ←
            </button>
            <div>
              <h1 className="text-2xl font-bold text-green-300">CREATE NEW ARTICLE</h1>
              <p className="text-sm text-green-500">Write and publish your research</p>
            </div>
          </div>
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

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex gap-6">
          {/* Editor Panel */}
          <div className={`${showPreview ? 'w-1/2' : 'w-full'} flex flex-col`}>
            {/* Article Metadata */}
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-green-400 text-sm mb-2">Article Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter article title..."
                  className="w-full bg-black/50 border border-green-800 text-green-100 px-4 py-2 focus:border-green-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-green-400 text-sm mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-black/50 border border-green-800 text-green-100 px-4 py-2 focus:border-green-600 focus:outline-none"
                  >
                    <option value="">Select category...</option>
                    {categories.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-green-400 text-sm mb-2">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g., market analysis, trends"
                    className="w-full bg-black/50 border border-green-800 text-green-100 px-4 py-2 focus:border-green-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Content Editor */}
            <div className="flex-1">
              <label className="block text-green-400 text-sm mb-2">Article Content (Markdown supported)</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your article... (Markdown supported)"
                className="w-full h-96 bg-black/50 border border-green-800 text-green-100 px-4 py-3 focus:border-green-600 focus:outline-none resize-none"
                spellCheck="false"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mt-6 pt-4 border-t border-green-800">
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

          {/* Preview Panel */}
          {showPreview && (
            <div className="w-1/2 overflow-y-auto max-h-screen">
              <div className="bg-black/50 border border-green-800 p-6 rounded">
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
            </div>
          )}
        </div>

        {/* Writing Tips */}
        <div className="mt-8 border border-green-800 bg-black/50 p-4 rounded">
          <h3 className="text-lg font-bold mb-3 text-green-300">Writing Tips</h3>
          <div className="text-green-200 text-sm space-y-2">
            <p><strong>Markdown Support:</strong> Use # for headings, ** for bold, * for italic, ` for code</p>
            <p><strong>Structure:</strong> Start with an executive summary, then detailed analysis</p>
            <p><strong>Data:</strong> Include specific numbers, dates, and sources when possible</p>
            <p><strong>Tags:</strong> Use relevant keywords to help readers find your article</p>
          </div>
        </div>
      </div>
    </div>
  );
};
