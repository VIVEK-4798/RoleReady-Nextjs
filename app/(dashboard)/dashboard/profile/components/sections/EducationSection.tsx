import { ProfileSection } from '../ProfileSection';

interface Education {
  _id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
  description?: string;
}

interface EducationSectionProps {
  education?: Education[];
  onEdit: () => void;
}

export function EducationSection({ education, onEdit }: EducationSectionProps) {
  return (
    <ProfileSection
      title="Education"
      icon="academic"
      onEdit={onEdit}
      imageSrc="/images/education-section.svg" // Add your image path here
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Education</h3>
        <p className="text-gray-600 mb-4">
          Showcase your academic journey and open doors to your dream career opportunities!
        </p>
        {education?.length ? (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            {education.map((edu) => (
              <div key={edu._id} className="border-l-2 border-green-400 pl-4">
                <h4 className="font-semibold text-gray-900">{edu.institution}</h4>
                <p className="text-gray-700">
                  {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                </p>
                {edu.startDate && (
                  <p className="text-sm text-gray-500">
                    {edu.startDate} - {edu.endDate || 'Present'}
                  </p>
                )}
                {edu.grade && (
                  <p className="text-sm text-gray-500">Grade: {edu.grade}</p>
                )}
              </div>
            ))}
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
              Add Education
            </button>
          </div>
        )}
      </div>
    </ProfileSection>
  );
}