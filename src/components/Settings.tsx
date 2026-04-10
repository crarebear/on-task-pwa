import React from 'react';
import { useAppData } from '../context/AppDataContext';
import { useTheme } from '../context/ThemeContext';
import { useFirebase } from '../context/FirebaseContext';
import { Moon, Sun, LogOut, Settings as SettingsIcon, Save } from 'lucide-react';
import { motion } from 'framer-motion';

const Settings: React.FC = () => {
  const { buckets, updateBucketName, updateGoals } = useAppData();
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isMock } = useFirebase();

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
      `}</style>
    </div>
  );
};

export default Settings;
