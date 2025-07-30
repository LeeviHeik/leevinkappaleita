// Tuodaan Firebase-moduulit CDN:n kautta
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
// Firebase-konfiguraatio
const firebaseConfig = {
  apiKey: "AIzaSyCnSJtyTEEtdw-nR-oB-iYcqcqypUwDNfM",
  authDomain: "leevinkappaleita.firebaseapp.com",
  projectId: "leevinkappaleita",
  storageBucket: "leevinkappaleita.appspot.com",
  messagingSenderId: "905705408103",
  appId: "1:905705408103:web:46fe5f8da410a32bce76c2"
};

// Alustetaan Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Alustetaan Firestore
const db = getFirestore(app);

// Haetaan Google-kirjautumisnappi HTML:stä
const googleSignInBtn = document.getElementById("google-signin");

googleSignInBtn.addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then(result => {
      const user = result.user;
      alert("Kirjautunut Googlella: " + user.displayName);
    })
    .catch(error => {
      alert("Google-kirjautumisvirhe: " + error.message);
    });
});

// Haetaan sähköposti- ja salasana-elementit sekä napit
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const emailSignInBtn = document.getElementById("email-signin");
const emailRegisterBtn = document.getElementById("email-register");

// Rekisteröityminen sähköpostilla ja salasanalla
emailRegisterBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      alert("Rekisteröityminen onnistui: " + userCredential.user.email);
    })
    .catch(error => {
      alert("Rekisteröitymisvirhe: " + error.message);
    });
});

// Kirjautuminen sähköpostilla ja salasanalla
emailSignInBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  signInWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      alert("Kirjautuminen onnistui: " + userCredential.user.email);
    })
    .catch(error => {
      alert("Kirjautumisvirhe: " + error.message);
    });
});

// Kirjautumistilan kuuntelu (vapaaehtoinen, UI:n päivittämiseen)
onAuthStateChanged(auth, user => {
  if (user) {
    console.log("Käyttäjä kirjautunut:", user.displayName || user.email);
  } else {
    console.log("Ei kirjautunutta käyttäjää");
  }
});

const voteBtn = document.getElementById("vote-btn");
const voteCountEl = document.getElementById("vote-count");

onAuthStateChanged(auth, async user => {
  if (user) {
    voteBtn.style.display = "inline-block";

    const docRef = doc(db, "votes", "main");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      voteCountEl.textContent = docSnap.data().count || 0;
    } else {
      await setDoc(docRef, { count: 0, users: [] });
    }
  } else {
    voteBtn.style.display = "none";
  }
});

//
voteBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const docRef = doc(db, "votes", "main");
  const docSnap = await getDoc(docRef);
  const data = docSnap.data();
  const hasVoted = data.users.includes(user.uid);

  if (!hasVoted) {
    await updateDoc(docRef, {
      count: increment(1),
      users: [...data.users, user.uid]
    });

    voteCountEl.textContent = data.count + 1;
    alert("Painoit nappia! Kiitos hyvästä teosta!");
  } else {
    alert("Eipäs nyt enempää painella!");
  }
});