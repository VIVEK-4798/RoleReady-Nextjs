/**
 * User Image Upload API Route
 * 
 * POST /api/users/[id]/upload-image - Upload profile image
 */

import { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import connectDB from '@/lib/db/mongoose';
import { User } from '@/lib/models';
import { success, errors, handleError } from '@/lib/utils/api';
import { auth } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/users/[id]/upload-image
 * Upload and update user profile image
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    console.log('[UPLOAD-IMAGE] Starting image upload process...');
    const { id } = await context.params;
    console.log('[UPLOAD-IMAGE] User ID:', id);
    
    // Verify authentication
    const session = await auth();
    if (!session?.user) {
      console.log('[UPLOAD-IMAGE] ERROR: Unauthorized - no session');
      return errors.unauthorized();
    }

    // Users can only upload their own image
    const sessionUser = session.user as { id?: string; role?: string };
    console.log('[UPLOAD-IMAGE] Session user ID:', sessionUser.id, 'Role:', sessionUser.role);
    
    if (sessionUser.id !== id && sessionUser.role !== 'admin') {
      console.log('[UPLOAD-IMAGE] ERROR: Forbidden - user mismatch');
      return errors.forbidden('You can only update your own profile image');
    }

    // Get form data
    console.log('[UPLOAD-IMAGE] Parsing form data...');
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      console.log('[UPLOAD-IMAGE] ERROR: No file provided');
      return errors.badRequest('No image file provided');
    }

    console.log('[UPLOAD-IMAGE] File received:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      console.log('[UPLOAD-IMAGE] ERROR: Invalid file type:', file.type);
      return errors.badRequest('Invalid file type. Only JPEG, PNG, and WebP are allowed');
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.log('[UPLOAD-IMAGE] ERROR: File too large:', file.size, 'bytes');
      return errors.badRequest('File size too large. Maximum size is 5MB');
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    console.log('[UPLOAD-IMAGE] Upload directory:', uploadDir);
    
    try {
      await mkdir(uploadDir, { recursive: true });
      console.log('[UPLOAD-IMAGE] Upload directory ready');
    } catch (err) {
      console.log('[UPLOAD-IMAGE] Directory already exists or error:', err);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${id}_${timestamp}.${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);
    console.log('[UPLOAD-IMAGE] Saving file to:', filePath);
    console.log('[UPLOAD-IMAGE] File name:', fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);
    console.log('[UPLOAD-IMAGE] File saved successfully');

    // Update user's image in database
    const imageUrl = `/uploads/avatars/${fileName}`;
    console.log('[UPLOAD-IMAGE] Image URL:', imageUrl);
    
    await connectDB();
    console.log('[UPLOAD-IMAGE] Database connected');
    
    const user = await User.findByIdAndUpdate(
      id,
      { image: imageUrl },
      { new: true }
    ).select('-password');

    if (!user) {
      console.log('[UPLOAD-IMAGE] ERROR: User not found in database');
      return errors.notFound('User not found');
    }

    console.log('[UPLOAD-IMAGE] User updated successfully:', {
      userId: user._id,
      userName: user.name,
      imageUrl: user.image
    });

    console.log('[UPLOAD-IMAGE] Upload process completed successfully');
    
    return success({
      imageUrl,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image,
      }
    }, 'Profile image uploaded successfully');
  } catch (error) {
    console.error('[UPLOAD-IMAGE] CRITICAL ERROR:', error);
    console.error('[UPLOAD-IMAGE] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return handleError(error);
  }
}
