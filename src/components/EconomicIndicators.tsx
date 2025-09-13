import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { indicatorsApi } from '../services/api';

interface EconomicIndicator {
  id: string;
  name: string;
  value: string;
  change: string;
  changePercent: string;
  lastUpdated: string;
  trend: 'up' | 'down' | 'neutral';
}

interface EconomicIndicatorsProps {
  onBack: () => void;
  embedded?: boolean;
}

export const EconomicIndicators: React.FC<EconomicIndicatorsProps> = ({ onBack, embedded = false }) => {
  const { isAuthenticated } = useAuth();
  const [indicators, setIndicators] = useState<EconomicIndicator[]>([]);
  const [loading, setLoading] = useState(true);

  // Load indicators from API
  const loadIndicators = async () => {
    try {
      setLoading(true);
      const indicatorsData = await indicatorsApi.getAll();
      
      // Transform backend data to frontend format
      const transformedIndicators = indicatorsData.map((indicator: any) => ({
        id: indicator.id.toString(),
        name: indicator.name,
        value: `${indicator.value}${indicator.unit}`,
        change: '+0.1%', // Mock change since backend doesn't have this
        changePercent: '+2.5%', // Mock change percent
        lastUpdated: indicator.date || new Date().toISOString().split('T')[0],
        trend: 'up' as 'up' | 'down' | 'neutral' // Mock trend
      }));
      
      setIndicators(transformedIndicators);
    } catch (error) {
      console.error('Failed to load indicators:', error);
      setIndicators([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIndicators();
  }, []);

  const [editingIndicator, setEditingIndicator] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editChange, setEditChange] = useState('');
  const [editChangePercent, setEditChangePercent] = useState('');
  
  // Add new indicator form state
  const [newIndicator, setNewIndicator] = useState({
    name: '',
    value: '',
    unit: '%',
    description: ''
  });

  const handleEdit = (indicator: EconomicIndicator) => {
    console.log('🔍 DEBUG: handleEdit called with indicator:', indicator);
    console.log('🔍 DEBUG: isAuthenticated:', isAuthenticated);
    setEditingIndicator(indicator.id);
    setEditValue(indicator.value);
    setEditChange(indicator.change);
    setEditChangePercent(indicator.changePercent);
  };

  const handleSave = async () => {
    console.log('🔍 DEBUG: handleSave called, editingIndicator:', editingIndicator);
    if (!editingIndicator) return;

    try {
      const indicatorToUpdate = indicators.find(indicator => indicator.id === editingIndicator);
      console.log('🔍 DEBUG: indicatorToUpdate found:', indicatorToUpdate);
      if (indicatorToUpdate) {
        // Transform back to backend format for update
        const backendIndicator = {
          name: indicatorToUpdate.name,
          value: parseFloat(editValue.replace(/[^0-9.-]/g, '')), // Extract numeric value
          unit: editValue.replace(/[0-9.-]/g, ''), // Extract unit
          date: new Date().toISOString().split('T')[0],
          description: indicatorToUpdate.name
        };
        console.log('🔍 DEBUG: Sending update request with:', backendIndicator);
        console.log('🔍 DEBUG: Indicator ID:', indicatorToUpdate.id);
        await indicatorsApi.update(parseInt(indicatorToUpdate.id), backendIndicator);
        console.log('🔍 DEBUG: Update successful, reloading indicators...');
        await loadIndicators(); // Reload from API
      }
      
      setEditingIndicator(null);
      setEditValue('');
      setEditChange('');
      setEditChangePercent('');
    } catch (error) {
      console.error('🔍 DEBUG: Failed to save indicator:', error);
      alert('Failed to save indicator. Please try again.');
    }
  };

  const handleCancel = () => {
    setEditingIndicator(null);
    setEditValue('');
    setEditChange('');
    setEditChangePercent('');
  };

  const handleDeleteIndicator = async (indicatorId: string) => {
    console.log('🔍 DEBUG: handleDeleteIndicator called with indicatorId:', indicatorId);
    console.log('🔍 DEBUG: isAuthenticated:', isAuthenticated);
    if (window.confirm('Are you sure you want to delete this indicator?')) {
      try {
        console.log('🔍 DEBUG: Deleting indicator with ID:', indicatorId);
        await indicatorsApi.delete(parseInt(indicatorId));
        console.log('🔍 DEBUG: Delete successful, reloading indicators...');
        await loadIndicators(); // Reload from API
      } catch (error) {
        console.error('🔍 DEBUG: Failed to delete indicator:', error);
        alert('Failed to delete indicator. Please try again.');
      }
    }
  };

  const handleAddIndicator = async () => {
    if (!newIndicator.name.trim() || !newIndicator.value.trim()) {
      alert('Please fill in indicator name and value.');
      return;
    }

    // Transform to backend format
    const backendIndicator = {
      name: newIndicator.name.trim(),
      value: parseFloat(newIndicator.value),
      unit: newIndicator.unit,
      date: new Date().toISOString().split('T')[0],
      description: newIndicator.description.trim() || newIndicator.name.trim()
    };

    try {
      await indicatorsApi.create(backendIndicator);
      await loadIndicators(); // Reload from API
      
      setNewIndicator({
        name: '',
        value: '',
        unit: '%',
        description: ''
      });
    } catch (error) {
      console.error('Failed to add indicator:', error);
      alert('Failed to add indicator. Please try again.');
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      case 'neutral': return '→';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      case 'neutral': return 'text-yellow-400';
    }
  };

  if (loading) {
    return embedded ? (
      <div className="text-green-400 font-mono p-4 border border-green-800 bg-black/50">Loading economic indicators…</div>
    ) : (
      <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-4">Loading economic indicators...</div>
          <div className="animate-pulse">📊</div>
        </div>
      </div>
    );
  }

  if (embedded) {
    return (
      <div className="bg-black text-green-400 font-mono border-b border-green-800">
        <div className="max-w-6xl mx-auto p-6">
          <h2 className="text-xl font-bold mb-4 text-green-300">Key Economic Indicators</h2>
          <div className="border border-green-800 bg-black/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-green-900/20">
                  <tr>
                    <th className="px-4 py-3 text-left text-green-300 font-bold">Indicator</th>
                    <th className="px-4 py-3 text-left text-green-300 font-bold">Current Value</th>
                    <th className="px-4 py-3 text-left text-green-300 font-bold">Change</th>
                    <th className="px-4 py-3 text-left text-green-300 font-bold">% Change</th>
                    <th className="px-4 py-3 text-left text-green-300 font-bold">Trend</th>
                    <th className="px-4 py-3 text-left text-green-300 font-bold">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {indicators.map((indicator) => (
                    <tr key={indicator.id} className="border-t border-green-800 hover:bg-green-900/10">
                      <td className="px-4 py-3 text-green-100 font-medium">{indicator.name}</td>
                      <td className="px-4 py-3 text-green-200">{indicator.value}</td>
                      <td className="px-4 py-3 text-green-200">{indicator.change}</td>
                      <td className="px-4 py-3 text-green-200">{indicator.changePercent}</td>
                      <td className="px-4 py-3"><span className={`${getTrendColor(indicator.trend)} font-bold`}>{getTrendIcon(indicator.trend)}</span></td>
                      <td className="px-4 py-3 text-green-500 text-sm">{indicator.lastUpdated}</td>
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
              <h1 className="text-2xl font-bold text-green-300">ECONOMIC INDICATORS</h1>
              <p className="text-sm text-green-500">Economic data dashboard</p>
            </div>
          </div>
          <div className="text-sm text-green-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6 pb-20">
        {/* Data Table */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-green-300">Key Economic Indicators</h2>
          <div className="border border-green-800 bg-black/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-green-900/20">
                  <tr>
                    <th className="px-4 py-3 text-left text-green-300 font-bold">Indicator</th>
                    <th className="px-4 py-3 text-left text-green-300 font-bold">Current Value</th>
                    <th className="px-4 py-3 text-left text-green-300 font-bold">Change</th>
                    <th className="px-4 py-3 text-left text-green-300 font-bold">% Change</th>
                    <th className="px-4 py-3 text-left text-green-300 font-bold">Trend</th>
                    <th className="px-4 py-3 text-left text-green-300 font-bold">Last Updated</th>
                    <th className="px-4 py-3 text-left text-green-300 font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {indicators.map((indicator) => (
                    <tr key={indicator.id} className="border-t border-green-800 hover:bg-green-900/10">
                      <td className="px-4 py-3 text-green-100 font-medium">
                        {indicator.name}
                      </td>
                      <td className="px-4 py-3 text-green-200">
                        {editingIndicator === indicator.id ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="bg-black/50 border border-green-600 text-green-100 px-2 py-1 w-full"
                          />
                        ) : (
                          indicator.value
                        )}
                      </td>
                      <td className="px-4 py-3 text-green-200">
                        {editingIndicator === indicator.id ? (
                          <input
                            type="text"
                            value={editChange}
                            onChange={(e) => setEditChange(e.target.value)}
                            className="bg-black/50 border border-green-600 text-green-100 px-2 py-1 w-full"
                          />
                        ) : (
                          indicator.change
                        )}
                      </td>
                      <td className="px-4 py-3 text-green-200">
                        {editingIndicator === indicator.id ? (
                          <input
                            type="text"
                            value={editChangePercent}
                            onChange={(e) => setEditChangePercent(e.target.value)}
                            className="bg-black/50 border border-green-600 text-green-100 px-2 py-1 w-full"
                          />
                        ) : (
                          indicator.changePercent
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`${getTrendColor(indicator.trend)} font-bold`}>
                          {getTrendIcon(indicator.trend)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-green-500 text-sm">
                        {indicator.lastUpdated}
                      </td>
                      <td className="px-4 py-3">
                        {(() => {
                          console.log('🔍 DEBUG: Rendering actions for indicator:', indicator.name, 'isAuthenticated:', isAuthenticated, 'editingIndicator:', editingIndicator);
                          return isAuthenticated ? (
                            editingIndicator === indicator.id ? (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    console.log('🔍 DEBUG: Save button clicked for indicator:', indicator.name);
                                    handleSave();
                                  }}
                                  className="px-2 py-1 bg-green-800 hover:bg-green-700 text-green-100 text-xs"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    console.log('🔍 DEBUG: Cancel button clicked for indicator:', indicator.name);
                                    handleCancel();
                                  }}
                                  className="px-2 py-1 border border-green-600 hover:bg-green-900/30 text-green-300 text-xs"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => {
                                    console.log('🔍 DEBUG: Edit button clicked for indicator:', indicator.name);
                                    handleEdit(indicator);
                                  }}
                                  className="px-2 py-1 border border-green-600 hover:bg-green-900/30 text-green-300 text-xs"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    console.log('🔍 DEBUG: Delete button clicked for indicator:', indicator.name);
                                    handleDeleteIndicator(indicator.id);
                                  }}
                                  className="px-2 py-1 border border-red-600 hover:bg-red-900/30 text-red-300 text-xs"
                                >
                                  Delete
                                </button>
                              </div>
                            )
                          ) : (
                            <span className="text-green-600 text-xs">Read Only</span>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add New Indicator */}
        {isAuthenticated && (
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4 text-green-300">Add New Indicator</h3>
            <div className="border border-green-800 bg-black/50 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-green-400 text-sm mb-2">Indicator Name</label>
                <input
                  type="text"
                  placeholder="e.g., Consumer Confidence Index"
                  value={newIndicator.name}
                  onChange={(e) => setNewIndicator({...newIndicator, name: e.target.value})}
                  className="w-full bg-black/50 border border-green-600 text-green-100 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-green-400 text-sm mb-2">Current Value</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 102.5"
                  value={newIndicator.value}
                  onChange={(e) => setNewIndicator({...newIndicator, value: e.target.value})}
                  className="w-full bg-black/50 border border-green-600 text-green-100 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-green-400 text-sm mb-2">Unit</label>
                <select
                  value={newIndicator.unit}
                  onChange={(e) => setNewIndicator({...newIndicator, unit: e.target.value})}
                  className="w-full bg-black/50 border border-green-600 text-green-100 px-3 py-2"
                >
                  <option value="%">%</option>
                  <option value="$">$</option>
                  <option value="index">Index</option>
                  <option value="ratio">Ratio</option>
                </select>
              </div>
              <div>
                <label className="block text-green-400 text-sm mb-2">Description</label>
                <input
                  type="text"
                  placeholder="Optional description"
                  value={newIndicator.description}
                  onChange={(e) => setNewIndicator({...newIndicator, description: e.target.value})}
                  className="w-full bg-black/50 border border-green-600 text-green-100 px-3 py-2"
                />
              </div>
            </div>
            <div className="mt-4">
              <button 
                onClick={handleAddIndicator}
                className="px-4 py-2 bg-green-800 hover:bg-green-700 text-green-100"
              >
                Add Indicator
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Market Commentary */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 text-green-300">Market Commentary</h3>
          <div className="border border-green-800 bg-black/50 p-4">
            <div className="text-green-200 leading-relaxed">
              <p className="mb-4">
                <strong className="text-green-300">Current Market Outlook:</strong> The economic indicators show mixed signals with GDP growth remaining positive while inflation continues to moderate. The Federal Reserve's current stance suggests a cautious approach to further rate adjustments.
              </p>
              <p className="mb-4">
                <strong className="text-green-300">Key Observations:</strong> The dollar index strength indicates continued global demand for USD assets, while oil price volatility reflects ongoing geopolitical tensions and supply chain concerns.
              </p>
              <p>
                <strong className="text-green-300">Risk Factors:</strong> Elevated VIX levels suggest market participants remain cautious about near-term volatility, particularly around central bank policy decisions and economic data releases.
              </p>
            </div>
          </div>
        </div>

        {/* Economic Articles Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-green-300">Economic Analysis Articles</h3>
            {isAuthenticated && (
              <button className="px-3 py-1 bg-green-800 hover:bg-green-700 text-green-100 text-sm transition-colors">
                + Add Article
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-green-800 bg-black/50 p-4 hover:bg-green-900/10 transition-colors cursor-pointer">
              <h4 className="text-green-300 font-bold mb-2">Federal Reserve Policy Implications for 2024</h4>
              <p className="text-green-400 text-sm mb-2">Analysis of current Fed policy stance and implications for markets</p>
              <div className="flex items-center justify-between text-xs text-green-500">
                <span>Jan 20, 2024</span>
                <span>1,247 words</span>
              </div>
            </div>
            <div className="border border-green-800 bg-black/50 p-4 hover:bg-green-900/10 transition-colors cursor-pointer">
              <h4 className="text-green-300 font-bold mb-2">Global Supply Chain Resilience Update</h4>
              <p className="text-green-400 text-sm mb-2">Current state of global supply chains and resilience measures</p>
              <div className="flex items-center justify-between text-xs text-green-500">
                <span>Jan 12, 2024</span>
                <span>1,156 words</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
