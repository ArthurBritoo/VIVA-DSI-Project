import * as admin from "firebase-admin";
import path from "path";

// Caminho para seu service account
const serviceAccountPath = path.resolve(__dirname, "../../ServiceAccountKey.json");
const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}

// Função de teste
const testFirestore = async () => {
  try {
    const docRef = admin.firestore().doc('test/testDoc'); // coleção "test", documento "testDoc"
    const doc = await docRef.get();
    console.log("Documento existe?", doc.exists);
    if (doc.exists) {
      console.log("Dados do documento:", doc.data());
    }
  } catch (error) {
    console.error("Erro ao acessar Firestore:", error);
  }
};

// Chama a função de teste
testFirestore();
