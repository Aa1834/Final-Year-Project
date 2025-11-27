//import { initializeApp, getApps } from 'firebase/app';
//import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
//import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, setPersistence, browserLocalPersistence, onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
import { getFirestore, doc, setDoc, serverTimestamp, getDoc } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyCN14GSnNLm6-pz_OuWcXwlnTxJTIgMMB4",
  authDomain: "myfyp-3ca9f.firebaseapp.com",
  projectId: "myfyp-3ca9f",
  storageBucket: "myfyp-3ca9f.firebasestorage.app",
  messagingSenderId: "484227441258",
  appId: "1:484227441258:web:137c2c3b29dd61bb74e013",
  measurementId: "G-H1T0SEVZKV"
};

// Safe initialize
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized:', app.options?.projectId);
} else {
  app = getApps()[0];
  console.log('Firebase reused:', app.options?.projectId);
}
// get services
const auth = getAuth(app);
const db = getFirestore(app);



setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Logged in for multiple pages use.");
  })
  .catch((err) => {
    const errorCode = err.code;
    const errorMessage = err.message;
    console.log(`${errorCode} : ${errorMessage}`);
  });

/*export function getUserProfile(){
  onAuthStateChanged(auth, async (user) => {
    if (user){

      const fetchDocument = await getDoc(doc(db,'users',user.uid));
      if (!fetchDocument.exists){
        console.log('No users document found');
        return;
      } 
      else{
        const data = fetchDocument.data()
        const fetchedEmail = data.email;
        const fetchedUid = data.uid;
        const fetchedRole = data.role;

        console.log("UID:", fetchedUid);
        console.log("Email:", fetchedEmail);
        console.log("Role:", fetchedRole); 
      }

    }
  });
} */

export function getUserProfile(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback({ user: null, role: null, profile: null });
      return;
    }
    const document = await getDoc(doc(db,'users',user.uid));
    const profile = document.exists() ? document.data() : null;
    const role = profile?.role || null;
    
    callback({ user, role, profile });
  });
}

const registerForm = document.querySelector('#registering');  
const username = document.querySelector('#username');         
const password = document.querySelector('#password');        
const registerButton = document.querySelector('#registerButton'); 
const userRole = document.querySelector('#role');


// Quick check: make sure they exist (helps debug)
if (!registerForm) console.warn('#registering form not found');
if (!username) console.warn('#username input not found');
if (!password) console.warn('#password input not found');


if (registerForm) registerForm.addEventListener('submit', registerUser);
console.log("ATTACHING LISTENER:", registerForm);


// The actual handler reads values from the elements using .value
async function registerUser(e) {
  e.preventDefault(); // stop the form from doing a normal GET submit

  
  const userEmail = username?.value?.trim() || '';
  const userPassword = password?.value || '';
  const userRoleValue = userRole?.value || '';

  if (!userEmail || !userPassword || !userRoleValue) {
    alert('Please enter email, password and select an account type.');
    return;
  }

  try {
    
    const userCredential = await createUserWithEmailAndPassword(auth, userEmail, userPassword);
    const user = userCredential.user;
    console.log('User created uid:', user.uid);
    console.log('Role:', userRoleValue);

    // write profile to Firestore (do NOT store password)
    console.log('Attempting to write profile to Firestore for uid:', user.uid, 'role:', userRoleValue);
    try {
      // Use merge:true so we do not accidentally overwrite an existing doc
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: userRoleValue,
        createdAt: serverTimestamp()
      }, { merge: true });
      console.log('setDoc (merge) succeeded for uid:', user.uid);
      // Also write to a separate test collection so we can confirm the client
      // write reached Firestore and wasn't immediately overwritten by server code.
      try {
        await setDoc(doc(db, 'user_tests', user.uid), {
          email: user.email,
          role: userRoleValue,
          createdAt: serverTimestamp()
        });
        console.log('test write to `user_tests` succeeded for uid:', user.uid);
      } catch (testErr) {
        console.error('test write to `user_tests` failed:', testErr);
      }
    } catch (writeErr) {
      console.error('setDoc failed:', writeErr);
      alert('Failed to save profile to Firestore: ' + (writeErr?.message || writeErr));
      return;
    }

    // Read back the document to confirm the saved data
    try {
      const savedDoc = await getDoc(doc(db, 'users', user.uid));
      console.log('Saved `users` doc data:', savedDoc.exists() ? savedDoc.data() : null);
    } catch (readErr) {
      console.error('getDoc failed for `users` doc:', readErr);
    }

    // Read back the test document we wrote so we can confirm the client write
    try {
      const testDoc = await getDoc(doc(db, 'user_tests', user.uid));
      console.log('Saved `user_tests` doc data:', testDoc.exists() ? testDoc.data() : null);
    } catch (readErr) {
      console.error('getDoc failed for `user_tests` doc:', readErr);
    }

    alert('Account created successfully!');
    registerForm.reset();
  } 
  
  
  catch (err) {
    console.error('Signup error:', err);
    alert('Signup failed: ' + (err?.message || err));
  }
}


const usernameLogin = document.querySelector('#loginEmail');
const passwordLogin = document.querySelector('#loginPassword');
const loginForm = document.querySelector('#loginForm');

// Sign in and return a clear result object so callers can act on success/failure
export async function signInUser(e) {
  e.preventDefault();

  const userEmail = usernameLogin?.value?.trim() || '';
  const userPassword = passwordLogin?.value || '';

  if (!userEmail || !userPassword) {
    return { success: false, code: 'missing-credentials', message: 'Email and password required' };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, userEmail, userPassword);
    const user = userCredential.user;
    console.log('Signed in uid:', user.uid);

    // Optionally read user profile (role) from Firestore
    let profile = null;
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      profile = snap.exists() ? snap.data() : null;
      console.log('Profile after sign-in:', profile);
    } catch (readErr) {
      console.warn('Failed to read profile after sign-in:', readErr);
    }

    return { success: true, user, profile };
  } catch (err) {
    console.error('Sign-in error:', err);
    return { success: false, error: err, code: err?.code || null, message: err?.message || String(err) };
  }
}