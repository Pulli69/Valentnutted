import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { MyComputerIcon } from '../icons/PixelIcons';

export const MyComputerApp: React.FC = () => {
  const { streakState, openWindow } = useOS();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const drives = [
    {
      id: 'floppy',
      name: '3½ Floppy (A:)',
      type: '3½-Inch Floppy Disk',
      capacity: '1.44 MB',
      details: 'Emergency Backup Willpower Seed'
    },
    {
      id: 'hdd-c',
      name: 'NoNut System (C:)',
      type: 'Local Fixed Disk',
      capacity: '40.0 GB (39.8 GB Free)',
      details: 'Contains System Kernel & Pure Thoughts'
    },
    {
      id: 'cd-rom',
      name: 'Discipline Mix (D:)',
      type: 'Compact Disc Audio',
      capacity: '650 MB',
      details: 'Hardstyle / Cold Shower Workout Beats'
    },
    {
      id: 'control-panel',
      name: 'Display Settings',
      type: 'System Configuration',
      action: () => openWindow('display-settings'),
      details: 'Themes, CRT Filter & Sound Scheme'
    }
  ];

  return (
    <div className="flex-1 flex flex-col justify-between text-[11px] h-full bg-[#c0c0c0] select-none">
      {/* Menubar */}
      <div className="flex items-center gap-3 px-2 py-0.5 border-b border-[#808080] text-[11px]">
        <span className="hover:bg-[#000080] hover:text-white px-1 cursor-default">File</span>
        <span className="hover:bg-[#000080] hover:text-white px-1 cursor-default">Edit</span>
        <span className="hover:bg-[#000080] hover:text-white px-1 cursor-default">View</span>
        <span className="hover:bg-[#000080] hover:text-white px-1 cursor-default">Help</span>
      </div>

      {/* Main Drive Grid */}
      <div className="flex-1 w98-field m-1 p-3 overflow-y-auto">
        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-700 mb-2 border-b border-gray-300 pb-1">
          <MyComputerIcon size={18} />
          <span>Installed Drives & Hardware Devices:</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {drives.map(drive => {
            const isSelected = selectedItem === drive.id;
            return (
              <div
                key={drive.id}
                onClick={() => setSelectedItem(drive.id)}
                onDoubleClick={() => drive.action && drive.action()}
                className={`p-2 flex flex-col items-center text-center cursor-default rounded ${
                  isSelected ? 'bg-[#000080] text-white' : 'hover:bg-blue-100 text-black'
                }`}
              >
                <div className="text-2xl mb-1">
                  {drive.id === 'floppy' ? '💾' : drive.id === 'hdd-c' ? '💽' : drive.id === 'cd-rom' ? '💿' : '⚙️'}
                </div>
                <div className="font-semibold text-[11px]">{drive.name}</div>
                <div className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                  {drive.capacity || drive.type}
                </div>
              </div>
            );
          })}
        </div>

        {/* Hardware Specifications Panel */}
        <fieldset className="border border-gray-400 p-2.5 bg-gray-50 text-black">
          <legend className="px-1 text-[11px] font-bold text-[#000080]">
            System Specifications & Neural Benchmark
          </legend>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="font-semibold text-gray-700">OS Architecture: </span>
              <span>Windows 98 SE (Willpower Edition v4.10)</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Current Purity Streak: </span>
              <span className="font-bold text-green-700">{streakState.currentStreakDays} Days Unbroken</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Central Processor: </span>
              <span>Intel Pentium II 450MHz (Cryo-Cooled)</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Mental RAM: </span>
              <span>128 MB SDRAM (100% Retained)</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">3D Accelerator: </span>
              <span>3dfx Voodoo2 12MB (Glide Purity API)</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Urges Neutralized: </span>
              <span className="font-bold text-blue-800">{streakState.urgesResisted} Resisted</span>
            </div>
          </div>
        </fieldset>
      </div>

      {/* Status Bar */}
      <div className="w98-inset px-2 py-0.5 text-[10px] flex justify-between bg-[#c0c0c0] text-gray-700 mx-1 mb-0.5">
        <span>{drives.length} object(s)</span>
        <span>My Computer - Online & Protected</span>
      </div>
    </div>
  );
};
