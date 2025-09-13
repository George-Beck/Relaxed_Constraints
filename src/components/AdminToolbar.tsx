import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AdminToolbarProps {
  onShowLogin: () => void;
  onShowAdminDashboard?: () => void;
}

export const AdminToolbar: React.FC<AdminToolbarProps> = ({ onShowLogin, onShowAdminDashboard }) => {
  const { isAuthenticated, logout } = useAuth();

  if (isAuthenticated) {
    return (
      <div className="fixed top-4 right-4 z-40">
        <div className="bg-black/80 border border-green-800 px-4 py-2 rounded">
          <div className="flex items-center space-x-3">
            <div className="text-green-400 text-sm">
              <span className="text-green-300">●</span> Admin Mode
            </div>
            {onShowAdminDashboard && (
              <button
                onClick={onShowAdminDashboard}
                className="px-3 py-1 bg-green-800 hover:bg-green-700 text-green-100 text-xs transition-colors"
              >
                Dashboard
              </button>
            )}
            <button
              onClick={logout}
              className="px-3 py-1 bg-red-800 hover:bg-red-700 text-red-100 text-xs transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-40">
      <button
        onClick={onShowLogin}
        className="bg-black/80 border border-green-800 hover:border-green-600 px-4 py-2 rounded text-green-400 hover:text-green-300 text-sm transition-colors"
      >
        Admin Login
      </button>
    </div>
  );
};
