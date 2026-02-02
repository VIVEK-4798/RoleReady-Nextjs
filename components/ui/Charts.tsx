/**
 * Chart Components
 * 
 * Lightweight, client-side chart components using SVG.
 * No external charting libraries - pure Tailwind + SVG.
 */

'use client';

// ============================================================================
// Progress Ring (Circular Progress)
// ============================================================================

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  showLabel?: boolean;
  label?: string;
  sublabel?: string;
}

export function ProgressRing({
  percentage,
  size = 120,
  strokeWidth = 8,
  color,
  bgColor = 'stroke-gray-200 dark:stroke-gray-700',
  showLabel = true,
  label,
  sublabel,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  // Determine color based on percentage if not provided
  const strokeColor = color || (
    percentage >= 80 ? 'stroke-green-500' :
    percentage >= 60 ? 'stroke-blue-500' :
    percentage >= 40 ? 'stroke-yellow-500' : 'stroke-red-500'
  );

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={bgColor}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${strokeColor} transition-all duration-500 ease-out`}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {label || `${Math.round(percentage)}%`}
          </span>
          {sublabel && (
            <span className="text-xs text-gray-500 dark:text-gray-400">{sublabel}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Horizontal Bar Chart
// ============================================================================

interface BarChartItem {
  label: string;
  value: number;
  maxValue?: number;
  color?: string;
}

interface HorizontalBarChartProps {
  items: BarChartItem[];
  showValues?: boolean;
  height?: number;
  className?: string;
}

export function HorizontalBarChart({
  items,
  showValues = true,
  height = 24,
  className = '',
}: HorizontalBarChartProps) {
  const maxValue = Math.max(...items.map((i) => i.maxValue || i.value), 1);

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, index) => {
        const percentage = (item.value / (item.maxValue || maxValue)) * 100;
        const barColor = item.color || (
          percentage >= 80 ? 'bg-green-500' :
          percentage >= 60 ? 'bg-blue-500' :
          percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
        );

        return (
          <div key={index}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                {item.label}
              </span>
              {showValues && (
                <span className="text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                  {item.value}{item.maxValue ? `/${item.maxValue}` : ''}
                </span>
              )}
            </div>
            <div 
              className="w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
              style={{ height }}
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
                style={{ width: `${Math.min(100, percentage)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Skill Gap Distribution Chart
// ============================================================================

interface SkillGapItem {
  name: string;
  current: number;
  required: number;
  importance: 'required' | 'optional';
}

interface SkillGapChartProps {
  skills: SkillGapItem[];
  maxItems?: number;
  className?: string;
}

export function SkillGapChart({
  skills,
  maxItems = 8,
  className = '',
}: SkillGapChartProps) {
  // Sort by gap (descending) and take top items
  const sortedSkills = [...skills]
    .sort((a, b) => (b.required - b.current) - (a.required - a.current))
    .slice(0, maxItems);

  return (
    <div className={`space-y-3 ${className}`}>
      {sortedSkills.map((skill, index) => {
        const gap = skill.required - skill.current;
        const percentage = skill.required > 0 ? (skill.current / skill.required) * 100 : 100;
        const isMet = skill.current >= skill.required;

        return (
          <div key={index} className="group">
            <div className="flex justify-between items-center text-sm mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                  {skill.name}
                </span>
                {skill.importance === 'required' && (
                  <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded flex-shrink-0">
                    Required
                  </span>
                )}
              </div>
              <span className={`text-xs flex-shrink-0 ml-2 ${isMet ? 'text-green-600' : 'text-gray-500 dark:text-gray-400'}`}>
                Lv {skill.current} / {skill.required}
              </span>
            </div>
            <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              {/* Current level */}
              <div
                className={`absolute h-full rounded-full transition-all duration-300 ${
                  isMet ? 'bg-green-500' : skill.importance === 'required' ? 'bg-blue-500' : 'bg-gray-400'
                }`}
                style={{ width: `${Math.min(100, percentage)}%` }}
              />
              {/* Gap indicator */}
              {!isMet && (
                <div
                  className="absolute h-full bg-red-200 dark:bg-red-900/50"
                  style={{ 
                    left: `${Math.min(100, percentage)}%`,
                    width: `${100 - Math.min(100, percentage)}%`
                  }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Mini Stat Card
// ============================================================================

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StatCard({
  label,
  value,
  sublabel,
  icon,
  trend,
  className = '',
}: StatCardProps) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-500',
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
        {icon && <span className="text-gray-400 dark:text-gray-500">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
        {sublabel && (
          <span className={`text-sm ${trend ? trendColors[trend] : 'text-gray-500 dark:text-gray-400'}`}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Progress Bar (Simple Linear)
// ============================================================================

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  color,
  showLabel = false,
  className = '',
}: ProgressBarProps) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  
  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const barColor = color || (
    percentage >= 80 ? 'bg-green-500' :
    percentage >= 60 ? 'bg-blue-500' :
    percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
  );

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">Progress</span>
          <span className="font-medium text-gray-900 dark:text-white">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
    </div>
  );
}
