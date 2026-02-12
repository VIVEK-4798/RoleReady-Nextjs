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

// Day names for row labels - only showing Mon, Wed, Fri for cleaner look
const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', ''];

// Full month labels
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Get intensity level based on contribution count with more subtle gradient
 */
function getIntensityLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4; // Added one more level for better gradient
}

/**
 * Get color class based on intensity level - using project's blue theme color
 */
function getColorClass(level: number): string {
  switch (level) {
    case 0:
      return 'bg-[#ebedf0]'; // Empty state (light gray)
    case 1:
      return 'bg-[#c5dff0]'; // Very light blue
    case 2:
      return 'bg-[#8fc0de]'; // Light blue
    case 3:
      return 'bg-[#5693C1]'; // Brand blue (main theme color)
    case 4:
      return 'bg-[#3a6a8c]'; // Dark blue for highest contributions
    default:
      return 'bg-[#ebedf0]';
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
    const monthPositions: { month: number; weekIndex: number; width: number }[] = [];
    let lastMonth = -1;
    let monthStartWeek = 0;

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
        if (lastMonth !== -1) {
          // Calculate width based on number of weeks this month occupied
          const width = weekIndex - monthStartWeek;
          monthPositions.push({
            month: lastMonth,
            weekIndex: monthStartWeek,
            width
          });
        }
        monthStartWeek = weekIndex;
        lastMonth = month;
      }

      currentWeek.push({
        date: dateStr,
        count,
        level: getIntensityLevel(count),
        dayOfWeek,
        weekIndex,
      });

      // Start new week on Saturday (changed to Saturday for better alignment)
      if (dayOfWeek === 6) {
        if (currentWeek.length > 0) {
          weeksData.push(currentWeek);
        }
        currentWeek = [];
        weekIndex++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Add remaining days
    if (currentWeek.length > 0) {
      // Pad the last week to 7 days
      while (currentWeek.length < 7) {
        currentWeek.push({
          date: '',
          count: 0,
          level: 0,
          dayOfWeek: currentWeek.length,
          weekIndex,
        });
      }
      weeksData.push(currentWeek);
    }

    // Add the last month
    if (lastMonth !== -1) {
      const width = weekIndex - monthStartWeek + (currentWeek.length > 0 ? 1 : 0);
      monthPositions.push({
        month: lastMonth,
        weekIndex: monthStartWeek,
        width
      });
    }

    // Calculate month labels with better positioning
    const labels = monthPositions.map(({ month, weekIndex, width }) => ({
      label: MONTHS[month],
      position: weekIndex,
      width: width,
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
          <div className="h-5 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="h-[140px] bg-gray-50 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <p className="text-gray-500 text-center py-8">No contribution data available</p>
      </div>
    );
  }

  const cellSize = 14; // Slightly larger cells
  const cellGap = 4; // Increased gap for better visibility
  const dayLabelWidth = 32; // Fixed width for day labels

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900 text-base">
          {data.totalContributions.toLocaleString()} contributions in the last year
        </h3>
      </div>

      {/* Graph Container */}
      <div className="overflow-x-auto pb-3 -mx-1 px-1">
        <div className="inline-block min-w-full">
          {/* Month Labels */}
          <div className="flex mb-2" style={{ marginLeft: dayLabelWidth + cellGap }}>
            {monthLabels.map((m, idx) => (
              <div
                key={idx}
                className="text-xs font-medium text-gray-500"
                style={{
                  width: `${m.width * (cellSize + cellGap) - cellGap}px`,
                  marginRight: idx < monthLabels.length - 1 ? `${cellGap}px` : 0,
                }}
              >
                {m.label}
              </div>
            ))}
          </div>

          {/* Graph Grid */}
          <div className="flex">
            {/* Day Labels */}
            <div
              className="flex flex-col mr-3"
              style={{ gap: `${cellGap}px` }}
            >
              {DAY_LABELS.map((day, idx) => (
                <div
                  key={idx}
                  className="text-xs text-gray-400 font-medium"
                  style={{
                    height: `${cellSize}px`,
                    lineHeight: `${cellSize}px`,
                  }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Weeks Grid */}
            <div className="flex" style={{ gap: `${cellGap}px` }}>
              {weeks.map((week, weekIdx) => (
                <div
                  key={weekIdx}
                  className="flex flex-col"
                  style={{ gap: `${cellGap}px` }}
                >
                  {week.map((day, dayIdx) => (
                    <div
                      key={`${weekIdx}-${dayIdx}`}
                      className={`rounded-sm transition-all duration-100 ${day.date ? getColorClass(day.level) : 'bg-transparent'
                        } ${day.date ? 'cursor-pointer hover:ring-2 hover:ring-gray-400 hover:ring-offset-1' : ''}`}
                      style={{
                        width: `${cellSize}px`,
                        height: `${cellSize}px`,
                      }}
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

      {/* Footer with Legend */}
      <div className="flex items-center justify-between mt-6 pt-2 border-t border-gray-50">
        <div className="text-xs text-gray-400">
          <span className="font-medium text-gray-700">{data.totalContributions.toLocaleString()}</span> total contributions
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className="rounded-sm"
                style={{
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                  backgroundColor: getColorClass(level).replace('bg-[', '').replace(']', ''),
                }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400">More</span>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredDay && hoveredDay.date && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
        >
          <div className="font-medium">
            {hoveredDay.count.toLocaleString()} contribution{hoveredDay.count !== 1 ? 's' : ''}
          </div>
          <div className="text-gray-300 text-[10px] mt-0.5">
            {formatDate(hoveredDay.date)}
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}