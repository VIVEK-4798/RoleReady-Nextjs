/**
 * Target Role API Routes
 * 
 * GET /api/users/[id]/target-role - Get current target role
 * PUT /api/users/[id]/target-role - Change/set target role
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { TargetRole, Role, Notification } from '@/lib/models';
import { success, errors, handleError } from '@/lib/utils/api';
import { auth } from '@/lib/auth';
import type { RoleSelector } from '@/lib/models/TargetRole';

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
 * GET /api/users/[id]/target-role
 * Get the user's current active target role
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const sessionUser = session.user as { id?: string; role?: string };
    // Users can see their own target role, admins/mentors can see anyone's
    if (sessionUser.id !== id && sessionUser.role !== 'admin' && sessionUser.role !== 'mentor') {
      return errors.forbidden('You can only access your own target role');
    }

    await connectDB();

    const targetRole = await TargetRole.getActiveForUser(id);

    if (!targetRole) {
      return success({
        hasTargetRole: false,
        targetRole: null,
        message: 'No target role selected',
      });
    }

    const role = targetRole.roleId as unknown as PopulatedRole;

    return success({
      hasTargetRole: true,
      targetRole: {
        id: targetRole._id,
        roleId: role._id,
        roleName: role.name,
        roleDescription: role.description,
        roleColor: role.colorClass,
        selectedAt: targetRole.selectedAt,
        selectedBy: targetRole.selectedBy,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * PUT /api/users/[id]/target-role
 * Change the user's target role
 * 
 * Body:
 * - roleId: string (required) - The new target role ID
 * - notes?: string (optional) - Reason for change (especially for admin overrides)
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const sessionUser = session.user as { id?: string; role?: string };
    const isOwner = sessionUser.id === id;
    const isAdmin = sessionUser.role === 'admin';

    // Only the user themselves or an admin can change target role
    if (!isOwner && !isAdmin) {
      return errors.forbidden('You can only change your own target role');
    }

    const body = await request.json();

    if (!body.roleId) {
      return errors.badRequest('Role ID is required');
    }

    await connectDB();

    // Verify the role exists and is active
    const role = await Role.findById(body.roleId);
    if (!role) {
      return errors.notFound('Role not found');
    }
    if (!role.isActive) {
      return errors.badRequest('Cannot select an inactive role');
    }

    // Determine who is making the selection
    const selectedBy: RoleSelector = isOwner ? 'self' : 'admin';

    // Get current target role to check if it's the same
    const currentTargetRole = await TargetRole.getActiveForUser(id);
    
    // Check if selecting the same role (no-op)
    if (currentTargetRole) {
      const currentRoleId = (currentTargetRole.roleId as unknown as PopulatedRole)._id;
      if (currentRoleId.toString() === body.roleId) {
        return success({
          changed: false,
          message: 'This role is already your target role',
          targetRole: {
            id: currentTargetRole._id,
            roleId: currentRoleId,
            roleName: (currentTargetRole.roleId as unknown as PopulatedRole).name,
            selectedAt: currentTargetRole.selectedAt,
            selectedBy: currentTargetRole.selectedBy,
          },
        });
      }
    }

    // Change the target role (this handles history preservation)
    const newTargetRole = await TargetRole.changeTargetRole(
      id,
      body.roleId,
      selectedBy,
      {
        notes: body.notes,
        // Note: readinessAtChange would be calculated here in Phase 4B
        // For now, we don't store it since readiness isn't calculated yet
      }
    );

    const populatedRole = newTargetRole.roleId as unknown as PopulatedRole;

    // Trigger readiness_outdated notification
    await Notification.createOrUpdate(id, 'readiness_outdated', {
      title: 'Readiness needs recalculation',
      message: `You've selected "${populatedRole.name}" as your target role. Calculate your readiness to see how you match up!`,
      actionUrl: '/dashboard/readiness',
      metadata: {
        roleId: populatedRole._id,
        roleName: populatedRole.name,
        previousRoleId: currentTargetRole 
          ? (currentTargetRole.roleId as unknown as PopulatedRole)._id 
          : null,
      },
    });

    // Also create a role_changed notification
    await Notification.createOrUpdate(id, 'role_changed', {
      title: 'Target role updated',
      message: currentTargetRole 
        ? `You've switched from "${(currentTargetRole.roleId as unknown as PopulatedRole).name}" to "${populatedRole.name}".`
        : `You've selected "${populatedRole.name}" as your target role.`,
      actionUrl: '/dashboard',
      metadata: {
        roleId: populatedRole._id,
        roleName: populatedRole.name,
        previousRoleId: currentTargetRole 
          ? (currentTargetRole.roleId as unknown as PopulatedRole)._id 
          : null,
      },
    });

    return success({
      changed: true,
      message: 'Target role changed successfully',
      readinessOutdated: true, // Signal that readiness needs recalculation
      previousRoleId: currentTargetRole 
        ? (currentTargetRole.roleId as unknown as PopulatedRole)._id 
        : null,
      targetRole: {
        id: newTargetRole._id,
        roleId: populatedRole._id,
        roleName: populatedRole.name,
        roleDescription: populatedRole.description,
        roleColor: populatedRole.colorClass,
        selectedAt: newTargetRole.selectedAt,
        selectedBy: newTargetRole.selectedBy,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}
