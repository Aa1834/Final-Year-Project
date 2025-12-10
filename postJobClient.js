import { getFirestore, doc, setDoc, serverTimestamp, getDoc } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js';



function clientPostJobForm(){
    jobName = document.querySelector('#nameJob');
    jobDescription = document.querySelector('#summary');
    jobDuration = document.querySelector('#duration');

    // Now need to store the user's input from the HTML form into Firebase collection

}




