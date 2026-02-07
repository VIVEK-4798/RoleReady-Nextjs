

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { TargetRole, UserSkill, Role, ReadinessSnapshot } from '@/lib/models';
import { success, errors, handleError } from '@/lib/utils/api';
import { auth } from '@/lib/auth';
import { Types } from 'mongoose';

// Constants
const RECALCULATION_COOLDOWN_MINUTES = 5;
const VALIDATED_SKILL_WEIGHT_MULTIPLIER = 1.25; // 25% bonus for mentor-validated skills

// Helper functions
async function getTargetRoleFromUser(userId: string) {
  const targetRole = await TargetRole.getActiveForUser(userId);
  return targetRole;
}

async function getRoleWithBenchmarks(targetRole: any) {
  let roleId: string;
  
  if (typeof targetRole.roleId === 'object' && targetRole.roleId !== null) {
    // It's a populated object
    const populatedRoleId = targetRole.roleId as any;
    roleId = populatedRoleId._id ? populatedRoleId._id.toString() : populatedRoleId.toString();
  } else {
    // It's a string or other primitive
    roleId = String(targetRole.roleId);
  }
  
  const role = await Role.findById(roleId).populate('benchmarks.skillId', 'name');
  return role;
}

async function getUserSkills(userId: string, roleId: string) {
  // Get ALL user skills (not filtered by role benchmarks)
  // The benchmark matching happens during readiness calculation
  
  const userSkills = await UserSkill.find({
    userId: new Types.ObjectId(userId),
    source: { $in: ['self', 'resume', 'validated'] },
    $or: [
      { validationStatus: { $exists: false } },
      { validationStatus: null },
      { validationStatus: 'none' },
      { validationStatus: 'pending' },
      { validationStatus: 'validated' }
    ]
  }).lean();
  
  return userSkills;
}

async function checkRecalculationCooldown(userId: string, roleId: string, bypassReason: string | null = null) {
  // If bypass_reason is provided (e.g., 'validation_update'), skip cooldown check
  if (bypassReason === 'validation_update') {
    return {
      allowed: true,
      bypassed: true,
      bypass_reason: 'validation_update',
      message: 'Cooldown bypassed due to mentor validation updates'
    };
  }
  
  const latestSnapshot = await ReadinessSnapshot.findOne({
    userId,
    roleId
  }).sort({ createdAt: -1 });
  
  if (!latestSnapshot) {
    return { allowed: true, lastCalculation: null };
  }
  
  const lastCalc = latestSnapshot.createdAt;
  const now = new Date();
  const diffMs = now.getTime() - lastCalc.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  
  if (diffMinutes < RECALCULATION_COOLDOWN_MINUTES) {
    const remainingMinutes = RECALCULATION_COOLDOWN_MINUTES - diffMinutes;
    const remainingSeconds = Math.ceil((RECALCULATION_COOLDOWN_MINUTES * 60000 - diffMs) / 1000);
    
    return {
      allowed: false,
      reason: "COOLDOWN_ACTIVE",
      message: `Please wait ${remainingMinutes > 0 ? remainingMinutes + ' minute(s)' : remainingSeconds + ' seconds'} before recalculating`,
      lastCalculation: lastCalc.toISOString(),
      cooldownEndsAt: new Date(lastCalc.getTime() + RECALCULATION_COOLDOWN_MINUTES * 60000).toISOString(),
    };
  }
  
  return { allowed: true, lastCalculation: lastCalc.toISOString() };
}

