'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';

// ============================================================================
// Types
// ============================================================================

interface SkillEntry {
  skill_id?: string;
  skill_name: string;
  source?: string;
  importance?: 'required' | 'optional';
  weight?: number;
  is_validated?: boolean;
  status?: 'met' | 'missing';
}

interface ReadinessData {
  percentage: number;
  status_label: string;
  status_color: 'danger' | 'warning' | 'success' | 'primary';
  calculated_at: string;
}

interface SkillBreakdown {
  met_count: number;
  missing_count: number;
  total_skills: number;
  met_skills: SkillEntry[];
  missing_skills: SkillEntry[];
}

interface ValidationData {
  pending_validation: number;
}

interface RoadmapData {
  by_priority?: {
    high?: number;
    medium?: number;
    low?: number;
  };
  high_priority_items?: Array<{
    skill_name: string;
    reason: string;
  }>;
}

interface HistoryEntry {
  percentage: number;
  status_label: string;
  status_color: 'danger' | 'warning' | 'success' | 'primary';
  calculated_at: string;
}

interface ReportData {
  user?: {
    name: string;
    target_role?: {
      category_name: string;
    };
  };
  readiness?: ReadinessData;
  skill_breakdown?: SkillBreakdown;
  validation?: ValidationData;
  roadmap?: RoadmapData;
  history?: HistoryEntry[];
}

interface Report {
  success: boolean;
  report: ReportData;
  generated_at: string;
  error?: string;
  message?: string;
}

interface ReportPageClientProps {
  userId: string;
  userName: string;
}

// ============================================================================
// Helper Components
// ============================================================================

const StatusBadge = ({ 
  label, 
  color, 
  size = 'normal' 
}: { 
  label: string; 
  color: 'danger' | 'warning' | 'success' | 'primary'; 
  size?: 'normal' | 'small';
}) => {
  const colorMap = {
    danger: 'bg-red-100 text-red-600 border-red-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    success: 'bg-green-100 text-green-700 border-green-200',
    primary: 'bg-blue-100 text-blue-700 border-blue-200',
  };
  
  const sizeClass = size === 'small' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  
  return (
    <span className={`inline-block ${sizeClass} rounded-full font-semibold border ${colorMap[color] || colorMap.primary}`}>
      {label}
    </span>
  );
};

