/**
 * Debug endpoint to check skill matching
 * GET /api/debug/skills?userId=XXX&roleId=YYY
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { UserSkill, Role } from '@/lib/models';
import { Types } from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const roleId = request.nextUrl.searchParams.get('roleId');
    
    if (!userId || !roleId) {
      return Response.json({ error: 'userId and roleId required' }, { status: 400 });
    }
    
    await connectDB();
    
    // Get user skills with populated skill names
    const userSkills = await UserSkill.find({ 
      userId: new Types.ObjectId(userId) 
    })
      .populate('skillId', 'name domain')
      .lean();
    
    // Get role benchmarks with populated skill names
    const role = await Role.findById(roleId)
      .populate('benchmarks.skillId', 'name domain')
      .lean();
    
    // Check matches
    const matches: any[] = [];
    const mismatches: any[] = [];
    
    for (const benchmark of role?.benchmarks || []) {
      const benchmarkSkillId = (benchmark.skillId as any)?._id?.toString() || benchmark.skillId.toString();
      const benchmarkSkillName = (benchmark.skillId as any)?.name || 'Unknown';
      const userSkill = userSkills.find(us => {
        const usSkillId = (us.skillId as any)?._id?.toString() || us.skillId.toString();
        return usSkillId === benchmarkSkillId;
      });
      
      if (userSkill) {
        const userSkillName = (userSkill.skillId as any)?.name || 'Unknown';
        matches.push({
          skillName: userSkillName,
          benchmarkId: benchmarkSkillId,
          userSkillId: benchmarkSkillId,
          userLevel: userSkill.level,
          requiredLevel: benchmark.requiredLevel,
          source: userSkill.source,
          validationStatus: userSkill.validationStatus,
        });
      } else {
        mismatches.push({
          skillName: benchmarkSkillName,
          benchmarkId: benchmarkSkillId,
          required: benchmark.requiredLevel,
          importance: benchmark.importance,
          weight: benchmark.weight,
        });
      }
    }
    
    return Response.json({
      userId,
      roleId,
      roleName: role?.name,
      totalBenchmarks: role?.benchmarks?.length || 0,
      totalUserSkills: userSkills.length,
      matches: matches.length,
      mismatches: mismatches.length,
      matchedSkills: matches,
      missingSkills: mismatches,
      allUserSkills: userSkills.map(s => {
        const skillName = (s.skillId as any)?.name || 'Unknown';
        const skillId = (s.skillId as any)?._id?.toString() || s.skillId.toString();
        return {
          skillId,
          skillName,
          level: s.level,
          source: s.source,
          validationStatus: s.validationStatus,
        };
      }),
    });
  } catch (error) {
    console.error('[Debug] Error:', error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
