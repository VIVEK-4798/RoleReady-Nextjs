interface ModalProps {
  title: string;
  onClose: () => void;
  onSave?: () => void;
  isSaving?: boolean;
  hideFooter?: boolean;
  children: React.ReactNode;
}

export function Modal({ title, onClose, onSave, isSaving, hideFooter, children }: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 sm:p-6 space-y-4">{children}</div>
        
        {!hideFooter && (
          <div className="sticky bottom-0 bg-gray-50 px-4 sm:px-6 py-4 flex flex-col sm:flex-row gap-3 justify-end border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className="px-4 py-2 text-white rounded-lg transition-colors font-medium disabled:opacity-70 order-1 sm:order-2"
              style={{ backgroundColor: '#5693C1' }}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}