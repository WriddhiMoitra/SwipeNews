import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
 // No need for GoogleSignin import as we're using expo-auth-session

interface User {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  isAnonymous: boolean;
  provider?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: async () => {},
  isLoading: true,
});

export const AuthProvider: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      const auth = getAuth();
      
      // No special handling needed for Google logout with expo-auth-session
      
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setIsLoading(true);
      
      if (firebaseUser) {
        // Determine provider
        let provider = 'email';
        if (firebaseUser.providerData.length > 0) {
          const providerId = firebaseUser.providerData[0].providerId;
          if (providerId === 'google.com') provider = 'google';
        }
        
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || (firebaseUser.isAnonymous ? 'Anonymous User' : 'User'),
          email: firebaseUser.email || 'anonymous@example.com',
          photoURL: firebaseUser.photoURL || undefined,
          isAnonymous: firebaseUser.isAnonymous,
          provider,
        });
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
