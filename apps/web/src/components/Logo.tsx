import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = false,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Official White Hacker Logo Mark */}
      <img
        src="/logo-mark.png"
        alt="DarkSpaceSecurity Logo"
        className={`${iconSizes[size]} object-contain filter drop-shadow-[0_0_10px_rgba(255,0,0,0.45)]`}
      />

      <div className="flex flex-col">
        {/* Exact Logo Typography from uploaded image: DarkSpa (White) + ceSecurity (Red) */}
        <div className={`flex items-center font-black ${textSizes[size]} tracking-tight leading-none select-none`}>
          <span className="text-white">DarkSpa</span>
          <span className="text-[#FF0000]">ceSecurity</span>
        </div>
        {showSubtitle && (
          <span className="text-[9px] text-[var(--color-text-muted)] tracking-widest uppercase font-mono mt-1">
            Secure · Learn · Upgrade
          </span>
        )}
      </div>
    </div>
  );
};
