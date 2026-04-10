import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';

// Dummy config for demo purposes
const dummyFirebaseConfig = {
  apiKey: "mock-api-key",
  authDomain: "ontask-mock.firebaseapp.com",
  projectId: "ontask-mock",
  storageBucket: "ontask-mock.appspot.com",
  messagingSenderId: "mock-id",
  appId: "mock-app-id"
};

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  isMock: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  db: any; // Firestore instance
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(true);

  // Attempt to initialize Firebase with real config if provided in env
  const firebaseConfig = import.meta.env.VITE_FIREBASE_API_KEY 
    ? {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      }
    : dummyFirebaseConfig;

  let app;
  let auth: any;
  let db: any;

  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    auth = getAuth(app);
    db = getFirestore(app);
    
    // If it's the dummy config, we'll stay in "mock" mode for Auth
    if (firebaseConfig.apiKey === "mock-api-key") {
      setIsMock(true);
    } else {
      setIsMock(false);
    }
  } catch (err) {
    console.error("Firebase init error:", err);
    setIsMock(true);
  }

  useEffect(() => {
    if (isMock) {
      // Mock user for immediate demo
      setUser({
        uid: 'mock-user-123',
        displayName: 'Demo User',
        email: 'demo@ontask.app',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
      } as any);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [isMock, auth]);

  const login = async () => {
    if (isMock) {
      alert("This is a demo. Providing your own Firebase keys will enable real Google Login.");
      return;
    }
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    if (isMock) {
      setUser(null);
      return;
    }
    await signOut(auth);
  };

  return (
    <FirebaseContext.Provider value={{ user, loading, isMock, login, logout, db }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) throw new Error("useFirebase must be used within FirebaseProvider");
  return context;
};
