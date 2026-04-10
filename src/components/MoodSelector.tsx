import React from 'react';
import { motion } from 'framer-motion';
import { Smile, Meh, Frown } from 'lucide-react';

type Mood = 'happy' | 'medium' | 'sad';

interface MoodSelectorProps {
  value: Mood;
  onChange: (mood: Mood) => void;
}

const MoodSelector: React.FC<MoodSelectorProps> = ({ value, onChange }) => {
  const moods: { type: Mood; icon: any; color: string }[] = [
    { type: 'sad', icon: Frown, color: '#ef4444' },
    { type: 'medium', icon: Meh, color: '#f59e0b' },
    { type: 'happy', icon: Smile, color: '#22c55e' },
  ];

  return (
    <div className="mood-container">
      <label className="mood-label">How was your mood?</label>
      <div className="mood-options">
        {moods.map(({ type, icon: Icon, color }) => (
          <motion.button
            key={type}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(type)}
            className={`mood-button ${value === type ? 'active' : ''}`}
            style={{ 
              '--mood-color': color,
            } as any}
          >
            <Icon size={32} strokeWidth={2.5} />
          </motion.button>
        ))}
      </div>
      <style>{`
        .mood-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          margin: 1rem 0;
        }
        .mood-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 500;
        }
        .mood-options {
          display: flex;
          gap: 1.5rem;
        }
        .mood-button {
          color: var(--text-secondary);
          opacity: 0.5;
          padding: 8px;
          border-radius: 50%;
        }
        .mood-button.active {
          color: var(--mood-color);
          opacity: 1;
          background: var(--accent-soft);
          box-shadow: 0 0 15px var(--accent-soft);
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default MoodSelector;
