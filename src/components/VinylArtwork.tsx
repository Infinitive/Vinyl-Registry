import React, { useMemo } from 'react';
import { Disc3, Layers } from 'lucide-react';
import { Album } from '../types';

interface VinylArtworkProps {
  album: Album;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDiscPeek?: boolean;
  className?: string;
}

// Generate consistent, sophisticated warm natural earthy palettes from artist & title strings
const SLEEVE_PALETTES = [
  { bg: 'from-[#5D614E] via-[#4F5342] to-[#3B3D30]', accent: 'bg-[#8B8C7A]', text: 'text-[#F4F1EA]', border: 'border-[#474A3A]' },
  { bg: 'from-[#8C6246] via-[#755037] to-[#543825]', accent: 'bg-[#B47C57]', text: 'text-[#FAF8F5]', border: 'border-[#694831]' },
  { bg: 'from-[#43525B] via-[#35434B] to-[#253239]', accent: 'bg-[#6A7F8C]', text: 'text-[#F4F1EA]', border: 'border-[#2D3C44]' },
  { bg: 'from-[#7A7565] via-[#656052] to-[#4F4B3F]', accent: 'bg-[#A39E8C]', text: 'text-[#FCFAF6]', border: 'border-[#5A5546]' },
  { bg: 'from-[#8A5A53] via-[#724640] to-[#54322D]', accent: 'bg-[#A8726A]', text: 'text-[#FAF8F5]', border: 'border-[#633B35]' },
  { bg: 'from-[#6E7B68] via-[#596554] to-[#424C3D]', accent: 'bg-[#919F8A]', text: 'text-[#F4F1EA]', border: 'border-[#4E5949]' },
  { bg: 'from-[#937B58] via-[#7B6545] to-[#5C4A31]', accent: 'bg-[#BBA27B]', text: 'text-[#FAF8F5]', border: 'border-[#6B573A]' },
  { bg: 'from-[#565554] via-[#444342] to-[#333231]', accent: 'bg-[#7E7C7A]', text: 'text-[#F4F1EA]', border: 'border-[#3C3B3A]' },
  { bg: 'from-[#735A6D] via-[#5F4759] to-[#453240]', accent: 'bg-[#96778F]', text: 'text-[#FAF8F5]', border: 'border-[#503C4B]' },
];

export const VinylArtwork: React.FC<VinylArtworkProps> = ({
  album,
  size = 'md',
  showDiscPeek = false,
  className = '',
}) => {
  const palette = useMemo(() => {
    const key = `${album.artist}-${album.title}`;
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = (hash << 5) - hash + key.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % SLEEVE_PALETTES.length;
    return SLEEVE_PALETTES[idx];
  }, [album.artist, album.title]);

  const sizeClasses = {
    sm: 'w-12 h-12 text-[9px] rounded-lg',
    md: 'w-20 h-20 text-xs rounded-xl',
    lg: 'w-36 h-36 text-sm rounded-2xl',
    xl: 'w-48 h-48 sm:w-64 sm:h-64 text-base rounded-3xl',
  };

  const isPictureDisc = album.format === 'Picture Disc' || album.edition?.toLowerCase().includes('picture disc');
  const isBoxSet = album.format === 'Box Set' || album.edition?.toLowerCase().includes('box set');

  if (album.coverImage) {
    return (
      <div className={`relative aspect-square overflow-hidden shadow-md ${sizeClasses[size]} ${className}`}>
        <img
          src={album.coverImage}
          alt={`${album.title} cover`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {isBoxSet && (
          <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-sm bg-[#2D2D2A]/80 backdrop-blur-xs text-[9px] font-semibold text-[#F4F1EA] uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-2.5 h-2.5" />
            Box Set
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative flex-shrink-0 aspect-square select-none ${sizeClasses[size]} ${className}`}>
      {/* Vinyl Disc Peeking Out if requested */}
      {showDiscPeek && (
        <div
          className="absolute -right-3 top-1 bottom-1 aspect-square rounded-full bg-[#242422] border border-[#3A3A36] shadow-md flex items-center justify-center pointer-events-none -z-10"
          style={{ transform: 'translateX(25%)' }}
        >
          {/* Grooves */}
          <div className="w-[80%] h-[80%] rounded-full border border-[#3A3A36]/80 flex items-center justify-center">
            <div className="w-[65%] h-[65%] rounded-full border border-[#3A3A36]/60 flex items-center justify-center">
              <div className={`w-[35%] h-[35%] rounded-full ${palette.accent} flex items-center justify-center`}>
                <div className="w-1.5 h-1.5 rounded-full bg-[#242422]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Sleeve */}
      <div
        className={`w-full h-full p-2 flex flex-col justify-between overflow-hidden bg-gradient-to-br ${palette.bg} border ${palette.border} shadow-sm relative`}
      >
        {/* Subtle vintage vinyl sleeve spine highlight */}
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-white/10 pointer-events-none" />

        {/* Top bar with edition or format badge */}
        <div className="flex items-center justify-between gap-1 z-10">
          <div className="flex items-center gap-1">
            <Disc3 className={`w-3.5 h-3.5 ${isPictureDisc ? 'text-[#D8DCCB]' : 'text-[#FAF8F5]/70'} opacity-80`} />
            {isBoxSet && (
              <span className="px-1 py-0.2 rounded-xs bg-[#FAF8F5]/20 text-[#FAF8F5] font-mono text-[8px] uppercase tracking-wider">
                Box
              </span>
            )}
            {isPictureDisc && (
              <span className="px-1 py-0.2 rounded-xs bg-[#FAF8F5]/20 text-[#FAF8F5] font-mono text-[8px] uppercase tracking-wider">
                Pic Disc
              </span>
            )}
          </div>
          {album.releaseYear && (
            <span className="font-mono text-[9px] text-[#FAF8F5]/70">
              {album.releaseYear}
            </span>
          )}
        </div>

        {/* Center Vinyl Center Hole / Medallion graphic */}
        <div className="my-auto self-center flex items-center justify-center relative">
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full border border-white/10 flex items-center justify-center bg-black/30">
            <div className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full ${palette.accent} opacity-90 flex items-center justify-center shadow-inner`}>
              <div className="w-1.5 h-1.5 rounded-full bg-[#242422]" />
            </div>
          </div>
        </div>

        {/* Bottom Title & Artist label */}
        <div className="z-10 text-left truncate">
          <p className="font-serif font-medium text-[#FAF8F5] truncate text-[11px] sm:text-xs leading-tight tracking-tight">
            {album.title}
          </p>
          <p className={`font-normal truncate text-[9px] sm:text-[10px] leading-tight mt-0.5 ${palette.text} opacity-90`}>
            {album.artist}
          </p>
        </div>
      </div>
    </div>
  );
};
