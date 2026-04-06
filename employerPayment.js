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
const stripe = Stripe("pk_test_51TIxP6PzQAEXO70IcsiBE9mDQ5nr9pjftRqhsBB2yCgmoafz22OBggEBKTrW1NiCIjRShm3sC3i9lnP3jmyTZxzq00qB2IhtCK");
//connectFunctionsEmulator(functions, "127.0.0.1", 5001);


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

        /*payButton.addEventListener("click", async () => {
          try {
            const pay = httpsCallable(functions, "directEmployerToPay");
            const result = await pay({ jobId: job.id }); // send Firestore doc id
            console.log("Function result:", result.data);
          } catch (err) {
            console.error("Callable error:", err);
          }
        });*/

        const pay = httpsCallable(functions,"directEmployerToPay");
        payButton.addEventListener("click", async () => {
          payButton.disabled = true;
          try {
            const result = await pay({ jobId: job.id });
            const sessionId = result?.data?.id;
            console.log(sessionId);
            if (!sessionId) {
              throw new Error("No Stripe session id returned from the function.");
            }
            const { error } = await stripe.redirectToCheckout({ sessionId: sessionId });
            if (error) {
              throw error;
            }
          } catch (err) {
            console.error("Checkout failed:", err);
            alert(err?.message || "Unable to start checkout.");
          } finally {
            payButton.disabled = false;
          }
        });


        /*payButton.addEventListener("click", async () => {
          payButton.disabled = true;
          try {
            const pay = httpsCallable(functions, "directEmployerToPay");
            const result = await pay({jobId: job.id});
            const sessionId = result?.data?.id;

            if (!sessionId) {
              throw new Error("No checkout session id was returned by directEmployerToPay.");
            }

            if (!stripe) {
              throw new Error("Stripe failed to initialize.");
            }

            const {error} = await stripe.redirectToCheckout({sessionId});
            if (error) {
              throw error;
            }
          } catch (err) {
            console.error("Checkout failed:", err);
            alert("Unable to start checkout. Please try again.");
          } finally {
            payButton.disabled = false;
          }
        });*/

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

