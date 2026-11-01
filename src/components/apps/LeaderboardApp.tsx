import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { useAuth } from '../../context/useAuth';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { UserAvatarDisplay } from '../common/PixelAvatars';

interface LeaderboardEntry {
  rank: number;
  handle: string;
  days: number;
  status: string;
  index: string;
  specialty: string;
  isUser?: boolean;
  avatarUrl?: string | null;
}

const BENCHMARK_LEGENDS: LeaderboardEntry[] = [
  { rank: 1, handle: 'Socrates_Nutless', days: 365, status: 'Olympian Sage', index: '99.9%', specialty: 'Ancient Philosophy' },
  { rank: 2, handle: 'Monk_Dmitri', days: 92, status: 'Ascended Titan', index: '98.4%', specialty: 'Cold Mountain Springs' },
  { rank: 3, handle: 'ZenMaster_Lee', days: 64, status: 'Iron Disciple', index: '95.2%', specialty: '4AM Meditation' },
  { rank: 4, handle: 'PureMind_99', days: 42, status: 'Transcended', index: '92.1%', specialty: 'Dumbbell Defense' },
  { rank: 5, handle: 'GigaChad_98', days: 30, status: 'Nirvana Overlord', index: '90.0%', specialty: 'Pushup Machine' },
  { rank: 6, handle: 'BroccoliWarrior', days: 24, status: 'Titan Will', index: '87.5%', specialty: 'Raw Veggie Diet' },
  { rank: 7, handle: 'Keyboard_Only', days: 18, status: 'Disciplined', index: '82.0%', specialty: 'No Touch Policy' },
  { rank: 9, handle: 'Surviving_Sam', days: 3, status: 'Twitching Novice', index: '62.0%', specialty: 'Phone in Freezer' },
  { rank: 10, handle: 'DownBadDan', days: 1, status: 'Recovering', index: '45.0%', specialty: 'Constantly Praying' }
];

