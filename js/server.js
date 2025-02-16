require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const firebaseAdmin = require("firebase-admin");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 5000;

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }),
});

const auth = firebaseAdmin.auth();
const db = firebaseAdmin.firestore();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "../")));

// Cadastro
app.post("/register", async (req, res) => {
  const { nome, email, senha, telefone, idade } = req.body;

  if (!nome || !email || !senha || !telefone || !idade) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }

  if (senha.length < 6) {
    return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres." });
  }

  try {
    const userRecord = await auth.createUser({
      email,
      password: senha,
      displayName: nome,
    });

    console.log("Usuário criado no Firebase Auth:", userRecord.uid);

    await db.collection("users").doc(userRecord.uid).set({
      nome,
      email,
      telefone,
      idade,
    });

    console.log("Dados salvos no Firestore:", { nome, email, telefone, idade });

    res.status(200).json({ message: "Usuário registrado com sucesso!" });

  } catch (error) {
    console.error("Erro no registro:", error);

    let errorMessage = "Erro ao registrar usuário.";

    switch (error.code) {
      case "auth/email-already-exists":
        errorMessage = "O endereço de e-mail já está em uso.";
        break;
      case "auth/invalid-email":
        errorMessage = "O endereço de e-mail é inválido.";
        break;
      default:
        console.error("Erro desconhecido:", error.message);
        errorMessage = "Ocorreu um erro inesperado no cadastro.";
    }

    res.status(400).json({ error: errorMessage });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta: ${PORT}`);
});
