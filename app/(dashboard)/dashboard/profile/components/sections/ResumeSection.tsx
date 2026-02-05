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
    >
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
        Add your Resume & get your profile filled in a click!
      </p>
      {resume?.hasResume ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-green-600 dark:text-green-400 font-medium">Resume uploaded</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm">{resume.fileName}</span>
          </div>
          {resume.uploadedAt && (
            <p className="text-xs text-gray-500 dark:text-gray-500 ml-6">
              Uploaded on {formatDate(resume.uploadedAt)}
            </p>
          )}
        </div>
      ) : (
        <button
          onClick={onEdit}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Upload Resume
        </button>
      )}
    </ProfileSection>
  );
}
