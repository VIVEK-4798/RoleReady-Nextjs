/**
 * Roadmap History API Route
 * 
 * GET /api/users/[id]/roadmap/history - Get roadmap history
 * 
 * Query Parameters:
 * - roleId: Filter by specific role (optional)
 * - limit: Maximum number of records (default: 10, max: 50)
 * - includeArchived: Include archived roadmaps (default: false)
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { success, errors, handleError } from '@/lib/utils/api';
import { auth } from '@/lib/auth';
import { getRoadmapHistory } from '@/lib/services/roadmapService';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// ============================================================================
// GET /api/users/[id]/roadmap/history
// ============================================================================

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: userId } = await context.params;
    
    // Auth check
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const sessionUser = session.user as { id?: string; role?: string };
    
    // Authorization
    if (sessionUser.id !== userId && sessionUser.role !== 'admin') {
      return errors.forbidden('You can only view your own roadmap history');
    }
    
    await connectDB();
    
    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const roleId = searchParams.get('roleId') || undefined;
    const limitParam = searchParams.get('limit');
    const limit = Math.min(
      Math.max(parseInt(limitParam || '10', 10) || 10, 1),
      50
    );
    const includeArchived = searchParams.get('includeArchived') === 'true';
    
    // Get history
    const roadmaps = await getRoadmapHistory(userId, { roleId, limit, includeArchived });
    
    // Format response (summary only, not full steps)
    const history = roadmaps.map((roadmap) => ({
      id: roadmap._id.toString(),
      roleId: roadmap.roleId.toString(),
      roleName: roadmap.roleId && typeof roadmap.roleId === 'object' && 'name' in roadmap.roleId
        ? (roadmap.roleId as { name: string }).name
        : undefined,
      status: roadmap.status,
      title: roadmap.title,
      totalSteps: roadmap.totalSteps,
      completedSteps: roadmap.completedSteps,
      progressPercentage: roadmap.progressPercentage,
      totalEstimatedHours: roadmap.totalEstimatedHours,
      completedHours: roadmap.completedHours,
      readinessAtGeneration: roadmap.readinessAtGeneration,
      projectedReadiness: roadmap.projectedReadiness,
      generatedAt: roadmap.generatedAt,
    }));
    
    return success({
      history,
      count: history.length,
    });
  } catch (error) {
    return handleError(error);
  }
}
