import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { booksApi } from '../services/api';

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

interface VirtualBookshelfProps {
  onBack: () => void;
}

export const VirtualBookshelf: React.FC<VirtualBookshelfProps> = ({ onBack }) => {
  const { isAuthenticated } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // Load books from API
  const loadBooks = async () => {
    try {
      setLoading(true);
      const booksData = await booksApi.getAll();
      
      // Transform backend data to frontend format
      const transformedBooks = booksData.map((book: any) => ({
        id: book.id.toString(),
        title: book.title,
        author: book.author,
        year: book.year || '2024', // Default year if not provided
        category: book.category || 'Finance', // Default category
        status: book.status || 'to-read',
        rating: book.rating,
        description: book.description || '',
        coverImage: book.cover_image // Map cover_image to coverImage
      }));
      
      setBooks(transformedBooks);
    } catch (error) {
      console.error('Failed to load books:', error);
      // Fallback to empty array if API fails
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [filter, setFilter] = useState<'all' | 'read' | 'reading' | 'to-read'>('all');

  const filteredBooks = books.filter(book => 
    filter === 'all' || book.status === filter
  );


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'read': return '✓';
      case 'reading': return '📖';
      case 'to-read': return '📚';
      default: return '📖';
    }
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-600'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-4">Loading bookshelf...</div>
          <div className="animate-pulse">📚</div>
        </div>
      </div>
    );
  }

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
              title="Back to categories"
            >
              ←
            </button>
            <div>
              <h1 className="text-2xl font-bold text-green-300">VIRTUAL BOOKSHELF</h1>
              <p className="text-sm text-green-500">Financial literature collection</p>
            </div>
          </div>
          <div className="text-sm text-green-500">
            {books.length} books in collection
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6 pb-20">
        {/* Filter Controls */}
        <div className="mb-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 border transition-colors ${
                filter === 'all' 
                  ? 'border-green-600 bg-green-900/30 text-green-300' 
                  : 'border-green-800 text-green-500 hover:border-green-600'
              }`}
            >
              All Books ({books.length})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 border transition-colors ${
                filter === 'read' 
                  ? 'border-green-600 bg-green-900/30 text-green-300' 
                  : 'border-green-800 text-green-500 hover:border-green-600'
              }`}
            >
              Read ({books.filter(b => b.status === 'read').length})
            </button>
            <button
              onClick={() => setFilter('reading')}
              className={`px-4 py-2 border transition-colors ${
                filter === 'reading' 
                  ? 'border-green-600 bg-green-900/30 text-green-300' 
                  : 'border-green-800 text-green-500 hover:border-green-600'
              }`}
            >
              Reading ({books.filter(b => b.status === 'reading').length})
            </button>
            <button
              onClick={() => setFilter('to-read')}
              className={`px-4 py-2 border transition-colors ${
                filter === 'to-read' 
                  ? 'border-green-600 bg-green-900/30 text-green-300' 
                  : 'border-green-800 text-green-500 hover:border-green-600'
              }`}
            >
              To Read ({books.filter(b => b.status === 'to-read').length})
            </button>
          </div>
        </div>

        {/* Books Grid - Clean Dashboard Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              onClick={() => setSelectedBook(book)}
              className="border border-green-800 bg-black/50 hover:bg-green-900/10 transition-all duration-300 cursor-pointer group rounded-lg overflow-hidden"
            >
              {/* Book Cover Preview */}
              <div className="h-48 bg-gradient-to-br from-green-900/30 to-green-800/20 flex items-center justify-center relative overflow-hidden">
                {book.coverImage ? (
                  <img 
                    src={book.coverImage} 
                    alt={`${book.title} cover`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      e.currentTarget.style.display = 'none';
                      const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                      if (nextElement) {
                        nextElement.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                {/* Fallback placeholder */}
                <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 ${book.coverImage ? 'hidden' : 'flex'}`}>
                  <div className="text-center text-gray-400">
                    <div className="text-2xl mb-2">📚</div>
                    <div className="text-xs">No Cover</div>
                  </div>
                </div>
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    book.status === 'read' ? 'text-green-400 bg-green-900/30' :
                    book.status === 'reading' ? 'text-yellow-400 bg-yellow-900/30' :
                    'text-blue-400 bg-blue-900/30'
                  }`}>
                    {getStatusIcon(book.status)} {book.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Book Info */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-green-300 mb-2 group-hover:text-green-200 line-clamp-2">
                  {book.title}
                </h3>
                <div className="text-sm text-green-400 mb-2">by {book.author}</div>
                <div className="text-xs text-green-500 mb-3">
                  {book.year} • {book.category}
                </div>
                
                {/* Rating */}
                {book.rating && (
                  <div className="flex items-center space-x-1 mb-3">
                    {renderStars(book.rating)}
                    <span className="text-green-500 text-xs">({book.rating}/5)</span>
                  </div>
                )}

                {/* Description Preview */}
                <p className="text-green-200 text-sm leading-relaxed line-clamp-3">
                  {book.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-green-500 text-lg mb-2">No books found</div>
            <div className="text-green-600 text-sm">Try adjusting your filter</div>
          </div>
        )}
      </div>

      {/* Book Detail Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-green-800 max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-lg">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-green-300">{selectedBook.title}</h2>
                <button
                  onClick={() => setSelectedBook(null)}
                  className="text-green-400 hover:text-green-300 text-2xl transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Book Details */}
              <div className="space-y-6">
                {/* Book Info Card */}
                <div className="border border-green-800 bg-black/50 p-4 rounded-lg">
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-32 rounded-sm shadow-lg flex-shrink-0 overflow-hidden">
                      {selectedBook.coverImage ? (
                        <img 
                          src={selectedBook.coverImage} 
                          alt={`${selectedBook.title} cover`}
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
                      <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 ${selectedBook.coverImage ? 'hidden' : 'flex'}`}>
                        <div className="text-center text-gray-400">
                          <div className="text-lg">📚</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-green-200 text-xl font-semibold mb-1">{selectedBook.author}</div>
                      <div className="text-green-400 text-sm mb-2">{selectedBook.year}</div>
                      <div className="text-green-500 text-sm mb-3">{selectedBook.category}</div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          selectedBook.status === 'read' ? 'text-green-400 bg-green-900/30' :
                          selectedBook.status === 'reading' ? 'text-yellow-400 bg-yellow-900/30' :
                          'text-blue-400 bg-blue-900/30'
                        }`}>
                          {getStatusIcon(selectedBook.status)} {selectedBook.status.replace('-', ' ').toUpperCase()}
                        </span>
                        {selectedBook.rating && (
                          <div className="flex items-center space-x-1">
                            {renderStars(selectedBook.rating)}
                            <span className="text-green-500 text-sm">({selectedBook.rating}/5)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="border border-green-800 bg-black/50 p-4 rounded-lg">
                  <h3 className="text-lg font-bold text-green-300 mb-3">Description</h3>
                  <p className="text-green-200 leading-relaxed">{selectedBook.description}</p>
                </div>

                {/* Admin-only features */}
                {isAuthenticated && (
                  <div className="border border-green-800 bg-black/50 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-green-300 mb-3">Admin Actions</h3>
                    <div className="flex space-x-3">
                      <button className="px-4 py-2 bg-green-800 hover:bg-green-700 text-green-100 transition-colors">
                        Edit Book Details
                      </button>
                      <button className="px-4 py-2 border border-green-600 hover:bg-green-900/30 text-green-300 transition-colors">
                        Add Review
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};