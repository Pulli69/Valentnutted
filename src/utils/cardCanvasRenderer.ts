/**
 * IHAVENTNUTTED 98 - High Resolution 1080 x 1350 Card Canvas Renderer
 * Renders minimalist, premium Windows 98 retro challenge pass & achievement cards.
 * Conforms strictly to 4:5 portrait aspect ratio (1080x1350) for crisp exports to X/Instagram.
 */

import { DEFAULT_PIXEL_AVATARS, getAvatarSvgDataUrl } from '../components/common/PixelAvatars';

export interface CardRenderOptions {
  type: 'join' | 'milestone';
  username: string;
  avatarUrl?: string | null;
  dayNumber?: number; // e.g. 1, 3, 7, 14, 21, 30
  daysNoFapText?: string; // e.g. "7 DAYS NO FAP"
  dateAchieved?: string; // e.g. "NOVEMBER 07, 2026"
  isCloudVerified?: boolean;
}

// Milestone-specific tasteful gradient palettes
const MILESTONE_THEMES: Record<number, { bg1: string; bg2: string; accent: string; title: string }> = {
  1: { bg1: '#0a192f', bg2: '#172a45', accent: '#64ffda', title: 'DAY 01 - 1 DAY NO FAP' },
  3: { bg1: '#0d1b2a', bg2: '#1b263b', accent: '#48cae4', title: 'DAY 03 - 3 DAYS NO FAP' },
  7: { bg1: '#001220', bg2: '#0b2545', accent: '#00b4d8', title: 'DAY 07 - 7 DAYS NO FAP' },
  14: { bg1: '#10002b', bg2: '#240046', accent: '#9d4edd', title: 'DAY 14 - 14 DAYS NO FAP' },
  21: { bg1: '#062822', bg2: '#0d4a3e', accent: '#2ec4b6', title: 'DAY 21 - 21 DAYS NO FAP' },
  30: { bg1: '#1a1405', bg2: '#3d2f0a', accent: '#ffd166', title: '30 DAYS NO FAP - NIRVANA OVERLORD' }
};

