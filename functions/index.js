import {setGlobalOptions} from "firebase-functions/v2/options";
import {onCall} from "firebase-functions/v2/https";
import Stripe from "stripe";

setGlobalOptions({maxInstances: 10});

export const directEmployerToPay = onCall(async (request) => {
  console.log(request.data?.jobId);
  const jobId = request.data?.jobId;

  console.log("jobId from client:", jobId);
  console.log("cloud function called");
  return {ok: true, message: "Received jobId",jobId};
}); 

/*export const directEmployerToPay = onCall(async (request) => {
  console.log(request.data?.jobId);
  const jobId = request.data?.jobId;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  //console.log("jobId from client:", jobId);
  //console.log("cloud function called");
  //return {ok: true, message: "Received jobId",jobId};

  if (!request.auth){
    return {"You are not signed in"};
  }

  if (request.auth){
    const session = stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [

        ]
    });
  }
}); */



/*export const checkoutSession = onCall(async (request) =>{
    const gigId = request.data?.jobId;
    if (request.auth){
        
    }
})*/