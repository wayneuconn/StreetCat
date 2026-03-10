import type { ReactNode } from "react";

// SVG icons for bartending - glass types, units, techniques
// All icons are 24x24 viewBox, stroke-based, inherit currentColor

export function GlassIcon({ type, className = "w-6 h-6" }: { type: string; className?: string }) {
  const icons: Record<string, ReactNode> = {
    rocks: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M5 6h14l-1.5 14H6.5L5 6z" />
        <path d="M4 4h16" strokeLinecap="round" />
      </svg>
    ),
    coupe: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 4c0 6 4 9 8 9s8-3 8-9" />
        <path d="M12 13v7" />
        <path d="M8 22h8" strokeLinecap="round" />
      </svg>
    ),
    highball: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M7 3h10l-0.5 18H7.5L7 3z" />
        <path d="M7 3h10" strokeLinecap="round" />
      </svg>
    ),
    collins: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 2h8l-0.3 20H8.3L8 2z" />
        <path d="M8 2h8" strokeLinecap="round" />
      </svg>
    ),
    flute: (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 3c0 5 2 7 4 7s4-2 4-7" />
        <path d="M12 10v9" />
        <path d="M8 22h8" strokeLinecap="round" />
        <path d="M10 19h4" strokeLinecap="round" />
      </svg>
    ),
    "nick-nora": (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M5 5c0 5 3.5 7 7 7s7-2 7-7" />
        <path d="M12 12v7" />
        <path d="M8 22h8" strokeLinecap="round" />
      </svg>
    ),
  };
  return icons[type] || icons.rocks;
}

export function UnitIcon({ unit, className = "w-5 h-5" }: { unit: string; className?: string }) {
  const icons: Record<string, ReactNode> = {
    oz: ( // jigger
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 2l-2 9h12l-2-9H8z" />
        <path d="M6 11l2 9h8l2-9" />
        <circle cx="12" cy="11" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
    ml: ( // measuring cup
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M7 3h10v18H7V3z" />
        <path d="M10 8h4M10 13h3M10 18h4" strokeLinecap="round" />
      </svg>
    ),
    dash: ( // bitters bottle
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10 2h4v4l2 2v12a2 2 0 01-2 2h-4a2 2 0 01-2-2V8l2-2V2z" />
        <path d="M10 6h4" />
        <circle cx="12" cy="14" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
    piece: ( // single item
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 2" strokeLinecap="round" />
      </svg>
    ),
    bottle: ( // bottle
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10 1h4v3l2 2v4l1 2v8a2 2 0 01-2 2H9a2 2 0 01-2-2v-8l1-2V6l2-2V1z" />
        <path d="M10 4h4" />
      </svg>
    ),
  };
  return icons[unit] || icons.oz;
}

export function TechniqueIcon({ technique, className = "w-5 h-5" }: { technique: string; className?: string }) {
  const icons: Record<string, ReactNode> = {
    shake: ( // shaker
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 8h8l1 13H7L8 8z" />
        <path d="M7 5h10v3H7V5z" />
        <path d="M10 2h4v3h-4V2z" />
        <path d="M5 12l-2-1M19 12l2-1M5 16l-2 1M19 16l2 1" strokeWidth="1" strokeLinecap="round" />
      </svg>
    ),
    stir: ( // bar spoon
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2v18" strokeLinecap="round" />
        <ellipse cx="12" cy="21" rx="3" ry="1.5" />
        <path d="M10 2h4" strokeLinecap="round" />
        <path d="M14 8c2 1 3 3 3 5" strokeWidth="1" />
      </svg>
    ),
    muddle: ( // muddler
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2v16" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M9 20h6" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M8 22l2-2M16 22l-2-2" strokeWidth="1" />
      </svg>
    ),
    flame: ( // fire
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22c-4 0-6-3-6-6 0-4 3-6 4-10 1 3 2 4 4 5 2 1 4 3 4 5 0 3-2 6-6 6z" />
        <path d="M12 22c-1.5 0-3-1-3-3 0-2 1.5-3 2-5 .5 1.5 1 2 2 2.5 1 .5 2 1.5 2 2.5 0 1.5-1.5 3-3 3z" />
      </svg>
    ),
    strain: ( // strainer
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <ellipse cx="12" cy="8" rx="8" ry="3" />
        <path d="M4 8v2c0 1.5 3.5 3 8 3s8-1.5 8-3V8" />
        <path d="M8 11v2M12 11.5v2M16 11v2" strokeLinecap="round" />
        <path d="M20 7l3-3" strokeLinecap="round" />
      </svg>
    ),
    build: ( // pour directly
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M7 10h10l-1 11H8L7 10z" />
        <path d="M12 2v5" strokeLinecap="round" />
        <path d="M10 4l2 3 2-3" />
      </svg>
    ),
  };
  return icons[technique] || null;
}

// Visual jigger representation: shows filled/half jiggers for oz amounts
export function JiggerVisual({ amount, className = "" }: { amount: number; className?: string }) {
  const full = Math.floor(amount);
  const half = amount % 1 >= 0.25 && amount % 1 < 0.75;
  const quarter = amount % 1 > 0 && amount % 1 < 0.25;
  const threeQuarter = amount % 1 >= 0.75;

  const jiggers: ReactNode[] = [];

  for (let i = 0; i < full; i++) {
    jiggers.push(
      <svg key={`f${i}`} className="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1">
        <path d="M8 4l-2 8h12l-2-8H8z" opacity="0.6" />
        <path d="M8 4l-2 8h12l-2-8H8z" fill="none" />
      </svg>
    );
  }

  if (half) {
    jiggers.push(
      <svg key="half" className="w-4 h-4 inline-block" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
        <path d="M8 4l-2 8h12l-2-8H8z" fill="none" />
        <path d="M7 8l-1 4h12l-1-4H7z" fill="currentColor" opacity="0.6" />
      </svg>
    );
  } else if (quarter) {
    jiggers.push(
      <svg key="qtr" className="w-4 h-4 inline-block" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
        <path d="M8 4l-2 8h12l-2-8H8z" fill="none" />
        <path d="M6.5 10l-0.5 2h12l-0.5-2H6.5z" fill="currentColor" opacity="0.6" />
      </svg>
    );
  } else if (threeQuarter) {
    jiggers.push(
      <svg key="tq" className="w-4 h-4 inline-block" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
        <path d="M8 4l-2 8h12l-2-8H8z" fill="none" />
        <path d="M7.5 6l-1.5 6h12l-1.5-6H7.5z" fill="currentColor" opacity="0.6" />
      </svg>
    );
  }

  return <span className={`inline-flex items-center gap-0.5 ${className}`}>{jiggers}</span>;
}
