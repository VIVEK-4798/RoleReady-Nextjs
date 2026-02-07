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
                // Critical fix: Convert all LAB colors to RGB before html2canvas processes them
                // html2canvas doesn't support modern CSS color functions (lab, oklch, lch)
                
                // Step 1: Remove external stylesheets that might contain LAB colors
                const stylesheets = clonedDoc.querySelectorAll('link[rel="stylesheet"]');
                stylesheets.forEach(sheet => sheet.remove());
                
                // Step 2: Get the report element in both original and cloned docs
                const clonedReport = clonedDoc.getElementById('readiness-report');
                const originalReport = document.getElementById('readiness-report');
                
                if (!clonedReport || !originalReport) return;
                
                // Step 3: Process every element - get computed RGB from original, apply to clone
                const clonedElements = clonedReport.querySelectorAll('*');
                const originalElements = originalReport.querySelectorAll('*');
                
                clonedElements.forEach((clonedEl, index) => {
                    const originalEl = originalElements[index];
                    if (!originalEl) return;
                    
                    try {
                        const element = clonedEl as HTMLElement;
                        const computed = window.getComputedStyle(originalEl);
                        
                        // Apply all color-related properties as inline styles
                        const color = computed.color;
                        const bgColor = computed.backgroundColor;
                        const borderTopColor = computed.borderTopColor;
                        const borderRightColor = computed.borderRightColor;
                        const borderBottomColor = computed.borderBottomColor;
                        const borderLeftColor = computed.borderLeftColor;
                        
                        // Only apply if not transparent/none
                        if (color && color !== 'rgba(0, 0, 0, 0)') {
                            element.style.color = color;
                        }
                        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
                            element.style.backgroundColor = bgColor;
                        }
                        if (borderTopColor && borderTopColor !== 'rgba(0, 0, 0, 0)') {
                            element.style.borderTopColor = borderTopColor;
                        }
                        if (borderRightColor && borderRightColor !== 'rgba(0, 0, 0, 0)') {
                            element.style.borderRightColor = borderRightColor;
                        }
                        if (borderBottomColor && borderBottomColor !== 'rgba(0, 0, 0, 0)') {
                            element.style.borderBottomColor = borderBottomColor;
                        }
                        if (borderLeftColor && borderLeftColor !== 'rgba(0, 0, 0, 0)') {
                            element.style.borderLeftColor = borderLeftColor;
                        }
                        
                        // Copy other essential styles
                        element.style.fontFamily = computed.fontFamily;
                        element.style.fontSize = computed.fontSize;
                        element.style.fontWeight = computed.fontWeight;
                        element.style.lineHeight = computed.lineHeight;
                        element.style.textAlign = computed.textAlign;
                        element.style.padding = computed.padding;
                        element.style.margin = computed.margin;
                        element.style.borderWidth = computed.borderWidth;
                        element.style.borderStyle = computed.borderStyle;
                        element.style.borderRadius = computed.borderRadius;
                        element.style.display = computed.display;
                        element.style.width = computed.width;
                        element.style.height = computed.height;
                    } catch (e) {
                        // Skip problematic elements
                        console.warn('Could not process element:', e);
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
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Generating your readiness report...</p>
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
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            {error.type === 'no_readiness' ? (
              <>
                <div className="text-5xl mb-4">📊</div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">No Readiness Data Found</h2>
                <p className="text-gray-600 mb-6">
                  You need to calculate your readiness score before generating a report.
                </p>
                <Link
                  href="/readiness"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
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
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
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
    <>      
      {/* Report Content */}
      <div className="min-h-screen bg-gray-50 py-12 print:py-0 print:bg-white">
        <div className="max-w-3xl mx-auto px-4 print:px-0 print:max-w-full">
          
          {/* Page Header - Hidden during print */}
          <div className="text-center mb-8 print:hidden">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
              <span>📊</span>
              Readiness Report
            </h1>
            <p className="text-gray-600 mt-2">
              Your defensible proof of skill readiness
            </p>
          </div>
          
          {/* Action Buttons - Hidden during print */}
          <div className="flex justify-center gap-3 mb-6 print:hidden">
            <button
              onClick={handlePrint}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
            >
              🖨️ Print
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Exporting...
                </>
              ) : (
                <>📄 Export PDF</>
              )}
            </button>
          </div>
          
          <div ref={reportRef} id="readiness-report" className="font-sans">
            
            {/* PDF Export Color Fix - Override LAB colors with RGB */}
            <style dangerouslySetInnerHTML={{__html: `
              #readiness-report * {
                /* Force RGB colors for PDF export compatibility */
              }
              #readiness-report .text-gray-500 { color: rgb(107, 114, 128) !important; }
              #readiness-report .text-gray-600 { color: rgb(75, 85, 99) !important; }
              #readiness-report .text-gray-700 { color: rgb(55, 65, 81) !important; }
              #readiness-report .text-gray-800 { color: rgb(31, 41, 55) !important; }
              #readiness-report .text-gray-900 { color: rgb(17, 24, 39) !important; }
              #readiness-report .text-blue-600 { color: rgb(37, 99, 235) !important; }
              #readiness-report .text-blue-700 { color: rgb(29, 78, 216) !important; }
              #readiness-report .text-blue-800 { color: rgb(30, 64, 175) !important; }
              #readiness-report .text-green-600 { color: rgb(22, 163, 74) !important; }
              #readiness-report .text-green-700 { color: rgb(21, 128, 61) !important; }
              #readiness-report .text-red-600 { color: rgb(220, 38, 38) !important; }
              #readiness-report .text-red-700 { color: rgb(185, 28, 28) !important; }
              #readiness-report .text-yellow-600 { color: rgb(202, 138, 4) !important; }
              #readiness-report .text-yellow-700 { color: rgb(161, 98, 7) !important; }
              #readiness-report .text-amber-500 { color: rgb(245, 158, 11) !important; }
              #readiness-report .text-orange-600 { color: rgb(234, 88, 12) !important; }
              #readiness-report .bg-white { background-color: rgb(255, 255, 255) !important; }
              #readiness-report .bg-gray-50 { background-color: rgb(249, 250, 251) !important; }
              #readiness-report .bg-gray-100 { background-color: rgb(243, 244, 246) !important; }
              #readiness-report .bg-gray-200 { background-color: rgb(229, 231, 235) !important; }
              #readiness-report .bg-blue-50 { background-color: rgb(239, 246, 255) !important; }
              #readiness-report .bg-blue-100 { background-color: rgb(219, 234, 254) !important; }
              #readiness-report .bg-blue-500 { background-color: rgb(59, 130, 246) !important; }
              #readiness-report .bg-green-50 { background-color: rgb(240, 253, 244) !important; }
              #readiness-report .bg-green-100 { background-color: rgb(220, 252, 231) !important; }
              #readiness-report .bg-green-500 { background-color: rgb(34, 197, 94) !important; }
              #readiness-report .bg-red-50 { background-color: rgb(254, 242, 242) !important; }
              #readiness-report .bg-red-100 { background-color: rgb(254, 226, 226) !important; }
              #readiness-report .bg-red-500 { background-color: rgb(239, 68, 68) !important; }
              #readiness-report .bg-yellow-50 { background-color: rgb(254, 252, 232) !important; }
              #readiness-report .bg-yellow-100 { background-color: rgb(254, 249, 195) !important; }
              #readiness-report .bg-amber-500 { background-color: rgb(245, 158, 11) !important; }
              #readiness-report .border-gray-100 { border-color: rgb(243, 244, 246) !important; }
              #readiness-report .border-gray-200 { border-color: rgb(229, 231, 235) !important; }
              #readiness-report .border-gray-300 { border-color: rgb(209, 213, 219) !important; }
              #readiness-report .border-blue-500 { border-color: rgb(59, 130, 246) !important; }
              #readiness-report .border-green-200 { border-color: rgb(187, 247, 208) !important; }
              #readiness-report .border-green-500 { border-color: rgb(34, 197, 94) !important; }
              #readiness-report .border-red-200 { border-color: rgb(254, 202, 202) !important; }
              #readiness-report .border-red-500 { border-color: rgb(239, 68, 68) !important; }
              #readiness-report .border-amber-500 { border-color: rgb(245, 158, 11) !important; }
            `}} />
            
            {/* ═══════════════════════════════════════════════════════════════
                SECTION 1: HEADER
            ═══════════════════════════════════════════════════════════════ */}
            <div className="bg-white p-8 rounded-t-2xl border-b-4 border-blue-500 print:rounded-none">
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
                      <span className="font-semibold text-blue-600">
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
            <div className="bg-white p-8 rounded-b-2xl border border-t-0 border-gray-200 print:rounded-none print:border-0">
              
              {/* Validation Pending Disclaimer */}
              {hasPendingValidation && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-center gap-3">
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
              
              {/* ═══════════════════════════════════════════════════════════════
                  SECTION 2: READINESS SUMMARY
              ═══════════════════════════════════════════════════════════════ */}
              <div className="mb-8">
                <h2 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2 border-b-2 border-gray-200 pb-2">
                  📊 Readiness Summary
                </h2>
                
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  {/* Score Circle */}
                  <div className={`w-28 h-28 rounded-full border-8 ${getScoreColor(readiness?.status_color)} flex flex-col items-center justify-center bg-gray-50`}>
                    <div className="text-3xl font-bold text-gray-900">{readiness?.percentage || 0}%</div>
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
              
              {/* ═══════════════════════════════════════════════════════════════
                  SECTION 3: SKILL BREAKDOWN
              ═══════════════════════════════════════════════════════════════ */}
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
                        <th className="text-center px-3 py-2 border-b-2 border-gray-200 text-gray-700">Weight</th>
                        <th className="text-center px-3 py-2 border-b-2 border-gray-200 text-gray-700">Importance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allSkills.map((skill, idx) => (
                        <tr 
                          key={idx} 
                          className={`border-b border-gray-100 ${skill.status === 'met' ? 'bg-green-50' : 'bg-red-50'}`}
                        >
                          <td className="px-3 py-2 font-medium">
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
                          <td className="text-center px-3 py-2 text-gray-500">
                            {skill.weight} pts
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
              
              {/* ═══════════════════════════════════════════════════════════════
                  SECTION 4: ROADMAP PRIORITIES
              ═══════════════════════════════════════════════════════════════ */}
              <div className="mb-8">
                <h2 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2 border-b-2 border-gray-200 pb-2">
                  🎯 Roadmap Priorities
                </h2>
                
                {roadmap ? (
                  <>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500 text-center">
                        <div className="text-2xl font-bold text-red-600">{roadmap?.by_priority?.high || 0}</div>
                        <div className="text-xs text-red-800 font-medium">🔥 HIGH</div>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500 text-center">
                        <div className="text-2xl font-bold text-amber-600">{roadmap?.by_priority?.medium || 0}</div>
                        <div className="text-xs text-amber-800 font-medium">📈 MEDIUM</div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500 text-center">
                        <div className="text-2xl font-bold text-green-600">{roadmap?.by_priority?.low || 0}</div>
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
              
              {/* ═══════════════════════════════════════════════════════════════
                  SECTION 5: PROGRESS SNAPSHOT
              ═══════════════════════════════════════════════════════════════ */}
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
                        className={`flex items-center gap-4 p-3 rounded-lg ${
                          idx === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className="w-16 text-sm text-gray-500">
                          {new Date(entry.calculated_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric'
                          })}
                        </div>
                        <div className="flex-1">
                          <ProgressBar percentage={entry.percentage} color={entry.status_color} height={8} />
                        </div>
                        <div className={`w-12 text-right font-semibold ${idx === 0 ? 'text-green-600' : 'text-gray-700'}`}>
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
              
              {/* ═══════════════════════════════════════════════════════════════
                  SECTION 6: FOOTER
              ═══════════════════════════════════════════════════════════════ */}
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
          
          {/* Navigation - Hidden during print */}
          <div className="flex justify-between mt-6 print:hidden">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              ← Back to Dashboard
            </Link>
            <Link
              href="/readiness"
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              View Readiness →
            </Link>
          </div>
        </div>
      </div>
      
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
