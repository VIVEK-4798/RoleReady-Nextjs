import { ProfileSection } from '../ProfileSection';

interface Achievement {
  _id: string;
  title: string;
  description: string;
  date?: string;
  issuer?: string;
  url?: string;
}

interface AchievementsSectionProps {
  achievements?: Achievement[];
  onAdd: () => void;
  onEditAchievement: (achievement: Achievement) => void;
}

export function AchievementsSection({ achievements, onAdd, onEditAchievement }: AchievementsSectionProps) {
  return (
    <ProfileSection
      title="Achievements"
      icon="badge"
      onAdd={onAdd}
      imageSrc="/images/achievements-section.svg" // Add your image path here
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Achievements</h3>
        <p className="text-gray-600 mb-4">
          Broadcast your triumphs and make a remarkable impression on industry leaders!
        </p>
        {achievements?.length ? (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            {achievements.map((achievement) => (
              <div key={achievement._id} className="border-l-2 border-yellow-400 pl-4 relative group">
                <button
                  onClick={() => onEditAchievement(achievement)}
                  className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:text-blue-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                <p className="text-gray-700 text-sm mt-1">{achievement.description}</p>
                {achievement.date && (
                  <p className="text-xs text-gray-500 mt-1">{achievement.date}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
            <button
              onClick={onAdd}
              className="px-6 py-3 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              style={{ backgroundColor: '#5693C1' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Achievement
            </button>
          </div>
        )}
      </div>
    </ProfileSection>
  );
}