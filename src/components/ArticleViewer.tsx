import React from 'react';
import { Article } from '../types/Article';

interface ArticleViewerProps {
  article: Article;
  onBack: () => void;
}

export const ArticleViewer: React.FC<ArticleViewerProps> = ({ article, onBack }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'q') {
      onBack();
    }
  };

  const renderContent = (text: string) => {
    return text
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-6 text-green-300 border-b border-green-800 pb-2">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mb-4 text-green-300">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mb-3 text-green-300">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-green-200 font-bold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-green-300 italic">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-green-900/40 px-2 py-1 rounded text-green-200 font-mono">$1</code>')
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-green-900/20 p-4 rounded border-l-4 border-green-600 my-4 overflow-x-auto"><code class="text-green-200">$1</code></pre>')
      .replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed">')
      .replace(/^/, '<p class="mb-4 leading-relaxed">')
      .replace(/$/, '</p>');
  };

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'q') {
        onBack();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onBack]);

  return (
    <div className="h-screen flex flex-col" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Header */}
      <div className="border-b border-green-800 p-4 bg-black/80">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-green-400 hover:text-green-300 text-2xl"
              title="Back to terminal"
            >
              ←
            </button>
            <h1 className="text-xl font-bold text-green-300">ARTICLE_VIEWER v1.0</h1>
          </div>
          <div className="text-sm text-green-500">
            ESC or Q: Back to terminal
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 text-green-300 leading-tight">
              {article.title}
            </h1>
            
            <div className="flex items-center space-x-6 text-sm text-green-500 mb-4">
              <div>
                Created: {new Date(article.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              {article.updatedAt && article.updatedAt !== article.createdAt && (
                <div>
                  Updated: {new Date(article.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              )}
            </div>

            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {article.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-green-900/30 text-green-300 text-xs rounded border border-green-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="border-t border-green-800 pt-6">
              <div 
                className="prose prose-green max-w-none text-green-100"
                dangerouslySetInnerHTML={{ __html: renderContent(article.content) }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-green-800 p-4 bg-black/80">
        <div className="max-w-4xl mx-auto text-center text-sm text-green-500">
          <div className="flex items-center justify-center space-x-4">
            <span>visitor@relaxed-constraints:~/{article.category}/{article.id}</span>
            <span>•</span>
            <span>{article.content.split(' ').length} words</span>
            <span>•</span>
            <span>{article.content.split('\n').length} lines</span>
          </div>
        </div>
      </div>
    </div>
  );
};