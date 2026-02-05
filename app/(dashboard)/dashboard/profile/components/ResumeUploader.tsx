'use client';
import { useState } from 'react';

interface ResumeUploaderProps {
  userId: string;
  onSuccess: () => void;
}

export function ResumeUploader({ userId, onSuccess }: ResumeUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`/api/users/${userId}/resume`, {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || 'Failed to upload resume');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload resume');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
          id="resume-input"
        />
        <label
          htmlFor="resume-input"
          className="cursor-pointer flex flex-col items-center"
        >
          <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="text-blue-600 dark:text-blue-400 font-medium">
            {file ? file.name : 'Choose a file or drag it here'}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">PDF, DOC, DOCX up to 10MB</span>
        </label>
      </div>
      
      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
      )}
      
      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
      >
        {isUploading ? 'Uploading...' : 'Upload Resume'}
      </button>
    </div>
  );
}
