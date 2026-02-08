/**
 * Skill Validation Queue Page
 * 
 * Review and validate user skills as a mentor.
 */

import { Metadata } from 'next';
import ValidationQueueClient from './ValidationQueueClient';

export const metadata: Metadata = {
  title: 'Skill Validation Queue | RoleReady Mentor',
  description: 'Review and validate student skills as a mentor. Approve or reject skill submissions with detailed feedback.',
};

export default function ValidationQueuePage() {
  return (
    <div className="py-6">
      <ValidationQueueClient />
      
      {/* Help Section */}
      <div className="mt-8 bg-gradient-to-r from-[#5693C1]/5 to-[#4a80b0]/5 border border-[#5693C1]/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#5693C1] flex items-center justify-center text-white flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Validation Guidelines</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Approve skills that are properly demonstrated with evidence</li>
              <li>• Reject skills that lack sufficient evidence or documentation</li>
              <li>• Always provide constructive feedback when rejecting</li>
              <li>• Consider the student&apos;s target role when evaluating relevance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}