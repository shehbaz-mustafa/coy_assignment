'use client';

interface Props {
  onSeeMatches: () => void;
  onReset: () => void;
}

export default function EmptyState({ onSeeMatches, onReset }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <div className="w-full max-w-[380px] bg-coy-bg border-2 border-coy-ink rounded-[24px] shadow-coy p-6 flex flex-col items-center gap-5">
        {/* Illustration: stacked pastel cards */}
        <div className="relative w-32 h-24 my-2">
          <div
            className="absolute left-6 top-2 w-20 h-16 rounded-[16px] border-2 border-coy-ink bg-coy-peach"
            style={{ transform: 'rotate(-6deg)' }}
          />
          <div
            className="absolute left-4 top-1 w-20 h-16 rounded-[16px] border-2 border-coy-ink bg-coy-yellow"
            style={{ transform: 'rotate(-3deg)' }}
          />
          <div className="absolute left-5 top-0 w-20 h-16 rounded-[16px] border-2 border-coy-ink bg-coy-lavender shadow-coy-sm" />
        </div>

        <h3
          className="text-xl font-[800] tracking-[-0.02em] text-coy-ink text-center"
          style={{ textWrap: 'balance' }}
        >
          You&apos;re all caught up
        </h3>
        <p className="text-sm font-[500] text-coy-muted text-center leading-relaxed">
          New people show up here soon. Check your matches in the meantime.
        </p>

        <button
          onClick={onSeeMatches}
          className="w-full py-3 bg-coy-pink text-white font-[700] text-sm rounded-[16px] border-2 border-coy-ink shadow-coy transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          See matches
        </button>

        <button
          onClick={onReset}
          className="w-full py-3 bg-coy-bg text-coy-ink font-[700] text-sm rounded-[16px] border-2 border-coy-ink shadow-coy transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          Reset demo
        </button>
        <p className="text-xs font-[600] text-coy-muted">Demo only — resets all swipes and matches</p>
      </div>
    </div>
  );
}
