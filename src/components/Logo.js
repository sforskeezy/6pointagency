import React from 'react';

export const Logo = ({ size = 28, color = '#050505' }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        {/* Sleek geometric tech hexagon */}
        <path d="M20 2L35.5885 11V29L20 38L4.41154 29V11L20 2Z" fill={color}/>
        {/* Stark contrasting core */}
        <circle cx="20" cy="20" r="6" fill={color === '#050505' ? '#FFF' : '#050505'}/>
      </svg>
      <span style={{ fontSize: '20px', fontWeight: 800, color: color, letterSpacing: '-0.04em', transition: 'color 0.4s ease' }}>
        6POINT.
      </span>
    </div>
  );
};
