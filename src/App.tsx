import React, { useState, useEffect } from 'react';
import { useFirebase } from './context/FirebaseContext';
import { useAppData } from './context/AppDataContext';
import LogForm from './components/LogForm';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Tutorial from './components/Tutorial';
import { LayoutDashboard, ClipboardList, Settings as SettingsIcon, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { requestNotificationPermission, checkAndNotify } from './utils/notifications';

const GoogleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const App: React.FC = () => {
  const { user, loading, login, logout, isPermitted } = useFirebase();
  const { getMissedHours } = useAppData();
  const [activeTab, setActiveTab] = useState<'log' | 'dashboard' | 'settings'>('log');
  const [missedHours, setMissedHours] = useState<Date[]>([]);
  const [currentMissedIndex, setCurrentMissedIndex] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showInfoToast, setShowInfoToast] = useState(false);
  const [, setLastNotifiedHour] = useState<number | null>(null);

  // Background Lock for Landing Page
  useEffect(() => {
    if (!user) {
      document.body.style.backgroundColor = "#020617";
      return () => { document.body.style.backgroundColor = ""; };
    }
  }, [user]);

  // Tutorial Logic - Single Mount Check
  useEffect(() => {
    if (user && isPermitted) {
      const hasSeenTutorial = localStorage.getItem(`tutorial_seen_${user.uid}`);
      if (!hasSeenTutorial) {
        setShowTutorial(true);
      }
    }
  }, [user, isPermitted]);

  // Data Updates - Separated
  useEffect(() => {
    if (user && isPermitted) {
      setMissedHours(getMissedHours());
      
      requestNotificationPermission();
      const interval = setInterval(() => {
        setLastNotifiedHour(prev => checkAndNotify(prev));
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user, isPermitted, getMissedHours]);

  const completeTutorial = () => {
    if (user) {
      localStorage.setItem(`tutorial_seen_${user.uid}`, 'true');
      setShowTutorial(false);
      setActiveTab('log');
    }
  };

  if (loading) return (
    <div className="fullscreen-msg">
      <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity }}>onTask</motion.div>
    </div>
  );

  if (!user) return (
    <div className="premium-landing">
      <div className="radial-glow" />
      <div className="landing-content">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card login-hero-card"
        >
          <span className="hero-badge">Beta Access</span>
          <h1>Master your output,<br/><span>one hour</span> at a time.</h1>
          <p className="hero-desc">The simple, disciplined way to track focus, build high-performance habits, and stay accountable to yourself.</p>
          
          <div className="cta-section">
            <button className="premium-google-btn" onClick={login}>
              <div className="google-icon-box">
                <GoogleIcon />
              </div>
              <span>Continue with Google</span>
            </button>
            <p className="security-note">Securely protected by Firebase Auth</p>
          </div>
        </motion.div>
      </div>

      <style>{`
        .premium-landing {
          position: fixed;
          inset: 0;
          background: #020617;
          color: white;
          z-index: 100000;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          font-family: var(--font-heading);
        }
        .radial-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100vw;
          height: 100vw;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .login-hero-card {
          width: 90vw;
          max-width: 480px;
          padding: 3.5rem 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.8);
          background: rgba(15, 23, 42, 0.4);
        }
        .hero-badge {
          background: var(--accent-soft);
          color: var(--accent);
          padding: 6px 16px;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .login-hero-card h1 {
          font-size: clamp(2rem, 8vw, 2.75rem);
          line-height: 1.1;
          letter-spacing: -0.04em;
          margin: 0;
        }
        .login-hero-card h1 span {
          background: linear-gradient(135deg, var(--accent), #f472b6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-desc {
          font-family: var(--font-sans);
          color: #94a3b8;
          font-size: 1rem;
          line-height: 1.6;
          margin: 0;
        }
        .cta-section {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-top: 1rem;
        }
        .premium-google-btn {
          width: 100%;
          background: #ffffff;
          color: #0f172a;
          padding: 4px;
          border-radius: 99px;
          display: flex;
          align-items: center;
          font-weight: 700;
          font-size: 1.125rem;
          transition: all 0.3s ease;
          border: 1px solid transparent;
        }
        .premium-google-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(99, 102, 241, 0.3);
        }
        .google-icon-box {
          background: #f8fafc;
          padding: 12px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .premium-google-btn span {
          flex: 1;
          margin-right: 44px; /* balance the icon */
        }
        .security-note {
          font-size: 0.75rem;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 600;
        }
      `}</style>
    </div>
  );

  if (isPermitted === false) return (
    <div className="fullscreen-msg">
      <div className="glass-card restricted-card">
        <AlertCircle size={48} color="var(--danger)" />
        <h2>Access Restricted</h2>
        <p>Your account ({user.email}) needs admin approval.</p>
        <button className="secondary-btn" onClick={logout}>Sign Out</button>
      </div>
    </div>
  );

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
    <div className="main-app-shell">
      {showTutorial && <Tutorial onComplete={completeTutorial} setActiveTab={setActiveTab} />}
      
      <header className="main-header glass">
        <div className="header-inner">
          <span className="logo">onTask</span>
          {isCatchingUp && (
            <div className="badge-wrap">
              <div className="catchup-badge" onClick={(e) => {
                e.stopPropagation();
                setShowInfoToast(!showInfoToast);
              }}>
                <AlertCircle size={14} />
                <span>Log: {currentMissedIndex + 1} / {missedHours.length}</span>
              </div>
              <AnimatePresence>
                {showInfoToast && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                    exit={{ opacity: 0, y: 10, scale: 0.95 }} 
                    className="badge-popover glass"
                  >
                    Pending logs from today. Complete them to see your full report!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </header>

      <main className="content-area">
        <AnimatePresence mode="wait">
          {activeTab === 'log' ? (
            <motion.div key="log" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              {isCatchingUp ? (
                <LogForm key={currentHourToLog?.toISOString()} hourDate={currentHourToLog!} onComplete={handleLogComplete} />
              ) : (
                <div className="empty-state glass-card">
                  <ClipboardList size={48} />
                  <h3>All logged up!</h3>
                  <p>Next check-in after {new Date().getHours() + 1}:00</p>
                  <button className="secondary-btn" onClick={() => setActiveTab('dashboard')}>Go to Dashboard</button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'settings' && <Settings />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <nav className="nav-bar glass">
        <button className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <LayoutDashboard size={24} />
          <span>Report</span>
        </button>
        <button className={`nav-link ${activeTab === 'log' ? 'active' : ''}`} onClick={() => setActiveTab('log')}>
          <ClipboardList size={24} />
          <span>Log</span>
        </button>
        <button className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
          <SettingsIcon size={24} />
          <span>Settings</span>
        </button>
      </nav>

      <AnimatePresence>
        {showInfoToast && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="toast-dismiss-overlay" 
            onClick={() => setShowInfoToast(false)} 
          />
        )}
      </AnimatePresence>

      <style>{`
        .fullscreen-msg {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
          color: white;
          text-align: center;
          padding: 2rem;
        }
        .restricted-card {
          padding: 3rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }
        
        .main-app-shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--bg-primary);
        }
        .main-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          padding: 0.75rem 1rem;
        }
        .header-inner {
          max-width: 600px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          font-weight: 800;
          color: var(--accent);
          font-size: 1.125rem;
        }
        .content-area {
          flex: 1;
          padding: 1.5rem 1rem 7rem;
          max-width: 600px;
          margin: 0 auto;
          width: 100%;
        }
        .badge-wrap {
          position: relative;
          cursor: pointer;
        }
        .catchup-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--accent-soft);
          color: var(--accent);
          padding: 6px 12px;
          border-radius: 99px;
          font-weight: 700;
          font-size: 0.75rem;
        }
        .badge-popover {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 200px;
          padding: 1rem;
          font-size: 0.75rem;
          border-radius: 12px;
          box-shadow: var(--shadow-lg);
          z-index: 10002;
        }
        .toast-dismiss-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 10001;
          background: transparent;
        }
        .nav-bar {
          position: fixed;
          bottom: 1.5rem;
          left: 1rem;
          right: 1rem;
          max-width: 500px;
          margin: 0 auto;
          height: 64px;
          border-radius: 32px;
          display: flex;
          justify-content: space-around;
          align-items: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        .nav-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: var(--text-secondary);
          opacity: 0.6;
        }
        .nav-link.active {
          color: var(--accent);
          opacity: 1;
        }
        .nav-link span { font-size: 0.625rem; font-weight: 700; text-transform: uppercase; }
        
        .empty-state {
          padding: 4rem 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
};

export default App;
