import React, { useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, hide the prompt
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-[#EAE6DC] text-[#474A3D] border border-[#D9D4C7] hover:bg-[#D8DCCB] active:scale-95 transition-all shadow-xs"
        title="Install as Progressive Web App"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="pwa-ios-guide-btn"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-[#EAE6DC] text-[#474A3D] border border-[#D9D4C7] hover:bg-[#D8DCCB] active:scale-95 transition-all"
          title="Install on iPhone / iPad"
        >
          <Share className="w-3.5 h-3.5" />
          <span>Add to Home</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#2D2D2A]/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-[#FCFAF6] border border-[#D9D4C7] p-5 text-[#2D2D2A] shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#D9D4C7]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#EFECE4] border border-[#D9D4C7] flex items-center justify-center text-[#5D614E]">
                    <Share className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif text-sm font-semibold text-[#2D2D2A]">Add to Home Screen</h3>
                    <p className="text-xs text-[#726E65]">Install for offline collection access</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1.5 text-[#726E65] hover:text-[#2D2D2A] rounded-full hover:bg-[#EAE6DC]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-[#3F3F3B]">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#EFECE4] border border-[#D9D4C7]">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#5D614E] text-[#FAF8F5] font-semibold flex items-center justify-center text-xs">
                    1
                  </span>
                  <span>Tap the <strong>Share</strong> icon in Safari’s bottom bar.</span>
                </div>
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#EFECE4] border border-[#D9D4C7]">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#5D614E] text-[#FAF8F5] font-semibold flex items-center justify-center text-xs">
                    2
                  </span>
                  <span>Scroll down and select <strong>Add to Home Screen</strong>.</span>
                </div>
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#EFECE4] border border-[#D9D4C7]">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#5D614E] text-[#FAF8F5] font-semibold flex items-center justify-center text-xs">
                    3
                  </span>
                  <span>Tap <strong>Add</strong> in the upper right. The app will launch in standalone offline mode.</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-[#5D614E] hover:bg-[#4E5240] font-medium text-xs text-[#FAF8F5] transition active:scale-98"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
