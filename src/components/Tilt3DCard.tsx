'use client';

import React, { useRef } from 'react';

interface Tilt3DCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  glare?: boolean;
  onClick?: () => void;
}

/**
 * High-Performance 60FPS 3D Perspective Tilt Container.
 * Uses direct DOM CSS custom properties via requestAnimationFrame
 * so mouse movement triggers ZERO React state re-renders.
 */
export default function Tilt3DCard({
  children,
  className = '',
  intensity = 12,
  glare = true,
  onClick,
}: Tilt3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;

    const clientX = e.clientX;
    const clientY = e.clientY;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const px = (clientX - rect.left) / rect.width;
      const py = (clientY - rect.top) / rect.height;

      const rotateY = (px - 0.5) * (intensity * 2);
      const rotateX = (0.5 - py) * (intensity * 2);

      el.style.setProperty('--rx', `${rotateX.toFixed(2)}deg`);
      el.style.setProperty('--ry', `${rotateY.toFixed(2)}deg`);
      el.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
      el.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
      el.style.setProperty('--glare-opacity', '1');
    });
  };

  const handleMouseLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--glare-opacity', '0');
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        {
          '--rx': '0deg',
          '--ry': '0deg',
          '--gx': '50%',
          '--gy': '50%',
          '--glare-opacity': '0',
          transform:
            'perspective(1000px) rotateX(var(--rx)) rotateY(var(--ry)) translateZ(0)',
          transformStyle: 'preserve-3d',
          transition: 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: 'transform',
        } as React.CSSProperties
      }
      className={`relative ${className}`}
    >
      {children}

      {glare && (
        <div
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(circle at var(--gx) var(--gy), rgba(220, 38, 38, 0.22), transparent 60%)',
            opacity: 'var(--glare-opacity)',
            transition: 'opacity 250ms ease',
            transform: 'translateZ(1px)',
          }}
          className="pointer-events-none absolute inset-0 z-30"
        />
      )}
    </div>
  );
}
