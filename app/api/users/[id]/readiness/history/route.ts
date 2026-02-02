/**
 * Readiness History API Route
 * GET /api/users/[id]/readiness/history - Get readiness snapshot history
 * 
 * Query Parameters:
 * - roleId: Filter by specific role (optional)
 * - limit: Maximum number of records (default: 20, max: 100)
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { success, errors, handleError } from '@/lib/utils/api';
import { auth } from '@/lib/auth';
import { getSnapshotHistory } from '@/lib/services/readinessService';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// ============================================================================
// GET /api/users/[id]/readiness/history
// ============================================================================

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: userId } = await context.params;
    
    // 1. Auth check
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const sessionUser = session.user as { id?: string; role?: string };
    
    // 2. Authorization: Users can only view their own history
    if (sessionUser.id !== userId && sessionUser.role !== 'admin') {
      return errors.forbidden('You can only view your own readiness history');
    }
    
    await connectDB();
    
    // 3. Parse query params
    const searchParams = request.nextUrl.searchParams;
    const roleId = searchParams.get('roleId') || undefined;
    const limitParam = searchParams.get('limit');
    const limit = Math.min(
      Math.max(parseInt(limitParam || '20', 10) || 20, 1),
      100
    );
    
    // 4. Get history
    const snapshots = await getSnapshotHistory(userId, { roleId, limit });
    
    // 5. Format response
    const history = snapshots.map((snapshot) => ({
      id: snapshot._id.toString(),
      roleId: snapshot.roleId.toString(),
      roleName: snapshot.roleId && typeof snapshot.roleId === 'object' && 'name' in snapshot.roleId
        ? (snapshot.roleId as { name: string }).name
        : undefined,
      percentage: snapshot.percentage,
      hasAllRequired: snapshot.hasAllRequired,
      requiredSkillsMet: snapshot.requiredSkillsMet,
      requiredSkillsTotal: snapshot.requiredSkillsTotal,
      totalBenchmarks: snapshot.totalBenchmarks,
      skillsMatched: snapshot.skillsMatched,
      skillsMissing: snapshot.skillsMissing,
      trigger: snapshot.trigger,
      triggerDetails: snapshot.triggerDetails,
      createdAt: snapshot.createdAt,
    }));
    
    return success({
      history,
      count: history.length,
    });
  } catch (error) {
    return handleError(error);
  }
}
