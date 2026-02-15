'use client';

import { useState } from 'react';

interface ConsentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isSubmitting: boolean;
}

export default function ConsentModal({ isOpen, onClose, onConfirm, isSubmitting }: ConsentModalProps) {
    const [accepted, setAccepted] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Confirm Role Transition
                </h2>

                <div className="space-y-4 text-sm text-gray-600 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <p className="font-medium text-gray-800">
                        Becoming a mentor changes your account type. Please acknowledge the following:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Access Changes:</strong> Student-specific tools (readiness analytics, personal roadmap) may be disabled or change focus.</li>
                        <li><strong>Dashboard Update:</strong> Your interface will prioritize mentor tasks like validating skills and reviewing mentees.</li>
                        <li><strong>Responsibility:</strong> You agree to provide professional guidance and uphold community standards.</li>
                        <li><strong>Review Process:</strong> Submitting this application does not guarantee immediate approval. An admin will review your profile.</li>
                    </ul>
                </div>

                <div className="flex items-start gap-3 mb-6 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => !isSubmitting && setAccepted(!accepted)}>
                    <div className="pt-0.5">
                        <input
                            type="checkbox"
                            disabled={isSubmitting}
                            checked={accepted}
                            onChange={(e) => setAccepted(e.target.checked)}
                            className="w-5 h-5 text-[#5693C1] rounded border-gray-300 focus:ring-[#5693C1] cursor-pointer"
                        />
                    </div>
                    <label className="text-sm font-medium text-gray-800 cursor-pointer select-none">
                        I understand and agree to the role change and its impact on my account features.
                    </label>
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!accepted || isSubmitting}
                        className={`px-6 py-2 text-sm font-bold text-white rounded-lg transition-colors shadow-sm flex items-center gap-2
                            ${accepted && !isSubmitting
                                ? 'bg-[#5693C1] hover:bg-[#4a80b0]'
                                : 'bg-gray-300 cursor-not-allowed'}`}
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </>
                        ) : 'Accept & Submit Application'}
                    </button>
                </div>
            </div>
        </div>
    );
}
