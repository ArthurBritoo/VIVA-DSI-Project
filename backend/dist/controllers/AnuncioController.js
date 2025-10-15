"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnunciosByUserId = exports.deleteAnuncio = exports.updateAnuncio = exports.getAnuncioById = exports.getAnuncios = exports.createAnuncio = void 0;
const firebaseConfig_1 = require("../firebaseConfig");
const firestore_1 = require("firebase/firestore");
const anunciosCollectionRef = (0, firestore_1.collection)(firebaseConfig_1.db, "anuncio");
// criar novo anuncio
const createAnuncio = async (anuncioData, userId) => {
    try {
        const newAnuncio = {
            ...anuncioData,
            userId: userId,
            createdAt: new Date(),
        };
        const docRef = await (0, firestore_1.addDoc)(anunciosCollectionRef, newAnuncio);
        return { id: docRef.id, ...newAnuncio };
    }
    catch (error) {
        console.error("Error creating anuncio: ", error);
        throw error;
    }
};
exports.createAnuncio = createAnuncio;
// obter todos anuncios
const getAnuncios = async () => {
    try {
        const querySnapshot = await (0, firestore_1.getDocs)(anunciosCollectionRef);
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
const getAnuncioById = async (id) => {
    try {
        const docRef = (0, firestore_1.doc)(firebaseConfig_1.db, "anuncios", id);
        const docSnap = await (0, firestore_1.getDoc)(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        else {
            console.log("No such document!");
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
const updateAnuncio = async (id, updatedData) => {
    try {
        const anuncioRef = (0, firestore_1.doc)(firebaseConfig_1.db, "anuncios", id);
        await (0, firestore_1.updateDoc)(anuncioRef, updatedData);
    }
    catch (error) {
        console.error("Error updating anuncio: ", error);
        throw error;
    }
};
exports.updateAnuncio = updateAnuncio;
const deleteAnuncio = async (id) => {
    try {
        const anuncioRef = (0, firestore_1.doc)(firebaseConfig_1.db, "anuncios", id);
        await (0, firestore_1.deleteDoc)(anuncioRef);
    }
    catch (error) {
        console.error("Error deleting anuncio: ", error);
        throw error;
    }
};
exports.deleteAnuncio = deleteAnuncio;
// obter anúncios de um usuário específico
const getAnunciosByUserId = async (userId) => {
    try {
        const q = (0, firestore_1.query)(anunciosCollectionRef, (0, firestore_1.where)("userId", "==", userId));
        const querySnapshot = await (0, firestore_1.getDocs)(q);
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
