import React from 'react';

/* 6-pointed asterisk mark — chunky trapezoidal rays radiating from a
   small hexagonal centre. Pulled out so the navbar (and elsewhere) can
   reuse just the icon without the wordmark. */
export const LogoMark = ({ size = 24, color = 'var(--logo-green)' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill={color}
    aria-hidden="true"
    style={{ display: 'block' }}
  >
    {[0, 60, 120, 180, 240, 300].map((deg) => (
      <polygon
        key={deg}
        /* Top ray (before rotation):
           - Outer edge: y=4, x from 25 → 39  (width 14)
           - Inner edge: y=28, x from 30.5 → 33.5 (width 3)
           Trapezoid tapers from a wide flat outer end down to a narrow
           inner end near the centre. */
        points="30.5,28 25,4 39,4 33.5,28"
        transform={`rotate(${deg} 32 32)`}
      />
    ))}
  </svg>
);

/* Vertical lockup: asterisk on top, 6POINT wordmark below.
   Used in the top nav. Rendered in a deep brand green per the brand asset. */
export const Logo = ({ markSize = 22, textSize = 11 }) => (
  <span
    aria-label="6POINT Designs"
    style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      lineHeight: 1,
      color: 'var(--logo-green)',
    }}
  >
    <LogoMark size={markSize} color="currentColor" />
    <span
      style={{
        fontFamily: 'var(--font-sans)',
        fontWeight: 700,
        fontSize: textSize,
        letterSpacing: '0.14em',
        color: 'currentColor',
      }}
    >
      6POINT
    </span>
  </span>
);
