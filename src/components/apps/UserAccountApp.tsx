import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/useAuth';
import { useOS } from '../../context/OSContext';
import { supabase } from '../../lib/supabase';
import { sound } from '../../audio/soundEngine';
import { 
  DEFAULT_PIXEL_AVATARS, 
  UserAvatarDisplay 
} from '../common/PixelAvatars';
import { CardExportModal } from '../common/CardExportModal';
import type { CardRenderOptions } from '../../utils/cardCanvasRenderer';
import { NetworkIcon, WarningExclamationIcon } from '../icons/PixelIcons';

const MILESTONES = [
  { day: 1, title: 'Day 01', subtitle: '1 Day No Fap', description: 'The Awakening - First victory over dopamine.' },
  { day: 3, title: 'Day 03', subtitle: '3 Days No Fap', description: 'Neural Reset - Willpower circuits stabilizing.' },
  { day: 7, title: 'Day 07', subtitle: '7 Days No Fap', description: 'One Week Clean - Physical vitality surges.' },
  { day: 14, title: 'Day 14', subtitle: '14 Days No Fap', description: 'Two Weeks Monastic - Mental fog lifting.' },
  { day: 21, title: 'Day 21', subtitle: '21 Days No Fap', description: 'Habit Formation - Dopamine baseline restored.' },
  { day: 30, title: 'Day 30', subtitle: '30 Days No Fap', description: 'Nirvana Overlord - Complete November Transcendence.' }
];

