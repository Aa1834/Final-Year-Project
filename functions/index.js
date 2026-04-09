import {setGlobalOptions} from "firebase-functions/v2/options";
import {onCall,onRequest} from "firebase-functions/v2/https";
import Stripe from "stripe";
import {initializeApp} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";


setGlobalOptions({maxInstances: 10});
initializeApp();

/*export const directEmployerToPay = onCall(async (request) => {
  console.log(request.data?.jobId);
  const jobId = request.data?.jobId;

  console.log("jobId from client:", jobId);
  console.log("cloud function called");
  return {ok: true, message: "Received jobId",jobId};
}); */

const db = getFirestore();
const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = defineSecret("STRIPE_WEBHOOK_SECRET");

// directEmployerToPay => Redirects user (with the employer role) to Stripe checkout page to make payment. 
export const directEmployerToPay = onCall({ secrets: [STRIPE_SECRET_KEY] }, async (request) => {
  const stripe = new Stripe(STRIPE_SECRET_KEY.value());
  console.log(request.data?.jobId);
  const jobId = request.data?.jobId;

  if (!request.auth){
    throw new HttpsError("unauthenticated", "You are not signed in");
  }

  if (request.auth){
    const jobRef = db.collection("gigs").doc(jobId);
    const jobSnap = await jobRef.get();
    const jobData = jobSnap.data();
    const price = jobData?.acceptedBid?.acceptedBidAmount;

    if (!price){
      throw new HttpsError("failed-precondition", "No accepted bid found");
    }

    const gigName = jobData.nameOfJob;
    const gigCurrency = jobData.currency;

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
         metadata:{
          jId:jobId
        },
        line_items: [{
            price_data:{
              currency: gigCurrency,
              unit_amount: price*100,
              product_data: {
                name: gigName,
              },           
            },
            quantity: 1
          },
        ],
        success_url: "http://localhost:5000/success?session_id={CHECKOUT_SESSION_ID}",
        cancel_url: "http://localhost:5000/cancel",
    });
    return {
      id: session.id,
    }
  }
  
});

//const WEBHOOK_SECRET_KEY = defineSecret("WEBHOOK_SECRET_KEY");


export const stripeWebhook = onRequest({ secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET] },async (req, res) => {
  const stripe = new Stripe(STRIPE_SECRET_KEY.value());
  console.log("Webhook hit!");
  

  //console.log(req.body);
  let data;
  let eventType;
   
  let event;
  const sig = req.headers["stripe-signature"];
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        STRIPE_WEBHOOK_SECRET.value()
      );
    } catch (err) {
      console.log("Webhook signature verification failed");
      return res.sendStatus(400);
    }
    data = event.data.object;
    eventType = event.type;
  

  if (eventType ==="checkout.session.completed"){
    console.log(`Job Id for this payment: ${data.metadata.jId}`);
    // write/update firestore to have the payment_status field in gigs collection (for specific job id) and it has correct payment status
    const paymentRef = db.collection("gigs").doc(data.metadata.jId).collection("payments").doc(data.metadata?.jId);
    const gigRef = db.collection("gigs").doc(data.metadata.jId);
    const payCurrency = data.currency;
    const paymentAmount = data.amount_total;
    const gigSnap = await gigRef.get();
    const gigData = gigSnap.data();


    const employerId = gigData.clientUid;
    const employerEmail = gigData.clientEmail;
    const receipientId = gigData.acceptedBid?.acceptedBidUserId;
    const receipientEmail = gigData.acceptedBid?.acceptedBidUserEmail;

    await paymentRef.set({
      paymentStatus: data.payment_status.toUpperCase(),
      payerId: employerId,
      payerEmail: employerEmail,
      contactReceipient: receipientEmail,
      recipientId: receipientId,
      currency: payCurrency,
      totalAmount: paymentAmount/100
    },
    {merge: true}
  );
  /* if (data.payment_status === "paid"){
        stripe transfers goes here:

        const transferToFreelancer = stripe.transfers.create({
        });

        const transferToCharity = stripe.transfers.create({
        });
  }*/
}
if (eventType === "payment_intent.payment_failed"){
  console.log(`PAYMENT FAILED for job id: ${data.metadata.jId}`);
  const paymentRef = db.collection("gigs").doc(data.metadata.jId).collection("payments").doc(data.metadata?.jId);
  const gigRef = db.collection("gigs").doc(data.metadata.jId);
  const payCurrency = data.currency;
  const paymentAmount = data.amount_total;
      
  const gigSnap = await gigRef.get();

  const gigData = gigSnap.data();


  const employerId = gigData.clientUid;
  const employerEmail = gigData.clientEmail;
  const receipientId = gigData.acceptedBid?.acceptedBidUserId;
  const receipientEmail = gigData.acceptedBid?.acceptedBidUserEmail;
  await paymentRef.set({
    paymentStatus: "FAILED",
    payerId: employerId,
    payerEmail: employerEmail,
    contactReceipient: receipientEmail,
    recipientId: receipientId,
    currency: payCurrency,
    totalAmount: paymentAmount/100
  });
}
res.sendStatus(200);
});

// creating stripe connect accountfor freelancers
/*export const createStripeConnectAccount = onRequest({ secrets: [STRIPE_SECRET_KEY] },async(request)=>{
  const stripe = new Stripe(STRIPE_SECRET_KEY.value());
  const connectAccount = stripe.accounts.create({
    type: "express",
  });
  const connectAccountLink = await stripe.accountLinks.create({
      account: connectAccount.id,
      refresh_url: "https://localhost:5000/reauth",
      return_url: "https://localhost:5000/return",
      type: "account_onboarding",
    });
    res.json({ 
      url: connectAccountLink.url
    });

});*/

/*export const checkoutSession = onCall(async (request) =>{
    const gigId = request.data?.jobId;
    if (request.auth){
        
    }
})*/

