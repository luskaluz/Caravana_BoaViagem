require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const firebaseAdmin = require("firebase-admin");
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

app.use(express.static(path.join(__dirname, "../")));

const validarDadosCadastro = (nome, email, senha, telefone, idade) => {
  if (!nome || !email || !senha || !telefone || !idade) {
    return "Todos os campos são obrigatórios.";
  }

  const regexTelefone = /^\(?\d{2}\)?\s?\d{4,5}[-\s]?\d{4}$/;
  if (!regexTelefone.test(telefone)) {
    return "Telefone inválido. Use o formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX.";
  }

  if (senha.length < 6) {
    return "A senha deve ter pelo menos 6 caracteres.";
  }

  //trocar de acordo com o termo de uso dps
  if (idade <= 18) {
    return "Você deve ser um adulto para realizar o cadastro.";
  }

  return null;
};

// Cadastro
app.post("/register", async (req, res) => {
  const { nome, email, senha, telefone, idade } = req.body;

  const erroValidacao = validarDadosCadastro(nome, email, senha, telefone, idade);
  if (erroValidacao) {
    return res.status(400).json({ error: erroValidacao });
  }

  try {
    const userRecord = await auth.createUser({
      email,
      password: senha,
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

// busca no banco de dados
app.get("/user/:uid", async (req, res) => {
  const { uid } = req.params;

  try {
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    res.status(200).json(userDoc.data());
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
    res.status(500).json({ error: "Erro ao buscar informações do usuário." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta: ${PORT}`);
});
