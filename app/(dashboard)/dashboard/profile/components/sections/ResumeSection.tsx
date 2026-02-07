import { ProfileSection } from '../ProfileSection';

interface ResumeInfo {
  hasResume: boolean;
  fileName?: string;
  uploadedAt?: string;
}

interface ResumeSectionProps {
  resume: ResumeInfo | null;
  onEdit: () => void;
  formatDate: (dateString?: string) => string;
}

export function ResumeSection({ resume, onEdit, formatDate }: ResumeSectionProps) {
  return (
    <ProfileSection
      title="Resume"
      icon="document"
      onEdit={onEdit}
      imageSrc="/images/resume-section.svg" // Add your image path here
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Resume</h3>
        <p className="text-gray-600 mb-4">
          Add your Resume & get your profile filled in a click!
        </p>
        {resume?.hasResume ? (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-600 font-medium">Resume uploaded</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm">{resume.fileName}</span>
            </div>
            {resume.uploadedAt && (
              <p className="text-xs text-gray-500 ml-6">
                Uploaded on {formatDate(resume.uploadedAt)}
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
            <button
              onClick={onEdit}
              className="px-6 py-3 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              style={{ backgroundColor: '#5693C1' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload Resume
            </button>
          </div>
        )}
      </div>
    </ProfileSection>
  );
}