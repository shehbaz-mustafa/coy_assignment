'use client';

export default function SkeletonCard() {
  return (
    <div className="w-full max-w-[380px] bg-coy-bg border-2 border-coy-ink rounded-[24px] shadow-coy overflow-hidden animate-pulse">
      {/* Photo skeleton */}
      <div className="w-full bg-coy-surface" style={{ aspectRatio: '4/5' }} />

      {/* Details skeleton */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-28 bg-coy-surface rounded-[8px]" />
          <div className="h-6 w-8 bg-coy-surface rounded-[8px]" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-[36px] h-[36px] bg-coy-surface rounded-[12px]" />
          <div className="h-4 w-32 bg-coy-surface rounded-[8px]" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full bg-coy-surface rounded-[6px]" />
          <div className="h-3 w-3/4 bg-coy-surface rounded-[6px]" />
        </div>
        <div className="flex gap-2">
          <div className="h-7 w-20 bg-coy-surface rounded-[999px]" />
          <div className="h-7 w-16 bg-coy-surface rounded-[999px]" />
          <div className="h-7 w-24 bg-coy-surface rounded-[999px]" />
        </div>
      </div>
    </div>
  );
}
