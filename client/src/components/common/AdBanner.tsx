import React from 'react';
import { Megaphone, Sparkles, ExternalLink } from 'lucide-react';

export type AdFormat = 
  | 'leaderboard'      // 728x90 (Standard desktop header/footer)
  | 'billboard'        // 970x250 (Large desktop billboard)
  | 'rectangle'        // 300x250 (Medium rectangle - highest eCPM)
  | 'large-rectangle'  // 336x280 (Large rectangle)
  | 'banner'           // 468x60 (Standard banner)
  | 'compact'          // 320x50 (Mobile leaderboard / compact strip)
  | 'skyscraper';      // 160x600 (Vertical side banner)

interface AdBannerProps {
  slotId: string;
  format?: AdFormat;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  slotId,
  format = 'leaderboard',
  label = 'SPONSORED / ADVERTISEMENT',
  className = '',
  style = {}
}) => {
  // Format configurations with standard IAB dimensions & max bounds
  const formatConfig: Record<AdFormat, {
    containerClass: string;
    dimensionsText: string;
    aspectHint: string;
    iconSize: string;
  }> = {
    'leaderboard': {
      containerClass: 'w-full max-w-[728px] min-h-[90px] h-[90px]',
      dimensionsText: '728 × 90 LEADERBOARD',
      aspectHint: 'IAB Standard Desktop Leaderboard',
      iconSize: 'w-4 h-4'
    },
    'billboard': {
      containerClass: 'w-full max-w-[970px] min-h-[140px] md:h-[250px]',
      dimensionsText: '970 × 250 BILLBOARD',
      aspectHint: 'Premium High-Impact Sponsorship Unit',
      iconSize: 'w-5 h-5'
    },
    'rectangle': {
      containerClass: 'w-full max-w-[300px] min-h-[250px] h-[250px]',
      dimensionsText: '300 × 250 MEDIUM RECTANGLE',
      aspectHint: 'High-eCPM Interactive Ad Unit',
      iconSize: 'w-4 h-4'
    },
    'large-rectangle': {
      containerClass: 'w-full max-w-[336px] min-h-[280px] h-[280px]',
      dimensionsText: '336 × 280 LARGE RECTANGLE',
      aspectHint: 'High-Impact Content Ad Unit',
      iconSize: 'w-4 h-4'
    },
    'banner': {
      containerClass: 'w-full max-w-[468px] min-h-[60px] h-[60px]',
      dimensionsText: '468 × 60 STANDARD BANNER',
      aspectHint: 'Compact Horizontal Sponsor Banner',
      iconSize: 'w-3.5 h-3.5'
    },
    'compact': {
      containerClass: 'w-full max-w-[320px] min-h-[50px] h-[50px]',
      dimensionsText: '320 × 50 MOBILE STRIP',
      aspectHint: 'Mobile & Utility Sponsor Strip',
      iconSize: 'w-3 h-3'
    },
    'skyscraper': {
      containerClass: 'w-[160px] min-h-[600px] h-[600px]',
      dimensionsText: '160 × 600 SKYSCRAPER',
      aspectHint: 'Vertical Side Rail Sponsor Unit',
      iconSize: 'w-4 h-4'
    }
  };

  const current = formatConfig[format] || formatConfig.leaderboard;

  return (
    <div 
      className={`ad-container-wrapper flex flex-col items-center justify-center my-3 select-none ${className}`}
      style={style}
    >
      {/* FTC / AdSense Standard Compliance Tag */}
      <div className="flex items-center justify-between w-full max-w-[728px] px-2 mb-1 text-[9px] font-mono tracking-widest text-slate-500 uppercase">
        <span className="flex items-center gap-1">
          <Megaphone className="w-2.5 h-2.5 text-slate-500" />
          {label}
        </span>
        <span className="text-[8px] text-slate-600 hidden sm:inline">
          ID: #{slotId}
        </span>
      </div>

      {/* 
        ========================================================================
        DEPLOYMENT MONETIZATION HOOK:
        When ready to deploy on Google AdSense, GameDistribution, NitroPay or Playwire,
        simply replace the placeholder visual below with your provider script / <ins> tag:
        
        Example for Google AdSense:
        <ins className="adsbygoogle"
             style={{ display: 'block' }}
             data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
             data-ad-slot="XXXXXXXXXX"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        ========================================================================
      */}
      <div
        id={slotId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-ad-client="ca-pub-veloce-monetization"
        className={`relative ${current.containerClass} rounded-2xl border border-dashed border-cyan-500/30 bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-3 text-center transition-all duration-300 hover:border-cyan-400/50 hover:bg-slate-900/70 shadow-lg shadow-black/40 overflow-hidden group`}
      >
        {/* Subtle grid pattern background */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0, 245, 255, 0.4) 1px, transparent 0)`,
            backgroundSize: '16px 16px'
          }}
        />

        {/* Ambient glow corner accents */}
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-1.5 max-w-full px-2">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-[9px] font-mono text-cyan-300 font-bold tracking-wider">
            <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
            {current.dimensionsText}
          </div>

          <p className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors truncate max-w-full">
            Reserved Monetization Slot
          </p>

          <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
            {current.aspectHint} • Ready for AdSense / GameDistribution
          </span>
        </div>

        {/* Deploy corner badge */}
        <div className="absolute bottom-1.5 right-2 text-[8px] font-mono text-slate-600 opacity-60 flex items-center gap-0.5">
          <span>MONETIZE</span>
          <ExternalLink className="w-2 h-2" />
        </div>
      </div>
    </div>
  );
};
