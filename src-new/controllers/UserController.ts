import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/FirebaseService';

export const fetchUserData = async (email: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', email));
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      console.warn('Usuário não encontrado no Firestore');
      return null;
    }
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    throw error;
  }
};

export const handleLogout = (setCurrentUser: (user: null) => void, navigation: any) => {
  setCurrentUser(null);
  navigation.navigate('Login');
};