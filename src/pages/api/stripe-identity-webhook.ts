// pages/api/stripe-identity-webhook.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { buffer } from "micro";
import { updtUser } from "@/lib/apiCall";

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-12-18.acacia",
});

const endpointSecret = process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET;

// Disable default body parser to handle raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

interface KYCStatus {
  userId: string;
  status: "verified" | "requires_input" | "pending" | "failed";
  sessionId: string;
  errorCode?: string;
  errorReason?: string;
  verifiedAt?: Date;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!endpointSecret) {
    console.error("❌ Stripe webhook secret is not configured");
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  try {
    // Get the raw body as a buffer
    const buf = await buffer(req);
    const sig = req.headers["stripe-signature"];

    if (!sig) {
      console.error("❌ No Stripe signature found");
      return res.status(400).json({ error: "No signature" });
    }

    let event: Stripe.Event;

    try {
      // Verify the webhook signature
      event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
    } catch (err: any) {
      console.error(`❌ Webhook signature verification failed: ${err.message}`);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    console.log(`✅ Received event: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case "identity.verification_session.verified": {
        // All verification checks passed successfully
        const verificationSession = event.data
          .object as Stripe.Identity.VerificationSession;

        const kycData: KYCStatus = {
          userId: verificationSession.metadata?.user_id || "",
          status: "verified",
          sessionId: verificationSession.id,
          verifiedAt: new Date(),
        };

        console.log(`✅ KYC Verified for user: ${kycData.userId}`);
        console.log(`Session ID: ${kycData.sessionId}`);

        // TODO: Update your database here
        await updtUser(
          { _id: kycData.userId },
          {
            $set: { kyc: "success" },
          }
        );

        if (verificationSession.verified_outputs) {
          console.log(
            "Verified outputs:",
            verificationSession.verified_outputs
          );
        }

        break;
      }

      case "identity.verification_session.requires_input": {
        // At least one verification check failed
        const verificationSession = event.data
          .object as Stripe.Identity.VerificationSession;

        const kycData: KYCStatus = {
          userId: verificationSession.metadata?.user_id || "",
          status: "requires_input",
          sessionId: verificationSession.id,
          errorCode: verificationSession.last_error?.code!,
          errorReason: verificationSession.last_error?.reason!,
        };

        console.log(`❌ KYC Failed for user: ${kycData.userId}`);
        console.log(`Session ID: ${kycData.sessionId}`);
        console.log(`Error: ${kycData.errorReason}`);

        // Handle specific failure reasons
        let kycStatus = ""; // Default to success

        if (verificationSession.last_error?.code) {
          switch (verificationSession.last_error.code) {
            case "document_unverified_other":
              console.log("Document was invalid");
              kycStatus = "document_unverified_other";
              break;
            case "document_expired":
              console.log("Document was expired");
              kycStatus = "document_expired";
              break;
            case "document_type_not_supported":
              console.log("Document type not supported");
              kycStatus = "document_type_not_supported";
              break;
            case "consent_declined":
              console.log("User declined consent");
              kycStatus = "consent_declined";
              break;
            case "under_supported_age":
              console.log("User is under supported age");
              kycStatus = "under_supported_age";
              break;
            case "country_not_supported":
              console.log("Country not supported");
              kycStatus = "country_not_supported";
              break;
            default:
              console.log(
                `Other error: ${verificationSession.last_error.code}`
              );
              kycStatus = verificationSession.last_error.code;
          }
        } else {
          console.log("KYC verification successful");
        }

        // Update KYC status in database
        await updtUser(
          { _id: kycData.userId },
          {
            $set: { kyc: kycStatus },
          }
        );
      }

      case "identity.verification_session.processing": {
        // Verification is still processing
        const verificationSession = event.data
          .object as Stripe.Identity.VerificationSession;

        const kycData: KYCStatus = {
          userId: verificationSession.metadata?.user_id || "",
          status: "pending",
          sessionId: verificationSession.id,
        };

        console.log(`⏳ KYC Processing for user: ${kycData.userId}`);
        console.log(`Session ID: ${kycData.sessionId}`);

        // TODO: Update your database here
        await updtUser(
          { _id: kycData.userId },
          {
            $set: { kyc: "processing" },
          }
        );

        break;
      }

      case "identity.verification_session.canceled": {
        // User canceled the verification
        const verificationSession = event.data
          .object as Stripe.Identity.VerificationSession;

        const kycData: KYCStatus = {
          userId: verificationSession.metadata?.user_id || "",
          status: "failed",
          sessionId: verificationSession.id,
          errorReason: "User canceled verification",
        };

        console.log(`❌ KYC Canceled by user: ${kycData.userId}`);
        console.log(`Session ID: ${kycData.sessionId}`);

        // TODO: Update your database here
        await updtUser(
          { _id: kycData.userId },
          {
            $set: { kyc: "failed" },
          }
        );

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    res.json({ received: true });
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
