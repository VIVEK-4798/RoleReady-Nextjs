/**
 * Add Internship Page
 * 
 * Comprehensive form to create a new internship listing.
 */

import { Metadata } from 'next';
import AddInternshipForm from './AddInternshipForm';

export const metadata: Metadata = {
  title: 'Add New Internship | RoleReady Mentor',
  description: 'Create a new internship opportunity with detailed information about responsibilities, requirements, and benefits.',
};

export default function AddInternshipPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#5693C1] to-[#4a80b0] flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create New Internship</h1>
            <p className="mt-2 text-gray-600">
              Fill out the form below to post a new internship opportunity. Detailed listings receive more applications.
            </p>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center gap-2 mt-6">
          {[
            { number: 1, label: 'Basic Info', active: true },
            { number: 2, label: 'Location & Type' },
            { number: 3, label: 'Stipend & Duration' },
            { number: 4, label: 'Requirements' },
            { number: 5, label: 'Review & Submit' },
          ].map((step, index) => (
            <div key={step.number} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                step.active 
                  ? 'bg-[#5693C1] text-white' 
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {step.number}
              </div>
              <span className={`text-sm font-medium ${
                step.active ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
              {index < 4 && (
                <div className="w-8 h-0.5 bg-gray-200 mx-2"></div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Form */}
      <AddInternshipForm />
      
      {/* Help Section */}
      <div className="mt-8 p-6 bg-gradient-to-r from-[#5693C1]/5 to-[#4a80b0]/5 border border-[#5693C1]/20 rounded-xl">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#5693C1] flex items-center justify-center text-white flex-shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Tips for Creating Effective Internships</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <span className="font-medium">Be specific</span> about responsibilities and learning outcomes</li>
              <li>• <span className="font-medium">Highlight benefits</span> beyond just the stipend</li>
              <li>• <span className="font-medium">Set realistic requirements</span> for student applicants</li>
              <li>• <span className="font-medium">Provide clear application instructions</span> and deadlines</li>
              <li>• <span className="font-medium">Featured internships</span> receive 3x more applications</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}