async function checkSkillsChanged(userId: string, roleId: string) {
  // Get the latest readiness snapshot
  const latestSnapshot = await ReadinessSnapshot.findOne({
    userId,
    roleId
  }).sort({ createdAt: -1 });
  
  if (!latestSnapshot) {
    return { changed: true, reason: "FIRST_CALCULATION" };
  }
  
  // Get skills that were "met" in the last calculation from breakdown within snapshot
  const breakdown = latestSnapshot.breakdown || [];
  const metBreakdown = breakdown.filter((b: any) => b.meetsRequirement);
  
  const lastSkillIds = metBreakdown.map((b: any) =>
    b.skillId.toString()
  ).sort();
  
  // Get current user skills
  const currentSkills = await getUserSkills(userId, roleId);
  const currentSkillIds = currentSkills.map((s: any) =>
    typeof s.skillId === 'object' ? (s.skillId as any)._id?.toString() : String(s.skillId)
  ).sort();
  
  // Compare skill sets
  if (JSON.stringify(lastSkillIds) === JSON.stringify(currentSkillIds)) {
    return {
      changed: false,
      reason: "NO_CHANGES",
      message: "No changes detected since last calculation. Your skills are the same.",
      lastScore: latestSnapshot.totalScore,
      lastMaxScore: latestSnapshot.maxPossibleScore,
      lastPercentage: Math.round((latestSnapshot.totalScore / latestSnapshot.maxPossibleScore) * 100),
    };
  } else {
    const added = currentSkillIds.filter((id: string) => !lastSkillIds.includes(id)).length;
    const removed = lastSkillIds.filter((id: string) => !currentSkillIds.includes(id)).length;
    
    return {
      changed: true,
      reason: "SKILLS_CHANGED",
      skillsAdded: added,
      skillsRemoved: removed,
    };
  }
}

async function checkValidationUpdatesSinceLastCalc(userId: string, roleId: string) {
  // Get last readiness calculation time
  const latestSnapshot = await ReadinessSnapshot.findOne({
    userId,
    roleId
  }).sort({ createdAt: -1 });
  
  // If no previous calculation, no validation updates to check
  if (!latestSnapshot) {
    return {
      hasUpdates: false,
      reason: "NO_PREVIOUS_CALCULATION"
    };
  }
  
  const lastCalcTime = latestSnapshot.createdAt;
  
  // Check if any skills were validated/rejected after last calculation
  const validatedSkills = await UserSkill.find({
    userId,
    validatedAt: { $gt: lastCalcTime },
    validationStatus: { $in: ['validated', 'rejected'] }
  }).populate('skillId', 'name').lean();
  
  if (validatedSkills.length === 0) {
    return {
      hasUpdates: false,
      reason: "NO_NEW_VALIDATIONS",
      lastCalculation: lastCalcTime
    };
  }
  
  // Group by validation status
  const validated = validatedSkills.filter(s => s.validationStatus === 'validated');
  const rejected = validatedSkills.filter(s => s.validationStatus === 'rejected');
  
  return {
    hasUpdates: true,
    reason: "VALIDATION_UPDATES_AVAILABLE",
    lastCalculation: lastCalcTime,
    validated_count: validated.length,
    rejected_count: rejected.length,
    validated_skills: validated.map((s: any) => ({
      skill_id: typeof s.skillId === 'object' ? (s.skillId as any)._id?.toString() : String(s.skillId),
      skill_name: typeof s.skillId === 'object' ? (s.skillId as any).name : 'Unknown',
      validated_at: s.validatedAt,
      mentor_name: s.validatedBy || 'Unknown'
    })),
    rejected_skills: rejected.map((s: any) => ({
      skill_id: typeof s.skillId === 'object' ? (s.skillId as any)._id?.toString() : String(s.skillId),
      skill_name: typeof s.skillId === 'object' ? (s.skillId as any).name : 'Unknown',
      validated_at: s.validatedAt,
      mentor_name: s.validatedBy || 'Unknown'
    })),
    message: `${validated.length} skill(s) validated, ${rejected.length} skill(s) rejected since your last readiness check.`
  };
}

