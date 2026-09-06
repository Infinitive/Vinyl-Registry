import React, { useState, useMemo, useEffect } from 'react';
import {
  Bookmark,
  Plus,
  ArrowRight,
  Trash2,
  Edit3,
  Search,
  Sparkles,
  X,
  Check,
  Disc3,
  AlertTriangle,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { WishlistItem, Album } from '../types';

interface WishlistViewProps {
  wishlist: WishlistItem[];
  onAddWishlistItem: (item: Omit<WishlistItem, 'id' | 'addedAt'>) => Promise<WishlistItem>;
  onUpdateWishlistItem?: (item: WishlistItem) => Promise<void>;
  onDeleteWishlistItem: (id: string) => Promise<void>;
  onMoveToLibrary: (item: WishlistItem, extraDetails?: Partial<Album>) => Promise<Album>;
  onSelectAlbum?: (album: Album) => void;
}

type SortOption =
  | 'priority-desc'
  | 'priority-asc'
  | 'artist-asc'
  | 'title-asc'
  | 'price-asc'
  | 'price-desc'
  | 'date-desc'
  | 'date-asc';

type PriorityFilter = 'all' | 'high' | 'medium' | 'low';

export const WishlistView: React.FC<WishlistViewProps> = ({
  wishlist,
  onAddWishlistItem,
  onUpdateWishlistItem,
  onDeleteWishlistItem,
  onMoveToLibrary,
}) => {
  // Search, filter, and sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('priority-desc');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<WishlistItem | null>(null);

  // Form states for Add / Edit
  const [artist, setArtist] = useState('');
  const [title, setTitle] = useState('');
  const [desiredEdition, setDesiredEdition] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [notes, setNotes] = useState('');
  const [discogsId, setDiscogsId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Acquisition Flow Modal State
  const [acquiringItem, setAcquiringItem] = useState<WishlistItem | null>(null);
  const [acqArtist, setAcqArtist] = useState('');
  const [acqTitle, setAcqTitle] = useState('');
  const [acqFormat, setAcqFormat] = useState('LP');
  const [acqReleaseYear, setAcqReleaseYear] = useState('');
  const [acqLabel, setAcqLabel] = useState('');
  const [acqEdition, setAcqEdition] = useState('');
  const [acqVariant, setAcqVariant] = useState('');
  const [acqPurchasePrice, setAcqPurchasePrice] = useState('');
  const [acqPurchaseDate, setAcqPurchaseDate] = useState('');
  const [acqNotes, setAcqNotes] = useState('');

  // Priority weight for sorting
  const priorityRank = (p?: 'high' | 'medium' | 'low') => {
    switch (p) {
      case 'high':
        return 3;
      case 'medium':
        return 2;
      case 'low':
        return 1;
      default:
        return 2;
    }
  };

  // Priority count helper
  const counts = useMemo(() => {
    return {
      all: wishlist.length,
      high: wishlist.filter((i) => i.priority === 'high').length,
      medium: wishlist.filter((i) => !i.priority || i.priority === 'medium').length,
      low: wishlist.filter((i) => i.priority === 'low').length,
    };
  }, [wishlist]);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return wishlist
      .filter((item) => {
        // Priority filter
        if (priorityFilter !== 'all') {
          const itemPriority = item.priority || 'medium';
          if (itemPriority !== priorityFilter) return false;
        }

        // Search query filter
        if (q) {
          const matchArtist = (item.artist || '').toLowerCase().includes(q);
          const matchTitle = (item.title || '').toLowerCase().includes(q);
          const matchEdition = (item.desiredEdition || '').toLowerCase().includes(q);
          const matchNotes = (item.notes || '').toLowerCase().includes(q);
          if (!matchArtist && !matchTitle && !matchEdition && !matchNotes) return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'priority-desc': {
            const diff = priorityRank(b.priority) - priorityRank(a.priority);
            return diff !== 0 ? diff : a.artist.localeCompare(b.artist);
          }
          case 'priority-asc': {
            const diff = priorityRank(a.priority) - priorityRank(b.priority);
            return diff !== 0 ? diff : a.artist.localeCompare(b.artist);
          }
          case 'artist-asc':
            return a.artist.localeCompare(b.artist);
          case 'title-asc':
            return a.title.localeCompare(b.title);
          case 'price-asc':
            return (a.targetPrice ?? 999999) - (b.targetPrice ?? 999999);
          case 'price-desc':
            return (b.targetPrice ?? 0) - (a.targetPrice ?? 0);
          case 'date-desc':
            return (b.addedAt || '').localeCompare(a.addedAt || '');
          case 'date-asc':
            return (a.addedAt || '').localeCompare(b.addedAt || '');
          default:
            return 0;
        }
      });
  }, [wishlist, searchQuery, priorityFilter, sortBy]);

  // Handle open Add Modal
  const handleOpenAdd = () => {
    setArtist('');
    setTitle('');
    setDesiredEdition('');
    setTargetPrice('');
    setPriority('medium');
    setNotes('');
    setDiscogsId('');
    setFormError(null);
    setShowAddModal(true);
  };

  // Handle open Edit Modal
  const handleOpenEdit = (item: WishlistItem) => {
    setEditingItem(item);
    setArtist(item.artist);
    setTitle(item.title);
    setDesiredEdition(item.desiredEdition || '');
    setTargetPrice(item.targetPrice !== undefined ? item.targetPrice.toString() : '');
    setPriority(item.priority || 'medium');
    setNotes(item.notes || '');
    setDiscogsId(item.discogsId || '');
    setFormError(null);
  };

  // Handle Escape key for all Wishlist modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (itemToDelete) {
          setItemToDelete(null);
        } else if (acquiringItem) {
          setAcquiringItem(null);
        } else if (editingItem) {
          setEditingItem(null);
        } else if (showAddModal) {
          setShowAddModal(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [itemToDelete, acquiringItem, editingItem, showAddModal]);

  // Submit Add
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artist.trim() || !title.trim()) {
      setFormError('Artist and Title are required');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      await onAddWishlistItem({
        artist: artist.trim(),
        title: title.trim(),
        desiredEdition: desiredEdition.trim() || undefined,
        targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
        priority,
        notes: notes.trim() || undefined,
        discogsId: discogsId.trim() || undefined,
      });
      setShowAddModal(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add item');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!artist.trim() || !title.trim()) {
      setFormError('Artist and Title are required');
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      if (onUpdateWishlistItem) {
        await onUpdateWishlistItem({
          ...editingItem,
          artist: artist.trim(),
          title: title.trim(),
          desiredEdition: desiredEdition.trim() || undefined,
          targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
          priority,
          notes: notes.trim() || undefined,
          discogsId: discogsId.trim() || undefined,
        });
      }
      setEditingItem(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to update item');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      setSubmitting(true);
      await onDeleteWishlistItem(itemToDelete.id);
      setItemToDelete(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Initiate Acquisition Workflow
  const handleStartAcquisition = (item: WishlistItem) => {
    setAcquiringItem(item);
    setAcqArtist(item.artist);
    setAcqTitle(item.title);
    setAcqFormat('LP');
    setAcqReleaseYear('');
    setAcqLabel('');
    setAcqEdition(item.desiredEdition || '');
    setAcqVariant('');
    setAcqPurchasePrice(item.targetPrice !== undefined ? item.targetPrice.toString() : '');
    setAcqPurchaseDate(new Date().toISOString().substring(0, 10));
    setAcqNotes(item.notes || '');
  };

  // Complete Acquisition Workflow
  const handleAcquisitionConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acquiringItem) return;

    try {
      setSubmitting(true);
      const extraDetails: Partial<Album> = {
        artist: acqArtist.trim() || acquiringItem.artist,
        title: acqTitle.trim() || acquiringItem.title,
        format: acqFormat.trim() || 'LP',
        releaseYear: acqReleaseYear ? parseInt(acqReleaseYear, 10) : undefined,
        label: acqLabel.trim() || undefined,
        edition: acqEdition.trim() || undefined,
        variant: acqVariant.trim() || undefined,
        purchasePrice: acqPurchasePrice ? parseFloat(acqPurchasePrice) : undefined,
        purchaseDate: acqPurchaseDate.trim() || undefined,
        notes: acqNotes.trim() || undefined,
      };

      await onMoveToLibrary(acquiringItem, extraDetails);
      setAcquiringItem(null);
    } catch (err) {
      console.error('Failed to complete acquisition:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const priorityStyles = {
    high: 'bg-[#8A5A53]/15 text-[#733F39] border-[#8A5A53]/30',
    medium: 'bg-[#C4A482]/20 text-[#5D614E] border-[#8B8C7A]/40',
    low: 'bg-[#EFECE4] text-[#726E65] border-[#D9D4C7]',
  };

  return (
    <div id="wishlist-view" className="space-y-6 pb-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#5D614E]" />
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#2D2D2A] tracking-tight">
              Vinyl Wishlist
            </h2>
          </div>
          <p className="text-xs text-[#726E65] mt-1">
            Tracking grails and target pressings. Separated from active collection analytics until acquired.
          </p>
        </div>

        <button
          id="wishlist-add-btn"
          onClick={handleOpenAdd}
          className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#5D614E] hover:bg-[#4E5240] active:scale-95 text-[#FAF8F5] text-xs font-medium transition shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Wishlist Item</span>
        </button>
      </div>

      {/* Controls Bar: Search, Priority Filter, Sort */}
      {wishlist.length > 0 && (
        <div className="space-y-3 p-4 rounded-2xl bg-white border border-[#D9D4C7] shadow-xs">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#726E65] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="wishlist-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search wishlist by artist, title, edition, or notes..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#F4F1EA] border border-[#D9D4C7] text-xs text-[#2D2D2A] placeholder-[#726E65] focus:outline-hidden focus:border-[#5D614E]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#726E65] hover:text-[#2D2D2A] p-0.5 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#726E65]" />
              <select
                id="wishlist-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 rounded-xl bg-[#F4F1EA] border border-[#D9D4C7] text-xs font-medium text-[#2D2D2A] focus:outline-hidden focus:border-[#5D614E]"
              >
                <option value="priority-desc">Priority: High to Low</option>
                <option value="priority-asc">Priority: Low to High</option>
                <option value="artist-asc">Artist: A to Z</option>
                <option value="title-asc">Title: A to Z</option>
                <option value="price-asc">Target Price: Low to High</option>
                <option value="price-desc">Target Price: High to Low</option>
                <option value="date-desc">Date Added: Newest First</option>
                <option value="date-asc">Date Added: Oldest First</option>
              </select>
            </div>
          </div>

          {/* Priority Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[#D9D4C7]/60">
            <span className="text-[11px] font-medium text-[#726E65] mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Priority:
            </span>
            {(['all', 'high', 'medium', 'low'] as PriorityFilter[]).map((p) => {
              const isActive = priorityFilter === p;
              const count = counts[p];
              return (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#5D614E] text-[#FAF8F5] shadow-xs'
                      : 'bg-[#F4F1EA] text-[#726E65] hover:text-[#2D2D2A] hover:bg-[#EAE6DC]'
                  }`}
                >
                  <span className="capitalize">{p}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-[#FAF8F5]/20 text-[#FAF8F5]' : 'bg-[#D9D4C7] text-[#2D2D2A]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Wishlist Content */}
      {wishlist.length === 0 ? (
        /* Empty State: Explaining Wishlist Purpose */
        <div className="py-16 px-6 text-center space-y-4 rounded-3xl bg-white border border-dashed border-[#D9D4C7] max-w-lg mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#F4F1EA] border border-[#D9D4C7] flex items-center justify-center text-[#5D614E] mx-auto">
            <Bookmark className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-serif text-lg font-semibold text-[#2D2D2A]">Your Wishlist is Empty</h3>
            <p className="text-xs text-[#726E65] leading-relaxed">
              Keep track of records, grails, and specific pressing editions you hope to acquire for your shelf.
              Wishlist items stay separate from your collection statistics until you acquire them.
            </p>
          </div>
          <button
            id="wishlist-empty-add-btn"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5D614E] hover:bg-[#4E5240] text-[#FAF8F5] text-xs font-medium transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Your First Wishlist Item</span>
          </button>
        </div>
      ) : filteredAndSortedItems.length === 0 ? (
        /* Filter Zero Results */
        <div className="py-12 px-6 text-center space-y-3 rounded-2xl bg-white border border-[#D9D4C7] shadow-xs">
          <Search className="w-8 h-8 text-[#8B8C7A] mx-auto" />
          <h4 className="font-serif text-base font-semibold text-[#2D2D2A]">No Matching Wishlist Items</h4>
          <p className="text-xs text-[#726E65]">
            No records matched your search query or selected priority filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setPriorityFilter('all');
            }}
            className="px-3 py-1.5 rounded-xl bg-[#EAE6DC] text-xs text-[#2D2D2A] hover:bg-[#D9D4C7] transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Wishlist Items Grid / Cards */
        <div className="space-y-3">
          {filteredAndSortedItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white border border-[#D9D4C7] flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:border-[#8B8C7A] shadow-xs"
            >
              {/* Item Info */}
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-serif text-base font-semibold text-[#2D2D2A] truncate">
                    {item.title}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider border ${
                      priorityStyles[item.priority || 'medium']
                    }`}
                  >
                    {item.priority || 'medium'} priority
                  </span>
                </div>

                <p className="text-xs text-[#5D614E] font-medium">{item.artist}</p>

                {item.desiredEdition && (
                  <div className="flex items-center gap-1.5 text-xs text-[#474A3D] font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-[#5D614E] flex-shrink-0" />
                    <span>Target Edition: {item.desiredEdition}</span>
                  </div>
                )}

                {item.notes && (
                  <p className="text-xs text-[#726E65] italic bg-[#F4F1EA]/60 px-2.5 py-1 rounded-lg inline-block">
                    "{item.notes}"
                  </p>
                )}
              </div>

              {/* Price & Action Buttons */}
              <div className="flex items-center justify-between md:justify-end gap-3 flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#D9D4C7]">
                {item.targetPrice !== undefined && (
                  <div className="text-left md:text-right font-mono pr-2">
                    <span className="text-[10px] text-[#726E65] block">Target Price</span>
                    <span className="text-xs sm:text-sm font-semibold text-[#2D2D2A]">
                      ${item.targetPrice.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  {/* Acquisition Button */}
                  <button
                    onClick={() => handleStartAcquisition(item)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#5D614E] hover:bg-[#4E5240] text-[#FAF8F5] text-xs font-medium transition shadow-xs active:scale-95"
                    title="Mark as Acquired & Add to Shelf"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Acquired</span>
                  </button>

                  {/* Edit Button */}
                  {onUpdateWishlistItem && (
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 text-[#726E65] hover:text-[#2D2D2A] hover:bg-[#EAE6DC] rounded-xl transition"
                      title="Edit Wishlist Item"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    onClick={() => setItemToDelete(item)}
                    className="p-2 text-[#8B8C7A] hover:text-[#8A5A53] hover:bg-[#8A5A53]/10 rounded-xl transition"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: Add to Wishlist */}
      {showAddModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2D2A]/60 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-3xl bg-white border border-[#D9D4C7] text-[#2D2D2A] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D9D4C7]">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-[#5D614E]" />
                <h3 className="font-serif text-lg font-semibold text-[#2D2D2A]">Add to Wishlist</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-[#726E65] hover:text-[#2D2D2A] hover:bg-[#EAE6DC] rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-[#8A5A53]/10 border border-[#8A5A53]/30 text-[#733F39] text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#474A3D] font-medium mb-1">Artist *</label>
                <input
                  type="text"
                  required
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="e.g. Fleetwood Mac"
                  className="w-full px-3 py-2 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] text-[#2D2D2A] focus:border-[#5D614E] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[#474A3D] font-medium mb-1">Album Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Rumours"
                  className="w-full px-3 py-2 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] text-[#2D2D2A] focus:border-[#5D614E] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[#474A3D] font-medium mb-1">Desired Edition / Variant</label>
                <input
                  type="text"
                  value={desiredEdition}
                  onChange={(e) => setDesiredEdition(e.target.value)}
                  placeholder="e.g. 45RPM Master, Clear Vinyl, 1977 UK Pressing"
                  className="w-full px-3 py-2 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] text-[#2D2D2A] focus:border-[#5D614E] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#474A3D] font-medium mb-1">Target Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="35.00"
                    className="w-full px-3 py-2 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] text-[#2D2D2A] focus:border-[#5D614E] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[#474A3D] font-medium mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
                    className="w-full px-3 py-2 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] text-[#2D2D2A] focus:border-[#5D614E] focus:outline-hidden"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#474A3D] font-medium mb-1">Hunting Notes / Leads</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Where to hunt, record store leads, deadwax notes..."
                  className="w-full px-3 py-2 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] text-[#2D2D2A] focus:border-[#5D614E] focus:outline-hidden resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#EAE6DC] hover:bg-[#D9D4C7] text-[#2D2D2A] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#5D614E] hover:bg-[#4E5240] text-[#FAF8F5] font-medium transition shadow-xs"
                >
                  {submitting ? 'Saving...' : 'Add Wishlist Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Wishlist Item */}
      {editingItem && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingItem(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2D2A]/60 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-3xl bg-white border border-[#D9D4C7] text-[#2D2D2A] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D9D4C7]">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#5D614E]" />
                <h3 className="font-serif text-lg font-semibold text-[#2D2D2A]">Edit Wishlist Item</h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 text-[#726E65] hover:text-[#2D2D2A] hover:bg-[#EAE6DC] rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-[#8A5A53]/10 border border-[#8A5A53]/30 text-[#733F39] text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#474A3D] font-medium mb-1">Artist *</label>
                <input
                  type="text"
                  required
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] text-[#2D2D2A] focus:border-[#5D614E] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[#474A3D] font-medium mb-1">Album Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] text-[#2D2D2A] focus:border-[#5D614E] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[#474A3D] font-medium mb-1">Desired Edition / Variant</label>
                <input
                  type="text"
                  value={desiredEdition}
                  onChange={(e) => setDesiredEdition(e.target.value)}
                  placeholder="e.g. 45RPM Master, Clear Vinyl"
                  className="w-full px-3 py-2 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] text-[#2D2D2A] focus:border-[#5D614E] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#474A3D] font-medium mb-1">Target Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="35.00"
                    className="w-full px-3 py-2 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] text-[#2D2D2A] focus:border-[#5D614E] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[#474A3D] font-medium mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
                    className="w-full px-3 py-2 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] text-[#2D2D2A] focus:border-[#5D614E] focus:outline-hidden"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#474A3D] font-medium mb-1">Hunting Notes / Leads</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] text-[#2D2D2A] focus:border-[#5D614E] focus:outline-hidden resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl bg-[#EAE6DC] hover:bg-[#D9D4C7] text-[#2D2D2A] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#5D614E] hover:bg-[#4E5240] text-[#FAF8F5] font-medium transition shadow-xs"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Delete Confirmation */}
      {itemToDelete && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setItemToDelete(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2D2A]/60 backdrop-blur-xs"
        >
          <div className="w-full max-w-sm rounded-3xl bg-white border border-[#D9D4C7] text-[#2D2D2A] shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#8A5A53]">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="font-serif text-base font-semibold text-[#2D2D2A]">Remove Wishlist Item?</h4>
            </div>

            <p className="text-xs text-[#726E65] leading-relaxed">
              Are you sure you want to remove <strong>"{itemToDelete.title}"</strong> by <strong>{itemToDelete.artist}</strong> from your wishlist?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-3.5 py-1.5 rounded-xl bg-[#EAE6DC] text-xs text-[#2D2D2A] hover:bg-[#D9D4C7] transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={submitting}
                className="px-4 py-1.5 rounded-xl bg-[#8A5A53] hover:bg-[#733F39] text-xs font-medium text-[#FAF8F5] shadow-xs transition"
              >
                {submitting ? 'Removing...' : 'Remove Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Full Acquisition Workflow Dialog */}
      {acquiringItem && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setAcquiringItem(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D2D2A]/60 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg rounded-3xl bg-white border border-[#D9D4C7] text-[#2D2D2A] shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#D9D4C7]">
              <div className="flex items-center gap-2 text-[#5D614E]">
                <Disc3 className="w-5 h-5" />
                <h3 className="font-serif text-base sm:text-lg font-semibold text-[#2D2D2A]">
                  Acquire & Add to Collection
                </h3>
              </div>
              <button
                onClick={() => setAcquiringItem(null)}
                className="p-1.5 text-[#726E65] hover:text-[#2D2D2A] hover:bg-[#EAE6DC] rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#726E65] leading-relaxed">
              Congratulations on acquiring this record! Review and customize the pressing metadata below before adding it to your physical shelf registry.
            </p>

            <form onSubmit={handleAcquisitionConfirm} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#474A3D] font-medium mb-1">Artist *</label>
                  <input
                    type="text"
                    required
                    value={acqArtist}
                    onChange={(e) => setAcqArtist(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] text-[#2D2D2A] focus:border-[#5D614E] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[#474A3D] font-medium mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={acqTitle}
                    onChange={(e) => setAcqTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] text-[#2D2D2A] focus:border-[#5D614E] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#474A3D] font-medium mb-1">Format</label>
                  <input
                    type="text"
                    value={acqFormat}
                    onChange={(e) => setAcqFormat(e.target.value)}
                    placeholder="LP, 2xLP, 7&quot;"
                    className="w-full px-3 py-2 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] text-[#2D2D2A] focus:border-[#5D614E] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[#474A3D] font-medium mb-1">Release Year</label>
                  <input
                    type="number"
                    value={acqReleaseYear}
                    onChange={(e) => setAcqReleaseYear(e.target.value)}
                    placeholder="e.g. 1977"
                    className="w-full px-3 py-2 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] text-[#2D2D2A] focus:border-[#5D614E] focus:outline-hidden"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[#474A3D] font-medium mb-1">Label</label>
                  <input
                    type="text"
                    value={acqLabel}
                    onChange={(e) => setAcqLabel(e.target.value)}
                    placeholder="e.g. Warner Bros."
                    className="w-full px-3 py-2 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] text-[#2D2D2A] focus:border-[#5D614E] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#474A3D] font-medium mb-1">Edition / Pressing</label>
                  <input
                    type="text"
                    value={acqEdition}
                    onChange={(e) => setAcqEdition(e.target.value)}
                    placeholder="e.g. First Pressing, Club Edition"
                    className="w-full px-3 py-2 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] text-[#2D2D2A] focus:border-[#5D614E] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[#474A3D] font-medium mb-1">Color Variant</label>
                  <input
                    type="text"
                    value={acqVariant}
                    onChange={(e) => setAcqVariant(e.target.value)}
                    placeholder="e.g. Clear, Gold Splatter"
                    className="w-full px-3 py-2 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] text-[#2D2D2A] focus:border-[#5D614E] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#474A3D] font-medium mb-1">Purchase Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={acqPurchasePrice}
                    onChange={(e) => setAcqPurchasePrice(e.target.value)}
                    placeholder="29.99"
                    className="w-full px-3 py-2 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] text-[#2D2D2A] focus:border-[#5D614E] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[#474A3D] font-medium mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={acqPurchaseDate}
                    onChange={(e) => setAcqPurchaseDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] text-[#2D2D2A] focus:border-[#5D614E] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#474A3D] font-medium mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={acqNotes}
                  onChange={(e) => setAcqNotes(e.target.value)}
                  placeholder="Record store, condition, pressing notes..."
                  className="w-full px-3 py-2 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] text-[#2D2D2A] focus:border-[#5D614E] focus:outline-hidden resize-none"
                />
              </div>

              <div className="pt-3 border-t border-[#D9D4C7] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAcquiringItem(null)}
                  className="px-3.5 py-2 rounded-xl bg-[#EAE6DC] text-xs text-[#2D2D2A] hover:bg-[#D9D4C7] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#5D614E] hover:bg-[#4E5240] text-xs font-medium text-[#FAF8F5] shadow-xs transition active:scale-98"
                >
                  {submitting ? 'Transferring...' : 'Add to Collection Registry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
