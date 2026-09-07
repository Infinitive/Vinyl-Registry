import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Plus,
  X,
  ArrowUpDown,
  Sparkles,
  Disc3,
} from 'lucide-react';
import { Album, LibraryViewMode, SortField, SortOrder } from '../types';
import { AlbumCard } from '../components/AlbumCard';

interface LibraryViewProps {
  albums: Album[];
  albumStats: Map<string, { playCount: number; lastPlayed?: string }>;
  onSelectAlbum: (album: Album) => void;
  onOpenAdd: () => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  albums,
  albumStats,
  onSelectAlbum,
  onOpenAdd,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<LibraryViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('artist');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Filter states
  const [statusFilter, setStatusFilter] = useState<'all' | 'unplayed' | 'played'>('all');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedDecade, setSelectedDecade] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [specialEditionOnly, setSpecialEditionOnly] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<number | 'unrated' | null>(null);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Dynamic available formats
  const availableFormats = useMemo(() => {
    const set = new Set<string>();
    for (const a of albums) {
      if (a.format && a.format.trim()) set.add(a.format.trim());
    }
    return Array.from(set).sort();
  }, [albums]);

  // Dynamic available genres from the collection
  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    for (const a of albums) {
      if (a.genres) {
        for (const g of a.genres) if (g.trim()) set.add(g.trim());
      }
    }
    return Array.from(set).sort();
  }, [albums]);

  // Dynamic available styles from the collection
  const availableStyles = useMemo(() => {
    const set = new Set<string>();
    for (const a of albums) {
      if (a.styles) {
        for (const s of a.styles) if (s.trim()) set.add(s.trim());
      }
    }
    return Array.from(set).sort();
  }, [albums]);

  // Dynamic available decades
  const availableDecades = useMemo(() => {
    const set = new Set<string>();
    for (const a of albums) {
      if (a.releaseYear && a.releaseYear > 1900 && a.releaseYear < 2100) {
        const decade = `${Math.floor(a.releaseYear / 10) * 10}s`;
        set.add(decade);
      }
    }
    return Array.from(set).sort();
  }, [albums]);

  // Filter and sort albums
  const filteredAlbums = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return albums.filter((album) => {
      // Search matching across all relevant fields
      if (query) {
        const matchArtist = album.artist.toLowerCase().includes(query);
        const matchTitle = album.title.toLowerCase().includes(query);
        const matchGenre = album.genres?.some((g) => g.toLowerCase().includes(query));
        const matchStyle = album.styles?.some((s) => s.toLowerCase().includes(query));
        const matchEdition = album.edition?.toLowerCase().includes(query);
        const matchVariant = album.variant?.toLowerCase().includes(query);
        const matchLabel = album.label?.toLowerCase().includes(query);
        const matchCatalog = album.catalogNumber?.toLowerCase().includes(query);
        const matchYear = album.releaseYear?.toString().includes(query);

        if (
          !matchArtist &&
          !matchTitle &&
          !matchGenre &&
          !matchStyle &&
          !matchEdition &&
          !matchVariant &&
          !matchLabel &&
          !matchCatalog &&
          !matchYear
        ) {
          return false;
        }
      }

      // Status filter
      const stat = albumStats.get(album.id);
      const playCount = stat?.playCount || 0;
      if (statusFilter === 'unplayed' && playCount > 0) return false;
      if (statusFilter === 'played' && playCount === 0) return false;

      // Special Edition filter
      if (specialEditionOnly && !album.edition) return false;

      // Rating filter (supports unrated and specific minimum rating)
      if (ratingFilter === 'unrated') {
        if (album.personalRating && album.personalRating > 0) return false;
      } else if (typeof ratingFilter === 'number') {
        if (!album.personalRating || album.personalRating < ratingFilter) return false;
      }

      // Format filter
      if (selectedFormat) {
        if (!album.format || album.format.toLowerCase() !== selectedFormat.toLowerCase()) return false;
      }

      // Genre filter
      if (selectedGenre && !album.genres?.some((g) => g.toLowerCase() === selectedGenre.toLowerCase())) {
        return false;
      }

      // Style filter
      if (selectedStyle && !album.styles?.some((s) => s.toLowerCase() === selectedStyle.toLowerCase())) {
        return false;
      }

      // Decade filter
      if (selectedDecade) {
        if (!album.releaseYear) return false;
        const albumDecade = `${Math.floor(album.releaseYear / 10) * 10}s`;
        if (albumDecade !== selectedDecade) return false;
      }

      return true;
    });
  }, [
    albums,
    searchQuery,
    statusFilter,
    specialEditionOnly,
    ratingFilter,
    selectedFormat,
    selectedGenre,
    selectedStyle,
    selectedDecade,
    albumStats,
  ]);

  // Sorting
  const sortedAlbums = useMemo(() => {
    return [...filteredAlbums].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'artist':
          comparison = a.artist.localeCompare(b.artist);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'releaseYear':
          comparison = (a.releaseYear || 0) - (b.releaseYear || 0);
          break;
        case 'addedAt':
          comparison = new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
          break;
        case 'rating':
          comparison = (a.personalRating || 0) - (b.personalRating || 0);
          break;
        case 'playCount': {
          const countA = albumStats.get(a.id)?.playCount || 0;
          const countB = albumStats.get(b.id)?.playCount || 0;
          comparison = countA - countB;
          break;
        }
        case 'lastPlayed': {
          const dateA = albumStats.get(a.id)?.lastPlayed || '';
          const dateB = albumStats.get(b.id)?.lastPlayed || '';
          comparison = dateA.localeCompare(dateB);
          break;
        }
        default:
          comparison = a.artist.localeCompare(b.artist);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredAlbums, sortField, sortOrder, albumStats]);

  const hasActiveFilters =
    statusFilter !== 'all' ||
    selectedGenre !== null ||
    selectedStyle !== null ||
    selectedDecade !== null ||
    selectedFormat !== null ||
    specialEditionOnly ||
    ratingFilter !== null;

  const clearAllFilters = () => {
    setStatusFilter('all');
    setSelectedGenre(null);
    setSelectedStyle(null);
    setSelectedDecade(null);
    setSelectedFormat(null);
    setSpecialEditionOnly(false);
    setRatingFilter(null);
    setSearchQuery('');
  };

  return (
    <div id="library-view" className="space-y-4">
      {/* Search Bar & Quick Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#726E65] pointer-events-none" />
          <input
            id="library-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search artist, title, edition, genre, style..."
            className="w-full pl-9 pr-8 py-2 rounded-2xl bg-white border border-[#D9D4C7] text-xs sm:text-sm text-[#2D2D2A] placeholder:text-[#8B8C7A] focus:border-[#5D614E] focus:outline-hidden transition shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#726E65] hover:text-[#2D2D2A] rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Mode Switcher, Sort & Filter Toggles */}
        <div className="flex items-center justify-between sm:justify-start gap-2">
          {/* Sort Selector */}
          <div className="flex items-center gap-1 bg-white border border-[#D9D4C7] rounded-2xl px-2.5 py-1.5 text-xs text-[#2D2D2A] shadow-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#5D614E]" />
            <select
              id="library-sort-select"
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [f, o] = e.target.value.split('-') as [SortField, SortOrder];
                setSortField(f);
                setSortOrder(o);
              }}
              className="bg-transparent border-none text-[#2D2D2A] text-xs focus:outline-hidden cursor-pointer"
            >
              <option value="artist-asc" className="bg-[#FAF8F5] text-[#2D2D2A]">Artist A–Z</option>
              <option value="artist-desc" className="bg-[#FAF8F5] text-[#2D2D2A]">Artist Z–A</option>
              <option value="title-asc" className="bg-[#FAF8F5] text-[#2D2D2A]">Title A–Z</option>
              <option value="title-desc" className="bg-[#FAF8F5] text-[#2D2D2A]">Title Z–A</option>
              <option value="rating-desc" className="bg-[#FAF8F5] text-[#2D2D2A]">Top Rated</option>
              <option value="rating-asc" className="bg-[#FAF8F5] text-[#2D2D2A]">Lowest Rated</option>
              <option value="playCount-desc" className="bg-[#FAF8F5] text-[#2D2D2A]">Most Played</option>
              <option value="playCount-asc" className="bg-[#FAF8F5] text-[#2D2D2A]">Unplayed / Least Played</option>
              <option value="lastPlayed-desc" className="bg-[#FAF8F5] text-[#2D2D2A]">Recently Played</option>
              <option value="addedAt-desc" className="bg-[#FAF8F5] text-[#2D2D2A]">Recently Added</option>
              <option value="addedAt-asc" className="bg-[#FAF8F5] text-[#2D2D2A]">First Added</option>
              <option value="releaseYear-desc" className="bg-[#FAF8F5] text-[#2D2D2A]">Year (Newest)</option>
              <option value="releaseYear-asc" className="bg-[#FAF8F5] text-[#2D2D2A]">Year (Oldest)</option>
            </select>
          </div>

          {/* Filter Panel Toggle */}
          <button
            id="library-filter-toggle-btn"
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-medium border transition shadow-xs ${
              hasActiveFilters || showFiltersPanel
                ? 'bg-[#EAE6DC] text-[#474A3D] border-[#5D614E]'
                : 'bg-white text-[#726E65] border-[#D9D4C7] hover:text-[#2D2D2A]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#5D614E]" />
            )}
          </button>

          {/* View Switcher: Grid vs Compact */}
          <div className="flex items-center bg-white border border-[#D9D4C7] rounded-2xl p-0.5 shadow-xs">
            <button
              id="view-grid-btn"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xl transition ${
                viewMode === 'grid' ? 'bg-[#EAE6DC] text-[#5D614E]' : 'text-[#8B8C7A] hover:text-[#2D2D2A]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              id="view-compact-btn"
              onClick={() => setViewMode('compact')}
              className={`p-1.5 rounded-xl transition ${
                viewMode === 'compact' ? 'bg-[#EAE6DC] text-[#5D614E]' : 'text-[#8B8C7A] hover:text-[#2D2D2A]'
              }`}
              title="Compact List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Filter Drawer */}
      {showFiltersPanel && (
        <div className="p-4 rounded-2xl bg-[#FCFAF6] border border-[#D9D4C7] space-y-3.5 shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-[#D9D4C7]">
            <span className="text-xs font-mono uppercase tracking-wider text-[#726E65]">Filter Collection</span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-[#5D614E] hover:underline flex items-center gap-1 font-medium"
              >
                <X className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div>
            <span className="text-[11px] text-[#726E65] block mb-1.5 font-medium">Listening Status</span>
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'unplayed', 'played'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium capitalize transition ${
                    statusFilter === st
                      ? 'bg-[#5D614E] text-[#FAF8F5] border border-[#4E5240]'
                      : 'bg-white text-[#555846] border border-[#D9D4C7] hover:bg-[#FAF8F5]'
                  }`}
                >
                  {st}
                </button>
              ))}

              <button
                onClick={() => setSpecialEditionOnly(!specialEditionOnly)}
                className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-medium transition ${
                  specialEditionOnly
                    ? 'bg-[#5D614E] text-[#FAF8F5] border border-[#4E5240]'
                    : 'bg-white text-[#555846] border border-[#D9D4C7] hover:bg-[#FAF8F5]'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Special Editions</span>
              </button>
            </div>
          </div>

          {/* Rating filter */}
          <div>
            <span className="text-[11px] text-[#726E65] block mb-1.5 font-medium">Personal Rating</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Any Rating', val: null },
                { label: 'Unrated', val: 'unrated' as const },
                { label: '★ ≥ 3', val: 3 },
                { label: '★ ≥ 3.5', val: 3.5 },
                { label: '★ ≥ 4', val: 4 },
                { label: '★ ≥ 4.5', val: 4.5 },
                { label: '★ = 5', val: 5 },
              ].map(({ label, val }) => (
                <button
                  key={label}
                  onClick={() => setRatingFilter(val)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium transition ${
                    ratingFilter === val
                      ? 'bg-[#5D614E] text-[#FAF8F5] border border-[#4E5240]'
                      : 'bg-white text-[#555846] border border-[#D9D4C7] hover:bg-[#FAF8F5]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Formats (if available in collection) */}
          {availableFormats.length > 0 && (
            <div>
              <span className="text-[11px] text-[#726E65] block mb-1.5 font-medium">Format</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedFormat(null)}
                  className={`px-2.5 py-1 rounded-xl text-xs transition ${
                    selectedFormat === null
                      ? 'bg-[#5D614E] text-[#FAF8F5] border border-[#4E5240]'
                      : 'bg-white text-[#555846] border border-[#D9D4C7] hover:bg-[#FAF8F5]'
                  }`}
                >
                  All Formats
                </button>
                {availableFormats.map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setSelectedFormat(selectedFormat === fmt ? null : fmt)}
                    className={`px-2.5 py-1 rounded-xl text-xs transition ${
                      selectedFormat === fmt
                        ? 'bg-[#5D614E] text-[#FAF8F5] border border-[#4E5240]'
                        : 'bg-white text-[#555846] border border-[#D9D4C7] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Genres (if present) */}
          {availableGenres.length > 0 && (
            <div>
              <span className="text-[11px] text-[#726E65] block mb-1.5 font-medium">Genre</span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                <button
                  onClick={() => setSelectedGenre(null)}
                  className={`px-2.5 py-1 rounded-xl text-xs transition ${
                    selectedGenre === null
                      ? 'bg-[#5D614E] text-[#FAF8F5] border border-[#4E5240]'
                      : 'bg-white text-[#555846] border border-[#D9D4C7] hover:bg-[#FAF8F5]'
                  }`}
                >
                  All Genres
                </button>
                {availableGenres.map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGenre(selectedGenre === g ? null : g)}
                    className={`px-2.5 py-1 rounded-xl text-xs transition ${
                      selectedGenre === g
                        ? 'bg-[#5D614E] text-[#FAF8F5] border border-[#4E5240]'
                        : 'bg-white text-[#555846] border border-[#D9D4C7] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Styles (if present) */}
          {availableStyles.length > 0 && (
            <div>
              <span className="text-[11px] text-[#726E65] block mb-1.5 font-medium">Style</span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                <button
                  onClick={() => setSelectedStyle(null)}
                  className={`px-2.5 py-1 rounded-xl text-xs transition ${
                    selectedStyle === null
                      ? 'bg-[#5D614E] text-[#FAF8F5] border border-[#4E5240]'
                      : 'bg-white text-[#555846] border border-[#D9D4C7] hover:bg-[#FAF8F5]'
                  }`}
                >
                  All Styles
                </button>
                {availableStyles.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedStyle(selectedStyle === s ? null : s)}
                    className={`px-2.5 py-1 rounded-xl text-xs transition ${
                      selectedStyle === s
                        ? 'bg-[#5D614E] text-[#FAF8F5] border border-[#4E5240]'
                        : 'bg-white text-[#555846] border border-[#D9D4C7] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Decades (if present) */}
          {availableDecades.length > 0 && (
            <div>
              <span className="text-[11px] text-[#726E65] block mb-1.5 font-medium">Release Decade</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedDecade(null)}
                  className={`px-2.5 py-1 rounded-xl text-xs transition ${
                    selectedDecade === null
                      ? 'bg-[#5D614E] text-[#FAF8F5] border border-[#4E5240]'
                      : 'bg-white text-[#555846] border border-[#D9D4C7] hover:bg-[#FAF8F5]'
                  }`}
                >
                  All Decades
                </button>
                {availableDecades.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDecade(selectedDecade === d ? null : d)}
                    className={`px-2.5 py-1 rounded-xl text-xs transition ${
                      selectedDecade === d
                        ? 'bg-[#5D614E] text-[#FAF8F5] border border-[#4E5240]'
                        : 'bg-white text-[#555846] border border-[#D9D4C7] hover:bg-[#FAF8F5]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Result Count and Quick Summary */}
      <div className="flex items-center justify-between text-xs text-[#726E65] px-1 font-mono">
        <span>
          Showing {sortedAlbums.length} of {albums.length} records
        </span>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-[#5D614E] hover:underline font-medium"
          >
            Clear active filters
          </button>
        )}
      </div>

      {/* Records Container */}
      {sortedAlbums.length === 0 ? (
        <div className="py-16 text-center space-y-3 rounded-2xl bg-white border border-dashed border-[#D9D4C7] p-6 shadow-xs">
          <Disc3 className="w-10 h-10 text-[#8B8C7A] mx-auto animate-spin-slow" />
          <h4 className="font-serif text-base font-semibold text-[#2D2D2A]">
            {albums.length === 0 ? 'Your collection is empty' : 'No records match those filters'}
          </h4>
          <p className="text-xs text-[#726E65] max-w-sm mx-auto">
            {albums.length === 0
              ? 'Add your first vinyl record to begin your personal registry.'
              : 'Try clearing your search query or loosening your filter criteria.'}
          </p>
          {albums.length === 0 ? (
            <button
              onClick={onOpenAdd}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5D614E] hover:bg-[#4E5240] text-[#FAF8F5] text-xs font-medium transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Record</span>
            </button>
          ) : (
            <button
              onClick={clearAllFilters}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAE6DC] hover:bg-[#D9D4C7] text-[#2D2D2A] text-xs font-medium border border-[#D9D4C7] transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === 'compact' ? (
        <div className="space-y-2">
          {sortedAlbums.map((album) => {
            const stat = albumStats.get(album.id);
            return (
              <AlbumCard
                key={album.id}
                album={album}
                playCount={stat?.playCount || 0}
                lastPlayed={stat?.lastPlayed}
                viewMode="compact"
                onSelect={onSelectAlbum}
              />
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {sortedAlbums.map((album) => {
            const stat = albumStats.get(album.id);
            return (
              <AlbumCard
                key={album.id}
                album={album}
                playCount={stat?.playCount || 0}
                lastPlayed={stat?.lastPlayed}
                viewMode="grid"
                onSelect={onSelectAlbum}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
