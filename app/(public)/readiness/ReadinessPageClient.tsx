'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

// ============================================================================
// Types
// ============================================================================

interface Context {
  has_target_role: boolean;
  role?: {
    id: string;
    name: string;
  };
  required_skills_count: number;
  total_benchmark_skills_count: number;
  user_skills_count: number;
  user_skills_by_source?: {
    self: number;
    resume: number;
    validated: number;
  };
  validation?: {
    validated_count: number;
    rejected_count: number;
    has_updates_since_last_calc: boolean;
  };
  last_calculated_at: string | null;
  edge_case?: string;
  edge_case_message?: string;
  action_url?: string;
}

interface ReadinessScore {
  readiness_id?: string;
  percentage: number;
  total_score: number;
  max_possible_score: number;
  calculated_at: string;
  skill_stats?: {
    skills_met: number;
    skills_missing: number;
  };
  missing_required_skills?: string[];
}

interface CalculationResult extends ReadinessScore {
  _type: 'success' | 'cooldown' | 'no_changes' | 'edge_case';
  _fromResumeSync?: boolean;
  _fromValidation?: boolean;
  message?: string;
  recalculated?: boolean;
  edge_case?: string;
  roadmap_updated?: boolean;
}

interface SkillBreakdown {
  breakdown: unknown[];
  required_skills: {
    total: number;
    met: number;
    missing: number;
    met_skills: Array<{ name: string; source: string } | string>;
    missing_skills: string[];
  };
  optional_skills: {
    total: number;
    met: number;
    missing: number;
    met_skills: Array<{ name: string; source: string } | string>;
    missing_skills: string[];
  };
  weight_impact?: {
    achieved_weight: number;
    total_weight: number;
    required_weight_achieved: number;
    required_weight_total: number;
  };
  trust_indicators?: {
    validated_count: number;
  };
}