export const LeaderboardApp: React.FC = () => {
  const { streakState, openWindow } = useOS();
  const { user, profile } = useAuth();

  const [sortBy, setSortBy] = useState<'rank' | 'days' | 'index'>('days');
  const [cloudEntries, setCloudEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch real public leaderboard from Supabase
  useEffect(() => {
    const client = supabase;
    if (!client || !isSupabaseConfigured) return;

    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await client
          .from('public_leaderboard')
          .select('id, username, current_streak, highest_streak, rank, avatar_color, avatar_url, created_at')
          .order('current_streak', { ascending: false })
          .limit(50);

        if (!error && data && data.length > 0) {
          const mapped: LeaderboardEntry[] = data.map((row, idx) => {
            const streak = row.current_streak;
            const status = streak >= 30 ? 'Nirvana Overlord'
              : streak >= 21 ? 'Ascended Titan'
              : streak >= 14 ? 'Iron Disciple'
              : streak >= 7 ? 'Disciplined Sage'
              : streak >= 1 ? 'Hardened Novice'
              : 'Untested (Day 0)';

            const isCurrent = user ? (row.id === user.id) : false;

            return {
              rank: idx + 1,
              handle: isCurrent ? `${row.username} (You)` : row.username,
              days: streak,
              status,
              index: `${Math.min(99, 50 + streak * 3)}%`,
              specialty: row.rank ? `Rank: ${row.rank}` : 'Willpower Vanguard',
              isUser: isCurrent,
              avatarUrl: row.avatar_url || (isCurrent ? profile?.avatar_url : undefined)
            };
          });

          setCloudEntries(mapped);
        }
      } catch (err) {
        console.warn('Leaderboard fetch notice:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [user, streakState.currentStreakDays, profile?.avatar_url]);

  // Combine real entries or fall back to verified list with user entry inserted
  const displayEntries: LeaderboardEntry[] = React.useMemo(() => {
    if (cloudEntries.length > 0) {
      // If user is not yet in public list (e.g. private or local), inject them clearly marked
      const hasUser = cloudEntries.some(e => e.isUser);
      if (!hasUser) {
        const userEntry: LeaderboardEntry = {
          rank: 999,
          handle: `${profile?.username || 'You'} (${streakState.isCloudVerified ? 'Private' : 'Unverified'})`,
          days: streakState.currentStreakDays,
          status: streakState.currentStreakDays >= 7 ? 'Iron Disciple' : streakState.currentStreakDays >= 1 ? 'Hardened Novice' : 'Untested (Day 0)',
          index: `${Math.min(99, 50 + streakState.currentStreakDays * 4)}%`,
          specialty: streakState.isCloudVerified ? 'Opted out of public list' : 'Local Offline Streak',
          isUser: true,
          avatarUrl: profile?.avatar_url
        };
        return [...cloudEntries, userEntry];
      }
      return cloudEntries;
    }

    // Benchmark fallback list with user entry
    const userEntry: LeaderboardEntry = {
      rank: 8,
      handle: `${profile?.username || 'You'} (${streakState.isCloudVerified ? 'Verified' : 'Offline'})`,
      days: streakState.currentStreakDays,
      status: streakState.currentStreakDays >= 7 ? 'Iron Disciple' : streakState.currentStreakDays >= 1 ? 'Hardened Novice' : 'Untested (Day 0)',
      index: `${Math.min(99, 50 + streakState.currentStreakDays * 4)}%`,
      specialty: streakState.isCloudVerified ? 'IHAVENTNUTTED 98 Cloud User' : 'Local Offline Mode',
      isUser: true,
      avatarUrl: profile?.avatar_url
    };

    return [...BENCHMARK_LEGENDS, userEntry];
  }, [cloudEntries, streakState, profile]);

  const sortedEntries = [...displayEntries].sort((a, b) => {
    if (sortBy === 'days') return b.days - a.days;
    if (sortBy === 'index') return parseFloat(b.index) - parseFloat(a.index);
    return a.rank - b.rank;
  });

  return (
    <div className="flex-1 flex flex-col justify-between text-[11px] h-full bg-[#c0c0c0] select-none">
      {/* Explorer Menubar */}
      <div className="flex items-center gap-3 px-2 py-0.5 border-b border-[#808080] text-[11px]">
        <span className="hover:bg-[#000080] hover:text-white px-1 cursor-default">File</span>
        <span className="hover:bg-[#000080] hover:text-white px-1 cursor-default">Edit</span>
        <span className="hover:bg-[#000080] hover:text-white px-1 cursor-default">View</span>
        <span 
          onClick={() => openWindow('user-account')}
          className="hover:bg-[#000080] hover:text-white px-1 cursor-pointer font-bold"
        >
          Privacy Settings...
        </span>
        <span className="hover:bg-[#000080] hover:text-white px-1 cursor-default">Help</span>
      </div>

      {/* Address Bar */}
      <div className="flex items-center gap-1.5 px-2 py-1 border-b border-[#808080] bg-[#c0c0c0]">
        <span className="text-gray-600 text-[11px]">Address:</span>
        <div className="flex-1 w98-field px-2 py-0.5 font-mono text-[11px]">
          http://ihaventnutted.net/hall_of_fame.htm?verified=true
        </div>
      </div>

      {/* Unverified / Offline Notice if applicable */}
      {!streakState.isCloudVerified && (
        <div className="mx-1 mt-1 px-2 py-1 bg-[#ffffcc] border border-[#808000] text-[#800000] text-[10px] flex items-center justify-between">
          <span>⚠ Notice: Offline guest streaks are not published to the global Hall of Fame.</span>
          <button 
            type="button" 
            onClick={() => openWindow('user-account')}
            className="w98-btn px-2 py-0 text-[10px] cursor-pointer"
          >
            Logon
          </button>
        </div>
      )}

      {/* Explorer Details Table */}
      <div className="flex-1 w98-field mx-1 my-1 overflow-auto bg-[#ffffff]">
        {isLoading ? (
          <div className="p-4 text-center text-[#000080] font-mono">
            *** Querying Central Willpower Ledger...
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-[11px]">
            <thead className="bg-[#c0c0c0] sticky top-0 border-b border-[#808080]">
              <tr>
                <th 
                  onClick={() => setSortBy('days')}
                  className="w98-outset px-2 py-1 cursor-pointer font-normal hover:bg-[#dfdfdf]"
                >
                  Rank
                </th>
                <th className="w98-outset px-2 py-1 cursor-default font-normal">
                  Warrior Handle
                </th>
                <th 
                  onClick={() => setSortBy('days')}
                  className="w98-outset px-2 py-1 cursor-pointer font-bold hover:bg-[#dfdfdf]"
                >
                  Streak Days {sortBy === 'days' ? '▼' : ''}
                </th>
                <th className="w98-outset px-2 py-1 cursor-default font-normal">
                  Purity Status
                </th>
                <th 
                  onClick={() => setSortBy('index')}
                  className="w98-outset px-2 py-1 cursor-pointer font-normal hover:bg-[#dfdfdf]"
                >
                  Willpower % {sortBy === 'index' ? '▼' : ''}
                </th>
                <th className="w98-outset px-2 py-1 cursor-default font-normal">
                  Survival Specialty
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedEntries.map((row, index) => {
                const isSelected = row.isUser;
                const displayRank = index + 1;
                return (
                  <tr
                    key={row.handle + index}
                    className={`border-b border-gray-100 ${
                      isSelected
                        ? 'bg-[#000080] text-white font-semibold'
                        : 'hover:bg-blue-50 text-black'
                    }`}
                  >
                    <td className="px-2 py-1 font-mono">#{displayRank}</td>
                    <td className="px-2 py-1 flex items-center gap-1.5">
                      <span>{displayRank === 1 ? '🥇' : displayRank === 2 ? '🥈' : displayRank === 3 ? '🥉' : '🛡️'}</span>
                      <UserAvatarDisplay
                        avatarUrl={row.avatarUrl}
                        username={row.handle}
                        size={16}
                        className="inline-block shrink-0"
                      />
                      <span className="truncate">{row.handle}</span>
                    </td>
                    <td className="px-2 py-1 font-mono font-bold">{row.days} Days</td>
                    <td className="px-2 py-1">{row.status}</td>
                    <td className="px-2 py-1 font-mono">{row.index}</td>
                    <td className="px-2 py-1 text-[10px] opacity-90">{row.specialty}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Status Bar */}
      <div className="w98-inset px-2 py-0.5 text-[10px] flex justify-between bg-[#c0c0c0] text-gray-700 mx-1 mb-0.5">
        <span>Verified Records: {sortedEntries.length} Participants</span>
        <span>
          Your Active Streak: <strong className="text-black">{streakState.currentStreakDays} Days</strong>
        </span>
      </div>
    </div>
  );
};
