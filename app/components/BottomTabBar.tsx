'use client';

import { Home, Compass } from 'lucide-react';

interface Props {
  active: 'home' | 'discover';
  onTabChange: (tab: 'home' | 'discover') => void;
}

const tabs = [
  { key: 'home' as const, label: 'Home', Icon: Home },
  { key: 'discover' as const, label: 'Discover', Icon: Compass },
];

export default function BottomTabBar({ active, onTabChange }: Props) {
  return (
    <nav
      className="shrink-0 bg-coy-bg border-t-2 border-coy-ink safe-bottom z-20"
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="flex justify-around items-center h-14">
        {tabs.map(({ key, label, Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              role="tab"
              aria-selected={isActive}
              aria-label={label}
              onClick={() => onTabChange(key)}
              className="flex flex-col items-center gap-0.5 px-5 py-1 transition-colors"
            >
              <div
                className={`flex items-center justify-center w-12 h-7 rounded-[999px] transition-all ${
                  isActive
                    ? 'bg-coy-pink border-2 border-coy-ink shadow-coy-sm'
                    : 'border-2 border-transparent'
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={2}
                  className={isActive ? 'text-white' : 'text-coy-ink'}
                />
              </div>
              <span
                className={`text-[11px] font-[600] ${
                  isActive ? 'text-coy-ink' : 'text-coy-muted'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
