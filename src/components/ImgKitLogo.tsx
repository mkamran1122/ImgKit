import React from 'react';

interface ImgKitLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export const ImgKitLogo: React.FC<ImgKitLogoProps> = ({ 
  size = 'md', 
  className = '', 
  showText = false 
}) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg 
        className={`${sizeMap[size]} shrink-0 transition-transform duration-200 group-hover:scale-105`} 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ik-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366F1" />
            <stop offset="0.5" stopColor="#4F46E5" />
            <stop offset="1" stopColor="#3730A3" />
          </linearGradient>
          <linearGradient id="ik-accent" x1="16" y1="16" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop offset="1" stopColor="#818CF8" />
          </linearGradient>
        </defs>
        
        {/* Rounded Base Tile */}
        <rect width="48" height="48" rx="12" fill="url(#ik-grad)" />
        <rect x="0.75" y="0.75" width="46.5" height="46.5" rx="11.25" stroke="#FFFFFF" strokeOpacity="0.2" strokeWidth="1.5" />
        
        {/* Precision Lens / Crop Framing Guides */}
        <path d="M14 20V15C14 14.4477 14.4477 14 15 14H20" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M28 14H33C33.5523 14 34 14.4477 34 15V20" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M34 28V33C34 33.5523 33.5523 34 33 34H28" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M20 34H15C14.4477 34 14 33.5523 14 33V28" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        
        {/* Central Creative Prism / Lens Aperture */}
        <path d="M24 17L31 24L24 31L17 24Z" fill="url(#ik-accent)" />
        <circle cx="24" cy="24" r="2.75" fill="#FFFFFF" />
      </svg>
      {showText && (
        <span className="font-heading font-extrabold text-white tracking-tight text-lg">
          Img<span className="text-indigo-400">Kit</span>
        </span>
      )}
    </div>
  );
};
