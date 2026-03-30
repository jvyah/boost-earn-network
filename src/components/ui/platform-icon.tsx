import { ReactNode } from "react";
import { Facebook, Youtube, Instagram, PlayCircle } from "lucide-react";

// Custom TikTok icon since Lucide doesn't have it natively
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

export function PlatformIcon({ platform, className = "w-6 h-6" }: { platform: string, className?: string }) {
  const p = platform.toLowerCase();
  
  if (p === 'tiktok') return <TikTokIcon className={`${className} text-[#00f2fe]`} />;
  if (p === 'facebook') return <Facebook className={`${className} text-[#1877F2]`} />;
  if (p === 'youtube') return <Youtube className={`${className} text-[#FF0000]`} />;
  if (p === 'instagram') return <Instagram className={`${className} text-[#E1306C]`} />;
  
  return <PlayCircle className={`${className} text-primary`} />;
}
