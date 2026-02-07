/**
 * Fix skill ID mismatches
 * POST /api/debug/fix-skills
 * Body: { userId, roleId }
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { UserSkill, Role } from '@/lib/models';
import { Types } from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    const { userId, roleId } = await request.json();
    
    if (!userId || !roleId) {
      return Response.json({ error: 'userId and roleId required' }, { status: 400 });
    }
    
    await connectDB();
    
    // Get user skills with populated skill names
    const userSkills = await UserSkill.find({ userId: new Types.ObjectId(userId) })
      .populate('skillId', 'name domain');
    
    // Get role benchmarks with populated skill names
    const role = await Role.findById(roleId)
      .populate('benchmarks.skillId', 'name domain')
      .lean();
    
    if (!role) {
      return Response.json({ error: 'Role not found' }, { status: 404 });
    }
    
    const fixed: any[] = [];
    const notFixed: any[] = [];
    
    // Try to match skills by name and fix IDs
    for (const userSkill of userSkills) {
      const userSkillData = userSkill.skillId as any;
      const userSkillName = userSkillData?.name?.toLowerCase().trim();
      const userSkillId = userSkillData?._id?.toString() || userSkill.skillId.toString();
      
      // Find matching benchmark by name (fuzzy match)
      const matchingBenchmark = role.benchmarks?.find((b: any) => {
        const benchmarkSkillData = b.skillId as any;
        const benchmarkName = benchmarkSkillData?.name?.toLowerCase().trim();
        
        // Exact match
        if (userSkillName === benchmarkName) return true;
        
        // Fuzzy matches
        if (userSkillName?.includes(benchmarkName) || benchmarkName?.includes(userSkillName)) {
          return true;
        }
        
        // Remove common suffixes/prefixes
        const cleanUserName = userSkillName?.replace(/\s+(js|css|framework|library)/gi, '').trim();
        const cleanBenchmarkName = benchmarkName?.replace(/\s+(js|css|framework|library)/gi, '').trim();
        
        if (cleanUserName === cleanBenchmarkName) return true;
        
        return false;
      });
      
      if (matchingBenchmark) {
        const benchmarkSkillData = matchingBenchmark.skillId as any;
        const oldSkillId = userSkill.skillId.toString();
        const newSkillId = benchmarkSkillData?._id?.toString() || matchingBenchmark.skillId.toString();
        
        if (oldSkillId !== newSkillId) {
          // Update the skill ID
          userSkill.skillId = new Types.ObjectId(newSkillId);
          await userSkill.save();
          
          fixed.push({
            originalName: userSkillData?.name || 'Unknown',
            matchedName: benchmarkSkillData?.name || 'Unknown',
            oldSkillId,
            newSkillId,
          });
        }
      } else {
        notFixed.push({
          skillName: userSkillData?.name || 'Unknown',
          skillId: userSkillId,
          reason: 'No matching benchmark found',
        });
      }
    }
    
    return Response.json({
      success: true,
      fixed: fixed.length,
      notFixed: notFixed.length,
      details: {
        fixed,
        notFixed,
      },
      message: fixed.length > 0 
        ? `Fixed ${fixed.length} skill(s). Please refresh your roadmap.`
        : 'No skills needed fixing.',
    });
  } catch (error) {
    console.error('[Fix Skills] Error:', error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}
