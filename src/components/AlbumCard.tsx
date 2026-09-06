import React from 'react';
import { Sparkles, History } from 'lucide-react';
import { Album, LibraryViewMode } from '../types';
import { VinylArtwork } from './VinylArtwork';
import { RatingStars } from './RatingStars';

interface AlbumCardProps {
  album: Album;
  playCount: number;
  lastPlayed?: string;
  viewMode: LibraryViewMode;
  onSelect: (album: Album) => void;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({
  album,
  playCount,
  viewMode,
  onSelect,
}) => {
  const hasEdition = Boolean(album.edition);

  if (viewMode === 'compact') {
    return (
      <div
        id={`record-card-${album.id}`}
        onClick={() => onSelect(album)}
        className="group flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-[#D9D4C7] hover:border-[#8B8C7A] hover:bg-[#FAF8F5] transition-all cursor-pointer select-none active:scale-[0.99] shadow-xs"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <VinylArtwork album={album} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-serif text-sm font-medium text-[#2D2D2A] truncate group-hover:text-[#5D614E] transition-colors">
                {album.title}
              </h4>
              {hasEdition && (
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#EAE6DC] text-[#474A3D] border border-[#D9D4C7] whitespace-nowrap">
                  <Sparkles className="w-2.5 h-2.5" />
                  {album.edition}
                </span>
              )}
            </div>
            <p className="text-xs text-[#726E65] truncate mt-0.5">{album.artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0 text-right">
          {album.personalRating !== undefined && album.personalRating > 0 && (
            <div className="hidden sm:block">
              <RatingStars value={album.personalRating} size="sm" />
            </div>
          )}

          <div className="flex items-center gap-1 text-[11px] font-mono">
            {playCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-[#EAE6DC] text-[#3F3F3B] border border-[#D9D4C7] flex items-center gap-1">
                <History className="w-3 h-3 text-[#5D614E]" />
                <span>{playCount}×</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-[#F4F1EA] text-[#8B8C7A] border border-[#D9D4C7]">
                Unplayed
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      id={`record-grid-card-${album.id}`}
      onClick={() => onSelect(album)}
      className="group flex flex-col p-3 rounded-2xl bg-white border border-[#D9D4C7] hover:border-[#8B8C7A] hover:bg-[#FAF8F5] transition-all cursor-pointer select-none active:scale-[0.98] shadow-xs hover:shadow-md"
    >
      <div className="w-full flex justify-center mb-3">
        <VinylArtwork album={album} size="lg" className="w-full max-w-[200px]" showDiscPeek />
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-1">
            <h4 className="font-serif text-sm font-semibold text-[#2D2D2A] line-clamp-1 group-hover:text-[#5D614E] transition-colors">
              {album.title}
            </h4>
          </div>
          <p className="text-xs text-[#726E65] line-clamp-1 mt-0.5 font-normal">{album.artist}</p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-[#D9D4C7]/80 flex items-center justify-between text-xs">
          {album.personalRating !== undefined && album.personalRating > 0 ? (
            <RatingStars value={album.personalRating} size="sm" />
          ) : (
            <span className="text-[10px] text-[#A6A295]">Not rated</span>
          )}

          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
              playCount > 0
                ? 'bg-[#EAE6DC] text-[#474A3D] border border-[#D9D4C7]'
                : 'bg-[#F4F1EA] text-[#8B8C7A] border border-[#D9D4C7]'
            }`}
          >
            {playCount > 0 ? `Played ${playCount}×` : 'Unplayed'}
          </span>
        </div>

        {hasEdition && (
          <div className="mt-2 text-[10px] text-[#726E65] truncate flex items-center gap-1 font-mono">
            <Sparkles className="w-2.5 h-2.5 flex-shrink-0 text-[#5D614E]" />
            <span className="truncate">{album.edition}</span>
          </div>
        )}
      </div>
    </div>
  );
};
