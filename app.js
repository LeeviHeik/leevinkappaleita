// Firebase-moduulit
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

// Alustukset
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// HTML-elementit
const googleSignInBtn = document.getElementById("google-signin");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const usernameInput = document.getElementById("username");
const emailSignInBtn = document.getElementById("email-signin");
const emailRegisterBtn = document.getElementById("email-register");
const voteBtn = document.getElementById("vote-btn");
const voteCountEl = document.getElementById("vote-count");

// Google-kirjautuminen
googleSignInBtn.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Tarkistetaan, onko käyttäjä jo Firestoressa
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists() || !userSnap.data().username) {
      // --- TÄHÄN LISÄTÄÄN KÄYTTÄJÄNIMEN KYSYMINEN JA TALLENNUS ---
      let username = prompt("Anna käyttäjänimesi:");
const usernameRegex = /^[A-Za-z]+$/;

if (!username || !usernameRegex.test(username)) {
  // Poistetaan kaikki ei-aakkoset displayNamesta, jos mahdollista
  username = (user.displayName?.replace(/[^A-Za-z]/g, "") || "Kayttaja" + Math.floor(Math.random() * 1000));
  
  // Varmistetaan ettei tyhjä jää
  if (username.length === 0) {
    username = "Kayttaja" + Math.floor(Math.random() * 1000);
  }
} else {
  username = username.trim();
}


      await setDoc(userRef, {
  email: user.email,
  displayName: user.displayName || null,
  username: username,
  createdAt: new Date()
}, { merge: true });
    }

    alert("Kirjautunut Googlella: " + (user.displayName || user.email));
  } catch (error) {
    alert("Google-kirjautumisvirhe: " + error.message);
  }
});

// Sähköpostilla rekisteröityminen
emailRegisterBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  createUserWithEmailAndPassword(auth, email, password)
  .then(async userCredential => {
    const user = userCredential.user;
    const username = usernameInput.value.trim();
const usernameRegex = /^[A-Za-z]+$/;

if (!username) {
  alert("Anna käyttäjänimi.");
  return;
}

if (!usernameRegex.test(username)) {
  alert("Käyttäjänimi saa sisältää vain isoja ja pieniä kirjaimia (A-Z, a-z).");
  return;
}

    // Tallennetaan käyttäjän sähköposti ja käyttäjänimi Firestoreen
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      username: username,
      createdAt: new Date()
    });

    alert("Rekisteröityminen onnistui: " + user.email + " Käyttäjänimi: " + username);
  })

});

// Sähköpostilla kirjautuminen
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

// Kirjautumistilan kuuntelu (UI:n päivitykseen)
onAuthStateChanged(auth, async user => {
  if (user) {
    console.log("Käyttäjä kirjautunut:", user.displayName || user.email);
    voteBtn.style.display = "inline-block";

    const docRef = doc(db, "votes", "main");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      voteCountEl.textContent = docSnap.data().count || 0;
    } else {
      await setDoc(docRef, { count: 0, users: [] });
      voteCountEl.textContent = "0";
    }
  } else {
    console.log("Ei kirjautunutta käyttäjää");
    voteBtn.style.display = "none";
    voteCountEl.textContent = "";
  }
});

// Äänestäminen
voteBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const docRef = doc(db, "votes", "main");
  const docSnap = await getDoc(docRef);
  const data = docSnap.data();
  const hasVoted = data.users.some(u => u.uid === user.uid);

  if (!hasVoted) {
    await updateDoc(docRef, {
      count: increment(1),
      users: [...data.users, { uid: user.uid, email: user.email }]
    });

    voteCountEl.textContent = data.count + 1;
    alert("Painoit nappia! Kiitos hyvästä teosta!");
  } else {
    alert("Eipäs nyt enempää painella! Saatanan kusipää!");
  }
});