const ProgressBar = ({ 
  percentage, 
  color = 'primary', 
  height = 12 
}: { 
  percentage: number; 
  color?: 'danger' | 'warning' | 'success' | 'primary'; 
  height?: number;
}) => {
  const colorMap = {
    danger: 'bg-red-500',
    warning: 'bg-amber-500',
    success: 'bg-green-500',
    primary: 'bg-blue-500',
  };
  
  return (
    <div className="w-full bg-gray-200 rounded overflow-hidden" style={{ height: `${height}px` }}>
      <div 
        className={`h-full rounded transition-all duration-500 ${colorMap[color] || colorMap.primary}`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export default function ReportPageClient({ userId, userName }: ReportPageClientProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  
  // State
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ type: string; message: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // Fetch report
  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/reports/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        // Deduplicate skills
        if (data.report?.skill_breakdown) {
          const deduplicateSkills = (skills: SkillEntry[]) => {
            const seen = new Set();
            return skills.filter(skill => {
              if (seen.has(skill.skill_id)) {
                return false;
              }
              seen.add(skill.skill_id);
              return true;
            });
          };
          
          data.report.skill_breakdown.met_skills = deduplicateSkills(
            data.report.skill_breakdown.met_skills || []
          );
          data.report.skill_breakdown.missing_skills = deduplicateSkills(
            data.report.skill_breakdown.missing_skills || []
          );
          
          data.report.skill_breakdown.met_count = data.report.skill_breakdown.met_skills.length;
          data.report.skill_breakdown.missing_count = data.report.skill_breakdown.missing_skills.length;
          data.report.skill_breakdown.total_skills = 
            data.report.skill_breakdown.met_count + data.report.skill_breakdown.missing_count;
        }
        
        setReport(data);
      } else {
        setError({
          type: data.error === 'NO_READINESS' ? 'no_readiness' : 'error',
          message: data.message || 'Failed to load report',
        });
      }
    } catch (err) {
      console.error('[ReportPage] Error fetching report:', err);
      setError({
        type: 'error',
        message: 'Failed to load report. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId]);
  
  // Initial fetch
  useEffect(() => {
    fetchReport();
  }, [fetchReport]);
  
  // Handle print
  const handlePrint = () => {
    window.print();
  };
  
  // Handle PDF export
  const handleExportPDF = async () => {
    setIsExporting(true);

    try {
      const html2pdf = (await import('html2pdf.js')).default;

      const element = reportRef.current;
      if (!element) {
        throw new Error('Report element not found');
      }

      const date = new Date().toISOString().split('T')[0];

      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `readiness-report-${userName.replace(/\s+/g, '-')}-${date}.pdf`,
        image: {
          type: 'jpeg',
          quality: 0.98,
        } as const,
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          onclone: (clonedDoc: Document) => {
            // Remove external stylesheets that might contain unsupported colors
            const stylesheets = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
            stylesheets.forEach(sheet => sheet.remove());
            
            // Apply theme color to elements
            const coloredElements = clonedDoc.querySelectorAll('[class*="blue-"]');
            coloredElements.forEach(el => {
              const element = el as HTMLElement;
              // Apply theme color to primary elements
              if (element.className.includes('text-blue-')) {
                element.style.color = '#5693C1';
              }
              if (element.className.includes('bg-blue-')) {
                element.style.backgroundColor = '#5693C1';
              }
              if (element.className.includes('border-blue-')) {
                element.style.borderColor = '#5693C1';
              }
            });
          }
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
        } as const,
      };

      await html2pdf().set(opt).from(element).save();

    } catch (err) {
      console.error('PDF export error:', err);
      alert('Failed to export PDF. Try using the Print option instead.');
    } finally {
      setIsExporting(false);
    }
  };
  
  // Calculate trend from history
  const calculateTrend = (history: HistoryEntry[] | undefined) => {
    if (!history || history.length < 2) {
      return { direction: 'stable', icon: '➡️', color: 'text-gray-500', text: 'No history' };
    }
    
    const recent = history.slice(0, 3);
    const newest = recent[0]?.percentage || 0;
    const oldest = recent[recent.length - 1]?.percentage || 0;
    const diff = newest - oldest;
    
    if (diff > 5) return { direction: 'up', icon: '📈', color: 'text-green-600', text: `+${diff}% improvement` };
    if (diff < -5) return { direction: 'down', icon: '📉', color: 'text-red-600', text: `${diff}% decline` };
    return { direction: 'stable', icon: '➡️', color: 'text-gray-500', text: 'Stable' };
  };
  
  // Get source label
  const getSourceLabel = (source?: string) => {
    switch (source) {
      case 'self': return 'Self-claimed';
      case 'resume': return 'Resume';
      case 'validated': return 'Mentor ✓';
      default: return source || 'Unknown';
    }
  };
  
  // Get score circle color
  const getScoreColor = (color?: string) => {
    switch (color) {
      case 'danger': return 'border-red-500';
      case 'warning': return 'border-amber-500';
      case 'success': return 'border-green-500';
      default: return 'border-blue-500';
    }
  };
  
  // ============================================================================
  // Render: Loading State
  // ============================================================================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#5693C1' }}></div>
            <p className="text-gray-600 mt-4">Generating your readiness report...</p>
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
          <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
            {error.type === 'no_readiness' ? (
              <>
                <div className="text-5xl mb-4">📊</div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">No Readiness Data Found</h2>
                <p className="text-gray-600 mb-6">
                  You need to calculate your readiness score before generating a report.
                </p>
                <Link
                  href="/readiness"
                  className="px-6 py-3 rounded-lg font-medium transition-colors text-white inline-flex items-center gap-2"
                  style={{ backgroundColor: '#5693C1' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4682B4'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#5693C1'}
                >
                  Calculate Readiness First
                </Link>
              </>
            ) : (
              <>
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Error Loading Report</h2>
                <p className="text-gray-600 mb-6">{error.message}</p>
                <button
                  onClick={fetchReport}
                  className="px-6 py-3 rounded-lg font-medium transition-colors text-white"
                  style={{ backgroundColor: '#5693C1' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4682B4'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#5693C1'}
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // ============================================================================
  // Prepare Data
  // ============================================================================
  const { user: reportUser, readiness, skill_breakdown, validation, roadmap, history } = report?.report || {};
  const trend = calculateTrend(history);
  const hasPendingValidation = (validation?.pending_validation || 0) > 0;
  
  // Combine all skills for table view
  const allSkills: SkillEntry[] = [
    ...(skill_breakdown?.met_skills || []).map(s => ({ ...s, status: 'met' as const })),
    ...(skill_breakdown?.missing_skills || []).map(s => ({ ...s, status: 'missing' as const })),
  ];
  
  // ============================================================================
  // Render: Main Page
  // ============================================================================
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <span>📊</span>
            Readiness Report
          </h1>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Your defensible proof of skill readiness
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-8 print:hidden">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2 text-sm"
          >
            🖨️ Print Report
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="px-5 py-2.5 rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2 text-sm text-white"
            style={{ backgroundColor: '#5693C1' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4682B4'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#5693C1'}
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Exporting...
              </>
            ) : (
              <>📄 Export as PDF</>
            )}
          </button>
        </div>
        
        {/* Report Content */}
        <div 
          ref={reportRef} 
          id="readiness-report" 
          className="font-sans bg-white border border-gray-200 rounded-xl overflow-hidden print:border-0 print:rounded-none"
        >
          
          {/* Report Header */}
          <div className="p-6 sm:p-8 border-b-4" style={{ borderColor: '#5693C1' }}>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl font-bold text-gray-900">🎯 READINESS REPORT</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-500 text-sm">Candidate: </span>
                    <span className="font-semibold text-gray-900">{reportUser?.name || userName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Target Role: </span>
                    <span className="font-semibold" style={{ color: '#5693C1' }}>
                      {reportUser?.target_role?.category_name || 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Generated on</div>
                <div className="font-semibold text-gray-900">
                  {new Date(report?.generated_at || new Date()).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(report?.generated_at || new Date()).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          </div>
          
          {/* Report Body */}
          <div className="p-6 sm:p-8">
            
            {/* Validation Pending Disclaimer */}
            {hasPendingValidation && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start sm:items-center gap-3">
                <span className="text-xl">⏳</span>
                <div>
                  <div className="font-semibold text-amber-800 text-sm">Validation Pending</div>
                  <div className="text-amber-700 text-sm">
                    {validation?.pending_validation} skill(s) are awaiting mentor review. 
                    Scores may change after validation.
                  </div>
                </div>
              </div>
            )}
            
            {/* SECTION 1: READINESS SUMMARY */}
            <div className="mb-8">
              <h2 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2 border-b-2 border-gray-200 pb-2">
                📊 Readiness Summary
              </h2>
              
              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                {/* Score Circle */}
                <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-8 ${getScoreColor(readiness?.status_color)} flex flex-col items-center justify-center bg-gray-50`}>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">{readiness?.percentage || 0}%</div>
                  <div className="text-xs text-gray-500">SCORE</div>
                </div>
                
                {/* Status & Details */}
                <div className="flex-1">
                  <div className="mb-3">
                    <StatusBadge label={readiness?.status_label || 'Unknown'} color={readiness?.status_color || 'primary'} />
                  </div>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="text-gray-500">Last calculated: </span>
                      <span className="text-gray-900">
                        {readiness?.calculated_at 
                          ? new Date(readiness.calculated_at).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric'
                            })
                          : 'Never'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Skills matched: </span>
                      <span className="text-gray-900">
                        {skill_breakdown?.met_count || 0} of {skill_breakdown?.total_skills || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Trend: </span>
                      <span className={`font-medium ${trend.color}`}>
                        {trend.icon} {trend.text || trend.direction}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* SECTION 2: SKILL BREAKDOWN */}
            <div className="mb-8">
              <h2 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2 border-b-2 border-gray-200 pb-2">
                ✅ Skill Breakdown
                <span className="text-sm font-normal text-gray-500">
                  ({skill_breakdown?.met_count || 0} met, {skill_breakdown?.missing_count || 0} missing)
                </span>
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-3 py-2 border-b-2 border-gray-200 text-gray-700">Skill</th>
                      <th className="text-center px-3 py-2 border-b-2 border-gray-200 text-gray-700">Status</th>
                      <th className="text-center px-3 py-2 border-b-2 border-gray-200 text-gray-700">Source</th>
                      <th className="text-center px-3 py-2 border-b-2 border-gray-200 text-gray-700">Importance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allSkills.map((skill, idx) => (
                      <tr 
                        key={skill.skill_id || idx} 
                        className={`border-b border-gray-100 ${skill.status === 'met' ? 'bg-green-50' : 'bg-red-50'}`}
                      >
                        <td className="px-3 py-2 font-medium text-gray-900">
                          {skill.is_validated && <span className="text-green-600">✓ </span>}
                          {skill.skill_name}
                        </td>
                        <td className="text-center px-3 py-2">
                          <StatusBadge 
                            label={skill.status === 'met' ? 'Met' : 'Missing'} 
                            color={skill.status === 'met' ? 'success' : 'danger'}
                            size="small"
                          />
                        </td>
                        <td className="text-center px-3 py-2 text-gray-500">
                          {getSourceLabel(skill.source)}
                        </td>
                        <td className="text-center px-3 py-2">
                          {skill.importance === 'required' ? (
                            <span className="text-red-600 font-medium">Required</span>
                          ) : (
                            <span className="text-gray-500">Optional</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* SECTION 3: ROADMAP PRIORITIES */}
            <div className="mb-8">
              <h2 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2 border-b-2 border-gray-200 pb-2">
                🎯 Roadmap Priorities
              </h2>
              
              {roadmap ? (
                <>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500 text-center">
                      <div className="text-xl sm:text-2xl font-bold text-red-600">{roadmap?.by_priority?.high || 0}</div>
                      <div className="text-xs text-red-800 font-medium">🔥 HIGH</div>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500 text-center">
                      <div className="text-xl sm:text-2xl font-bold text-amber-600">{roadmap?.by_priority?.medium || 0}</div>
                      <div className="text-xs text-amber-800 font-medium">📈 MEDIUM</div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500 text-center">
                      <div className="text-xl sm:text-2xl font-bold text-green-600">{roadmap?.by_priority?.low || 0}</div>
                      <div className="text-xs text-green-800 font-medium">📋 LOW</div>
                    </div>
                  </div>
                  
                  {/* Top Focus Areas */}
                  {roadmap?.high_priority_items && roadmap.high_priority_items.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="font-semibold text-sm text-gray-700 mb-2">🔥 Immediate Focus Areas:</div>
                      <ol className="list-decimal ml-5 space-y-1">
                        {roadmap.high_priority_items.slice(0, 3).map((item, idx) => (
                          <li key={idx} className="text-sm">
                            <strong className="text-gray-900">{item.skill_name}</strong>
                            <span className="text-gray-500"> — {item.reason}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                  
                  {/* Why this matters */}
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                    💡 <strong>Why this matters:</strong> High priority items represent required skills 
                    that are either missing or rejected. Addressing these first will have the biggest 
                    impact on your readiness score.
                  </div>
                </>
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-lg text-gray-500">
                  <div className="text-3xl mb-2">🗺️</div>
                  No roadmap generated yet. Visit the Roadmap page to generate one.
                </div>
              )}
            </div>
            
            {/* SECTION 4: PROGRESS SNAPSHOT */}
            <div className="mb-8">
              <h2 className="text-base font-semibold text-gray-700 mb-4 flex items-center justify-between border-b-2 border-gray-200 pb-2">
                <span className="flex items-center gap-2">📈 Progress Snapshot</span>
                <span className={`text-sm font-medium ${trend.color}`}>
                  {trend.icon} {trend.text || trend.direction}
                </span>
              </h2>
              
              {history && history.length > 0 ? (
                <div className="space-y-3">
                  {history.slice(0, 3).map((entry, idx) => (
                    <div 
                      key={idx} 
                      className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 rounded-lg ${
                        idx === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="w-full sm:w-16 text-sm text-gray-500">
                        {new Date(entry.calculated_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric'
                        })}
                      </div>
                      <div className="flex-1">
                        <ProgressBar percentage={entry.percentage} color={entry.status_color} height={8} />
                      </div>
                      <div className={`w-full sm:w-12 text-right sm:text-left font-semibold ${idx === 0 ? 'text-green-600' : 'text-gray-700'}`}>
                        {entry.percentage}%
                      </div>
                      <StatusBadge label={entry.status_label} color={entry.status_color} size="small" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-lg text-gray-500">
                  No historical data available yet.
                </div>
              )}
            </div>
            
            {/* SECTION 5: FOOTER */}
            <div className="mt-8 pt-6 border-t-2 border-gray-200">
              <div className="text-center mb-4">
                <div className="text-sm font-semibold text-gray-700">Generated by RoleReady</div>
                <div className="text-xs text-gray-400">
                  {new Date(report?.generated_at || new Date()).toLocaleString()}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600">
                <div className="font-semibold text-gray-700 mb-2">📋 Explainability Note</div>
                <p className="mb-2">
                  This report is <strong>rule-based and evidence-driven</strong>. Every data point is traceable:
                </p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Readiness scores are calculated from skill matches against role requirements</li>
                  <li>Skills are sourced from self-claims, resume parsing, or mentor validation</li>
                  <li>Roadmap priorities follow deterministic rules (no AI interpretation)</li>
                  <li>All calculations are reproducible and auditable</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
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
            View Readiness →
          </Link>
        </div>
      </div>
      
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background-color: white !important;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          #readiness-report {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }
          
          .text-gray-900 {
            color: #111827 !important;
          }
          
          .text-blue-600 {
            color: #5693C1 !important;
          }
        }
      `}</style>
    </div>
  );
}