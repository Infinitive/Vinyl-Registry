import { Album, ListenLog, WishlistItem, BackupData } from '../types';
import { generateSeedAlbums } from '../data/seedCatalogue';
import { findMatchingResearchRecord, enrichAlbumWithResearch } from '../data/researchMaster';

const DB_NAME = 'vinyl_collection_db';
const DB_VERSION = 2;

interface DBMetadata {
  key: string;
  value: unknown;
}

class VinylDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported in this environment'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Albums store
        if (!db.objectStoreNames.contains('albums')) {
          const albumStore = db.createObjectStore('albums', { keyPath: 'id' });
          albumStore.createIndex('by_artist', 'artist', { unique: false });
          albumStore.createIndex('by_addedAt', 'addedAt', { unique: false });
        }

        // Listen logs store
        if (!db.objectStoreNames.contains('listenLogs')) {
          const logStore = db.createObjectStore('listenLogs', { keyPath: 'id' });
          logStore.createIndex('by_recordId', 'recordId', { unique: false });
          logStore.createIndex('by_listenedAt', 'listenedAt', { unique: false });
        }

        // Wishlist store
        if (!db.objectStoreNames.contains('wishlist')) {
          db.createObjectStore('wishlist', { keyPath: 'id' });
        }

        // Metadata store
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  // Initialize and seed if not already initialized
  async init(): Promise<void> {
    await this.getDB();
    const count = await this.getRecordCount('albums');

    if (count === 0) {
      // First run: seed catalogue with Phase 6.2 research baseline
      const seedAlbums = generateSeedAlbums();
      await this.saveAlbums(seedAlbums);
      await this.setMetadata('seeded_at', new Date().toISOString());
      await this.setMetadata('schema_version', 3);
    } else {
      // Schema version check & non-destructive migration
      const version = (await this.getMetadata('schema_version')) as number | undefined;
      if (!version || version < 2) {
        await this.migrateToPhase6();
      }
      if (!version || version < 3) {
        await this.migrateToPhase62();
        await this.setMetadata('schema_version', 3);
      }
    }
  }

  // Non-destructive Phase 6 Migration: Attaches research baseline to owned records
  async migrateToPhase6(): Promise<void> {
    const albums = await this.getAlbums();
    if (!albums || albums.length === 0) return;

    const db = await this.getDB();
    const hasMetadata = db.objectStoreNames.contains('metadata');
    const storeNames = hasMetadata ? ['albums', 'metadata'] : ['albums'];

    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(storeNames, 'readwrite');
        const albumStore = tx.objectStore('albums');

        for (const album of albums) {
          const research = findMatchingResearchRecord(album);
          if (research) {
            const enriched = enrichAlbumWithResearch(album, research);
            albumStore.put(enriched);
          }
        }

        if (hasMetadata) {
          const metaStore = tx.objectStore('metadata');
          metaStore.put({ key: 'schema_version', value: 2 });
          metaStore.put({ key: 'phase6_migrated_at', value: new Date().toISOString() });
        }

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  // Non-destructive Phase 6.2 Migration: Applies Genre & Style research baseline
  async migrateToPhase62(): Promise<void> {
    const albums = await this.getAlbums();
    if (!albums || albums.length === 0) return;

    const db = await this.getDB();
    const hasMetadata = db.objectStoreNames.contains('metadata');
    const storeNames = hasMetadata ? ['albums', 'metadata'] : ['albums'];

    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(storeNames, 'readwrite');
        const albumStore = tx.objectStore('albums');

        for (const album of albums) {
          const research = findMatchingResearchRecord(album);
          if (research) {
            const enriched = enrichAlbumWithResearch(album, research, true);
            albumStore.put(enriched);
          }
        }

        if (hasMetadata) {
          const metaStore = tx.objectStore('metadata');
          metaStore.put({ key: 'schema_version', value: 3 });
          metaStore.put({ key: 'phase62_migrated_at', value: new Date().toISOString() });
        }

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  private async getRecordCount(storeName: string): Promise<number> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const countReq = store.count();
      countReq.onsuccess = () => resolve(countReq.result);
      countReq.onerror = () => reject(countReq.error);
    });
  }

  // Metadata operations
  async setMetadata(key: string, value: unknown): Promise<void> {
    const db = await this.getDB();
    if (!db.objectStoreNames.contains('metadata')) return;
    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction('metadata', 'readwrite');
        const store = tx.objectStore('metadata');
        const req = store.put({ key, value });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      } catch {
        resolve();
      }
    });
  }

  async getMetadata(key: string): Promise<unknown | undefined> {
    const db = await this.getDB();
    if (!db.objectStoreNames.contains('metadata')) return undefined;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('metadata', 'readonly');
        const store = tx.objectStore('metadata');
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result ? (req.result as DBMetadata).value : undefined);
        req.onerror = () => resolve(undefined);
      } catch {
        resolve(undefined);
      }
    });
  }

  // ALBUMS
  async getAlbums(): Promise<Album[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('albums', 'readonly');
      const store = tx.objectStore('albums');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async getAlbum(id: string): Promise<Album | undefined> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('albums', 'readonly');
      const store = tx.objectStore('albums');
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async saveAlbum(album: Album): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('albums', 'readwrite');
      const store = tx.objectStore('albums');
      const req = store.put(album);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async saveAlbums(albums: Album[]): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('albums', 'readwrite');
      const store = tx.objectStore('albums');
      for (const album of albums) {
        store.put(album);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async deleteAlbum(id: string): Promise<void> {
    const db = await this.getDB();
    // Safely delete album AND cascade delete all associated listen logs to prevent orphaned records
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['albums', 'listenLogs'], 'readwrite');
      const albumStore = tx.objectStore('albums');
      const logStore = tx.objectStore('listenLogs');

      albumStore.delete(id);

      // Find and delete all logs for this recordId
      const index = logStore.index('by_recordId');
      const logReq = index.getAll(IDBKeyRange.only(id));
      logReq.onsuccess = () => {
        const logs = (logReq.result || []) as ListenLog[];
        for (const log of logs) {
          logStore.delete(log.id);
        }
      };
      logReq.onerror = () => reject(logReq.error);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // LISTEN LOGS
  async getListenLogs(): Promise<ListenLog[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('listenLogs', 'readonly');
      const store = tx.objectStore('listenLogs');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async saveListenLog(log: ListenLog): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('listenLogs', 'readwrite');
      const store = tx.objectStore('listenLogs');
      const req = store.put(log);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async deleteListenLog(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('listenLogs', 'readwrite');
      const store = tx.objectStore('listenLogs');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // WISHLIST
  async getWishlist(): Promise<WishlistItem[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('wishlist', 'readonly');
      const store = tx.objectStore('wishlist');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async saveWishlistItem(item: WishlistItem): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('wishlist', 'readwrite');
      const store = tx.objectStore('wishlist');
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async deleteWishlistItem(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('wishlist', 'readwrite');
      const store = tx.objectStore('wishlist');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // BACKUP & EXPORT
  async exportBackup(): Promise<BackupData> {
    const [albums, listenLogs, wishlist] = await Promise.all([
      this.getAlbums(),
      this.getListenLogs(),
      this.getWishlist(),
    ]);

    return {
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      appVersion: '2.0.0',
      albums,
      listenLogs,
      wishlist,
    };
  }

  // VALIDATION FOR IMPORT
  validateBackup(data: unknown): { isValid: boolean; errors: string[]; cleanData?: BackupData } {
    const errors: string[] = [];

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return { isValid: false, errors: ['Backup file must contain a valid JSON object.'] };
    }

    const payload = data as Partial<BackupData>;

    // Validate schemaVersion
    if (typeof payload.schemaVersion !== 'number' || payload.schemaVersion < 1 || !Number.isInteger(payload.schemaVersion)) {
      errors.push('Missing or invalid schemaVersion (expected integer >= 1).');
    }

    // Validate albums array
    if (!Array.isArray(payload.albums)) {
      errors.push("Missing 'albums' array in backup data.");
    } else {
      const albumIds = new Set<string>();

      payload.albums.forEach((album, idx) => {
        if (!album || typeof album !== 'object') {
          errors.push(`Album at index ${idx} is not a valid object.`);
          return;
        }

        if (!album.id || typeof album.id !== 'string' || !album.id.trim()) {
          errors.push(`Album at index ${idx} is missing a valid 'id' identifier.`);
        } else {
          albumIds.add(album.id);
        }

        if (!album.artist || typeof album.artist !== 'string' || !album.artist.trim()) {
          errors.push(`Album at index ${idx} (${album.id || 'unknown ID'}) is missing required field 'artist'.`);
        }

        if (!album.title || typeof album.title !== 'string' || !album.title.trim()) {
          errors.push(`Album at index ${idx} (${album.id || 'unknown ID'}) is missing required field 'title'.`);
        }

        if (album.personalRating !== undefined && album.personalRating !== null) {
          if (typeof album.personalRating !== 'number' || album.personalRating < 0 || album.personalRating > 5) {
            errors.push(`Album "${album.title || idx}" has invalid personalRating (expected 0 to 5).`);
          }
        }
      });

      // Validate listen logs if present
      if (payload.listenLogs !== undefined) {
        if (!Array.isArray(payload.listenLogs)) {
          errors.push("'listenLogs' must be an array when provided.");
        } else {
          payload.listenLogs.forEach((log, idx) => {
            if (!log || typeof log !== 'object') {
              errors.push(`Listen log at index ${idx} is not a valid object.`);
              return;
            }

            if (!log.id || typeof log.id !== 'string' || !log.id.trim()) {
              errors.push(`Listen log at index ${idx} is missing a valid 'id'.`);
            }

            if (!log.recordId || typeof log.recordId !== 'string' || !log.recordId.trim()) {
              errors.push(`Listen log at index ${idx} is missing a valid 'recordId'.`);
            } else if (!albumIds.has(log.recordId)) {
              // Warn / flag orphaned log references
              errors.push(`Listen log "${log.id || idx}" references recordId "${log.recordId}" which does not exist in the albums list.`);
            }

            if (!log.listenedAt || typeof log.listenedAt !== 'string') {
              errors.push(`Listen log at index ${idx} is missing a valid 'listenedAt' timestamp.`);
            }
          });
        }
      }

      // Validate wishlist if present
      if (payload.wishlist !== undefined) {
        if (!Array.isArray(payload.wishlist)) {
          errors.push("'wishlist' must be an array when provided.");
        } else {
          payload.wishlist.forEach((item, idx) => {
            if (!item || typeof item !== 'object') {
              errors.push(`Wishlist item at index ${idx} is not a valid object.`);
              return;
            }

            if (!item.id || typeof item.id !== 'string' || !item.id.trim()) {
              errors.push(`Wishlist item at index ${idx} is missing a valid 'id'.`);
            }

            if (!item.artist || typeof item.artist !== 'string' || !item.artist.trim()) {
              errors.push(`Wishlist item at index ${idx} is missing required field 'artist'.`);
            }

            if (!item.title || typeof item.title !== 'string' || !item.title.trim()) {
              errors.push(`Wishlist item at index ${idx} is missing required field 'title'.`);
            }
          });
        }
      }
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    // Sanitize and return normalized clean data
    const cleanAlbums: Album[] = (payload.albums || []).map((a) => ({
      ...a,
      id: a.id.trim(),
      artist: a.artist.trim(),
      title: a.title.trim(),
      addedAt: a.addedAt || new Date().toISOString(),
      updatedAt: a.updatedAt || a.addedAt || new Date().toISOString(),
    }));

    const cleanLogs: ListenLog[] = (payload.listenLogs || []).map((l) => ({
      ...l,
      id: l.id.trim(),
      recordId: l.recordId.trim(),
      listenedAt: l.listenedAt || new Date().toISOString(),
    }));

    const cleanWishlist: WishlistItem[] = (payload.wishlist || []).map((w) => ({
      ...w,
      id: w.id.trim(),
      artist: w.artist.trim(),
      title: w.title.trim(),
      addedAt: w.addedAt || new Date().toISOString(),
      updatedAt: w.updatedAt || w.addedAt || new Date().toISOString(),
    }));

    return {
      isValid: true,
      errors: [],
      cleanData: {
        schemaVersion: payload.schemaVersion || 1,
        exportedAt: payload.exportedAt || new Date().toISOString(),
        appVersion: payload.appVersion || '1.0.0',
        albums: cleanAlbums,
        listenLogs: cleanLogs,
        wishlist: cleanWishlist,
        settings: payload.settings,
      },
    };
  }

  // IMPORT WITH TRANSACTIONAL INTEGRITY
  async importBackup(
    data: unknown,
    mode: 'replace' | 'merge' = 'replace'
  ): Promise<{ importedAlbums: number; importedLogs: number; importedWishlist: number }> {
    // 1. Rigorous pre-validation before any database mutation
    const validation = this.validateBackup(data);
    if (!validation.isValid || !validation.cleanData) {
      throw new Error(`Validation failed:\n• ${validation.errors.join('\n• ')}`);
    }

    const { cleanData } = validation;
    const db = await this.getDB();

    return new Promise((resolve, reject) => {
      // 2. Transactional replacement where IndexedDB permits
      const hasMetadata = db.objectStoreNames.contains('metadata');
      const stores = hasMetadata
        ? ['albums', 'listenLogs', 'wishlist', 'metadata']
        : ['albums', 'listenLogs', 'wishlist'];

      const tx = db.transaction(stores, 'readwrite');
      const albumStore = tx.objectStore('albums');
      const logStore = tx.objectStore('listenLogs');
      const wishlistStore = tx.objectStore('wishlist');

      if (mode === 'replace') {
        albumStore.clear();
        logStore.clear();
        wishlistStore.clear();
      }

      let albumCount = 0;
      for (const album of cleanData.albums) {
        albumStore.put(album);
        albumCount++;
      }

      let logCount = 0;
      for (const log of cleanData.listenLogs) {
        logStore.put(log);
        logCount++;
      }

      let wishlistCount = 0;
      for (const item of cleanData.wishlist || []) {
        wishlistStore.put(item);
        wishlistCount++;
      }

      // Update metadata if store exists
      if (hasMetadata) {
        const metadataStore = tx.objectStore('metadata');
        metadataStore.put({ key: 'last_imported_at', value: new Date().toISOString() });
        metadataStore.put({ key: 'schema_version', value: cleanData.schemaVersion });
      }

      tx.oncomplete = () => {
        resolve({
          importedAlbums: albumCount,
          importedLogs: logCount,
          importedWishlist: wishlistCount,
        });
      };

      tx.onerror = () => reject(tx.error);
    });
  }

  // RESET TO INITIAL SEED
  async resetToSeed(): Promise<Album[]> {
    const db = await this.getDB();
    const seedAlbums = generateSeedAlbums();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(['albums', 'listenLogs', 'wishlist'], 'readwrite');
      tx.objectStore('albums').clear();
      tx.objectStore('listenLogs').clear();
      tx.objectStore('wishlist').clear();

      const albumStore = tx.objectStore('albums');
      for (const album of seedAlbums) {
        albumStore.put(album);
      }

      tx.oncomplete = () => resolve(seedAlbums);
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const dbService = new VinylDatabase();
