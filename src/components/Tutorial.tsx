import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ClipboardList, LayoutDashboard, Settings as SettingsIcon, CheckCircle2, Info } from 'lucide-react';

interface TutorialProps {
  onComplete: () => void;
  setActiveTab: (tab: 'log' | 'dashboard' | 'settings') => void;
}

const steps = [
  {
    title: "Why onTask?",
    content: "Accountability is hard. onTask makes it simple by asking for just 10 seconds of honesty every hour.",
    icon: <CheckCircle2 size={40} />,
    type: 'MODAL',
    tab: 'log' as const,
  },
  {
    title: "The Golden Rule",
    content: "Every hour must total exactly 60 minutes. Flick the dials to split your time accurately.",
    icon: <ClipboardList size={40} />,
    type: 'MODAL',
    tab: 'log' as const,
  },
  {
    title: "The Log Queue",
    content: "Missed a few hours? The 'Log: X of Y' badge at the top keeps track of your pending entries from today.",
    icon: <Info size={24} />,
    type: 'TOAST',
    tab: 'log' as const,
  },
  {
    title: "Performance Reports",
    content: "Swipe to the Report tab to see your 'On-Task' percentage and compare your reality to your goals.",
    icon: <LayoutDashboard size={24} />,
    type: 'TOAST',
    tab: 'dashboard' as const,
  },
  {
    title: "Manual Recovery",
    content: "Accidentally skipped an hour? You can re-open any of today's skipped hours in the Settings tab.",
    icon: <SettingsIcon size={24} />,
    type: 'TOAST',
    tab: 'settings' as const,
  },
  {
    title: "Stay Notified",
    content: "We'll send you a subtle tap at the start of each hour to remind you to log. You've got this!",
    icon: <CheckCircle2 size={24} />,
    type: 'TOAST',
    tab: 'settings' as const,
  }
];

const Tutorial: React.FC<TutorialProps> = ({ onComplete, setActiveTab }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    setActiveTab(steps[currentStep].tab);
  }, [currentStep, setActiveTab]);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const current = steps[currentStep];

  return (
    <div className="tutorial-wrapper">
      {current.type === 'MODAL' && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="tutorial-backdrop" 
          onClick={next}
        />
      )}

      <AnimatePresence mode="wait">
        <motion.div 
          key={currentStep}
          initial={current.type === 'MODAL' ? { scale: 0.9, opacity: 0 } : { y: 20, opacity: 0 }}
          animate={current.type === 'MODAL' ? { scale: 1, opacity: 1 } : { y: 0, opacity: 1 }}
          exit={current.type === 'MODAL' ? { scale: 0.9, opacity: 0 } : { y: 20, opacity: 0 }}
          className={`tutorial-box ${current.type.toLowerCase()} glass-card`}
        >
          {current.type === 'MODAL' ? (
            <>
              <div className="modal-top">
                <div className="icon-wrap">{current.icon}</div>
                <h2>{current.title}</h2>
              </div>
              <p className="modal-content">{current.content}</p>
              <div className="modal-footer">
                <button className="skip-link" onClick={onComplete}>Skip Tour</button>
                <button className="next-btn" onClick={next}>
                  {currentStep === steps.length - 1 ? 'Start' : 'Next'}
                  <ChevronRight size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="toast-content">
              <div className="toast-icon">{current.icon}</div>
              <div className="toast-text">
                <div className="toast-title">{current.title}</div>
                <p>{current.content}</p>
              </div>
              <button className="toast-next" onClick={next}>
                {currentStep === steps.length - 1 ? 'Done' : <ChevronRight size={20} />}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <style>{`
        .tutorial-wrapper {
          position: fixed;
          inset: 0;
          z-index: 20000;
          pointer-events: none;
        }
        .tutorial-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          pointer-events: auto;
        }
        .tutorial-box {
          pointer-events: auto;
          position: fixed;
          max-width: 500px;
          margin: 0 auto;
        }
        .tutorial-box.modal {
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) !important;
          width: 90%;
          max-width: 360px;
          padding: 2.5rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          text-align: center;
          box-shadow: 0 40px 80px rgba(0,0,0,0.6);
        }
        .tutorial-box.toast {
          bottom: 100px;
          left: 1rem;
          right: 1rem;
          width: calc(100% - 2rem);
          padding: 1rem 1.25rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
          border-left: 4px solid var(--accent);
          background: rgba(15, 23, 42, 0.95) !important;
        }
        .icon-wrap {
          color: var(--accent);
          background: var(--accent-soft);
          padding: 1.25rem;
          border-radius: 20px;
          display: inline-flex;
          margin-bottom: 1rem;
        }
        .modal-top h2 {
          font-size: 1.75rem;
          font-weight: 800;
        }
        .modal-content {
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .modal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 0.5rem;
        }
        .skip-link { font-size: 0.8125rem; font-weight: 600; color: var(--text-secondary); opacity: 0.6; }
        .next-btn {
          background: var(--accent);
          color: white;
          padding: 10px 24px;
          border-radius: 99px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3);
        }
        
        .toast-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          text-align: left;
        }
        .toast-icon { color: var(--accent); flex-shrink: 0; }
        .toast-text { flex: 1; min-width: 0; }
        .toast-title { font-weight: 800; font-size: 0.875rem; color: var(--text-primary); margin-bottom: 2px; }
        .toast-text p { font-size: 0.75rem; color: var(--text-secondary); line-height: 1.4; margin: 0; }
        .toast-next {
          background: var(--accent);
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 0.75rem;
          font-weight: 800;
        }
        @media (max-width: 600px) {
          .tutorial-box.toast {
            bottom: 90px;
          }
        }
      `}</style>
    </div>
  );
};

export default Tutorial;
