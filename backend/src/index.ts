import cors from "cors";
import express from "express";
import * as admin from "firebase-admin";
// import { db } from "./firebaseConfig"; // The 'db' here would be from the client SDK, not Admin SDK

// Import the service account key
import * as serviceAccount from "../ServiceAccountKey.json"; // Updated path to look in the parent directory

// Import the AnuncioController functions
import { createAnuncio, deleteAnuncio, getAnuncioById, getAnuncios, getAnunciosByUserId, updateAnuncio } from "./controllers/AnuncioController";
// Import UserController functions
import { fetchUserData } from "./controllers/UserController";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

// RESTful API for Anuncios

// Create a new anuncio
app.post("/anuncios", async (req, res) => {
  try {
    const { anuncioData, userId } = req.body;
    if (!anuncioData || !userId) {
      return res.status(400).send({ message: "Missing anuncioData or userId" });
    }
    // createAnuncio now uses admin.firestore() directly from the initialized admin app
    const newAnuncio = await createAnuncio(anuncioData, userId);
    res.status(201).send(newAnuncio);
  } catch (error) {
    console.error("Error creating anuncio:", error);
    res.status(500).send({ message: "Error creating anuncio", error: error instanceof Error ? error.message : String(error) });
  }
});

// Get all anuncios
app.get("/anuncios", async (req, res) => {
  try {
    const anuncios = await getAnuncios();
    res.status(200).send(anuncios);
  } catch (error) {
    console.error("Error getting anuncios:", error);
    res.status(500).send({ message: "Error getting anuncios", error: error instanceof Error ? error.message : String(error) });
  }
});

// Get a specific anuncio by ID
app.get("/anuncios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const anuncio = await getAnuncioById(id);
    if (anuncio) {
      res.status(200).send(anuncio);
    } else {
      res.status(404).send({ message: "Anuncio not found" });
    }
  } catch (error) {
    console.error("Error getting anuncio by ID:", error);
    res.status(500).send({ message: "Error getting anuncio by ID", error: error instanceof Error ? error.message : String(error) });
  }
});

// Update an anuncio
app.put("/anuncios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    if (!updatedData) {
      return res.status(400).send({ message: "Missing updatedData" });
    }
    await updateAnuncio(id, updatedData);
    res.status(200).send({ message: "Anuncio updated successfully" });
  } catch (error) {
    console.error("Error updating anuncio:", error);
    res.status(500).send({ message: "Error updating anuncio", error: error instanceof Error ? error.message : String(error) });
  }
});

// Delete an anuncio
app.delete("/anuncios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await deleteAnuncio(id);
    res.status(200).send({ message: "Anuncio deleted successfully" });
  } catch (error) {
    console.error("Error deleting anuncio:", error);
    res.status(500).send({ message: "Error deleting anuncio", error: error instanceof Error ? error.message : String(error) });
  }
});

// Get anuncios by user ID
app.get("/anuncios/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const anuncios = await getAnunciosByUserId(userId);
    res.status(200).send(anuncios);
  } catch (error) {
    console.error("Error getting anuncios by user ID:", error);
    res.status(500).send({ message: "Error getting anuncios by user ID", error: error instanceof Error ? error.message : String(error) });
  }
});

// RESTful API for User

// Get user data by UID
app.get("/users/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const userData = await fetchUserData(uid);
    if (userData) {
      res.status(200).send(userData);
    } else {
      res.status(404).send({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error getting user data:", error);
    res.status(500).send({ message: "Error getting user data", error: error instanceof Error ? error.message : String(error) });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
