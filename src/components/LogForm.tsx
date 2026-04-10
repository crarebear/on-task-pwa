import React, { useState, useMemo } from 'react';
import CarouselDial from './CarouselDial';
import MoodSelector from './MoodSelector';
import { useAppData } from '../context/AppDataContext';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface LogFormProps {
  hourDate: Date;
  onComplete: () => void;
}

const LogForm: React.FC<LogFormProps> = ({ hourDate, onComplete }) => {
  const { buckets, addLog } = useAppData();
  const [values, setValues] = useState<Record<string, number>>(
    buckets.reduce((acc, b) => ({ ...acc, [b.id]: 0 }), {})
  );
  const [mood, setMood] = useState<'happy' | 'medium' | 'sad'>('medium');
  const [submitting, setSubmitting] = useState(false);

  const totalMinutes = useMemo(() => {
    return Object.values(values).reduce((sum, v) => sum + v, 0);
  }, [values]);

  const isValid = totalMinutes <= 60 && totalMinutes > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    await addLog({
      buckets: values,
      mood,
      status: 'completed'
    }, hourDate);
    setSubmitting(false);
    onComplete();
  };

  const hourLabel = hourDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const periodLabel = `${new Date(hourDate.getTime() - 60 * 60 * 1000).getHours()}:00 - ${hourDate.getHours()}:00`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card log-form"
    >
      <div className="form-header">
        <h2>Logging Hour: {hourLabel}</h2>
        <p>Activity for {periodLabel}</p>
      </div>

      <div className="dials-grid">
        {buckets.map((bucket) => (
          <CarouselDial
            key={bucket.id}
            label={bucket.name}
            value={values[bucket.id]}
            onChange={(v) => setValues(prev => ({ ...prev, [bucket.id]: v }))}
          />
        ))}
      </div>

      <div className="validation-status">
        <div className={`progress-bar ${totalMinutes > 60 ? 'error' : ''}`}>
          <motion.div 
            className="progress-fill" 
            animate={{ width: `${Math.min(100, (totalMinutes / 60) * 100)}%` }}
          />
        </div>
        <div className="status-text">
          <span>Total: {totalMinutes} / 60 mins</span>
          {totalMinutes > 60 && (
            <span className="error-msg">
              <AlertCircle size={14} /> Exceeds 60m
            </span>
          )}
        </div>
      </div>

      <MoodSelector value={mood} onChange={setMood} />

      <button 
        className={`submit-btn ${isValid ? 'valid' : 'invalid'}`}
        disabled={!isValid || submitting}
        onClick={handleSubmit}
      >
        {submitting ? 'Saving...' : 'Log Hour'}
        {isValid && <CheckCircle2 size={18} style={{ marginLeft: '8px' }} />}
      </button>

      <style>{`
        .log-form {
          max-width: 500px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .form-header {
          text-align: center;
        }
        .form-header h2 {
          font-size: 1.5rem;
          color: var(--text-primary);
        }
        .form-header p {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }
        .dials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        .validation-status {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .progress-bar {
          height: 6px;
          background: var(--accent-soft);
          border-radius: 3px;
          overflow: hidden;
        }
        .progress-bar.error {
          background: rgba(239, 68, 68, 0.1);
        }
        .progress-fill {
          height: 100%;
          background: var(--accent);
          border-radius: 3px;
        }
        .progress-bar.error .progress-fill {
          background: var(--danger);
        }
        .status-text {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-secondary);
        }
        .error-msg {
          color: var(--danger);
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .submit-btn {
          padding: 1rem;
          border-radius: var(--radius-md);
          font-size: 1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }
        .submit-btn.valid {
          background: var(--accent);
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        .submit-btn.invalid {
          background: var(--bg-primary);
          color: var(--text-secondary);
          opacity: 0.5;
          cursor: not-allowed;
          border: 1px dashed var(--text-secondary);
        }
        .submit-btn.valid:hover {
          background: var(--accent-hover);
          transform: translateY(-2px);
        }
      `}</style>
    </motion.div>
  );
};

export default LogForm;
