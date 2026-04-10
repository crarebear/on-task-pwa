import React, { useState, useEffect } from 'react';
import { useFirebase } from './context/FirebaseContext';
import { useAppData } from './context/AppDataContext';
import LogForm from './components/LogForm';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Tutorial from './components/Tutorial';
import { LayoutDashboard, ClipboardList, Settings as SettingsIcon, LogIn, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const { user, loading, login } = useFirebase();
  const { getMissedHours } = useAppData();
  const [activeTab, setActiveTab] = useState<'log' | 'dashboard' | 'settings'>('log');
  const [missedHours, setMissedHours] = useState<Date[]>([]);
  const [currentMissedIndex, setCurrentMissedIndex] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (user) {
      setMissedHours(getMissedHours());
      
      const hasSeenTutorial = localStorage.getItem(`tutorial_seen_${user.uid}`);
      if (!hasSeenTutorial) setShowTutorial(true);
    }
  }, [user, getMissedHours]);

  const completeTutorial = () => {
    if (user) localStorage.setItem(`tutorial_seen_${user.uid}`, 'true');
    setShowTutorial(false);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="loading-logo"
        >
          onTask
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="login-screen">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card login-card">
          <h1>onTask</h1>
          <p>Track your time. Master your day.</p>
          <button className="google-login-btn" onClick={login}>
            <LogIn size={20} />
            <span>Sign in with Google</span>
          </button>
        </motion.div>
      </div>
    );
  }

  const handleLogComplete = () => {
    if (currentMissedIndex < missedHours.length - 1) {
      setCurrentMissedIndex(prev => prev + 1);
    } else {
      setMissedHours([]);
      setCurrentMissedIndex(0);
      setActiveTab('dashboard');
    }
  };

  const isCatchingUp = missedHours.length > 0;
  const currentHourToLog = isCatchingUp ? missedHours[currentMissedIndex] : null;

  return (
    <div className="app-container">
      {showTutorial && <Tutorial onComplete={completeTutorial} />}
      <header className="app-header glass">
        <div className="header-content">
          <span className="logo">onTask</span>
          {isCatchingUp && (
            <div className="catchup-badge">
              <AlertCircle size={14} />
              <span>Catching up ({currentMissedIndex + 1}/{missedHours.length})</span>
            </div>
          )}
        </div>
      </header>

      <main className="app-content">
        <AnimatePresence mode="wait">
          {isCatchingUp ? (
            <LogForm 
              key={`missed-${currentHourToLog?.toISOString()}`}
              hourDate={currentHourToLog!} 
              onComplete={handleLogComplete} 
            />
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'log' && (
                <div className="log-placeholder">
                  <div className="glass-card wait-container">
                    <ClipboardList size={48} className="muted-icon" />
                    <h3>Up to date!</h3>
                    <p>Next survey at {new Date().getHours() + 1}:01</p>
                    <button className="secondary-btn" onClick={() => setActiveTab('dashboard')}>
                      View Dashboard
                    </button>
                  </div>
                </div>
              )}
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'settings' && <Settings />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <nav className="bottom-nav glass">
        <button 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={24} />
          <span>Report</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'log' ? 'active' : ''}`}
          onClick={() => setActiveTab('log')}
        >
          <ClipboardList size={24} />
          <span>Log</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <SettingsIcon size={24} />
          <span>Settings</span>
        </button>
      </nav>

      <style>{`
        .app-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .app-header {
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 1rem;
          margin-bottom: 2rem;
        }
        .header-content {
          max-width: 600px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          font-family: var(--font-heading);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--accent);
        }
        .catchup-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--danger);
          color: white;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .app-content {
          flex: 1;
          padding: 0 1rem;
          max-width: 600px;
          width: 100%;
          margin: 0 auto;
        }
        .bottom-nav {
          position: fixed;
          bottom: 1.5rem;
          left: 1rem;
          right: 1rem;
          height: 64px;
          border-radius: 32px;
          display: flex;
          justify-content: space-around;
          align-items: center;
          max-width: 500px;
          margin: 0 auto;
          z-index: 1000;
          box-shadow: var(--shadow-lg);
        }
        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: var(--text-secondary);
          width: 60px;
        }
        .nav-item span {
          font-size: 0.625rem;
          font-weight: 600;
          text-transform: uppercase;
        }
        .nav-item.active {
          color: var(--accent);
        }
        .loading-screen, .login-screen {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .loading-logo {
          font-size: 2rem;
          font-weight: 800;
          color: var(--accent);
        }
        .login-card {
          text-align: center;
          width: 100%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 3rem 2rem;
        }
        .google-login-btn {
          background: white;
          color: #1f2937;
          border: 1px solid #e5e7eb;
          padding: 0.75rem;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-weight: 600;
        }
        .wait-container {
          text-align: center;
          padding: 4rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .muted-icon {
          opacity: 0.2;
          margin-bottom: 1rem;
        }
        .secondary-btn {
          background: var(--accent-soft);
          color: var(--accent);
          padding: 8px 16px;
          border-radius: var(--radius-md);
          font-weight: 600;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
};

export default App;
