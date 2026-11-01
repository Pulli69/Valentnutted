import React from 'react';

export interface PixelAvatarMeta {
  id: string;
  name: string;
  svgString: string;
}

// 6 Iconic Retro Windows 98 Pixel Avatars
export const DEFAULT_PIXEL_AVATARS: PixelAvatarMeta[] = [
  {
    id: 'monk',
    name: 'Monk Dmitri',
    svgString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="64" height="64"><rect width="32" height="32" fill="#2d3748"/><rect x="8" y="6" width="16" height="14" fill="#f6ad55"/><rect x="6" y="10" width="2" height="6" fill="#ed8936"/><rect x="24" y="10" width="2" height="6" fill="#ed8936"/><rect x="8" y="9" width="16" height="3" fill="#c53030"/><rect x="10" y="14" width="3" height="2" fill="#1a202c"/><rect x="19" y="14" width="3" height="2" fill="#1a202c"/><rect x="14" y="17" width="4" height="2" fill="#dd6b20"/><rect x="13" y="19" width="6" height="1" fill="#742a2a"/><rect x="6" y="20" width="20" height="12" fill="#744210"/><rect x="10" y="22" width="12" height="10" fill="#d69e2e"/></svg>`
  },
  {
    id: 'gigachad',
    name: 'GigaChad 98',
    svgString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="64" height="64"><rect width="32" height="32" fill="#1a202c"/><rect x="8" y="4" width="16" height="5" fill="#4a5568"/><rect x="7" y="9" width="18" height="13" fill="#ecc94b"/><rect x="7" y="10" width="18" height="4" fill="#000000"/><rect x="9" y="11" width="5" height="2" fill="#ffffff"/><rect x="18" y="11" width="5" height="2" fill="#ffffff"/><rect x="13" y="15" width="6" height="2" fill="#d69e2e"/><rect x="12" y="18" width="8" height="1.5" fill="#744210"/><rect x="9" y="20" width="14" height="4" fill="#ecc94b"/><rect x="13" y="22" width="6" height="2" fill="#b7791f"/><rect x="5" y="24" width="22" height="8" fill="#2b6cb0"/></svg>`
  },
  {
    id: 'puremind',
    name: 'PureMind Cyber',
    svgString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="64" height="64"><rect width="32" height="32" fill="#000080"/><rect x="7" y="6" width="18" height="16" fill="#a0aec0"/><rect x="6" y="8" width="20" height="3" fill="#3182ce"/><rect x="9" y="12" width="14" height="4" fill="#00ffcc"/><rect x="11" y="13" width="10" height="2" fill="#ffffff"/><rect x="10" y="18" width="12" height="2" fill="#4a5568"/><rect x="8" y="22" width="16" height="10" fill="#2d3748"/><rect x="14" y="23" width="4" height="9" fill="#00ffcc"/></svg>`
  },
  {
    id: 'warrior',
    name: 'Steel Knight',
    svgString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="64" height="64"><rect width="32" height="32" fill="#2c5282"/><rect x="8" y="5" width="16" height="16" fill="#718096"/><rect x="6" y="7" width="20" height="4" fill="#e2e8f0"/><rect x="14" y="4" width="4" height="4" fill="#e53e3e"/><rect x="9" y="13" width="14" height="3" fill="#1a202c"/><rect x="15" y="11" width="2" height="7" fill="#1a202c"/><rect x="10" y="18" width="12" height="3" fill="#cbd5e0"/><rect x="5" y="22" width="22" height="10" fill="#4a5568"/><rect x="12" y="24" width="8" height="8" fill="#e2e8f0"/></svg>`
  },
  {
    id: 'zenmaster',
    name: 'ZenMaster Lee',
    svgString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="64" height="64"><rect width="32" height="32" fill="#22543d"/><polygon points="16,3 3,11 29,11" fill="#d69e2e"/><rect x="9" y="11" width="14" height="10" fill="#fbd38d"/><rect x="11" y="14" width="3" height="1" fill="#2d3748"/><rect x="18" y="14" width="3" height="1" fill="#2d3748"/><rect x="10" y="17" width="12" height="6" fill="#edf2f7"/><rect x="13" y="19" width="6" height="6" fill="#e2e8f0"/><rect x="6" y="21" width="20" height="11" fill="#276749"/></svg>`
  },
  {
    id: 'novice',
    name: 'Awakened Novice',
    svgString: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="64" height="64"><rect width="32" height="32" fill="#4a5568"/><rect x="8" y="5" width="16" height="6" fill="#805ad5"/><rect x="8" y="10" width="16" height="11" fill="#fbd38d"/><rect x="8" y="9" width="16" height="2" fill="#ffffff"/><rect x="11" y="13" width="2.5" height="2" fill="#2d3748"/><rect x="18.5" y="13" width="2.5" height="2" fill="#2d3748"/><rect x="13" y="17" width="6" height="1.5" fill="#c53030"/><rect x="6" y="21" width="20" height="11" fill="#dd6b20"/><rect x="11" y="23" width="10" height="9" fill="#2b6cb0"/></svg>`
  }
];

export const getAvatarSvgDataUrl = (svgString: string): string => {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
};

export const UserAvatarDisplay: React.FC<{
  avatarUrl?: string | null;
  username: string;
  size?: number;
  className?: string;
  fallbackColor?: string;
}> = ({ avatarUrl, username, size = 32, className = '', fallbackColor = '#000080' }) => {
  // If user has custom image or data URL
  if (avatarUrl) {
    // Check if it's one of the default avatar IDs
    const matchedDefault = DEFAULT_PIXEL_AVATARS.find(a => a.id === avatarUrl);
    if (matchedDefault) {
      return (
        <div 
          className={`shrink-0 overflow-hidden w98-inset bg-white flex items-center justify-center ${className}`}
          style={{ width: size, height: size }}
          title={username}
          dangerouslySetInnerHTML={{ __html: matchedDefault.svgString }}
        />
      );
    }

    return (
      <img
        src={avatarUrl}
        alt={username}
        className={`shrink-0 object-cover w98-inset bg-white ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Fallback: Retro initial badge with classic avatar color
  const initial = username ? username.charAt(0).toUpperCase() : '?';

  return (
    <div
      className={`shrink-0 w98-inset flex items-center justify-center font-bold font-mono text-white select-none ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: fallbackColor,
        fontSize: Math.max(10, Math.floor(size * 0.45))
      }}
      title={username}
    >
      {initial}
    </div>
  );
};
