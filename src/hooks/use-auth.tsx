
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
import { app, auth, db } from '@/lib/firebase';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

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
  const searchParams = useSearchParams();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idToken = await user.getIdToken();
        // This is a way to make the token available for server actions
        // There are more secure/robust ways but this is ok for a prototype
        if (typeof window !== 'undefined') {
          document.cookie = `firebaseIdToken=${idToken}; path=/; max-age=3600`;
        }
      } else {
        if (typeof window !== 'undefined') {
          document.cookie = 'firebaseIdToken=; path=/; max-age=-1';
        }
      }
      
      setUser(user);
      setLoading(false);
      
      const isAuthPage = pathname === '/login';
      
      if (user && isAuthPage) {
        router.replace('/');
      } else if (!user && !isAuthPage) {
        router.replace('/login');
      }
    });

    return () => unsubscribe();
  }, [auth, router, pathname]);

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
  
  // This logic ensures children are only rendered when auth state is resolved
  // and matches the page requirements (e.g. don't render protected page if not logged in)
  if (!loading) {
    if (user && pathname !== '/login') {
      return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
      );
    }
    if (!user && pathname === '/login') {
       return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
      );
    }
  }

  return null;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
