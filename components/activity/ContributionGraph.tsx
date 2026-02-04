'use client';

import { useMemo, useState } from 'react';

interface ContributionData {
  startDate: string;
  endDate: string;
  contributions: Record<string, number>;
  totalContributions: number;
}

interface ContributionGraphProps {
  data: ContributionData | null;
  loading?: boolean;
}

// Day names for row labels
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Month labels
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Get intensity level based on contribution count
 * 0 → level 0 (gray)
 * 1-2 → level 1 (light brand)
 * 3-4 → level 2 (medium brand)
 * 5+ → level 3 (dark brand)
 */
function getIntensityLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  return 3;
}

/**
 * Get color class based on intensity level
 */
function getColorClass(level: number): string {
  switch (level) {
    case 0:
      return 'bg-gray-100';
    case 1:
      return 'bg-[#b8d4e8]'; // Light brand color
    case 2:
      return 'bg-[#5693C1]'; // Brand color
    case 3:
      return 'bg-[#3a6a8c]'; // Dark brand color
    default:
      return 'bg-gray-100';
  }
}

interface DayCell {
  date: string;
  count: number;
  level: number;
  dayOfWeek: number;
  weekIndex: number;
}

export default function ContributionGraph({ data, loading }: ContributionGraphProps) {
  const [hoveredDay, setHoveredDay] = useState<DayCell | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Process data into weeks structure
  const { weeks, monthLabels } = useMemo(() => {
    if (!data) return { weeks: [], monthLabels: [] };

    const contributions = data.contributions;
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    // Group days by week
    const weeksData: DayCell[][] = [];
    let currentWeek: DayCell[] = [];
    let weekIndex = 0;
    const monthPositions: { month: number; weekIndex: number }[] = [];
    let lastMonth = -1;

    const currentDate = new Date(startDate);
    
    // Fill initial week with empty cells before startDate
    const startDayOfWeek = currentDate.getDay();
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push({
        date: '',
        count: 0,
        level: 0,
        dayOfWeek: i,
        weekIndex: 0,
      });
    }

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.getDay();
      const count = contributions[dateStr] || 0;
      const month = currentDate.getMonth();

      // Track month changes
      if (month !== lastMonth) {
        monthPositions.push({ month, weekIndex });
        lastMonth = month;
      }

      currentWeek.push({
        date: dateStr,
        count,
        level: getIntensityLevel(count),
        dayOfWeek,
        weekIndex,
      });

      // Start new week on Sunday
      if (dayOfWeek === 6) {
        weeksData.push(currentWeek);
        currentWeek = [];
        weekIndex++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Add remaining days
    if (currentWeek.length > 0) {
      weeksData.push(currentWeek);
    }

    // Calculate month labels with positions
    const labels = monthPositions.map(({ month, weekIndex }) => ({
      label: MONTHS[month],
      position: weekIndex,
    }));

    return { weeks: weeksData, monthLabels: labels };
  }, [data]);

  const handleMouseEnter = (day: DayCell, e: React.MouseEvent) => {
    if (day.date) {
      setHoveredDay(day);
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredDay(null);
  };

  // Format date for tooltip
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="h-[130px] bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <p className="text-gray-500 text-center">No contribution data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">
          {data.totalContributions} contributions in the last year
        </h3>
      </div>

      {/* Graph Container - Scrollable on mobile */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[700px]">
          {/* Month Labels */}
          <div className="flex mb-2 ml-8">
            {monthLabels.map((m, idx) => (
              <div
                key={idx}
                className="text-xs text-gray-400"
                style={{
                  position: 'relative',
                  left: `${m.position * 13}px`,
                  width: '40px',
                }}
              >
                {m.label}
              </div>
            ))}
          </div>

          {/* Graph Grid */}
          <div className="flex gap-1">
            {/* Day Labels */}
            <div className="flex flex-col gap-[3px] mr-1">
              {DAY_LABELS.map((day, idx) => (
                <div
                  key={day}
                  className="h-[11px] text-[10px] text-gray-400 flex items-center"
                  style={{ visibility: idx % 2 === 0 ? 'hidden' : 'visible' }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Weeks Grid */}
            <div className="flex gap-[3px]">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-[3px]">
                  {week.map((day, dayIdx) => (
                    <div
                      key={dayIdx}
                      className={`w-[11px] h-[11px] rounded-sm ${
                        day.date ? getColorClass(day.level) : 'bg-transparent'
                      } ${day.date ? 'cursor-pointer hover:ring-1 hover:ring-gray-400' : ''}`}
                      onMouseEnter={(e) => handleMouseEnter(day, e)}
                      onMouseLeave={handleMouseLeave}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4">
        <span className="text-xs text-gray-400">Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3].map((level) => (
            <div
              key={level}
              className={`w-[11px] h-[11px] rounded-sm ${getColorClass(level)}`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-400">More</span>
      </div>

      {/* Tooltip */}
      {hoveredDay && hoveredDay.date && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
        >
          <span className="font-medium">
            {hoveredDay.count} contribution{hoveredDay.count !== 1 ? 's' : ''}
          </span>
          {' '}on {formatDate(hoveredDay.date)}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}
