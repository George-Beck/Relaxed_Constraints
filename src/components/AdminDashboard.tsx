import React, { useState, useEffect } from 'react';
import { Article, ResearchCategory } from '../types/Article';
import { useAuth } from '../contexts/AuthContext';
import { stocksApi, indicatorsApi, booksApi, articlesApi } from '../services/api';

interface AdminDashboardProps {
  categories: ResearchCategory[];
  onBack: () => void;
  onArticleAdded: () => void;
  onArticleUpdated: (article: Article) => void;
  onArticleDeleted: () => void;
}

interface EconomicIndicator {
  id: number;
  name: string;
  value: string;
  change: string;
  changePercent: string;
  lastUpdated: string;
}

interface Stock {
  id: number;
  symbol: string;
  name: string;
  sector: string;
  price: string;
  change: string;
  changePercent: string;
  coverage: 'bullish' | 'bearish' | 'neutral';
  lastUpdated: string;
  notes: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  year: string;
  category: string;
  status: 'read' | 'reading' | 'to-read';
  rating?: number;
  description: string;
  coverImage?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  categories,
  onBack,
  onArticleAdded,
  onArticleUpdated,
  onArticleDeleted
}) => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'articles' | 'indicators' | 'stocks' | 'bookshelf'>('articles');
  
  // Article management state
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [articleForm, setArticleForm] = useState({
    title: '',
    content: '',
    category: '',
    tags: ''
  });

  // Economic indicators state
  const [indicators, setIndicators] = useState<EconomicIndicator[]>([]);

  // Stock coverage state
  const [stocks, setStocks] = useState<Stock[]>([]);

  // Bookshelf state
  const [books, setBooks] = useState<Book[]>([]);

  // Book management state
  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    year: '',
    category: '',
    status: 'to-read' as 'read' | 'reading' | 'to-read',
    rating: '',
    description: '',
    coverImage: ''
  });

  // Load data from APIs
  const loadData = async () => {
    try {
      // Load indicators
      const indicatorsData = await indicatorsApi.getAll();
      const transformedIndicators = indicatorsData.map((indicator: any) => ({
        id: indicator.id, // Keep as number to match stocks
        name: indicator.name,
        value: `${indicator.value}${indicator.unit}`,
        change: '+0.1%',
        changePercent: '+2.5%',
        lastUpdated: indicator.date || new Date().toISOString().split('T')[0]
      }));
      setIndicators(transformedIndicators);
      
      // Load stocks
      const stocksData = await stocksApi.getAll();
      const transformedStocks = stocksData.map((stock: any) => ({
        id: stock.id, // Add the ID field
        symbol: stock.symbol,
        name: stock.company_name,
        sector: 'Technology',
        price: `$${stock.current_price}`,
        change: stock.current_price > stock.target_price ? '-$1.00' : '+$1.00',
        changePercent: stock.current_price > stock.target_price ? '-0.5%' : '+0.5%',
        coverage: stock.rating === 'BUY' ? 'bullish' : stock.rating === 'SELL' ? 'bearish' : 'neutral',
        lastUpdated: stock.updated_at ? stock.updated_at.split(' ')[0] : new Date().toISOString().split('T')[0],
        notes: stock.notes || ''
      }));
      setStocks(transformedStocks);
      
      // Load books
      const booksData = await booksApi.getAll();
      const transformedBooks = booksData.map((book: any) => ({
        id: book.id.toString(),
        title: book.title,
        author: book.author,
        year: book.year || '2024',
        category: book.category || 'Finance',
        status: book.status || 'to-read',
        rating: book.rating,
        description: book.description || '',
        coverImage: book.cover_image // Map cover_image to coverImage
      }));
      setBooks(transformedBooks);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleArticleSubmit = async () => {
    if (!articleForm.title.trim() || !articleForm.content.trim() || !articleForm.category) {
      alert('Please fill in title, content, and select a category.');
      return;
    }

    const article: Article = {
      id: editingArticle?.id || `article_${Date.now()}`,
      title: articleForm.title.trim(),
      content: articleForm.content.trim(),
      category: articleForm.category,
      date: editingArticle?.date || new Date().toISOString().split('T')[0],
      tags: articleForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    try {
      if (editingArticle) {
        await articlesApi.update(article.id, article);
        if (onArticleUpdated) onArticleUpdated(article);
      } else {
        await articlesApi.create(article);
        if (onArticleAdded) onArticleAdded();
      }

      setArticleForm({ title: '', content: '', category: '', tags: '' });
      setShowArticleForm(false);
      setEditingArticle(null);
    } catch (error) {
      console.error('Failed to save article:', error);
      alert('Failed to save article. Please try again.');
    }
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setArticleForm({
      title: article.title,
      content: article.content,
      category: article.category,
      tags: article.tags?.join(', ') || ''
    });
    setShowArticleForm(true);
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await articlesApi.delete(articleId);
        if (onArticleDeleted) onArticleDeleted();
      } catch (error) {
        console.error('Failed to delete article:', error);
        // If it's a 404, the article doesn't exist, so just refresh the data
        if (error instanceof Error && error.message.includes('404')) {
          alert('Article not found. Refreshing data...');
          if (onArticleDeleted) onArticleDeleted();
        } else {
          alert('Failed to delete article. Please try again.');
        }
      }
    }
  };

  const handleBookSubmit = async () => {
    if (!bookForm.title?.trim() || !bookForm.author?.trim()) {
      alert('Please fill in title and author.');
      return;
    }

    // Transform to backend format
    const backendBook = {
      title: bookForm.title?.trim() || '',
      author: bookForm.author?.trim() || '',
      year: bookForm.year?.trim() || '',
      category: bookForm.category?.trim() || '',
      status: bookForm.status,
      rating: bookForm.rating ? parseInt(bookForm.rating) : undefined,
      description: bookForm.description?.trim() || '',
      cover_image: bookForm.coverImage?.trim() || undefined // Map coverImage to cover_image for backend
    };

    try {
      if (editingBook) {
        await booksApi.update(parseInt(editingBook.id), backendBook);
      } else {
        await booksApi.create(backendBook);
      }
      
      // Reload data from API
      await loadData();
      
      setBookForm({ title: '', author: '', year: '', category: '', status: 'to-read', rating: '', description: '', coverImage: '' });
      setShowBookForm(false);
      setEditingBook(null);
    } catch (error) {
      console.error('Failed to save book:', error);
      alert('Failed to save book. Please try again.');
    }
  };

  const handleEditBook = (book: Book) => {
    setEditingBook(book);
    setBookForm({
      title: book.title,
      author: book.author,
      year: book.year,
      category: book.category,
      status: book.status,
      rating: book.rating?.toString() || '',
      description: book.description,
      coverImage: book.coverImage || ''
    });
    setShowBookForm(true);
  };

  const handleDeleteBook = async (bookId: string) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await booksApi.delete(parseInt(bookId));
        // Reload data from API
        await loadData();
      } catch (error) {
        console.error('Failed to delete book:', error);
        alert('Failed to delete book. Please try again.');
      }
    }
  };

  // Stock management handlers
  const [editingStock, setEditingStock] = useState<any>(null);
  const [stockForm, setStockForm] = useState({
    symbol: '',
    name: '',
    price: '',
    coverage: 'neutral' as 'bullish' | 'bearish' | 'neutral',
    notes: ''
  });

  const handleEditStock = (stock: any) => {
    setEditingStock(stock);
    setStockForm({
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price.replace('$', ''),
      coverage: stock.coverage,
      notes: stock.notes
    });
  };

  const handleStockSubmit = async () => {
    if (!stockForm.symbol.trim() || !stockForm.name.trim()) {
      alert('Please fill in symbol and company name.');
      return;
    }

    try {
      const backendStock = {
        company_name: stockForm.name.trim(),
        current_price: parseFloat(stockForm.price) || 0,
        target_price: 200, // Default target price
        rating: stockForm.coverage === 'bullish' ? 'BUY' : stockForm.coverage === 'bearish' ? 'SELL' : 'HOLD',
        notes: stockForm.notes.trim()
      };

      if (editingStock && editingStock.id) {
        await stocksApi.update(editingStock.id, backendStock);
      } else {
        await stocksApi.create({
          symbol: stockForm.symbol.toUpperCase().trim(),
          ...backendStock
        });
      }
      
      await loadData(); // Reload data from API
      setStockForm({ symbol: '', name: '', price: '', coverage: 'neutral', notes: '' });
      setEditingStock(null);
    } catch (error) {
      console.error('Failed to save stock:', error);
      alert('Failed to save stock. Please try again.');
    }
  };

  const handleDeleteStock = async (stockId: number) => {
    if (window.confirm('Are you sure you want to delete this stock?')) {
      try {
        await stocksApi.delete(stockId);
        await loadData(); // Reload data from API
      } catch (error) {
        console.error('Failed to delete stock:', error);
        alert('Failed to delete stock. Please try again.');
      }
    }
  };

  // Indicator management handlers
  const [editingIndicator, setEditingIndicator] = useState<any>(null);
  const [indicatorForm, setIndicatorForm] = useState({
    name: '',
    value: '',
    unit: '%',
    description: ''
  });

  const handleEditIndicator = (indicator: any) => {
    setEditingIndicator(indicator);
    // Extract numeric value and unit from the display value
    const valueStr = indicator.value;
    const numericValue = valueStr.replace(/[^0-9.-]/g, '');
    const unit = valueStr.replace(/[0-9.-]/g, '');
    
    setIndicatorForm({
      name: indicator.name,
      value: numericValue,
      unit: unit || '%',
      description: indicator.name
    });
  };

  const handleIndicatorSubmit = async () => {
    if (!indicatorForm.name.trim() || !indicatorForm.value.trim()) {
      alert('Please fill in indicator name and value.');
      return;
    }

    try {
      const backendIndicator = {
        name: indicatorForm.name.trim(),
        value: parseFloat(indicatorForm.value),
        unit: indicatorForm.unit,
        date: new Date().toISOString().split('T')[0],
        description: indicatorForm.description.trim() || indicatorForm.name.trim()
      };

      if (editingIndicator && editingIndicator.id) {
        await indicatorsApi.update(editingIndicator.id, backendIndicator);
      } else {
        await indicatorsApi.create(backendIndicator);
      }
      
      await loadData(); // Reload data from API
      setIndicatorForm({ name: '', value: '', unit: '%', description: '' });
      setEditingIndicator(null);
    } catch (error) {
      console.error('Failed to save indicator:', error);
      alert('Failed to save indicator. Please try again.');
    }
  };

  const handleDeleteIndicator = async (indicatorId: number) => {
    if (window.confirm('Are you sure you want to delete this indicator?')) {
      try {
        await indicatorsApi.delete(indicatorId);
        await loadData(); // Reload data from API
      } catch (error) {
        console.error('Failed to delete indicator:', error);
        alert('Failed to delete indicator. Please try again.');
      }
    }
  };

  const renderArticlesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-green-300">Article Management</h2>
        <button
          onClick={() => setShowArticleForm(true)}
          className="px-4 py-2 bg-green-800 hover:bg-green-700 text-green-100 transition-colors"
        >
          + Add Article
        </button>
      </div>

      {/* Article Form */}
      {showArticleForm && (
        <div className="border border-green-800 bg-black/50 p-6 rounded">
          <h3 className="text-lg font-bold text-green-300 mb-4">
            {editingArticle ? 'Edit Article' : 'Create New Article'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-green-400 text-sm mb-2">Title *</label>
              <input
                type="text"
                value={articleForm.title}
                onChange={(e) => setArticleForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-black/50 border border-green-600 text-green-100 px-3 py-2"
                placeholder="Article title..."
              />
            </div>
            <div>
              <label className="block text-green-400 text-sm mb-2">Category *</label>
              <select
                value={articleForm.category}
                onChange={(e) => setArticleForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full bg-black/50 border border-green-600 text-green-100 px-3 py-2"
              >
                <option value="">Select category...</option>
                {categories.map(cat => (
                  <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-green-400 text-sm mb-2">Tags (comma separated)</label>
              <input
                type="text"
                value={articleForm.tags}
                onChange={(e) => setArticleForm(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full bg-black/50 border border-green-600 text-green-100 px-3 py-2"
                placeholder="market analysis, trends, etc."
              />
            </div>
            <div>
              <label className="block text-green-400 text-sm mb-2">Content (Markdown) *</label>
              <textarea
                value={articleForm.content}
                onChange={(e) => setArticleForm(prev => ({ ...prev, content: e.target.value }))}
                className="w-full h-64 bg-black/50 border border-green-600 text-green-100 px-3 py-2 resize-none"
                placeholder="Write your article content here... (Markdown supported)"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleArticleSubmit}
                className="px-4 py-2 bg-green-800 hover:bg-green-700 text-green-100 transition-colors"
              >
                {editingArticle ? 'Update Article' : 'Create Article'}
              </button>
              <button
                onClick={() => {
                  setShowArticleForm(false);
                  setEditingArticle(null);
                  setArticleForm({ title: '', content: '', category: '', tags: '' });
                }}
                className="px-4 py-2 border border-green-600 hover:bg-green-900/30 text-green-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Articles List */}
      <div className="space-y-4">
        {categories.flatMap(cat => cat.articles).map(article => (
          <div key={article.id} className="border border-green-800 bg-black/50 p-4 rounded">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-green-300">{article.title}</h3>
                <div className="text-sm text-green-500">
                  Category: {categories.find(cat => cat.slug === article.category)?.name} • 
                  Published: {new Date(article.date).toLocaleDateString()} • 
                  {article.content.split(' ').length} words
                </div>
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {article.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditArticle(article)}
                  className="px-3 py-1 border border-green-600 hover:bg-green-900/30 text-green-300 text-sm transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteArticle(article.id)}
                  className="px-3 py-1 border border-red-600 hover:bg-red-900/30 text-red-300 text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderIndicatorsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-green-300">Economic Indicators</h2>
        <button 
          onClick={() => setEditingIndicator({})}
          className="px-4 py-2 bg-green-800 hover:bg-green-700 text-green-100 transition-colors"
        >
          + Add Indicator
        </button>
      </div>

      {/* Indicator Form */}
      {editingIndicator && (
        <div className="border border-green-800 bg-black/50 p-6 rounded">
          <h3 className="text-lg font-bold text-green-300 mb-4">
            {editingIndicator && editingIndicator.id ? 'Edit Indicator' : 'Add New Indicator'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-green-400 text-sm mb-2">Indicator Name *</label>
              <input
                type="text"
                value={indicatorForm.name}
                onChange={(e) => setIndicatorForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-black/50 border border-green-600 text-green-100 px-3 py-2"
                placeholder="e.g., GDP Growth Rate"
              />
            </div>
            <div>
              <label className="block text-green-400 text-sm mb-2">Value *</label>
              <input
                type="number"
                step="0.1"
                value={indicatorForm.value}
                onChange={(e) => setIndicatorForm(prev => ({ ...prev, value: e.target.value }))}
                className="w-full bg-black/50 border border-green-600 text-green-100 px-3 py-2"
                placeholder="e.g., 3.2"
              />
            </div>
            <div>
              <label className="block text-green-400 text-sm mb-2">Unit</label>
              <select
                value={indicatorForm.unit}
                onChange={(e) => setIndicatorForm(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full bg-black/50 border border-green-600 text-green-100 px-3 py-2"
              >
                <option value="%">%</option>
                <option value="$">$</option>
                <option value="M">M</option>
                <option value="B">B</option>
                <option value="K">K</option>
              </select>
            </div>
            <div>
              <label className="block text-green-400 text-sm mb-2">Description</label>
              <input
                type="text"
                value={indicatorForm.description}
                onChange={(e) => setIndicatorForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-black/50 border border-green-600 text-green-100 px-3 py-2"
                placeholder="Brief description"
              />
            </div>
          </div>
          <div className="mt-4 flex space-x-2">
            <button
              onClick={handleIndicatorSubmit}
              className="px-4 py-2 bg-green-800 hover:bg-green-700 text-green-100 transition-colors"
            >
              {editingIndicator && editingIndicator.id ? 'Update Indicator' : 'Add Indicator'}
            </button>
            <button
              onClick={() => {
                setEditingIndicator(null);
                setIndicatorForm({ name: '', value: '', unit: '%', description: '' });
              }}
              className="px-4 py-2 border border-green-600 hover:bg-green-900/30 text-green-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      <div className="border border-green-800 bg-black/50 overflow-hidden rounded">
        <table className="w-full">
          <thead className="bg-green-900/20">
            <tr>
              <th className="px-4 py-3 text-left text-green-300 font-bold">Indicator</th>
              <th className="px-4 py-3 text-left text-green-300 font-bold">Value</th>
              <th className="px-4 py-3 text-left text-green-300 font-bold">Change</th>
              <th className="px-4 py-3 text-left text-green-300 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {indicators.map(indicator => (
              <tr key={indicator.id} className="border-t border-green-800 hover:bg-green-900/10">
                <td className="px-4 py-3 text-green-200">{indicator.name}</td>
                <td className="px-4 py-3 text-green-200 font-mono">{indicator.value}</td>
                <td className="px-4 py-3 text-green-200 font-mono">
                  <span className={indicator.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}>
                    {indicator.change} ({indicator.changePercent})
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => handleEditIndicator(indicator)}
                      className="px-2 py-1 border border-green-600 hover:bg-green-900/30 text-green-300 text-xs transition-colors"
                    >
                      Edit
                    </button>
        <button
          onClick={() => handleDeleteIndicator(indicator.id)}
          className="px-2 py-1 border border-red-600 hover:bg-red-900/30 text-red-300 text-xs transition-colors"
        >
          Delete
        </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStocksTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-green-300">Stock Coverage</h2>
        <button 
          onClick={() => setEditingStock({})}
          className="px-4 py-2 bg-green-800 hover:bg-green-700 text-green-100 transition-colors"
        >
          + Add Stock
        </button>
      </div>

      {/* Stock Form */}
      {editingStock && (
        <div className="border border-green-800 bg-black/50 p-6 rounded">
          <h3 className="text-lg font-bold text-green-300 mb-4">
            {editingStock && editingStock.id ? 'Edit Stock' : 'Add New Stock'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-green-400 text-sm mb-2">Symbol *</label>
              <input
                type="text"
                value={stockForm.symbol}
                onChange={(e) => setStockForm(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                className="w-full bg-black/50 border border-green-600 text-green-100 px-3 py-2"
                placeholder="e.g., AAPL"
                disabled={!!editingStock.id} // Disable symbol editing for existing stocks
              />
            </div>
            <div>
              <label className="block text-green-400 text-sm mb-2">Company Name *</label>
              <input
                type="text"
                value={stockForm.name}
                onChange={(e) => setStockForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-black/50 border border-green-600 text-green-100 px-3 py-2"
                placeholder="e.g., Apple Inc."
              />
            </div>
            <div>
              <label className="block text-green-400 text-sm mb-2">Current Price</label>
              <input
                type="number"
                step="0.01"
                value={stockForm.price}
                onChange={(e) => setStockForm(prev => ({ ...prev, price: e.target.value }))}
                className="w-full bg-black/50 border border-green-600 text-green-100 px-3 py-2"
                placeholder="e.g., 175.50"
              />
            </div>
            <div>
              <label className="block text-green-400 text-sm mb-2">Coverage</label>
              <select
                value={stockForm.coverage}
                onChange={(e) => setStockForm(prev => ({ ...prev, coverage: e.target.value as 'bullish' | 'bearish' | 'neutral' }))}
                className="w-full bg-black/50 border border-green-600 text-green-100 px-3 py-2"
              >
                <option value="neutral">Neutral</option>
                <option value="bullish">Bullish</option>
                <option value="bearish">Bearish</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-green-400 text-sm mb-2">Notes</label>
              <textarea
                value={stockForm.notes}
                onChange={(e) => setStockForm(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full bg-black/50 border border-green-600 text-green-100 px-3 py-2 h-20 resize-none"
                placeholder="Analysis notes..."
              />
            </div>
          </div>
          <div className="mt-4 flex space-x-2">
            <button
              onClick={handleStockSubmit}
              className="px-4 py-2 bg-green-800 hover:bg-green-700 text-green-100 transition-colors"
            >
              {editingStock && editingStock.id ? 'Update Stock' : 'Add Stock'}
            </button>
            <button
              onClick={() => {
                setEditingStock(null);
                setStockForm({ symbol: '', name: '', price: '', coverage: 'neutral', notes: '' });
              }}
              className="px-4 py-2 border border-green-600 hover:bg-green-900/30 text-green-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      <div className="border border-green-800 bg-black/50 overflow-hidden rounded">
        <table className="w-full">
          <thead className="bg-green-900/20">
            <tr>
              <th className="px-4 py-3 text-left text-green-300 font-bold">Symbol</th>
              <th className="px-4 py-3 text-left text-green-300 font-bold">Company</th>
              <th className="px-4 py-3 text-left text-green-300 font-bold">Price</th>
              <th className="px-4 py-3 text-left text-green-300 font-bold">Coverage</th>
              <th className="px-4 py-3 text-left text-green-300 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map(stock => (
              <tr key={stock.symbol} className="border-t border-green-800 hover:bg-green-900/10">
                <td className="px-4 py-3 text-green-200 font-bold">{stock.symbol}</td>
                <td className="px-4 py-3 text-green-100">{stock.name}</td>
                <td className="px-4 py-3 text-green-200 font-mono">{stock.price}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    stock.coverage === 'bullish' ? 'text-green-400 bg-green-900/30' :
                    stock.coverage === 'bearish' ? 'text-red-400 bg-red-900/30' :
                    'text-yellow-400 bg-yellow-900/30'
                  }`}>
                    {stock.coverage.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => handleEditStock(stock)}
                      className="px-2 py-1 border border-green-600 hover:bg-green-900/30 text-green-300 text-xs transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteStock(stock.id)}
                      className="px-2 py-1 border border-red-600 hover:bg-red-900/30 text-red-300 text-xs transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBookshelfTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-green-300">Virtual Bookshelf</h2>
        <button 
          onClick={() => setShowBookForm(true)}
          className="px-4 py-2 bg-green-800 hover:bg-green-700 text-green-100 transition-colors"
        >
          + Add Book
        </button>
      </div>

      {/* Book Form */}
      {showBookForm && (
        <div className="border border-green-800 bg-black/50 p-6 rounded">
          <h3 className="text-lg font-bold text-green-300 mb-4">
            {editingBook ? 'Edit Book' : 'Add New Book'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-green-400 text-sm mb-2">Title *</label>
              <input
                type="text"
                value={bookForm.title}
                onChange={(e) => setBookForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-black/50 border border-green-600 text-green-100 px-3 py-2"
                placeholder="Book title..."
              />
            </div>
            <div>
              <label className="block text-green-400 text-sm mb-2">Author *</label>
              <input
                type="text"
                value={bookForm.author}
                onChange={(e) => setBookForm(prev => ({ ...prev, author: e.target.value }))}
                className="w-full bg-black/50 border border-green-600 text-green-100 px-3 py-2"
                placeholder="Author name..."
              />
            </div>
            <div>
              <label className="block text-green-400 text-sm mb-2">Year</label>
              <input
                type="text"
                value={bookForm.year}
                onChange={(e) => setBookForm(prev => ({ ...prev, year: e.target.value }))}
                className="w-full bg-black/50 border border-green-600 text-green-100 px-3 py-2"
                placeholder="Publication year..."
              />
            </div>
            <div>
              <label className="block text-green-400 text-sm mb-2">Category</label>
              <input
                type="text"
                value={bookForm.category}
                onChange={(e) => setBookForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full bg-black/50 border border-green-600 text-green-100 px-3 py-2"
                placeholder="Book category..."
              />
            </div>
            <div>
              <label className="block text-green-400 text-sm mb-2">Status</label>
              <select
                value={bookForm.status}
                onChange={(e) => setBookForm(prev => ({ ...prev, status: e.target.value as 'read' | 'reading' | 'to-read' }))}
                className="w-full bg-black/50 border border-green-600 text-green-100 px-3 py-2"
              >
                <option value="to-read">To Read</option>
                <option value="reading">Reading</option>
                <option value="read">Read</option>
              </select>
            </div>
            <div>
              <label className="block text-green-400 text-sm mb-2">Rating (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={bookForm.rating}
                onChange={(e) => setBookForm(prev => ({ ...prev, rating: e.target.value }))}
                className="w-full bg-black/50 border border-green-600 text-green-100 px-3 py-2"
                placeholder="Rating..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-green-400 text-sm mb-2">Description</label>
              <textarea
                value={bookForm.description}
                onChange={(e) => setBookForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-black/50 border border-green-600 text-green-100 px-3 py-2 h-20 resize-none"
                placeholder="Book description..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-green-400 text-sm mb-2">Cover Image URL</label>
              <input
                type="url"
                value={bookForm.coverImage}
                onChange={(e) => setBookForm(prev => ({ ...prev, coverImage: e.target.value }))}
                className="w-full bg-black/50 border border-green-600 text-green-100 px-3 py-2"
                placeholder="https://example.com/book-cover.jpg"
              />
              <div className="text-xs text-green-500 mt-1">
                Paste a URL to a book cover image. You can find book covers on Amazon, Goodreads, or other book sites.
              </div>
            </div>
          </div>
          <div className="mt-4 flex space-x-2">
            <button
              onClick={handleBookSubmit}
              className="px-4 py-2 bg-green-800 hover:bg-green-700 text-green-100 transition-colors"
            >
              {editingBook ? 'Update Book' : 'Add Book'}
            </button>
            <button
              onClick={() => {
                setShowBookForm(false);
                setEditingBook(null);
                setBookForm({ title: '', author: '', year: '', category: '', status: 'to-read', rating: '', description: '', coverImage: '' });
              }}
              className="px-4 py-2 border border-green-600 hover:bg-green-900/30 text-green-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map(book => (
          <div key={book.id} className="border border-green-800 bg-black/50 p-4 rounded">
            {/* Book Cover Preview */}
            <div className="h-32 bg-gradient-to-br from-green-900/30 to-green-800/20 flex items-center justify-center relative overflow-hidden mb-3 rounded">
              {book.coverImage ? (
                <img 
                  src={book.coverImage} 
                  alt={`${book.title} cover`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                    if (nextElement) {
                      nextElement.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 ${book.coverImage ? 'hidden' : 'flex'}`}>
                <div className="text-center text-gray-400">
                  <div className="text-lg">📚</div>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-green-300 mb-2">{book.title}</h3>
            <div className="text-sm text-green-400 mb-2">by {book.author}</div>
            <div className="text-xs text-green-500 mb-3">
              {book.year} • {book.category}
            </div>
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                book.status === 'read' ? 'text-green-400 bg-green-900/30' :
                book.status === 'reading' ? 'text-yellow-400 bg-yellow-900/30' :
                'text-blue-400 bg-blue-900/30'
              }`}>
                {book.status.toUpperCase()}
              </span>
              <div className="flex space-x-1">
                <button 
                  onClick={() => handleEditBook(book)}
                  className="px-2 py-1 border border-green-600 hover:bg-green-900/30 text-green-300 text-xs transition-colors"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteBook(book.id)}
                  className="px-2 py-1 border border-red-600 hover:bg-red-900/30 text-red-300 text-xs transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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
              onClick={onBack}
              className="text-green-400 hover:text-green-300 text-2xl transition-colors"
              title="Back to main site"
            >
              ←
            </button>
            <div>
              <h1 className="text-2xl font-bold text-green-300">ADMIN DASHBOARD</h1>
              <p className="text-sm text-green-500">Manage all content from one place</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={logout}
              className="px-3 py-1 border border-red-600 hover:bg-red-900/30 text-red-300 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-green-800 bg-black/50">
        <div className="max-w-6xl mx-auto flex space-x-8 px-6">
          {[
            { id: 'articles', label: 'Articles', icon: '📝' },
            { id: 'indicators', label: 'Economic Indicators', icon: '📊' },
            { id: 'stocks', label: 'Stock Coverage', icon: '📈' },
            { id: 'bookshelf', label: 'Bookshelf', icon: '📚' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-green-300 border-b-2 border-green-600'
                  : 'text-green-500 hover:text-green-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6 pb-20">
        {activeTab === 'articles' && renderArticlesTab()}
        {activeTab === 'indicators' && renderIndicatorsTab()}
        {activeTab === 'stocks' && renderStocksTab()}
        {activeTab === 'bookshelf' && renderBookshelfTab()}
      </div>
    </div>
  );
};
