import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Compass,
  Shuffle,
  Sparkles,
  RefreshCw,
  PlusCircle,
  Eye,
  Radio,
  Clock,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { Album, ListenLog } from '../types';
import { runDiscovery, DiscoveryMode, DiscoveryCandidate } from '../engines/discoveryEngine';
import { VinylArtwork } from '../components/VinylArtwork';
import { RatingStars } from '../components/RatingStars';

interface DiscoverViewProps {
  albums: Album[];
  listenLogs: ListenLog[];
  onSelectAlbum: (album: Album) => void;
  onLogListen: (album: Album) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  albums,
  listenLogs,
  onSelectAlbum,
  onLogListen,
}) => {
  const [mode, setMode] = useState<DiscoveryMode>('choose_for_me');
  const [candidates, setCandidates] = useState<DiscoveryCandidate[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedDecade, setSelectedDecade] = useState<string>('');

  // Available genres & decades
  const genres = useMemo(() => {
    const s = new Set<string>();
    albums.forEach((a) => a.genres?.forEach((g) => {
      if (g.trim()) s.add(g.trim());
    }));
    return Array.from(s).sort();
  }, [albums]);

  const decades = useMemo(() => {
    const s = new Set<string>();
    albums.forEach((a) => {
      if (a.releaseYear) {
        s.add(`${Math.floor(a.releaseYear / 10) * 10}s`);
      }
    });
    return Array.from(s).sort();
  }, [albums]);

  const refreshCandidates = useCallback((targetMode: DiscoveryMode = mode) => {
    const results = runDiscovery(targetMode, albums, listenLogs, {
      genre: selectedGenre || undefined,
      decade: selectedDecade || undefined,
    });
    setCandidates(results);
  }, [albums, listenLogs, mode, selectedGenre, selectedDecade]);

  useEffect(() => {
    refreshCandidates(mode);
  }, [albums, listenLogs, mode, selectedGenre, selectedDecade, refreshCandidates]);

  const modesConfig: { id: DiscoveryMode; label: string; icon: React.FC<{ className?: string }>; desc: string }[] = [
    {
      id: 'choose_for_me',
      label: 'Choose for Me',
      icon: Compass,
      desc: 'One thoughtful pick from your shelf',
    },
    {
      id: 'blind_pull',
      label: 'Blind Pull',
      icon: Shuffle,
      desc: 'A small group of random records',
    },
    {
      id: 'unplayed',
      label: 'Unplayed',
      icon: Radio,
      desc: 'Records with zero logged listens',
    },
    {
      id: 'fresh_additions',
      label: 'Fresh Additions',
      icon: Sparkles,
      desc: 'Recently added to your collection',
    },
    {
      id: 'genre',
      label: 'Genre / Style',
      icon: Tag,
      desc: 'Filter by sound and style',
    },
    {
      id: 'decade',
      label: 'Era / Decade',
      icon: Clock,
      desc: 'Filter by release decade',
    },
  ];

  if (albums.length === 0) {
    return (
      <div id="discover-empty-collection" className="py-20 text-center space-y-3 rounded-2xl bg-white border border-dashed border-[#D9D4C7] p-8 shadow-xs">
        <Compass className="w-12 h-12 text-[#8B8C7A] mx-auto" />
        <h3 className="font-serif text-lg font-semibold text-[#2D2D2A]">No records in collection</h3>
        <p className="text-xs text-[#726E65] max-w-sm mx-auto">
          Discovery selects records from your registry. Add some records to get started!
        </p>
      </div>
    );
  }

  return (
    <div id="discover-view" className="space-y-6">
      {/* Mode Selector Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#5D614E]" />
            <h2 className="font-serif text-xl font-semibold text-[#2D2D2A] tracking-tight">Discover</h2>
          </div>
          <button
            id="discover-choose-again-btn"
            onClick={() => refreshCandidates()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#D9D4C7] hover:bg-[#EAE6DC] text-xs font-medium text-[#474A3D] active:scale-95 transition shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#5D614E]" />
            <span>Choose Again</span>
          </button>
        </div>

        {/* Mode Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {modesConfig.map((m) => {
            const Icon = m.icon;
            const isSelected = mode === m.id;
            return (
              <button
                key={m.id}
                id={`discover-mode-${m.id}`}
                onClick={() => setMode(m.id)}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#EAE6DC] border-[#5D614E] text-[#2D2D2A] shadow-xs'
                    : 'bg-white border-[#D9D4C7] text-[#726E65] hover:bg-[#FAF8F5] hover:text-[#2D2D2A]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-[#5D614E]' : 'text-[#8B8C7A]'}`} />
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#5D614E]" />}
                </div>
                <div>
                  <span className={`text-xs font-semibold block ${isSelected ? 'text-[#474A3D]' : 'text-[#2D2D2A]'}`}>
                    {m.label}
                  </span>
                  <span className="text-[10px] text-[#726E65] leading-tight block mt-0.5 line-clamp-1">
                    {m.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Genre Filter Sub-controls */}
      {mode === 'genre' && (
        <div className="p-4 rounded-2xl bg-white border border-[#D9D4C7] shadow-xs space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#2D2D2A]">Select Genre</span>
            {selectedGenre && (
              <button
                onClick={() => setSelectedGenre('')}
                className="text-[11px] text-[#5D614E] hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedGenre('')}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium transition ${
                selectedGenre === ''
                  ? 'bg-[#5D614E] text-[#FAF8F5] border border-[#4E5240]'
                  : 'bg-[#FCFAF6] text-[#555846] border border-[#D9D4C7] hover:bg-[#FAF8F5]'
              }`}
            >
              All Genres
            </button>
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(selectedGenre === g ? '' : g)}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium transition ${
                  selectedGenre === g
                    ? 'bg-[#5D614E] text-[#FAF8F5] border border-[#4E5240]'
                    : 'bg-[#FCFAF6] text-[#555846] border border-[#D9D4C7] hover:bg-[#FAF8F5]'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Era / Decade Filter Sub-controls */}
      {mode === 'decade' && (
        <div className="p-4 rounded-2xl bg-white border border-[#D9D4C7] shadow-xs space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#2D2D2A]">Select Release Era</span>
            {selectedDecade && (
              <button
                onClick={() => setSelectedDecade('')}
                className="text-[11px] text-[#5D614E] hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedDecade('')}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium transition ${
                selectedDecade === ''
                  ? 'bg-[#5D614E] text-[#FAF8F5] border border-[#4E5240]'
                  : 'bg-[#FCFAF6] text-[#555846] border border-[#D9D4C7] hover:bg-[#FAF8F5]'
              }`}
            >
              All Eras
            </button>
            {decades.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDecade(selectedDecade === d ? '' : d)}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium transition ${
                  selectedDecade === d
                    ? 'bg-[#5D614E] text-[#FAF8F5] border border-[#4E5240]'
                    : 'bg-[#FCFAF6] text-[#555846] border border-[#D9D4C7] hover:bg-[#FAF8F5]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty States Handling */}
      {candidates.length === 0 && (
        <div className="py-12 px-6 rounded-3xl bg-white border border-[#D9D4C7] text-center space-y-3 shadow-xs">
          {mode === 'unplayed' ? (
            <>
              <CheckCircle2 className="w-10 h-10 text-[#5D614E] mx-auto" />
              <h3 className="font-serif text-lg font-semibold text-[#2D2D2A]">Every record has been spun!</h3>
              <p className="text-xs text-[#726E65] max-w-md mx-auto">
                You have logged listens for all records in your collection. Ready for another spin?
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  onClick={() => setMode('choose_for_me')}
                  className="px-4 py-2 rounded-xl bg-[#5D614E] text-[#FAF8F5] text-xs font-medium transition hover:bg-[#4E5240]"
                >
                  Choose for Me
                </button>
                <button
                  onClick={() => setMode('blind_pull')}
                  className="px-4 py-2 rounded-xl bg-[#EAE6DC] text-[#2D2D2A] text-xs font-medium border border-[#D9D4C7] transition hover:bg-[#D9D4C7]"
                >
                  Blind Pull
                </button>
              </div>
            </>
          ) : mode === 'genre' ? (
            <>
              <Tag className="w-10 h-10 text-[#8B8C7A] mx-auto" />
              <h3 className="font-serif text-lg font-semibold text-[#2D2D2A]">No records found</h3>
              <p className="text-xs text-[#726E65] max-w-md mx-auto">
                No albums in your collection match the genre "{selectedGenre}".
              </p>
              <button
                onClick={() => setSelectedGenre('')}
                className="mt-2 px-4 py-2 rounded-xl bg-[#5D614E] text-[#FAF8F5] text-xs font-medium transition hover:bg-[#4E5240]"
              >
                Clear Genre Filter
              </button>
            </>
          ) : mode === 'decade' ? (
            <>
              <Clock className="w-10 h-10 text-[#8B8C7A] mx-auto" />
              <h3 className="font-serif text-lg font-semibold text-[#2D2D2A]">No records found</h3>
              <p className="text-xs text-[#726E65] max-w-md mx-auto">
                No albums in your collection were released in the {selectedDecade}.
              </p>
              <button
                onClick={() => setSelectedDecade('')}
                className="mt-2 px-4 py-2 rounded-xl bg-[#5D614E] text-[#FAF8F5] text-xs font-medium transition hover:bg-[#4E5240]"
              >
                Clear Era Filter
              </button>
            </>
          ) : (
            <>
              <Compass className="w-10 h-10 text-[#8B8C7A] mx-auto" />
              <h3 className="font-serif text-lg font-semibold text-[#2D2D2A]">No matches</h3>
              <p className="text-xs text-[#726E65] max-w-md mx-auto">
                No records currently match this mode.
              </p>
              <button
                onClick={() => setMode('choose_for_me')}
                className="mt-2 px-4 py-2 rounded-xl bg-[#5D614E] text-[#FAF8F5] text-xs font-medium transition hover:bg-[#4E5240]"
              >
                Reset to Choose for Me
              </button>
            </>
          )}
        </div>
      )}

      {/* Discovery Candidates Presentation */}
      <div className="space-y-4">
        {candidates.map(({ album, reason, playCount }, index) => {
          const isFeatured = mode === 'choose_for_me';

          return (
            <div
              key={`${album.id}-${index}`}
              className="p-4 sm:p-6 rounded-3xl bg-white border border-[#D9D4C7] text-[#2D2D2A] shadow-xs hover:shadow-md transition-all"
            >
              {/* Reason & Status Badges */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#EAE6DC] text-[#474A3D] border border-[#D9D4C7] flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#5D614E]" />
                  <span>{reason}</span>
                </span>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                  playCount > 0
                    ? 'bg-[#FCFAF6] text-[#474A3D] border-[#D9D4C7]'
                    : 'bg-[#FAF8F5] text-[#8B8C7A] border-[#E8E4D8]'
                }`}>
                  {playCount > 0 ? `Spun ${playCount}×` : 'Unplayed'}
                </span>
              </div>

              {/* Main Content */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div
                  className="cursor-pointer group flex-shrink-0"
                  onClick={() => onSelectAlbum(album)}
                >
                  <VinylArtwork
                    album={album}
                    size={isFeatured ? 'xl' : 'lg'}
                    showDiscPeek
                  />
                </div>

                <div className="flex-1 text-center sm:text-left min-w-0 w-full space-y-2">
                  <div>
                    <h3
                      onClick={() => onSelectAlbum(album)}
                      className="font-serif text-xl sm:text-2xl font-semibold text-[#2D2D2A] hover:text-[#5D614E] cursor-pointer transition-colors leading-tight"
                    >
                      {album.title}
                    </h3>
                    <p className="text-base text-[#726E65] font-normal mt-0.5">{album.artist}</p>
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-[#555846] font-mono pt-1">
                    {album.releaseYear && (
                      <span className="px-2 py-0.5 rounded bg-[#F4F1EA] border border-[#D9D4C7]">
                        {album.releaseYear}
                      </span>
                    )}
                    {album.format && (
                      <span className="px-2 py-0.5 rounded bg-[#F4F1EA] border border-[#D9D4C7]">
                        {album.format}
                      </span>
                    )}
                    {album.edition && (
                      <span className="px-2 py-0.5 rounded bg-[#EAE6DC] text-[#474A3D] border border-[#D9D4C7]">
                        {album.edition}
                      </span>
                    )}
                    {album.variant && (
                      <span className="px-2 py-0.5 rounded bg-[#F4F1EA] border border-[#D9D4C7]">
                        {album.variant}
                      </span>
                    )}
                  </div>

                  {album.personalRating !== undefined && album.personalRating > 0 && (
                    <div className="pt-1 flex justify-center sm:justify-start">
                      <RatingStars value={album.personalRating} size="sm" showLabel />
                    </div>
                  )}

                  {album.notes && (
                    <p className="text-xs text-[#726E65] italic line-clamp-2 pt-1">
                      "{album.notes}"
                    </p>
                  )}

                  {/* Actions */}
                  <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <button
                      id={`discover-log-listen-btn-${album.id}`}
                      onClick={() => onLogListen(album)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5D614E] hover:bg-[#4E5240] active:scale-98 text-[#FAF8F5] text-xs font-medium transition shadow-xs"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Log Listen</span>
                    </button>
                    <button
                      id={`discover-view-details-btn-${album.id}`}
                      onClick={() => onSelectAlbum(album)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EAE6DC] hover:bg-[#D9D4C7] text-[#2D2D2A] text-xs font-medium border border-[#D9D4C7] transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
