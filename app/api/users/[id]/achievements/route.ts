/**
 * User Achievements API Routes
 * 
 * GET /api/users/[id]/achievements - Get user's achievements
 * POST /api/users/[id]/achievements - Add achievement
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
 * GET /api/users/[id]/achievements
 * Get all achievements for a user
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
      return errors.forbidden('You can only access your own achievements');
    }

    await connectDB();

    const user = await User.findById(id).select('profile.achievements');

    if (!user) {
      return errors.notFound('User not found');
    }

    return success(user.profile?.achievements || []);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/users/[id]/achievements
 * Add a new achievement or update existing one
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
      return errors.forbidden('You can only update your own achievements');
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title) {
      return errors.badRequest('Achievement title is required');
    }

    await connectDB();

    const user = await User.findById(id);

    if (!user) {
      return errors.notFound('User not found');
    }

    console.log('[ACHIEVEMENT-API] User profile before:', user.profile);
    console.log('[ACHIEVEMENT-API] Achievements before:', user.profile?.achievements);

    // Ensure profile and achievements array exist - initialize in DB if needed
    if (!user.profile) {
      user.profile = {
        education: [],
        experience: [],
        projects: [],
        certificates: [],
        achievements: [],
      } as any;
      await user.save();
      console.log('[ACHIEVEMENT-API] Initialized profile in DB');
    }
    
    if (!user.profile.achievements) {
      user.profile.achievements = [];
      await user.save();
      console.log('[ACHIEVEMENT-API] Initialized achievements array in DB');
    }

    console.log('[ACHIEVEMENT-API] Request body:', body);
    console.log('[ACHIEVEMENT-API] Achievements array exists:', !!user.profile.achievements);
    console.log('[ACHIEVEMENT-API] Achievements length:', user.profile.achievements?.length);

    // Check if we're updating an existing achievement
    if (body._id !== undefined && body._id !== null && user.profile.achievements.length > 0) {
      // Update existing achievement by index or _id
      let achievementIndex = -1;
      
      // Try to find by _id string match
      if (typeof body._id === 'string' || typeof body._id === 'number') {
        achievementIndex = Number(body._id);
        
        // If it's not a valid index, try finding by MongoDB _id
        if (achievementIndex < 0 || achievementIndex >= user.profile.achievements.length) {
          achievementIndex = user.profile.achievements.findIndex(
            (a: any) => a._id && a._id.toString() === body._id.toString()
          );
        }
      }
      
      if (achievementIndex >= 0 && achievementIndex < user.profile.achievements.length) {
        // Update existing achievement using MongoDB update
        const updateData = {
          title: body.title,
          description: body.description,
          issuer: body.issuer,
          date: body.date ? new Date(body.date) : undefined,
        };
        
        const updatedUser = await User.findOneAndUpdate(
          { 
            _id: id,
          },
          { 
            $set: { 
              [`profile.achievements.${achievementIndex}`]: {
                ...user.profile.achievements[achievementIndex],
                ...updateData
              }
            } 
          },
          { 
            new: true,
            runValidators: true 
          }
        );
        
        if (!updatedUser || !updatedUser.profile?.achievements) {
          return errors.notFound('User not found after update');
        }
        
        const achievements = updatedUser.profile.achievements;
        return success(achievements[achievementIndex], 'Achievement updated successfully');
      }
    }

    // Add new achievement
    const newAchievement = {
      title: body.title,
      description: body.description,
      issuer: body.issuer,
      date: body.date ? new Date(body.date) : undefined,
    };

    console.log('[ACHIEVEMENT-API] New achievement to add:', newAchievement);
    
    // Add achievement directly to the user document and save
    user.profile.achievements.push(newAchievement);
    await user.save();
    
    console.log('[ACHIEVEMENT-API] User saved. Achievements count:', user.profile.achievements.length);
    
    // Re-fetch to verify the save
    const verifyUser = await User.findById(id);
    console.log('[ACHIEVEMENT-API] Verify - Achievements in DB:', verifyUser?.profile?.achievements);
    console.log('[ACHIEVEMENT-API] Verify - Achievements count:', verifyUser?.profile?.achievements?.length);
    
    if (!verifyUser || !verifyUser.profile?.achievements || verifyUser.profile.achievements.length === 0) {
      return errors.serverError('Failed to add achievement - not found in database after save');
    }

    // Return the newly added achievement (last item)
    const addedAchievement = user.profile.achievements[user.profile.achievements.length - 1];

    console.log('[ACHIEVEMENT-API] Returning achievement:', addedAchievement);
    return success(addedAchievement, 'Achievement added successfully', 201);
  } catch (error) {
    return handleError(error);
  }
}
