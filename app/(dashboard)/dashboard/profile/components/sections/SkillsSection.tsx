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
    >
      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => {
            const badge = getValidationBadge(skill);
            return (
              <div
                key={skill._id}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                  skill.validationStatus === 'validated'
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400 dark:border-blue-600'
                    : skill.validationStatus === 'rejected'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-600'
                    : 'bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600'
                }`}
              >
                <span className="font-medium text-gray-900 dark:text-white">{skill.skillName}</span>
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
        <button
          onClick={onEdit}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Add Skills
        </button>
      )}
    </ProfileSection>
  );
}
