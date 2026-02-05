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
    >
      {education?.length ? (
        <div className="space-y-4">
          {education.map((edu) => (
            <div key={edu._id} className="border-l-2 border-green-200 dark:border-green-800 pl-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">{edu.institution}</h4>
              <p className="text-gray-700 dark:text-gray-300">
                {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
              </p>
              {edu.startDate && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {edu.startDate} - {edu.endDate || 'Present'}
                </p>
              )}
              {edu.grade && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Grade: {edu.grade}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <button
          onClick={onEdit}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Add Education
        </button>
      )}
    </ProfileSection>
  );
}
