import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, X } from 'lucide-react';

interface TutorialProps {
  onComplete: () => void;
}

const steps = [
  {
    title: "Welcome to onTask",
    content: "Each hour (9am-11pm), we'll send a notification to log how you spent your time.",
  },
  {
    title: "The Hourly Log",
    content: "Use the carousel dials to select minutes for your 3 buckets. Total must not exceed 60 minutes.",
  },
  {
    title: "Track Goals",
    content: "The Dashboard shows your actual time spend versus the goals you've set.",
  },
  {
    title: "Customization",
    content: "Change bucket names and goals in the Settings tab to fit your routine.",
  }
];

const Tutorial: React.FC<TutorialProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="tutorial-overlay">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card tutorial-card"
      >
        <button className="close-btn" onClick={onComplete}><X size={20} /></button>
        
        <div className="tutorial-content">
          <motion.h2
            key={`title-${currentStep}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {steps[currentStep].title}
          </motion.h2>
          <motion.p
            key={`content-${currentStep}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {steps[currentStep].content}
          </motion.p>
        </div>

        <div className="tutorial-footer">
          <div className="dots">
            {steps.map((_, i) => (
              <div key={i} className={`dot ${i === currentStep ? 'active' : ''}`} />
            ))}
          </div>
          <button className="next-btn" onClick={next}>
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            <ChevronRight size={18} />
          </button>
        </div>
      </motion.div>

      <style>{`
        .tutorial-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(2, 6, 23, 0.8);
          backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }
        .tutorial-card {
          width: 100%;
          max-width: 400px;
          padding: 2.5rem 2rem;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .close-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          color: var(--text-secondary);
        }
        .tutorial-content h2 {
          font-size: 1.5rem;
          margin-bottom: 0.75rem;
          color: var(--accent);
        }
        .tutorial-content p {
          color: var(--text-primary);
          line-height: 1.6;
        }
        .tutorial-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
        }
        .dots {
          display: flex;
          gap: 6px;
        }
        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--text-secondary);
          opacity: 0.3;
          transition: var(--transition);
        }
        .dot.active {
          opacity: 1;
          background: var(--accent);
          width: 16px;
          border-radius: 3px;
        }
        .next-btn {
          background: var(--accent);
          color: white;
          padding: 8px 16px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default Tutorial;
