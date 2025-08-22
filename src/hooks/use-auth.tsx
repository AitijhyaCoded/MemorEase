
'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, pass: string) => Promise<any>;
  signIn: (email: string, pass: string) => Promise<any>;
  signOut: () => Promise<any>;
  googleSignIn: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const idToken = await user.getIdToken();
        document.cookie = `firebaseIdToken=${idToken}; path=/; max-age=3600`;
      } else {
        document.cookie = 'firebaseIdToken=; path=/; max-age=-1';
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login';
    
    if (user && isAuthPage) {
      router.replace('/');
    } else if (!user && !isAuthPage) {
      router.replace('/login');
    }
  }, [user, loading, pathname, router]);

  const signUp = (email: string, pass: string) => {
    return createUserWithEmailAndPassword(auth, email, pass);
  };
  
  const signIn = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };

  const googleSignIn = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const signOut = () => {
    return firebaseSignOut(auth);
  };

  const value = { user, loading, signUp, signIn, signOut, googleSignIn };

  if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
        </div>
      );
  }
  
  const isAuthPage = pathname === '/login';
  if ((!user && !isAuthPage) || (user && isAuthPage)) {
    // While redirecting, don't render children to avoid flicker
    return null;
  }
  
  return (
    <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
