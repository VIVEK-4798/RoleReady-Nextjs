import React from 'react';

export default function InternshipSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
            <div className="h-6 bg-gray-100 rounded-md w-3/4 mb-4" />
            <div className="h-4 bg-gray-100 rounded-md w-1/2 mb-6" />

            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="h-8 bg-gray-50 rounded-lg" />
                <div className="h-8 bg-gray-50 rounded-lg" />
            </div>

            <div className="h-10 bg-gray-50 rounded-xl mb-6" />

            <div className="space-y-2 mb-8">
                <div className="h-3 bg-gray-50 rounded w-full" />
                <div className="h-3 bg-gray-50 rounded w-5/6" />
                <div className="h-3 bg-gray-50 rounded w-4/5" />
            </div>

            <div className="pt-6 border-t border-gray-50 flex justify-between">
                <div className="h-3 bg-gray-50 rounded w-20" />
                <div className="h-3 bg-gray-50 rounded w-24" />
            </div>
        </div>
    );
}
