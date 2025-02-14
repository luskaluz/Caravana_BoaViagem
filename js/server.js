// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Load Firebase credentials from .env file
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Middleware to parse JSON and handle CORS
app.use(bodyParser.json());
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Route to serve the home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Route to register users
app.post("/register", async (req, res) => {
    const { name, email, password, phone, age } = req.body;
    try {
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: name,
            phoneNumber: phone,
        });

        // Save user data to Firestore
        await db.collection("users").doc(userRecord.uid).set({
            name,
            email,
            phone,
            age,
        });

        res.status(200).json({ message: "Usuário registrado com sucesso!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
