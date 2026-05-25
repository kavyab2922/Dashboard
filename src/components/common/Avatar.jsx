import { useState } from 'react';

/**
 * Avatar — shows a profile photo if available, falls back to styled initials.
 *
 * Props:
 *   photo      – URL string (optional)
 *   initials   – 2-letter fallback text
 *   color      – accent/background color used for fallback + ring
 *   size       – 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 *   shape      – 'circle' | 'rounded' (default 'rounded')
 *   className  – extra classes
 *   style      – extra inline styles
 *   ring       – show colored ring (default false)
 *   online     – show green online dot (default false)
 */
export default function Avatar({
  photo,
  initials = '?',
  color = '#6366f1',
  size = 'md',
  shape = 'rounded',
  className = '',
  style = {},
  ring = false,
  online = false,
}) {
  const [imgError, setImgError] = useState(false);

  const dimensions = {
    xs:  { box: 'w-6 h-6',    text: 'text-[9px]',  dot: 'w-2 h-2',   border: '1.5px', radius: shape === 'circle' ? 'rounded-full' : 'rounded-lg' },
    sm:  { box: 'w-8 h-8',    text: 'text-xs',      dot: 'w-2.5 h-2.5',border: '2px',  radius: shape === 'circle' ? 'rounded-full' : 'rounded-xl' },
    md:  { box: 'w-10 h-10',  text: 'text-sm',      dot: 'w-3 h-3',   border: '2px',   radius: shape === 'circle' ? 'rounded-full' : 'rounded-xl' },
    lg:  { box: 'w-14 h-14',  text: 'text-base',    dot: 'w-3.5 h-3.5',border: '2.5px',radius: shape === 'circle' ? 'rounded-full' : 'rounded-2xl' },
    xl:  { box: 'w-20 h-20',  text: 'text-xl',      dot: 'w-4 h-4',   border: '3px',   radius: shape === 'circle' ? 'rounded-full' : 'rounded-2xl' },
  };

  const d = dimensions[size] || dimensions.md;
  const showPhoto = photo && !imgError;

  return (
    <div className={`relative flex-shrink-0 ${className}`} style={style}>
      <div
        className={`${d.box} ${d.radius} overflow-hidden flex items-center justify-center`}
        style={
          showPhoto
            ? { boxShadow: ring ? `0 0 0 2px ${color}50, 0 4px 16px ${color}30` : `0 4px 16px ${color}30` }
            : {
                background: color,
                boxShadow: ring
                  ? `0 0 0 2px ${color}50, 0 4px 16px ${color}40`
                  : `0 4px 16px ${color}40`,
              }
        }
      >
        {showPhoto ? (
          <img
            src={photo}
            alt={initials}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className={`text-white font-black ${d.text} leading-none select-none tracking-wide`}>
            {initials}
          </span>
        )}
      </div>

      {online && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 ${d.dot} rounded-full bg-emerald-400`}
          style={{ border: `${d.border} solid #080714` }}
        />
      )}
    </div>
  );
}
