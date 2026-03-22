import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { User } from '@/lib/models';
import connectDB from '@/lib/db/mongoose';
import { UsageService } from '@/lib/services/usageService';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.user.id).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const usageStatus = await UsageService.getUsageStatus(user);

    return NextResponse.json(usageStatus);
  } catch (error: any) {
    console.error('Usage API Error:', error);
    return NextResponse.json({ error: 'Failed to get usage status' }, { status: 500 });
  }
}
