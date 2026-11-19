'use client';

import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';

interface MatchItem {
  profile: {
    id: string;
    name: string;
    age: number;
    photo: string;
    bio: string;
    location: string;
    interests: string[];
  };
  matchedAt: string;
}

export default function MatchesView() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/matches')
      .then((r) => r.json())
      .then((data) => setMatches(data.matches || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-coy-muted font-[600] text-sm">Loading matches…</div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 gap-3">
        <div className="w-16 h-16 rounded-full bg-coy-lavender border-2 border-coy-ink flex items-center justify-center">
          <span className="text-2xl">💜</span>
        </div>
        <h3 className="text-lg font-[800] tracking-[-0.02em] text-coy-ink text-center">
          No matches yet. Keep swiping.
        </h3>
        <p className="text-sm font-[500] text-coy-muted text-center">
          When you and someone both like each other, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 pb-4 space-y-3">
      {matches.map(({ profile, matchedAt }) => (
        <MatchCard key={profile.id} profile={profile} matchedAt={matchedAt} />
      ))}
    </div>
  );
}

function MatchCard({
  profile,
  matchedAt,
}: {
  profile: MatchItem['profile'];
  matchedAt: string;
}) {
  const [imgError, setImgError] = useState(false);
  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const dateStr = new Date(matchedAt + 'Z').toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-coy-bg border-2 border-coy-ink rounded-[24px] shadow-coy p-4 flex items-center gap-4">
      {/* Avatar */}
      <div className="w-16 h-16 rounded-full border-2 border-coy-ink overflow-hidden bg-coy-surface shrink-0">
        {!imgError ? (
          <img
            src={profile.photo}
            alt={`Photo of ${profile.name}`}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-coy-lavender flex items-center justify-center">
            <span className="text-lg font-[800] text-coy-ink">{initials}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-1.5">
          <h3 className="text-base font-[800] tracking-[-0.02em] text-coy-ink truncate">
            {profile.name}
          </h3>
          <span className="text-base font-[800] text-coy-ink tabular-nums shrink-0">
            {profile.age}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="w-5 h-5 rounded-[6px] bg-coy-lavender flex items-center justify-center shrink-0">
            <MapPin size={12} strokeWidth={2} className="text-coy-ink" />
          </div>
          <span className="text-xs font-[500] text-coy-muted truncate">
            {profile.location}
          </span>
        </div>
        <p className="text-xs font-[600] text-coy-muted mt-1">
          Matched {dateStr}
        </p>
      </div>
    </div>
  );
}
