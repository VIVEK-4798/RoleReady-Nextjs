import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ResumePDF } from '@/components/resume/ResumePDF';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.json();

        // In a real production app, you might want to re-validate eligibility 
        // or re-fetch data from DB here to ensure the source of truth is the server.
        // However, the request specifically said "Generate on demand" and "Use structured data only".
        // We pass data from client to API for immediate generation based on what user sees.

        const buffer = await renderToBuffer(React.createElement(ResumePDF, { data }));

        return new NextResponse(buffer, {
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
