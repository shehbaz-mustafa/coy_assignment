'use client';

import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  velocityX: number;
  velocityY: number;
  delay: number;
}

const COLORS = ['#FF3D7F', '#FFE15C', '#E6E0FF', '#FFDCCB', '#FFDDEA'];
const PARTICLE_COUNT = 40;

export default function Confetti() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const newParticles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: 50 + (Math.random() - 0.5) * 60,
      y: 30 + (Math.random() - 0.5) * 20,
      size: 6 + Math.random() * 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      velocityX: (Math.random() - 0.5) * 100,
      velocityY: Math.random() * 60 + 40,
      delay: Math.random() * 0.3,
    }));
    setParticles(newParticles);
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-40" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-[2px]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            animation: `confetti-fall 1.2s ${p.delay}s ease-out forwards`,
            opacity: 0,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% {
            opacity: 1;
            transform: translate(0, 0) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translate(var(--tx, 50px), var(--ty, 200px)) rotate(720deg);
          }
        }
      `}</style>
      {/* Inline styles for each particle's unique trajectory */}
      {particles.map((p) => (
        <style key={`style-${p.id}`}>{`
          div[data-confetti="${p.id}"] {
            --tx: ${p.velocityX}px;
            --ty: ${p.velocityY}px;
          }
        `}</style>
      ))}
    </div>
  );
}
