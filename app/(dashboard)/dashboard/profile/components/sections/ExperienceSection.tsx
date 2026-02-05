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
    >
      {experiences?.length ? (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <div key={exp._id} className="border-l-2 border-blue-200 dark:border-blue-800 pl-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {exp.title} <span className="font-normal text-gray-600 dark:text-gray-400">at</span> {exp.company}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
              </p>
              {exp.location && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{exp.location}</p>
              )}
              {exp.description && (
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{exp.description}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <button
          onClick={onEdit}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Add Work Experience
        </button>
      )}
    </ProfileSection>
  );
}