async function calculateReadiness(userId: string, roleId: string, triggerSource: string = "user_explicit") {
  // Get role with benchmarks
  const role = await Role.findById(roleId).populate('benchmarks.skillId', 'name');
  if (!role) {
    throw { success: false, error: "ROLE_NOT_FOUND", message: "Role not found" };
  }
  
  const benchmarks = role.benchmarks || [];
  if (benchmarks.length === 0) {
    throw { success: false, error: "NO_BENCHMARK_SKILLS", message: "No benchmark skills defined for this role" };
  }
  
  // Get user skills
  const userSkills = await getUserSkills(userId, roleId);
  
  console.log('[calculateReadiness] User ID:', userId);
  console.log('[calculateReadiness] Role ID:', roleId);
  console.log('[calculateReadiness] Found user skills:', userSkills.length);
  console.log('[calculateReadiness] User skills:', JSON.stringify(userSkills.map((s: any) => ({
    skillId: s.skillId?.toString(),
    source: s.source,
    level: s.level
  })), null, 2));
  console.log('[calculateReadiness] Benchmarks:', JSON.stringify(benchmarks.map((b: any) => ({
    skillId: typeof b.skillId === 'object' ? b.skillId._id?.toString() : String(b.skillId),
    skillName: typeof b.skillId === 'object' ? b.skillId.name : 'Unknown',
    weight: b.weight
  })), null, 2));
  
  // Calculate score
  let totalScore = 0;
  let maxPossibleScore = 0;
  const breakdown = [];
  const missingRequiredSkills = [];
  
  // Skill source breakdown
  const selfSkills = userSkills.filter(s => s.source === "self");
  const resumeSkills = userSkills.filter(s => s.source === "resume");
  const validatedSkills = userSkills.filter(s => s.source === "validated" || s.validationStatus === "validated");
  
  for (const benchmark of benchmarks) {
    const skillId = typeof benchmark.skillId === 'object' ? (benchmark.skillId as any)._id?.toString() : String(benchmark.skillId);
    
    const hasSkill = userSkills.some((s: any) => {
      const userSkillId = typeof s.skillId === 'object' ? (s.skillId as any)._id?.toString() : String(s.skillId);
      return userSkillId === skillId;
    });
    
    const userSkill = userSkills.find((s: any) => {
      const userSkillId = typeof s.skillId === 'object' ? (s.skillId as any)._id?.toString() : String(s.skillId);
      return userSkillId === skillId;
    });
    
    const skillSource = userSkill?.source || null;
    const validationStatus = userSkill?.validationStatus || null;
    
    // Apply validation bonus: validated skills get 1.25x weight
    const isValidated = skillSource === 'validated' || validationStatus === 'validated';
    const achievedWeight = hasSkill 
      ? (isValidated ? Math.round(benchmark.weight * VALIDATED_SKILL_WEIGHT_MULTIPLIER) : benchmark.weight) 
      : 0;
    
    breakdown.push({
      skillId: skillId,
      skillName: typeof benchmark.skillId === 'object' ? (benchmark.skillId as any).name : 'Unknown',
      requiredWeight: benchmark.weight,
      achievedWeight: achievedWeight,
      status: hasSkill ? "met" : "missing",
      source: skillSource,
      importance: benchmark.importance,
      is_validated: isValidated,
      validation_bonus: isValidated ? Math.round(benchmark.weight * (VALIDATED_SKILL_WEIGHT_MULTIPLIER - 1)) : 0,
    });
    
    maxPossibleScore += benchmark.weight;
    if (hasSkill) {
      totalScore += achievedWeight;
    } else if (benchmark.importance === "required") {
      missingRequiredSkills.push(typeof benchmark.skillId === 'object' ? (benchmark.skillId as any).name : 'Unknown');
    }
  }
  
  // Create readiness snapshot
  const readinessSnapshot = await ReadinessSnapshot.create({
    userId: new Types.ObjectId(userId),
    roleId: new Types.ObjectId(roleId),
    totalScore,
    maxPossibleScore,
    percentage: maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0,
    hasAllRequired: missingRequiredSkills.length === 0,
    requiredSkillsMet: benchmarks.filter((b: any) => b.importance === 'required').length - missingRequiredSkills.length,
    requiredSkillsTotal: benchmarks.filter((b: any) => b.importance === 'required').length,
    totalBenchmarks: benchmarks.length,
    skillsMatched: breakdown.filter(b => b.status === 'met').length,
    skillsMissing: breakdown.filter(b => b.status === 'missing').length,
    breakdown: breakdown.map(b => ({
      skillId: new Types.ObjectId(b.skillId),
      skillName: b.skillName,
      importance: b.importance as 'required' | 'optional',
      weight: b.requiredWeight,
      requiredLevel: 'intermediate' as any,
      userLevel: b.status === 'met' ? 'intermediate' as any : 'none' as any,
      levelPoints: b.achievedWeight,
      validationMultiplier: b.is_validated ? VALIDATED_SKILL_WEIGHT_MULTIPLIER : 1,
      rawScore: b.achievedWeight,
      weightedScore: b.achievedWeight,
      maxPossibleScore: b.requiredWeight,
      meetsRequirement: b.status === 'met',
      isMissing: b.status === 'missing',
      source: b.source as any,
      validationStatus: null
    })),
    trigger: triggerSource as any
  });
  
  const percentage = maxPossibleScore > 0
    ? Math.round((totalScore / maxPossibleScore) * 100)
    : 0;
  
  return {
    success: true,
    message: "Readiness calculated successfully",
    readiness_id: readinessSnapshot._id.toString(),
    total_score: totalScore,
    max_possible_score: maxPossibleScore,
    percentage,
    calculated_at: readinessSnapshot.createdAt.toISOString(),
    trigger: triggerSource,
    missing_required_skills: missingRequiredSkills,
    skill_stats: {
      total_benchmark_skills: benchmarks.length,
      skills_met: breakdown.filter(b => b.status === "met").length,
      skills_missing: breakdown.filter(b => b.status === "missing").length,
      self_skills_count: selfSkills.length,
      resume_skills_count: resumeSkills.length,
      validated_skills_count: validatedSkills.length,
    },
    breakdown,
  };
}

