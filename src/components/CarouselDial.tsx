import React, { useRef, useEffect, useMemo, useState } from 'react';

interface CarouselDialProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  label?: string;
  increment?: number;
}

const CarouselDial: React.FC<CarouselDialProps> = ({ value, onChange, max = 60, label, increment = 1 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const ITEM_HEIGHT = 38; // Compact height
  const [isScrolling, setIsScrolling] = useState(false);
  
  const numbers = useMemo(() => 
    Array.from({ length: Math.floor(max / increment) + 1 }, (_, i) => i * increment),
    [max, increment]
  );

  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const validatedIndex = Math.max(0, Math.min(numbers.length - 1, index));
    const newValue = numbers[validatedIndex];
    
    if (newValue !== value) {
      onChange(newValue);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const currentIndex = Math.round(containerRef.current.scrollTop / ITEM_HEIGHT);
    const targetIndex = numbers.indexOf(value);
    
    if (targetIndex !== -1 && targetIndex !== currentIndex && !isScrolling) {
      containerRef.current.scrollTo({
        top: targetIndex * ITEM_HEIGHT,
        behavior: 'smooth'
      });
    }
  }, [value, numbers, isScrolling]);

  return (
    <div className="dial-container">
      {label && <label className="dial-label">{label}</label>}
      <div className="dial-outer-wrap">
        <div className="dial-indicator-stationary" />
        <div 
          className="dial-viewport"
          ref={containerRef}
          onScroll={handleScroll}
          onScrollCapture={() => setIsScrolling(true)}
          onScrollEnd={() => setIsScrolling(false)}
          onTouchStart={() => setIsScrolling(true)}
          onTouchEnd={() => setIsScrolling(false)}
        >
          <div className="dial-spacer" style={{ height: ITEM_HEIGHT }} />
          {numbers.map((n) => (
            <div
              key={n}
              className={`dial-item ${value === n ? 'active' : ''}`}
              style={{ height: ITEM_HEIGHT }}
              onClick={() => {
                if (containerRef.current) {
                  const index = numbers.indexOf(n);
                  containerRef.current.scrollTo({
                    top: index * ITEM_HEIGHT,
                    behavior: 'smooth'
                  });
                }
              }}
            >
              {n}
            </div>
          ))}
          <div className="dial-spacer" style={{ height: ITEM_HEIGHT }} />
        </div>
      </div>
      
      <style>{`
        .dial-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          user-select: none;
        }
        .dial-label {
          font-size: 0.625rem;
          color: var(--text-secondary);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-align: center;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1.2;
          width: 80px;
        }
        .dial-outer-wrap {
          position: relative;
          height: ${ITEM_HEIGHT * 3}px;
          width: 80px;
        }
        .dial-indicator-stationary {
          position: absolute;
          top: ${ITEM_HEIGHT}px;
          left: 0;
          right: 0;
          height: ${ITEM_HEIGHT}px;
          background: var(--accent-soft);
          border: 2px solid var(--accent);
          border-radius: 12px;
          pointer-events: none;
          z-index: 0;
        }
        .dial-viewport {
          position: relative;
          height: 100%;
          width: 100%;
          overflow-y: scroll;
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-snap-type: y mandatory;
          z-index: 1;
        }
        .dial-viewport::-webkit-scrollbar {
          display: none;
        }
        .dial-item {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 700;
          scroll-snap-align: center;
          color: var(--text-secondary);
          transition: color 0.2s, transform 0.2s;
        }
        .dial-item.active {
          color: var(--accent);
          font-size: 1.5rem;
        }
        .dial-spacer {
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
};

export default CarouselDial;
