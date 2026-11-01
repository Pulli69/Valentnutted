import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { useOS } from '../../context/OSContext';
import { StreakTrackerIcon, FoldedWarningIcon } from '../icons/PixelIcons';

export const StreakTrackerApp: React.FC = () => {
  const { 
    streakState, 
    checkInToday, 
    recordUrgeResisted, 
    triggerFolded,
    openWindow 
  } = useOS();

  const [activeTab, setActiveTab] = useState<'status' | 'milestones' | 'history'>('status');
  const [stampEffect, setStampEffect] = useState(false);
  const [isSubmittingCheckIn, setIsSubmittingCheckIn] = useState(false);
  const [urgeLevel, setUrgeLevel] = useState<number>(1);
  const [now, setNow] = useState(() => new Date());

  // Clock ticker for elapsed time and midnight countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute countdown until 23:59:59 tonight
  const deadlineCountdown = useMemo(() => {
    const midnight = new Date(now);
    midnight.setHours(23, 59, 59, 999);
    const diff = Math.max(0, midnight.getTime() - now.getTime());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return {
      hours: String(h).padStart(2, '0'),
      minutes: String(m).padStart(2, '0'),
      seconds: String(s).padStart(2, '0')
    };
  }, [now]);

  const isCheckedInToday = streakState.todayStatus === 'holding';
  const isFoldedToday = streakState.todayStatus === 'folded';

  const handleCheckIn = async () => {
    if (isSubmittingCheckIn || isCheckedInToday || isFoldedToday) return;

    setIsSubmittingCheckIn(true);
    const success = await checkInToday();
    setIsSubmittingCheckIn(false);

    if (success) {
      setStampEffect(true);
      setTimeout(() => setStampEffect(false), 2200);

      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    }
  };

  const getRankTitle = (days: number) => {
    if (days >= 30) return 'TRANSCENDED OLYMPIAN (Nirvana)';
    if (days >= 21) return 'MONK OF HIGH TITANIUM';
    if (days >= 14) return 'WARRIOR OF UNBENDING WILL';
    if (days >= 7) return 'DISCIPLINED SAGE';
    if (days >= 3) return 'HARDENED RECRUIT';
    if (days >= 1) return 'AWAKENED NOVICE';
    return 'UNTESTED MORTAL (Day 0)';
  };

  const getUrgeAdvice = (level: number) => {
    switch (level) {
      case 1: return 'Calm waters. Focus your mind on productive endeavors.';
      case 2: return 'Slight twitching. Put the phone in the other room and drink cold water.';
      case 3: return 'Spike detected! Stand up, stretch, and leave your chair immediately.';
      case 4: return 'HIGH DANGER: Drop and perform 25 pushups right now!';
      case 5: return 'CRITICAL BREACH: Splash freezing water on face and launch URGE.exe Player!';
      default: return 'Remain steadfast.';
    }
  };

  // Calendar day calculation based on authoritative history records
  const currentDayOfMonth = Math.min(30, Math.max(1, now.getDate()));
  const historyMap = useMemo(() => {
    const map = new Map<number, 'holding' | 'folded'>();
    if (streakState.history) {
      streakState.history.forEach(item => {
        map.set(item.day_number, item.status);
      });
    }
    return map;
  }, [streakState.history]);

  return (
    <div className="flex-1 flex flex-col justify-between text-[11px] select-none h-full bg-[#c0c0c0]">
      {/* Tab Navigation */}
      <div className="flex border-b-2 border-[#ffffff] px-1 pt-1 mb-2">
        <button
          onClick={() => setActiveTab('status')}
          className={`w98-tab ${activeTab === 'status' ? 'active' : ''}`}
        >
          Willpower Core
        </button>
        <button
          onClick={() => setActiveTab('milestones')}
          className={`w98-tab ${activeTab === 'milestones' ? 'active' : ''}`}
        >
          Milestones
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`w98-tab ${activeTab === 'history' ? 'active' : ''}`}
        >
          November Calendar
        </button>
      </div>

      {activeTab === 'status' && (
        <div className="flex-1 flex flex-col justify-between gap-3 px-2 pb-1 overflow-auto">
          {/* Header Banner */}
          <div className="w98-inset p-2 bg-[#ffffff] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StreakTrackerIcon size={32} />
              <div>
                <div className="font-bold text-[12px] text-[#000080]">
                  SYSTEM PURITY PROTOCOL 98
                </div>
                <div className="text-gray-600 text-[10px]">
                  Rank: <span className="font-semibold text-black">{getRankTitle(streakState.currentStreakDays)}</span>
                </div>
              </div>
            </div>

            {/* Authoritative Status Badge */}
            {isCheckedInToday ? (
              <div className="border-2 border-[#008000] text-[#008000] font-mono font-bold px-2 py-0.5 rotate-[-4deg] text-[10px] tracking-wider bg-green-50 shadow-sm animate-pulse">
                [ ✔ VERIFIED TODAY ]
              </div>
            ) : isFoldedToday ? (
              <div className="border-2 border-[#800000] text-[#800000] font-mono font-bold px-2 py-0.5 rotate-[-4deg] text-[10px] tracking-wider bg-red-50 shadow-sm">
                [ ✖ FOLDED TODAY ]
              </div>
            ) : (
              <div className="border border-blue-700 text-blue-900 font-mono font-bold px-2 py-0.5 text-[10px] bg-blue-50">
                [ PENDING CHECK-IN ]
              </div>
            )}
          </div>

          {/* Odometer Display */}
          <div className="w98-outset p-3 bg-[#c0c0c0] flex flex-col items-center relative">
            <div className="w-full flex justify-between items-center text-[10px] text-gray-700 font-semibold mb-1">
              <span>UNBROKEN VERIFIED STREAK</span>
              <span>
                {streakState.isCloudVerified ? (
                  <span className="text-green-800">● Cloud Verified</span>
                ) : (
                  <span className="text-amber-800">⚠ Local Offline Mode</span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 my-1">
              <div className="flex flex-col items-center">
                <span className={`w98-led-counter ${streakState.currentStreakDays > 0 ? 'green' : 'amber'} text-[34px] px-4`}>
                  {String(streakState.currentStreakDays).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-gray-700 mt-1 font-semibold">ACTIVE DAYS</span>
              </div>
              <span className="text-xl font-bold font-mono text-gray-700 pb-4">:</span>
              <div className="flex flex-col items-center">
                <span className="w98-led-counter amber text-[34px] px-2">
                  {deadlineCountdown.hours}
                </span>
                <span className="text-[10px] text-gray-700 mt-1 font-semibold">HRS LEFT</span>
              </div>
              <span className="text-xl font-bold font-mono text-gray-700 pb-4">:</span>
              <div className="flex flex-col items-center">
                <span className="w98-led-counter amber text-[34px] px-2">
                  {deadlineCountdown.minutes}
                </span>
                <span className="text-[10px] text-gray-700 mt-1 font-semibold">MIN LEFT</span>
              </div>
              <span className="text-xl font-bold font-mono text-gray-700 pb-4">:</span>
              <div className="flex flex-col items-center">
                <span className="w98-led-counter text-[34px] px-2">
                  {deadlineCountdown.seconds}
                </span>
                <span className="text-[10px] text-gray-700 mt-1 font-semibold">SEC</span>
              </div>
            </div>

            {/* Check-In Deadline Note */}
            <div className="text-[10px] text-gray-600 mt-1">
              {isCheckedInToday ? (
                <span className="text-green-800 font-semibold">
                  Today's check-in recorded! Next eligible check-in: 00:00:01 tomorrow.
                </span>
              ) : isFoldedToday ? (
                <span className="text-red-800 font-semibold">
                  Relapse recorded for today. Next check-in begins tomorrow at 00:00:01.
                </span>
              ) : (
                <span>
                  Check-in deadline: 23:59:59 ({streakState.timezone || 'Local Time'}).
                </span>
              )}
            </div>

            {/* Check-In Button */}
            <div className="relative mt-2.5 w-full flex justify-center">
              <button
                onClick={handleCheckIn}
                disabled={isCheckedInToday || isFoldedToday || isSubmittingCheckIn}
                className={`w98-btn py-2 px-6 font-bold text-[12px] flex items-center gap-2 ${
                  isCheckedInToday || isFoldedToday
                    ? 'opacity-60 cursor-not-allowed text-gray-600'
                    : 'text-blue-900 cursor-pointer'
                }`}
              >
                <span>📜</span>
                <span>
                  {isSubmittingCheckIn
                    ? 'Verifying Check-in...'
                    : isCheckedInToday
                    ? '✔ Verified for Today'
                    : isFoldedToday
                    ? '✖ Folded for Today (Locked)'
                    : 'STILL HOLDING (Daily Check-in)'}
                </span>
              </button>

              {/* Animated Rubber Stamp Overlay Effect */}
              {stampEffect && (
                <div className="absolute -top-3 scale-125 border-4 border-red-600 text-red-600 font-black font-mono px-3 py-1 -rotate-12 bg-white/95 z-20 shadow-2xl animate-bounce">
                  CERTIFIED PURE
                </div>
              )}
            </div>
          </div>

          {/* Urge Meter & Coping Module */}
          <div className="w98-inset p-2.5 bg-[#dfdfdf]">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-[11px] text-red-900">
                CURRENT URGE LEVEL: {urgeLevel}/5
              </span>
              <button
                onClick={recordUrgeResisted}
                className="w98-btn text-[10px] py-0.5 px-2 font-semibold"
                title="Log that you fought off an urge"
              >
                + Resisted Urge ({streakState.urgesResisted})
              </button>
            </div>

            <input
              type="range"
              min="1"
              max="5"
              value={urgeLevel}
              onChange={(e) => setUrgeLevel(Number(e.target.value))}
              className="w-full cursor-pointer accent-[#000080]"
            />

            <div className="flex justify-between text-[9px] text-gray-600 mb-1">
              <span>Peaceful</span>
              <span>Mild</span>
              <span>Moderate</span>
              <span>Danger</span>
              <span className="text-red-700 font-bold">CODE RED</span>
            </div>

            <div className="w98-field p-1.5 text-[10px] text-gray-800 italic">
              💡 {getUrgeAdvice(urgeLevel)}
            </div>
          </div>

          {/* Emergency Bottom Bar */}
          <div className="flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-gray-400">
            <button
              onClick={() => openWindow('emergency-player')}
              className="w98-btn bg-[#ffdddd] hover:bg-[#ffcccc] active:bg-[#ffaaaa] text-red-950 font-black text-[11px] flex items-center gap-1.5 border border-red-700 shadow-sm cursor-pointer"
              title="Launch URGE.exe Emergency Player"
            >
              <span>🛑</span>
              <span className="tracking-wide">STOP THE URGE</span>
            </button>

            <button
              onClick={() => openWindow('urge-hotline')}
              className="w98-btn text-red-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <span>🚨</span>
              <span>Hotline</span>
            </button>

            <button
              onClick={triggerFolded}
              className="w98-btn text-gray-700 hover:text-red-900 text-[11px] flex items-center gap-1 cursor-pointer"
              title="Declare relapse and reset active streak"
            >
              <FoldedWarningIcon size={14} />
              <span>I Folded...</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'milestones' && (
        <div className="flex-1 p-2 w98-field overflow-auto flex flex-col gap-2">
          <div className="font-bold text-[#000080] border-b pb-1">
            SACRED MILESTONES OF WILLPOWER:
          </div>
          {[
            { day: 1, name: 'Day 1: The Awakening', desc: 'The first decisive step. Breaking free of autopilot.' },
            { day: 3, name: 'Day 3: Dopamine Shock', desc: 'The physical craving peaks. Hold the line.' },
            { day: 7, name: 'Day 7: Iron Disciple', desc: '168 hours of continuous mastery. Energy surges.' },
            { day: 14, name: 'Day 14: Ascended Sage', desc: 'Mental fog vanishes. Eyes become piercing.' },
            { day: 21, name: 'Day 21: God Mode', desc: 'Habit loops rewritten. Deep stillness and focus.' },
            { day: 30, name: 'Day 30: Nirvana Overlord', desc: 'Complete November conquest. Immortality achieved.' }
          ].map(m => {
            const unlocked = Math.max(streakState.highestStreak || 1, streakState.currentStreakDays || 0) >= m.day;
            return (
              <div 
                key={m.day} 
                className={`p-2 border ${
                  unlocked 
                    ? 'border-green-600 bg-green-50' 
                    : 'border-gray-300 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex justify-between items-center font-bold">
                  <span className={unlocked ? 'text-green-900' : 'text-gray-700'}>
                    {unlocked ? '🏆 ' : '🔒 '} {m.name}
                  </span>
                  {unlocked ? (
                    <button
                      type="button"
                      onClick={() => openWindow('user-account')}
                      className="w98-btn text-[9px] px-1.5 py-0.5 font-bold text-blue-900"
                    >
                      Export Card ↵
                    </button>
                  ) : (
                    <span className="text-[10px] text-gray-600">
                      {m.day - streakState.currentStreakDays} days left
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-gray-700 mt-0.5">{m.desc}</div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="flex-1 p-2 w98-field overflow-auto space-y-3">
          <div className="flex justify-between items-center border-b pb-1">
            <span className="font-bold text-[#000080]">
              NOVEMBER SURVIVAL CALENDAR (30 DAYS):
            </span>
            <span className="text-[10px] text-gray-600 font-mono">
              Day {currentDayOfMonth} of 30
            </span>
          </div>

          {/* 30-Day November Grid displaying authoritative daily status */}
          <div className="grid grid-cols-6 sm:grid-cols-10 gap-1 select-none">
            {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
              const recordedStatus = historyMap.get(day);
              const isToday = day === currentDayOfMonth;
              const isPast = day < currentDayOfMonth;

              let style = 'bg-gray-100 border-gray-300 text-gray-400';
              let icon = '🔒';
              let label = 'Locked';

              if (recordedStatus === 'holding') {
                style = 'bg-green-100 border-green-600 text-green-900 font-bold';
                icon = '✔';
                label = 'Held';
              } else if (recordedStatus === 'folded') {
                style = 'bg-red-100 border-red-600 text-red-900 font-bold';
                icon = '✖';
                label = 'Folded';
              } else if (isToday) {
                if (isCheckedInToday) {
                  style = 'bg-green-100 border-green-600 text-green-900 font-bold';
                  icon = '✔';
                  label = 'Held';
                } else if (isFoldedToday) {
                  style = 'bg-red-100 border-red-600 text-red-900 font-bold';
                  icon = '✖';
                  label = 'Folded';
                } else {
                  style = 'bg-blue-100 border-[#000080] text-[#000080] font-bold ring-1 ring-blue-700 animate-pulse';
                  icon = '⏳';
                  label = 'Pending';
                }
              } else if (isPast) {
                // If past day has no holding record: it was missed!
                style = 'bg-amber-50 border-amber-500 border-dashed text-amber-800';
                icon = '⚠';
                label = 'Missed';
              }

              return (
                <div
                  key={day}
                  title={`Day ${day}: ${label}`}
                  className={`flex flex-col items-center justify-center p-1 rounded-none border text-[10px] ${style}`}
                  style={{ minHeight: '34px' }}
                >
                  <span className="text-[9px] opacity-75">D{day}</span>
                  <span className="text-[11px] leading-tight">{icon}</span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 text-[9px] text-gray-600 border-y py-1">
            <span className="flex items-center gap-1">
              <span className="text-green-700 font-bold">✔</span> Still Holding
            </span>
            <span className="flex items-center gap-1">
              <span className="text-red-700 font-bold">✖</span> Relapsed
            </span>
            <span className="flex items-center gap-1">
              <span className="text-amber-700 font-bold">⚠</span> Missed Day
            </span>
            <span className="flex items-center gap-1">
              <span className="text-blue-800 font-bold">⏳</span> Today (Pending)
            </span>
            <span className="flex items-center gap-1">
              <span className="text-gray-400 font-bold">🔒</span> Future
            </span>
          </div>

          <div className="font-bold text-[#000080] border-b pb-1 pt-1">
            WILLPOWER TELEMETRY & METRICS:
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 border border-gray-300 bg-gray-50">
              <div className="text-gray-500 text-[10px]">Highest Record Streak</div>
              <div className="text-lg font-bold text-blue-900">{streakState.highestStreak} Days</div>
            </div>
            <div className="p-2 border border-gray-300 bg-gray-50">
              <div className="text-gray-500 text-[10px]">Locked Timezone</div>
              <div className="text-[11px] font-bold text-gray-800 truncate">
                {streakState.timezone || 'Pending First Check-in'}
              </div>
            </div>
            <div className="p-2 border border-gray-300 bg-gray-50">
              <div className="text-gray-500 text-[10px]">Challenge Participation Date</div>
              <div className="text-[11px] font-bold text-gray-800 truncate">
                {streakState.challengeJoinedDate || 'Active Participant'}
              </div>
            </div>
            <div className="p-2 border border-gray-300 bg-gray-50">
              <div className="text-gray-500 text-[10px]">Total Relapses (Folded)</div>
              <div className="text-lg font-bold text-red-900">{streakState.foldedCount} Times</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
