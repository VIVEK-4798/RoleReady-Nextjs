/**
 * Target Role History API Routes
 * 
 * GET /api/users/[id]/target-role/history - Get role change history
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { TargetRole } from '@/lib/models';
import { success, errors, handleError } from '@/lib/utils/api';
import { auth } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Type for populated role
interface PopulatedRole {
  _id: string;
  name: string;
  description?: string;
  colorClass: string;
}

/**
 * GET /api/users/[id]/target-role/history
 * Get the user's target role change history
 * 
 * Query params:
 * - limit: number (optional, default 10) - Max items to return
 * - includeActive: boolean (optional, default false) - Include current role in history
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const sessionUser = session.user as { id?: string; role?: string };
    // Users can see their own history, admins/mentors can see anyone's
    if (sessionUser.id !== id && sessionUser.role !== 'admin' && sessionUser.role !== 'mentor') {
      return errors.forbidden('You can only access your own role history');
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const includeActive = searchParams.get('includeActive') === 'true';

    await connectDB();

    const history = await TargetRole.getHistory(id, {
      limit: Math.min(limit, 50), // Cap at 50
      includeActive,
    });

    // Also get the current active role for context
    const currentActive = await TargetRole.getActiveForUser(id);

    // Transform history for response
    const historyItems = history.map((item) => {
      const role = item.roleId as unknown as PopulatedRole;
      return {
        id: item._id,
        roleId: role._id,
        roleName: role.name,
        roleDescription: role.description,
        roleColor: role.colorClass,
        selectedAt: item.selectedAt,
        selectedBy: item.selectedBy,
        deactivatedAt: item.deactivatedAt,
        readinessAtChange: item.readinessAtChange,
        notes: item.notes,
        isActive: item.isActive,
      };
    });

    return success({
      currentTargetRole: currentActive ? {
        id: currentActive._id,
        roleId: (currentActive.roleId as unknown as PopulatedRole)._id,
        roleName: (currentActive.roleId as unknown as PopulatedRole).name,
        selectedAt: currentActive.selectedAt,
        selectedBy: currentActive.selectedBy,
      } : null,
      history: historyItems,
      totalChanges: historyItems.filter(h => !h.isActive).length,
    });
  } catch (error) {
    return handleError(error);
  }
}
