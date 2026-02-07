'use client';
import { useState, useRef } from 'react';

interface ResumeUploaderProps {
  userId: string;
  onSuccess: () => void;
}

export function ResumeUploader({ userId, onSuccess }: ResumeUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) return;
    
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF, DOC, or DOCX file');
      return;
    }
    
    if (selectedFile.size > maxSize) {
      setError('File size must be less than 10MB');
      return;
    }
    
    setFile(selectedFile);
    setError('');
  };

  const handleUpload = async () => {
    if (!file || !userId) return;
    
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
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
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

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center cursor-pointer transition-colors ${
          dragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400'
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
          className="hidden"
          id="resume-input"
        />
        
        <div className="flex flex-col items-center">
          {file ? (
            <>
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-gray-900 truncate max-w-full">
                {file.name}
              </span>
              <p className="text-sm text-gray-500 mt-1">
                {(file.size / (1024 * 1024)).toFixed(2)} MB • Click to change
              </p>
            </>
          ) : (
            <>
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-blue-600 font-medium">
                Choose a file or drag it here
              </span>
              <span className="text-sm text-gray-500 mt-1">PDF, DOC, DOCX up to 10MB</span>
            </>
          )}
        </div>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </p>
        </div>
      )}
      
      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className="w-full py-3 text-white rounded-lg transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#5693C1' }}
      >
        {isUploading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Uploading...
          </span>
        ) : 'Upload Resume'}
      </button>
    </div>
  );
}