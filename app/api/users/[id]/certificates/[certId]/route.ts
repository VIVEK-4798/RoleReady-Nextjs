/**
 * Individual Certificate API Routes
 * 
 * PUT /api/users/[id]/certificates/[certId] - Update certificate
 * DELETE /api/users/[id]/certificates/[certId] - Delete certificate
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { User } from '@/lib/models';
import { success, errors, handleError } from '@/lib/utils/api';
import { auth } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string; certId: string }>;
}

/**
 * PUT /api/users/[id]/certificates/[certId]
 * Update a certificate
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id, certId } = await context.params;
    
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const sessionUser = session.user as { id?: string; role?: string };
    if (sessionUser.id !== id && sessionUser.role !== 'admin') {
      return errors.forbidden('You can only update your own certificates');
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name) {
      return errors.badRequest('Certificate name is required');
    }

    await connectDB();

    const user = await User.findById(id);

    if (!user) {
      return errors.notFound('User not found');
    }

    if (!user.profile?.certificates) {
      return errors.notFound('Certificates not found');
    }

    // Find certificate index
    const certificatesArray = user.profile.certificates as any[];
    const certIndex = certificatesArray.findIndex(
      (cert) => cert._id?.toString() === certId
    );

    if (certIndex === -1) {
      return errors.notFound('Certificate not found');
    }

    // Update certificate
    user.profile.certificates[certIndex] = {
      ...user.profile.certificates[certIndex],
      name: body.name,
      issuer: body.issuer,
      issueDate: body.issueDate ? new Date(body.issueDate) : undefined,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
      url: body.url,
    };

    await user.save();

    return success(user.profile.certificates[certIndex], 'Certificate updated successfully');
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/users/[id]/certificates/[certId]
 * Delete a certificate
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id, certId } = await context.params;
    
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const sessionUser = session.user as { id?: string; role?: string };
    if (sessionUser.id !== id && sessionUser.role !== 'admin') {
      return errors.forbidden('You can only delete your own certificates');
    }

    await connectDB();

    const user = await User.findById(id);

    if (!user) {
      return errors.notFound('User not found');
    }

    if (!user.profile?.certificates) {
      return errors.notFound('Certificates not found');
    }

    // Find certificate index
    const certificatesArray = user.profile.certificates as any[];
    const certIndex = certificatesArray.findIndex(
      (cert) => cert._id?.toString() === certId
    );

    if (certIndex === -1) {
      return errors.notFound('Certificate not found');
    }

    // Remove certificate
    user.profile.certificates.splice(certIndex, 1);
    await user.save();

    return success(null, 'Certificate deleted successfully');
  } catch (error) {
    return handleError(error);
  }
}
