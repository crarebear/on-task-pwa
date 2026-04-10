import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useFirebase } from './FirebaseContext';
import { doc, setDoc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';

export interface BucketConfig {
  id: string;
  name: string;
  goalPercent: number;
}

export interface HourlyLog {
  id: string; // ISO string for the hour (e.g., 2026-04-10T09:00:00)
  timestamp: number;
  buckets: Record<string, number>; 
  mood: 'happy' | 'medium' | 'sad';
  status: 'completed' | 'missed' | 'ignored' | 'deleted';
}

interface AppDataContextType {
  buckets: BucketConfig[];
  logs: HourlyLog[];
  updateBucketName: (id: string, name: string) => void;
  updateGoals: (goals: Record<string, number>) => void;
  addLog: (log: Omit<HourlyLog, 'id' | 'timestamp'>, hourDate: Date) => Promise<void>;
  skipLog: (hourDate: Date) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
  getMissedHours: () => Date[];
  getIgnoredHours: () => Date[];
  schedule: {
    startHour: number;
    endHour: number;
    activeDays: boolean[]; 
  };
  updateSchedule: (schedule: Partial<AppDataContextType['schedule']>) => void;
  reportConfig: {
    daily: boolean;
    weekly: boolean;
    monthly: boolean;
    trailingX: boolean;
    trailingXDays: number;
    dialIncrement: 1 | 5;
  };
  updateReportConfig: (config: Partial<AppDataContextType['reportConfig']>) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

const DEFAULT_BUCKETS: BucketConfig[] = [
  { id: 'on-task', name: 'On Task Activities', goalPercent: 70 },
  { id: 'social', name: 'Social', goalPercent: 20 },
  { id: 'learning', name: 'Learning/Research', goalPercent: 10 },
];

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, db, isMock } = useFirebase();
  const [buckets, setBuckets] = useState<BucketConfig[]>(DEFAULT_BUCKETS);
  const [logs, setLogs] = useState<HourlyLog[]>([]);
  const [schedule, setSchedule] = useState({
    startHour: 9,
    endHour: 22,
    activeDays: [true, true, true, true, true, true, true]
  });
  const [reportConfig, setReportConfig] = useState<AppDataContextType['reportConfig']>({
    daily: true,
    weekly: true,
    monthly: true,
    trailingX: false,
    trailingXDays: 7,
    dialIncrement: 1,
  });

  // Load user settings and logs
  useEffect(() => {
    if (!user) return;

    if (isMock) {
      const savedBuckets = localStorage.getItem(`buckets_${user.uid}`);
      const savedLogs = localStorage.getItem(`logs_${user.uid}`);
      const savedReportConfig = localStorage.getItem(`reportConfig_${user.uid}`);
      const savedSchedule = localStorage.getItem(`schedule_${user.uid}`);
      if (savedBuckets) setBuckets(JSON.parse(savedBuckets));
      if (savedLogs) setLogs(JSON.parse(savedLogs));
      if (savedReportConfig) setReportConfig(JSON.parse(savedReportConfig));
      if (savedSchedule) setSchedule(JSON.parse(savedSchedule));
      return;
    }

    // Settings Listener
    const userDocRef = doc(db, 'users', user.uid);
    const unsubUser = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.buckets) setBuckets(data.buckets);
        if (data.schedule) setSchedule(data.schedule);
        if (data.reportConfig) setReportConfig(data.reportConfig);
      }
    });

    // Logs Listener - RECENT ONLY for performance
    const logsColRef = collection(db, 'logs', user.uid, 'entries');
    const logsQuery = query(logsColRef, orderBy('timestamp', 'desc'), limit(200));
    const unsubLogs = onSnapshot(logsQuery, (snap) => {
      const fetchedLogs: HourlyLog[] = [];
      snap.forEach(doc => {
        fetchedLogs.push(doc.data() as HourlyLog);
      });
      // We merge with potential optimistic updates if the listener hasn't caught up
      setLogs(fetchedLogs);
    });

    return () => {
      unsubUser();
      unsubLogs();
    };
  }, [user, db, isMock]);

  const updateBucketName = async (id: string, name: string) => {
    const newBuckets = buckets.map(b => b.id === id ? { ...b, name } : b);
    setBuckets(newBuckets);
    if (!isMock && user) {
      await setDoc(doc(db, 'users', user.uid), { buckets: newBuckets }, { merge: true });
    } else if (user) {
      localStorage.setItem(`buckets_${user.uid}`, JSON.stringify(newBuckets));
    }
  };

  const updateGoals = async (goals: Record<string, number>) => {
    const newBuckets = buckets.map(b => ({ ...b, goalPercent: goals[b.id] || b.goalPercent }));
    setBuckets(newBuckets);
    if (!isMock && user) {
      await setDoc(doc(db, 'users', user.uid), { buckets: newBuckets }, { merge: true });
    } else if (user) {
      localStorage.setItem(`buckets_${user.uid}`, JSON.stringify(newBuckets));
    }
  };

  const addLog = async (logData: Omit<HourlyLog, 'id' | 'timestamp'>, hourDate: Date) => {
    const id = hourDate.toISOString();
    const newLog: HourlyLog = {
      ...logData,
      id,
      timestamp: hourDate.getTime(),
    };

    // Optimistic Update
    setLogs(prev => [...prev.filter(l => l.id !== id), newLog]);

    if (!isMock && user) {
      await setDoc(doc(db, 'logs', user.uid, 'entries', id), newLog);
    } else if (user) {
       localStorage.setItem(`logs_${user.uid}`, JSON.stringify([...logs.filter(l => l.id !== id), newLog]));
    }
  };

  const skipLog = async (hourDate: Date) => {
    const id = hourDate.toISOString();
    const skippedLog: HourlyLog = {
      id,
      timestamp: hourDate.getTime(),
      buckets: {},
      mood: 'medium',
      status: 'ignored'
    };
    
    // Optimistic Update
    setLogs(prev => [...prev.filter(l => l.id !== id), skippedLog]);

    if (!isMock && user) {
      await setDoc(doc(db, 'logs', user.uid, 'entries', id), skippedLog);
    } else if (user) {
       localStorage.setItem(`logs_${user.uid}`, JSON.stringify([...logs.filter(l => l.id !== id), skippedLog]));
    }
  };

  const deleteLog = async (id: string) => {
    // Optimistic Update
    setLogs(prev => prev.filter(l => l.id !== id));

    if (!isMock && user) {
      // Physically delete or mark as deleted? Mark as deleted is safer for sync
      await setDoc(doc(db, 'logs', user.uid, 'entries', id), { status: 'deleted' } as any, { merge: true });
    } else if (user) {
      localStorage.setItem(`logs_${user.uid}`, JSON.stringify(logs.filter(l => l.id !== id)));
    }
  };

  const updateSchedule = async (newSchedule: Partial<AppDataContextType['schedule']>) => {
    const updated = { ...schedule, ...newSchedule };
    setSchedule(updated);
    if (!isMock && user) {
      await setDoc(doc(db, 'users', user.uid), { schedule: updated }, { merge: true });
    } else if (user) {
      localStorage.setItem(`schedule_${user.uid}`, JSON.stringify(updated));
    }
  };

  const getMissedHours = useCallback(() => {
    const now = new Date();
    const missed: Date[] = [];
    
    const currentHour = now.getHours();
    const startHour = Math.max(schedule.startHour, 5); 
    // We only want finished hours. If it's 10:15 AM, the 10:00 AM hour isn't finished yet.
    // So h goes from startHour up to currentHour - 1.
    const endHour = Math.min(currentHour - 1, schedule.endHour);

    if (!schedule.activeDays[now.getDay()]) return [];

    for (let h = startHour; h <= endHour; h++) {
      const d = new Date(now);
      d.setHours(h, 0, 0, 0);
      
      const log = logs.find(l => {
        const logDate = new Date(l.timestamp);
        return logDate.getHours() === h && 
               logDate.getDate() === now.getDate() &&
               logDate.getMonth() === now.getMonth();
      });

      const isMissing = !log || log.status === 'missed';
      const isIgnored = log?.status === 'ignored' || log?.status === 'deleted';

      if (isMissing && !isIgnored) missed.push(d);
    }
    return missed;
  }, [logs, schedule]);

  const getIgnoredHours = useCallback(() => {
    const now = new Date();
    return logs
      .filter(l => l.status === 'ignored' && new Date(l.timestamp).getDate() === now.getDate())
      .map(l => new Date(l.timestamp))
      .sort((a, b) => b.getTime() - a.getTime());
  }, [logs]);

  const updateReportConfig = async (config: Partial<AppDataContextType['reportConfig']>) => {
    const newConfig = { ...reportConfig, ...config };
    setReportConfig(newConfig);
    if (!isMock && user) {
      await setDoc(doc(db, 'users', user.uid), { reportConfig: newConfig }, { merge: true });
    } else if (user) {
      localStorage.setItem(`reportConfig_${user.uid}`, JSON.stringify(newConfig));
    }
  };

  return (
    <AppDataContext.Provider value={{ 
      buckets, 
      logs, 
      updateBucketName, 
      updateGoals, 
      addLog, 
      skipLog,
      deleteLog,
      getMissedHours, 
      getIgnoredHours,
      reportConfig, 
      updateReportConfig,
      schedule,
      updateSchedule
    }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) throw new Error("useAppData must be used within AppDataProvider");
  return context;
};
