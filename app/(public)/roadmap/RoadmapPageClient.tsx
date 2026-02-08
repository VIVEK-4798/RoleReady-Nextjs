'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ============================================================================
// Types
// ============================================================================

interface RoadmapItem {
  item_id?: string;
  skill_id?: string;
  skill_name: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'rejected' | 'required_gap' | 'strengthen' | 'optional_gap';
  reason: string;
  action_hint?: string;
  confidence?: 'validated' | 'rejected' | 'self';
}

interface RoadmapSummary {
  high_priority?: number;
  medium_priority?: number;
  low_priority?: number;
  by_priority?: {
    high?: number;
    medium?: number;
    low?: number;
  };
}

interface EdgeCase {
  message?: string;
  message_type?: 'success' | 'warning' | 'info';
  is_fully_ready?: boolean;
  has_pending_validation?: boolean;
  pending_validation_count?: number;
  has_unvalidated_required?: boolean;
  only_optional_gaps?: boolean;
}

interface RulesApplied {
  description: string;
  count: number;
}

interface Roadmap {
  roadmap_id?: string;
  readiness_score?: number;
  current_score?: number;
  role_name: string;
  items: RoadmapItem[];
  summary?: RoadmapSummary;
  edge_case?: EdgeCase;
  rules_applied?: RulesApplied[];
  generated_at: string;
}

interface RoadmapPageClientProps {
  userId: string;
}

// ============================================================================
// Helper Components
// ============================================================================

const EdgeCaseBanner = ({ edgeCase }: { edgeCase?: EdgeCase }) => {
  if (!edgeCase?.message) return null;
  
  const getStyles = () => {
    switch (edgeCase.message_type) {
      case 'success':
        return { 
          bg: 'bg-green-100', 
          border: 'border-green-300', 
          color: 'text-green-800',
          icon: '🎉'
        };
      case 'warning':
        return { 
          bg: 'bg-amber-100', 
          border: 'border-amber-300', 
          color: 'text-amber-800',
          icon: '⚠️'
        };
      case 'info':
      default:
        return { 
          bg: 'bg-blue-100', 
          border: 'border-blue-300', 
          color: 'text-blue-800',
          icon: '💡'
        };
    }
  };
  
  const styles = getStyles();
  
  return (
    <div className={`${styles.bg} ${styles.border} border rounded-xl p-4 mb-6 flex items-start gap-3`}>
      <span className="text-xl flex-shrink-0">{styles.icon}</span>
      <div>
        <p className={`${styles.color} font-medium text-sm leading-relaxed`}>
          {edgeCase.message}
        </p>
        
        {edgeCase.has_pending_validation && edgeCase.pending_validation_count && (
          <p className={`${styles.color} text-sm opacity-90 mt-1`}>
            {edgeCase.pending_validation_count} skill(s) are awaiting mentor review.
          </p>
        )}
      </div>
    </div>
  );
};

