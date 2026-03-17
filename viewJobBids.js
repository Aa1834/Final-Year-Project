import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
import { getFirestore, doc, getDoc, collection, getDocs} from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js';

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

const jobTitleEl = document.querySelector('#jobTitle');
const jobDetailsEl = document.querySelector('#jobDetails');
const jobMetaEl = document.querySelector('#jobMeta');
const bidsListEl = document.querySelector('#bidsList');
const statusMessageEl = document.querySelector('#statusMessage');

function getJobId() {
	const params = new URLSearchParams(window.location.search);
	return params.get('jobId');
}

function setStatus(message) {
	if (statusMessageEl) {
		statusMessageEl.textContent = message;
	}
}

function formatDate(timestamp) {
	if (!timestamp || !timestamp.toDate) return '';
	return timestamp.toDate().toLocaleString();
}

function renderBids(bids) {
	bidsListEl.innerHTML = '';

	if (!bids.length) {
		setStatus('No bids yet for this job.');
		return;
	}

	setStatus('');
	bids.forEach((bid) => {
		const li = document.createElement('li');
		li.className = 'list-group-item';
		li.innerHTML = `
			<div class="d-flex justify-content-between align-items-start">
				<div>
					<strong>${bid.freelancerEmail || 'Freelancer'}</strong>
					<div class="text-muted">${bid.statement || ''}</div>
				</div>
				<div class="text-end">
					<div class="fw-bold">$${bid.bidAmount ?? ''}</div>
					<div class="text-muted" style="font-size: 0.85rem;">${formatDate(bid.createdAt)}</div>
				</div>
			</div>
		`;
		bidsListEl.appendChild(li);
	});
}

async function loadJob(jobId, currentUser) {
	if (!jobId) {
		setStatus('Missing job ID in the URL.');
		return null;
	}

	const jobSnap = await getDoc(doc(db, 'gigs', jobId));
	if (!jobSnap.exists()) {
		setStatus('Job not found.');
		return null;
	}

	const job = jobSnap.data();
	jobTitleEl.textContent = job.nameOfJob || 'Job';
	jobDetailsEl.textContent = job.jobDetails || '';
	jobMetaEl.textContent = `Contract: ${job.contractType || 'N/A'} | Payment: $${job.actualPayment ?? ''}`;

	if (currentUser && job.clientUid && job.clientUid !== currentUser.uid) {
		setStatus('You do not have access to view bids for this job.');
		return null;
	}

	return job;
}

async function loadBids(jobId) {
	const snapshot = await getDocs(collection(db, "gigs", jobId, "bids"));
	const bids = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
	renderBids(bids);
}

async function initPage(user) {
	try {
		const jobId = getJobId();
		const job = await loadJob(jobId, user);
		if (!job) return;
		await loadBids(jobId);
	} catch (error) {
		console.error('Failed to load bids:', error);
		setStatus('Failed to load bids. Please try again.');
	}
}

onAuthStateChanged(auth, (user) => {
	if (!user) {
		setStatus('Sign in to view job bids.');
		return;
	}

	initPage(user);
});