export const UserAccountApp: React.FC = () => {
  const { 
    user, 
    profile, 
    isAuthenticated, 
    isConfigured, 
    authError, 
    signInAnonymously,
    signUpWithEmail, 
    signInWithEmail, 
    updateUsername,
    updateAvatar,
    toggleLeaderboardPublic, 
    signOut,
    clearAuthError
  } = useAuth();
  const { streakState, showNotification } = useOS();

  const [activeTab, setActiveTab] = useState<'profile' | 'avatar' | 'cards' | 'account'>('profile');
  const [usernameInput, setUsernameInput] = useState(profile?.username || '');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Avatar upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Card export modal states
  const [activeCardModal, setActiveCardModal] = useState<CardRenderOptions | null>(null);

  // Authoritative highest streak for milestone persistence
  const effectiveMaxStreak = Math.max(
    streakState.highestStreak || 1, 
    streakState.currentStreakDays || 0,
    profile?.highest_streak || 1
  );

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    setIsSubmitting(true);
    setStatusMessage(null);
    sound.playClick();
    const success = await updateUsername(usernameInput.trim());
    setIsSubmitting(false);
    if (success) {
      setStatusMessage('Display name updated successfully.');
      showNotification('IDENTITY UPDATED', `Display name updated to: ${usernameInput.trim()}`, 'info');
    }
  };

  const handleTogglePublic = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.checked;
    sound.playClick();
    await toggleLeaderboardPublic(nextVal);
    showNotification(
      'LEADERBOARD PREFERENCE',
      nextVal ? 'Opted in: Your streak will appear on the Hall of Fame.' : 'Opted out: Your streak is now private.',
      'info'
    );
  };

  // Avatar File Upload & Square Crop
  const handleAvatarFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Validation 1: Reject SVG explicitly for security
    if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
      setUploadError('SVG uploads are not permitted for security reasons. Please upload PNG, JPEG, or WebP.');
      sound.playError();
      return;
    }

    // Validation 2: Supported image types
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Unsupported file type. Please upload a PNG, JPEG, or WebP image.');
      sound.playError();
      return;
    }

    // Validation 3: Maximum 2.5MB
    const MAX_SIZE = 2.5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadError('Image size exceeds 2.5MB limit. Please choose a smaller image.');
      sound.playError();
      return;
    }

    setIsUploading(true);
    sound.playClick();

    try {
      // Load file into an image element to validate dimensions & crop square
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        const img = new Image();
        img.onload = async () => {
          if (img.width < 48 || img.height < 48) {
            setUploadError('Image resolution too low. Minimum dimension is 48x48 pixels.');
            setIsUploading(false);
            sound.playError();
            return;
          }

          // Center-crop to 1:1 square canvas (256x256)
          const targetSize = 256;
          const canvas = document.createElement('canvas');
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setUploadError('Failed to initialize image processing canvas.');
            setIsUploading(false);
            return;
          }

          const minDim = Math.min(img.width, img.height);
          const srcX = (img.width - minDim) / 2;
          const srcY = (img.height - minDim) / 2;

          ctx.drawImage(img, srcX, srcY, minDim, minDim, 0, 0, targetSize, targetSize);
          const croppedDataUrl = canvas.toDataURL('image/png');

          // If user is authenticated & Supabase configured, attempt storage upload
          if (supabase && user && isConfigured) {
            try {
              const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
              if (blob) {
                const filePath = `${user.id}/avatar_${Date.now()}.png`;
                const { error: uploadErr } = await supabase.storage
                  .from('avatars')
                  .upload(filePath, blob, { contentType: 'image/png', upsert: true });

                if (!uploadErr) {
                  const { data: pubData } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);

                  if (pubData?.publicUrl) {
                    await updateAvatar(pubData.publicUrl);
                    setIsUploading(false);
                    showNotification('AVATAR UPDATED', 'Custom avatar uploaded to cloud storage.', 'info');
                    return;
                  }
                }
              }
            } catch (storageErr) {
              console.warn('Storage upload fallback to dataUrl:', storageErr);
            }
          }

          // Fallback / Guest mode: Save cropped base64 data URL
          await updateAvatar(croppedDataUrl);
          setIsUploading(false);
          showNotification('AVATAR UPDATED', 'Custom avatar saved to profile.', 'info');
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    } catch {
      setUploadError('Error processing image. Please try another file.');
      setIsUploading(false);
    }
  };

  const handleSelectDefaultPixel = async (avatarId: string) => {
    sound.playClick();
    await updateAvatar(avatarId);
    showNotification('AVATAR SELECTED', `Survivor avatar equipped.`, 'info');
  };

  const handleRemoveAvatar = async () => {
    sound.playClick();
    await updateAvatar(null);
    showNotification('AVATAR RESET', 'Avatar reset to default initial.', 'info');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) return;
    setIsSubmitting(true);
    setStatusMessage(null);
    clearAuthError();

    const res = await signUpWithEmail(emailInput, passwordInput, usernameInput || profile?.username || 'Disciple');
    setIsSubmitting(false);
    if (res.success) {
      setStatusMessage('Account created! Please check your email inbox to confirm if confirmation is enabled.');
      showNotification('ACCOUNT CREATED', 'Your permanent account has been registered.', 'info');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) return;
    setIsSubmitting(true);
    setStatusMessage(null);
    clearAuthError();

    const res = await signInWithEmail(emailInput, passwordInput);
    setIsSubmitting(false);
    if (res.success) {
      setStatusMessage('Logged in successfully!');
      showNotification('LOGON SUCCESS', 'Welcome back to IHAVENTNUTTED 98.', 'info');
    }
  };

  // Format Join Date
  const joinDateDisplay = new Date(streakState.startDate).toLocaleDateString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="flex-1 flex flex-col justify-between text-[11px] h-full bg-[#c0c0c0] select-none p-1">
      {/* Navigation Tabs */}
      <div className="flex border-b-2 border-[#ffffff] px-1 pt-1 mb-2 overflow-x-auto gap-0.5">
        <button
          onClick={() => { sound.playClick(); setActiveTab('profile'); }}
          className={`w98-tab ${activeTab === 'profile' ? 'active' : ''}`}
        >
          Survivor Profile
        </button>
        <button
          onClick={() => { sound.playClick(); setActiveTab('avatar'); }}
          className={`w98-tab ${activeTab === 'avatar' ? 'active' : ''}`}
        >
          Avatar Customizer
        </button>
        <button
          onClick={() => { sound.playClick(); setActiveTab('cards'); }}
          className={`w98-tab ${activeTab === 'cards' ? 'active' : ''}`}
        >
          Achievement Cards
        </button>
        <button
          onClick={() => { sound.playClick(); setActiveTab('account'); }}
          className={`w98-tab ${activeTab === 'account' ? 'active' : ''}`}
        >
          Network Logon
        </button>
      </div>

      {/* TAB 1: SURVIVOR PROFILE */}
      {activeTab === 'profile' && (
        <div className="flex-1 flex flex-col gap-2.5 p-1 overflow-y-auto">
          {/* Main Survivor Identity Card */}
          <div className="w98-window p-2 bg-[#dfdfdf] border-2 border-t-white border-l-white border-b-black border-r-black flex flex-col sm:flex-row items-center sm:items-start gap-3">
            {/* Large Avatar with authentic double-bevel frame */}
            <div className="relative group">
              <div className="p-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black shadow-sm">
                <UserAvatarDisplay
                  avatarUrl={profile?.avatar_url}
                  username={profile?.username || 'Survivor'}
                  size={76}
                  className="rounded-none shadow-inner"
                />
              </div>
              <button
                type="button"
                onClick={() => { sound.playClick(); setActiveTab('avatar'); }}
                className="w98-btn absolute -bottom-1 -right-1 text-[9px] px-1.5 py-0.5 font-bold bg-[#c0c0c0] border border-black shadow"
                title="Change Avatar"
              >
                ✏ Edit
              </button>
            </div>

            {/* Survivor Details */}
            <div className="flex-1 space-y-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-bold text-[13px] text-[#000080]">
                  {profile?.username || 'Guest Survivor'}
                </span>
                <span className={`text-[9.5px] px-1.5 py-0.5 font-mono font-bold self-center sm:self-auto ${
                  isAuthenticated ? 'bg-emerald-800 text-emerald-100' : 'bg-gray-400 text-black'
                }`}>
                  {isAuthenticated ? '● CLOUD DISCIPLE' : '○ LOCAL GUEST'}
                </span>
              </div>

              <div className="text-[10px] text-gray-700 font-mono">
                ENROLLED: {joinDateDisplay}
              </div>

              {/* Status Pill */}
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-0.5">
                <span className="text-[10px] text-gray-600">Challenge Status:</span>
                <span className={`font-bold px-2 py-0.5 text-[9.5px] ${
                  streakState.todayStatus === 'holding' 
                    ? 'bg-blue-100 text-blue-900 border border-blue-600' 
                    : streakState.todayStatus === 'folded' 
                    ? 'bg-red-100 text-red-900 border border-red-600' 
                    : 'bg-yellow-100 text-yellow-900 border border-yellow-600'
                }`}>
                  {streakState.todayStatus === 'holding' ? '✔ HOLDING STRONG' : streakState.todayStatus === 'folded' ? '✖ FOLDED' : '⏳ PENDING CHECK-IN'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2">
            <div className="w98-inset bg-white p-2 text-center">
              <div className="text-[9.5px] text-gray-600 uppercase font-mono">Current Streak</div>
              <div className="text-[16px] font-black text-[#000080]">{streakState.currentStreakDays} <span className="text-[10px] font-normal">Days</span></div>
            </div>
            <div className="w98-inset bg-white p-2 text-center">
              <div className="text-[9.5px] text-gray-600 uppercase font-mono">Highest Record</div>
              <div className="text-[16px] font-black text-amber-700">{effectiveMaxStreak} <span className="text-[10px] font-normal">Days</span></div>
            </div>
            <div className="w98-inset bg-white p-2 text-center">
              <div className="text-[9.5px] text-gray-600 uppercase font-mono">Check-Ins</div>
              <div className="text-[16px] font-black text-emerald-800">{streakState.totalCheckIns || 1}</div>
            </div>
          </div>

          {/* Edit Display Name */}
          <form onSubmit={handleUpdateName} className="border border-gray-400 p-2 bg-[#dfdfdf] space-y-1.5">
            <div className="font-semibold text-gray-800 flex items-center justify-between">
              <span>Change Public Survivor Nickname:</span>
              <span className="text-[9px] text-gray-500 font-mono">{usernameInput.length}/24</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                maxLength={24}
                placeholder="Enter survivor nickname"
                className="flex-1 w98-field px-2 py-1 text-[11px] select-text"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w98-btn px-3 font-semibold"
              >
                Save Name
              </button>
            </div>
          </form>

          {/* Leaderboard Privacy Opt-In */}
          <fieldset className="border border-gray-400 p-2 bg-white">
            <legend className="px-1 text-[10.5px] font-semibold text-[#000080]">
              Global Hall of Fame Privacy
            </legend>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(profile?.is_leaderboard_public)}
                onChange={handleTogglePublic}
                className="w98-checkbox mt-0.5"
              />
              <div className="space-y-0.5">
                <span className="font-semibold text-black">
                  Display my verified streak on the Global Hall of Fame
                </span>
                <p className="text-[9.5px] text-gray-600 leading-tight">
                  Only your chosen nickname, avatar, and current streak ({streakState.currentStreakDays} Days) will be published.
                </p>
              </div>
            </label>
          </fieldset>

          {statusMessage && (
            <div className="w98-inset bg-green-50 text-green-900 p-1.5 font-semibold text-center border border-green-600">
              {statusMessage}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AVATAR CUSTOMIZER */}
      {activeTab === 'avatar' && (
        <div className="flex-1 flex flex-col gap-3 p-1 overflow-y-auto">
          {/* Active Avatar Preview & Upload Controls */}
          <div className="w98-inset bg-white p-3 flex flex-col sm:flex-row items-center gap-4">
            <div className="p-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black">
              <UserAvatarDisplay
                avatarUrl={profile?.avatar_url}
                username={profile?.username || 'Survivor'}
                size={80}
              />
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div className="font-bold text-[#000080]">Custom Profile Picture:</div>
              <p className="text-[10px] text-gray-600 leading-tight">
                Upload your custom avatar (PNG, JPEG, WebP - max 2.5MB). Automatically cropped to 1:1 square.
              </p>

              <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleAvatarFileSelected}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="w98-btn px-3 py-1 font-bold text-[#000080]"
                >
                  {isUploading ? 'Uploading...' : '📁 Upload Image...'}
                </button>

                {profile?.avatar_url && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="w98-btn px-3 py-1 text-red-900"
                  >
                    Reset to Default
                  </button>
                )}
              </div>
            </div>
          </div>

          {uploadError && (
            <div className="w98-inset bg-red-100 text-red-900 p-1.5 border border-red-500 font-semibold text-[10px]">
              ⚠️ {uploadError}
            </div>
          )}

          {/* 6 Default Retro Pixel Avatars */}
          <div className="border border-gray-400 p-2.5 bg-[#dfdfdf] space-y-2">
            <div className="font-bold text-gray-800">
              Or Choose an Authentic Windows 98 Pixel Avatar:
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {DEFAULT_PIXEL_AVATARS.map((avatar) => {
                const isSelected = profile?.avatar_url === avatar.id;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => handleSelectDefaultPixel(avatar.id)}
                    className={`p-1.5 flex flex-col items-center gap-1 bg-[#c0c0c0] cursor-pointer hover:bg-gray-200 border-2 ${
                      isSelected 
                        ? 'border-t-black border-l-black border-b-white border-r-white bg-blue-100 ring-2 ring-[#000080]' 
                        : 'border-t-white border-l-white border-b-black border-r-black'
                    }`}
                  >
                    <div 
                      className="w-10 h-10 w98-inset bg-white flex items-center justify-center overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: avatar.svgString }}
                    />
                    <span className="text-[9px] font-bold text-gray-800 text-center truncate w-full">
                      {avatar.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACHIEVEMENT CARDS & 1080x1350 PNG EXPORT */}
      {activeTab === 'cards' && (
        <div className="flex-1 flex flex-col gap-2.5 p-1 overflow-y-auto">
          {/* Join Challenge Pass Card */}
          <div className="w98-inset bg-white p-2.5 flex items-center justify-between gap-2 border-l-4 border-l-[#000080]">
            <div>
              <div className="font-bold text-[12px] text-[#000080] flex items-center gap-1.5">
                <span>🎫</span>
                <span>Official Challenge Participation Pass</span>
              </div>
              <div className="text-[10px] text-gray-600 font-mono mt-0.5">
                JOINED NO NUT NOVEMBER 2026 • {joinDateDisplay}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveCardModal({
                  type: 'join',
                  username: profile?.username || 'Guest Survivor',
                  avatarUrl: profile?.avatar_url,
                  dateAchieved: joinDateDisplay,
                  isCloudVerified: isAuthenticated
                });
              }}
              className="w98-btn px-3 py-1 font-bold text-xs bg-[#c0c0c0] text-[#000080] border-2 border-t-white border-l-white border-b-black border-r-black"
            >
              Export Pass ↵
            </button>
          </div>

          {/* Milestone Achievements Grid */}
          <div className="space-y-1.5">
            <div className="font-bold text-gray-800 flex items-center justify-between px-0.5">
              <span>Milestone Achievement Cards (1080 × 1350 PNG):</span>
              <span className="text-[9.5px] font-mono text-gray-600">
                Max Record: {effectiveMaxStreak} Days
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MILESTONES.map((m) => {
                const isUnlocked = effectiveMaxStreak >= m.day;

                return (
                  <div
                    key={m.day}
                    className={`p-2 border-2 flex flex-col justify-between gap-1.5 ${
                      isUnlocked 
                        ? 'bg-white border-t-white border-l-white border-b-black border-r-black shadow-sm' 
                        : 'bg-[#e5e5e5] border-gray-400 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{isUnlocked ? (m.day === 30 ? '👑' : '🏆') : '🔒'}</span>
                          <span className={`font-black text-xs ${isUnlocked ? 'text-[#000080]' : 'text-gray-600'}`}>
                            {m.title} - {m.subtitle}
                          </span>
                        </div>
                        <p className="text-[9.5px] text-gray-600 leading-tight mt-0.5">
                          {m.description}
                        </p>
                      </div>

                      <span className={`text-[9px] font-mono px-1 py-0.5 font-bold shrink-0 ${
                        isUnlocked ? 'bg-emerald-100 text-emerald-900 border border-emerald-600' : 'bg-gray-300 text-gray-600'
                      }`}>
                        {isUnlocked ? 'UNLOCKED' : `REQ: DAY ${m.day}`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-gray-200">
                      <span className="text-[9px] text-gray-500 font-mono">
                        {isUnlocked ? 'Authoritatively Verified' : 'Locked until streak reached'}
                      </span>
                      <button
                        type="button"
                        disabled={!isUnlocked}
                        onClick={() => {
                          sound.playClick();
                          setActiveCardModal({
                            type: 'milestone',
                            username: profile?.username || 'Guest Survivor',
                            avatarUrl: profile?.avatar_url,
                            dayNumber: m.day,
                            daysNoFapText: `${m.day} DAYS NO FAP`,
                            dateAchieved: new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
                            isCloudVerified: isAuthenticated
                          });
                        }}
                        className={`w98-btn px-2.5 py-0.5 text-[10px] font-bold ${
                          isUnlocked ? 'text-black' : 'opacity-40 cursor-not-allowed'
                        }`}
                      >
                        {isUnlocked ? 'Export Card ↵' : 'Locked'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ACCOUNT UPGRADE & CLOUD LOGON */}
      {activeTab === 'account' && (
        <div className="flex-1 flex flex-col gap-3 p-1 overflow-y-auto">
          {/* Supabase Status Banner */}
          <div className="w98-inset p-2 bg-[#dfdfdf] flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5">
              <NetworkIcon size={14} />
              <span className="font-semibold text-gray-800">Supabase Cloud Sync:</span>
            </div>
            <span className={`px-2 py-0.5 font-bold ${
              isConfigured ? 'bg-green-700 text-white' : 'bg-gray-400 text-black'
            }`}>
              {isConfigured ? 'ONLINE' : 'OFFLINE (Local Mode)'}
            </span>
          </div>

          {!isConfigured && (
            <div className="w98-inset bg-[#ffffdf] p-2 flex items-start gap-2 border border-yellow-500">
              <WarningExclamationIcon size={20} className="flex-shrink-0 mt-0.5" />
              <div className="text-[10px] text-gray-800 leading-tight">
                <strong>Notice:</strong> To enable multi-user cloud sync, configure your Supabase URL and Anon Key in <code className="bg-gray-200 px-1 font-mono">.env</code>. The app continues to work in local guest mode.
              </div>
            </div>
          )}

          {authError && (
            <div className="w98-inset bg-red-100 text-red-900 p-2 border border-red-500 font-semibold text-[10px]">
              Error: {authError}
            </div>
          )}

          {isAuthenticated ? (
            /* Logged In View */
            <div className="space-y-3 p-2 bg-white w98-field">
              <div className="font-bold text-green-800 border-b pb-1">
                Cloud Session Active
              </div>
              <div>Network Session: <span className="font-mono text-[10px] text-green-700 font-bold">{user?.is_anonymous ? 'Anonymous Guest Session' : 'Registered Member Session'}</span></div>
              <div>Locked Challenge Timezone: <span className="font-bold text-gray-900">{streakState.timezone || 'Auto-locked on check-in'}</span></div>
              <div>Authoritative Streak: <span className="font-bold text-[#000080]">{streakState.currentStreakDays} Days</span></div>
              <div>Today's Status: <span className="font-bold">{streakState.todayStatus === 'holding' ? '✔ Still Holding' : streakState.todayStatus === 'folded' ? '✖ Folded' : '⏳ Pending Check-in'}</span></div>
              <button
                type="button"
                onClick={signOut}
                className="w98-btn px-4 py-1 text-red-900 font-semibold"
              >
                Sign Out / Disconnect
              </button>
            </div>
          ) : (
            /* Guest / Upgrade View */
            <div className="space-y-3">
              <form className="border border-gray-400 p-2.5 bg-[#dfdfdf] space-y-2">
                <div className="font-bold text-[#000080]">
                  Link Permanent Account (Optional):
                </div>
                <p className="text-[10px] text-gray-600">
                  Upgrade your guest account to preserve your streak across devices and claim your username.
                </p>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold block">Email Address:</label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full w98-field px-2 py-1 select-text"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold block">Password:</label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full w98-field px-2 py-1 select-text"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isSubmitting || !isConfigured}
                    onClick={handleSignUp}
                    className="w98-btn px-3 py-1 font-bold text-blue-900"
                  >
                    Register Account
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting || !isConfigured}
                    onClick={handleSignIn}
                    className="w98-btn px-3 py-1"
                  >
                    Log In Existing
                  </button>
                </div>
              </form>

              {isConfigured && (
                <div className="border border-gray-400 p-2 bg-white flex justify-between items-center">
                  <span className="text-[10px] text-gray-700">Quick Anonymous Cloud Guest:</span>
                  <button
                    type="button"
                    onClick={signInAnonymously}
                    className="w98-btn text-[10px] px-2 py-0.5"
                  >
                    Connect Guest Session
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Status Bar */}
      <div className="w98-inset px-2 py-0.5 text-[10px] flex justify-between bg-[#c0c0c0] text-gray-700 mx-1 mb-0.5">
        <span>Identity: {profile?.username || 'Guest'}</span>
        <span>Security Protocol: SSL / TLS 1.3</span>
      </div>

      {/* Card Export Modal Dialog (1080x1350 PNG) */}
      {activeCardModal && (
        <CardExportModal
          options={activeCardModal}
          onClose={() => setActiveCardModal(null)}
        />
      )}
    </div>
  );
};
