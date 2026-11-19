'use client';

import { useState } from 'react';
import BottomTabBar from './BottomTabBar';
import DiscoverView from './DiscoverView';

export default function AppShell() {
  const [activeTab, setActiveTab] = useState<'home' | 'discover'>('discover');

  return (
    <div className="min-h-[100dvh] bg-coy-lavender flex justify-center">
      {/* Mobile container - centered on desktop */}
      <div
        className="relative w-full max-w-[430px] bg-coy-bg flex flex-col"
        style={{
          minHeight: '100dvh',
          boxShadow: 'none',
        }}
      >
        {/* Add outline and shadow on desktop */}
        <style>{`
          @media (min-width: 431px) {
            .app-container {
              border: 2px solid var(--color-coy-ink) !important;
              box-shadow: 3px 3px 0 var(--color-coy-ink) !important;
              min-height: 100dvh;
            }
          }
        `}</style>
        <div className="app-container flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <header className="flex items-center px-4 py-3 bg-coy-bg z-20 shrink-0">
            <h1 className="text-2xl font-[800] tracking-[-0.02em] text-coy-ink">
              Coy<span className="text-coy-pink">.</span>
            </h1>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-hidden relative">
            {activeTab === 'home' && (
              <div className="flex items-center justify-center h-full px-4">
                <p className="text-coy-muted text-sm font-[600]">Home — coming soon</p>
              </div>
            )}
            {activeTab === 'discover' && <DiscoverView />}
          </main>

          {/* Tab bar */}
          <BottomTabBar active={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>
    </div>
  );
}
