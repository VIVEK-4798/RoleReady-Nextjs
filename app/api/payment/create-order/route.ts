import Razorpay from "razorpay";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db/mongoose";
import { User } from "@/lib/models";

export async function POST(req: Request) {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan, billingCycle } = await req.json();

    if (!['PRO', 'PREMIUM'].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const amountMap: Record<string, number> = {
      // Amount in paise. E.g., 199.00 INR = 19900 paise.
      // Pro: 199/mo or 1999/yr
      PRO: billingCycle === "monthly" ? 19900 : 199900,
      // Premium: 499/mo or 4999/yr
      PREMIUM: billingCycle === "monthly" ? 49900 : 499900,
    };

    const amount = amountMap[plan];
    if (!amount) {
      return NextResponse.json({ error: "Invalid combination" }, { status: 400 });
    }

    const options = {
      amount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${session.user.id.slice(-6)}`,
    };

    const order = await razorpay.orders.create(options);

    await connectDB();
    // Pre-create the payment intent in user's profile
    await User.findByIdAndUpdate(session.user.id, {
      $push: {
        payments: {
          orderId: order.id,
          plan: plan,
          amount: amount / 100, // store actual rupees
          status: 'PENDING',
        }
      }
    });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
