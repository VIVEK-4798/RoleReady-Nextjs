import { ProfileSection } from '../ProfileSection';

interface UserSkill {
  _id: string;
  skillId: string;
  skillName: string;
  level: string;
  source: string;
  validationStatus: string;
  validatedBy?: string;
  validatedAt?: string;
  rejectionReason?: string;
}

interface SkillsSectionProps {
  skills: UserSkill[];
  onEdit: () => void;
  getValidationBadge: (skill: UserSkill) => { icon: string; label: string; className: string };
  getLevelColor: (level: string) => string;
}

export function SkillsSection({ skills, onEdit, getValidationBadge, getLevelColor }: SkillsSectionProps) {
  return (
    <ProfileSection
      title="Skills"
      icon="skills"
      onEdit={onEdit}
      imageSrc="/images/skills-section.svg" // Add your image path here
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills</h3>
        <p className="text-gray-600 mb-4">
          Spotlight your unique skills and catch the eye of recruiters looking for your exact talents!
        </p>
        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
            {skills.map((skill) => {
              const badge = getValidationBadge(skill);
              return (
                <div
                  key={skill._id}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                    skill.validationStatus === 'validated'
                      ? 'bg-blue-50 border-2 border-blue-400'
                      : skill.validationStatus === 'rejected'
                      ? 'bg-yellow-50 border border-yellow-400'
                      : 'bg-gray-100 border border-gray-300'
                  }`}
                >
                  <span className="font-medium text-gray-900">{skill.skillName}</span>
                  <span className={`text-xs ${getLevelColor(skill.level)}`}>
                    ({skill.level})
                  </span>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${badge.className}`}>
                    {badge.icon}
                  </span>
                </div>
              );
            })}
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
              Add Skills
            </button>
          </div>
        )}
      </div>
    </ProfileSection>
  );
}