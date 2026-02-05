import { ProfileSection } from '../ProfileSection';

interface Certificate {
  name: string;
  issuer?: string;
  issueDate?: Date | string;
  expiryDate?: Date | string;
  url?: string;
}

interface CertificatesSectionProps {
  certificates?: Certificate[];
  onAdd: () => void;
  onEditCertificate: (cert: Certificate) => void;
}

export function CertificatesSection({ certificates, onAdd, onEditCertificate }: CertificatesSectionProps) {
  return (
    <ProfileSection
      title="Certificates"
      icon="badge"
      onAdd={onAdd}
    >
      {certificates?.length ? (
        <div className="space-y-4">
          {certificates.map((cert, index) => (
            <div key={index} className="border-l-2 border-purple-200 dark:border-purple-800 pl-4 relative group">
              <button
                onClick={() => onEditCertificate(cert)}
                className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:text-blue-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <h4 className="font-semibold text-gray-900 dark:text-white">{cert.name}</h4>
              <p className="text-gray-600 dark:text-gray-400">by {cert.issuer}</p>
              {cert.issueDate && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Issued: {new Date(cert.issueDate).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <button
          onClick={onAdd}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Add Certificate
        </button>
      )}
    </ProfileSection>
  );
}