interface ReadinessPageClientProps {
  userId: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

const getReadinessStatus = (percentage: number) => {
  if (percentage >= 70) {
    return { label: 'Ready', color: 'success', icon: '✅' };
  } else if (percentage >= 40) {
    return { label: 'Partially Ready', color: 'warning', icon: '⚠️' };
  } else {
    return { label: 'Not Ready', color: 'danger', icon: '❌' };
  }
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ============================================================================
// Main Component
// ============================================================================

export default function ReadinessPageClient({ userId }: ReadinessPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [context, setContext] = useState<Context | null>(null);
  const [isLoadingContext, setIsLoadingContext] = useState(true);
  const [contextError, setContextError] = useState<string | null>(null);
  
  const [latestReadiness, setLatestReadiness] = useState<ReadinessScore | null>(null);
  const [isLoadingLatest, setIsLoadingLatest] = useState(true);
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  
  const [skillBreakdown, setSkillBreakdown] = useState<SkillBreakdown | null>(null);
  const [isLoadingBreakdown, setIsLoadingBreakdown] = useState(false);
  
  const [isFromResumeSync, setIsFromResumeSync] = useState(false);
  const hasTriggeredRecalculate = useRef(false);

  // Check for recalculate query param (from resume sync)
  useEffect(() => {
    if (searchParams.get('recalculate') === 'true' && !hasTriggeredRecalculate.current) {
      setIsFromResumeSync(true);
    }
  }, [searchParams]);

  // Fetch context data
  const fetchContext = useCallback(async () => {
    try {
      setIsLoadingContext(true);
      const response = await fetch(`/api/readiness/context`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch context');
      }
      
      setContext(data.data || data);
    } catch (error) {
      console.error('[ReadinessPage] Error fetching context:', error);
      setContextError(error instanceof Error ? error.message : 'Failed to load context');
    } finally {
      setIsLoadingContext(false);
    }
  }, []);

  // Fetch latest readiness
  const fetchLatestReadiness = useCallback(async () => {
    if (!context?.has_target_role || !context?.role?.id) {
      setIsLoadingLatest(false);
      return;
    }
    
    try {
      setIsLoadingLatest(true);
      const response = await fetch(`/api/users/${userId}/readiness`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.snapshot) {
          setLatestReadiness({
            readiness_id: data.data.snapshot.id,
            percentage: data.data.snapshot.percentage,
            total_score: data.data.snapshot.totalScore,
            max_possible_score: data.data.snapshot.maxPossibleScore,
            calculated_at: data.data.snapshot.createdAt,
            skill_stats: {
              skills_met: data.data.snapshot.skillsMatched,
              skills_missing: data.data.snapshot.skillsMissing,
            },
          });
          
          // Fetch breakdown if we have a snapshot
          if (data.data.snapshot.breakdown) {
            processBreakdown(data.data.snapshot.breakdown);
          }
        }
      }
    } catch (error) {
      console.error('[ReadinessPage] Error fetching latest readiness:', error);
    } finally {
      setIsLoadingLatest(false);
    }
  }, [context, userId]);

  // Process breakdown data
  const processBreakdown = (breakdown: unknown[]) => {
    const breakdownArray = breakdown as Array<{
      importance: string;
      isMissing: boolean;
      skillName: string;
      source: string;
      weight: number;
    }>;
    
    const requiredSkills = breakdownArray.filter(s => s.importance === 'required');
    const optionalSkills = breakdownArray.filter(s => s.importance === 'optional');
    
    setSkillBreakdown({
      breakdown: breakdownArray,
      required_skills: {
        total: requiredSkills.length,
        met: requiredSkills.filter(s => !s.isMissing).length,
        missing: requiredSkills.filter(s => s.isMissing).length,
        met_skills: requiredSkills.filter(s => !s.isMissing).map(s => ({ name: s.skillName, source: s.source })),
        missing_skills: requiredSkills.filter(s => s.isMissing).map(s => s.skillName),
      },
      optional_skills: {
        total: optionalSkills.length,
        met: optionalSkills.filter(s => !s.isMissing).length,
        missing: optionalSkills.filter(s => s.isMissing).length,
        met_skills: optionalSkills.filter(s => !s.isMissing).map(s => ({ name: s.skillName, source: s.source })),
        missing_skills: optionalSkills.filter(s => s.isMissing).map(s => s.skillName),
      },
      weight_impact: {
        achieved_weight: breakdownArray.filter(s => !s.isMissing).reduce((acc, s) => acc + s.weight, 0),
        total_weight: breakdownArray.reduce((acc, s) => acc + s.weight, 0),
        required_weight_achieved: requiredSkills.filter(s => !s.isMissing).reduce((acc, s) => acc + s.weight, 0),
        required_weight_total: requiredSkills.reduce((acc, s) => acc + s.weight, 0),
      },
      trust_indicators: {
        validated_count: breakdownArray.filter(s => s.source === 'validated').length,
      },
    });
  };

  // Handle calculate readiness
  const handleCalculateReadiness = async (force: boolean = false) => {
    setIsCalculating(true);
    setCalculationResult(null);
    
    try {
      const response = await fetch(`/api/users/${userId}/readiness`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force }),
      });
      
      const result = await response.json();
      
      if (response.status === 429) {
        setCalculationResult({
          ...result,
          _type: 'cooldown',
          percentage: latestReadiness?.percentage || 0,
          total_score: latestReadiness?.total_score || 0,
          max_possible_score: latestReadiness?.max_possible_score || 0,
          calculated_at: latestReadiness?.calculated_at || '',
        });
        return;
      }
      
      if (result.recalculated === false) {
        setCalculationResult({
          ...result,
          _type: 'no_changes',
          percentage: latestReadiness?.percentage || 0,
          total_score: latestReadiness?.total_score || 0,
          max_possible_score: latestReadiness?.max_possible_score || 0,
          calculated_at: latestReadiness?.calculated_at || '',
        });
        return;
      }
      
      if (!response.ok) {
        throw new Error(result.message || 'Calculation failed');
      }
      
      // Success
      const snapshot = result.data?.snapshot || result.snapshot;
      setCalculationResult({
        _type: 'success',
        _fromResumeSync: isFromResumeSync,
        readiness_id: snapshot?.id,
        percentage: snapshot?.percentage || 0,
        total_score: snapshot?.totalScore || 0,
        max_possible_score: snapshot?.maxPossibleScore || 0,
        calculated_at: snapshot?.createdAt || new Date().toISOString(),
        skill_stats: {
          skills_met: snapshot?.skillsMatched || 0,
          skills_missing: snapshot?.skillsMissing || 0,
        },
        roadmap_updated: result.roadmap_updated,
      });
      
