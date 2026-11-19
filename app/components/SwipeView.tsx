'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type PanInfo,
} from 'framer-motion';
import { X, Heart } from 'lucide-react';
import MatchOverlay from './MatchOverlay';
import EmptyState from './EmptyState';
import SkeletonCard from './SkeletonCard';
import ProfileCard from './ProfileCard';

export interface Profile {
  id: string;
  name: string;
  age: number;
  photo: string;
  bio: string;
  location: string;
  interests: string[];
}

interface Props {
  onMatch: () => void;
  onViewMatches: () => void;
}

const SWIPE_THRESHOLD = 100;
const VELOCITY_THRESHOLD = 500;
const FLY_OUT_DISTANCE = 600;

export default function SwipeView({ onMatch, onViewMatches }: Props) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [swiping, setSwiping] = useState(false);
  const [matchData, setMatchData] = useState<{ profile: Profile } | null>(null);
  const [toast, setToast] = useState<{ text: string; key: number } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Motion values for the top card
  const x = useMotionValue(0);
  const opacity = useMotionValue(1);
  const rotate = useTransform(x, [-200, 0, 200], [-12, 0, 12]);
  const likeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const passOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  // Preload next images
  useEffect(() => {
    profiles.slice(1, 3).forEach((p) => {
      const img = document.createElement('img');
      img.src = p.photo;
    });
  }, [profiles]);

  const fetchFeed = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await fetch('/api/feed?limit=15');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setProfiles(data.profiles);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  // Prefetch next batch when 3 cards remain
  const prefetchedRef = useRef(false);
  useEffect(() => {
    if (profiles.length <= 3 && profiles.length > 0 && !prefetchedRef.current) {
      prefetchedRef.current = true;
      fetch('/api/feed?limit=15')
        .then((r) => r.json())
        .then((data) => {
          if (data.profiles?.length) {
            setProfiles((prev) => {
              const existingIds = new Set(prev.map((p) => p.id));
              const newProfiles = data.profiles.filter(
                (p: Profile) => !existingIds.has(p.id)
              );
              return [...prev, ...newProfiles];
            });
          }
        })
        .catch(() => {});
    }
    if (profiles.length > 3) {
      prefetchedRef.current = false;
    }
  }, [profiles.length]);

  const showToast = useCallback((text: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ text, key: Date.now() });
    toastTimerRef.current = setTimeout(() => setToast(null), 1200);
  }, []);

  const commitSwipe = useCallback(
    async (direction: 'like' | 'pass', flyDirection: number) => {
      if (swiping || profiles.length === 0) return;
      setSwiping(true);

      const profile = profiles[0];

      const prefersReduced = typeof window !== 'undefined' && window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      // Animate card exit (fade if prefers-reduced-motion, else fly out)
      if (prefersReduced) {
        await animate(opacity, 0, { duration: 0.15 });
      } else {
        await animate(x, flyDirection * FLY_OUT_DISTANCE, {
          duration: 0.25,
          ease: 'easeIn',
        });
      }

      // Haptic feedback
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(10); } catch {}
      }

      // Remove from local list immediately
      setProfiles((prev) => prev.filter((p) => p.id !== profile.id));
      x.set(0);
      opacity.set(1);

      // Show toast
      showToast(direction === 'like' ? `Liked ${profile.name}` : `Passed`);

      // Send swipe to server
      try {
        const res = await fetch('/api/swipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileId: profile.id, direction }),
        });

        if (!res.ok) {
          // Restore card if swipe wasn't recorded
          setProfiles((prev) => [profile, ...prev]);
          setError('Swipe failed. Please try again.');
          setSwiping(false);
          return;
        }

        const data = await res.json();

        if (data.matched) {
          setMatchData({ profile });
          onMatch();
        }
      } catch {
        // Restore card on network failure
        setProfiles((prev) => [profile, ...prev]);
        setError('Network error. Please try again.');
      }

      setSwiping(false);
    },
    [swiping, profiles, x, showToast, onMatch]
  );

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (matchData) return; // Don't swipe while match overlay is showing
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        commitSwipe('pass', -1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        commitSwipe('like', 1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commitSwipe, matchData]);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const xVal = x.get();
      const absX = Math.abs(xVal);
      const absVelocity = Math.abs(info.velocity.x);

      if (absX > SWIPE_THRESHOLD || absVelocity > VELOCITY_THRESHOLD) {
        const direction = xVal > 0 ? 'like' : 'pass';
        const flyDir = xVal > 0 ? 1 : -1;
        commitSwipe(direction, flyDir);
      } else {
        animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 });
      }
    },
    [x, commitSwipe]
  );

  const handleReset = useCallback(async () => {
    await fetch('/api/reset', { method: 'POST' });
    prefetchedRef.current = false;
    fetchFeed();
    onMatch();
  }, [fetchFeed, onMatch]);

  // Loading state
  if (loading && profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4">
        <SkeletonCard />
      </div>
    );
  }

  // Error state
  if (error && profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 gap-4">
        <p className="text-coy-muted font-[600] text-sm text-center">{error}</p>
        <button
          onClick={fetchFeed}
          className="px-6 py-2.5 bg-coy-pink text-white font-[700] text-sm rounded-[16px] border-2 border-coy-ink shadow-coy active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (profiles.length === 0 && !loading) {
    return <EmptyState onSeeMatches={onViewMatches} onReset={handleReset} />;
  }

  const topProfile = profiles[0];
  const nextProfile = profiles.length > 1 ? profiles[1] : null;

  return (
    <div className="flex flex-col items-center h-full px-4 pb-2">
      {/* Inline error banner */}
      {error && (
        <div className="w-full mb-2 px-3 py-2 bg-coy-light-pink rounded-[12px] border-2 border-coy-ink flex items-center justify-between">
          <span className="text-sm font-[600] text-coy-ink">{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-coy-ink font-[700] text-xs ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Card stack */}
      <div className="relative w-full flex-1 flex items-center justify-center">
        {/* Background card (next card peeking) */}
        {nextProfile && (
          <div
            className="absolute w-full max-w-[380px] pointer-events-none transition-transform duration-200"
            style={{ transform: 'scale(0.95) translateY(8px)' }}
          >
            <ProfileCard profile={nextProfile} />
          </div>
        )}

        {/* Top card (draggable) */}
        {topProfile && (
          <motion.div
            key={topProfile.id}
            className="absolute w-full max-w-[380px] cursor-grab active:cursor-grabbing swipe-card z-10"
            style={{ x, opacity, rotate }}
            initial={{ scale: 0.95, y: 8 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            drag={swiping ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            role="article"
            aria-label={`${topProfile.name}, ${topProfile.age}, ${topProfile.location}`}
          >
            {/* LIKE stamp */}
            <motion.div
              className="absolute top-8 left-6 z-20 pointer-events-none"
              style={{ opacity: likeOpacity }}
            >
              <div
                className="text-3xl font-[800] text-coy-pink border-4 border-coy-pink rounded-[12px] px-4 py-1 select-none shadow-coy-sm bg-white/90"
                style={{ transform: 'rotate(-12deg)' }}
              >
                LIKE
              </div>
            </motion.div>

            {/* PASS stamp */}
            <motion.div
              className="absolute top-8 right-6 z-20 pointer-events-none"
              style={{ opacity: passOpacity }}
            >
              <div
                className="text-3xl font-[800] text-coy-ink border-4 border-coy-ink rounded-[12px] px-4 py-1 select-none shadow-coy-sm bg-white/90"
                style={{ transform: 'rotate(12deg)' }}
              >
                PASS
              </div>
            </motion.div>

            <ProfileCard profile={topProfile} />
          </motion.div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-6 py-3 shrink-0">
        <button
          onClick={() => commitSwipe('pass', -1)}
          disabled={swiping || profiles.length === 0}
          aria-label="Pass"
          className="w-16 h-16 rounded-full bg-coy-bg border-2 border-coy-ink shadow-coy flex items-center justify-center transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
        >
          <X size={28} strokeWidth={2.5} className="text-coy-ink" />
        </button>
        <button
          onClick={() => commitSwipe('like', 1)}
          disabled={swiping || profiles.length === 0}
          aria-label="Like"
          className="w-16 h-16 rounded-full bg-coy-pink border-2 border-coy-ink shadow-coy flex items-center justify-center transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50"
        >
          <Heart size={28} strokeWidth={2} className="text-white" fill="white" />
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div
          key={toast.key}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up"
          role="status"
          aria-live="polite"
        >
          <div className="bg-coy-ink text-white text-sm font-[700] px-4 py-2 rounded-[999px]">
            {toast.text}
          </div>
        </div>
      )}

      {/* Match overlay */}
      {matchData && (
        <MatchOverlay
          profile={matchData.profile}
          onKeepSwiping={() => setMatchData(null)}
          onViewMatches={() => {
            setMatchData(null);
            onViewMatches();
          }}
        />
      )}

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translate(-50%, 10px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
