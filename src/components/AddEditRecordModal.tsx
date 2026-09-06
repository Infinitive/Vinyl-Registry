import React, { useState, useEffect } from 'react';
import { X, AlertCircle, ChevronDown, ChevronUp, Plus, Disc3 } from 'lucide-react';
import { Album } from '../types';
import { RatingStars } from './RatingStars';

interface AddEditRecordModalProps {
  existingAlbum?: Album; // If editing
  allAlbums: Album[]; // For duplicate warning
  onSave: (albumData: Omit<Album, 'id' | 'addedAt' | 'updatedAt'> | Album) => Promise<void>;
  onClose: () => void;
}

export const AddEditRecordModal: React.FC<AddEditRecordModalProps> = ({
  existingAlbum,
  allAlbums,
  onSave,
  onClose,
}) => {
  const isEditing = Boolean(existingAlbum);

  // Form states
  const [artist, setArtist] = useState(existingAlbum?.artist || '');
  const [title, setTitle] = useState(existingAlbum?.title || '');
  const [releaseYear, setReleaseYear] = useState<string>(existingAlbum?.releaseYear?.toString() || '');
  const [genresText, setGenresText] = useState(existingAlbum?.genres?.join(', ') || '');
  const [format, setFormat] = useState(existingAlbum?.format || '');
  const [edition, setEdition] = useState(existingAlbum?.edition || '');
  const [variant, setVariant] = useState(existingAlbum?.variant || '');
  const [label, setLabel] = useState(existingAlbum?.label || '');
  const [country, setCountry] = useState(existingAlbum?.country || '');
  const [rpm, setRpm] = useState(existingAlbum?.rpm || '');
  const [discCount, setDiscCount] = useState<string>(existingAlbum?.discCount?.toString() || '');
  const [catalogNumber, setCatalogNumber] = useState(existingAlbum?.catalogNumber || '');
  const [extrasText, setExtrasText] = useState(existingAlbum?.packagingExtras?.join(', ') || '');
  const [purchasePrice, setPurchasePrice] = useState<string>(
    existingAlbum?.purchasePrice !== undefined ? existingAlbum.purchasePrice.toString() : ''
  );
  const [purchaseDate, setPurchaseDate] = useState(existingAlbum?.purchaseDate || '');
  const [personalRating, setPersonalRating] = useState<number>(existingAlbum?.personalRating || 0);
  const [notes, setNotes] = useState(existingAlbum?.notes || '');
  const [coverImage, setCoverImage] = useState(existingAlbum?.coverImage || '');

  const [showAdvanced, setShowAdvanced] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Check for duplicate in collection (excluding current album if editing)
  const duplicateMatch = React.useMemo(() => {
    if (!artist.trim() || !title.trim()) return null;
    const cleanArtist = artist.trim().toLowerCase();
    const cleanTitle = title.trim().toLowerCase();

    return allAlbums.find(
      (a) =>
        a.id !== existingAlbum?.id &&
        a.artist.trim().toLowerCase() === cleanArtist &&
        a.title.trim().toLowerCase() === cleanTitle
    );
  }, [artist, title, allAlbums, existingAlbum?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artist.trim() || !title.trim()) {
      setFormError('Artist and Title are required.');
      return;
    }

    try {
      setSaving(true);
      setFormError(null);

      const parsedYear = releaseYear.trim() ? parseInt(releaseYear.trim(), 10) : undefined;
      const parsedDiscCount = discCount.trim() ? parseInt(discCount.trim(), 10) : undefined;
      const parsedPrice = purchasePrice.trim() ? parseFloat(purchasePrice.trim()) : undefined;

      const genres = genresText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const packagingExtras = extrasText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const albumData = {
        artist: artist.trim(),
        title: title.trim(),
        releaseYear: parsedYear && !isNaN(parsedYear) ? parsedYear : undefined,
        genres: genres.length > 0 ? genres : undefined,
        format: format.trim() || undefined,
        edition: edition.trim() || undefined,
        variant: variant.trim() || undefined,
        label: label.trim() || undefined,
        country: country.trim() || undefined,
        rpm: rpm.trim() || undefined,
        discCount: parsedDiscCount && !isNaN(parsedDiscCount) ? parsedDiscCount : undefined,
        catalogNumber: catalogNumber.trim() || undefined,
        packagingExtras: packagingExtras.length > 0 ? packagingExtras : undefined,
        purchasePrice: parsedPrice && !isNaN(parsedPrice) ? parsedPrice : undefined,
        purchaseDate: purchaseDate.trim() || undefined,
        personalRating: personalRating > 0 ? personalRating : undefined,
        notes: notes.trim() || undefined,
        coverImage: coverImage.trim() || undefined,
      };

      if (isEditing && existingAlbum) {
        await onSave({
          ...existingAlbum,
          ...albumData,
        });
      } else {
        await onSave(albumData);
      }

      onClose();
    } catch (err) {
      console.error(err);
      setFormError(err instanceof Error ? err.message : 'Failed to save album');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      id="add-edit-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-[#2D2D2A]/60 backdrop-blur-sm flex justify-center p-0 sm:p-4"
    >
      <div className="w-full max-w-xl min-h-screen sm:min-h-0 sm:my-auto rounded-none sm:rounded-3xl bg-[#F4F1EA] border-0 sm:border border-[#D9D4C7] text-[#2D2D2A] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-[#F4F1EA]/95 backdrop-blur-md border-b border-[#D9D4C7]">
          <div className="flex items-center gap-2">
            <Disc3 className="w-4 h-4 text-[#5D614E]" />
            <h3 className="font-serif text-base font-semibold text-[#2D2D2A]">
              {isEditing ? 'Edit Record' : 'Add Record to Registry'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#726E65] hover:text-[#2D2D2A] hover:bg-[#EAE6DC] rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto flex-1">
          {formError && (
            <div className="p-3 rounded-xl bg-[#8A5A53]/10 border border-[#8A5A53]/30 text-[#733F39] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Duplicate Warning if matching existing record */}
          {duplicateMatch && (
            <div className="p-3 rounded-xl bg-[#B3804D]/15 border border-[#B3804D]/30 text-[#694825] text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#8C5D30]" />
              <div className="space-y-0.5">
                <span className="font-semibold block">You may already own this record</span>
                <p className="text-[#726E65] text-[11px]">
                  Found "{duplicateMatch.title}" by {duplicateMatch.artist} in your collection. You can still save if this is another copy or pressing variant.
                </p>
              </div>
            </div>
          )}

          {/* Primary Quick Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#2D2D2A] mb-1">
                Artist <span className="text-[#8A5A53]">*</span>
              </label>
              <input
                id="input-album-artist"
                type="text"
                required
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="e.g. Kacey Musgraves"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D9D4C7] focus:border-[#5D614E] focus:outline-hidden text-sm text-[#2D2D2A] placeholder:text-[#A6A295] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#2D2D2A] mb-1">
                Album Title <span className="text-[#8A5A53]">*</span>
              </label>
              <input
                id="input-album-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Golden Hour"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#D9D4C7] focus:border-[#5D614E] focus:outline-hidden text-sm text-[#2D2D2A] placeholder:text-[#A6A295] transition"
              />
            </div>
          </div>

          {/* Quick Rating on New/Edit */}
          <div className="p-3 rounded-xl bg-white border border-[#D9D4C7] flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-[#2D2D2A] block">Personal Rating</span>
              <span className="text-[11px] text-[#726E65]">Tap to rate in half-stars</span>
            </div>
            <RatingStars
              value={personalRating}
              onChange={setPersonalRating}
              size="md"
              showLabel
            />
          </div>

          {/* Progressive Details Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-[#EAE6DC] border border-[#D9D4C7] text-xs font-medium text-[#474A3D] flex items-center justify-between transition"
            >
              <span>{showAdvanced ? 'Hide Additional Details' : 'Add Edition, Year, Format & Notes'}</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Expanded Sections */}
          {showAdvanced && (
            <div className="space-y-4 pt-2 animate-in fade-in duration-150">
              {/* Release & Physical Details */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#D9D4C7] space-y-3 shadow-xs">
                <span className="text-xs font-mono uppercase text-[#726E65] tracking-wider block font-semibold">
                  Record & Pressing
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#726E65] mb-1 font-medium">Release Year</label>
                    <input
                      type="number"
                      value={releaseYear}
                      onChange={(e) => setReleaseYear(e.target.value)}
                      placeholder="e.g. 2018"
                      className="w-full px-3 py-2 rounded-lg bg-[#FCFAF6] border border-[#D9D4C7] text-xs text-[#2D2D2A] placeholder:text-[#A6A295] focus:border-[#5D614E] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#726E65] mb-1 font-medium">Format</label>
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#FCFAF6] border border-[#D9D4C7] text-xs text-[#2D2D2A] focus:border-[#5D614E] focus:outline-hidden"
                    >
                      <option value="">Not specified</option>
                      <option value="LP">LP (12")</option>
                      <option value="2xLP">2xLP Gatefold</option>
                      <option value="Box Set">Box Set</option>
                      <option value="Picture Disc">Picture Disc</option>
                      <option value="7&quot;">7" Single</option>
                      <option value="10&quot;">10" EP</option>
                      <option value="12&quot; Single">12" Maxi Single</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#726E65] mb-1 font-medium">Speed</label>
                    <select
                      value={rpm}
                      onChange={(e) => setRpm(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#FCFAF6] border border-[#D9D4C7] text-xs text-[#2D2D2A] focus:border-[#5D614E] focus:outline-hidden"
                    >
                      <option value="">Not specified</option>
                      <option value="33 ⅓">33 ⅓ RPM</option>
                      <option value="45">45 RPM</option>
                      <option value="78">78 RPM</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#726E65] mb-1 font-medium">Disc Count</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 1"
                      value={discCount}
                      onChange={(e) => setDiscCount(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#FCFAF6] border border-[#D9D4C7] text-xs text-[#2D2D2A] placeholder:text-[#A6A295] focus:border-[#5D614E] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#726E65] mb-1 font-medium">
                    Genres (comma separated)
                  </label>
                  <input
                    type="text"
                    value={genresText}
                    onChange={(e) => setGenresText(e.target.value)}
                    placeholder="e.g. Country, Pop, Americana"
                    className="w-full px-3 py-2 rounded-lg bg-[#FCFAF6] border border-[#D9D4C7] text-xs text-[#2D2D2A] placeholder:text-[#A6A295] focus:border-[#5D614E] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Edition & Variant Details */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#D9D4C7] space-y-3 shadow-xs">
                <span className="text-xs font-mono uppercase text-[#726E65] tracking-wider block font-semibold">
                  Edition & Packaging
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#726E65] mb-1 font-medium">Edition</label>
                    <input
                      type="text"
                      value={edition}
                      onChange={(e) => setEdition(e.target.value)}
                      placeholder="e.g. Target Exclusive, 25th Anniv"
                      className="w-full px-3 py-2 rounded-lg bg-[#FCFAF6] border border-[#D9D4C7] text-xs text-[#2D2D2A] placeholder:text-[#A6A295] focus:border-[#5D614E] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#726E65] mb-1 font-medium">Color / Variant</label>
                    <input
                      type="text"
                      value={variant}
                      onChange={(e) => setVariant(e.target.value)}
                      placeholder="e.g. Opaque Pink, Clear, Amber"
                      className="w-full px-3 py-2 rounded-lg bg-[#FCFAF6] border border-[#D9D4C7] text-xs text-[#2D2D2A] placeholder:text-[#A6A295] focus:border-[#5D614E] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#726E65] mb-1 font-medium">Record Label</label>
                    <input
                      type="text"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder="e.g. MCA Nashville"
                      className="w-full px-3 py-2 rounded-lg bg-[#FCFAF6] border border-[#D9D4C7] text-xs text-[#2D2D2A] placeholder:text-[#A6A295] focus:border-[#5D614E] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#726E65] mb-1 font-medium">Catalog Number</label>
                    <input
                      type="text"
                      value={catalogNumber}
                      onChange={(e) => setCatalogNumber(e.target.value)}
                      placeholder="e.g. B0027921-01"
                      className="w-full px-3 py-2 rounded-lg bg-[#FCFAF6] border border-[#D9D4C7] text-xs text-[#2D2D2A] placeholder:text-[#A6A295] focus:border-[#5D614E] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#726E65] mb-1 font-medium">
                    Packaging Extras (comma separated)
                  </label>
                  <input
                    type="text"
                    value={extrasText}
                    onChange={(e) => setExtrasText(e.target.value)}
                    placeholder="e.g. Poster, Lyric Booklet, Art Print"
                    className="w-full px-3 py-2 rounded-lg bg-[#FCFAF6] border border-[#D9D4C7] text-xs text-[#2D2D2A] placeholder:text-[#A6A295] focus:border-[#5D614E] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Personal Notes & Acquisition */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#D9D4C7] space-y-3 shadow-xs">
                <span className="text-xs font-mono uppercase text-[#726E65] tracking-wider block font-semibold">
                  Personal Notes & Purchase
                </span>

                <div>
                  <label className="block text-[11px] text-[#726E65] mb-1 font-medium">Notes & Impressions</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Memories, thoughts on this pressing, favorite tracks..."
                    className="w-full px-3 py-2 rounded-lg bg-[#FCFAF6] border border-[#D9D4C7] text-xs text-[#2D2D2A] placeholder:text-[#A6A295] focus:border-[#5D614E] focus:outline-hidden resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#726E65] mb-1 font-medium">Purchase Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      placeholder="29.99"
                      className="w-full px-3 py-2 rounded-lg bg-[#FCFAF6] border border-[#D9D4C7] text-xs text-[#2D2D2A] placeholder:text-[#A6A295] focus:border-[#5D614E] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#726E65] mb-1 font-medium">Purchase Date</label>
                    <input
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#FCFAF6] border border-[#D9D4C7] text-xs text-[#2D2D2A] focus:border-[#5D614E] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#726E65] mb-1 font-medium">Cover Image URL (optional)</label>
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-lg bg-[#FCFAF6] border border-[#D9D4C7] text-xs text-[#2D2D2A] placeholder:text-[#A6A295] focus:border-[#5D614E] focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#D9D4C7] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#EAE6DC] hover:bg-[#D9D4C7] text-xs font-medium text-[#2D2D2A] transition"
            >
              Cancel
            </button>
            <button
              id="save-album-submit-btn"
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-[#5D614E] hover:bg-[#4E5240] active:scale-98 text-xs font-medium text-[#FAF8F5] transition disabled:opacity-50 shadow-xs"
            >
              {saving ? 'Saving...' : isEditing ? 'Update Record' : 'Save to Registry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
