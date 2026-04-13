import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js';
import { getFirestore, query, onSnapshot, where, doc, getDoc, addDoc, collection, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js';
import { getStorage,ref,uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js';

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
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

onAuthStateChanged(auth, async function (user) {
  if (!user) {
    console.log("You are not signed in");
    return;
  }
});




const freelancerName = document.querySelector("#fullName");
const serviceName = document.querySelector("#service");
const fee = document.querySelector("#serviceFee");
const statement = document.querySelector("#introduction");
const charityDonation = document.querySelector("#donation");



//Saving advertised freelancer services to firestore
async function storeServiceDetails(e){
    e.preventDefault();
    const name = freelancerName.value.trim();
    const service = serviceName.value.trim();
    const pay = Number(fee.value.trim());
    const donate = Number(charityDonation.value.trim());
    const aboutFreelancer = statement.value.trim();
    const currentUser = auth.currentUser;

    if (!currentUser) {
        alert("Please sign in before posting a service.");
        return;
    }
    
    console.log(`${currentUser.uid} => ${currentUser.email}`);

    const image = document.querySelector("#imageUpload");
    const userImage = image?.files?.[0]; // The image the user uploaded.
    if (!userImage) {
        console.log("No file selected.");
        alert("No file selected");
        return;
    }

    const storageRef = ref(storage,`images/${currentUser.uid}/${currentUser.email}/${userImage.name}`); // creating reference
    await uploadBytes(storageRef,userImage); // uploading file
    
    const url = await getDownloadURL(storageRef);
    console.log(url);



    
    try{
        await addDoc(collection(db,"freelancerAdvertise"),{
            freelancerId: currentUser.uid,
            freelancerEmail: currentUser.email,
            freelancer: name,
            serviceName: service,
            serviceFee: pay,
            intro: aboutFreelancer,
            donationAmount: donate,
            status: "available",
            url: url,
            postedAt: serverTimestamp()
        });

    console.log('Service posted successfully and image');
    alert('Advertisement and image uploaded!');
    document.querySelector('form').reset();
    window.location.href = "./browseFreelancers.html";
    }
    catch(err){
        console.error('Failed to post job:', err);
        alert('Failed to post job: ' + (err?.message || err));
        return;
    }

    
}

const submitButton = document.querySelector("#postService");
submitButton?.addEventListener("click", storeServiceDetails);

const tempButton = document.querySelector("#moveNext");
tempButton?.addEventListener("click", nextPage);

function nextPage(){
    window.location.href= "./browseFreelancers.html";
}


const container = document.querySelector("#servicesListing");

async function displayAvailableFreelancers(){
    if (!container){
        return;
    }
    const queryVacantFreelancers = query(collection(db,"freelancerAdvertise"),where("status","==","available"));
    

    onSnapshot(queryVacantFreelancers,(snapshot)=>{
        let html = "";
        for (const x of snapshot.docs) {
            const xData = x.data();
            const imageUrl = xData.url;
            console.log(imageUrl);

            html+=`<div class="bg-white block max-w-sm p-6 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition">
                        <a href = "./">
                            <img src=">${imageUrl}" alt="Freelancer service image" class="w-full h-44 sm:h-48 object-cover rounded-lg mb-3 border border-gray-200" loading="lazy">
                        </a>
                        <h3 class="text-indigo-600 font-semibold"> ${xData.serviceName.toUpperCase() || "No Service Found"}</h3>
                        <h4 class="text-grey-600 font-semibold">${xData.freelancer.toUpperCase() || "Unknown"}</h4>
                        <p class="text-grey-600 font-light">${xData.intro || "No description available"}</p>
                        <p class="text-xs text-green-700 bg-green-100 px-1 py-1 rounded-full">${xData.status.toUpperCase()}</p>
                        </div>`;
            
            
                
                /*html +=`<article class="bg-white block max-w-sm p-6 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition">

    <header class="mb-3">
        <h3 class="text-xl font-semibold text-gray-800">
            ${xData.serviceName || "No Service"}
        </h3>
        <p class="text-sm text-gray-500">
            ${xData.freelancer || "Unknown Freelancer"}
        </p>
    </header>

    <p class="mb-4 text-gray-600 text-sm">
        ${xData.intro || "No description available"}
    </p>

    <footer class="flex items-center justify-between mb-4">
        <p class="text-indigo-600 font-semibold text-lg">
            £${xData.serviceFee || "0"}
        </p>
        <p class="text-xs px-2 py-1 rounded-full ${
            xData.status === "available"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
        }">
            ${xData.status}
        </p>
    </footer>

    <button class="w-full text-sm bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">
        View Profile
    </button>

</article>`;*/           
        }

        
        const errorMessage =  "<p>No freelancers found.</p>";
        container.innerHTML = html || errorMessage;
    });
}

if (container) {
    displayAvailableFreelancers();
}



