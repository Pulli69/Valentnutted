import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';

export const ConfessionNotepadApp: React.FC = () => {
  const { confessions, addConfession, showNotification } = useOS();
  const [currentText, setCurrentText] = useState('');
  const [viewHistory, setViewHistory] = useState(false);

  const handleSave = () => {
    if (!currentText.trim()) return;
    addConfession(currentText);
    setCurrentText('');
    showNotification('CONFESSION ARCHIVED', 'Your confession has been encrypted and recorded in the local log.', 'info');
  };

  return (
    <div className="flex-1 flex flex-col justify-between text-[11px] h-full bg-[#c0c0c0] select-none">
      {/* Menubar */}
      <div className="flex items-center gap-3 px-2 py-0.5 border-b border-[#808080] text-[11px]">
        <button 
          onClick={handleSave}
          className="hover:bg-[#000080] hover:text-white px-1 cursor-default"
        >
          File
        </button>
        <button 
          onClick={() => setViewHistory(prev => !prev)}
          className="hover:bg-[#000080] hover:text-white px-1 cursor-default font-semibold text-blue-900"
        >
          {viewHistory ? '← Back to Notepad' : 'View Past Logs (' + confessions.length + ')'}
        </button>
        <span className="hover:bg-[#000080] hover:text-white px-1 cursor-default">Edit</span>
        <span className="hover:bg-[#000080] hover:text-white px-1 cursor-default">Help</span>
      </div>

      {/* Main Notepad Area */}
      {!viewHistory ? (
        <div className="flex-1 flex flex-col p-1 overflow-hidden">
          <textarea
            value={currentText}
            onChange={(e) => setCurrentText(e.target.value)}
            placeholder="Type your confession, struggle, or thoughts here... Writing it down neutralizes the temptation."
            className="flex-1 w98-field p-2 font-mono text-[12px] resize-none outline-none leading-relaxed select-text"
          />

          <div className="flex justify-between items-center mt-1 px-1">
            <span className="text-[10px] text-gray-600 italic">
              * Notes are stored locally and will never be uploaded anywhere.
            </span>
            <button
              onClick={handleSave}
              className="w98-btn px-4 py-1 font-bold text-blue-900"
            >
              Save Entry
            </button>
          </div>
        </div>
      ) : (
        /* History Archive View */
        <div className="flex-1 w98-field m-1 p-2 overflow-y-auto space-y-2 select-text">
          <div className="font-bold text-[#000080] border-b pb-1">
            RECORDED CONFESSIONS ARCHIVE:
          </div>
          {confessions.length === 0 ? (
            <div className="text-gray-500 italic p-2">No confessions recorded yet. Clean conscience!</div>
          ) : (
            confessions.map(entry => (
              <div key={entry.id} className="p-2 border border-gray-300 bg-gray-50">
                <div className="text-[10px] font-mono font-bold text-gray-500 mb-1">
                  📅 {entry.timestamp}
                </div>
                <div className="text-[11px] text-gray-800 leading-snug">
                  {entry.text}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Status Bar */}
      <div className="w98-inset px-2 py-0.5 text-[10px] flex justify-between bg-[#c0c0c0] text-gray-700 mx-1 mb-0.5">
        <span>Lines: {currentText.split('\n').length}</span>
        <span>Encoding: ANSI (Windows-1252)</span>
      </div>
    </div>
  );
};
