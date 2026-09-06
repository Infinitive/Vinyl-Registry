import React, { useState, useEffect } from 'react';
import { X, Clock, Headphones, Volume2, Home, Radio, Check, Disc3 } from 'lucide-react';
import { Album, ListenLog } from '../types';
import { RatingStars } from './RatingStars';
import { VinylArtwork } from './VinylArtwork';

interface LogListenModalProps {
  album: Album;
  onSave: (logData: Omit<ListenLog, 'id'>) => Promise<void>;
  onClose: () => void;
}

const CONTEXT_OPTIONS = [
  { id: 'Turntable & Speakers', label: 'Speakers', icon: Volume2 },
  { id: 'Headphones', label: 'Headphones', icon: Headphones },
  { id: 'Living Room Session', label: 'Living Room', icon: Home },
  { id: 'Late Night Ritual', label: 'Late Night', icon: Radio },
  { id: 'Other', label: 'Other', icon: Disc3 },
];

export const LogListenModal: React.FC<LogListenModalProps> = ({
  album,
  onSave,
  onClose,
}) => {
  // Session rating is optional and distinct from record's overall personal rating
  const [sessionRating, setSessionRating] = useState<number>(0);
  const [note, setNote] = useState('');
  const [context, setContext] = useState('Turntable & Speakers');
  const [listenedAt, setListenedAt] = useState(
    new Date().toISOString().substring(0, 16) // format for datetime-local
  );
  const [saving, setSaving] = useState(false);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const isoDate = new Date(listenedAt).toISOString();
      await onSave({
        recordId: album.id,
        listenedAt: isoDate,
        rating: sessionRating > 0 ? sessionRating : undefined,
        note: note.trim() || undefined,
        context: context.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      id="log-listen-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-60 overflow-y-auto bg-[#2D2D2A]/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md rounded-3xl bg-[#F4F1EA] border border-[#D9D4C7] text-[#2D2D2A] shadow-2xl p-5 sm:p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#5D614E] animate-pulse" />
            <h3 className="font-serif text-base font-semibold text-[#2D2D2A]">Log Listen</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#726E65] hover:text-[#2D2D2A] hover:bg-[#EAE6DC] rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Album Overview Preview */}
        <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-[#D9D4C7] shadow-xs">
          <VinylArtwork album={album} size="sm" />
          <div className="min-w-0 flex-1">
            <h4 className="font-serif text-sm font-semibold text-[#2D2D2A] truncate">{album.title}</h4>
            <p className="text-xs text-[#5D614E] truncate">{album.artist}</p>
            <div className="flex items-center gap-2 text-[10px] text-[#726E65] font-mono mt-0.5">
              {album.edition && <span className="truncate">{album.edition}</span>}
              {album.personalRating !== undefined && album.personalRating > 0 && (
                <span className="text-[#8B8C7A]">★ {album.personalRating} catalog rating</span>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* How was this listen? Session Rating (Optional & distinct) */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#D9D4C7] space-y-2 text-center shadow-xs">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-medium text-[#2D2D2A]">Session Rating</span>
              <span className="text-[10px] text-[#726E65] font-mono">Optional</span>
            </div>
            <div className="flex justify-center py-1">
              <RatingStars value={sessionRating} onChange={setSessionRating} size="lg" showLabel />
            </div>
            {sessionRating > 0 && (
              <button
                type="button"
                onClick={() => setSessionRating(0)}
                className="text-[10px] text-[#726E65] hover:text-[#2D2D2A] underline"
              >
                Clear session rating
              </button>
            )}
          </div>

          {/* Quick Impression Note (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-[#2D2D2A]">
                Listening Note
              </label>
              <span className="text-[10px] text-[#726E65] font-mono">Optional</span>
            </div>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Soundstage was punchy, memorable Side B, deep bass..."
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#D9D4C7] text-xs text-[#2D2D2A] placeholder:text-[#A6A295] focus:border-[#5D614E] focus:outline-hidden resize-none"
            />
          </div>

          {/* Environment Pills (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-[#2D2D2A]">Listening Context</label>
              <span className="text-[10px] text-[#726E65] font-mono">Optional</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CONTEXT_OPTIONS.map((item) => {
                const Icon = item.icon;
                const isSelected = context === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setContext(isSelected ? '' : item.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition ${
                      isSelected
                        ? 'bg-[#5D614E] text-[#FAF8F5] border border-[#5D614E] shadow-xs'
                        : 'bg-white text-[#555846] border border-[#D9D4C7] hover:bg-[#EAE6DC]'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timestamp */}
          <div>
            <label className="block text-[11px] text-[#726E65] mb-1 flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3 text-[#8B8C7A]" />
              <span>Listened At</span>
            </label>
            <input
              type="datetime-local"
              value={listenedAt}
              onChange={(e) => setListenedAt(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#D9D4C7] text-xs text-[#2D2D2A] focus:border-[#5D614E] focus:outline-hidden"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#EAE6DC] hover:bg-[#D9D4C7] text-xs font-medium text-[#2D2D2A] transition"
            >
              Cancel
            </button>
            <button
              id="confirm-log-listen-btn"
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#5D614E] hover:bg-[#4E5240] active:scale-98 text-xs font-medium text-[#FAF8F5] transition disabled:opacity-50 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Log Listen'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
