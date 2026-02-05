/**
 * DemoModal Component
 * 
 * Demo-only readiness experience for the landing page.
 * Migrated from old React.js project - preserves original structure and behavior.
 * 
 * KEY CHARACTERISTICS:
 * 1. Uses dedicated demo endpoints (/api/demo/*)
 * 2. Does NOT save to real readiness history
 * 3. Clearly labeled as "DEMO" throughout
 * 4. Prompts users to sign up for real tracking
 * 
 * REAL READINESS requires:
 * - User login
 * - Profile setup
 * - Target role selection
 */

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

interface Category {
  _id: string;
  name: string;
  description?: string;
}

interface Skill {
  _id: string;
  name: string;
  domain?: string;
  isRequired?: boolean;
}

interface BreakdownItem {
  skillId: string;
  skillName: string;
  status: 'met' | 'missing';
  weight: number;
}

interface DemoResult {
  percentage: number;
  totalScore: number;
  maxPossibleScore: number;
  skillsMet: number;
  skillsMissing: number;
  breakdown: BreakdownItem[];
  missingRequiredSkills: string[];
}

interface DemoModalProps {
  onClose: () => void;
}

export default function DemoModal({ onClose }: DemoModalProps) {
  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [demoResult, setDemoResult] = useState<DemoResult | null>(null);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  // Handle outside click to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Fetch categories (roles) on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/roles');
        const data = await res.json();
        
        if (data.success && data.data) {
          setCategories(data.data);
        }
      } catch (err) {
        console.error('[DemoModal] Failed to load categories:', err);
        setError('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  // Start demo session on mount
  useEffect(() => {
    const startSession = async () => {
      try {
        const res = await fetch('/api/demo/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        
        if (data.success && data.sessionId) {
          setSessionId(data.sessionId);
        }
      } catch (err) {
        console.error('[DemoModal] Failed to start session:', err);
      }
    };

    startSession();
  }, []);

  // Handle category change
  const handleCategoryChange = useCallback(async (categoryId: string) => {
    const selectedCategory = categories.find(cat => cat._id === categoryId);
    setCategoryName(selectedCategory?.name || '');
    setSelectedCategoryId(categoryId);
    setSelectedSkillIds([]);
    setSkills([]);
    setShowResult(false);
    setError('');

    if (!categoryId) return;

    try {
      const res = await fetch(`/api/skills?roleId=${categoryId}&limit=50`);
      const data = await res.json();

      if (data.success && data.data) {
        setSkills(data.data);
      } else {
        setSkills([]);
      }
    } catch (err) {
      console.error('[DemoModal] Error fetching skills:', err);
      setError('Failed to load skills');
    }
  }, [categories]);

  // Toggle skill selection
  const toggleSkill = (skillId: string) => {
    setSelectedSkillIds(prev =>
      prev.includes(skillId)
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  };

  // Reset to category selection
  const handleReset = () => {
    setShowResult(false);
    setSelectedSkillIds([]);
    setDemoResult(null);
  };

  // Analyze readiness (DEMO ONLY)
  const handleAnalyze = async () => {
    if (!selectedCategoryId || selectedSkillIds.length === 0 || !sessionId) return;

    setLoading(true);
    setError('');

    try {
      // 1. Save demo skills
      const saveRes = await fetch('/api/demo/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          skillIds: selectedSkillIds,
          roleId: selectedCategoryId,
        }),
      });

      if (!saveRes.ok) throw new Error('Failed to save demo skills');

      // 2. Calculate demo readiness
      const calcRes = await fetch('/api/demo/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          roleId: selectedCategoryId,
        }),
      });

      if (!calcRes.ok) throw new Error('Failed to calculate demo score');

      const result = await calcRes.json();
      
      if (result.success) {
        setDemoResult(result.data);
        setShowResult(true);
      } else {
        throw new Error(result.error || 'Calculation failed');
      }
    } catch (err) {
      console.error('[DemoModal] Error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isAnalyzeDisabled = !selectedCategoryId || selectedSkillIds.length === 0 || loading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          ✕
        </button>

        {!showResult ? (
          /* ===== INITIAL STATE: Selection Form ===== */
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Quick Readiness Demo
              </h3>
              <p className="text-gray-600">
                Select your target role and skills to see your readiness score
              </p>
            </div>

            {/* Category Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Role Category
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#5693C1] focus:border-transparent transition-all"
                value={selectedCategoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Skills Selection */}
            {selectedCategoryId && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    Skills You Have
                  </label>
                  <span className="text-sm text-[#5693C1] font-medium">
                    {selectedSkillIds.length} selected
                  </span>
                </div>

                {skills.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    <div className="flex flex-wrap gap-2">
                      {skills.map(skill => (
                        <button
                          key={skill._id}
                          type="button"
                          onClick={() => toggleSkill(skill._id)}
                          className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-all ${
                            selectedSkillIds.includes(skill._id)
                              ? 'bg-[#5693C1] text-white border-[#5693C1]'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-[#5693C1] hover:text-[#5693C1]'
                          }`}
                        >
                          {skill.name}
                          {skill.isRequired && (
                            <span className="ml-1 text-xs">*</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    Loading skills...
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <span>⚠️</span>
                {error}
              </div>
            )}

            {/* Action Button */}
            <div className="space-y-3">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzeDisabled}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  isAnalyzeDisabled
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-[#5693C1] text-white hover:bg-[#4a82ab] active:scale-[0.98]'
                }`}
              >
                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Readiness'
                )}
              </button>
              <p className="text-center text-sm text-gray-500">
                Select at least one skill to analyze your readiness
              </p>
            </div>

            {/* Demo Disclaimer */}
            <div className="mt-6 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-sm text-blue-700">
              <span>ℹ️</span>
              <span>
                This is a demo. <strong>Sign up</strong> to track your real progress!
              </span>
            </div>
          </div>
        ) : (
          /* ===== RESULT STATE: Show Demo Score ===== */
          <div className="p-6 lg:p-8">
            {/* Demo Badge */}
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full">
                <span>🎭</span>
                <span className="font-semibold text-sm">DEMO RESULT</span>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                Your Demo Score
              </h3>
              <p className="text-gray-600">{categoryName}</p>
            </div>

            {/* Main Score Card */}
            <div className="bg-gradient-to-br from-[#5693C1] to-[#4080aa] rounded-xl p-6 text-white mb-6">
              <div className="text-center mb-4">
                <span className="text-sm text-white/80 uppercase tracking-wide">
                  Readiness Score
                </span>
                <div className="text-5xl font-bold mt-1">
                  {demoResult?.percentage || 0}
                  <span className="text-2xl">%</span>
                </div>
                <div className="text-sm text-white/80 mt-1">
                  {demoResult?.totalScore || 0} / {demoResult?.maxPossibleScore || 0} points
                </div>
              </div>

              {/* Skills Summary */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center py-3 bg-white/10 rounded-lg">
                  <div className="text-2xl font-bold">{demoResult?.skillsMet || 0}</div>
                  <div className="text-sm text-white/80">Skills Met</div>
                </div>
                <div className="text-center py-3 bg-white/10 rounded-lg">
                  <div className="text-2xl font-bold">{demoResult?.skillsMissing || 0}</div>
                  <div className="text-sm text-white/80">Skills Missing</div>
                </div>
              </div>
            </div>

            {/* Skill Gap Breakdown */}
            {demoResult?.breakdown && demoResult.breakdown.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Skill Gap Breakdown
                </h4>
                <div className="grid gap-2 max-h-40 overflow-y-auto">
                  {demoResult.breakdown.map(item => (
                    <div
                      key={item.skillId}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                        item.status === 'met'
                          ? 'bg-green-50 border border-green-200'
                          : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-800">
                        {item.skillName}
                      </span>
                      <span className={`text-sm font-medium ${
                        item.status === 'met' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.status === 'met' ? '✅ Met' : '❌ Missing'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Required Skills */}
            {demoResult?.missingRequiredSkills && demoResult.missingRequiredSkills.length > 0 && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                  <span>⚠️</span> Missing Required Skills
                </h4>
                <div className="space-y-1">
                  {demoResult.missingRequiredSkills.map(skill => (
                    <div key={skill} className="flex items-center gap-2 text-sm text-amber-700">
                      <span>❗</span>
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-amber-600 mt-2">
                  Focus on these required skills to improve your readiness.
                </p>
              </div>
            )}

            {/* Sign Up CTA */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-center">
              <p className="text-gray-800 font-medium mb-1">
                🚀 <strong>Want to track your real progress?</strong>
              </p>
              <p className="text-sm text-gray-600 mb-3">
                Sign up to save your skills, track improvement over time, and get personalized recommendations.
              </p>
              <a
                href="/signup"
                className="inline-block px-6 py-2 bg-[#5693C1] text-white font-semibold rounded-lg hover:bg-[#4a82ab] transition-colors"
              >
                Create Free Account
              </a>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Close Demo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