export const renderCardToCanvas = async (
  canvas: HTMLCanvasElement, 
  opts: CardRenderOptions
): Promise<void> => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = 1080;
  const height = 1350;
  canvas.width = width;
  canvas.height = height;

  const isFinalDay = opts.dayNumber === 30;
  const theme = opts.dayNumber && MILESTONE_THEMES[opts.dayNumber] 
    ? MILESTONE_THEMES[opts.dayNumber] 
    : { bg1: '#0b132b', bg2: '#1c2541', accent: '#48cae4', title: 'JOINED NO NUT NOVEMBER 2026' };

  // 1. Beautiful restrained gradient background
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, theme.bg1);
  bgGradient.addColorStop(0.5, theme.bg2);
  bgGradient.addColorStop(1, '#050a14');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Subtle retro dot grid overlay
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  for (let x = 30; x < width; x += 40) {
    for (let y = 30; y < height; y += 40) {
      ctx.fillRect(x, y, 2, 2);
    }
  }

  // 2. Main Windows 98 Outer Window Card
  const winX = 90;
  const winY = 120;
  const winW = 900;
  const winH = 1110;

  // Window drop shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fillRect(winX + 16, winY + 16, winW, winH);

  // Classic Windows 98 Grey body
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(winX, winY, winW, winH);

  // Windows 98 3D Beveled Outer Borders (3px standard)
  const drawBevel = (x: number, y: number, w: number, h: number, isFinal: boolean) => {
    const highlight = isFinal ? '#fff4cc' : '#ffffff';
    const darkShadow = isFinal ? '#805b00' : '#808080';
    const blackEdge = '#000000';

    // Top & Left highlights
    ctx.fillStyle = highlight;
    ctx.fillRect(x, y, w, 4);
    ctx.fillRect(x, y, 4, h);

    // Bottom & Right dark shadows
    ctx.fillStyle = blackEdge;
    ctx.fillRect(x, y + h - 4, w, 4);
    ctx.fillRect(x + w - 4, y, 4, h);

    // Inner shadow step
    ctx.fillStyle = darkShadow;
    ctx.fillRect(x + 4, y + h - 8, w - 8, 4);
    ctx.fillRect(x + w - 8, y + 4, 4, h - 8);
  };

  drawBevel(winX, winY, winW, winH, isFinalDay);

  // 3. Classic Windows 98 Titlebar
  const titleX = winX + 8;
  const titleY = winY + 8;
  const titleW = winW - 16;
  const titleH = 48;

  const titleGrad = ctx.createLinearGradient(titleX, titleY, titleX + titleW, titleY);
  if (isFinalDay) {
    titleGrad.addColorStop(0, '#805b00');
    titleGrad.addColorStop(1, '#d4af37');
  } else {
    titleGrad.addColorStop(0, '#000080');
    titleGrad.addColorStop(1, '#1084d0');
  }
  ctx.fillStyle = titleGrad;
  ctx.fillRect(titleX, titleY, titleW, titleH);

  // Titlebar Text
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const titleString = opts.type === 'join' 
    ? 'IHAVENTNUTTED 98 - Official Challenge Pass' 
    : `IHAVENTNUTTED 98 - Achievement Certification (Day ${opts.dayNumber})`;
  ctx.fillText(titleString, titleX + 16, titleY + titleH / 2);

  // Titlebar Buttons (minimize, maximize, close)
  const btnW = 32;
  const btnH = 32;
  const btnY = titleY + 8;
  ['–', '□', '✕'].forEach((symbol, idx) => {
    const btnX = titleX + titleW - 108 + (idx * 34);
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(btnX, btnY, btnW, btnH);
    // Button bevel
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(btnX, btnY, btnW, 2);
    ctx.fillRect(btnX, btnY, 2, btnH);
    ctx.fillStyle = '#000000';
    ctx.fillRect(btnX, btnY + btnH - 2, btnW, 2);
    ctx.fillRect(btnX + btnW - 2, btnY, 2, btnH);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, btnX + btnW / 2, btnY + btnH / 2);
  });

  // 4. Inner Recessed White/Navy Workspace Container
  const innerX = winX + 24;
  const innerY = winY + 70;
  const innerW = winW - 48;
  const innerH = winH - 94;

  // Inset shadow
  ctx.fillStyle = '#808080';
  ctx.fillRect(innerX, innerY, innerW, 3);
  ctx.fillRect(innerX, innerY, 3, innerH);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(innerX, innerY + innerH - 3, innerW, 3);
  ctx.fillRect(innerX + innerW - 3, innerY, 3, innerH);

  // Inner card background
  ctx.fillStyle = '#0e1626';
  ctx.fillRect(innerX + 3, innerY + 3, innerW - 6, innerH - 6);

  // 5. Card Header Branding
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // Subtitle / System path
  ctx.font = '16px "Courier New", monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText('C:\\SYSTEM32\\VERIFIED_CERTIFICATE.DLL', width / 2, innerY + 36);

  // Main Brand Name
  ctx.font = 'black 34px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('IHAVENTNUTTED 98', width / 2, innerY + 68);

  // Decorative divider
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(innerX + 60, innerY + 120);
  ctx.lineTo(innerX + innerW - 60, innerY + 120);
  ctx.stroke();

  // 6. User Avatar (Square with authentic Windows 98 double bevel)
  const avatarSize = 160;
  const avatarX = width / 2 - avatarSize / 2;
  const avatarY = innerY + 150;

  // Avatar shadow & frame
  ctx.fillStyle = '#c0c0c0';
  ctx.fillRect(avatarX - 8, avatarY - 8, avatarSize + 16, avatarSize + 16);
  drawBevel(avatarX - 8, avatarY - 8, avatarSize + 16, avatarSize + 16, false);

  // Inset groove
  ctx.fillStyle = '#808080';
  ctx.fillRect(avatarX - 2, avatarY - 2, avatarSize + 4, 2);
  ctx.fillRect(avatarX - 2, avatarY - 2, 2, avatarSize + 4);

  // Draw Avatar Image or Initial
  let avatarRendered = false;
  let resolvedAvatar = opts.avatarUrl;
  if (resolvedAvatar) {
    const defaultPixel = DEFAULT_PIXEL_AVATARS.find(a => a.id === resolvedAvatar);
    if (defaultPixel) {
      resolvedAvatar = getAvatarSvgDataUrl(defaultPixel.svgString);
    }
  }

  if (resolvedAvatar && resolvedAvatar.startsWith('data:image')) {
    try {
      const img = new Image();
      await new Promise<void>((resolve) => {
        img.onload = () => {
          ctx.drawImage(img, avatarX, avatarY, avatarSize, avatarSize);
          avatarRendered = true;
          resolve();
        };
        img.onerror = () => resolve();
        img.src = resolvedAvatar!;
      });
    } catch {}
  } else if (resolvedAvatar && resolvedAvatar.startsWith('http')) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve) => {
        img.onload = () => {
          ctx.drawImage(img, avatarX, avatarY, avatarSize, avatarSize);
          avatarRendered = true;
          resolve();
        };
        img.onerror = () => resolve();
        img.src = resolvedAvatar!;
      });
    } catch {}
  }

  if (!avatarRendered) {
    // Fallback retro avatar block
    ctx.fillStyle = isFinalDay ? '#805b00' : '#000080';
    ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      opts.username.charAt(0).toUpperCase() || 'S', 
      avatarX + avatarSize / 2, 
      avatarY + avatarSize / 2
    );
  }

  // 7. Username Text
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(opts.username, width / 2, avatarY + avatarSize + 24);

  // Challenge Status Tag
  const tagY = avatarY + avatarSize + 74;
  ctx.fillStyle = opts.isCloudVerified ? '#064e3b' : '#334155';
  const tagW = 240;
  const tagH = 34;
  ctx.fillRect(width / 2 - tagW / 2, tagY, tagW, tagH);
  ctx.strokeStyle = opts.isCloudVerified ? '#10b981' : '#64748b';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(width / 2 - tagW / 2, tagY, tagW, tagH);

  ctx.font = 'bold 13px "Courier New", monospace';
  ctx.fillStyle = opts.isCloudVerified ? '#34d399' : '#94a3b8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    opts.isCloudVerified ? '● CLOUD VERIFIED' : 'LOCAL CHALLENGE PASS', 
    width / 2, 
    tagY + tagH / 2
  );

  // 8. Core Body Announcement Box
  const announceY = tagY + 65;
  const announceW = innerW - 80;
  const announceH = 260;
  const announceX = innerX + 40;

  // Retro inset field
  ctx.fillStyle = '#070d18';
  ctx.fillRect(announceX, announceY, announceW, announceH);
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.strokeRect(announceX, announceY, announceW, announceH);

  if (opts.type === 'join') {
    // Join Card Details
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('NO NUT NOVEMBER 2026', width / 2, announceY + 36);

    ctx.font = '900 48px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('JOINED CHALLENGE', width / 2, announceY + 76);

    ctx.font = '16px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('30 Days of Willpower • Digital Monastic Discipline', width / 2, announceY + 144);

    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(
      `REGISTRATION DATE: ${opts.dateAchieved || 'NOVEMBER 01, 2026'}`, 
      width / 2, 
      announceY + 190
    );
  } else {
    // Milestone Achievement Card Details
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Day Number Highlight
    ctx.font = isFinalDay ? '900 68px system-ui, -apple-system, sans-serif' : '900 64px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = theme.accent;
    const dayHeader = `DAY ${String(opts.dayNumber || 1).padStart(2, '0')}`;
    ctx.fillText(dayHeader, width / 2, announceY + 28);

    // Subtitle e.g. "7 DAYS NO FAP"
    ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#ffffff';
    const noFapText = opts.daysNoFapText || `${opts.dayNumber} DAYS NO FAP`;
    ctx.fillText(noFapText, width / 2, announceY + 110);

    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('NO NUT NOVEMBER 2026', width / 2, announceY + 165);

    ctx.font = '15px "Courier New", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText(
      `ACHIEVED: ${opts.dateAchieved || new Date().toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' })}`, 
      width / 2, 
      announceY + 205
    );
  }

  // 9. Card Footer / Authenticity Telemetry
  const footerY = innerY + innerH - 85;
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(innerX + 40, footerY);
  ctx.lineTo(innerX + innerW - 40, footerY);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.font = '13px "Courier New", monospace';
  ctx.fillStyle = '#475569';
  ctx.fillText('OFFICIAL PARTICIPANT DISPATCH', innerX + 40, footerY + 24);
  ctx.fillText('IHAVENTNUTTED.NET', innerX + 40, footerY + 46);

  ctx.textAlign = 'right';
  ctx.fillText('CERTIFICATE ID: 0x98_SURVIVOR', innerX + innerW - 40, footerY + 24);
  ctx.fillText('WILLPOWER KERNEL V4.2', innerX + innerW - 40, footerY + 46);
};
