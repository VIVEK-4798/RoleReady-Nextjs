import { ProfileSection } from '../ProfileSection';

interface AboutSectionProps {
  bio?: string;
  onEdit: () => void;
}

export function AboutSection({ bio, onEdit }: AboutSectionProps) {
  return (
    <ProfileSection
      title="About"
      icon="user"
      onEdit={onEdit}
      imageSrc="/images/about-section.svg" // Add your image path here
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
        <p className="text-gray-600 mb-4">
          Spotlight your unique skills and catch the eye of recruiters looking for your exact talents!
        </p>
        {bio ? (
          <p className="text-gray-700 whitespace-pre-line p-4 bg-gray-50 rounded-lg border border-gray-200">{bio}</p>
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
              Add About Section
            </button>
          </div>
        )}
      </div>
    </ProfileSection>
  );
}