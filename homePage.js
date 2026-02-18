import { getUserProfile } from './users.js';

let currentUserRole = null;

getUserProfile(({ user, role, profile }) => {
    if (!user) {
        console.log('no user');
        return;
    }
    else{
        console.log('Signed in:', user.uid, user.email, 'role:', role);
        currentUserRole = role;
    }
})

function moveToJobPosting(){
    if (currentUserRole !== 'client') {
        console.log("You are not client");
        alert('Only clients can post jobs.');
        return;
    }
    if (currentUserRole==null) {
        console.log("You are not logged in");
        alert('Please sign in first.');
        return;
    }
    window.location.href = "clientScreen.html";
}


function moveToFreelancerAdvertising(){
    if (!currentUserRole) {
        console.log("You are not logged in");
        alert('Please sign in first.');
        return;
    }
    if (currentUserRole !== 'freelancer') {
        console.log("You are not freelancer");
        alert('Only freelancers can advertise.');
        return;
    }
    window.location.href = "freelancerAdvertise.html";
}

function browsePostedJobs(){
    window.location.href = "displayJobsTest.html";
}

const postGigButton = document.querySelector("#directingJob");
const freelancerAdvertiseButton = document.querySelector("#advertiseFreelancer");

postGigButton?.addEventListener("click",moveToJobPosting);
freelancerAdvertiseButton?.addEventListener("click",moveToFreelancerAdvertising);

const browseGigsButton = document.querySelector("#toJobsPage");
browseGigsButton.addEventListener("click",browsePostedJobs);