import { Smartphone } from "lucide-react";
import { Link } from "react-router-dom";

interface LogoProps {
  compact?: boolean;
  className?: string;
}

export function Logo({ compact = false, className = "" }: LogoProps) {
  if (compact) {
    return (
      <Link to="/" className={`site-logo-compact flex items-center gap-2 ${className}`} aria-label="Buy & Sell GH home">
        <span className="site-logo-mark grid h-6 w-6 shrink-0 place-items-center rounded-full border border-gold/60 bg-black text-gold shadow-sm">
          <Smartphone size={13} strokeWidth={2.5} />
        </span>
        <span className="site-logo-text flex items-center gap-1 leading-none">
          <span className="text-xs font-black uppercase tracking-tight text-ink">Buy &amp; Sell</span>
          <span className="text-xs font-black uppercase text-gold-dark">GH</span>
        </span>
      </Link>
    );
  }

  return (
    <Link to="/" className={`site-logo flex min-w-0 items-center gap-3.5 ${className}`} aria-label="Buy & Sell GH home">
      <span className="site-logo-mark grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gold/60 bg-black text-gold shadow-gold sm:h-14 sm:w-14">
        <Smartphone size={25} strokeWidth={2.5} />
      </span>
      <span className="site-logo-text min-w-0 leading-none">
        <span className="block text-base font-black uppercase text-ink sm:text-lg">Buy & Sell</span>
        <span className="block text-sm font-black uppercase text-gold-dark">GH</span>
      </span>
    </Link>
  );
}

