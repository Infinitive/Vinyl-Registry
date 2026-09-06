import React from 'react';
import { Plus, Settings, Disc3 } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  collectionCount: number;
  onOpenAdd: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  collectionCount,
  onOpenAdd,
  onOpenSettings,
}) => {
  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-850 pt-[env(safe-area-inset-top,0px)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Left: Project title & collection count */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Disc3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-semibold text-zinc-100 tracking-tight leading-none">
              Vinyl Registry
            </h1>
            <p className="text-[11px] font-mono text-zinc-400 leading-none mt-1">
              {collectionCount} {collectionCount === 1 ? 'Record' : 'Records'}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Add Record Button */}
          <button
            id="header-add-record-btn"
            onClick={onOpenAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-600 hover:bg-amber-500 active:scale-95 text-white text-xs font-medium transition shadow-xs"
            title="Add New Record"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Record</span>
          </button>

          {/* Data & Settings Button */}
          <button
            id="header-settings-btn"
            onClick={onOpenSettings}
            className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 rounded-full transition"
            title="Backup, Export & Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
