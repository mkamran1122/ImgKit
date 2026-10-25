// High quality built-in sample images encoded as optimized SVG data URLs for instant testing

export const SAMPLE_IMAGES = {
  product: {
    name: 'sample-sneaker-product.png',
    label: 'Studio Sneaker',
    category: 'Product Photo',
    // Realistic modern sneaker on solid gray background
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
      <defs>
        <linearGradient id="shoeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4f46e5" />
          <stop offset="50%" stop-color="#06b6d4" />
          <stop offset="100%" stop-color="#10b981" />
        </linearGradient>
        <radialGradient id="shadowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1200" height="1200" fill="#f1f5f9"/>
      <!-- Soft floor shadow -->
      <ellipse cx="600" cy="850" rx="360" ry="45" fill="url(#shadowGrad)"/>
      <!-- Sneaker Sole -->
      <path d="M 320 830 C 400 850 780 850 900 800 C 930 780 940 740 910 730 C 860 720 740 760 620 760 C 480 760 360 740 310 760 C 290 770 290 820 320 830 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="6"/>
      <path d="M 330 800 C 450 820 760 820 890 770" stroke="#f43f5e" stroke-width="12" stroke-linecap="round"/>
      <!-- Sneaker Body -->
      <path d="M 320 760 C 350 670 420 540 540 520 C 600 510 650 560 730 630 C 800 690 890 710 910 730 C 860 720 740 760 620 760 C 480 760 360 740 320 760 Z" fill="url(#shoeGrad)"/>
      <!-- Collar & Tongue -->
      <path d="M 540 520 C 510 440 550 380 620 370 C 660 365 690 410 680 470 C 670 520 630 550 600 560 Z" fill="#1e293b"/>
      <!-- Laces -->
      <path d="M 560 520 L 650 550" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
      <path d="M 580 480 L 660 510" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
      <path d="M 600 440 L 670 470" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
      <!-- Swoosh / Accent -->
      <path d="M 430 710 Q 560 640 720 670 Q 580 720 480 725 Z" fill="#ffffff"/>
      <circle cx="750" cy="650" r="16" fill="#f43f5e"/>
    </svg>`
  },
  portrait: {
    name: 'sample-portrait-photo.png',
    label: 'Studio Portrait',
    category: 'Portrait / Passport',
    // Clean portrait figure suitable for passport and background changer
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
      <defs>
        <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#fad0c4"/>
          <stop offset="100%" stop-color="#ffd1ff"/>
        </linearGradient>
        <linearGradient id="suitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e293b"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
      </defs>
      <!-- Solid off-white studio background -->
      <rect width="900" height="1200" fill="#e2e8f0"/>
      <!-- Shoulders & Coat -->
      <path d="M 120 1200 C 140 920 280 820 450 820 C 620 820 760 920 780 1200 Z" fill="url(#suitGrad)"/>
      <!-- Shirt Collar -->
      <polygon points="450,920 410,810 490,810" fill="#ffffff"/>
      <polygon points="450,950 435,880 465,880" fill="#4f46e5"/>
      <!-- Neck -->
      <rect x="395" y="680" width="110" height="160" rx="20" fill="#fbcfe8"/>
      <!-- Head / Face -->
      <ellipse cx="450" cy="520" rx="170" ry="220" fill="#fed7aa"/>
      <!-- Hair -->
      <path d="M 270 480 C 270 280 340 220 450 220 C 560 220 630 280 630 480 C 600 370 540 330 450 330 C 360 330 300 370 270 480 Z" fill="#334155"/>
      <!-- Eyes & Brows -->
      <ellipse cx="385" cy="500" rx="18" ry="12" fill="#0f172a"/>
      <ellipse cx="515" cy="500" rx="18" ry="12" fill="#0f172a"/>
      <path d="M 360 470 Q 385 460 410 470" stroke="#334155" stroke-width="6" stroke-linecap="round" fill="none"/>
      <path d="M 490 470 Q 515 460 540 470" stroke="#334155" stroke-width="6" stroke-linecap="round" fill="none"/>
      <!-- Nose & Smile -->
      <path d="M 450 500 L 440 560 L 460 560" stroke="#ea580c" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M 410 610 Q 450 645 490 610" stroke="#be185d" stroke-width="6" stroke-linecap="round" fill="none"/>
    </svg>`
  },
  landscape: {
    name: 'sample-mountain-landscape.png',
    label: 'Mountain Vista',
    category: 'Landscape / Graphic',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
      <defs>
        <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="60%" stop-color="#312e81"/>
          <stop offset="100%" stop-color="#db2777"/>
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#skyGrad)"/>
      <circle cx="1200" cy="400" r="140" fill="#fde047" opacity="0.9"/>
      <!-- Stars -->
      <circle cx="200" cy="150" r="3" fill="#ffffff"/>
      <circle cx="450" cy="100" r="2" fill="#ffffff"/>
      <circle cx="780" cy="220" r="3" fill="#ffffff"/>
      <circle cx="950" cy="120" r="2.5" fill="#ffffff"/>
      <circle cx="1400" cy="180" r="3" fill="#ffffff"/>
      <!-- Mountain ranges -->
      <polygon points="0,900 250,520 550,750 900,420 1250,780 1600,480 1600,900" fill="#1e1b4b" opacity="0.8"/>
      <polygon points="0,900 400,600 700,820 1050,560 1450,850 1600,690 1600,900" fill="#0f172a"/>
      <!-- Water Reflection -->
      <rect y="760" width="1600" height="140" fill="#090d16" opacity="0.95"/>
      <line x1="1100" y1="780" x2="1300" y2="780" stroke="#fde047" stroke-width="4" opacity="0.5"/>
      <line x1="1050" y1="810" x2="1350" y2="810" stroke="#fde047" stroke-width="3" opacity="0.4"/>
      <line x1="1120" y1="840" x2="1280" y2="840" stroke="#fde047" stroke-width="2" opacity="0.3"/>
    </svg>`
  },
  chroma: {
    name: 'sample-chromakey-green.png',
    label: 'Chroma Green Subject',
    category: 'Chroma Key / Studio',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000">
      <defs>
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#3b82f6"/>
          <stop offset="100%" stop-color="#1d4ed8"/>
        </linearGradient>
      </defs>
      <!-- Pure Chroma Green Screen #00b140 -->
      <rect width="1000" height="1000" fill="#00b140"/>
      <!-- Subject: Professional studio headphones -->
      <path d="M 260 520 C 260 300 740 300 740 520" stroke="#1e293b" stroke-width="48" stroke-linecap="round" fill="none"/>
      <path d="M 320 460 C 320 340 680 340 680 460" stroke="#475569" stroke-width="20" stroke-linecap="round" fill="none"/>
      <!-- Left Ear Cup -->
      <rect x="200" y="480" width="100" height="180" rx="40" fill="#0f172a"/>
      <rect x="230" y="500" width="70" height="140" rx="30" fill="url(#bodyGrad)"/>
      <circle cx="265" cy="570" r="16" fill="#f8fafc"/>
      <!-- Right Ear Cup -->
      <rect x="700" y="480" width="100" height="180" rx="40" fill="#0f172a"/>
      <rect x="700" y="500" width="70" height="140" rx="30" fill="url(#bodyGrad)"/>
      <circle cx="735" cy="570" r="16" fill="#f8fafc"/>
      <!-- Cord -->
      <path d="M 250 660 Q 230 760 320 800 T 500 850" stroke="#0f172a" stroke-width="12" stroke-linecap="round" fill="none"/>
    </svg>`
  },
  whitebg: {
    name: 'sample-white-backdrop.png',
    label: 'White Studio Item',
    category: 'Product Photo / White BG',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000">
      <defs>
        <radialGradient id="softShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <!-- Pure White Background #ffffff -->
      <rect width="1000" height="1000" fill="#ffffff"/>
      <!-- Soft floor shadow -->
      <ellipse cx="500" cy="740" rx="280" ry="35" fill="url(#softShadow)"/>
      <!-- Premium Camera Body with white text and accents -->
      <rect x="280" y="420" width="440" height="280" rx="36" fill="#18181b" stroke="#27272a" stroke-width="6"/>
      <rect x="360" y="370" width="140" height="50" rx="8" fill="#27272a"/>
      <!-- Grip -->
      <rect x="280" y="440" width="60" height="240" rx="16" fill="#09090b"/>
      <!-- Lens Rings -->
      <circle cx="530" cy="560" r="110" fill="#09090b" stroke="#71717a" stroke-width="8"/>
      <circle cx="530" cy="560" r="85" fill="#18181b" stroke="#e4e4e7" stroke-width="6"/>
      <circle cx="530" cy="560" r="55" fill="#3b82f6" opacity="0.8"/>
      <circle cx="510" cy="540" r="16" fill="#ffffff" opacity="0.6"/>
      <!-- Shutter & Dials -->
      <circle cx="330" cy="395" r="18" fill="#e4e4e7"/>
      <rect x="620" y="380" width="60" height="40" rx="6" fill="#3f3f46"/>
      <!-- Red Dot -->
      <circle cx="660" cy="470" r="14" fill="#ef4444"/>
    </svg>`
  }
};

export function getSampleImageDataUrl(key: keyof typeof SAMPLE_IMAGES): string {
  const item = SAMPLE_IMAGES[key];
  const encoded = encodeURIComponent(item.svg);
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}