      // Process breakdown
      if (snapshot?.breakdown) {
        processBreakdown(snapshot.breakdown);
      }
      
      // Refresh context
      fetchContext();
      
      if (isFromResumeSync) {
        setIsFromResumeSync(false);
      }
      
    } catch (error) {
      console.error('[ReadinessPage] Calculation failed:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Auto-trigger recalculation for resume sync
  useEffect(() => {
    if (
      isFromResumeSync && 
      context?.has_target_role && 
      !isLoadingContext && 
      !hasTriggeredRecalculate.current
    ) {
      hasTriggeredRecalculate.current = true;
      handleCalculateReadiness(true);
    }
  }, [isFromResumeSync, context, isLoadingContext]);

  // Initial data fetch
  useEffect(() => {
    fetchContext();
  }, [fetchContext]);

  useEffect(() => {
    if (context?.has_target_role) {
      fetchLatestReadiness();
    }
  }, [context, fetchLatestReadiness]);

  // ============================================================================
  // Render: Loading State
  // ============================================================================
  if (isLoadingContext) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading your readiness information...</p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Render: Error State
  // ============================================================================
  if (contextError) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Readiness</h2>
            <p className="text-gray-600 mb-6">{contextError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Render: No Target Role State
  // ============================================================================
  if (!context?.has_target_role || context?.edge_case === 'NO_TARGET_ROLE') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
              <span>🎯</span>
              Readiness Evaluation
            </h1>
          </div>
          
          {/* No Role Card */}
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Target Role Selected</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {context?.edge_case_message || 'Please select a target role before calculating readiness.'}
              <br />
              Your readiness score is evaluated against the skills required for your target role.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={context?.action_url || '/dashboard/roles'}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Select Target Role
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Render: No User Skills State
  // ============================================================================
  if (context?.edge_case === 'NO_USER_SKILLS') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
              <span>🎯</span>
              Readiness Evaluation
            </h1>
            <p className="text-gray-600 mt-2">
              Evaluate your skills against industry benchmarks for your target role
            </p>
          </div>
          
          {/* Context Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>📋</span>
              Evaluation Context
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                <div className="text-2xl">🎯</div>
                <div>
                  <div className="text-sm text-gray-500">Target Role</div>
                  <div className="font-semibold text-gray-900">{context.role?.name || 'Unknown'}</div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                <div className="text-2xl">⭐</div>
                <div>
                  <div className="text-sm text-gray-500">Required Skills</div>
                  <div className="font-semibold text-gray-900">
                    {context.required_skills_count} of {context.total_benchmark_skills_count} total
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* No Skills Guidance */}
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="text-5xl mb-4">📝</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Add Your Skills to Get Started</h2>
            <p className="text-gray-600 mb-6">{context.edge_case_message}</p>
            
            <div className="bg-gray-50 rounded-xl p-6 text-left mb-6 max-w-md mx-auto">
              <h3 className="font-semibold text-gray-900 mb-3">How to add your skills:</h3>
              <ol className="space-y-2 text-gray-600">
                <li><strong>1. Self-Add:</strong> Manually select skills you possess</li>
                <li><strong>2. Resume Upload:</strong> Upload your resume for auto-extraction</li>
                <li><strong>3. Get Validated:</strong> Complete assessments to validate skills</li>
              </ol>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={context?.action_url || '/dashboard/skills'}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
              >
                <span>📝</span> Add Your Skills
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Render: Main Page
  // ============================================================================
  const currentScore = calculationResult || latestReadiness;
  const hasScore = currentScore && currentScore.percentage !== undefined;
  const percentage = hasScore ? currentScore.percentage : 0;
  const status = getReadinessStatus(percentage);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <span>🎯</span>
            Readiness Evaluation
          </h1>
          <p className="text-gray-600 mt-2">
            Evaluate your skills against industry benchmarks for your target role
          </p>
        </div>

        {/* Section A: Context */}
        <section className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span>📋</span>
              Evaluation Context
            </h2>
            <p className="text-sm text-gray-500">What's being evaluated in your readiness calculation</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Target Role */}
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-sm text-gray-500">Target Role</div>
              <div className="font-semibold text-gray-900">{context?.role?.name || 'Unknown'}</div>
            </div>
            
            {/* Required Skills */}
            <div className="bg-amber-50 rounded-xl p-4">
              <div className="text-2xl mb-2">⭐</div>
              <div className="text-sm text-gray-500">Required Skills</div>
              <div className="font-semibold text-gray-900">
                {context?.required_skills_count}
                <span className="text-sm font-normal text-gray-500 ml-1">
                  of {context?.total_benchmark_skills_count} total
                </span>
              </div>
            </div>
            
            {/* Your Skills */}
            <div className="bg-green-50 rounded-xl p-4">
              <div className="text-2xl mb-2">✅</div>
              <div className="text-sm text-gray-500">Your Skills Considered</div>
              <div className="font-semibold text-gray-900">
                {context?.user_skills_count || 0}
                {context?.user_skills_count === 0 && (
                  <span className="text-sm font-normal text-red-500 ml-1">No skills added</span>
                )}
              </div>
              {context?.user_skills_count && context.user_skills_count > 0 && context?.user_skills_by_source && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {context.user_skills_by_source.self > 0 && (
                    <span className="text-xs px-2 py-0.5 bg-gray-200 rounded-full">{context.user_skills_by_source.self} self</span>
                  )}
                  {context.user_skills_by_source.resume > 0 && (
                    <span className="text-xs px-2 py-0.5 bg-blue-200 rounded-full">{context.user_skills_by_source.resume} resume</span>
                  )}
                  {context.user_skills_by_source.validated > 0 && (
                    <span className="text-xs px-2 py-0.5 bg-green-200 rounded-full">{context.user_skills_by_source.validated} validated</span>
                  )}
                </div>
              )}
            </div>
            
            {/* Last Calculated */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-2xl mb-2">📅</div>
              <div className="text-sm text-gray-500">Last Calculated</div>
              <div className="font-semibold text-gray-900">
                {context?.last_calculated_at 
                  ? formatDate(context.last_calculated_at)
                  : <span className="text-gray-400 font-normal">Not calculated yet</span>
                }
              </div>
            </div>
          </div>
          
          {/* First-time user message */}
          {!context?.last_calculated_at && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl flex items-start gap-3">
              <span className="text-xl">💡</span>
              <p className="text-sm text-blue-800">
                <strong>First time here?</strong> Click "Calculate Readiness" below to get your first readiness score. 
                The calculation will evaluate your skills against the {context?.total_benchmark_skills_count} benchmark skills for {context?.role?.name}.
              </p>
            </div>
          )}
        </section>

        {/* Section B: Readiness Score */}
        <section className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span>📊</span>
              Readiness Score
            </h2>
            <p className="text-sm text-gray-500">Your current readiness evaluation for {context?.role?.name}</p>
          </div>
          
          {isLoadingLatest ? (
            <div className="flex flex-col items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
              <p className="text-gray-500">Loading your readiness score...</p>
            </div>
          ) : !hasScore ? (
            /* No Score Yet */
            <div className="text-center py-8">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Readiness Score Yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Calculate your readiness to see how prepared you are for{' '}
                <strong>{context?.role?.name}</strong>.
                {context?.user_skills_count === 0 && (
                  <span className="block mt-2 text-amber-600">
                    ⚠️ You haven't added any skills yet. Your score will be 0%.
                  </span>
                )}
              </p>
              <button 
                onClick={() => handleCalculateReadiness(false)}
                disabled={isCalculating}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isCalculating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Calculating...
                  </>
                ) : (
                  'Calculate My Readiness'
                )}
              </button>
            </div>
          ) : (
            /* Has Score */
            <div>
              {/* Status Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
                status.color === 'success' ? 'bg-green-100 text-green-800' :
                status.color === 'warning' ? 'bg-amber-100 text-amber-800' :
                'bg-red-100 text-red-800'
              }`}>
                <span>{status.icon}</span>
                <span className="font-semibold">{status.label}</span>
              </div>
              
              {/* Main Score Display */}
              <div className="flex flex-col md:flex-row items-center gap-8 mb-6">
                {/* Score Circle */}
                <div className={`w-36 h-36 rounded-full flex flex-col items-center justify-center border-8 ${
                  status.color === 'success' ? 'border-green-500 bg-green-50' :
                  status.color === 'warning' ? 'border-amber-500 bg-amber-50' :
                  'border-red-500 bg-red-50'
                }`}>
                  <div className="text-4xl font-bold text-gray-900">{percentage}%</div>
                  <div className="text-sm text-gray-500">Readiness</div>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{currentScore.total_score}</div>
                    <div className="text-sm text-gray-500">Score Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{currentScore.max_possible_score || '-'}</div>
                    <div className="text-sm text-gray-500">Max Possible</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{currentScore.skill_stats?.skills_met || '-'}</div>
                    <div className="text-sm text-gray-500">Skills Met</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">{currentScore.skill_stats?.skills_missing || '-'}</div>
                    <div className="text-sm text-gray-500">Skills Missing</div>
                  </div>
                </div>
              </div>
              
              {/* Last calculated */}
              {currentScore.calculated_at && (
                <p className="text-sm text-gray-500 mb-4">
                  Last calculated: {formatDate(currentScore.calculated_at)}
                </p>
              )}
              
              {/* Guard Messages */}
              {calculationResult?._type === 'cooldown' && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4 flex items-start gap-3">
                  <span className="text-xl">⏱️</span>
                  <div>
                    <strong className="text-amber-800">Cooldown Active</strong>
                    <p className="text-sm text-amber-700">{calculationResult.message}</p>
                  </div>
                </div>
              )}
              
              {calculationResult?._type === 'no_changes' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-4 flex items-start gap-3">
                  <span className="text-xl">✅</span>
                  <div>
                    <strong className="text-green-800">Already Up to Date</strong>
                    <p className="text-sm text-green-700">{calculationResult.message}</p>
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => handleCalculateReadiness(false)}
                  disabled={isCalculating}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {isCalculating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Recalculating...
                    </>
                  ) : (
                    <>🔄 Recalculate Readiness</>
                  )}
                </button>
                
                <Link
                  href="/roadmap"
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                >
                  🧭 View Roadmap
                </Link>
                
                <Link
                  href="/report"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                >
                  📄 Export Report
                </Link>
                
                <Link
                  href="/dashboard"
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  📊 View Dashboard
                </Link>
              </div>
              
              {/* Success hint */}
              {calculationResult?._type === 'success' && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                  {calculationResult._fromResumeSync ? (
                    <p className="text-sm text-blue-800">
                      📄 <strong>Resume skills included!</strong> Your readiness now reflects skills from your uploaded resume. 
                      View your <Link href="/dashboard" className="underline">Dashboard</Link> for history and trends.
                    </p>
                  ) : (
                    <p className="text-sm text-blue-800">
                      ✨ Score updated! View your <Link href="/dashboard" className="underline">Dashboard</Link> for history and trends.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Section C: Skill Breakdown */}
        {hasScore && skillBreakdown && (
          <section className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span>📝</span>
                Skill Breakdown
              </h2>
              <p className="text-sm text-gray-500">Your skills evaluated against {context?.role?.name} requirements</p>
            </div>
            
            {isLoadingBreakdown ? (
              <div className="flex flex-col items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                <p className="text-gray-500">Loading skill breakdown...</p>
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Required Skills */}
                  <div className="bg-amber-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span>⭐</span> Required Skills
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{skillBreakdown.required_skills.met}</div>
                        <div className="text-xs text-gray-500">Met</div>
                      </div>
                      <div className="text-gray-300">/</div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{skillBreakdown.required_skills.missing}</div>
                        <div className="text-xs text-gray-500">Missing</div>
                      </div>
                      <div className="text-sm text-gray-500 ml-auto">
                        of {skillBreakdown.required_skills.total} total
                      </div>
                    </div>
                  </div>
                  
                  {/* Optional Skills */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span>📚</span> Optional Skills
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{skillBreakdown.optional_skills.met}</div>
                        <div className="text-xs text-gray-500">Met</div>
                      </div>
                      <div className="text-gray-300">/</div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-400">{skillBreakdown.optional_skills.missing}</div>
                        <div className="text-xs text-gray-500">Missing</div>
                      </div>
                      <div className="text-sm text-gray-500 ml-auto">
                        of {skillBreakdown.optional_skills.total} total
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Weight Impact */}
                {skillBreakdown.weight_impact && (
                  <div className="bg-blue-50 rounded-xl p-4 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-1">📊 Weight Impact</h4>
                    <p className="text-sm text-gray-600">
                      You've achieved <strong>{skillBreakdown.weight_impact.achieved_weight}</strong> out of{' '}
                      <strong>{skillBreakdown.weight_impact.total_weight}</strong> total weight points.
                      {skillBreakdown.weight_impact.required_weight_total > 0 && (
                        <span className="text-gray-500 ml-1">
                          Required skills: {skillBreakdown.weight_impact.required_weight_achieved}/{skillBreakdown.weight_impact.required_weight_total} points.
                        </span>
                      )}
                    </p>
                  </div>
                )}
                
                {/* Trust Indicators */}
                {skillBreakdown.trust_indicators && skillBreakdown.trust_indicators.validated_count > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                    <div className="text-2xl">🎓</div>
                    <div className="flex-1">
                      <span className="font-semibold text-green-800">
                        {skillBreakdown.trust_indicators.validated_count} skill{skillBreakdown.trust_indicators.validated_count > 1 ? 's' : ''} mentor-validated
                      </span>
                      <span className="block text-sm text-green-700">
                        Third-party verified skills receive 1.25× weight bonus
                      </span>
                    </div>
                    <div className="text-green-600 text-xl">✓</div>
                  </div>
                )}
                
                {/* Source Legend */}
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <span className="text-gray-500">Skill Sources:</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">🎓 Validated</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">📄 Resume</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">✋ Self-declared</span>
                </div>
                
                {/* Required Skills List */}
                {skillBreakdown.required_skills.total > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      ⭐ Required Skills ({skillBreakdown.required_skills.met}/{skillBreakdown.required_skills.total} met)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {skillBreakdown.required_skills.met_skills.map((skill, index) => {
                        const skillName = typeof skill === 'string' ? skill : skill.name;
                        const skillSource = typeof skill === 'object' ? skill.source : null;
                        return (
                          <span 
                            key={`req-met-${index}`} 
                            className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 ${
                              skillSource === 'validated' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-green-50 text-green-700'
                            }`}
                          >
                            <span>✅</span>
                            {skillName}
                            {skillSource && (
                              <span className="ml-1">
                                {skillSource === 'validated' && '🎓'}
                                {skillSource === 'resume' && '📄'}
                                {skillSource === 'self' && '✋'}
                              </span>
                            )}
                          </span>
                        );
                      })}
                      {skillBreakdown.required_skills.missing_skills.map((skill, index) => (
                        <span 
                          key={`req-miss-${index}`} 
                          className="px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm flex items-center gap-1"
                        >
                          <span>❌</span>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Optional Skills List */}
                {skillBreakdown.optional_skills.total > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      📚 Optional Skills ({skillBreakdown.optional_skills.met}/{skillBreakdown.optional_skills.total} met)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {skillBreakdown.optional_skills.met_skills.map((skill, index) => {
                        const skillName = typeof skill === 'string' ? skill : skill.name;
                        const skillSource = typeof skill === 'object' ? skill.source : null;
                        return (
                          <span 
                            key={`opt-met-${index}`} 
                            className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 ${
                              skillSource === 'validated' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-green-50 text-green-700'
                            }`}
                          >
                            <span>✅</span>
                            {skillName}
                            {skillSource && (
                              <span className="ml-1">
                                {skillSource === 'validated' && '🎓'}
                                {skillSource === 'resume' && '📄'}
                                {skillSource === 'self' && '✋'}
                              </span>
                            )}
                          </span>
                        );
                      })}
                      {skillBreakdown.optional_skills.missing_skills.map((skill, index) => (
                        <span 
                          key={`opt-miss-${index}`} 
                          className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm flex items-center gap-1"
                        >
                          <span>○</span>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            ← Back to Dashboard
          </Link>
          <Link
            href="/dashboard/skills"
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Update Skills →
          </Link>
        </div>
      </div>
    </div>
  );
}
