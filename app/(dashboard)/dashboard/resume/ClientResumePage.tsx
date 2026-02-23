'use client';

import React, { useState } from 'react';
import { ResumeData } from '@/types/resume';
import ResumePreview from '@/components/resume/ResumePreview';
import { toast } from 'react-hot-toast';

interface ClientResumePageProps {
    initialData: ResumeData;
}

export default function ClientResumePage({ initialData }: ClientResumePageProps) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const response = await fetch('/api/resume/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(initialData),
            });

            if (!response.ok) {
                throw new Error('Failed to generate PDF');
            }

            // Handle binary response
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Resume_${initialData.contact.fullName.replace(/\s+/g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Resume downloaded successfully!');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to generate PDF. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <ResumePreview
                data={initialData}
                onDownload={handleDownload}
                isDownloading={isDownloading}
            />
        </div>
    );
}
