import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db/mongoose";
import UserSkill from "@/lib/models/UserSkill";
import Skill from "@/lib/models/Skill";
import crypto from "crypto";
import { UsageService } from "@/lib/services/usageService";
import { sendNotification } from "@/lib/services/notificationService";
import User from "@/lib/models/User";

export function generateEvidenceHash(evidence: string) {
  return crypto.createHash("sha256").update(evidence).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { skillId, newEvidence } = await req.json();

    if (!skillId || !newEvidence || newEvidence.trim().length < 10) {
      return NextResponse.json({ error: "Please provide meaningful updated evidence" }, { status: 400 });
    }

    await dbConnect();

    // Find the specific skill mapping
    const validation = await UserSkill.findOne({ userId: session.user.id, skillId });

    if (!validation) {
      return NextResponse.json({ error: "Validation request not found" }, { status: 404 });
    }

    // Must be previously rejected to re-request
    if (validation.validationStatus !== "rejected") {
      return NextResponse.json({ error: "Re-request allowed only after rejection" }, { status: 400 });
    }

    const newHash = generateEvidenceHash(newEvidence);

    // Prevent same evidence spam
    if (validation.evidenceHash === newHash) {
      return NextResponse.json({ error: "Please update your evidence before re-requesting" }, { status: 400 });
    }

    // Limit re-requests
    const userPlan = (session.user as any)?.plan || 'FREE';
    if ((validation.reRequestCount || 0) >= 2 && userPlan === 'FREE') {
      return NextResponse.json({ error: "Re-request limit reached. Upgrade to continue." }, { status: 403 });
    }

    // Charge usage limits for making validating requests in general? 
    // Usually handled by the main flow, let's enforce it here just in case, but rely mostly on reRequestCount.
    
    // Update validation state
    validation.evidence = newEvidence;
    validation.evidenceHash = newHash;
    validation.validationStatus = "pending";
    validation.isReRequest = true;
    validation.reRequestCount = (validation.reRequestCount || 0) + 1;
    validation.updatedAt = new Date();

    await validation.save();

    // 💡 Fetch user so we can see who the mentor is
    const activeUser = await User.findById(session.user.id).select('name mentorId').lean();
    const skillData = await Skill.findById(skillId).select('name').lean();

    // Notify Mentor if assigned
    if (activeUser?.mentorId) {
      await sendNotification(
        activeUser.mentorId,
        'skill_validation' as any, // assuming type mappings match loosely or are flexible
        {
          title: 'Skill Validation Re-Requested',
          message: `${activeUser.name} has improved and re-requested validation for ${skillData?.name || 'a skill'}.`,
          actionUrl: `/mentor/validations/${activeUser._id}`,
        }
      );
    }

    return NextResponse.json({ success: true, message: "Re-request submitted successfully" });
  } catch (error: any) {
    console.error("Re-request validation error:", error);
    return NextResponse.json({ error: error.message || "Failed to re-request validation" }, { status: 500 });
  }
}
