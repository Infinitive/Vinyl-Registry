import React, { useState, useEffect } from 'react';
import {
  X,
  Edit3,
  Trash2,
  PlusCircle,
  Calendar,
  DollarSign,
  Disc,
  Clock,
  FileText,
  Database,
} from 'lucide-react';
import { Album, ListenLog } from '../types';
import { VinylArtwork } from './VinylArtwork';
import { RatingStars } from './RatingStars';

interface RecordDetailModalProps {
  album: Album;
  listenLogs: ListenLog[];
  playCount: number;
  lastPlayed?: string;
  onClose: () => void;
  onEdit: (album: Album) => void;
  onDelete: (albumId: string) => void;
  onLogListen: (album: Album) => void;
  onDeleteListenLog: (logId: string) => void;
  onUpdateRating: (album: Album, newRating: number) => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  album,
  listenLogs,
  playCount,
  lastPlayed,
  onClose,
  onEdit,
  onDelete,
  onLogListen,
  onDeleteListenLog,
  onUpdateRating,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDeleteConfirm, onClose]);

  const albumLogs = listenLogs
    .filter((l) => l.recordId === album.id)
    .sort((a, b) => new Date(b.listenedAt).getTime() - new Date(a.listenedAt).getTime());

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return 'Never';
    try {
      return new Date(isoStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  const formatDateTime = (isoStr?: string) => {
    if (!isoStr) return 'Never';
    try {
      const d = new Date(isoStr);
      return (
        d.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }) +
        ' · ' +
        d.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        })
      );
    } catch {
      return isoStr;
    }
  };

  return (
    <div
      id="record-detail-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-[#2D2D2A]/60 backdrop-blur-sm flex justify-center p-0 sm:p-4 md:p-6"
    >
      <div
        id="record-detail-container"
        className="w-full max-w-3xl min-h-screen sm:min-h-0 sm:my-auto rounded-none sm:rounded-3xl bg-[#F4F1EA] border-0 sm:border border-[#D9D4C7] text-[#2D2D2A] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Sticky Mobile/Desktop Top Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[#F4F1EA]/95 backdrop-blur-md border-b border-[#D9D4C7]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-mono text-[#726E65] uppercase tracking-wider">Record Details</span>
            {album.edition && (
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#EAE6DC] text-[#474A3D] border border-[#D9D4C7] truncate max-w-[200px]">
                {album.edition}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              id="detail-edit-btn"
              onClick={() => onEdit(album)}
              className="p-2 text-[#726E65] hover:text-[#2D2D2A] hover:bg-[#EAE6DC] rounded-full transition"
              title="Edit Album"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              id="detail-delete-btn"
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-[#726E65] hover:text-[#8A5A53] hover:bg-[#8A5A53]/10 rounded-full transition"
              title="Delete Record"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              id="detail-close-btn"
              onClick={onClose}
              className="p-2 text-[#726E65] hover:text-[#2D2D2A] hover:bg-[#EAE6DC] rounded-full transition ml-1"
              title="Close Details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto pb-12 sm:pb-6">
          {/* SECTION 1: OVERVIEW */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-4 sm:p-6 rounded-2xl bg-white border border-[#D9D4C7] shadow-xs">
            <div className="flex-shrink-0 flex justify-center">
              <VinylArtwork album={album} size="xl" showDiscPeek />
            </div>

            <div className="flex-1 text-center sm:text-left min-w-0 w-full">
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#2D2D2A] tracking-tight leading-tight">
                {album.title}
              </h2>
              <p className="text-base sm:text-lg font-normal text-[#5D614E] mt-1">
                {album.artist}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3 text-xs text-[#555846] font-mono">
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
                {album.rpm && (
                  <span className="px-2 py-0.5 rounded bg-[#F4F1EA] border border-[#D9D4C7]">
                    {album.rpm} RPM
                  </span>
                )}
                {album.discCount && album.discCount > 1 && (
                  <span className="px-2 py-0.5 rounded bg-[#F4F1EA] border border-[#D9D4C7]">
                    {album.discCount}× Disc
                  </span>
                )}
              </div>

              {/* Classification: Genre & Style */}
              <div className="mt-3.5 pt-3 border-t border-[#EFECE4] space-y-1.5 text-xs text-left">
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#726E65] w-14 shrink-0">
                    Genre
                  </span>
                  <span className="text-[#2D2D2A] font-medium">
                    {album.genres && album.genres.length > 0 ? (
                      album.genres.join(' · ')
                    ) : (
                      <span className="text-[#8B8C7A] italic font-normal">Unassigned</span>
                    )}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#726E65] w-14 shrink-0">
                    Style
                  </span>
                  <span className="text-[#555846]">
                    {album.styles && album.styles.length > 0 ? (
                      album.styles.join(' · ')
                    ) : (
                      <span className="text-[#8B8C7A] italic font-normal">Unassigned</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Personal Rating Row with direct half-star control */}
              <div className="mt-3 pt-3 border-t border-[#EFECE4] flex flex-col sm:flex-row items-center sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#726E65] font-medium">Personal Rating:</span>
                  <RatingStars
                    value={album.personalRating || 0}
                    onChange={(newVal) => onUpdateRating(album, newVal)}
                    size="md"
                    showLabel
                  />
                </div>
                <button
                  id="detail-log-spin-btn"
                  onClick={() => onLogListen(album)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#5D614E] hover:bg-[#4E5240] active:scale-98 text-[#FAF8F5] text-xs font-medium transition shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Log Spin</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 2: EDITION & PRESSING DETAILS */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#D9D4C7] space-y-3 shadow-xs">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#726E65] flex items-center gap-1.5">
              <Disc className="w-3.5 h-3.5 text-[#5D614E]" />
              <span>Edition & Physical Record Details</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7]">
                <span className="text-[#726E65] block text-[11px]">Format</span>
                <span className="text-[#2D2D2A] font-medium">{album.format || 'Not specified'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7]">
                <span className="text-[#726E65] block text-[11px]">Edition</span>
                <span className="text-[#2D2D2A] font-medium">{album.edition || 'Not specified'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7]">
                <span className="text-[#726E65] block text-[11px]">Color / Variant</span>
                <span className="text-[#2D2D2A] font-medium">
                  {album.variant || 'Not specified'}
                  {album.vinylWeight && (
                    <span className="ml-1 text-[10px] text-[#726E65] font-mono">({album.vinylWeight})</span>
                  )}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7]">
                <span className="text-[#726E65] block text-[11px]">Record Label</span>
                <span className="text-[#2D2D2A] font-medium">{album.label || 'Not specified'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7]">
                <span className="text-[#726E65] block text-[11px]">Speed</span>
                <span className="text-[#2D2D2A] font-medium">{album.rpm ? `${album.rpm} RPM` : 'Not specified'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7]">
                <span className="text-[#726E65] block text-[11px]">Country</span>
                <span className="text-[#2D2D2A] font-medium">{album.country || 'Not specified'}</span>
              </div>
              {album.physicalIdentifier && (
                <div className="p-2.5 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] col-span-2 sm:col-span-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[#726E65] block text-[11px]">Physical Identifier</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#EAE6DC] text-[#474A3D] font-mono">
                      {album.identifierType || 'verbatim'}
                    </span>
                  </div>
                  <span className="text-[#2D2D2A] font-mono font-medium block mt-0.5">{album.physicalIdentifier}</span>
                </div>
              )}
              {album.catalogNumber && (
                <div className="p-2.5 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] col-span-2 sm:col-span-1">
                  <span className="text-[#726E65] block text-[11px]">Catalog #</span>
                  <span className="text-[#2D2D2A] font-mono">{album.catalogNumber}</span>
                </div>
              )}
              {album.barcode && (
                <div className="p-2.5 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] col-span-2 sm:col-span-1">
                  <span className="text-[#726E65] block text-[11px]">Barcode (UPC/EAN)</span>
                  <span className="text-[#2D2D2A] font-mono">{album.barcode}</span>
                </div>
              )}
              {album.pressingPlant && (
                <div className="p-2.5 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] col-span-2 sm:col-span-1">
                  <span className="text-[#726E65] block text-[11px]">Pressing Plant</span>
                  <span className="text-[#2D2D2A] font-medium">{album.pressingPlant}</span>
                </div>
              )}
              {album.matrixRunout && (
                <div className="p-2.5 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] col-span-2 sm:col-span-3">
                  <span className="text-[#726E65] block text-[11px]">Matrix / Runout Grooves</span>
                  <span className="text-[#2D2D2A] font-mono text-[11px] break-all text-[#3F3F3B]">{album.matrixRunout}</span>
                </div>
              )}
            </div>

            {album.packagingExtras && album.packagingExtras.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] text-[#726E65] block mb-1.5 font-medium">Packaging Extras & Inserts:</span>
                <div className="flex flex-wrap gap-1.5">
                  {album.packagingExtras.map((extra, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-[#F4F1EA] border border-[#D9D4C7] text-xs text-[#474A3D]"
                    >
                      {extra}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: PERSONAL NOTES & ACQUISITION */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#D9D4C7] space-y-3 shadow-xs">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#726E65] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#5D614E]" />
              <span>Personal Notes & Acquisition</span>
            </h3>

            {album.notes ? (
              <div className="p-3.5 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] text-sm text-[#2D2D2A] whitespace-pre-wrap leading-relaxed">
                {album.notes}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-[#FCFAF6] border border-dashed border-[#D9D4C7] text-xs text-[#726E65] italic">
                No personal notes added yet. Tap "Edit" to add thoughts, memories, or pressing impressions.
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7]">
                <DollarSign className="w-4 h-4 text-[#8B8C7A]" />
                <div>
                  <span className="text-[#726E65] text-[11px] block font-medium">Purchase Price</span>
                  <span className="text-[#2D2D2A] font-medium">
                    {album.purchasePrice !== undefined ? `$${album.purchasePrice.toFixed(2)}` : 'Not specified'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7]">
                <Calendar className="w-4 h-4 text-[#8B8C7A]" />
                <div>
                  <span className="text-[#726E65] text-[11px] block font-medium">Purchase Date</span>
                  <span className="text-[#2D2D2A] font-medium">
                    {album.purchaseDate ? formatDate(album.purchaseDate) : 'Not specified'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: LISTENING HISTORY */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#D9D4C7] space-y-3 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#726E65] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#5D614E]" />
                  <span>Listening History</span>
                </h3>
                <span className="px-2 py-0.5 rounded bg-[#EAE6DC] text-[#474A3D] border border-[#D9D4C7] text-xs font-mono font-medium">
                  {playCount} {playCount === 1 ? 'Listen' : 'Listens'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {lastPlayed && (
                  <span className="text-[11px] font-mono text-[#726E65] hidden sm:inline">
                    Last: {formatDate(lastPlayed)}
                  </span>
                )}
                <button
                  id="record-detail-log-listen-btn"
                  onClick={() => onLogListen(album)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#5D614E] hover:bg-[#4E5240] text-[#FAF8F5] text-xs font-medium transition shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Log Listen</span>
                </button>
              </div>
            </div>

            {albumLogs.length === 0 ? (
              <div className="p-5 rounded-xl bg-[#FCFAF6] border border-dashed border-[#D9D4C7] text-center space-y-2">
                <p className="font-serif text-base font-semibold text-[#2D2D2A]">No listens logged yet</p>
                <p className="text-xs text-[#726E65]">
                  Log your first listen to start tracking your personal listening history for this record.
                </p>
                <button
                  onClick={() => onLogListen(album)}
                  className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#5D614E] hover:bg-[#4E5240] text-[#FAF8F5] text-xs font-medium transition shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Log First Listen
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {albumLogs.map((log) => (
                  <div
                    key={log.id}
                    id={`listen-log-${log.id}`}
                    className="p-3 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7] flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[#2D2D2A] font-medium">
                          {formatDateTime(log.listenedAt)}
                        </span>
                        {log.rating !== undefined && log.rating > 0 && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white border border-[#D9D4C7] text-[11px] text-[#474A3D]">
                            <span>Session:</span>
                            <RatingStars value={log.rating} size="sm" />
                          </span>
                        )}
                        {log.context && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#EAE6DC] text-[#474A3D] border border-[#D9D4C7]">
                            {log.context}
                          </span>
                        )}
                      </div>
                      {log.note && (
                        <p className="text-[#726E65] text-xs italic mt-1 leading-relaxed">"{log.note}"</p>
                      )}
                    </div>
                    <button
                      id={`delete-log-btn-${log.id}`}
                      onClick={() => onDeleteListenLog(log.id)}
                      className="text-[#8B8C7A] hover:text-[#8A5A53] p-1.5 rounded-lg hover:bg-[#EAE6DC] transition"
                      title="Delete this listen entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 5: RESEARCH & REGISTRY METADATA */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#D9D4C7] space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#726E65] flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#5D614E]" />
                <span>Research Baseline & Registry Metadata</span>
              </h3>
              {album.confidence && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
                    album.confidence.toLowerCase().includes('high')
                      ? 'bg-[#5D614E]/10 text-[#5D614E] border-[#5D614E]/25'
                      : album.confidence.toLowerCase().includes('likely')
                      ? 'bg-[#B08930]/10 text-[#84631B] border-[#B08930]/30'
                      : 'bg-[#8A5A53]/10 text-[#733F39] border-[#8A5A53]/30'
                  }`}
                >
                  {album.confidence}
                </span>
              )}
            </div>

            {/* Research status banner if discrepancies, physical confirmation, or notes exist */}
            {(album.researchStatus || album.physicalConfirmation || album.researchNotes || (album.researchConflicts && album.researchConflicts.length > 0)) && (
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#D9D4C7] text-xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {album.researchStatus && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#726E65] text-[11px] font-medium">Status:</span>
                      <span className="font-mono text-[#2D2D2A] font-medium capitalize">
                        {album.researchStatus}
                      </span>
                    </div>
                  )}
                  {album.physicalConfirmation && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#726E65] text-[11px] font-medium">Physical Verification:</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                          album.physicalConfirmation.includes('required')
                            ? 'bg-[#B08930]/15 text-[#6D5215] border border-[#B08930]/30 font-medium'
                            : 'bg-[#EAE6DC] text-[#474A3D]'
                        }`}
                      >
                        {album.physicalConfirmation}
                      </span>
                    </div>
                  )}
                </div>

                {album.researchNotes && (
                  <div className="pt-2 border-t border-[#EAE6DC]">
                    <span className="text-[#726E65] text-[11px] block font-medium">Research Notes & Catalog Provenance:</span>
                    <p className="text-[#3F3F3B] text-xs leading-relaxed mt-0.5">{album.researchNotes}</p>
                  </div>
                )}

                {album.researchConflicts && album.researchConflicts.length > 0 && (
                  <div className="pt-2 border-t border-[#EAE6DC]">
                    <span className="text-[#8A5A53] text-[11px] block font-medium">Recorded Discrepancies:</span>
                    <ul className="list-disc list-inside text-xs text-[#733F39] mt-0.5 space-y-0.5">
                      {album.researchConflicts.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7]">
                <span className="text-[#726E65] block text-[11px] font-medium">Unique Record ID</span>
                <span className="text-[#2D2D2A] font-mono text-xs break-all">{album.id}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7]">
                <span className="text-[#726E65] block text-[11px] font-medium">Added to Collection</span>
                <span className="text-[#2D2D2A] font-medium">{formatDate(album.addedAt)}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7]">
                <span className="text-[#726E65] block text-[11px] font-medium">Last Modified</span>
                <span className="text-[#2D2D2A] font-medium">{formatDate(album.updatedAt)}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FCFAF6] border border-[#D9D4C7]">
                <span className="text-[#726E65] block text-[11px] font-medium">Discogs ID</span>
                <span className="text-[#2D2D2A] font-medium">
                  {album.discogsId ? album.discogsId : 'Not linked'}
                </span>
              </div>
            </div>

            <div className="pt-1 flex items-center gap-2 text-[11px] text-[#726E65]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5D614E]"></span>
              <span>Stored locally in browser IndexedDB (Phase 6 Research Master v2.0 baseline)</span>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowDeleteConfirm(false);
            }}
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#2D2D2A]/60 backdrop-blur-xs"
          >
            <div className="w-full max-w-md rounded-2xl bg-white border border-[#D9D4C7] p-5 text-[#2D2D2A] shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-[#8A5A53]">
                <div className="w-10 h-10 rounded-xl bg-[#8A5A53]/15 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-[#8A5A53]" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-semibold text-[#2D2D2A]">Delete from Registry?</h4>
                  <p className="text-xs text-[#726E65]">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-xs text-[#2D2D2A] leading-relaxed">
                Are you sure you want to delete <strong>"{album.title}"</strong> by <strong>{album.artist}</strong>?
                {playCount > 0 && (
                  <span className="block mt-1 text-[#733F39] font-medium">
                    Note: Deleting this album will also safely remove its {playCount} listening log entries to prevent orphaned data.
                  </span>
                )}
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D9D4C7]">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-xl bg-[#EAE6DC] hover:bg-[#D9D4C7] text-xs font-medium text-[#2D2D2A] transition"
                >
                  Cancel
                </button>
                <button
                  id="confirm-delete-album-btn"
                  onClick={() => {
                    onDelete(album.id);
                    setShowDeleteConfirm(false);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-xl bg-[#8A5A53] hover:bg-[#733F39] text-xs font-medium text-[#FAF8F5] transition shadow-xs"
                >
                  Delete Record
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
