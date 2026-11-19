'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import type { Profile } from './SwipeView';
import Confetti from './Confetti';

interface Props {
  profile: Profile;
  onKeepSwiping: () => void;
  onViewMatches: () => void;
}

export default function MatchOverlay({ profile, onKeepSwiping, onViewMatches }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  // Focus trap
  useEffect(() => {
    firstFocusRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onKeepSwiping();
        return;
      }
      if (e.key !== 'Tab') return;

      const overlay = overlayRef.current;
      if (!overlay) return;

      const focusable = overlay.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKeepSwiping]);

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        className="fixed inset-0 z-50 flex items-center justify-center bg-coy-lavender/95"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label={`It's a match with ${profile.name}`}
      >
        {/* Confetti */}
        {!prefersReduced && <Confetti />}

        <motion.div
          className="flex flex-col items-center gap-6 px-6 max-w-[380px] w-full"
          initial={prefersReduced ? {} : { scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.1 }}
        >
          <h2
            className="text-3xl font-[800] tracking-[-0.02em] text-coy-ink text-center"
            style={{ textWrap: 'balance' }}
          >
            It&apos;s a match!
          </h2>

          {/* Overlapping avatars with heart */}
          <div className="flex items-center justify-center -space-x-4 my-2">
            {/* User avatar */}
            <div className="w-24 h-24 rounded-full border-[3px] border-coy-ink overflow-hidden bg-coy-surface z-10">
              <img
                src="https://i.pravatar.cc/600?img=68"
                alt="Your photo"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Heart between */}
            <div className="relative z-20 -mx-2">
              <div className="w-10 h-10 rounded-full bg-coy-pink border-2 border-coy-ink flex items-center justify-center shadow-coy-sm">
                <Heart size={20} className="text-white" fill="white" />
              </div>
            </div>

            {/* Match avatar */}
            <div className="w-24 h-24 rounded-full border-[3px] border-coy-ink overflow-hidden bg-coy-surface z-10">
              <img
                src={profile.photo}
                alt={`Photo of ${profile.name}`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <p className="text-sm font-[600] text-coy-muted text-center">
            You and {profile.name} liked each other.
          </p>

          <div className="flex flex-col gap-3 w-full mt-2">
            <button
              ref={firstFocusRef}
              onClick={onKeepSwiping}
              className="w-full py-3 bg-coy-pink text-white font-[700] text-sm rounded-[16px] border-2 border-coy-ink shadow-coy transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              Keep swiping
            </button>
            <button
              onClick={onViewMatches}
              className="w-full py-3 bg-coy-bg text-coy-ink font-[700] text-sm rounded-[16px] border-2 border-coy-ink shadow-coy transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              View matches
            </button>
          </div>
        </motion.div>

        {/* Aria-live announcement */}
        <div className="sr-only" aria-live="assertive">
          It&apos;s a match with {profile.name}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
