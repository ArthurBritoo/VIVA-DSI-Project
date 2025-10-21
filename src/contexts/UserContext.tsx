import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../assets/firebaseConfig';
import { onAuthStateChanged, User as FirebaseAuthUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

type UserProfile = {
  uid: string;
  email: string;
  nome: string;
  telefone?: string;
  foto?: string;
  idToken?: string; // Add idToken to UserProfile
};

type UserContextType = {
  currentUser: UserProfile | null;
  loadingUser: boolean;
  setCurrentUser: (user: UserProfile | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Firebase user:', firebaseUser);
      if (firebaseUser) {
        const idToken = await firebaseUser.getIdToken(); // Get the ID token
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('User data from Firestore:', userData);
          setCurrentUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            nome: userData.nome || firebaseUser.email?.split('@')[0] || '',
            telefone: userData.telefone || undefined,
            idToken: idToken, // Store the ID token
          });
        } else {
          console.warn('No user profile found in Firestore');
          setCurrentUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            nome: firebaseUser.email?.split('@')[0] || '',
            idToken: idToken, // Store the ID token even if no profile in Firestore
          });
        }
      } else {
        console.log('User signed out');
        setCurrentUser(null);
      }
      setLoadingUser(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, loadingUser, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUserContext must be used within a UserProvider');
  return context;
};
