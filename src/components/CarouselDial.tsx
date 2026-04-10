import React, { useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface CarouselDialProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  label?: string;
}

const CarouselDial: React.FC<CarouselDialProps> = ({ value, onChange, max = 60, label }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const ITEM_HEIGHT = 40;
  
  const numbers = Array.from({ length: max + 1 }, (_, i) => i);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const validatedIndex = Math.max(0, Math.min(max, index));
    if (validatedIndex !== value) {
      onChange(validatedIndex);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = value * ITEM_HEIGHT;
    }
  }, []); // Only on mount

  // Snap to position after scrolling stops
  const handleScrollEnd = () => {
    if (!containerRef.current) return;
    containerRef.current.scrollTo({
      top: value * ITEM_HEIGHT,
      behavior: 'smooth'
    });
  };

  return (
    <div className="dial-container">
      {label && <label className="dial-label">{label}</label>}
      <div 
        className="dial-viewport"
        ref={containerRef}
        onScroll={handleScroll}
        onScrollEnd={handleScrollEnd}
        onMouseUp={handleScrollEnd}
        onTouchEnd={handleScrollEnd}
      >
        <div className="dial-spacer" style={{ height: ITEM_HEIGHT }} />
        {numbers.map((n) => (
          <motion.div
            key={n}
            className={`dial-item ${value === n ? 'active' : ''}`}
            style={{ height: ITEM_HEIGHT }}
            animate={{
              scale: value === n ? 1.2 : 0.8,
              opacity: Math.abs(value - n) > 2 ? 0.2 : 0.6,
            }}
          >
            {n}
          </motion.div>
        ))}
        <div className="dial-spacer" style={{ height: ITEM_HEIGHT }} />
        <div className="dial-indicator" style={{ height: ITEM_HEIGHT, top: ITEM_HEIGHT }} />
      </div>
      <style>{`
        .dial-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          user-select: none;
        }
        .dial-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-weight: 500;
          text-transform: uppercase;
        }
        .dial-viewport {
          position: relative;
          height: ${ITEM_HEIGHT * 3}px;
          overflow-y: scroll;
          scrollbar-width: none;
          -ms-overflow-style: none;
          width: 80px;
          cursor: grab;
          scroll-snap-type: y mandatory;
        }
        .dial-viewport::-webkit-scrollbar {
          display: none;
        }
        .dial-item {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 600;
          scroll-snap-align: center;
          color: var(--text-primary);
        }
        .dial-item.active {
          color: var(--accent);
        }
        .dial-indicator {
          position: absolute;
          left: 0;
          right: 0;
          border-top: 1px solid var(--border-glass);
          border-bottom: 1px solid var(--border-glass);
          pointer-events: none;
          background: var(--accent-soft);
          border-radius: 4px;
        }
        .dial-spacer {
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
};

export default CarouselDial;
