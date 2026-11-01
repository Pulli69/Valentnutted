import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/useAuth';
import { useOS } from '../../context/OSContext';
import { useChat } from '../../context/useChat';
import { isSupabaseConfigured, type PublicChatMessage } from '../../lib/supabase';
import { UserAvatarDisplay } from '../common/PixelAvatars';

export const GlobalChatApp: React.FC = () => {
  const { user, profile, isAuthenticated } = useAuth();
  const { openWindow, showNotification } = useOS();
  const {
    messages,
    systemNotices,
    isLoading,
    isLoadingOlder,
    hasMoreOlder,
    isSending,
    realtimeState,
    sendMessage,
    loadOlderMessages,
    reportMessage,
    reportedIds
  } = useChat();

  const [inputText, setInputText] = useState('');
  const [reportTarget, setReportTarget] = useState<PublicChatMessage | null>(null);
  const [reportReason, setReportReason] = useState('Spam / Flooding');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef<boolean>(true);

  // Format ISO timestamp to retro [HH:MM]
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

  // Smart Auto-Scroll tracking
  const handleScroll = () => {
    if (!chatScrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatScrollRef.current;
    isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 60;
  };

  useEffect(() => {
    if (chatScrollRef.current && isNearBottomRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, systemNotices]);

  // Handle older transmissions pagination
  const handleLoadOlder = async () => {
    const scrollEl = chatScrollRef.current;
    const prevScrollHeight = scrollEl ? scrollEl.scrollHeight : 0;

    const count = await loadOlderMessages();
    if (count > 0 && scrollEl) {
      setTimeout(() => {
        const newScrollHeight = scrollEl.scrollHeight;
        scrollEl.scrollTop = newScrollHeight - prevScrollHeight;
      }, 30);
    }
  };

  // Handle send message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const textToSend = inputText;
    const res = await sendMessage(textToSend);
    if (res.success) {
      setInputText('');
      setTimeout(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
      }, 30);
    }
    // On failure, inputText is retained so user doesn't lose drafted text
  };

  // Handle abuse report submission
  const handleSubmitReport = async () => {
    if (!reportTarget) return;

    if (!user) {
      showNotification('AUTH REQUIRED', 'You must be logged on to submit moderation reports.', 'error');
      openWindow('user-account');
      setReportTarget(null);
      return;
    }

    setIsSubmittingReport(true);
    const res = await reportMessage(reportTarget.id, reportReason);
    setIsSubmittingReport(false);

    if (res.success) {
      showNotification('REPORT TRANSMITTED', 'Dispatch flagged for operator moderation.', 'info');
    } else {
      showNotification('REPORT FAILED', res.error || 'Submission failed', 'error');
    }
    setReportTarget(null);
  };

  // Dynamic userlist based on active chatters
  const activeUsers = useMemo(() => {
    const map = new Map<string, { name: string; badge: string; color: string }>();

    // Core operator bots
    map.set('NutKing_Admin', { name: 'NutKing_Admin', badge: '@', color: '#000080' });
    map.set('PureMind_99', { name: 'PureMind_99', badge: '@', color: '#800080' });
    map.set('Monk_Dmitri', { name: 'Monk_Dmitri', badge: '@', color: '#008000' });
    map.set('UrgeDestroyer9000', { name: 'UrgeDestroyer9000', badge: '+', color: '#008000' });

    // Current user
    const currentName = profile?.username || (isAuthenticated ? 'Survivor' : 'Guest_You');
    map.set(currentName, {
      name: `${currentName} (You)`,
      badge: profile?.rank || '+',
      color: profile?.avatar_color || '#008080'
    });

    // Recent active chatters from loaded dispatches
    messages.slice(-30).forEach(m => {
      if (m.username && !map.has(m.username)) {
        map.set(m.username, {
          name: m.username,
          badge: m.rank || '',
          color: m.avatar_color || '#333333'
        });
      }
    });

    // Sort: @ ops first, then + voiced, then regular users alphabetically
    return Array.from(map.values()).sort((a, b) => {
      const rankPriority = (r: string) => (r === '@' ? 2 : r === '+' ? 1 : 0);
      const diff = rankPriority(b.badge) - rankPriority(a.badge);
      if (diff !== 0) return diff;
      return a.name.localeCompare(b.name);
    });
  }, [profile, isAuthenticated, messages]);

  const charCount = inputText.length;

  return (
    <div className="flex-1 flex flex-col justify-between text-[11px] h-full bg-[#c0c0c0] select-none relative">
      {/* mIRC Menubar */}
      <div className="flex items-center gap-3 px-2 py-0.5 border-b border-[#808080] text-[11px] bg-[#c0c0c0]">
        <span className="hover:bg-[#000080] hover:text-white px-1 cursor-default">File</span>
        <span className="hover:bg-[#000080] hover:text-white px-1 cursor-default">View</span>
        <span className="hover:bg-[#000080] hover:text-white px-1 cursor-default">Favorites</span>
        <span 
          onClick={() => openWindow('user-account')}
          className="hover:bg-[#000080] hover:text-white px-1 cursor-pointer"
        >
          Identity...
        </span>
        <span className="hover:bg-[#000080] hover:text-white px-1 cursor-default">Commands</span>
        <span className="hover:bg-[#000080] hover:text-white px-1 cursor-default">Help</span>
      </div>

      {/* Channel Topic Banner */}
      <div className="w98-inset px-2 py-1 bg-[#ffffff] text-[11px] font-mono text-[#000080] truncate mx-1 mt-1 flex justify-between items-center">
        <span className="truncate">
          *** Topic for #NoNutSurvival: "Pain of discipline is lighter than the pain of regret."
        </span>
        <span className="text-[10px] text-gray-500 font-sans ml-2 shrink-0">
          [{activeUsers.length} Users]
        </span>
      </div>

      {/* Offline Warning Banner if Supabase is unconfigured */}
      {!isSupabaseConfigured && (
        <div className="mx-1 mt-1 px-2 py-1 bg-[#ffffcc] border border-[#808000] text-[#800000] text-[10px] flex items-center justify-between">
          <span>⚠ Offline Demo Mode: Supabase credentials not found in .env.local.</span>
          <button 
            type="button" 
            onClick={() => openWindow('user-account')}
            className="w98-btn px-2 py-0 text-[10px]"
          >
            Configure
          </button>
        </div>
      )}

      {/* Main Chat & Nicklist Body */}
      <div className="flex-1 flex gap-1 p-1 overflow-hidden min-h-0">
        {/* Chat Log Field */}
        <div 
          ref={chatScrollRef}
          onScroll={handleScroll}
          className="flex-1 w98-field p-2 overflow-y-auto font-mono text-[11px] space-y-1 bg-[#ffffff] select-text relative"
        >
          {/* Older Transmissions Pagination Button */}
          {hasMoreOlder && (
            <div className="text-center py-1 border-b border-gray-200 mb-2">
              <button 
                type="button" 
                onClick={handleLoadOlder}
                disabled={isLoadingOlder}
                className="w98-btn px-3 py-0.5 text-[10px] text-gray-700 font-mono hover:text-black cursor-pointer"
              >
                {isLoadingOlder ? '▲ Loading older transmissions...' : '▲ Load Older Transmissions (Scroll Up)'}
              </button>
            </div>
          )}

          {/* Initial Loading Indicator */}
          {isLoading && (
            <div className="text-[#000080] italic py-2">
              *** Establishing handshake with irc.ihaventnutted.net and loading dispatches...
            </div>
          )}

          {/* Empty State */}
          {!isLoading && messages.length === 0 && (
            <div className="text-gray-500 italic p-3 text-center border border-dashed border-gray-300 my-2">
              *** No dispatches in #NoNutSurvival yet. Transmit the first message to lead the vanguard!
            </div>
          )}

          {/* System Notices */}
          {systemNotices.map(notice => (
            <div 
              key={notice.id} 
              className="leading-tight italic text-[10.5px]"
              style={{ color: notice.color || '#008000' }}
            >
              <span className="text-gray-400 not-italic mr-1.5 font-sans">[{notice.time}]</span>
              {notice.text}
            </div>
          ))}

          {/* Real Chat Messages */}
          {messages.map(msg => {
            const isSelf = user ? (profile?.username === msg.username) : false;
            const isReported = reportedIds.has(msg.id);

            return (
              <div 
                key={msg.id} 
                className="group leading-tight flex items-start justify-between hover:bg-[#f0f4ff] px-0.5 rounded transition-colors"
              >
                <div className="flex-1 min-w-0 pr-1 break-words flex items-center flex-wrap gap-x-1">
                  <span className="text-gray-500 text-[10px] font-sans">
                    [{formatTime(msg.created_at)}]
                  </span>
                  <UserAvatarDisplay
                    avatarUrl={msg.avatar_url}
                    username={msg.username}
                    size={16}
                    fallbackColor={msg.avatar_color}
                    className="inline-block"
                  />
                  <span 
                    className="font-bold"
                    style={{ color: msg.avatar_color || '#000080' }}
                  >
                    &lt;{msg.rank || ''}{msg.username}&gt;
                  </span>
                  <span className={isSelf ? 'font-medium text-black' : 'text-gray-900'}>
                    {msg.message}
                  </span>
                </div>

                {/* Message Actions (Report / Flag) */}
                <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ml-1 flex items-center">
                  {isReported ? (
                    <span className="text-[9px] text-gray-400 font-sans px-1">
                      [Reported]
                    </span>
                  ) : (
                    <button
                      type="button"
                      title="Report abusive transmission to operators"
                      onClick={() => setReportTarget(msg)}
                      className="text-[9px] text-gray-500 hover:text-red-700 hover:underline px-1 py-0 font-sans cursor-pointer"
                    >
                      [Report]
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Userlist Sidebar */}
        <div className="w-36 w98-field p-1 overflow-y-auto bg-[#ffffff] shrink-0">
          <div className="text-[10px] text-gray-600 border-b border-gray-300 pb-0.5 mb-1 px-1 font-bold flex justify-between">
            <span>NICKNAMES</span>
            <span>({activeUsers.length})</span>
          </div>
          {activeUsers.map((u, i) => (
            <div 
              key={i} 
              className="flex items-center gap-1 px-1 py-0.5 hover:bg-[#000080] hover:text-white cursor-default text-[10.5px]"
              title={`${u.name} ${u.badge ? `(${u.badge === '@' ? 'Operator' : 'Voiced'})` : ''}`}
            >
              <span className={`font-mono font-bold w-3 text-center ${u.badge === '@' ? 'text-red-700' : 'text-green-700'}`}>
                {u.badge}
              </span>
              <span className="truncate" style={{ color: u.color }}>
                {u.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Current Nick Indicator & Character Alert */}
      <div className="px-2 py-0.5 flex justify-between items-center text-[10px] text-gray-600 bg-[#c0c0c0]">
        <div className="truncate flex items-center gap-1">
          <span>Transmitting as:</span>
          <strong className="text-[#000080]">
            {profile?.username || 'Guest'}
          </strong>
          {!isAuthenticated && isSupabaseConfigured && (
            <button 
              type="button"
              onClick={() => openWindow('user-account')}
              className="text-blue-800 underline hover:text-blue-950 ml-1 cursor-pointer"
            >
              (Logon)
            </button>
          )}
        </div>
        <div>
          {charCount > 180 && (
            <span className={charCount > 260 ? 'text-red-700 font-bold' : 'text-gray-700'}>
              {charCount}/280
            </span>
          )}
        </div>
      </div>

      {/* Input Box & Send Button */}
      <form onSubmit={handleSend} className="flex gap-1 p-1 pt-0">
        <input
          type="text"
          value={inputText}
          maxLength={280}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type message to #NoNutSurvival (max 280 chars)..."
          className="flex-1 w98-field px-2 py-1 text-[11px]"
          disabled={isSending}
        />
        <button 
          type="submit" 
          disabled={isSending || !inputText.trim()}
          className="w98-btn px-4 font-bold text-[11px] disabled:opacity-50 cursor-pointer"
        >
          {isSending ? 'Transmitting...' : 'Send'}
        </button>
      </form>

      {/* Status Bar */}
      <div className="w98-inset px-2 py-0.5 text-[10px] flex justify-between bg-[#c0c0c0] text-gray-700 mx-1 mb-0.5">
        <div className="flex items-center gap-2">
          <span>irc.ihaventnutted.net:6667</span>
          <span className="text-gray-400">|</span>
          <span className="flex items-center gap-1">
            <span 
              className={`inline-block w-2 h-2 rounded-full ${
                realtimeState === 'SUBSCRIBED' 
                  ? 'bg-green-600' 
                  : realtimeState === 'CONNECTING' 
                  ? 'bg-amber-500 animate-pulse' 
                  : 'bg-red-600'
              }`}
            />
            <span>
              {realtimeState === 'SUBSCRIBED' ? 'Realtime Live' : realtimeState === 'CONNECTING' ? 'Connecting...' : 'Offline'}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>Transmissions: {messages.length}</span>
          <span className="text-gray-400">|</span>
          <span>Lag: 38ms</span>
        </div>
      </div>

      {/* Retro Report Modal Dialog */}
      {reportTarget && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="w98-window max-w-sm w-full p-1 bg-[#c0c0c0] shadow-2xl text-black">
            <div className="w98-titlebar flex justify-between items-center px-1.5 py-0.5 mb-2 font-bold text-white text-[11px]">
              <span>Report Transmission - Operator Dispatch</span>
              <button 
                type="button"
                onClick={() => setReportTarget(null)}
                className="w98-btn px-1 text-[10px] leading-none"
              >
                ✕
              </button>
            </div>

            <div className="p-2 space-y-2 text-[11px]">
              <p className="leading-snug">
                File a report to server operators regarding transmission from <strong>{reportTarget.username}</strong>:
              </p>

              <div className="w98-inset p-2 bg-white font-mono text-[10px] text-gray-700 max-h-16 overflow-y-auto break-words">
                "{reportTarget.message}"
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-700 mb-0.5">
                  Select violation reason:
                </label>
                <select 
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w98-field w-full px-1.5 py-1 text-[11px] bg-white cursor-pointer"
                >
                  <option value="Spam / Flooding">Spam / Flooding</option>
                  <option value="Inappropriate / Explicit Content">Inappropriate / Explicit Content</option>
                  <option value="Relapse Bait / Triggering Content">Relapse Bait / Triggering Content</option>
                  <option value="Harassment / Toxicity">Harassment / Toxicity</option>
                  <option value="Other Policy Violation">Other Policy Violation</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-300">
                <button 
                  type="button" 
                  onClick={() => setReportTarget(null)}
                  className="w98-btn px-3 py-1 text-[11px] cursor-pointer"
                  disabled={isSubmittingReport}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleSubmitReport}
                  className="w98-btn px-3 py-1 font-bold text-[11px] bg-[#d4d0c8] cursor-pointer"
                  disabled={isSubmittingReport}
                >
                  {isSubmittingReport ? 'Transmitting...' : 'File Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
