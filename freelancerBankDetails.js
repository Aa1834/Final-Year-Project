import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
import { getFirestore, doc,addDoc, getDoc, collection, getDocs, query, where,updateDoc,documentId} from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyCN14GSnNLm6-pz_OuWcXwlnTxJTIgMMB4",
    authDomain: "myfyp-3ca9f.firebaseapp.com",
    projectId: "myfyp-3ca9f",
    storageBucket: "myfyp-3ca9f.firebasestorage.app",
    messagingSenderId: "484227441258",
    appId: "1:484227441258:web:137c2c3b29dd61bb74e013",
    measurementId: "G-H1T0SEVZKV"
};

let app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async function (user) {
  if (!user) {
    console.log("You are not signed in");
    return;
  }
});




async function storeFreelancerBankDetails(){
    const accountName = document.querySelector("#accountHolderName"); // User input of bank account holder's name.
    const accountNumber = document.querySelector("#accountNumber"); // User input of bank account number.
    const sortCode = document.querySelector("#bankSortCode"); // User input of bank sort code.

    const bankSortCode = sortCode.value.trim();
    const bankAccountNumber = accountNumber.value.trim();
    const bankAccountName = accountName.value.trim();

    if(bankAccountName.value == "" || bankAccountNumber.value == "" || bankSortCode.value == ""){
        return;
    }
    else{    
    const user = auth.currentUser; //Getting the current user
    const userId = user.uid; // Current user id.
    // Making bankDetails subcollection inside the users collection
    await addDoc(collection(db,"users",userId,"bankDetails"),{
        accountName: accountName.value,
        accountNumber: accountNumber.value,
        sortCode: sortCode.value,
        userId: user.uid
     });
    }
    console.log("Bank information saved");
}

const grabForm = document.querySelector("#bankForm");

grabForm.addEventListener("submit", async(e)=>{
    e.preventDefault();
    storeFreelancerBankDetails;
});
