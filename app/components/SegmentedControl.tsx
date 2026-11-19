'use client';

interface Props {
  active: 'swipe' | 'matches';
  matchCount: number;
  onChange: (view: 'swipe' | 'matches') => void;
}

export default function SegmentedControl({ active, matchCount, onChange }: Props) {
  const options = [
    { key: 'swipe' as const, label: 'Swipe' },
    { key: 'matches' as const, label: `Matches (${matchCount})` },
  ];

  return (
    <div className="flex gap-2" role="tablist" aria-label="Discover views">
      {options.map(({ key, label }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(key)}
            className={`
              px-4 py-2 rounded-[999px] text-sm font-[700] border-2 border-coy-ink
              transition-all select-none tabular-nums
              ${isActive
                ? 'bg-coy-pink text-white shadow-coy-sm'
                : 'bg-coy-bg text-coy-ink hover:bg-coy-surface'
              }
              active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
            `}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
