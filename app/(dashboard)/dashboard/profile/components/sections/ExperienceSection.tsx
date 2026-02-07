import { ProfileSection } from '../ProfileSection';

interface Experience {
  _id: string;
  company: string;
  title: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
  skills?: string[];
}

interface ExperienceSectionProps {
  experiences?: Experience[];
  onEdit: () => void;
}

export function ExperienceSection({ experiences, onEdit }: ExperienceSectionProps) {
  return (
    <ProfileSection
      title="Work Experience"
      icon="briefcase"
      onEdit={onEdit}
      imageSrc="/images/experience-section.svg" // Add your image path here
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Work Experience</h3>
        <p className="text-gray-600 mb-4">
          Narrate your professional journey and fast-track your way to new career heights!
        </p>
        {experiences?.length ? (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            {experiences.map((exp) => (
              <div key={exp._id} className="border-l-2 border-blue-400 pl-4">
                <h4 className="font-semibold text-gray-900">
                  {exp.title} <span className="font-normal text-gray-600">at</span> {exp.company}
                </h4>
                <p className="text-sm text-gray-500">
                  {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                </p>
                {exp.location && (
                  <p className="text-sm text-gray-500">{exp.location}</p>
                )}
                {exp.description && (
                  <p className="text-sm text-gray-700 mt-1">{exp.description}</p>
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
              Add Work Experience
            </button>
          </div>
        )}
      </div>
    </ProfileSection>
  );
}