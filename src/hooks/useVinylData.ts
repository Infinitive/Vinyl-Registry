import { useState, useEffect, useCallback, useMemo } from 'react';
import { Album, ListenLog, WishlistItem, BackupData } from '../types';
import { dbService } from '../services/db';
import { computeAlbumStats } from '../engines/analyticsEngine';

export function useVinylData() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [listenLogs, setListenLogs] = useState<ListenLog[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from IndexedDB
  const reloadData = useCallback(async () => {
    try {
      setLoading(true);
      await dbService.init();
      const [fetchedAlbums, fetchedLogs, fetchedWishlist] = await Promise.all([
        dbService.getAlbums(),
        dbService.getListenLogs(),
        dbService.getWishlist(),
      ]);
      setAlbums(fetchedAlbums);
      setListenLogs(fetchedLogs);
      setWishlist(fetchedWishlist);
      setError(null);
    } catch (err) {
      console.error('Failed to load vinyl database:', err);
      setError(err instanceof Error ? err.message : 'Unknown database error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  // Derived album stats map (playCount and lastPlayed)
  const albumStats = useMemo(() => {
    return computeAlbumStats(albums, listenLogs);
  }, [albums, listenLogs]);

  // Album operations
  const addAlbum = useCallback(
    async (albumData: Omit<Album, 'id' | 'addedAt' | 'updatedAt'>): Promise<Album> => {
      const now = new Date().toISOString();
      const id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `rec-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      const newAlbum: Album = {
        ...albumData,
        id,
        addedAt: now,
        updatedAt: now,
      };

      await dbService.saveAlbum(newAlbum);
      setAlbums((prev) => [newAlbum, ...prev]);
      return newAlbum;
    },
    []
  );

  const updateAlbum = useCallback(async (updated: Album): Promise<void> => {
    const toSave: Album = {
      ...updated,
      updatedAt: new Date().toISOString(),
    };
    await dbService.saveAlbum(toSave);
    setAlbums((prev) => prev.map((a) => (a.id === toSave.id ? toSave : a)));
  }, []);

  const deleteAlbum = useCallback(async (id: string): Promise<void> => {
    await dbService.deleteAlbum(id);
    setAlbums((prev) => prev.filter((a) => a.id !== id));
    setListenLogs((prev) => prev.filter((l) => l.recordId !== id));
  }, []);

  // Listen log operations
  const addListenLog = useCallback(
    async (logData: Omit<ListenLog, 'id'>): Promise<ListenLog> => {
      const id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `log-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      const newLog: ListenLog = {
        ...logData,
        id,
      };

      await dbService.saveListenLog(newLog);
      setListenLogs((prev) => [newLog, ...prev]);
      return newLog;
    },
    []
  );

  const deleteListenLog = useCallback(async (id: string): Promise<void> => {
    await dbService.deleteListenLog(id);
    setListenLogs((prev) => prev.filter((l) => l.id !== id));
  }, []);

  // Wishlist operations
  const addWishlistItem = useCallback(
    async (itemData: Omit<WishlistItem, 'id' | 'addedAt'>): Promise<WishlistItem> => {
      const id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `wish-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      const newItem: WishlistItem = {
        ...itemData,
        id,
        addedAt: new Date().toISOString(),
      };

      await dbService.saveWishlistItem(newItem);
      setWishlist((prev) => [newItem, ...prev]);
      return newItem;
    },
    []
  );

  const deleteWishlistItem = useCallback(async (id: string): Promise<void> => {
    await dbService.deleteWishlistItem(id);
    setWishlist((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const updateWishlistItem = useCallback(async (updated: WishlistItem): Promise<void> => {
    const toSave: WishlistItem = {
      ...updated,
      updatedAt: new Date().toISOString(),
    };
    await dbService.saveWishlistItem(toSave);
    setWishlist((prev) => prev.map((w) => (w.id === toSave.id ? toSave : w)));
  }, []);

  const moveWishlistToLibrary = useCallback(
    async (item: WishlistItem, extraDetails?: Partial<Album>): Promise<Album> => {
      const album = await addAlbum({
        artist: item.artist,
        title: item.title,
        edition: item.desiredEdition,
        notes: item.notes,
        purchasePrice: item.targetPrice,
        format: 'LP',
        ...extraDetails,
      });
      await deleteWishlistItem(item.id);
      return album;
    },
    [addAlbum, deleteWishlistItem]
  );

  // Backup & Export
  const exportJSON = useCallback(async (): Promise<string> => {
    const backup = await dbService.exportBackup();
    return JSON.stringify(backup, null, 2);
  }, []);

  const importJSON = useCallback(
    async (jsonString: string, mode: 'replace' | 'merge' = 'replace') => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(jsonString);
      } catch {
        throw new Error('Invalid JSON format: please provide a valid .json file.');
      }
      const result = await dbService.importBackup(parsed, mode);
      await reloadData();
      return result;
    },
    [reloadData]
  );

  const resetToCatalogue = useCallback(async () => {
    const freshAlbums = await dbService.resetToSeed();
    setAlbums(freshAlbums);
    setListenLogs([]);
    setWishlist([]);
  }, []);

  // CSV Export with all specification fields and safe escaping
  const exportCSV = useCallback((type: 'library' | 'listens' | 'wishlist') => {
    if (type === 'library') {
      const headers = [
        'ID',
        'Artist',
        'Title',
        'Release Year',
        'Genre',
        'Style',
        'Format',
        'Edition',
        'Variant',
        'Label',
        'Country',
        'Catalog Number',
        'Physical Identifier',
        'Identifier Type',
        'Barcode',
        'Matrix / Runout',
        'Pressing Plant',
        'Research Status',
        'Confidence',
        'Physical Confirmation',
        'Research Notes',
        'Discogs ID',
        'Personal Rating',
        'Play Count',
        'Last Played',
        'Purchase Price',
        'Purchase Date',
        'Notes',
        'Added Date',
      ];
      const rows = albums.map((a) => {
        const stat = albumStats.get(a.id);
        const genresFormatted = (a.genres || []).join('; ');
        const stylesFormatted = (a.styles || []).join('; ');
        return [
          `"${a.id}"`,
          `"${(a.artist || '').replace(/"/g, '""')}"`,
          `"${(a.title || '').replace(/"/g, '""')}"`,
          a.releaseYear ?? '',
          `"${genresFormatted.replace(/"/g, '""')}"`,
          `"${stylesFormatted.replace(/"/g, '""')}"`,
          `"${(a.format || '').replace(/"/g, '""')}"`,
          `"${(a.edition || '').replace(/"/g, '""')}"`,
          `"${(a.variant || '').replace(/"/g, '""')}"`,
          `"${(a.label || '').replace(/"/g, '""')}"`,
          `"${(a.country || '').replace(/"/g, '""')}"`,
          `"${(a.catalogNumber || '').replace(/"/g, '""')}"`,
          `"${(a.physicalIdentifier || '').replace(/"/g, '""')}"`,
          `"${(a.identifierType || '').replace(/"/g, '""')}"`,
          `"${(a.barcode || '').replace(/"/g, '""')}"`,
          `"${(a.matrixRunout || '').replace(/"/g, '""')}"`,
          `"${(a.pressingPlant || '').replace(/"/g, '""')}"`,
          `"${(a.researchStatus || '').replace(/"/g, '""')}"`,
          `"${(a.confidence || '').replace(/"/g, '""')}"`,
          `"${(a.physicalConfirmation || '').replace(/"/g, '""')}"`,
          `"${(a.researchNotes || '').replace(/"/g, '""')}"`,
          `"${(a.discogsId || '').replace(/"/g, '""')}"`,
          a.personalRating ?? '',
          stat?.playCount || 0,
          stat?.lastPlayed || '',
          a.purchasePrice ?? '',
          `"${(a.purchaseDate || '').replace(/"/g, '""')}"`,
          `"${(a.notes || '').replace(/"/g, '""')}"`,
          a.addedAt || '',
        ].join(',');
      });
      return [headers.join(','), ...rows].join('\n');
    } else if (type === 'listens') {
      const headers = ['Log ID', 'Record ID', 'Artist', 'Title', 'Listened Date', 'Rating', 'Context', 'Note'];
      const albumMap = new Map<string, Album>(albums.map((a) => [a.id, a]));
      const rows = listenLogs.map((l) => {
        const alb = albumMap.get(l.recordId);
        return [
          `"${l.id}"`,
          `"${l.recordId}"`,
          `"${(alb?.artist || '').replace(/"/g, '""')}"`,
          `"${(alb?.title || '').replace(/"/g, '""')}"`,
          l.listenedAt,
          l.rating ?? '',
          `"${(l.context || '').replace(/"/g, '""')}"`,
          `"${(l.note || '').replace(/"/g, '""')}"`,
        ].join(',');
      });
      return [headers.join(','), ...rows].join('\n');
    } else {
      const headers = ['ID', 'Artist', 'Title', 'Desired Edition', 'Target Price', 'Priority', 'Notes', 'Discogs ID', 'Added Date'];
      const rows = wishlist.map((w) => {
        return [
          `"${w.id}"`,
          `"${(w.artist || '').replace(/"/g, '""')}"`,
          `"${(w.title || '').replace(/"/g, '""')}"`,
          `"${(w.desiredEdition || '').replace(/"/g, '""')}"`,
          w.targetPrice ?? '',
          `"${(w.priority || 'medium')}"`,
          `"${(w.notes || '').replace(/"/g, '""')}"`,
          `"${(w.discogsId || '').replace(/"/g, '""')}"`,
          w.addedAt || '',
        ].join(',');
      });
      return [headers.join(','), ...rows].join('\n');
    }
  }, [albums, listenLogs, wishlist, albumStats]);

  return {
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
    reloadData,
  };
}