export async function GET(request: NextRequest) {
  console.log('========================================');
  console.log('[GET /api/readiness/context] Request received');
  console.log('========================================');
  
  try {
    // 1. Auth check
    const session = await auth();
    
    if (!session?.user) {
      console.log('[Context API] No session, returning unauthorized');
      return errors.unauthorized();
    }

    const userId = (session.user as { id?: string }).id;
    
    if (!userId) {
      console.log('[Context API] No user ID in session');
      return errors.unauthorized();
    }
    
    await connectDB();

    
    // 2. Get user's active target role
    const targetRole = await getTargetRoleFromUser(userId);

    
    if (!targetRole) {
      console.log('[Context API] No target role, returning NO_TARGET_ROLE edge case');
      return success({
        success: true,
        has_target_role: false,
        edge_case: "NO_TARGET_ROLE",
        edge_case_message: "You haven't selected a target role yet. Your readiness score is calculated against your target role's required skills.",
        action_required: "SELECT_TARGET_ROLE",
        action_url: "/dashboard/roles",
        role: null,
        required_skills_count: 0,
        total_benchmark_skills_count: 0,
        user_skills_count: 0,
        user_skills_by_source: {},
        last_calculated_at: null,
      });
    }
    
    // 3. Get role with benchmarks
    const role = await getRoleWithBenchmarks(targetRole);
    
    if (!role) {
      return success({
        success: true,
        has_target_role: false,
        edge_case: "ROLE_NOT_FOUND",
        edge_case_message: "Your target role could not be found. Please select a new role.",
        action_url: "/dashboard/roles",
      });
    }
    
    const roleId = role._id.toString();
    
    // 4. Get benchmark skills counts
    const benchmarks = role.benchmarks || [];
    const totalBenchmarkSkills = benchmarks.length;
    const requiredBenchmarks = benchmarks.filter((b: { importance: string }) => b.importance === "required");
    const requiredSkillsCount = requiredBenchmarks.length;
    
    // Edge Case: No benchmark skills (admin error)
    if (totalBenchmarkSkills === 0) {
      return success({
        success: true,
        has_target_role: true,
        edge_case: "NO_BENCHMARK_SKILLS",
        edge_case_message: `The "${role.name}" role has no benchmark skills configured. This is a system configuration issue.`,
        action_required: "ADMIN_SETUP_REQUIRED",
        role: {
          id: roleId,
          name: role.name,
        },
        required_skills_count: 0,
        total_benchmark_skills_count: 0,
        user_skills_count: 0,
        user_skills_by_source: {},
        last_calculated_at: null,
      });
    }
    
    // 5. Get user skills count (only real skills, no demo)
    console.log('[Context API] About to call getUserSkills...');
    const userSkills = await getUserSkills(userId, roleId);
    console.log('[Context API] getUserSkills returned:', userSkills.length, 'skills');
    
    // Build skills by source breakdown
    const userSkillsBySource: any = {};
    let totalUserSkills = 0;
    let validatedCount = 0;
    let rejectedCount = 0;
    let pendingValidationCount = 0;
    
    userSkills.forEach((skill: any) => {
      // Count by source
      const source = skill.source || 'self';
      if (!userSkillsBySource[source]) {
        userSkillsBySource[source] = 0;
      }
      userSkillsBySource[source]++;
      totalUserSkills++;
      
      // Track validation stats
      if (skill.source === 'validated' || skill.validationStatus === 'validated') {
        validatedCount++;
      }
      if (skill.validationStatus === 'rejected') {
        rejectedCount++;
      }
      if (skill.validationStatus === 'pending') {
        pendingValidationCount++;
      }
    });
    
    // Get rejected skills count (excluded from getUserSkills)
    const rejectedSkills = await UserSkill.find({
      userId,
      skillId: { $in: benchmarks.map((b: any) => 
        typeof b.skillId === 'object' ? b.skillId._id : b.skillId
      )},
      validationStatus: 'rejected'
    }).lean();
    
    rejectedCount += rejectedSkills.length;
    
    // 6. Get last calculated date
    const latestSnapshot = await ReadinessSnapshot.findOne({
      userId,
      roleId
    }).sort({ createdAt: -1 });
    
    const lastCalculatedAt = latestSnapshot?.createdAt || null;
    
    // 7. Check for validation updates since last calculation
    let hasValidationUpdates = false;
    let validationUpdatesSummary = null;
    
    if (lastCalculatedAt) {
      const validationUpdates = await UserSkill.find({
        userId,
        validatedAt: { $gt: lastCalculatedAt },
        validationStatus: { $in: ['validated', 'rejected'] }
      }).lean();
      
      if (validationUpdates.length > 0) {
        hasValidationUpdates = true;
        validationUpdatesSummary = {
          validated: validationUpdates.filter((s: any) => s.validationStatus === 'validated').length,
          rejected: validationUpdates.filter((s: any) => s.validationStatus === 'rejected').length
        };
      }
    }
    
    // 8. Check for edge cases
    let edgeCase = null;
    let edgeCaseMessage = null;
    let actionRequired = null;
    let actionUrl = null;
    
    if (totalUserSkills === 0) {
      edgeCase = "NO_USER_SKILLS";
      edgeCaseMessage = `You haven't added any skills yet. Add your skills to calculate your readiness.`;
      actionRequired = "ADD_SKILLS";
      actionUrl = "/dashboard/skills";
    }
    
    // 9. Return context response
    return success({
      success: true,
      has_target_role: true,
      // Edge case fields (null if no edge case)
      edge_case: edgeCase,
      edge_case_message: edgeCaseMessage,
      action_required: actionRequired,
      action_url: actionUrl,
      role: {
        id: roleId,
        name: role.name,
      },
      required_skills_count: requiredSkillsCount,
      total_benchmark_skills_count: totalBenchmarkSkills,
      user_skills_count: totalUserSkills,
      user_skills_by_source: userSkillsBySource,
      last_calculated_at: lastCalculatedAt,
      // Validation context
      validation: {
        validated_count: validatedCount,
        rejected_count: rejectedCount,
        pending_count: pendingValidationCount,
        has_updates_since_last_calc: hasValidationUpdates,
        updates_summary: validationUpdatesSummary,
        // Generate contextual message
        message: hasValidationUpdates 
          ? `${validationUpdatesSummary?.validated || 0} skill(s) validated, ${validationUpdatesSummary?.rejected || 0} skill(s) rejected since your last readiness check.`
          : validatedCount > 0
          ? `${validatedCount} of your skills are mentor-validated.`
          : null,
        // Should we show recalculate prompt?
        show_recalculate_prompt: hasValidationUpdates,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

// POST endpoint for explicit calculation
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return errors.unauthorized();
    }
    
    await connectDB();
    
    const body = await request.json();
    const { force, bypass_reason } = body;
    
    // Get user's active target role
    const targetRole = await getTargetRoleFromUser(userId);
    
    if (!targetRole) {
      return errors.badRequest("Please select a target role first");
    }
    
    const role = await getRoleWithBenchmarks(targetRole);
    if (!role) {
      return errors.badRequest("Your target role could not be found");
    }
    
    const roleId = role._id.toString();
    
    // Edge Case: No benchmark skills for this role
    const benchmarks = role.benchmarks || [];
    if (benchmarks.length === 0) {
      return errors.serverError("This role has no benchmark skills configured");
    }
    
    // Edge Case: User has no skills for this category
    const userSkills = await getUserSkills(userId, roleId);
    if (userSkills.length === 0) {
      return errors.badRequest("You haven't added any skills yet");
    }
    
    // Check cooldown (unless force=true)
    if (!force) {
      const cooldownCheck = await checkRecalculationCooldown(userId, roleId, bypass_reason || null);
      
      if (!cooldownCheck.allowed) {
        return errors.badRequest(cooldownCheck.message);
      }
    }
    
    // Check if skills changed (unless force=true)
    if (!force) {
      const changeCheck = await checkSkillsChanged(userId, roleId);
      
      if (!changeCheck.changed) {
        return success({
          success: true,
          recalculated: false,
          error: "NO_CHANGES_DETECTED",
          message: changeCheck.message,
          current_score: changeCheck.lastScore,
          max_possible_score: changeCheck.lastMaxScore,
          percentage: changeCheck.lastPercentage,
        });
      }
    }
    
    // Calculate readiness
    const result = await calculateReadiness(userId, roleId, "user_explicit");
    
    return success({
      ...result,
      recalculated: true,
    });
    
  } catch (error: any) {
    if (error.error) {
      return errors.badRequest(error.message || error.error);
    }
    return handleError(error);
  }
}

// POST endpoint for recalculating after validation
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return errors.unauthorized();
    }
    
    await connectDB();
    
    // Get user's active target role
    const targetRole = await getTargetRoleFromUser(userId);
    
    if (!targetRole) {
      return errors.badRequest("Please select a target role first");
    }
    
    const role = await getRoleWithBenchmarks(targetRole);
    if (!role) {
      return errors.badRequest("Your target role could not be found");
    }
    
    const roleId = role._id.toString();
    
    // Check if there actually are validation updates (prevents abuse)
    const updates = await checkValidationUpdatesSinceLastCalc(userId, roleId);
    
    if (!updates.hasUpdates) {
      return errors.badRequest("No validation updates found since your last calculation");
    }
    
    // Calculate with validation bypass (no cooldown restriction)
    const result = await calculateReadiness(userId, roleId, "validation_review");
    
    return success({
      validation_applied: {
        validated_skills: updates.validated_count,
        rejected_skills: updates.rejected_count,
        weight_bonus: "Validated skills received 1.25x weight bonus",
        rejected_excluded: "Rejected skills were excluded from calculation"
      },
      ...result
    }, "Readiness recalculated with validation updates");
    
  } catch (error: any) {
    if (error.error) {
      return errors.badRequest(error.message || error.error);
    }
    return handleError(error);
  }
}

