import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
import { getFirestore, doc, getDoc, collection, getDocs, query, where,updateDoc,documentId} from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js';
//import { loadStripe } from "@stripe/stripe-js";
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-functions.js';

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
const functions = getFunctions(app);
//connectFunctionsEmulator(functions, "127.0.0.1", 5001);



//const stripePromise = loadStripe("your_publishable_key");


let clientId = "";

onAuthStateChanged(auth, async function (user) {
  if (!user) {
    console.log("You are not signed in");
    return;
  }

  clientId = user.uid;
  await displayJobs();
});


async function displayJobs(){
    const queryJobs = query(collection(db,"gigs"), where("clientUid","==",clientId));

    const jobs = await getDocs(queryJobs);

    const tbody = document.querySelector("#jobTableBody");

    for (const job of jobs.docs){
        const jobData = job.data();

        const tableRow = document.createElement("tr");

        const jobId = document.createElement("td");
        jobId.textContent = job.id;

        const jobTitle = document.createElement("td")
        jobTitle.textContent = jobData.nameOfJob || "not found";

        const freelancerEmail = document.createElement("td");
        freelancerEmail.textContent = jobData.acceptedBid?.acceptedBidUserEmail || "Haven't assigned a freelancer to this job yet.";
        
        const payButton = document.createElement("button");
        payButton.textContent = "Make Payment";
        payButton.type = "button";
        payButton.className = "btn btn-primary";
        payButton.name = job.id;

        payButton.addEventListener("click", async () => {
          try {
            const pay = httpsCallable(functions, "directEmployerToPay");
            const result = await pay({ jobId: job.id }); // send Firestore doc id
            console.log("Function result:", result.data);
          } catch (err) {
            console.error("Callable error:", err);
          }
        });

        const payLink = document.createElement("a");
        payLink.href="./employerPayment.html?id=" + job.id;
        payLink.textContent='Pay';

        const cell = document.createElement("td");
        cell.appendChild(payButton);
        

        const cellForButton = document.createElement("td");
        cellForButton.appendChild(payLink); //renders the pay button on the DOM stack so the button is displayed on the HTML page

        //tableRow.append(jobId,jobTitle,freelancerEmail,cellForButton);
        tableRow.append(jobId,jobTitle,freelancerEmail,cell);
        tbody.appendChild(tableRow);

        //payButton.addEventListener("click", function (e) {alert(e.name);});
        //payButton.addEventListener("click", testCloudFunction.bind(this),false);
        
        
    }
}

/*async function callingCloudFunction() {
  const createCheckoutSession = httpsCallable(functions, "createCheckoutSession");
}*/

/*async function testCloudFunction(event) {
  console.log(event.currentTarget.name);
  const functions = getFunctions();
  const pay = httpsCallable(functions, 'directEmployerToPay');
  pay({selectedJobId:job.id})
  .then((result)=>{
    console.log(result.data);
  })
  .catch((error)=>{
    console.log(error.code);
  });
  //const result = await pay({});
  //console.log(result.data);
}

testCloudFunction(); */

