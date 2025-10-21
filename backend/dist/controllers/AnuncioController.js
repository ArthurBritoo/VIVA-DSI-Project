"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnunciosByUserId = exports.deleteAnuncio = exports.updateAnuncio = exports.getAnuncioById = exports.getAnuncios = exports.createAnuncio = void 0;
// Functions now accept 'db' as an argument
// criar novo anuncio
const createAnuncio = async (db, anuncioData, userId) => {
    try {
        const anunciosCollectionRef = db.collection("anuncio");
        const newAnuncio = {
            ...anuncioData,
            userId: userId,
            createdAt: new Date(),
        };
        const docRef = await anunciosCollectionRef.add(newAnuncio);
        return { id: docRef.id, ...newAnuncio };
    }
    catch (error) {
        console.error("Error creating anuncio: ", error);
        throw error;
    }
};
exports.createAnuncio = createAnuncio;
// obter todos anuncios
const getAnuncios = async (db) => {
    try {
        const anunciosCollectionRef = db.collection("anuncio");
        const querySnapshot = await anunciosCollectionRef.get();
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }
    catch (error) {
        console.error("Error getting anuncios: ", error);
        throw error;
    }
};
exports.getAnuncios = getAnuncios;
//obter anuncio especifico
const getAnuncioById = async (db, id) => {
    try {
        console.log("Attempting to fetch anuncio with ID:", id);
        const docRef = db.collection("anuncio").doc(id);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            console.log("Anuncio found!");
            return { id: docSnap.id, ...docSnap.data() };
        }
        else {
            console.log("No such document in Firestore for ID:", id);
            return null;
        }
    }
    catch (error) {
        console.error("Error getting anuncio by ID: ", error);
        throw error;
    }
};
exports.getAnuncioById = getAnuncioById;
// atualizar anuncio
const updateAnuncio = async (db, id, updatedData) => {
    try {
        const anuncioRef = db.collection("anuncio").doc(id);
        await anuncioRef.update(updatedData);
    }
    catch (error) {
        console.error("Error updating anuncio: ", error);
        throw error;
    }
};
exports.updateAnuncio = updateAnuncio;
const deleteAnuncio = async (db, id) => {
    try {
        const anuncioRef = db.collection("anuncio").doc(id);
        await anuncioRef.delete();
    }
    catch (error) {
        console.error("Error deleting anuncio: ", error);
        throw error;
    }
};
exports.deleteAnuncio = deleteAnuncio;
// obter anúncios de um usuário específico
const getAnunciosByUserId = async (db, userId) => {
    try {
        const anunciosCollectionRef = db.collection("anuncio");
        const querySnapshot = await anunciosCollectionRef.where("userId", "==", userId).get();
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }
    catch (error) {
        console.error("Error getting anuncios by user ID: ", error);
        throw error;
    }
};
exports.getAnunciosByUserId = getAnunciosByUserId;
