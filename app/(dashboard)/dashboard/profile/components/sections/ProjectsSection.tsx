import { ProfileSection } from '../ProfileSection';

interface Project {
  _id: string;
  name: string;
  description?: string;
  url?: string;
  githubUrl?: string;
  technologies?: string[];
  startDate?: string;
  endDate?: string;
  isOngoing?: boolean;
}

interface ProjectsSectionProps {
  projects?: Project[];
  onAdd: () => void;
  onEditProject: (proj: Project) => void;
}

export function ProjectsSection({ projects, onAdd, onEditProject }: ProjectsSectionProps) {
  return (
    <ProfileSection
      title="Projects"
      icon="folder"
      onAdd={onAdd}
    >
      {projects?.length ? (
        <div className="space-y-4">
          {projects.map((proj) => (
            <div key={proj._id} className="border-l-2 border-orange-200 dark:border-orange-800 pl-4 relative group">
              <button
                onClick={() => onEditProject(proj)}
                className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:text-blue-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <h4 className="font-semibold text-gray-900 dark:text-white">{proj.name}</h4>
              {proj.description && (
                <p className="text-gray-700 dark:text-gray-300 text-sm">{proj.description}</p>
              )}
              {proj.url && (
                <a
                  href={proj.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {proj.url}
                </a>
              )}
              {proj.technologies && proj.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {proj.technologies.map((tech, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <button
          onClick={onAdd}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Add Projects
        </button>
      )}
    </ProfileSection>
  );
}
