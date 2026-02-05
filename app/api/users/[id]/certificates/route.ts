/**
 * User Certificates API Routes
 * 
 * GET /api/users/[id]/certificates - Get user's certificates
 * POST /api/users/[id]/certificates - Add certificate
 */

import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import { User } from '@/lib/models';
import { success, errors, handleError } from '@/lib/utils/api';
import { auth } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/users/[id]/certificates
 * Get all certificates for a user
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    
    const session = await auth();
    if (!session?.user) {
      return errors.unauthorized();
    }

    const sessionUser = session.user as { id?: string; role?: string };
    if (sessionUser.id !== id && sessionUser.role !== 'admin') {
      return errors.forbidden('You can only access your own certificates');
    }

    await connectDB();

    const user = await User.findById(id).select('profile.certificates');

    if (!user) {
      return errors.notFound('User not found');
    }

    return success(user.profile?.certificates || []);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/users/[id]/certificates
 * Add a new certificate
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    
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

    // Add new certificate
    const newCertificate = {
      name: body.name,
      issuer: body.issuer,
      issueDate: body.issueDate ? new Date(body.issueDate) : undefined,
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
      url: body.url,
    };

    // Ensure profile and certificates array exist
    if (!user.profile) {
      user.profile = { certificates: [] };
    }
    if (!user.profile.certificates) {
      user.profile.certificates = [];
    }
    user.profile.certificates.push(newCertificate);
    await user.save();

    // Return the newly added certificate (last item)
    const addedCertificate = user.profile.certificates[user.profile.certificates.length - 1];

    return success(addedCertificate, 'Certificate added successfully', 201);
  } catch (error) {
    return handleError(error);
  }
}
