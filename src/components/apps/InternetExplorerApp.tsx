import React, { useState } from 'react';
import { InternetExplorerIcon } from '../icons/PixelIcons';

export const InternetExplorerApp: React.FC = () => {
  const [url, setUrl] = useState('http://www.ihaventnutted.com/survival-guide.html');
  const [page, setPage] = useState<'home' | 'science' | 'myths'>('home');

  return (
    <div className="flex-1 flex flex-col justify-between text-[11px] h-full bg-[#c0c0c0] select-none">
      {/* Menubar */}
      <div className="flex items-center gap-3 px-2 py-0.5 border-b border-[#808080] text-[11px]">
        <span className="hover:bg-[#000080] hover:text-white px-1 cursor-default">File</span>
        <span className="hover:bg-[#000080] hover:text-white px-1 cursor-default">Edit</span>
        <span className="hover:bg-[#000080] hover:text-white px-1 cursor-default">View</span>
        <span className="hover:bg-[#000080] hover:text-white px-1 cursor-default">Go</span>
        <span className="hover:bg-[#000080] hover:text-white px-1 cursor-default">Favorites</span>
        <span className="hover:bg-[#000080] hover:text-white px-1 cursor-default">Help</span>
      </div>

      {/* Toolbar Buttons */}
      <div className="flex items-center justify-between px-1 py-1 border-b border-[#808080] bg-[#c0c0c0]">
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setPage('home')}
            className="w98-btn px-2 py-1 flex items-center gap-1"
          >
            <span>⬅</span>
            <span>Back</span>
          </button>
          <button className="w98-btn px-2 py-1 opacity-60 cursor-not-allowed">
            <span>➡</span>
          </button>
          <button className="w98-btn px-2 py-1">
            <span>🛑</span>
            <span>Stop</span>
          </button>
          <button className="w98-btn px-2 py-1">
            <span>🔄</span>
            <span>Refresh</span>
          </button>
          <button 
            onClick={() => setPage('home')}
            className="w98-btn px-2 py-1 flex items-center gap-1"
          >
            <span>🏠</span>
            <span>Home</span>
          </button>
        </div>

        {/* Animated Spinning IE Logo on Top-Right */}
        <div className="w-6 h-6 flex items-center justify-center animate-spin">
          <InternetExplorerIcon size={20} />
        </div>
      </div>

      {/* Address Bar */}
      <div className="flex items-center gap-1.5 px-2 py-1 border-b border-[#808080] bg-[#c0c0c0]">
        <span className="text-gray-600 font-semibold">Address:</span>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 w98-field px-2 py-0.5 font-mono text-[11px]"
        />
        <button className="w98-btn px-3 py-0.5 font-bold">Go</button>
      </div>

      {/* Webpage Content (90s Geocities Style) */}
      <div className="flex-1 w98-field m-1 p-4 overflow-y-auto bg-black text-white font-serif select-text">
        {/* Marquee Banner */}
        <div className="w98-marquee mb-4 text-center">
          ⚡ WELCOME TO THE SURVIVAL CITADEL 1998 ⚡ NO SURRENDER ⚡ KEEP HANDS VISIBLE AT ALL TIMES ⚡
        </div>

        {/* Geocities Style Header */}
        <div className="text-center border-4 border-double border-yellow-400 p-4 mb-4 bg-blue-950">
          <h1 className="text-2xl font-black text-yellow-300 tracking-wider">
            ⚔️ THE NO NUT NOVEMBER SURVIVAL GUIDE ⚔️
          </h1>
          <p className="text-xs text-cyan-300 font-mono mt-1">
            Created with Microsoft FrontPage 98 • Best viewed in 800x600 resolution
          </p>

          <div className="flex justify-center gap-3 mt-3">
            <button 
              onClick={() => setPage('home')}
              className="text-xs text-yellow-300 underline font-bold cursor-pointer hover:text-white"
            >
              [ The 10 Commandments ]
            </button>
            <button 
              onClick={() => setPage('science')}
              className="text-xs text-yellow-300 underline font-bold cursor-pointer hover:text-white"
            >
              [ Biological Truths ]
            </button>
            <button 
              onClick={() => setPage('myths')}
              className="text-xs text-yellow-300 underline font-bold cursor-pointer hover:text-white"
            >
              [ Coping Fallacies ]
            </button>
          </div>
        </div>

        {/* Page Content */}
        {page === 'home' && (
          <div className="space-y-4 text-xs font-sans leading-relaxed text-gray-200">
            <div className="border border-green-500 p-3 bg-green-950/40">
              <h2 className="text-sm font-bold text-green-300 mb-1">
                RULE #1: THE DUMBBELL RULE
              </h2>
              <p>
                Whenever an urge strikes, you must perform 15 pushups or pick up a dumbbell. 
                Your body cannot sustain both high muscular exertion and unnecessary dopamine seeking.
              </p>
            </div>

            <div className="border border-blue-500 p-3 bg-blue-950/40">
              <h2 className="text-sm font-bold text-cyan-300 mb-1">
                RULE #2: THE FREEZER PROTOCOL
              </h2>
              <p>
                If nighttime temptations arise, put your smartphone inside the kitchen freezer or another room. 
                Physical distance is the greatest armor against impulse.
              </p>
            </div>

            <div className="border border-purple-500 p-3 bg-purple-950/40">
              <h2 className="text-sm font-bold text-pink-300 mb-1">
                RULE #3: ICE COLD SHOWERS
              </h2>
              <p>
                Turn the temperature dial all the way to blue. 30 seconds of freezing water resets 
                your vagus nerve and shuts down the urge center of the brain.
              </p>
            </div>
          </div>
        )}

        {page === 'science' && (
          <div className="space-y-3 text-xs font-sans text-gray-200">
            <h2 className="text-base font-bold text-yellow-300">DOPAMINE RECEPTOR RESENSITIZATION</h2>
            <p>
              By Day 7, androgen receptor density in the brain increases significantly. 
              Music sounds richer, food tastes better, and your ability to focus on complex tasks quadruples.
            </p>
            <p>
              You are not "missing out". You are reclaiming your attention span from multi-billion dollar algorithms.
            </p>
          </div>
        )}

        {page === 'myths' && (
          <div className="space-y-3 text-xs font-sans text-gray-200">
            <h2 className="text-base font-bold text-red-400">COMMON DECEPTIONS OF THE WEAK MIND:</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>"I'll just look at one picture." — False. It always leads to the Blue Screen.</li>
              <li>"I need to sleep." — False. Read a boring book instead.</li>
              <li>"It relieves stress." — False. The immediate post-nut guilt multiplies stress by 10x.</li>
            </ul>
          </div>
        )}

        {/* Footer Hit Counter & Webring */}
        <div className="mt-6 pt-4 border-t border-gray-700 text-center">
          <div className="inline-block border border-gray-400 p-1 bg-black font-mono text-red-500 font-bold text-sm">
            VISITOR COUNT: 0 0 4 2 8 9 1
          </div>
          <div className="text-[10px] text-gray-400 mt-2">
            Member of the Pure Mind WebRing • [Previous] • [Next] • [Random]
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="w98-inset px-2 py-0.5 text-[10px] flex justify-between bg-[#c0c0c0] text-gray-700 mx-1 mb-0.5">
        <span>Done</span>
        <span>Internet Zone</span>
      </div>
    </div>
  );
};
