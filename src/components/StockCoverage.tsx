import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { stocksApi } from '../services/api';

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

interface StockCoverageProps {
  onBack: () => void;
  embedded?: boolean;
}

export const StockCoverage: React.FC<StockCoverageProps> = ({ onBack, embedded = false }) => {
  const { isAuthenticated } = useAuth();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  // Load stocks from API
  const loadStocks = async () => {
    try {
      setLoading(true);
      const stocksData = await stocksApi.getAll();
      
      // Transform backend data to frontend format
      const transformedStocks = stocksData.map((stock: any) => ({
        id: stock.id,
        symbol: stock.symbol,
        name: stock.company_name,
        sector: 'Technology', // Default sector since backend doesn't have this
        price: `$${stock.current_price}`,
        change: stock.current_price > stock.target_price ? '-$1.00' : '+$1.00', // Mock change
        changePercent: stock.current_price > stock.target_price ? '-0.5%' : '+0.5%', // Mock change
        coverage: stock.rating === 'BUY' ? 'bullish' : stock.rating === 'SELL' ? 'bearish' : 'neutral',
        lastUpdated: stock.updated_at ? stock.updated_at.split(' ')[0] : new Date().toISOString().split('T')[0],
        notes: stock.notes || ''
      }));
      
      setStocks(transformedStocks);
    } catch (error) {
      console.error('Failed to load stocks:', error);
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStocks();
  }, []);

  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStock, setNewStock] = useState({
    symbol: '',
    name: '',
    sector: '',
    price: '',
    change: '',
    changePercent: '',
    coverage: 'neutral' as 'bullish' | 'bearish' | 'neutral',
    notes: ''
  });

  const handleEditNotes = (stock: Stock) => {
    setEditingStock(stock.symbol);
    setEditNotes(stock.notes);
  };

  const handleSaveNotes = async () => {
    if (!editingStock) return;

    try {
      const stockToUpdate = stocks.find(stock => stock.symbol === editingStock);
      if (stockToUpdate) {
        // Transform back to backend format for update (don't include symbol as it can't be changed)
        const backendStock = {
          company_name: stockToUpdate.name,
          current_price: parseFloat(stockToUpdate.price.replace('$', '')),
          target_price: 200, // Default target price
          rating: stockToUpdate.coverage === 'bullish' ? 'BUY' : stockToUpdate.coverage === 'bearish' ? 'SELL' : 'HOLD',
          notes: editNotes
        };
        await stocksApi.update(stockToUpdate.id, backendStock); // Use the actual stock ID
        await loadStocks(); // Reload from API
      }
      setEditingStock(null);
      setEditNotes('');
    } catch (error) {
      console.error('Failed to save notes:', error);
      alert('Failed to save notes. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingStock(null);
    setEditNotes('');
  };

  const handleAddStock = async () => {
    if (!newStock.symbol.trim() || !newStock.name.trim()) {
      alert('Please fill in symbol and company name.');
      return;
    }

    // Transform to backend format
    const backendStock = {
      symbol: newStock.symbol.toUpperCase().trim(),
      company_name: newStock.name.trim(),
      current_price: parseFloat(newStock.price?.replace('$', '') || '0'),
      target_price: 200, // Default target price
      rating: newStock.coverage === 'bullish' ? 'BUY' : newStock.coverage === 'bearish' ? 'SELL' : 'HOLD',
      notes: newStock.notes.trim()
    };

    try {
      await stocksApi.create(backendStock);
      await loadStocks(); // Reload from API
      
      setNewStock({
        symbol: '',
        name: '',
        sector: '',
        price: '',
        change: '',
        changePercent: '',
        coverage: 'neutral',
        notes: ''
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add stock:', error);
      alert('Failed to add stock. Please try again.');
    }
  };

  const handleDeleteStock = async (symbol: string) => {
    if (window.confirm(`Are you sure you want to remove ${symbol} from coverage?`)) {
      try {
        const stockToDelete = stocks.find(stock => stock.symbol === symbol);
        if (stockToDelete) {
          await stocksApi.delete(stockToDelete.id);
          await loadStocks(); // Reload from API
        }
      } catch (error) {
        console.error('Failed to delete stock:', error);
        alert('Failed to delete stock. Please try again.');
      }
    }
  };

  const getCoverageColor = (coverage: string) => {
    switch (coverage) {
      case 'bullish': return 'text-green-400 bg-green-900/30';
      case 'bearish': return 'text-red-400 bg-red-900/30';
      case 'neutral': return 'text-yellow-400 bg-yellow-900/30';
      default: return 'text-green-300 bg-green-900/20';
    }
  };

  const getCoverageIcon = (coverage: string) => {
    switch (coverage) {
      case 'bullish': return '↗';
      case 'bearish': return '↘';
      case 'neutral': return '→';
      default: return '→';
    }
  };

  if (loading) {
    return embedded ? (
      <div className="text-green-400 font-mono p-4 border border-green-800 bg-black/50">Loading stock coverage…</div>
    ) : (
      <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-4">Loading stock coverage...</div>
          <div className="animate-pulse">📈</div>
        </div>
      </div>
    );
  }

  if (embedded) {
    return (
      <div className="bg-black text-green-400 font-mono border-b border-green-800">
        <div className="max-w-6xl mx-auto p-6">
          <h2 className="text-xl font-bold mb-4 text-green-300">Current Stock Coverage</h2>
          <div className="border border-green-800 bg-black/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-green-900/20">
                  <tr>
                    <th className="px-4 py-3 text-left text-green-300 font-bold">Symbol</th>
                    <th className="px-4 py-3 text-left text-green-300 font-bold">Company</th>
                    <th className="px-4 py-3 text-left text-green-300 font-bold">Price</th>
                    <th className="px-4 py-3 text-left text-green-300 font-bold">Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((stock) => (
                    <tr key={stock.symbol} className="border-t border-green-800 hover:bg-green-900/10">
                      <td className="px-4 py-3 text-green-200 font-bold">{stock.symbol}</td>
                      <td className="px-4 py-3 text-green-100">{stock.name}</td>
                      <td className="px-4 py-3 text-green-200 font-mono">{stock.price}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getCoverageColor(stock.coverage)}`}>
                          {getCoverageIcon(stock.coverage)} {stock.coverage.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
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
              <h1 className="text-2xl font-bold text-green-300">MARKET RESEARCH</h1>
              <p className="text-sm text-green-500">Stock coverage and analysis</p>
            </div>
          </div>
          <div className="text-sm text-green-500">
            {stocks.length} stocks under coverage
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6 pb-20">
        {/* Stock Coverage Table */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-green-300">Current Stock Coverage</h2>
          <div className="border border-green-800 bg-black/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-green-900/20">
                  <tr>
                    <th className="px-4 py-3 text-left text-green-300 font-bold">Symbol</th>
                    <th className="px-4 py-3 text-left text-green-300 font-bold">Company</th>
                    <th className="px-4 py-3 text-left text-green-300 font-bold">Sector</th>
                    <th className="px-4 py-3 text-left text-green-300 font-bold">Price</th>
                    <th className="px-4 py-3 text-left text-green-300 font-bold">Change</th>
                    <th className="px-4 py-3 text-left text-green-300 font-bold">Coverage</th>
                    <th className="px-4 py-3 text-left text-green-300 font-bold">Notes</th>
                    <th className="px-4 py-3 text-left text-green-300 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((stock) => (
                    <tr key={stock.symbol} className="border-t border-green-800 hover:bg-green-900/10">
                      <td className="px-4 py-3 text-green-200 font-bold">
                        {stock.symbol}
                      </td>
                      <td className="px-4 py-3 text-green-100">
                        {stock.name}
                      </td>
                      <td className="px-4 py-3 text-green-300 text-sm">
                        {stock.sector}
                      </td>
                      <td className="px-4 py-3 text-green-200 font-mono">
                        {stock.price}
                      </td>
                      <td className="px-4 py-3 text-green-200 font-mono">
                        <span className={stock.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}>
                          {stock.change} ({stock.changePercent})
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getCoverageColor(stock.coverage)}`}>
                          {getCoverageIcon(stock.coverage)} {stock.coverage.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-green-300 text-sm max-w-xs">
                        {editingStock === stock.symbol ? (
                          <div className="space-y-2">
                            <textarea
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              className="w-full bg-black/50 border border-green-600 text-green-100 px-2 py-1 text-xs resize-none"
                              rows={2}
                            />
                            <div className="flex space-x-1">
                              <button
                                onClick={handleSaveNotes}
                                className="px-2 py-1 bg-green-800 hover:bg-green-700 text-green-100 text-xs"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-2 py-1 border border-green-600 hover:bg-green-900/30 text-green-300 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="truncate" title={stock.notes}>
                            {stock.notes}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isAuthenticated ? (
                          editingStock === stock.symbol ? null : (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleEditNotes(stock)}
                                className="px-2 py-1 border border-green-600 hover:bg-green-900/30 text-green-300 text-xs"
                              >
                                Edit Notes
                              </button>
                              <button
                                onClick={() => handleDeleteStock(stock.symbol)}
                                className="px-2 py-1 border border-red-600 hover:bg-red-900/30 text-red-300 text-xs"
                              >
                                Delete
                              </button>
                            </div>
                          )
                        ) : (
                          <span className="text-green-600 text-xs">Read Only</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add New Stock */}
        {isAuthenticated && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-green-300">Add New Stock Coverage</h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3 py-1 bg-green-800 hover:bg-green-700 text-green-100 text-sm transition-colors"
              >
                {showAddForm ? 'Cancel' : '+ Add Stock'}
              </button>
            </div>
            
            {showAddForm && (
              <div className="border border-green-800 bg-black/50 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-green-400 text-sm mb-2">Symbol *</label>
                    <input
                      type="text"
                      value={newStock.symbol}
                      onChange={(e) => setNewStock(prev => ({ ...prev, symbol: e.target.value }))}
                      placeholder="e.g., META"
                      className="w-full bg-black/50 border border-green-600 text-green-100 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-green-400 text-sm mb-2">Company Name *</label>
                    <input
                      type="text"
                      value={newStock.name}
                      onChange={(e) => setNewStock(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Meta Platforms Inc."
                      className="w-full bg-black/50 border border-green-600 text-green-100 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-green-400 text-sm mb-2">Sector</label>
                    <select 
                      value={newStock.sector}
                      onChange={(e) => setNewStock(prev => ({ ...prev, sector: e.target.value }))}
                      className="w-full bg-black/50 border border-green-600 text-green-100 px-3 py-2"
                    >
                      <option value="">Select sector...</option>
                      <option value="Technology">Technology</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Financials">Financials</option>
                      <option value="Consumer Discretionary">Consumer Discretionary</option>
                      <option value="Consumer Staples">Consumer Staples</option>
                      <option value="Energy">Energy</option>
                      <option value="Materials">Materials</option>
                      <option value="Industrials">Industrials</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Real Estate">Real Estate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-green-400 text-sm mb-2">Current Price</label>
                    <input
                      type="text"
                      value={newStock.price}
                      onChange={(e) => setNewStock(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="e.g., $350.25"
                      className="w-full bg-black/50 border border-green-600 text-green-100 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-green-400 text-sm mb-2">Coverage</label>
                    <select 
                      value={newStock.coverage}
                      onChange={(e) => setNewStock(prev => ({ ...prev, coverage: e.target.value as 'bullish' | 'bearish' | 'neutral' }))}
                      className="w-full bg-black/50 border border-green-600 text-green-100 px-3 py-2"
                    >
                      <option value="bullish">Bullish</option>
                      <option value="neutral">Neutral</option>
                      <option value="bearish">Bearish</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-green-400 text-sm mb-2">Initial Notes</label>
                    <input
                      type="text"
                      value={newStock.notes}
                      onChange={(e) => setNewStock(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Brief analysis..."
                      className="w-full bg-black/50 border border-green-600 text-green-100 px-3 py-2"
                    />
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button 
                    onClick={handleAddStock}
                    className="px-4 py-2 bg-green-800 hover:bg-green-700 text-green-100"
                  >
                    Add Stock Coverage
                  </button>
                  <button 
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-green-600 hover:bg-green-900/30 text-green-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}


        {/* Research Articles Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 text-green-300">Recent Research Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-green-800 bg-black/50 p-4 hover:bg-green-900/10 transition-colors cursor-pointer">
              <h4 className="text-green-300 font-bold mb-2">Tech Sector Valuation Metrics in 2024</h4>
              <p className="text-green-400 text-sm mb-2">Analysis of current valuation levels across major technology companies</p>
              <div className="text-green-500 text-xs">Published: Jan 15, 2024</div>
            </div>
            <div className="border border-green-800 bg-black/50 p-4 hover:bg-green-900/10 transition-colors cursor-pointer">
              <h4 className="text-green-300 font-bold mb-2">Dividend Aristocrats Performance Review</h4>
              <p className="text-green-400 text-sm mb-2">Review of S&P 500 Dividend Aristocrats performance and outlook</p>
              <div className="text-green-500 text-xs">Published: Jan 8, 2024</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
