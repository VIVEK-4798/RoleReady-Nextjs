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
      imageSrc="/images/projects-section.svg" // Add your image path here
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Projects</h3>
        <p className="text-gray-600 mb-4">
          Unveil your projects to the world and pave your path to professional greatness!
        </p>
        {projects?.length ? (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            {projects.map((proj) => (
              <div key={proj._id} className="border-l-2 border-indigo-400 pl-4 relative group">
                <button
                  onClick={() => onEditProject(proj)}
                  className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:text-blue-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <h4 className="font-semibold text-gray-900">{proj.name}</h4>
                {proj.description && (
                  <p className="text-gray-700 text-sm">{proj.description}</p>
                )}
                {proj.url && (
                  <a
                    href={proj.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {proj.url}
                  </a>
                )}
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {proj.technologies.map((tech, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
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
              Add Projects
            </button>
          </div>
        )}
      </div>
    </ProfileSection>
  );
}