const RoadmapItemCard = ({ item }: { item: RoadmapItem }) => {
  const getCategoryStyle = () => {
    switch (item.category) {
      case 'rejected':
        return { bg: 'bg-red-50', border: 'border-red-200', icon: '⚠️' };
      case 'required_gap':
        return { bg: 'bg-amber-50', border: 'border-amber-200', icon: '🔴' };
      case 'strengthen':
        return { bg: 'bg-blue-50', border: 'border-blue-200', icon: '🔵' };
      case 'optional_gap':
        return { bg: 'bg-gray-50', border: 'border-gray-200', icon: '🟡' };
      default:
        return { bg: 'bg-gray-50', border: 'border-gray-200', icon: '📋' };
    }
  };
  
  const getConfidenceBadge = () => {
    switch (item.confidence) {
      case 'validated':
        return { label: 'Verified ✓', bg: 'bg-green-100', color: 'text-green-800' };
      case 'rejected':
        return { label: 'Rejected ⚠', bg: 'bg-red-100', color: 'text-red-600' };
      default:
        return { label: 'Self-reported', bg: 'bg-gray-100', color: 'text-gray-600' };
    }
  };
  
  const style = getCategoryStyle();
  const badge = getConfidenceBadge();
  
  return (
    <div className={`${style.bg} ${style.border} border rounded-xl p-4 mb-3 transition-all hover:shadow-sm`}>
      <div className="flex items-start gap-3">
        {/* Category Icon */}
        <span className="text-xl flex-shrink-0">{style.icon}</span>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Skill Name + Badge */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="font-semibold text-gray-900">{item.skill_name}</span>
            <span className={`${badge.bg} ${badge.color} px-2 py-0.5 rounded-full text-xs font-medium`}>
              {badge.label}
            </span>
          </div>
          
          {/* Reason */}
          <p className="text-sm text-gray-600 leading-relaxed">{item.reason}</p>
          
          {/* Action Hint */}
          {item.action_hint && (
            <p className="text-sm text-gray-500 mt-2 italic">
              💡 {item.action_hint}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const PrioritySection = ({ 
  title, 
  emoji, 
  description, 
  items, 
  emptyMessage, 
  badgeColor 
}: { 
  title: string;
  emoji: string;
  description: string;
  items: RoadmapItem[];
  emptyMessage: string;
  badgeColor: string;
}) => {
  if (items.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{emoji}</span>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <span className="px-2 py-0.5 bg-gray-200 rounded-full text-xs font-semibold text-gray-500">0</span>
        </div>
        <div className="p-6 bg-gray-50 rounded-xl text-center text-gray-400">
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{emoji}</span>
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <span className={`${badgeColor} px-2 py-0.5 rounded-full text-xs font-semibold text-gray-900`}>
          {items.length}
        </span>
      </div>
      <p className="text-gray-500 text-sm mb-4">{description}</p>
      <div>
        {items.map((item, idx) => (
          <RoadmapItemCard key={item.item_id || item.skill_id || idx} item={item} />
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export default function RoadmapPageClient({ userId }: RoadmapPageClientProps) {
  const router = useRouter();
  
  // State
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ type: string; message: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch roadmap
  const fetchRoadmap = useCallback(async (refresh: boolean = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      const response = await fetch(`/api/users/${userId}/roadmap${refresh ? '?refresh=true' : ''}`);
      const data = await response.json();
      
      if (!response.ok) {
        if (data.error === 'NO_READINESS_FOUND' || data.message?.includes('readiness')) {
          setError({
            type: 'no_readiness',
            message: 'You need to calculate your readiness score first before viewing your roadmap.'
          });
          return;
        }
        throw new Error(data.message || 'Failed to load roadmap');
      }
      
      // The API now returns { success, message, roadmap } in old project format
      const roadmapData = data.roadmap || data.data?.roadmap;
      
      if (roadmapData && roadmapData.items && roadmapData.items.length > 0) {
        // Map items directly - already in the correct format from API
        const items: RoadmapItem[] = roadmapData.items.map((item: any) => ({
          item_id: item.skill_id,
          skill_id: item.skill_id,
          skill_name: item.skill_name,
          priority: item.priority as 'HIGH' | 'MEDIUM' | 'LOW',
          category: item.category as 'rejected' | 'required_gap' | 'strengthen' | 'optional_gap',
          reason: item.reason,
          action_hint: item.details?.action_hint,
          confidence: item.confidence as 'validated' | 'rejected' | 'self' | undefined,
        }));
        
        setRoadmap({
          roadmap_id: roadmapData.readiness_id?.toString(),
          readiness_score: roadmapData.current_score || 0,
          role_name: roadmapData.role_name || 'Your Target Role',
          items,
          summary: roadmapData.summary?.by_priority
            ? {
                high_priority: roadmapData.summary.by_priority.high || 0,
                medium_priority: roadmapData.summary.by_priority.medium || 0,
                low_priority: roadmapData.summary.by_priority.low || 0,
                by_priority: roadmapData.summary.by_priority,
              }
            : undefined,
          edge_case: roadmapData.edge_case,
          rules_applied: roadmapData.rules_applied,
          generated_at: roadmapData.generated_at || new Date().toISOString(),
        });
      } else {
        // No roadmap items generated
        setError({
          type: 'no_roadmap',
          message: roadmapData?.edge_case?.message || 'No roadmap generated yet. Calculate your readiness score to generate a personalized roadmap.'
        });
      }
    } catch (err) {
      console.error('[RoadmapPage] Error fetching roadmap:', err);
      setError({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to load roadmap'
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userId]);
  
  // Refresh roadmap
  const handleRefresh = async () => {
    await fetchRoadmap(true);
  };
  
  // Initial fetch
  useEffect(() => {
    fetchRoadmap();
  }, [fetchRoadmap]);
  
  // Group items by priority
  const getItemsByPriority = (priority: 'HIGH' | 'MEDIUM' | 'LOW') => {
    if (!roadmap?.items) return [];
    return roadmap.items.filter(item => item.priority === priority);
  };
  
  const highPriorityItems = getItemsByPriority('HIGH');
  const mediumPriorityItems = getItemsByPriority('MEDIUM');
  const lowPriorityItems = getItemsByPriority('LOW');
  
  // ============================================================================
  // Render: Loading State
  // ============================================================================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#5693C1' }}></div>
            <p className="text-gray-600 mt-4">Loading your roadmap...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // ============================================================================
  // Render: Error State
  // ============================================================================
  if (error) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
              <span>🧭</span>
              Your Skill Roadmap
            </h1>
          </div>
          
          {/* Error Card */}
          <div className={`p-8 rounded-2xl text-center ${
            error.type === 'no_readiness' || error.type === 'no_roadmap' 
              ? 'bg-amber-50' 
              : 'bg-red-50'
          }`}>
            <div className="text-5xl mb-4">
              {error.type === 'no_readiness' || error.type === 'no_roadmap' ? '📊' : '❌'}
            </div>
            <p className={`mb-6 ${
              error.type === 'no_readiness' || error.type === 'no_roadmap'
                ? 'text-amber-800'
                : 'text-red-800'
            }`}>
              {error.message}
            </p>
            {(error.type === 'no_readiness' || error.type === 'no_roadmap') && (
              <Link
                href="/readiness"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors text-white"
                style={{ backgroundColor: '#5693C1' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4682B4'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#5693C1'}
              >
                Calculate Readiness First →
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // ============================================================================
  // Render: Main Page
  // ============================================================================
  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <span>🧭</span>
            Your Skill Roadmap
          </h1>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            A prioritized list of skills to focus on, based on your readiness analysis.
          </p>
        </div>
        
        {roadmap && (
          <div>
            {/* Summary Card */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-200">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Based on your latest readiness score</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold" style={{ color: '#5693C1' }}>
                      {roadmap.readiness_score || 0}%
                    </span>
                    <span className="text-gray-500 text-sm">
                      for {roadmap.role_name}
                    </span>
                  </div>
                </div>
                
                {/* Priority Stats */}
                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {roadmap.summary?.high_priority || 0}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">High</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">
                      {roadmap.summary?.medium_priority || 0}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Medium</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {roadmap.summary?.low_priority || 0}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide">Low</div>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 text-sm"
                  >
                    {isRefreshing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        Refreshing...
                      </>
                    ) : (
                      <>🔄 Refresh Roadmap</>
                    )}
                  </button>
                  
                  <Link
                    href="/report"
                    className="px-5 py-2.5 rounded-lg font-medium transition-colors inline-flex items-center gap-2 text-sm text-white"
                    style={{ backgroundColor: '#5693C1' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4682B4'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#5693C1'}
                  >
                    📄 Export Report
                  </Link>
                  
                  <Link
                    href="/readiness"
                    className="px-5 py-2.5 rounded-lg font-medium transition-colors inline-flex items-center gap-2 text-sm text-white"
                    style={{ backgroundColor: '#5693C1' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4682B4'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#5693C1'}
                  >
                    🎯 View Readiness
                  </Link>
                </div>
                
                <p className="text-xs text-gray-400 mt-3">
                  Last generated: {new Date(roadmap.generated_at).toLocaleString()}
                </p>
              </div>
            </div>
            
            {/* Edge Case Banner */}
            <EdgeCaseBanner edgeCase={roadmap.edge_case} />
            
            {/* Fully Ready State */}
            {roadmap.edge_case?.is_fully_ready && (
              <div className="text-center p-8 bg-green-50 rounded-xl mb-8 border border-green-200">
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-green-800 mb-3">You're Ready!</h2>
                <p className="text-green-700 max-w-md mx-auto mb-6">
                  Congratulations! You've met all the skill requirements for{' '}
                  <strong>{roadmap.role_name}</strong>. Your readiness score reflects your preparation.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-lg text-sm text-green-800">
                  ✓ All required skills met and validated
                </div>
              </div>
            )}
            
            {/* Priority Sections */}
            {!roadmap.edge_case?.is_fully_ready && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3">
                  <PrioritySection
                    title="High Priority"
                    emoji="🔥"
                    description="Focus on these first — they're blocking your readiness score."
                    items={highPriorityItems}
                    emptyMessage="✨ No high-priority items! Great job!"
                    badgeColor="bg-red-100"
                  />
                </div>
                
                <div className="lg:col-span-2">
                  <PrioritySection
                    title="Medium Priority"
                    emoji="📈"
                    description={
                      roadmap.edge_case?.has_unvalidated_required 
                        ? "These skills meet requirements but aren't mentor-validated yet. Validation could boost your score."
                        : "Work on these next to strengthen your profile."
                    }
                    items={mediumPriorityItems}
                    emptyMessage="No medium-priority items right now."
                    badgeColor="bg-amber-100"
                  />
                </div>
                
                <div>
                  <PrioritySection
                    title="Low Priority"
                    emoji="📋"
                    description={
                      roadmap.edge_case?.only_optional_gaps
                        ? "These are optional enhancements — not required for your target role, but could differentiate you."
                        : "Optional improvements — nice to have but not critical."
                    }
                    items={lowPriorityItems}
                    emptyMessage="No low-priority items."
                    badgeColor="bg-green-100"
                  />
                </div>
              </div>
            )}
            
            {/* Rules Applied (Transparency) */}
            {roadmap.rules_applied && roadmap.rules_applied.length > 0 && (
              <div className="mt-8 p-5 bg-gray-50 rounded-xl text-sm text-gray-600 border border-gray-200">
                <strong className="text-gray-800">How this roadmap was generated:</strong>
                <ul className="list-disc ml-5 mt-3 space-y-1">
                  {roadmap.rules_applied.map((rule, idx) => (
                    <li key={idx}>
                      {rule.description}: <strong>{rule.count}</strong> items
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* No Items State */}
            {roadmap.items.length === 0 && !roadmap.edge_case?.is_fully_ready && (
              <div className="text-center p-10 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-5xl mb-4">📝</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Roadmap Items</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Your roadmap is empty. This could mean you need to recalculate your readiness 
                  or there are no skill gaps detected.
                </p>
                <Link
                  href="/readiness"
                  className="px-6 py-3 rounded-lg font-medium transition-colors text-white inline-flex items-center gap-2"
                  style={{ backgroundColor: '#5693C1' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4682B4'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#5693C1'}
                >
                  Calculate Readiness
                </Link>
              </div>
            )}
          </div>
        )}
        
        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between mt-8 gap-4">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-center"
          >
            ← Back to Dashboard
          </Link>
          <Link
            href="/readiness"
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-center"
          >
            Readiness Score →
          </Link>
        </div>
      </div>
    </div>
  );
}