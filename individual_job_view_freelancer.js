import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
import { getFirestore, doc, getDoc, collection, getDocs, query, where,updateDoc,documentId} from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js';


const firebaseConfig = {
    apiKey: "AIzaSyCN14GSnNLm6-pz_OuWcXwlnTxJTIgMMB4",
    authDomain: "myfyp-3ca9f.firebaseapp.com",
    projectId: "myfyp-3ca9f",
    storageBucket: "myfyp-3ca9f.firebasestorage.app",
    messagingSenderId: "484227441258",
    appId: "1:484227441258:web:137c2c3b29dd61bb74e013",
    measurementId: "G-H1T0SEVZKV"
};

let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

const auth = getAuth(app);
const db = getFirestore(app);


let freelancerUid = "";
const jobIds = [];

onAuthStateChanged(auth, async function (user) {
  if (!user) {
    console.log("You are not signed in");
    return;
  }

  freelancerUid = user.uid;
});

