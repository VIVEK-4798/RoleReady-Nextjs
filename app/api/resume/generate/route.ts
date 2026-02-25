import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ResumePDF } from '@/components/resume/ResumePDF';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import connectDB from '@/lib/db/mongoose';
import { User } from '@/lib/models';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();

        // 1. Generate the PDF buffer
        const buffer = await renderToBuffer(React.createElement(ResumePDF, { data }) as any) as any;

        // 2. Set the "has generated resume" flag for the user
        await connectDB();
        await User.findByIdAndUpdate(session.user.id, {
            $set: { 'profile.hasGeneratedResume': true }
        });

        return new NextResponse(buffer as any, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Resume_${data.contact.fullName.replace(/\s+/g, '_')}.pdf"`,
            },
        });
    } catch (error) {
        console.error('PDF Generation Error:', error);
        return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
    }
}
