import { useEffect, useMemo, useState } from 'react';
import { GameIcon, GAME_TONES, prefersReducedMotion } from './common';

const GAME_PARTICLES = {
  sudoku: ['Grid2X2', 'Sparkles', 'Grid2X2'],
  quiz: ['HelpCircle', 'Star', 'Sparkles'],
  word: ['Type', 'Sparkles', 'Type'],
  trivia: ['Lightbulb', 'Star', 'Lightbulb'],
  all: ['Grid2X2', 'HelpCircle', 'Type', 'Lightbulb'],
};

function seeded(index, salt = 0) {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

export default function GameIconRain({ gameId, icon, color, intensity = 'subtle', className = '' }) {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  const [pageVisible, setPageVisible] = useState(() => typeof document === 'undefined' || document.visibilityState !== 'hidden');
  const particles = useMemo(() => {
    const names = GAME_PARTICLES[gameId] || [icon || 'Crown'];
    const count = intensity === 'vibrant' ? 18 : 10;
    return Array.from({ length: count }, (_, index) => ({
      id: `${gameId || 'game'}-${index}`,
      name: names[index % names.length],
      left: `${Math.round(seeded(index, gameId?.length || 1) * 100)}%`,
      delay: `${-Math.round(seeded(index, 2) * 9 * 10) / 10}s`,
      duration: `${6 + Math.round(seeded(index, 3) * 50) / 10}s`,
      size: `${12 + Math.round(seeded(index, 4) * 10)}px`,
      rotation: `${Math.round(seeded(index, 5) * 80 - 40)}deg`,
    }));
  }, [gameId, icon, intensity]);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(document.visibilityState !== 'hidden');
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = (event) => setReduced(event.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  if (reduced || !pageVisible) return null;
  const tone = GAME_TONES[color] || GAME_TONES[gameId] || GAME_TONES[icon] || 'blue';

  return (
    <div className={`game-icon-rain game-icon-rain-${intensity} tone-${tone} ${className}`} aria-hidden="true">
      {particles.map((particle) => (
        <span
          className="game-icon-rain-particle"
          key={particle.id}
          style={{
            left: particle.left,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
            '--rain-size': particle.size,
            '--rain-rotation': particle.rotation,
          }}
        >
          <GameIcon name={particle.name} size={Number.parseInt(particle.size, 10)} />
        </span>
      ))}
    </div>
  );
}
