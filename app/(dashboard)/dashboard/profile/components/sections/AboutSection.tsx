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
    >
      {bio ? (
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{bio}</p>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">Add a short bio about yourself...</p>
      )}
    </ProfileSection>
  );
}
