import React, { useRef, useState, useEffect, useCallback } from 'react';

interface VirtualJoystickProps {
  onMove: (vector: { x: number; y: number }) => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [knobPosition, setKnobPosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const activeTouchId = useRef<number | null>(null);

  const radius = 55; // max displacement radius in px

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    activeTouchId.current = e.pointerId;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsActive(true);
    updateVector(e.clientX, e.clientY);
  };

  const updateVector = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.hypot(dx, dy);

    let clampedX = dx;
    let clampedY = dy;

    if (distance > radius) {
      clampedX = (dx / distance) * radius;
      clampedY = (dy / distance) * radius;
    }

    setKnobPosition({ x: clampedX, y: clampedY });
    // Normalize -1 to 1
    onMove({
      x: clampedX / radius,
      y: clampedY / radius
    });
  }, [onMove, radius]);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isActive || activeTouchId.current !== e.pointerId) return;
    e.preventDefault();
    updateVector(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeTouchId.current === e.pointerId) {
      activeTouchId.current = null;
      setIsActive(false);
      setKnobPosition({ x: 0, y: 0 });
      onMove({ x: 0, y: 0 });
    }
  };

  useEffect(() => {
    const handleGlobalUp = () => {
      if (isActive) {
        setIsActive(false);
        setKnobPosition({ x: 0, y: 0 });
        onMove({ x: 0, y: 0 });
      }
    };
    window.addEventListener('pointerup', handleGlobalUp);
    window.addEventListener('pointercancel', handleGlobalUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalUp);
      window.removeEventListener('pointercancel', handleGlobalUp);
    };
  }, [isActive, onMove]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative w-32 h-32 rounded-full border-2 border-amber-500/40 bg-neutral-950/70 backdrop-blur-none flex items-center justify-center select-none touch-none shadow-2xl active:border-amber-400"
      style={{ touchAction: 'none' }}
    >
      {/* Outer decorative ring & crosshairs */}
      <div className="absolute inset-2 rounded-full border border-neutral-700/60 pointer-events-none" />
      <div className="absolute w-full h-[1px] bg-amber-500/15 pointer-events-none" />
      <div className="absolute h-full w-[1px] bg-amber-500/15 pointer-events-none" />

      {/* Direction indicators */}
      <span className="absolute top-1 text-[9px] font-mono tracking-widest text-amber-400/60 pointer-events-none">▲</span>
      <span className="absolute bottom-1 text-[9px] font-mono tracking-widest text-amber-400/60 pointer-events-none">▼</span>
      <span className="absolute left-1.5 text-[9px] font-mono text-amber-400/60 pointer-events-none">◀</span>
      <span className="absolute right-1.5 text-[9px] font-mono text-amber-400/60 pointer-events-none">▶</span>

      {/* Floating Center Thumb Knob */}
      <div
        className={`w-14 h-14 rounded-full border-2 transition-transform duration-75 flex items-center justify-center pointer-events-none shadow-lg ${
          isActive
            ? 'bg-gradient-to-br from-amber-600 to-amber-800 border-amber-300 scale-105'
            : 'bg-gradient-to-br from-neutral-800 to-neutral-900 border-amber-500/50'
        }`}
        style={{
          transform: `translate3d(${knobPosition.x}px, ${knobPosition.y}px, 0)`
        }}
      >
        <div className="w-5 h-5 rounded-full bg-neutral-950/60 border border-amber-400/40" />
      </div>
    </div>
  );
};
