import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "",
    authDomain: "projeto-caravana.firebaseapp.com",
    projectId: "projeto-caravana",
    storageBucket: "projeto-caravana.firebasestorage.app",
    messagingSenderId: "109406579691",
    appId: "1:109406579691:web:fb554cb4a7663781c787ae",
    measurementId: "G-33W1PLKYV3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const showForm = (form) => {
    document.getElementById("register-form").style.display = "none";
    document.getElementById("login-form").style.display = "none";

    document.getElementById(`${form}-form`).style.display = "block";
};

const formatPhone = (phone) => {
    phone = phone.replace(/\D/g, ""); // Remove tudo que não for número
    if (phone.length === 11 && !phone.startsWith("55")) {
        phone = `+55${phone}`;
    }
    return phone;
};

const register = async () => {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    let phone = document.getElementById("phone").value;
    const age = document.getElementById("age").value;

    phone = formatPhone(phone); 

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: name });

        await setDoc(doc(db, "users", user.uid), {
            name,
            email,
            phone,
            age
        });

        alert("Usuário registrado com sucesso!");
    } catch (error) {
        alert("Erro ao registrar usuário: " + error.message);
    }
};

const login = async () => {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        alert(`Bem-vindo(a), ${user.displayName || 'usuário'}!`);
    } catch (error) {
        alert("Erro no login: " + error.message);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("register-btn").addEventListener("click", register);
    document.getElementById("login-btn").addEventListener("click", login);

    document.getElementById("show-register").addEventListener("click", () => showForm("register"));
    document.getElementById("show-login").addEventListener("click", () => showForm("login"));

    showForm("register");
});
