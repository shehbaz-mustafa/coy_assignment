'use client';

import { useState, useCallback, useEffect } from 'react';
import SegmentedControl from './SegmentedControl';
import SwipeView from './SwipeView';
import MatchesView from './MatchesView';

export default function DiscoverView() {
  const [view, setView] = useState<'swipe' | 'matches'>('swipe');
  const [matchCount, setMatchCount] = useState(0);

  const refreshMatchCount = useCallback(async () => {
    try {
      const res = await fetch('/api/matches');
      if (res.ok) {
        const data = await res.json();
        setMatchCount(data.matches?.length ?? 0);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    refreshMatchCount();
  }, [refreshMatchCount]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Segmented control */}
      <div className="px-4 pt-2 pb-3 shrink-0">
        <SegmentedControl
          active={view}
          matchCount={matchCount}
          onChange={setView}
        />
      </div>

      {/* Views */}
      <div className="flex-1 overflow-hidden relative">
        {view === 'swipe' && (
          <SwipeView
            onMatch={refreshMatchCount}
            onViewMatches={() => setView('matches')}
          />
        )}
        {view === 'matches' && <MatchesView />}
      </div>
    </div>
  );
}
