export interface Album {
  id: string;
  artist: string;
  title: string;
  releaseYear?: number;
  genres?: string[];
  styles?: string[];
  label?: string;
  country?: string;
  format?: string; // 'LP' | '2xLP' | 'Box Set' | 'Picture Disc' | '7"' | '10"' | '12"' | string
  edition?: string; // 'Limited Edition Picture Disc' | '25th Anniversary Edition' | etc.
  variant?: string; // color / colorway
  packagingExtras?: string[]; // 'Poster', 'Insert', 'Gatefold', 'Booklet', etc.
  discCount?: number;
  rpm?: string; // '33 ⅓' | '45' | '78'
  catalogNumber?: string;
  discogsId?: string;
  coverImage?: string;
  purchasePrice?: number;
  purchaseDate?: string;
  personalRating?: number; // 0 to 5 in 0.5 increments
  notes?: string;
  addedAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface ListenLog {
  id: string;
  recordId: string;
  listenedAt: string; // ISO timestamp
  rating?: number; // 0 to 5 in 0.5 increments
  note?: string;
  context?: string; // 'Speakers' | 'Headphones' | 'Living Room' | etc.
}

export interface WishlistItem {
  id: string;
  artist: string;
  title: string;
  desiredEdition?: string;
  targetPrice?: number;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
  discogsId?: string;
  addedAt: string;
  updatedAt?: string;
}

export interface BackupData {
  schemaVersion: number;
  exportedAt: string;
  appVersion: string;
  albums: Album[];
  listenLogs: ListenLog[];
  wishlist?: WishlistItem[];
  settings?: Record<string, unknown>;
}

export type NavigationTab = 'library' | 'discover' | 'analytics' | 'wishlist';

export type LibraryViewMode = 'grid' | 'compact';

export type SortField =
  | 'artist'
  | 'title'
  | 'releaseYear'
  | 'addedAt'
  | 'rating'
  | 'playCount'
  | 'lastPlayed';

export type SortOrder = 'asc' | 'desc';
