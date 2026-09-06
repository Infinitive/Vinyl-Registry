import React from 'react';
import { Disc, Compass, BarChart2, Bookmark } from 'lucide-react';
import { NavigationTab } from '../types';

interface NavigationProps {
  currentTab: NavigationTab;
  onChangeTab: (tab: NavigationTab) => void;
  wishlistCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onChangeTab,
  wishlistCount = 0,
}) => {
  const tabs = [
    { id: 'library' as const, label: 'Library', icon: Disc },
    { id: 'discover' as const, label: 'Discover', icon: Compass },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart2 },
    { id: 'wishlist' as const, label: 'Wishlist', icon: Bookmark, badge: wishlistCount },
  ];

  return (
    <nav
      id="bottom-navigation"
      aria-label="Main Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#F4F1EA]/95 backdrop-blur-lg border-t border-[#D9D4C7] pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onChangeTab(tab.id)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center w-16 py-1 text-xs transition-colors ${
                isActive ? 'text-[#5D614E] font-semibold' : 'text-[#726E65] hover:text-[#2D2D2A]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-[#5D614E] text-[#FAF8F5] text-[9px] font-bold flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0.5 w-6 h-0.5 rounded-full bg-[#5D614E]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
