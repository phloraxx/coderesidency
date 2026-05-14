'use client';

import React from 'react';

interface MarqueeTextProps {
  text: string;
  repeat?: number;
  direction?: 'left' | 'right';
  speed?: number; // In seconds
  className?: string;
  outline?: boolean;
}

export default function MarqueeText({
  text,
  repeat = 10,
  direction = 'left',
  speed = 30,
  className = '',
  outline = false,
}: MarqueeTextProps) {
  return (
    <div
      className={`marquee-container ${className}`}
      style={{
        display: 'flex',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        width: '100%',
      }}
    >
      <div
        className={`marquee-track ${direction === 'right' ? 'marquee-reverse' : ''}`}
        style={{
          display: 'flex',
          animationDuration: `${speed}s`,
        }}
      >
        {Array.from({ length: repeat }).map((_, i) => (
          <span
            key={i}
            className={`marquee-text ${outline ? 'text-outline' : ''}`}
            style={{ paddingRight: '1rem', display: 'inline-block' }}
          >
            {text}
          </span>
        ))}
      </div>
      {/* Duplicate for seamless infinite loop */}
      <div
        className={`marquee-track ${direction === 'right' ? 'marquee-reverse' : ''}`}
        style={{
          display: 'flex',
          animationDuration: `${speed}s`,
        }}
      >
        {Array.from({ length: repeat }).map((_, i) => (
          <span
            key={`dup-${i}`}
            className={`marquee-text ${outline ? 'text-outline' : ''}`}
            style={{ paddingRight: '1rem', display: 'inline-block' }}
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
