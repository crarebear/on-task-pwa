import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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
  isPermitted: boolean | null; // null while checking
  login: () => Promise<void>;
  logout: () => Promise<void>;
  db: any; // Firestore instance
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPermitted, setIsPermitted] = useState<boolean | null>(null);
  const [isMock] = useState(() => 
    !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY === "mock-api-key"
  );
  
  const { auth, db } = React.useMemo(() => {
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
    try {
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApps()[0];
      }
      return { 
        auth: getAuth(app), 
        db: getFirestore(app) 
      };
    } catch (err) {
      console.error("Firebase init error:", err);
      return { auth: null as any, db: null as any };
    }
  }, []);

  useEffect(() => {
    if (isMock) {
      setUser({
        uid: 'mock-user-123',
        displayName: 'Demo User',
        email: 'demo@ontask.app',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
      } as any);
      setIsPermitted(true);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      
      if (u && u.email) {
        // PERMITTED CHECK - Decoupled from core loading to prevent splash hang
        setLoading(false); // Let the app render while we check permissions
        
        try {
          const whitelistRef = doc(db, 'whitelist', u.email.toLowerCase());
          const snap = await getDoc(whitelistRef);
          setIsPermitted(snap.exists());
        } catch (err) {
          console.error("Whitelist check error:", err);
          setIsPermitted(false);
        }
      } else {
        setIsPermitted(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [isMock, auth, db]);

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
    <FirebaseContext.Provider value={{ user, loading, isMock, isPermitted, login, logout, db }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) throw new Error("useFirebase must be used within FirebaseProvider");
  return context;
};
