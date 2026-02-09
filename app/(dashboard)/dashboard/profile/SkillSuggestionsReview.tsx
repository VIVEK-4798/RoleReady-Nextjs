'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks';
import { useToast } from '@/components/ui';

interface SkillSuggestion {
  skill_id: string;
  skill_name: string;
  domain?: string;
  confidence?: number;
}

interface SkillSuggestionsReviewProps {
  onSkillsAdded?: (count: number) => void;
}

export default function SkillSuggestionsReview({ onSkillsAdded }: SkillSuggestionsReviewProps) {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [suggestions, setSuggestions] = useState<SkillSuggestion[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [needsParsing, setNeedsParsing] = useState(true); // Default to true to show button initially

  useEffect(() => {
    if (user?.id) {
      fetchSuggestions();
    }
  }, [user?.id]);

  const fetchSuggestions = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${user.id}/resume/suggestions`);
      const apiResponse = await response.json();
      
      console.log('[SkillSuggestions] Fetch response:', apiResponse);
      
      if (apiResponse.success && apiResponse.data) {
        const data = apiResponse.data; // Access nested data
        const count = data.count || 0;
        const suggestionsList = data.suggestions || [];
        
        if (count > 0 && suggestionsList.length > 0) {
          console.log(`[SkillSuggestions] Found ${count} suggestions`);
          setSuggestions(suggestionsList);
          setShowSuggestions(true);
          setNeedsParsing(false);
          
          // Auto-select all suggestions by default
          const skillIds: string[] = suggestionsList.map((s: SkillSuggestion) => s.skill_id);
          const allIds = new Set<string>(skillIds);
          setSelectedSkills(allIds);
        } else {
          // No suggestions means resume needs parsing
          console.log('[SkillSuggestions] No suggestions, needs parsing');
          setSuggestions([]);
          setShowSuggestions(false);
          setNeedsParsing(true);
        }
      }
    } catch (error) {
      console.error('[SkillSuggestions] Failed to fetch suggestions:', error);
      // On error, assume resume needs parsing
      setNeedsParsing(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleParseResume = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${user.id}/resume/parse`, {
        method: 'POST',
      });
      const apiResponse = await response.json();
      
      console.log('[SkillSuggestions] Parse response:', apiResponse);
      
      if (apiResponse.success && apiResponse.data) {
        const data = apiResponse.data; // Access nested data
        const newSuggestions = data.new_suggestions || 0;
        const totalSkills = data.total_skills_found || 0;
        
        if (newSuggestions > 0) {
          addToast('success', `🎉 Found ${newSuggestions} new skills in your resume!`);
        } else if (totalSkills > 0) {
          addToast('info', `Found ${totalSkills} skills, but you already have them all!`);
        } else {
          addToast('info', 'No matching skills found. The skills in your resume might not be in our database yet.');
        }
        await fetchSuggestions();
      } else {
        addToast('error', apiResponse.error || 'Failed to parse resume');
      }
    } catch (error) {
      console.error('Failed to parse resume:', error);
      addToast('error', 'Failed to parse resume');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSkillSelection = (skillId: string) => {
    const newSelected = new Set(selectedSkills);
    if (newSelected.has(skillId)) {
      newSelected.delete(skillId);
    } else {
      newSelected.add(skillId);
    }
    setSelectedSkills(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedSkills.size === suggestions.length) {
      setSelectedSkills(new Set<string>());
    } else {
      const skillIds: string[] = suggestions.map(s => s.skill_id);
      const allIds = new Set<string>(skillIds);
      setSelectedSkills(allIds);
    }
  };

  const handleConfirmSkills = async () => {
    if (!user?.id || selectedSkills.size === 0) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/users/${user.id}/resume/suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accepted_skill_ids: Array.from(selectedSkills),
          level: 'intermediate',
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        const count = data.added_count || selectedSkills.size;
        addToast('success', `✅ Successfully added ${count} skill${count !== 1 ? 's' : ''} to your profile!`);
        setShowSuggestions(false);
        setSuggestions([]);
        setSelectedSkills(new Set());
        
        if (onSkillsAdded) {
          onSkillsAdded(count);
        }
      } else {
        addToast('error', data.error || 'Failed to add skills');
      }
    } catch (error) {
      console.error('Failed to confirm skills:', error);
      addToast('error', 'Failed to add skills');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDismiss = () => {
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedSkills(new Set());
  };

  // Debug logging
  console.log('[SkillSuggestions] Render state:', {
    needsParsing,
    showSuggestions,
    suggestionsCount: suggestions.length,
    isLoading,
    isSaving
  });

  if (isLoading && suggestions.length === 0 && !needsParsing) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <p className="text-sm font-medium text-blue-700">Checking for skill suggestions...</p>
        </div>
      </div>
    );
  }

  if (needsParsing) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-blue-900 mb-2">🚀 Extract Skills from Your Resume</h4>
            <p className="text-sm text-blue-800 mb-4 leading-relaxed">
              Let AI analyze your resume and automatically suggest skills to add to your profile. Save time and ensure you don't miss any important skills!
            </p>
            <button
              onClick={handleParseResume}
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-md"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Analyzing Resume...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Extract Skills Now
                </span>
              )}
            </button>
            <p className="text-xs text-blue-600 mt-2">
              ✨ This usually takes 2-5 seconds
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show suggestions if available
  if (showSuggestions && suggestions.length > 0) {
    return (
      <div className="bg-white rounded-xl border-2 border-green-200 p-6 shadow-md">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              🎉 {suggestions.length} Skills Found in Your Resume!
            </h3>
            <p className="text-sm text-gray-600">
              Review and select the skills you want to add to your profile. All are pre-selected for your convenience.
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          title="Dismiss"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Select All */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
        <button
          onClick={handleSelectAll}
          className="text-sm font-semibold text-[#5693C1] hover:text-[#4a82b0] transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {selectedSkills.size === suggestions.length ? 'Deselect All' : 'Select All'}
        </button>
        <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
          {selectedSkills.size} of {suggestions.length} selected
        </span>
      </div>

      {/* Skill List */}
      <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
        {suggestions.map((skill) => (
          <label
            key={skill.skill_id}
            className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
              selectedSkills.has(skill.skill_id)
                ? 'border-[#5693C1] bg-blue-50 shadow-sm'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedSkills.has(skill.skill_id)}
              onChange={() => toggleSkillSelection(skill.skill_id)}
              className="w-5 h-5 text-[#5693C1] border-gray-300 rounded focus:ring-[#5693C1] cursor-pointer"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">{skill.skill_name}</span>
                {skill.domain && (
                  <span className="text-xs px-2.5 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full font-medium">
                    {skill.domain}
                  </span>
                )}
              </div>
            </div>
            {selectedSkills.has(skill.skill_id) && (
              <svg className="w-5 h-5 text-[#5693C1]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </label>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t-2 border-gray-200">
        <button
          onClick={handleDismiss}
          className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={isSaving}
        >
          Dismiss
        </button>
        <button
          onClick={handleConfirmSkills}
          disabled={isSaving || selectedSkills.size === 0}
          className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Adding...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add {selectedSkills.size} Skill{selectedSkills.size !== 1 ? 's' : ''} to Profile
            </>
          )}
        </button>
      </div>
    </div>
    );
  }

  // Fallback - should not reach here
  return null;
}
