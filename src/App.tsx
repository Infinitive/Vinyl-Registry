/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Disc3, AlertCircle } from 'lucide-react';
import { useVinylData } from './hooks/useVinylData';
import { NavigationTab, Album } from './types';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { OfflineIndicator } from './components/OfflineIndicator';
import { LibraryView } from './views/LibraryView';
import { DiscoverView } from './views/DiscoverView';
import { AnalyticsView } from './views/AnalyticsView';
import { WishlistView } from './views/WishlistView';
import { RecordDetailModal } from './components/RecordDetailModal';
import { AddEditRecordModal } from './components/AddEditRecordModal';
import { LogListenModal } from './components/LogListenModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const {
    albums,
    listenLogs,
    wishlist,
    albumStats,
    loading,
    error,
    addAlbum,
    updateAlbum,
    deleteAlbum,
    addListenLog,
    deleteListenLog,
    addWishlistItem,
    updateWishlistItem,
    deleteWishlistItem,
    moveWishlistToLibrary,
    exportJSON,
    importJSON,
    resetToCatalogue,
    exportCSV,
  } = useVinylData();

  // Navigation state
  const [currentTab, setCurrentTab] = useState<NavigationTab>('library');

  // Modal / Interaction states
  const [selectedAlbumForDetail, setSelectedAlbumForDetail] = useState<Album | null>(null);
  const [albumToEdit, setAlbumToEdit] = useState<Album | null>(null);
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [albumToLogListen, setAlbumToLogListen] = useState<Album | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F1EA] text-[#2D2D2A] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="relative">
          <Disc3 className="w-12 h-12 text-[#8B8C7A] animate-spin" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="font-serif text-lg font-semibold text-[#2D2D2A]">Opening Vinyl Registry</h2>
          <p className="text-xs text-[#726E65] font-mono">Loading local collection archive...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#F4F1EA] text-[#2D2D2A] flex flex-col items-center justify-center p-6 space-y-4">
        <div className="p-5 rounded-3xl bg-white border border-[#D9D4C7] max-w-md text-center space-y-3 shadow-md">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
          <h2 className="font-serif text-lg font-semibold text-[#2D2D2A]">Database Initialization Error</h2>
          <p className="text-xs text-[#726E65]">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-[#EAE6DC] hover:bg-[#D9D4C7] text-xs font-medium text-[#2D2D2A] border border-[#D9D4C7] transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#2D2D2A] flex flex-col selection:bg-[#D8DCCB] selection:text-[#2D2D2A]">
      {/* Offline Status Pill */}
      <OfflineIndicator />

      {/* Top Application Header */}
      <Header
        collectionCount={albums.length}
        onOpenAdd={() => setIsAddRecordOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-24 sm:pb-28">
        {currentTab === 'library' && (
          <LibraryView
            albums={albums}
            albumStats={albumStats}
            onSelectAlbum={(album) => setSelectedAlbumForDetail(album)}
            onOpenAdd={() => setIsAddRecordOpen(true)}
          />
        )}

        {currentTab === 'discover' && (
          <DiscoverView
            albums={albums}
            listenLogs={listenLogs}
            onSelectAlbum={(album) => setSelectedAlbumForDetail(album)}
            onLogListen={(album) => setAlbumToLogListen(album)}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView
            albums={albums}
            listenLogs={listenLogs}
            onSelectAlbum={(album) => setSelectedAlbumForDetail(album)}
            onDeleteListenLog={deleteListenLog}
            onLogListen={(album) => setAlbumToLogListen(album)}
          />
        )}

        {currentTab === 'wishlist' && (
          <WishlistView
            wishlist={wishlist}
            onAddWishlistItem={addWishlistItem}
            onUpdateWishlistItem={updateWishlistItem}
            onDeleteWishlistItem={deleteWishlistItem}
            onMoveToLibrary={moveWishlistToLibrary}
            onSelectAlbum={(album) => setSelectedAlbumForDetail(album)}
          />
        )}
      </main>

      {/* Persistent Bottom Navigation */}
      <Navigation
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        wishlistCount={wishlist.length}
      />

      {/* MODAL 1: Record Detail */}
      {selectedAlbumForDetail && (
        <RecordDetailModal
          album={selectedAlbumForDetail}
          listenLogs={listenLogs}
          playCount={albumStats.get(selectedAlbumForDetail.id)?.playCount || 0}
          lastPlayed={albumStats.get(selectedAlbumForDetail.id)?.lastPlayed}
          onClose={() => setSelectedAlbumForDetail(null)}
          onEdit={(alb) => {
            setSelectedAlbumForDetail(null);
            setAlbumToEdit(alb);
          }}
          onDelete={async (id) => {
            await deleteAlbum(id);
            setSelectedAlbumForDetail(null);
          }}
          onLogListen={(alb) => setAlbumToLogListen(alb)}
          onDeleteListenLog={deleteListenLog}
          onUpdateRating={async (alb, newRating) => {
            const updated = { ...alb, personalRating: newRating };
            await updateAlbum(updated);
            setSelectedAlbumForDetail(updated);
          }}
        />
      )}

      {/* MODAL 2: Add Record */}
      {isAddRecordOpen && (
        <AddEditRecordModal
          allAlbums={albums}
          onSave={async (newAlbum) => {
            await addAlbum(newAlbum as Omit<Album, 'id' | 'addedAt' | 'updatedAt'>);
          }}
          onClose={() => setIsAddRecordOpen(false)}
        />
      )}

      {/* MODAL 3: Edit Record */}
      {albumToEdit && (
        <AddEditRecordModal
          existingAlbum={albumToEdit}
          allAlbums={albums}
          onSave={async (updated) => {
            await updateAlbum(updated as Album);
            setAlbumToEdit(null);
          }}
          onClose={() => setAlbumToEdit(null)}
        />
      )}

      {/* MODAL 4: Log Listen */}
      {albumToLogListen && (
        <LogListenModal
          album={albumToLogListen}
          onSave={async (logData) => {
            await addListenLog(logData);
            setAlbumToLogListen(null);
          }}
          onClose={() => setAlbumToLogListen(null)}
        />
      )}

      {/* MODAL 5: Settings & Data Management */}
      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
          onExportJSON={exportJSON}
          onImportJSON={importJSON}
          onExportCSV={exportCSV}
          onResetToCatalogue={resetToCatalogue}
          collectionCount={albums.length}
          listenCount={listenLogs.length}
          wishlistCount={wishlist.length}
        />
      )}
    </div>
  );
}