// GET endpoint for checking validation updates
export async function GET_ValidationUpdates(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return errors.unauthorized();
    }
    
    await connectDB();
    
    // Get user's active target role
    const targetRole = await getTargetRoleFromUser(userId);
    
    if (!targetRole) {
      return success({
        success: true,
        hasUpdates: false,
        reason: "NO_TARGET_ROLE",
        message: "No target role selected"
      });
    }
    
    const role = await getRoleWithBenchmarks(targetRole);
    if (!role) {
      return errors.badRequest("Your target role could not be found");
    }
    
    const roleId = role._id.toString();
    
    // Check for validation updates
    const updates = await checkValidationUpdatesSinceLastCalc(userId, roleId);
    
    return success({
      success: true,
      user_id: userId,
      role_id: roleId,
      ...updates
    });
    
  } catch (error) {
    return handleError(error);
  }
}

// GET endpoint for latest readiness score
export async function GET_Latest(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return errors.unauthorized();
    }
    
    await connectDB();
    
    // Get user's active target role
    const targetRole = await getTargetRoleFromUser(userId);
    
    if (!targetRole) {
      return errors.notFound("No target role selected");
    }
    
    const role = await getRoleWithBenchmarks(targetRole);
    if (!role) {
      return errors.notFound("Role not found");
    }
    
    const roleId = role._id.toString();
    
    // Fetch the latest readiness score
    const latestSnapshot = await ReadinessSnapshot.findOne({
      userId,
      roleId
    }).sort({ createdAt: -1 });
    
    if (!latestSnapshot) {
      return errors.notFound("No readiness score found");
    }
    
    // Get skill stats from breakdown within snapshot
    const breakdown = latestSnapshot.breakdown || [];
    
    const totalSkills = breakdown.length;
    const skillsMet = breakdown.filter((b: any) => b.meetsRequirement).length;
    const skillsMissing = breakdown.filter((b: any) => b.isMissing).length;
    
    const percentage = latestSnapshot.maxPossibleScore > 0
      ? Math.round((latestSnapshot.totalScore / latestSnapshot.maxPossibleScore) * 100)
      : 0;
    
    return success({
      readiness_id: latestSnapshot._id.toString(),
      total_score: latestSnapshot.totalScore,
      max_possible_score: latestSnapshot.maxPossibleScore,
      percentage,
      calculated_at: latestSnapshot.createdAt,
      trigger_source: latestSnapshot.trigger,
      skill_stats: {
        total_benchmark_skills: totalSkills,
        skills_met: skillsMet,
        skills_missing: skillsMissing,
      },
    });
    
  } catch (error) {
    return handleError(error);
  }
}

