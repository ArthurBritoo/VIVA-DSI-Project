import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/FirebaseService';

// fetchUserData will be moved to the backend and accessed via API.
// This file will only contain client-side logic.

export const handleLogout = (setCurrentUser: (user: null) => void, navigation: any) => {
  setCurrentUser(null);
  navigation.navigate('Login');
};
