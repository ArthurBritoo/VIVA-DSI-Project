import * as admin from "firebase-admin";

export const fetchUserData = async (db: admin.firestore.Firestore, uid: string) => {
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) {
      return userDoc.data();
    } else {
      console.warn('Usuário não encontrado no Firestore (backend)');
      return null;
    }
  } catch (error) {
    console.error('Erro ao buscar dados do usuário (backend):', error);
    throw error;
  }
};
