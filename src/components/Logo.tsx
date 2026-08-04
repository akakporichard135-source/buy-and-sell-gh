import { Smartphone } from "lucide-react";
import { Link } from "react-router-dom";

export function Logo() {
  return (
    <Link to="/" className="site-logo flex min-w-0 items-center gap-3.5" aria-label="Buy & Sell GH home">
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
