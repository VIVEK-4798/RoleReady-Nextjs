import { ProfileSection } from '../ProfileSection';

interface Responsibility {
  _id: string;
  title: string;
  description: string;
  company?: string;
  startDate?: string;
  endDate?: string;
}

interface ResponsibilitiesSectionProps {
  responsibilities?: Responsibility[];
  onAdd: () => void;
  onEditResponsibility: (resp: Responsibility) => void;
}

export function ResponsibilitiesSection({ responsibilities, onAdd, onEditResponsibility }: ResponsibilitiesSectionProps) {
  return (
    <ProfileSection
      title="Responsibilities"
      icon="briefcase"
      onAdd={onAdd}
      imageSrc="/images/responsibilities-section.svg" // Add your image path here
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Responsibilities</h3>
        <p className="text-gray-600 mb-4">
          Highlight the responsibilities you've mastered to demonstrate your leadership and expertise!
        </p>
        {responsibilities?.length ? (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            {responsibilities.map((resp) => (
              <div key={resp._id} className="border-l-2 border-purple-400 pl-4 relative group">
                <button
                  onClick={() => onEditResponsibility(resp)}
                  className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:text-blue-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <h4 className="font-semibold text-gray-900">{resp.title}</h4>
                {resp.company && (
                  <p className="text-sm text-gray-600">at {resp.company}</p>
                )}
                <p className="text-gray-700 text-sm mt-1">{resp.description}</p>
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
              Add Responsibility
            </button>
          </div>
        )}
      </div>
    </ProfileSection>
  );
}