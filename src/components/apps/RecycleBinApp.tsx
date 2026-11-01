import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { RecycleBinIcon } from '../icons/PixelIcons';

interface PurgedItem {
  id: string;
  name: string;
  originalLocation: string;
  dateDeleted: string;
  size: string;
  type: string;
}

const INITIAL_PURGED: PurgedItem[] = [
  { id: '1', name: 'incognito_window_tab_4.lnk', originalLocation: 'C:\\Users\\pc\\DopamineTraps', dateDeleted: 'Day 1 02:14 AM', size: '14.2 MB', type: 'Purged Shortcut' },
  { id: '2', name: 'instagram_explore_doom.tmp', originalLocation: 'C:\\Program Files\\Procrastination', dateDeleted: 'Day 1 09:30 AM', size: '88.4 MB', type: 'Temporary Trap' },
  { id: '3', name: 'late_night_boredom_urge.exe', originalLocation: 'C:\\Brain\\WeakMoments', dateDeleted: 'Day 1 11:45 PM', size: '1.2 GB', type: 'Malicious Impulse' },
  { id: '4', name: 'excuses_it_doesnt_count.txt', originalLocation: 'C:\\Rationalizations', dateDeleted: 'Day 1 04:12 PM', size: '2.5 KB', type: 'Delusion Note' },
  { id: '5', name: 'dopamine_crash_regret.dump', originalLocation: 'C:\\PostNut\\Despair', dateDeleted: 'Past Sins', size: '999 GB', type: 'Historical Memory' }
];

export const RecycleBinApp: React.FC = () => {
  const { showNotification } = useOS();
  const [items, setItems] = useState<PurgedItem[]>(INITIAL_PURGED);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleEmptyBin = () => {
    if (items.length === 0) {
      showNotification('RECYCLE BIN EMPTY', 'The bin is already pristine. No active vices lurking.', 'info');
      return;
    }
    setItems([]);
    setSelectedId(null);
    showNotification(
      'RECYCLE BIN PURGED',
      'All temptations incinerated. 100% of deleted dopamine debt converted to pure masculine focus.',
      'info'
    );
  };

  return (
    <div className="flex-1 flex flex-col justify-between text-[11px] h-full bg-[#c0c0c0] select-none">
      {/* Menubar */}
      <div className="flex items-center gap-3 px-2 py-0.5 border-b border-[#808080] text-[11px]">
        <span className="hover:bg-[#000080] hover:text-white px-1 cursor-default">File</span>
        <span className="hover:bg-[#000080] hover:text-white px-1 cursor-default">Edit</span>
        <span className="hover:bg-[#000080] hover:text-white px-1 cursor-default">View</span>
        <span className="hover:bg-[#000080] hover:text-white px-1 cursor-default">Help</span>
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-[#808080] bg-[#dfdfdf]">
        <div className="flex items-center gap-2">
          <button
            onClick={handleEmptyBin}
            className="w98-btn px-3 py-1 font-semibold text-red-900 flex items-center gap-1.5"
          >
            <RecycleBinIcon size={14} />
            <span>Empty Recycle Bin</span>
          </button>
        </div>
        <span className="text-gray-600 italic text-[10px]">
          {items.length} temptations trashed
        </span>
      </div>

      {/* Explorer Table List */}
      <div className="flex-1 w98-field m-1 p-0 overflow-y-auto">
        <table className="w-full border-collapse text-[11px] text-left">
          <thead className="bg-[#c0c0c0] sticky top-0 border-b border-gray-400 select-none">
            <tr>
              <th className="p-1 border-r border-gray-400 font-normal">Name</th>
              <th className="p-1 border-r border-gray-400 font-normal">Original Location</th>
              <th className="p-1 border-r border-gray-400 font-normal">Date Deleted</th>
              <th className="p-1 border-r border-gray-400 font-normal">Type</th>
              <th className="p-1 font-normal">Energy Saved</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500 italic">
                  Recycle Bin is completely clean. All sinful temptations have been permanently evaporated.
                </td>
              </tr>
            ) : (
              items.map(item => {
                const isSelected = selectedId === item.id;
                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`cursor-default ${
                      isSelected ? 'bg-[#000080] text-white' : 'hover:bg-blue-50 text-black'
                    }`}
                  >
                    <td className="p-1 flex items-center gap-1.5">
                      <span>🗑</span>
                      <span className="font-semibold">{item.name}</span>
                    </td>
                    <td className="p-1 font-mono text-[10px] opacity-80">{item.originalLocation}</td>
                    <td className="p-1">{item.dateDeleted}</td>
                    <td className="p-1">{item.type}</td>
                    <td className="p-1 font-mono font-bold">{item.size}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Status Bar */}
      <div className="w98-inset px-2 py-0.5 text-[10px] flex justify-between bg-[#c0c0c0] text-gray-700 mx-1 mb-0.5">
        <span>{items.length} object(s)</span>
        <span>Recycle Bin Protection: 100% Active</span>
      </div>
    </div>
  );
};
