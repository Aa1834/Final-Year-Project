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
  await renderGigsForFreelancer();
});

const filterDropdownList = document.querySelector("#job-category");

async function renderGigsForFreelancer() {
  const gigsQuery = query(
    collection(db, "gigs"),
    where("acceptedBid.acceptedBidUserId", "==", freelancerUid)
  );

  const gigData = await getDocs(gigsQuery);

  const tbody = document.querySelector("#jobsTableBody");
  const status = document.querySelector("#jobsStatus");

  if (!tbody) return;

  tbody.textContent = "";
  if (status) status.textContent = "";

  if (gigData.empty) {
    if (status) status.textContent = "NO ACTIVE JOBS FOUND";
    return;
  }

  //const filterDropdownList = document.querySelector("#job-category");
  let filterSelection = filterDropdownList.value;


  if (filterSelection == "all") {

    for (const gigDoc of gigData.docs) {
      const gig = gigDoc.data();

      const bidSnap = await getDoc(
        doc(db, "gigs", gigDoc.id, "bids", gig.acceptedBid.acceptedBidId)
      );

      const bidCreatedAt =bidSnap.exists() && bidSnap.data().createdAt?.toDate? bidSnap.data().createdAt.toDate().toLocaleString(): "-";

      const tableRow = document.createElement("tr");

      const jobTitle = document.createElement("td");
      jobTitle.textContent = gig.nameOfJob || "Unable to find job name";

      const payment = document.createElement("td");
      payment.textContent = `$${gig.actualPayment ?? "-"}`;

      const jobDuration = document.createElement("td");
      jobDuration.textContent = `${gig.length ?? "-"} ${gig.duration ?? ""}`.trim();

      const bidWonDate = document.createElement("td");
      bidWonDate.textContent = bidCreatedAt;

      const categoryOfJob = document.createElement("td");
      categoryOfJob.textContent = gig.category || "No category";

      const cell = document.createElement("td");
      const fullViewButton = document.createElement("button");
      fullViewButton.textContent = "View Job";
      fullViewButton.type = "button";
      fullViewButton.className = "btn btn-primary";

      cell.appendChild(fullViewButton);
      tableRow.append(jobTitle,payment,jobDuration,bidWonDate,categoryOfJob,cell);
      tbody.appendChild(tableRow);
    }

  } else {
    for (const gigDoc of gigData.docs) {
      const gig = gigDoc.data();

      if (gig.category === filterSelection) {

        const bidSnap = await getDoc(doc(db, "gigs", gigDoc.id, "bids", gig.acceptedBid.acceptedBidId));

        const bidCreatedAt =bidSnap.exists() && bidSnap.data().createdAt?.toDate? bidSnap.data().createdAt.toDate().toLocaleString(): "-";

        const tableRow = document.createElement("tr");

        const jobTitle = document.createElement("td");
        jobTitle.textContent = gig.nameOfJob || "Unable to find job name";

        const payment = document.createElement("td");
        payment.textContent = `$${gig.actualPayment ?? "-"}`;

        const jobDuration = document.createElement("td");
        jobDuration.textContent = `${gig.length ?? "-"} ${gig.duration ?? ""}`.trim();

        const bidWonDate = document.createElement("td");
        bidWonDate.textContent = bidCreatedAt;

        const categoryOfJob = document.createElement("td");
        categoryOfJob.textContent = gig.category || "No category";

        const cell = document.createElement("td");
        const fullViewButton = document.createElement("button");
        fullViewButton.textContent = "View Job";
        fullViewButton.type = "button";
        fullViewButton.className = "btn btn-primary";

        cell.appendChild(fullViewButton);
        tableRow.append(jobTitle, payment, jobDuration, bidWonDate,categoryOfJob, cell);
        tbody.appendChild(tableRow);
      }
    }
  }
}

filterDropdownList.addEventListener("change", renderGigsForFreelancer);
