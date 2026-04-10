import React, { createContext, useContext, useState, useEffect } from 'react';
import { useFirebase } from './FirebaseContext';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

export interface BucketConfig {
  id: string;
  name: string;
  goalPercent: number;
}

export interface HourlyLog {
  id: string; // ISO string for the hour (e.g., 2026-04-10T09:00:00)
  timestamp: number;
  buckets: Record<string, number>; // minutes spent in each bucket
  mood: 'happy' | 'medium' | 'sad';
  status: 'completed' | 'missed' | 'ignored';
}

interface AppDataContextType {
  buckets: BucketConfig[];
  logs: HourlyLog[];
  updateBucketName: (id: string, name: string) => void;
  updateGoals: (goals: Record<string, number>) => void;
  addLog: (log: Omit<HourlyLog, 'id' | 'timestamp'>, hourDate: Date) => Promise<void>;
  getMissedHours: () => Date[];
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

  // Load user settings and logs
  useEffect(() => {
    if (!user) return;

    if (isMock) {
      // Load from localStorage for mock
      const savedBuckets = localStorage.getItem(`buckets_${user.uid}`);
      const savedLogs = localStorage.getItem(`logs_${user.uid}`);
      if (savedBuckets) setBuckets(JSON.parse(savedBuckets));
      if (savedLogs) setLogs(JSON.parse(savedLogs));
      return;
    }

    // Real Firebase listeners
    const userDocRef = doc(db, 'users', user.uid);
    const unsubUser = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.buckets) setBuckets(data.buckets);
      }
    });

    // We'd typically use a collection for logs, but for simplicity we can store in a sub-collection
    // For this demo, let's just listen to recent logs
    // (In reality, you'd want a more complex query)

    return () => {
      unsubUser();
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

    const newLogs = [...logs.filter(l => l.id !== id), newLog];
    setLogs(newLogs);

    if (!isMock && user) {
      // Store in firestore: logs/{uid}/entries/{id}
      // Implementation omitted for brevity but follows the pattern
    } else if (user) {
      localStorage.setItem(`logs_${user.uid}`, JSON.stringify(newLogs));
    }
  };

  const getMissedHours = () => {
    const now = new Date();
    const missed: Date[] = [];
    
    // Check hours from 9 AM to current hour (up to 11 PM)
    const currentHour = now.getHours();
    const startHour = 9;
    const endHour = Math.min(currentHour, 23);

    for (let h = startHour; h <= endHour; h++) {
      const d = new Date(now);
      d.setHours(h, 0, 0, 0);
      
      const logExists = logs.some(l => {
        const logDate = new Date(l.timestamp);
        return logDate.getHours() === h && logDate.getDate() === now.getDate();
      });

      // Special case: if we are in the hour (e.g. 9:05 AM), 
      // we are tracking the 8-9 period, which is "Hour 9" notification.
      // So if it's 9:05, we check if Log for 9:00 was filled.
      if (!logExists) missed.push(d);
    }
    return missed;
  };

  return (
    <AppDataContext.Provider value={{ buckets, logs, updateBucketName, updateGoals, addLog, getMissedHours }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) throw new Error("useAppData must be used within AppDataProvider");
  return context;
};
