import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Download,
  Upload,
  FileSpreadsheet,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  HardDrive,
  CheckCircle2,
  Bookmark,
} from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  onExportJSON: () => Promise<string>;
  onImportJSON: (
    jsonString: string,
    mode: 'replace' | 'merge'
  ) => Promise<{ importedAlbums?: number; importedLogs?: number; importedWishlist?: number; albums?: number; logs?: number }>;
  onExportCSV: (type: 'library' | 'listens' | 'wishlist') => string;
  onResetToCatalogue: () => Promise<void>;
  collectionCount: number;
  listenCount: number;
  wishlistCount?: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  onExportJSON,
  onImportJSON,
  onExportCSV,
  onResetToCatalogue,
  collectionCount,
  listenCount,
  wishlistCount = 0,
}) => {
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showResetConfirm) {
          setShowResetConfirm(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showResetConfirm, onClose]);

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = async () => {
    try {
      setProcessing(true);
      const json = await onExportJSON();
      const date = new Date().toISOString().substring(0, 10);
      downloadFile(json, `vinyl-registry-backup-${date}.json`, 'application/json');
      setStatusMessage({ type: 'success', text: 'Full canonical JSON backup downloaded.' });
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to export backup.' });
    } finally {
      setProcessing(false);
    }
  };

  const handleExportCSV = (type: 'library' | 'listens' | 'wishlist') => {
    try {
      const csv = onExportCSV(type);
      const date = new Date().toISOString().substring(0, 10);
      const typeLabel =
        type === 'library' ? 'records' : type === 'listens' ? 'listening-history' : 'wishlist';
      downloadFile(csv, `vinyl-${typeLabel}-${date}.csv`, 'text/csv;charset=utf-8;');
      setStatusMessage({
        type: 'success',
        text: `${type === 'library' ? 'Library records' : type === 'listens' ? 'Listening history' : 'Wishlist'} exported as CSV.`,
      });
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to export CSV.' });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setProcessing(true);
      setStatusMessage(null);
      const text = await file.text();
      const res = await onImportJSON(text, importMode);
      const albCount = res.importedAlbums ?? res.albums ?? 0;
      const logCount = res.importedLogs ?? res.logs ?? 0;
      const wishCount = res.importedWishlist ?? 0;
      setStatusMessage({
        type: 'success',
        text: `Validation successful! Restored ${albCount} records, ${logCount} listening logs, and ${wishCount} wishlist items (${importMode} mode).`,
      });
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Invalid backup file or validation failed.',
      });
    } finally {
      setProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReset = async () => {
    try {
      setProcessing(true);
      await onResetToCatalogue();
      setShowResetConfirm(false);
      setStatusMessage({
        type: 'success',
        text: 'Reset collection to initial 72 records.',
      });
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to reset collection' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      id="settings-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-[#2D2D2A]/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="w-full max-w-xl rounded-3xl bg-[#F4F1EA] border border-[#D9D4C7] text-[#2D2D2A] shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#D9D4C7]">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-[#5D614E]" />
            <h3 className="font-serif text-base font-semibold text-[#2D2D2A]">
              Data Portability & Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#726E65] hover:text-[#2D2D2A] hover:bg-[#EAE6DC] rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alert */}
        {statusMessage && (
          <div
            className={`p-3 rounded-2xl text-xs flex items-start gap-2 leading-relaxed whitespace-pre-line ${
              statusMessage.type === 'success'
                ? 'bg-[#5D614E]/15 text-[#3D4132] border border-[#5D614E]/30'
                : 'bg-[#8A5A53]/15 text-[#733F39] border border-[#8A5A53]/30'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            )}
            <span className="flex-1">{statusMessage.text}</span>
          </div>
        )}

        {/* Storage Health & Registry Overview */}
        <div className="p-4 rounded-2xl bg-white border border-[#D9D4C7] flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#2D2D2A]">
              <ShieldCheck className="w-4 h-4 text-[#5D614E]" />
              <span>Local Storage (IndexedDB)</span>
            </div>
            <p className="text-[11px] text-[#726E65]">
              Private and persistent in your browser. 100% functional offline without servers.
            </p>
          </div>
          <div className="text-right font-mono text-xs text-[#2D2D2A]">
            <div className="font-semibold">{collectionCount} records</div>
            <div className="text-[10px] text-[#726E65]">{listenCount} listens</div>
            <div className="text-[10px] text-[#5D614E]">{wishlistCount} wishlist</div>
          </div>
        </div>

        {/* Backup & Portability */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-[#726E65]">
            Export & Portability
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* JSON Backup */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#D9D4C7] flex flex-col justify-between gap-3 shadow-xs">
              <div>
                <span className="text-xs font-semibold text-[#2D2D2A] block">Full JSON Backup</span>
                <p className="text-[11px] text-[#726E65] mt-0.5">
                  Authoritative, full-fidelity archive including all records, pressings, ratings, listening logs & wishlist.
                </p>
              </div>
              <button
                id="export-json-backup-btn"
                onClick={handleExportJSON}
                disabled={processing}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#5D614E] hover:bg-[#4E5240] active:scale-98 text-xs font-medium text-[#FAF8F5] transition disabled:opacity-50 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON Backup</span>
              </button>
            </div>

            {/* CSV Interoperability Exports */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#D9D4C7] flex flex-col justify-between gap-3 shadow-xs">
              <div>
                <span className="text-xs font-semibold text-[#2D2D2A] block">Spreadsheet Export (CSV)</span>
                <p className="text-[11px] text-[#726E65] mt-0.5">
                  Universal CSV format for external analysis in Excel, Numbers, or spreadsheet archives.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => handleExportCSV('library')}
                  className="flex items-center justify-center gap-1 py-1.5 px-1 rounded-xl bg-[#EAE6DC] hover:bg-[#D9D4C7] text-[11px] font-medium text-[#2D2D2A] transition"
                  title="Export collection albums to CSV"
                >
                  <FileSpreadsheet className="w-3 h-3 flex-shrink-0" />
                  <span>Records</span>
                </button>
                <button
                  onClick={() => handleExportCSV('listens')}
                  className="flex items-center justify-center gap-1 py-1.5 px-1 rounded-xl bg-[#EAE6DC] hover:bg-[#D9D4C7] text-[11px] font-medium text-[#2D2D2A] transition"
                  title="Export listening journal to CSV"
                >
                  <FileSpreadsheet className="w-3 h-3 flex-shrink-0" />
                  <span>Listens</span>
                </button>
                <button
                  onClick={() => handleExportCSV('wishlist')}
                  className="flex items-center justify-center gap-1 py-1.5 px-1 rounded-xl bg-[#EAE6DC] hover:bg-[#D9D4C7] text-[11px] font-medium text-[#2D2D2A] transition"
                  title="Export crate wishlist to CSV"
                >
                  <Bookmark className="w-3 h-3 flex-shrink-0" />
                  <span>Wishlist</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Restore Backup with Validation */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#726E65]">
              Restore Backup
            </h4>
            <span className="text-[11px] text-[#5D614E] font-medium">Validated before import</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#D9D4C7] space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#726E65] font-medium">Import Mode:</span>
              <div className="flex gap-1 bg-[#F4F1EA] border border-[#D9D4C7] p-0.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setImportMode('replace')}
                  className={`px-2.5 py-1 rounded-lg transition text-xs ${
                    importMode === 'replace'
                      ? 'bg-[#5D614E] text-[#FAF8F5] font-medium shadow-xs'
                      : 'text-[#726E65] hover:text-[#2D2D2A]'
                  }`}
                >
                  Replace All
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode('merge')}
                  className={`px-2.5 py-1 rounded-lg transition text-xs ${
                    importMode === 'merge'
                      ? 'bg-[#5D614E] text-[#FAF8F5] font-medium shadow-xs'
                      : 'text-[#726E65] hover:text-[#2D2D2A]'
                  }`}
                >
                  Merge Non-duplicates
                </button>
              </div>
            </div>

            <p className="text-[11px] text-[#726E65]">
              {importMode === 'replace'
                ? 'Replace mode will atomically clear the existing database and replace it with the verified backup archive.'
                : 'Merge mode will keep existing records and add or update incoming entries from the backup file.'}
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              id="import-json-backup-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={processing}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#EAE6DC] hover:bg-[#D9D4C7] text-xs font-medium text-[#2D2D2A] transition active:scale-98"
            >
              <Upload className="w-4 h-4" />
              <span>Select Valid JSON Backup to Restore</span>
            </button>
          </div>
        </div>

        {/* Reset Collection */}
        <div className="pt-2 border-t border-[#D9D4C7] flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#2D2D2A] block">Reset to Catalogue</span>
            <span className="text-[11px] text-[#726E65]">Restore original 72 initial catalogue records</span>
          </div>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#8A5A53]/10 text-[#8A5A53] border border-[#D9D4C7] hover:border-[#8A5A53]/40 text-xs transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Catalogue</span>
          </button>
        </div>

        {/* Reset Confirmation */}
        {showResetConfirm && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowResetConfirm(false);
            }}
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#2D2D2A]/60 backdrop-blur-xs"
          >
            <div className="w-full max-w-sm rounded-3xl bg-white border border-[#D9D4C7] text-[#2D2D2A] shadow-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-[#8A5A53]">
                <AlertTriangle className="w-5 h-5" />
                <h4 className="font-serif text-base font-semibold text-[#2D2D2A]">Reset to Initial Catalogue?</h4>
              </div>

              <p className="text-xs text-[#726E65] leading-relaxed">
                This will re-seed your local database with the original 72 vinyl records from your catalogue, clearing custom additions, listening logs, and wishlist items.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-3.5 py-2 rounded-xl bg-[#EAE6DC] text-xs text-[#2D2D2A] hover:bg-[#D9D4C7]"
                >
                  Cancel
                </button>
                <button
                  id="confirm-reset-catalogue-btn"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-[#8A5A53] hover:bg-[#733F39] text-xs font-medium text-[#FAF8F5] shadow-xs"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
