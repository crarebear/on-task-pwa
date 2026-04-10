import React from 'react';
import { useAppData } from '../context/AppDataContext';
import { useTheme } from '../context/ThemeContext';
import { useFirebase } from '../context/FirebaseContext';
import { Moon, Sun, LogOut, Bell, ClipboardList, ChevronRight } from 'lucide-react';
import { sendLocalNotification } from '../utils/notifications';


const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isMock } = useFirebase();
  const { 
    buckets, 
    updateBucketName, 
    updateGoals, 
    reportConfig, 
    updateReportConfig,
    schedule,
    updateSchedule,
    getIgnoredHours,
    deleteLog
  } = useAppData();

  const daysLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="settings-page">
      <section className="settings-section">
        <h3>Theme</h3>
        <button className="glass-card theme-btn" onClick={toggleTheme}>
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          <span>Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode</span>
        </button>
      </section>

      <section className="settings-section">
        <h3>Notifications</h3>
        <button 
          className="glass-card theme-btn" 
          onClick={() => sendLocalNotification("onTask Test", "This is how your hourly reminders will look!")}
        >
          <Bell size={20} className="accent-icon" />
          <span>Test Notification</span>
        </button>
      </section>

      <section className="settings-section">
        <h3>Bucket Customization</h3>
        <div className="buckets-edit">
          {buckets.map((b) => (
            <div key={b.id} className="glass-card bucket-edit-card">
              <div className="input-group">
                <label>Name</label>
                <input 
                  type="text" 
                  value={b.name} 
                  onChange={(e) => updateBucketName(b.id, e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>Goal %</label>
                <input 
                  type="number" 
                  value={b.goalPercent} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    updateGoals({ [b.id]: val });
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="settings-section">
        <h3>App Schedule</h3>
        <div className="glass-card schedule-card">
          <div className="schedule-row">
            <label>Start Hour</label>
            <select 
              value={schedule.startHour}
              onChange={(e) => updateSchedule({ startHour: parseInt(e.target.value) })}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{i === 0 ? '12 AM' : i <= 12 ? `${i} AM` : `${i-12} PM`}</option>
              ))}
            </select>
          </div>
          <div className="schedule-row">
            <label>End Hour</label>
            <select 
              value={schedule.endHour}
              onChange={(e) => updateSchedule({ endHour: parseInt(e.target.value) })}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{i === 0 ? '12 AM' : i <= 12 ? `${i} AM` : `${i-12} PM`}</option>
              ))}
            </select>
          </div>
          <div className="days-row">
            <label>Active Days</label>
            <div className="days-selector">
              {daysLabels.map((label, i) => (
                <button
                  key={i}
                  className={`day-btn ${schedule.activeDays[i] ? 'active' : ''}`}
                  onClick={() => {
                    const newDays = [...schedule.activeDays];
                    newDays[i] = !newDays[i];
                    updateSchedule({ activeDays: newDays });
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h3>App Settings</h3>
        <div className="glass-card settings-card">
          <div className="settings-row">
            <span>Dial Increment</span>
            <div className="btn-group">
              <button 
                className={`group-btn ${reportConfig.dialIncrement === 1 ? 'active' : ''}`}
                onClick={() => updateReportConfig({ dialIncrement: 1 })}
              >
                1m
              </button>
              <button 
                className={`group-btn ${reportConfig.dialIncrement === 5 ? 'active' : ''}`}
                onClick={() => updateReportConfig({ dialIncrement: 5 })}
              >
                5m
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h3>Report Settings</h3>
        <div className="glass-card report-settings">
          <div className="report-toggle-group">
            <Toggle 
              label="Daily Report" 
              active={reportConfig.daily} 
              onToggle={() => updateReportConfig({ daily: !reportConfig.daily })} 
            />
            <Toggle 
              label="Weekly Report" 
              active={reportConfig.weekly} 
              onToggle={() => updateReportConfig({ weekly: !reportConfig.weekly })} 
            />
            <Toggle 
              label="Monthly Report" 
              active={reportConfig.monthly} 
              onToggle={() => updateReportConfig({ monthly: !reportConfig.monthly })} 
            />
            <div className="trailing-x-group">
              <Toggle 
                label={`Trailing ${reportConfig.trailingXDays} Days`} 
                active={reportConfig.trailingX} 
                onToggle={() => updateReportConfig({ trailingX: !reportConfig.trailingX })} 
              />
              {reportConfig.trailingX && (
                <div className="trailing-input">
                  <input 
                    type="number" 
                    value={reportConfig.trailingXDays} 
                    onChange={(e) => updateReportConfig({ trailingXDays: parseInt(e.target.value) || 1 })}
                    min="1"
                    max="365"
                  />
                  <span>days</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <h3>Account</h3>
        <div className="glass-card account-card">
          <div className="user-info">
            <img src={user?.photoURL || ''} alt="" className="avatar" />
            <div>
              <p className="user-name">{user?.displayName}</p>
              <p className="user-email">{user?.email}</p>
              {isMock && <span className="badge">Mock Mode</span>}
            </div>
          </div>
          <button className="logout-btn" onClick={logout}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </section>

      <section className="settings-section">
        <h3>Manual Log Recovery</h3>
        <details className="glass-card recovery-details">
          <summary className="recovery-summary">
            <span>Recover Missed Hours</span>
            <ChevronRight className="chevron" size={18} />
          </summary>
          <div className="recovery-content">
            <p className="recovery-desc">Redo an hour you previously skipped or missed today.</p>
            <div className="recovery-list">
              {getIgnoredHours().length > 0 ? (
                getIgnoredHours().map((date) => (
                  <div key={date.toISOString()} className="recovery-item">
                    <span>{date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                    <button className="recover-btn" onClick={() => deleteLog(date.toISOString())}>
                      Recover
                    </button>
                  </div>
                ))
              ) : (
                <p className="empty-recovery">No skipped hours to recover.</p>
              )}
            </div>
          </div>
        </details>
      </section>

      <section className="settings-section">
        <h3>Support</h3>
        <button 
          className="glass-card theme-btn" 
          onClick={() => {
            if (user) {
              localStorage.removeItem(`tutorial_seen_${user.uid}`);
              window.location.reload();
            }
          }}
        >
          <ClipboardList size={20} className="accent-icon" />
          <span>Restart Onboarding Tour</span>
        </button>
      </section>

      <style>{`
        .settings-page {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding-bottom: 5rem;
        }
        .settings-section h3 {
          font-size: 0.875rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          margin-bottom: 0.75rem;
        }
        .theme-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          font-weight: 500;
          color: var(--text-primary);
        }
        .theme-btn span {
          color: var(--text-primary);
        }
        .schedule-card {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .schedule-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .schedule-row label {
          font-size: 0.875rem;
          font-weight: 500;
        }
        .schedule-row select {
          background: var(--bg-primary);
          color: var(--text-primary);
          border: 1px solid var(--border-glass);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.875rem;
        }
        .days-row {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .days-row label {
          font-size: 0.875rem;
          font-weight: 500;
        }
        .days-selector {
          display: flex;
          justify-content: space-between;
          gap: 4px;
        }
        .day-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          background: var(--bg-primary);
          color: var(--text-secondary);
          border: 1px solid var(--border-glass);
          transition: var(--transition);
        }
        .day-btn.active {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }
        .buckets-edit {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .bucket-edit-card {
          display: grid;
          grid-template-columns: 1fr 80px;
          gap: 1rem;
          padding: 1rem;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .input-group label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .input-group input {
          background: var(--bg-primary);
          border: 1px solid var(--border-glass);
          color: var(--text-primary);
          padding: 8px;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
        }
        .account-card {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 1rem;
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
        }
        .user-name {
          font-weight: 600;
          margin: 0;
        }
        .user-email {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin: 0;
        }
        .badge {
          font-size: 0.625rem;
          background: var(--accent-soft);
          color: var(--accent);
          padding: 2px 6px;
          border-radius: 10px;
          font-weight: 700;
        }
        .logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 10px;
          color: var(--danger);
          background: rgba(239, 68, 68, 0.1);
          border-radius: var(--radius-md);
          font-weight: 600;
        }
        .report-settings {
          padding: 1rem;
        }
        .report-toggle-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .toggle-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .toggle-label {
          font-weight: 500;
          font-size: 0.875rem;
        }
        .toggle-switch {
          width: 44px;
          height: 24px;
          background: var(--bg-primary);
          border-radius: 12px;
          position: relative;
          border: 1px solid var(--border-glass);
          transition: var(--transition);
        }
        .toggle-switch.active {
          background: var(--accent);
          border-color: var(--accent);
        }
        .toggle-knob {
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 1px;
          left: 1px;
          transition: var(--transition);
        }
        .toggle-switch.active .toggle-knob {
          left: 21px;
        }
        .trailing-x-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding-top: 0.5rem;
          border-top: 1px solid var(--border-glass);
        }
        .trailing-input {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: 0.5rem;
        }
        .trailing-input input {
          width: 60px;
          background: var(--bg-primary);
          border: 1px solid var(--border-glass);
          color: var(--text-primary);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.875rem;
        }
        .trailing-input span {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        .settings-card {
          padding: 1rem;
        }
        .settings-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .btn-group {
          display: flex;
          background: var(--bg-primary);
          padding: 4px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-glass);
        }
        .group-btn {
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--text-secondary);
          transition: var(--transition);
        }
        .group-btn.active {
          background: var(--accent);
          color: white;
          box-shadow: var(--shadow-sm);
        }

        .recovery-details {
          padding: 0;
          overflow: hidden;
        }
        .recovery-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem;
          cursor: pointer;
          list-style: none;
          font-weight: 700;
          font-size: 0.9375rem;
        }
        .recovery-summary::-webkit-details-marker {
          display: none;
        }
        .recovery-summary .chevron {
          transition: transform 0.3s ease;
          color: var(--text-secondary);
        }
        .recovery-details[open] .chevron {
          transform: rotate(90deg);
        }
        .recovery-content {
          padding: 0 1.25rem 1.25rem;
          border-top: 1px solid var(--border-glass);
          padding-top: 1rem;
        }
        .recovery-desc {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }
        .recovery-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .recovery-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: var(--bg-primary);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-glass);
        }
        .recovery-item span {
          font-size: 0.875rem;
          font-weight: 600;
        }
        .recover-btn {
          padding: 4px 12px;
          background: var(--accent-soft);
          color: var(--accent);
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .empty-recovery {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-align: center;
          padding: 1rem;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

const Toggle: React.FC<{ label: string; active: boolean; onToggle: () => void }> = ({ label, active, onToggle }) => (
  <div className="toggle-row">
    <span className="toggle-label">{label}</span>
    <button className={`toggle-switch ${active ? 'active' : ''}`} onClick={onToggle}>
      <div className="toggle-knob" />
    </button>
  </div>
);

export default Settings;
