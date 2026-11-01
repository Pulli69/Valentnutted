import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';

export const FoldConfirmDialog: React.FC = () => {
  const { showFoldConfirm, setShowFoldConfirm, confirmFold } = useOS();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!showFoldConfirm) return null;

  const handleFoldAnyway = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    await confirmFold();
    setIsSubmitting(false);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999] select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w98-window max-w-sm w-full p-1 bg-[#c0c0c0] shadow-2xl border-2 border-t-white border-l-white border-b-black border-r-black">
        {/* Authentic Windows 98 Classic Blue Titlebar */}
        <div className="w98-titlebar bg-[#000080] flex justify-between items-center px-1.5 py-0.5 font-bold text-white text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="text-white text-xs">⚠</span>
            <span>Confirm Relapse</span>
          </div>
          <button 
            type="button"
            onClick={() => setShowFoldConfirm(false)}
            disabled={isSubmitting}
            className="w98-btn px-1 text-[10px] leading-none"
          >
            ✕
          </button>
        </div>

        {/* Dialog Body with Classic Stop/Error Icon */}
        <div className="p-3 space-y-4 text-[11px] text-black">
          <div className="flex items-start gap-3.5">
            {/* Classic Windows 98 Red Stop Icon */}
            <div className="shrink-0 w-8 h-8 rounded-full bg-red-600 border-2 border-white flex items-center justify-center text-white font-black text-lg shadow-md mt-0.5">
              ✕
            </div>

            <div className="space-y-1.5 text-gray-900 leading-snug">
              <p className="font-semibold text-[11.5px]">
                Are you sure you want to end your current streak? This action cannot be undone.
              </p>
              <p className="text-gray-600 text-[10px]">
                A permanent fold event will be archived for today. You will not be eligible for a new check-in until tomorrow.
              </p>
            </div>
          </div>

          {/* Action Buttons: CANCEL & FOLD ANYWAY */}
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-400">
            <button
              type="button"
              onClick={() => setShowFoldConfirm(false)}
              disabled={isSubmitting}
              className="w98-btn px-4 py-1 text-[11px] font-bold text-blue-900 cursor-pointer min-w-[80px]"
            >
              CANCEL
            </button>
            <button
              type="button"
              onClick={handleFoldAnyway}
              disabled={isSubmitting}
              className="w98-btn px-4 py-1 text-[11px] font-bold bg-[#d4d0c8] text-red-900 border-red-700 cursor-pointer hover:bg-red-100 min-w-[100px]"
            >
              {isSubmitting ? 'VERIFYING...' : 'FOLD ANYWAY'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
