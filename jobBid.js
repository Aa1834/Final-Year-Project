import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
import { getFirestore, doc, getDoc, addDoc, collection, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js';
import { getStorage,ref,uploadBytes } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js';

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
const storage = getStorage(app);

const jobTitle = document.querySelector('#jobTitle');
const jobDescription = document.querySelector('#jobDescription');
const jobLength = document.querySelector('#jobLength');
const jobPayment = document.querySelector('#jobPayment');
const jobContract = document.querySelector('#jobContract');
const bidForm = document.querySelector('#bidForm');
const bidStatus = document.querySelector('#bidStatus');
const bidAmountInput = document.querySelector('#bidAmount');
const bidStatementInput = document.querySelector('#bidStatement');
const donationAmount = document.querySelector('#charityDonation');


function getJobId(){
    const params = new URLSearchParams(window.location.search);
    console.log(`This is URL parameter: ${params}`);
    return params.get('jobId');
}

async function loadJobDetails(jobId) {
  if (!jobId) {
    if (jobTitle) jobTitle.textContent = 'Job not found.';
    return null;
  }

  try {
    const jobSnap = await getDoc(doc(db, 'gigs', jobId));
    if (!jobSnap.exists()) {
      if (jobTitle) jobTitle.textContent = 'Job not found.';
      return null;
    }

    const data = jobSnap.data();
    if (jobTitle) jobTitle.textContent = data.nameOfJob || '';
    if (jobDescription) jobDescription.textContent = `Description: ${data.jobDetails || ''}`;
    if (jobLength) jobLength.textContent = `Job Duration: ${data.length || ''} ${data.duration || ''}`.trim();
    if (jobPayment) jobPayment.textContent = `$ ${data.actualPayment ?? ''}`;
    if (jobContract) jobContract.textContent = `Contract Type: ${data.contractType || ''}`;

    return { id: jobId, ...data };
  }
  catch (error) {
    console.error('Failed to load job:', error);
    if (jobTitle) jobTitle.textContent = 'Failed to load job.';
    return null;
  }
}

function setStatus(message) {
  if (bidStatus){
    bidStatus.textContent = message;
  }
}

async function submitBid(job) {
  if (!job) return;

  const bidAmount = Number(bidAmountInput?.value || 0);
  const statement = bidStatementInput?.value?.trim() || '';
  const donation = Number(donationAmount?.value || 1);

  if (!bidAmount || bidAmount <= 0 || !statement || donation > 100 || donation < 1 || !donation) {
    setStatus('Please enter an acceptable bid amount,donation amount and/or statement.');
    return;
  }

  const currentUser = auth.currentUser;
  if (!currentUser) {
    setStatus('You must be signed in to place a bid.');
    return;
  }

  try {
    await addDoc(collection(db,'gigs',job.id,'bids'), { // changed jobBids being collection to subcollection of gigs
      freelancerUid: currentUser.uid,
      freelancerEmail: currentUser.email,
      bidAmount,
      statement,
      donation,
      status: "pending", //added status field in jobBids subcollection where the default value of status field being "pending".
      createdAt: serverTimestamp()
    });

    setStatus('Bid submitted successfully.');
    if (bidForm){
      bidForm.reset();
    }
  } catch (err) {
    console.error('Failed to submit bid:', err);
    setStatus('Failed to submit bid. Please try again.');
  }
}



let chosenJob = null;

async function bidPage(){
    const jobId = getJobId();
    chosenJob = await loadJobDetails(jobId);

    onAuthStateChanged(auth, (user) => {
    if (!user) {
      setStatus('Sign in to place a bid.');
    }
  });

  if (bidForm) {
    bidForm.addEventListener('submit', (e) => {
      e.preventDefault();
      setStatus('');
      submitBid(chosenJob);
    });
  }
}

bidPage();



/*async function uploadResumeFile(){
  const file = document.querySelector("#resume");
  const resumeFile = file.files[0];
  
  const userId = firebase.auth.currentUser.uid;
  const docRef = doc(db,"jobBids",doc.id);
  const bidID = await getDoc(docRef);
  

  if(resumeFile){
      const storageRef = ref(storage, `${resumeFile.name}`);
      await uploadBytes(storageRef, resumeFile);
      //const imageURL = await getDownloadURL(storageRef);
      //const imagePreview = document.getElementById("imagePreview");
      //imagePreview.src = imageURL;
    }

}*/

async function uploadResumeFile(e){
  e?.preventDefault();

  const fileInput = document.querySelector("#resume");
  const resumeFile = fileInput?.files?.[0];
  if (!resumeFile) {
    console.log("No file selected.");
    return;
  }

  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.log("User not signed in.");
    return;
  }

  const storageRef = ref(storage, `resumes/${currentUser.uid}/${resumeFile.name}`);
  await uploadBytes(storageRef, resumeFile);

  console.log("Upload complete!")
}

const uploadResumeButton = document.querySelector("#uploadResume");
uploadResumeButton.addEventListener("click",uploadResumeFile);