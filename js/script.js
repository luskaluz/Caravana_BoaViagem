import { auth } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const mostrarFormulario = (formulario) => {
  document.getElementById("form-cadastro").style.display = "none";
  document.getElementById("form-login").style.display = "none";
  document.getElementById(`form-${formulario}`).style.display = "flex";
};

const atualizarInterface = async (usuario) => {
  const divInfoUsuario = document.getElementById("info-usuario");
  const nomeUsuarioSpan = document.getElementById("nome-usuario");
  const emailUsuarioSpan = document.getElementById("email-usuario");
  const divBotoes = document.querySelector(".botoes");
  const formularioCadastro = document.getElementById("form-cadastro");
  const formularioLogin = document.getElementById("form-login");

  if (usuario) {
    try {
      const resposta = await fetch(`/user/${usuario.uid}`);
      const dados = await resposta.json();

      if (resposta.ok) {
        nomeUsuarioSpan.textContent = dados.nome; 
      } else {
        nomeUsuarioSpan.textContent = "Usuário sem nome cadastrado.";
      }

      emailUsuarioSpan.textContent = usuario.email;
      divInfoUsuario.style.display = "block";
      divBotoes.style.display = "none";
      formularioCadastro.style.display = "none";
      formularioLogin.style.display = "none";
    } catch (error) {
      console.error("Erro ao buscar informações do usuário:", error);
      alert("Erro ao carregar informações do usuário.");
    }
  } else {
    divInfoUsuario.style.display = "none";
    divBotoes.style.display = "";
    formularioCadastro.style.display = "flex";
    formularioLogin.style.display = "none";
  }
};


onAuthStateChanged(auth, (usuario) => {
  atualizarInterface(usuario);
});

//cadastros
const cadastrar = async () => {
  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const telefone = document.getElementById("telefone").value;
  const idade = document.getElementById("idade").value;

  console.log("Dados de cadastro:", { nome, email, senha, telefone, idade });

  try {
    const resposta = await fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nome, email, senha, telefone, idade }),
    });

    const dados = await resposta.json();
    if (resposta.ok) {
      alert("Usuário registrado com sucesso!");
      const usuarioCredential = await signInWithEmailAndPassword(auth, email, senha);
      const usuario = usuarioCredential.user;
      atualizarInterface(usuario);
    } else {
      alert("Erro ao registrar: " + dados.error);  
    }
  } catch (error) {
    console.error("Erro ao registrar:", error);
    alert("Erro ao registrar: " + error.message);
  }
};

// login
const login = async () => {
  const email = document.getElementById("loginEmail").value;
  const senha = document.getElementById("loginSenha").value;

  try {
    const usuarioCredential = await signInWithEmailAndPassword(auth, email, senha);
    const usuario = usuarioCredential.user;

    alert("Login bem-sucedido!");
    atualizarInterface(usuario);
  } catch (error) {
    alert("Erro ao fazer login: " + error.message);
  }
};

const logout = async () => {
  try {
    await signOut(auth);
    alert("Usuário deslogado!");
    atualizarInterface(null);
  } catch (error) {
    alert("Erro ao fazer logout: " + error.message);
  }
};

// aperta botoes
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("botao-cadastro").addEventListener("click", cadastrar);
  document.getElementById("botao-login").addEventListener("click", login);
  document.getElementById("botao-logout").addEventListener("click", logout);

  document.getElementById("mostrar-cadastro").addEventListener("click", () => mostrarFormulario("cadastro"));
  document.getElementById("mostrar-login").addEventListener("click", () => mostrarFormulario("login"));
});
