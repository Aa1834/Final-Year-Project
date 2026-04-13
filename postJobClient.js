//version 1.0
console.log('TESTING TESTING postJobClient.js starting');
import { query, where, getFirestore, doc, setDoc, serverTimestamp, getDoc, collection, addDoc, getDocs,onSnapshot } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js';
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


/*onSnapshot(collection(db,"gigs"),(snapshot)=>{
    console.log(snapshot.docs);
});*/

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

    const actualPayment = jobPayment/100;

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
            status: "Vacant",
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

/*export async function retrieveJobs() {
  const fetchGigs = await getDocs(collection(db, "gigs"));
  const container = document.querySelector("#cardsContainer");

  if (!container){
    return jobs;
  }

  let html = "";
  jobs.length = 0;

  for (const jobDoc of fetchGigs.docs) {
    const jobData = jobDoc.data();

    html += `<div class="card-body card">
              <div class="row">
                <h4 class="card-title">${jobData.nameOfJob || "Untitled Job"}</h4>
                <p id="job-description">Job Description: ${jobData.jobDetails || "-"}</p>
                <p id="job-length">Duration: ${jobData.length || "-"} ${jobData.duration || ""}</p>
                <p id="job-base-payment">Base Payment: $${jobData.actualPayment ?? "-"}</p>
                <p id="job-contract-type">Contract Type: ${jobData.contractType || "-"}</p>
                <a href="jobBidPage.html?jobId=${jobDoc.id}" class="btn btn-primary">Place Bid</a>
              </div>
            </div>`;

    jobs.push({
      title: jobData.nameOfJob,
      description: jobData.jobDetails,
      contract: jobData.contractType,
      category: jobData.category,
      arrangement: jobData.jobArrangements,
      durationText: `${jobData.length} ${jobData.duration}`,
      payment: `$ ${jobData.actualPayment}`
    });
  }

  const errorMessage =  "<p>No jobs found.</p>"
  container.innerHTML = html || errorMessage;
  return jobs;
}*/

export async function retrieveJobs() {
  //const fetchGigs = await getDocs(collection(db, "gigs"));
  const container = document.querySelector("#cardsContainer");

  if (!container){
    return jobs;
  }

  const queryFreeJobs = query(collection(db,"gigs"),where("status","==","Vacant"));


  onSnapshot(queryFreeJobs,(snapshot)=>{
    let html = "";
    for (const jobDoc of snapshot.docs) {
        const jobData = jobDoc.data();

        html += `<div class="card-body card">
                <div class="row">
                    <h4 class="card-title">${jobData.nameOfJob || "Untitled Job"}</h4>
                    <p id="job-length">Duration: ${jobData.length || "-"} ${jobData.duration || ""}</p>
                    <p id="job-base-payment">Base Payment: $${jobData.actualPayment ?? "-"}</p>
                    <p id="job-contract-type">Contract Type: ${jobData.contractType || "-"}</p>
                    <a href="jobBidPage.html?jobId=${jobDoc.id}" class="btn btn-primary">Place Bid</a>
                </div>
                </div>`;

        jobs.push({
        title: jobData.nameOfJob,
        description: jobData.jobDetails,
        contract: jobData.contractType,
        category: jobData.category,
        arrangement: jobData.jobArrangements,
        durationText: `${jobData.length} ${jobData.duration}`,
        payment: `$ ${jobData.actualPayment}`
        });
    }
    const errorMessage =  "<p>No jobs found.</p>"
    container.innerHTML = html || errorMessage;
    return jobs;
});
}






// hideJobs is a function to prevent other freelancers from making bids for a job that already has an assigned freelancer
/*async function hideJobs(){
    const gigRef = await getDoc(collection(db,"gigs")) 
}*/


// hideJobs is a function to prevent other freelancers from making bids for a job that already has an assigned freelancer
/*async function hideJobs(){
    const gigRef = await getDoc(collection(db,"gigs")) 
}*/