// GET endpoint for readiness history
export async function GET_History(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return errors.unauthorized();
    }
    
    await connectDB();
    
    // Get user's active target role
    const targetRole = await getTargetRoleFromUser(userId);
    
    if (!targetRole) {
      return errors.notFound("No target role selected");
    }
    
    const role = await getRoleWithBenchmarks(targetRole);
    if (!role) {
      return errors.notFound("Role not found");
    }
    
    const roleId = role._id.toString();
    
    // Fetch readiness history
    const history = await ReadinessSnapshot.find({
      userId,
      roleId
    }).sort({ createdAt: -1 }).select('totalScore createdAt trigger');
    
    return success(history.map((snapshot: any) => ({
      readiness_id: snapshot._id.toString(),
      total_score: snapshot.totalScore,
      calculated_at: snapshot.createdAt,
      trigger_source: snapshot.trigger
    })));
    
  } catch (error) {
    return handleError(error);
  }
}

// GET endpoint for breakdown
export async function GET_Breakdown(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const readinessId = searchParams.get('readiness_id');
    
    if (!readinessId) {
      return errors.badRequest("readiness_id is required");
    }
    
    await connectDB();
    
    // Get the readiness snapshot
    const snapshot = await ReadinessSnapshot.findById(readinessId);
    if (!snapshot) {
      return errors.notFound("Readiness score not found");
    }
    
    // Get breakdown from snapshot
    const breakdown = snapshot.breakdown || [];
    
    // Separate required vs optional skills
    const requiredSkills = breakdown.filter((b: any) => b.importance === 'required');
    const optionalSkills = breakdown.filter((b: any) => b.importance !== 'required');
    
    // Calculate counts
    const requiredMet = requiredSkills.filter((s: any) => s.meetsRequirement);
    const requiredMissing = requiredSkills.filter((s: any) => s.isMissing);
    const optionalMet = optionalSkills.filter((s: any) => s.meetsRequirement);
    const optionalMissing = optionalSkills.filter((s: any) => s.isMissing);
    
    // Calculate weight impact
    const totalRequiredWeight = requiredSkills.reduce((sum: number, s: any) => sum + s.weight, 0);
    const achievedRequiredWeight = requiredMet.reduce((sum: number, s: any) => sum + s.weightedScore, 0);
    const totalOptionalWeight = optionalSkills.reduce((sum: number, s: any) => sum + s.weight, 0);
    const achievedOptionalWeight = optionalMet.reduce((sum: number, s: any) => sum + s.weightedScore, 0);
    
    // Trust indicators - count skills by source
    const allMetSkills = [...requiredMet, ...optionalMet];
    const validatedSkillsCount = allMetSkills.filter((s: any) => s.validationMultiplier > 1).length;
    const resumeSkillsCount = allMetSkills.filter((s: any) => s.source === 'resume').length;
    const selfSkillsCount = allMetSkills.filter((s: any) => s.source === 'self').length;
    
    return success({
      breakdown: breakdown.map((b: any) => ({
        skill: b.skillName,
        skill_id: b.skillId.toString(),
        status: b.meetsRequirement ? 'met' : 'missing',
        required_weight: b.weight,
        achieved_weight: b.weightedScore,
        skill_source: b.source,
        importance: b.importance,
      })),
      required_skills: {
        total: requiredSkills.length,
        met: requiredMet.length,
        missing: requiredMissing.length,
        met_skills: requiredMet.map((s: any) => ({ 
          name: s.skillName, 
          source: s.source 
        })),
        missing_skills: requiredMissing.map((s: any) => s.skillName),
      },
      optional_skills: {
        total: optionalSkills.length,
        met: optionalMet.length,
        missing: optionalMissing.length,
        met_skills: optionalMet.map((s: any) => ({ 
          name: s.skillName, 
          source: s.source 
        })),
        missing_skills: optionalMissing.map((s: any) => s.skillName),
      },
      weight_impact: {
        total_weight: totalRequiredWeight + totalOptionalWeight,
        achieved_weight: achievedRequiredWeight + achievedOptionalWeight,
        required_weight_total: totalRequiredWeight,
        required_weight_achieved: achievedRequiredWeight,
        optional_weight_total: totalOptionalWeight,
        optional_weight_achieved: achievedOptionalWeight,
      },
      trust_indicators: {
        validated_count: validatedSkillsCount,
        resume_count: resumeSkillsCount,
        self_count: selfSkillsCount,
        total_met: allMetSkills.length,
        validation_percentage: allMetSkills.length > 0 
          ? Math.round((validatedSkillsCount / allMetSkills.length) * 100) 
          : 0,
      },
      missing_required_skills: requiredMissing.map((s: any) => s.skillName),
    });
    
  } catch (error) {
    return handleError(error);
  }
}