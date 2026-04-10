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
  const { buckets, logs, addLog, skipLog, reportConfig } = useAppData();
  const [selectedHour, setSelectedHour] = useState<Date>(hourDate);
  // Find existing log data if editing
  const existingLog = useMemo(() => 
    logs.find(l => l.id === selectedHour.toISOString()),
    [logs, selectedHour]
  );

  const [values, setValues] = useState<Record<string, number>>(
    existingLog?.buckets || buckets.reduce((acc, b) => ({ ...acc, [b.id]: 0 }), {})
  );
  const [mood, setMood] = useState<'happy' | 'medium' | 'sad'>(existingLog?.mood || 'medium');
  const [submitting, setSubmitting] = useState(false);

  // Sync state if selectedHour changes
  React.useEffect(() => {
    if (existingLog) {
      setValues(existingLog.buckets);
      setMood(existingLog.mood);
    } else {
      setValues(buckets.reduce((acc, b) => ({ ...acc, [b.id]: 0 }), {}));
      setMood('medium');
    }
  }, [existingLog, buckets]);

  const totalMinutes = useMemo(() => {
    return Object.values(values).reduce((sum, v) => sum + v, 0);
  }, [values]);

  const isValid = totalMinutes === 60;

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    await addLog({
      buckets: values,
      mood,
      status: 'completed'
    }, selectedHour);
    setSubmitting(false);
    
    // If we were editing a previous hour, just stay here or close
    if (selectedHour.getTime() !== hourDate.getTime()) {
      setSelectedHour(hourDate);
    } else {
      onComplete();
    }
  };

  const handleSkip = async () => {
    // Direct skip without confirm for smoother flow and easier testing
    await skipLog(selectedHour);
    onComplete();
  };

  const hourLabel = selectedHour.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const periodLabel = `${new Date(selectedHour.getTime() - 60 * 60 * 1000).getHours()}:00 - ${selectedHour.getHours()}:00`;

  const todaysLogs = useMemo(() => {
    const today = new Date().getDate();
    return logs.filter(l => new Date(l.timestamp).getDate() === today && l.status === 'completed')
               .sort((a, b) => b.timestamp - a.timestamp);
  }, [logs]);

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
            increment={reportConfig.dialIncrement}
          />
        ))}
      </div>

      <div className="validation-status">
        <div className={`progress-bar ${totalMinutes > 60 ? 'error' : totalMinutes === 60 ? 'success' : ''}`}>
          <motion.div 
            className="progress-fill" 
            animate={{ width: `${Math.min(100, (totalMinutes / 60) * 100)}%` }}
          />
        </div>
        <div className="status-text">
          <span>Total: {totalMinutes} / 60 mins</span>
          {totalMinutes !== 60 && (
            <span className={totalMinutes > 60 ? 'error-msg' : 'info-msg'}>
              {totalMinutes > 60 ? (
                <>
                  <AlertCircle size={14} /> {totalMinutes - 60}m over
                </>
              ) : (
                <>
                  <AlertCircle size={14} /> Need {60 - totalMinutes}m more
                </>
              )}
            </span>
          )}
          {totalMinutes === 60 && (
            <span className="success-msg">
              <CheckCircle2 size={14} /> Ready to log
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
        {submitting ? 'Saving...' : existingLog ? 'Update Log' : 'Log Hour'}
        {isValid && <CheckCircle2 size={18} style={{ marginLeft: '8px' }} />}
      </button>

      {!existingLog && (
        <button className="skip-btn-form" onClick={handleSkip}>
          Skip this hour
        </button>
      )}

      {todaysLogs.length > 0 && (
        <div className="history-section">
          <h3>Edit Today's Logs</h3>
          <div className="history-list">
            {todaysLogs.map(log => (
              <button 
                key={log.id} 
                className={`history-item ${selectedHour.toISOString() === log.id ? 'active' : ''}`}
                onClick={() => setSelectedHour(new Date(log.timestamp))}
              >
                {new Date(log.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </button>
            ))}
            <button 
              className={`history-item ${selectedHour.getTime() === hourDate.getTime() ? 'active' : ''}`}
              onClick={() => setSelectedHour(hourDate)}
            >
              Current: {hourDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </button>
          </div>
        </div>
      )}

      <style>{`
        .log-form {
          max-width: 500px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .form-header {
          text-align: center;
        }
        .form-header h2 {
          font-size: 1.25rem;
          color: var(--text-primary);
        }
        .form-header p {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }
        .dials-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
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
          align-items: center;
        }
        .error-msg, .info-msg, .success-msg {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 4px;
        }
        .error-msg {
          color: var(--danger);
          background: rgba(239, 68, 68, 0.1);
        }
        .info-msg {
          color: var(--accent);
          background: var(--accent-soft);
        }
        .success-msg {
          color: #22c55e;
          background: rgba(34, 197, 94, 0.1);
        }
        .progress-bar.success .progress-fill {
           background: #22c55e;
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
        .skip-btn-form {
          color: var(--danger);
          font-size: 0.875rem;
          font-weight: 600;
          text-align: center;
          padding: 0.5rem;
          background: rgba(239, 68, 68, 0.05);
          border-radius: 8px;
        }
        .history-section {
          margin-top: 0.5rem;
          border-top: 1px solid var(--border-glass);
          padding-top: 1rem;
        }
        .history-section h3 {
          font-size: 0.625rem;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
          text-align: center;
        }
        .history-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }
        .history-item {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          background: var(--bg-primary);
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
        }
        .history-item.active {
          background: var(--accent-soft);
          color: var(--accent);
          border-color: var(--accent);
        }
      `}</style>
    </motion.div>
  );
};

export default LogForm;
