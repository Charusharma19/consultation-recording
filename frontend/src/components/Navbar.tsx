import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Headphones } from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="glass-panel border-b border-white/5 sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
      <div 
        className="flex items-center gap-3 cursor-pointer select-none"
        onClick={() => onNavigate('dashboard')}
      >
        <div className="bg-indigo-600/20 p-2 rounded-lg border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <Headphones className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            AuraConsult
          </span>
          <span className="text-[10px] block text-slate-500 font-medium tracking-widest uppercase">Recording Manager</span>
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-300 font-medium">{user.username}</span>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-rose-400 transition-colors duration-200 py-1.5 focus:outline-none"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      )}
    </nav>
  );
};
