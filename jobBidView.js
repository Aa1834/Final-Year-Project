import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
import { getFirestore, doc, getDoc, collection, getDocs, query, where,updateDoc } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js';

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

async function fetchJobBids(){
    const currentUser = auth.currentUser;
    if(!currentUser){
        return;
    }
    const clientId = currentUser.uid;
    const jobQuery = query(collection(db,"gigs"),where("clientUid","==",clientId));

    const jobs = await getDocs(jobQuery);
    console.log("Client Jobs:", jobs);

    let allCardsHtml = ''; 

    for (const jobDoc of jobs.docs){
        const jobId = jobDoc.id;
        const jobData = jobDoc.data();

        console.log("Job:", jobData.nameOfJob);
        console.log(jobId);
        console.log(jobData);

        const queryForBids = query(collection(db,"jobBids"),where("jobId","==",jobId));
        const bids = await getDocs(queryForBids);

        for (const bidDoc of bids.docs){
            const bidId = bidDoc.id;
            const bidData = bidDoc.data();
            const skills = await getUserSkills(bidData.freelancerUid);

            allCardsHtml += `<div style="border:1px solid #ddd; padding:15px; margin:10px;">
            <h3>${jobData.nameOfJob}</h3>
            <p><strong>Email:</strong> ${bidData.freelancerEmail}</p>
            <p><strong>Bid:</strong> $${bidData.bidAmount}</p>
            <div><strong>Skills:</strong> ${renderSkillLabels(skills)}</div>
            <button class="accept-bid-btn" data-jobid="${jobId}" data-bidid="${bidDoc.id}">Accept Bid</button>
            </div>`;

            console.log("Job Bid:", bidData.freelancerEmail);
            console.log("Skills:", skills);
            console.log(bidId);
            console.log(bidData);
        }
    }
    
    
    document.querySelector('#cardsContainer').innerHTML = allCardsHtml || '<p>No bids found.</p>';
}

async function getUserSkills(userId) {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists() && userSnap.data().skills) {
            return userSnap.data().skills;
        }
        return [];
    } catch (error) {
        console.error('Error fetching user skills:', error);
        return [];
    }
}

function renderSkillLabels(skills) {
    if (!skills || skills.length === 0) {
        return '<span>No skills listed</span>';
    }
    return skills.map(skill => 
        `<span style="display:inline-block; padding:5px 10px; margin:3px; background:#2563eb; color:white; border-radius:15px;">${skill}</span>`
    ).join('');
}

async function acceptBid(jobId, bidId) {
  await updateDoc(doc(db, 'gigs', jobId), {
    status: 'closed',
    acceptedBidId: bidId
  });

  await updateDoc(doc(db, 'jobBids', bidId), {
    status: 'accepted'
  });

  document.querySelectorAll('.accept-bid-btn').forEach(btn => btn.disabled = true);
}

document.addEventListener('click', (e) => {
  if (!e.target.matches('.accept-bid-btn')) return;

  const jobId = e.target.dataset.jobid;
  const bidId = e.target.dataset.bidid;
  acceptBid(jobId, bidId);
});

//const dummyTestButton = document.querySelector("#dummyButton");
//dummyTestButton.addEventListener("click",fetchJobBids);

onAuthStateChanged(auth, (user) => {
  if (!user) {
    console.log('Not signed in');
    return;
  }
  fetchJobBids();
});