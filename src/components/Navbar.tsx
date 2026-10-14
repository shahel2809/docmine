import React, { useState } from 'react';
import { BookOpen, Sparkles, Moon, Sun, Palette, Leaf, Compass } from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'library'
  | 'ask'
  | 'notes'
  | 'visual'
  | 'quiz'
  | 'mistakes'
  | 'planner'
  | 'progress'
  | 'settings';

export type AppTheme = 'midnight' | 'light' | 'emerald' | 'sepia';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  pendingMistakesCount: number;
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  pendingMistakesCount,
  theme,
  setTheme
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const navItems: Array<{ id: ActiveTab; label: string; badge?: number }> = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'library', label: 'My Library' },
    { id: 'ask', label: 'Ask DocuMind' },
    { id: 'notes', label: 'Smart Notes' },
    { id: 'visual', label: 'Visual Learning' },
    { id: 'quiz', label: 'Quiz Arena' },
    { id: 'mistakes', label: 'Mistakes Log', badge: pendingMistakesCount > 0 ? pendingMistakesCount : undefined },
    { id: 'planner', label: 'Study Planner' },
    { id: 'progress', label: 'Progress' },
    { id: 'settings', label: 'Settings' }
  ];

  const themes: Array<{ id: AppTheme; label: string; icon: React.ReactNode }> = [
    { id: 'midnight', label: 'Midnight Dark', icon: <Moon className="w-3.5 h-3.5" /> },
    { id: 'light', label: 'Daylight Clean', icon: <Sun className="w-3.5 h-3.5" /> },
    { id: 'emerald', label: 'Emerald Scholar', icon: <Leaf className="w-3.5 h-3.5" /> },
    { id: 'sepia', label: 'Warm Paper', icon: <BookOpen className="w-3.5 h-3.5" /> }
  ];

  const activeThemeObj = themes.find(t => t.id === theme) || themes[0];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 text-left text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold tracking-tight whitespace-nowrap">
              DocuMind
            </span>
          </button>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-6 overflow-x-auto py-1">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`text-sm font-medium whitespace-nowrap transition-colors relative py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded ${
                    isActive
                      ? 'text-indigo-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {item.label}
                    {item.badge !== undefined && (
                      <span className="text-xs text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-mono font-medium">
                        {item.badge}
                      </span>
                    )}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary action + Theme Switcher */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Theme Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                title="Change Study Theme"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
              >
                {activeThemeObj.icon}
                <span className="hidden sm:inline">{activeThemeObj.label}</span>
              </button>

              {showThemeMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 space-y-1 z-50">
                  <div className="px-2 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Study Themes
                  </div>
                  {themes.map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id);
                        setShowThemeMenu(false);
                      }}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left ${
                        theme === t.id
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {t.icon}
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveTab('ask')}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Question</span>
            </button>
          </div>
        </div>

        {/* Mobile horizontal scroll nav */}
        <div className="lg:hidden flex items-center gap-4 overflow-x-auto py-2.5 border-t border-slate-100 no-scrollbar">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`text-xs font-medium whitespace-nowrap px-2.5 py-1 rounded-md transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
                {item.badge !== undefined && ` (${item.badge})`}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
