import crypto from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import { User } from "@/lib/models";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      // Signature mismatch -> mark payment as FAILED securely
      await connectDB();
      await User.updateOne(
        { _id: session.user.id, "payments.orderId": razorpay_order_id },
        {
          $set: { "payments.$.status": "FAILED", "payments.$.paymentId": razorpay_payment_id }
        }
      );
      return NextResponse.json({ error: "Invalid payment" }, { status: 400 });
    }

    await connectDB();

    // Find the user to know which plan they bought
    const user = await User.findById(session.user.id);
    if (!user) {
       return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Identify the payment intent
    const paymentRecord = user.payments?.find(p => p.orderId === razorpay_order_id);
    if (!paymentRecord) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    
    const purchasedPlan = paymentRecord.plan; // "PRO" or "PREMIUM"

    // Set usageResetDate logic so they start a fresh limit
    const nextReset = new Date();
    nextReset.setMonth(nextReset.getMonth() + 1);

    const resetUsageObj = {
      readinessChecksUsed: 0,
      roadmapGenerated: 0,
      resumeGenerated: 0,
      skillExtractionsUsed: 0,
      mentorRequestsUsed: 0,
      ticketsUsed: 0,
    };

    await User.updateOne(
      { _id: session.user.id, "payments.orderId": razorpay_order_id },
      {
        $set: { 
          plan: purchasedPlan,
          "payments.$.status": "SUCCESS", 
          "payments.$.paymentId": razorpay_payment_id,
          usage: resetUsageObj,
          usageResetDate: nextReset
        }
      }
    );

    return NextResponse.json({ success: true, plan: purchasedPlan });
  } catch (error: any) {
    console.error("Payment verify error:", error);
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 });
  }
}
