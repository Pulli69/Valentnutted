import React, { useState } from 'react';
import { useChat } from '../../context/useChat';
import { useOS } from '../../context/OSContext';
import { UserAvatarDisplay } from '../common/PixelAvatars';

export const DesktopChatPreview: React.FC = () => {
  const { recentMessages, realtimeState } = useChat();
  const { openWindow, systemSettings } = useOS();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // If user disabled desktop chat in settings
  if (!systemSettings.desktopChatVisible) {
    return null;
  }

  const formatTime = (isoString?: string): string => {
    if (!isoString) return '--:--';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return '--:--';
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  return (
    <>
      {/* Desktop Widget (Hidden on small mobile screens to prevent clutter) */}
      <div 
        className="hidden md:block absolute right-3 bottom-10 z-20 w-80 shadow-lg select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w98-window bg-[#c0c0c0] p-1 border-2 border-t-white border-l-white border-b-black border-r-black">
          {/* Title Bar */}
          <div 
            onClick={() => openWindow('global-chat')}
            className="w98-titlebar flex justify-between items-center px-1.5 py-0.5 font-bold text-white text-[10px] cursor-pointer"
            title="Click to open full Global Chat terminal"
          >
            <div className="flex items-center gap-1 truncate">
              <span>💬</span>
              <span className="truncate">#NoNutSurvival - Live Radio</span>
              <span className={`inline-block w-1.5 h-1.5 rounded-full ml-1 ${
                realtimeState === 'SUBSCRIBED' ? 'bg-green-400' : 'bg-amber-400'
              }`} />
            </div>
            <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button 
                type="button"
                onClick={() => setIsCollapsed(prev => !prev)}
                className="w98-btn px-1 text-[9px] leading-none h-3.5 flex items-center justify-center font-mono"
                title={isCollapsed ? 'Expand chat preview' : 'Collapse chat preview'}
              >
                {isCollapsed ? '+' : '–'}
              </button>
              <button 
                type="button"
                onClick={() => openWindow('global-chat')}
                className="w98-btn px-1 text-[9px] leading-none h-3.5 flex items-center justify-center font-bold"
                title="Expand to Full Global Chat window"
              >
                ↗
              </button>
            </div>
          </div>

          {/* Collapsible Content */}
          {!isCollapsed && (
            <div className="mt-1">
              {/* Latest Messages Box */}
              <div 
                onClick={() => openWindow('global-chat')}
                className="w98-field bg-white p-1.5 max-h-36 overflow-hidden space-y-1 font-mono text-[10px] cursor-pointer hover:bg-slate-50 transition-colors"
                title="Click anywhere to join live chat"
              >
                {recentMessages.length === 0 ? (
                  <div className="text-gray-400 italic text-center py-2">
                    Listening for transmissions...
                  </div>
                ) : (
                  recentMessages.map((msg) => (
                    <div key={msg.id} className="leading-tight truncate flex items-center gap-1">
                      <span className="text-gray-400 text-[9px] font-sans">
                        [{formatTime(msg.created_at)}]
                      </span>
                      <UserAvatarDisplay
                        avatarUrl={msg.avatar_url}
                        username={msg.username}
                        size={12}
                        fallbackColor={msg.avatar_color}
                        className="inline-block shrink-0"
                      />
                      <span 
                        className="font-bold truncate"
                        style={{ color: msg.avatar_color || '#000080' }}
                      >
                        &lt;{msg.rank || ''}{msg.username}&gt;
                      </span>
                      <span className="text-gray-900 truncate">
                        {msg.message}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Quick Action Footer */}
              <div className="mt-1 flex justify-between items-center text-[9px] px-1 text-gray-700">
                <span className="text-gray-500 font-sans">
                  {recentMessages.length} latest dispatches
                </span>
                <button
                  type="button"
                  onClick={() => openWindow('global-chat')}
                  className="w98-btn px-2 py-0.5 text-[9px] font-bold text-blue-900 cursor-pointer"
                >
                  Open Full Chat ↵
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Strip: Compact floating bar near the top-center on small screens */}
      <div 
        className="md:hidden absolute top-12 left-2 right-2 z-20 select-none shadow-md"
        onClick={(e) => {
          e.stopPropagation();
          openWindow('global-chat');
        }}
      >
        <div className="w98-window bg-[#c0c0c0] p-1 border border-t-white border-l-white border-b-black border-r-black flex items-center justify-between text-[10px] cursor-pointer">
          <div className="flex items-center gap-1.5 min-w-0 pr-1 truncate font-mono">
            <span className="shrink-0">💬</span>
            {recentMessages.length > 0 ? (
              <span className="truncate">
                <strong style={{ color: recentMessages[recentMessages.length - 1].avatar_color || '#000080' }}>
                  {recentMessages[recentMessages.length - 1].username}:
                </strong>{' '}
                <span className="text-gray-800">
                  {recentMessages[recentMessages.length - 1].message}
                </span>
              </span>
            ) : (
              <span className="text-gray-600 italic">#NoNutSurvival Live Chat</span>
            )}
          </div>
          <span className="w98-btn px-1.5 py-0.5 text-[9px] font-bold shrink-0 text-blue-900">
            Open Chat
          </span>
        </div>
      </div>
    </>
  );
};
