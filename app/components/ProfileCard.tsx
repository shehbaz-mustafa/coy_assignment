'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import type { Profile } from './SwipeView';

const ACCENT_COLORS = [
  'bg-coy-lavender',
  'bg-coy-yellow',
  'bg-coy-peach',
  'bg-coy-light-pink',
];

interface Props {
  profile: Profile;
}

export default function ProfileCard({ profile }: Props) {
  const [imgError, setImgError] = useState(false);

  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="bg-coy-bg border-2 border-coy-ink rounded-[24px] shadow-coy overflow-hidden select-none">
      {/* Photo */}
      <div className="relative w-full" style={{ aspectRatio: '4/5' }}>
        {!imgError ? (
          <img
            src={profile.photo}
            alt={`Photo of ${profile.name}`}
            className="w-full h-full object-cover rounded-t-[22px]"
            draggable={false}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-coy-lavender flex items-center justify-center rounded-t-[22px]">
            <span className="text-5xl font-[800] text-coy-ink">{initials}</span>
          </div>
        )}
        {/* Gradient for name readability */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none rounded-b-none"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)',
          }}
        />
      </div>

      {/* Details */}
      <div className="p-4 space-y-3">
        {/* Name and age */}
        <div className="flex items-baseline gap-2">
          <h2 className="text-xl font-[800] tracking-[-0.02em] text-coy-ink" style={{ textWrap: 'balance' }}>
            {profile.name}
          </h2>
          <span className="text-xl font-[800] text-coy-ink tabular-nums">
            {profile.age}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2">
          <div className="w-[36px] h-[36px] rounded-[12px] bg-coy-lavender flex items-center justify-center shrink-0">
            <MapPin size={20} strokeWidth={2} className="text-coy-ink" />
          </div>
          <span className="text-sm font-[500] text-coy-muted">{profile.location}</span>
        </div>

        {/* Bio */}
        <p className="text-sm font-[500] text-coy-ink leading-relaxed line-clamp-3">
          {profile.bio}
        </p>

        {/* Interests */}
        <div className="flex flex-wrap gap-2">
          {profile.interests.map((interest, i) => (
            <span
              key={interest}
              className={`
                px-3 py-1 rounded-[999px] text-xs font-[600] text-coy-ink
                border-2 border-coy-ink shadow-coy-sm
                ${ACCENT_COLORS[i % ACCENT_COLORS.length]}
              `}
            >
              {interest}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
