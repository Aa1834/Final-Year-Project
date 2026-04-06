import {setGlobalOptions} from "firebase-functions/v2/options";
import {onCall} from "firebase-functions/v2/https";
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


export const directEmployerToPay = onCall({ secrets: [STRIPE_SECRET_KEY] }, async (request) => {
  const stripe = new Stripe(STRIPE_SECRET_KEY.value());
  console.log(request.data?.jobId);
  const jobId = request.data?.jobId;
  //const stripeSecret = functions.config().
  //const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  //console.log("jobId from client:", jobId);
  //console.log("cloud function called");
  //return {ok: true, message: "Received jobId",jobId};

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



/*export const checkoutSession = onCall(async (request) =>{
    const gigId = request.data?.jobId;
    if (request.auth){
        
    }
})*/