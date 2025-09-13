import React, { useState, useEffect } from 'react';
import { Article, ResearchCategory } from '../types/Article';
import { EconomicIndicators } from './EconomicIndicators';
import { VirtualBookshelf } from './VirtualBookshelf';
import { ArticleCreator } from './ArticleCreator';
import { ArticleEditor } from './ArticleEditor';
import { StockCoverage } from './StockCoverage';
import { useAuth } from '../contexts/AuthContext';
import { articlesApi } from '../services/api';

interface WebViewerProps {
  categories: ResearchCategory[];
  onBackToTerminal: () => void;
  initialCategory?: ResearchCategory | null;
  onArticleAdded?: () => void;
  onArticleUpdated?: (article: Article) => void;
  onArticleDeleted?: (articleId: string) => void;
  onArticleSelect?: (article: Article) => void;
}

export const WebViewer: React.FC<WebViewerProps> = ({ 
  categories, 
  onBackToTerminal, 
  initialCategory, 
  onArticleAdded, 
  onArticleUpdated, 
  onArticleDeleted,
  onArticleSelect 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ResearchCategory | null>(initialCategory || null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [showArticleCreator, setShowArticleCreator] = useState(false);
  const [showArticleEditor, setShowArticleEditor] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const { isAuthenticated } = useAuth();

  // Keep selectedCategory in sync when parent categories prop refreshes (e.g., after CRUD)
  useEffect(() => {
    if (selectedCategory) {
      const updated = categories.find(cat => cat.slug === selectedCategory.slug) || null;
      // Only update if reference or articles changed
      if (updated && updated !== selectedCategory) {
        setSelectedCategory(updated);
      }
    }
  }, [categories]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedArticle) {
          handleBackToCategory();
        } else if (selectedCategory) {
          handleBackToHome();
        } else {
          onBackToTerminal();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedArticle, selectedCategory, onBackToTerminal]);

  // Filter articles based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredArticles(selectedCategory?.articles || []);
    } else {
      const allArticles = categories.flatMap(cat => cat.articles);
      const filtered = allArticles.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredArticles(filtered);
    }
  }, [searchTerm, selectedCategory, categories]);

  const handleCategorySelect = (category: ResearchCategory) => {
    setSelectedCategory(category);
    setSelectedArticle(null);
    setSearchTerm('');
  };

  const handleArticleSelect = (article: Article) => {
    if (onArticleSelect) {
      onArticleSelect(article);
    } else {
      setSelectedArticle(article);
    }
  };

  const handleBackToCategory = () => {
    setSelectedArticle(null);
  };

  const handleBackToHome = () => {
    setSelectedCategory(null);
    setSelectedArticle(null);
    setSearchTerm('');
    setShowArticleCreator(false);
  };

  const handleArticleSaved = async (article: Article) => {
    try {
      // Create the article in the database
      await articlesApi.create(article);
      // Notify parent component to reload articles
      if (onArticleAdded) {
        onArticleAdded();
      }
      setShowArticleCreator(false);
    } catch (error) {
      console.error('Failed to save article:', error);
      alert('Failed to save article. Please try again.');
    }
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setShowArticleEditor(true);
  };

  const handleArticleUpdated = (article: Article) => {
    if (onArticleUpdated) {
      onArticleUpdated(article);
    }
    setShowArticleEditor(false);
    setEditingArticle(null);
    // Refresh the current category
    if (selectedCategory) {
      const updatedCategory = categories.find(cat => cat.slug === selectedCategory.slug);
      if (updatedCategory) {
        setSelectedCategory(updatedCategory);
      }
    }
  };

  const handleArticleDeleted = (articleId: string) => {
    if (onArticleDeleted) {
      onArticleDeleted(articleId);
    }
    setShowArticleEditor(false);
    setEditingArticle(null);
    setSelectedArticle(null);
    // Refresh the current category
    if (selectedCategory) {
      const updatedCategory = categories.find(cat => cat.slug === selectedCategory.slug);
      if (updatedCategory) {
        setSelectedCategory(updatedCategory);
      }
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

  // Home view - Category selection
  if (!selectedCategory && !selectedArticle) {
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
                onClick={onBackToTerminal}
                className="text-green-400 hover:text-green-300 text-2xl transition-colors"
                title="Back to terminal"
              >
                ←
              </button>
              <h1 className="text-2xl font-bold text-green-300">RELAXED CONSTRAINTS</h1>
            </div>
            <div className="text-sm text-green-500">
              Research Portfolio • Web Interface
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto p-6 pb-20">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-4 text-green-300">Research Categories</h2>
            <p className="text-green-400 mb-8">Select a category to browse articles</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category) => (
              <div
                key={category.slug}
                onClick={() => handleCategorySelect(category)}
                className="border border-green-800 hover:border-green-600 bg-black/50 hover:bg-green-900/10 transition-all duration-300 cursor-pointer group"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-green-300 mb-2 group-hover:text-green-200">
                    {category.name}
                  </h3>
                  <p className="text-green-400 mb-4 text-sm">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-green-500">
                    <span>{category.articles.length} articles</span>
                    <span className="group-hover:text-green-400">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show Article Creator
  if (showArticleCreator) {
    return (
      <ArticleCreator
        categories={categories.map(cat => ({ name: cat.name, slug: cat.slug }))}
        onSave={handleArticleSaved}
        onCancel={() => setShowArticleCreator(false)}
      />
    );
  }

  // Show Article Editor
  if (showArticleEditor && editingArticle) {
    return (
      <ArticleEditor
        article={editingArticle}
        categories={categories.map(cat => ({ name: cat.name, slug: cat.slug }))}
        onSave={handleArticleUpdated}
        onCancel={() => setShowArticleEditor(false)}
        onDelete={handleArticleDeleted}
      />
    );
  }

  // Special handling for Bookshelf
  if (selectedCategory?.slug === 'bookshelf') {
    return <VirtualBookshelf onBack={handleBackToHome} />;
  }

  // Category view - Article listing
  if (selectedCategory && !selectedArticle) {
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
                onClick={handleBackToHome}
                className="text-green-400 hover:text-green-300 text-2xl transition-colors"
                title="Back to categories"
              >
                ←
              </button>
              <div>
                <h1 className="text-xl font-bold text-green-300">{selectedCategory.name}</h1>
                <p className="text-sm text-green-500">{selectedCategory.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-green-500">
                {selectedCategory.articles.length} articles
              </div>
              {isAuthenticated && (
                <button
                  onClick={() => setShowArticleCreator(true)}
                  className="px-3 py-1 bg-green-800 hover:bg-green-700 text-green-100 text-sm transition-colors"
                >
                  + Create Article
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Embedded top widgets for category */}
        {(selectedCategory.slug === 'market_research' || selectedCategory.slug === 'economic_indicators') && (
          <div className="max-w-6xl mx-auto p-6 pb-0">
            {selectedCategory.slug === 'market_research' && (
              <div className="mb-8">
                <StockCoverage onBack={handleBackToHome} embedded />
              </div>
            )}
            {selectedCategory.slug === 'economic_indicators' && (
              <div className="mb-8">
                <EconomicIndicators onBack={handleBackToHome} embedded />
              </div>
            )}
          </div>
        )}

        {/* Search Bar */}
        <div className="max-w-6xl mx-auto p-6 pb-20">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/50 border border-green-800 text-green-100 px-4 py-2 focus:border-green-600 focus:outline-none"
            />
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="border border-green-800 hover:border-green-600 bg-black/50 hover:bg-green-900/10 transition-all duration-300 group rounded-lg overflow-hidden"
              >
                <div 
                  className="p-4 cursor-pointer"
                  onClick={(e) => {
                    console.log('Article card clicked:', article.title);
                    e.preventDefault();
                    handleArticleSelect(article);
                  }}
                >
                  <h3 className="text-lg font-bold text-green-300 mb-2 group-hover:text-green-200 line-clamp-2">
                    {article.title}
                  </h3>
                  <div className="text-xs text-green-500 mb-3">
                    {new Date(article.date).toLocaleDateString()}
                  </div>
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {article.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-green-500">
                    {article.content.split(' ').length} words
                  </div>
                </div>
                
                {/* Admin Actions */}
                {isAuthenticated && (
                  <div className="px-4 pb-4 flex space-x-2 border-t border-green-800/50">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEditArticle(article);
                      }}
                      className="px-2 py-1 border border-green-600 hover:bg-green-900/30 text-green-300 text-xs transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (window.confirm(`Are you sure you want to delete "${article.title}"?`)) {
                          handleArticleDeleted(article.id);
                        }
                      }}
                      className="px-2 py-1 border border-red-600 hover:bg-red-900/30 text-red-300 text-xs transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-green-500">No articles found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Article view
  if (selectedArticle) {
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
                onClick={handleBackToCategory}
                className="text-green-400 hover:text-green-300 text-2xl transition-colors"
                title="Back to articles"
              >
                ←
              </button>
              <div>
                <h1 className="text-xl font-bold text-green-300">ARTICLE_VIEWER v2.0</h1>
                <p className="text-sm text-green-500">Web Interface</p>
              </div>
            </div>
            <div className="text-sm text-green-500">
              ESC: Back to articles
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="max-w-4xl mx-auto p-6 pb-20">
          {/* Article Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 text-green-300 leading-tight">
              {selectedArticle.title}
            </h1>
            
            <div className="flex items-center space-x-6 text-sm text-green-500 mb-4">
              <div>
                Published: {new Date(selectedArticle.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div>
                Category: {selectedCategory?.name}
              </div>
            </div>

            {selectedArticle.tags && selectedArticle.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedArticle.tags.map((tag, index) => (
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
                dangerouslySetInnerHTML={{ __html: renderContent(selectedArticle.content) }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-green-800 p-4 bg-black/80">
          <div className="max-w-6xl mx-auto text-center text-sm text-green-500">
            <div className="flex items-center justify-center space-x-4">
              <span>visitor@relaxed-constraints:~/{selectedArticle.category}/{selectedArticle.id}</span>
              <span>•</span>
              <span>{selectedArticle.content.split(' ').length} words</span>
              <span>•</span>
              <span>{selectedArticle.content.split('\n').length} lines</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
