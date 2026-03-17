//version 1.0
console.log('TESTING TESTING postJobClient.js starting');
import { getFirestore, doc, setDoc, serverTimestamp, getDoc, collection, addDoc, getDocs } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';

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

async function clientPostJobForm(e){
    e.preventDefault(); // Stop form submission

    const jobName = document.querySelector('#job');
    const jobDescription = document.querySelector('#summary');
    const jobCategory = document.querySelector("#gigCategory");
    const jobDuration = document.querySelector('#duration');
    const lengthOfJob = document.querySelector("#jobLength");
    const jobPay = document.querySelector('#pay');
    const jobCurrency = document.querySelector('#currency');
    const contractType = document.querySelector('input[name="contractType"]:checked');
    const jobType = document.querySelector("#typeOfJob");

    const nameOfJob = jobName?.value.trim() || '';
    const jobDetails = jobDescription?.value.trim() || '';
    const category = jobCategory?.value || '';
    const duration = jobDuration?.value || '';
    const length = Number(lengthOfJob?.value || '');
    const jobPayment = Number(jobPay?.value || '');
    const currency = jobCurrency?.value || '';
    const contract = contractType?.value || '';
    const jobArrangements = jobType?.value || '';

    const actualPayment = jobPayment/1000;

    // Get current user
    const currentUser = auth.currentUser;
    if (!currentUser) {
        console.log('You must be signed in to post a job.');
        return;
    }

    try {
        const docRef = await addDoc(collection(db, "gigs"), {
            nameOfJob,
            jobDetails,
            category,
            jobArrangements,
            jobPayment,
            duration,
            length,
            actualPayment,
            currency,
            contractType: contract,
            clientUid: currentUser.uid,
            clientEmail: currentUser.email,
            postedAt: serverTimestamp()
        });
        console.log('Job posted successfully with ID:', docRef.id);
        alert('Job posted successfully!');
        document.querySelector('form').reset();
    } catch (writeErr) {
        console.error('Failed to post job:', writeErr);
        alert('Failed to post job: ' + (writeErr?.message || writeErr));
        return;
    }
}




document.addEventListener('DOMContentLoaded', () => {
    const postJobButton = document.querySelector('#postJob');
    console.log('postJobClient.js loaded, button found:', postJobButton);

    if (postJobButton) {
        postJobButton.addEventListener('click', (e) => {
            console.log('Post Job button clicked');
            clientPostJobForm(e);
        });
    } else {
        console.error('Post job button not found!');
    }
});

const jobs = [];
export async function retrieveJobs(){
    const querySnapshot = await getDocs(collection(db,"gigs")); // retrieves the documents in gigs collection
    const container = document.querySelector('#cardsContainer'); // accesses the card container in displayJobsTest.html
    let html = '';
    querySnapshot.forEach((doc) => {
        const fields=doc.data();
        /*html +=`<my-card 
            job-title="${fields.nameOfJob}" 
            job-desc="${fields.jobDetails}"
            job-duration="${fields.length} ${fields.duration}"
            job-payment="${fields.actualPayment}"
            job-contract="${fields.contractType}">
        </my-card>`; */

        html+=`<div class = "card-body card">
                <div class = "row">
               
                    <h4 class="card-title">${fields.nameOfJob}</h4>
                    <p id ="job-description">Job Description: ${fields.jobDetails}</p>
                    <p id = "job-length">Duration: ${fields.length} ${fields.duration}</p>
                    <p id = "job-base-payment">Base Payment: $${fields.actualPayment}</p>
                    <p id = "job-contract-type">Contract Type: ${fields.contractType}</p>
                    <a href="jobBidPage.html?jobId=${doc.id}" class="btn btn-primary">Place Bid</a>
            </div>
        </div>`;

        console.log(doc.id, " => ", doc.data());
        jobs.push({
            title: fields.nameOfJob,
            description: fields.jobDetails,
            contract:fields.contractType,
            category:fields.category,
            arrangement: fields.jobArrangements,
            durationText:`${fields.length} ${fields.duration}`,
            payment:`$ ${fields.actualPayment}`
        });
    });
    container.innerHTML = html;
    console.log(jobs);
    return jobs;
}

