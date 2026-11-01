import React, { useEffect, useRef, useState } from 'react';
import { renderCardToCanvas, type CardRenderOptions } from '../../utils/cardCanvasRenderer';
import { sound } from '../../audio/soundEngine';

interface CardExportModalProps {
  options: CardRenderOptions;
  onClose: () => void;
}

export const CardExportModal: React.FC<CardExportModalProps> = ({ options, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const render = async () => {
      if (!canvasRef.current) return;
      setIsRendering(true);
      try {
        await renderCardToCanvas(canvasRef.current, options);
      } catch (err) {
        console.error('Failed to render card canvas:', err);
      } finally {
        if (!isCancelled) {
          setIsRendering(false);
        }
      }
    };

    render();

    return () => {
      isCancelled = true;
    };
  }, [options]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    sound.playClick();

    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      const filename = options.type === 'join' 
        ? `ihaventnutted-pass-${options.username.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`
        : `ihaventnutted-day-${options.dayNumber || 'milestone'}-${options.username.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;
      
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to download card:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareOnX = async () => {
    sound.playClick();
    const shareText = options.type === 'join'
      ? `I officially joined No Nut November 2026 on IHAVENTNUTTED 98.\n\n30 days of monastic digital discipline begins now.\n\n#NoNutNovember #IHAVENTNUTTED`
      : `Day ${options.dayNumber || 1} completed. ${options.daysNoFapText || `${options.dayNumber} DAYS NO FAP`} in No Nut November 2026.\n\nDiscipline holding strong on IHAVENTNUTTED 98.\n\n#NoNutNovember #NNN2026 #IHAVENTNUTTED`;

    // Attempt Native Web Share API if supported and on mobile/supported browser
    if (navigator.share && canvasRef.current) {
      try {
        const blob = await new Promise<Blob | null>((resolve) => 
          canvasRef.current?.toBlob(resolve, 'image/png')
        );
        if (blob && navigator.canShare && navigator.canShare({ files: [new File([blob], 'card.png', { type: 'image/png' })] })) {
          await navigator.share({
            title: 'IHAVENTNUTTED Certification Card',
            text: shareText,
            url: window.location.origin,
            files: [new File([blob], 'ihaventnutted-card.png', { type: 'image/png' })]
          });
          return;
        }
      } catch (err) {
        // Fallback to Twitter web intent if user cancelled or failed
        console.debug('Web share fallback to intent:', err);
      }
    }

    // Direct X / Twitter Intent URL
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.origin)}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer,width=600,height=450');
  };

  return (
    <div 
      className="fixed inset-0 z-[11000] bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-3 select-none"
      onClick={onClose}
    >
      <div 
        className="w98-window bg-[#c0c0c0] shadow-2xl border-2 border-t-white border-l-white border-b-black border-r-black max-w-md w-full text-black flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Titlebar */}
        <div className="w98-titlebar bg-[#000080] flex justify-between items-center px-2 py-1 font-bold text-white text-xs">
          <div className="flex items-center gap-1.5 truncate">
            <span>💾</span>
            <span className="truncate">
              {options.type === 'join' ? 'Official Challenge Pass' : `Achievement Card - Day ${options.dayNumber}`} (1080x1350 PNG)
            </span>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w98-btn px-1.5 py-0.5 text-xs leading-none bg-[#c0c0c0] text-black font-bold border border-t-white border-l-white border-b-black border-r-black cursor-pointer hover:bg-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3 flex flex-col items-center gap-3 overflow-y-auto">
          {/* Card Preview Container */}
          <div className="relative bg-[#050a14] p-2 border-2 border-t-black border-l-black border-b-white border-r-white shadow-inner flex flex-col items-center justify-center min-h-[360px] w-full">
            {isRendering && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#050a14]/80 text-white text-xs font-mono z-10">
                <span className="animate-spin text-lg">⏳</span>
                <span>Rendering 1080x1350 Canvas...</span>
              </div>
            )}

            {/* Hidden actual high-res canvas (1080x1350) */}
            <canvas 
              ref={canvasRef}
              className="max-h-[380px] w-auto aspect-[4/5] object-contain shadow-md rounded-none"
              style={{ imageRendering: 'crisp-edges' }}
            />
          </div>

          {/* Telemetry info */}
          <div className="w-full flex items-center justify-between text-[10px] font-mono text-gray-700 bg-gray-100 p-1.5 border border-gray-400">
            <span>FORMAT: 1080 × 1350 (4:5)</span>
            <span className="text-emerald-700 font-bold">STATUS: CRYPTO-STAMP READY</span>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-col sm:flex-row gap-2 pt-1">
            <button
              type="button"
              disabled={isRendering || isExporting}
              onClick={handleDownload}
              className="flex-1 w98-btn py-1.5 px-3 bg-[#c0c0c0] font-bold text-xs flex items-center justify-center gap-1.5 border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white cursor-pointer hover:bg-gray-100 disabled:opacity-50"
            >
              <span>💾</span>
              <span>{downloadSuccess ? 'Downloaded!' : 'Download PNG (1080x1350)'}</span>
            </button>

            <button
              type="button"
              disabled={isRendering}
              onClick={handleShareOnX}
              className="w98-btn py-1.5 px-3 bg-[#1DA1F2] text-white font-bold text-xs flex items-center justify-center gap-1.5 border-2 border-t-sky-300 border-l-sky-300 border-b-sky-950 border-r-sky-950 active:border-t-sky-950 active:border-l-sky-950 active:border-b-sky-300 active:border-r-sky-300 cursor-pointer hover:bg-[#1a94df] disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>Share on X</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w98-btn py-1.5 px-3 bg-[#c0c0c0] text-gray-800 text-xs border border-t-white border-l-white border-b-black border-r-black cursor-pointer hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
