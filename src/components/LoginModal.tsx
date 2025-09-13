import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(username, password);
      if (success) {
        onClose();
        setPassword('');
        setUsername('admin');
      } else {
        setError('Invalid username or password');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-black border border-green-800 max-w-md w-full p-6"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* CRT Effect Overlay */}
        <div className="absolute inset-0 pointer-events-none">
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

        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-green-300">ADMIN LOGIN</h2>
            <button
              onClick={onClose}
              className="text-green-400 hover:text-green-300 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-green-400 text-sm mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/50 border border-green-800 text-green-100 px-4 py-2 focus:border-green-600 focus:outline-none"
                placeholder="Username..."
                autoFocus
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-green-400 text-sm mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-green-800 text-green-100 px-4 py-2 focus:border-green-600 focus:outline-none"
                placeholder="Password..."
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-green-600 hover:bg-green-900/30 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-800 hover:bg-green-700 transition-colors disabled:opacity-50"
                disabled={isLoading || !password.trim()}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>

          {/* Instructions */}
          <div className="mt-6 pt-4 border-t border-green-800">
            <div className="text-green-500 text-sm">
              <p className="mb-2"><strong>Admin Access:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Create and edit articles</li>
                <li>Update economic indicators</li>
                <li>Manage stock coverage</li>
                <li>Add books to bookshelf</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
