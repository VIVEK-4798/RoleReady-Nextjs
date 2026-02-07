/**
 * Dashboard Trends Tab
 * 
 * Shows readiness score trends with SVG-based chart and stats.
 * Faithful recreation from the old RoleReady React project.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

interface HistoryItem {
  id: string;
  percentage: number;
  createdAt: string;
  trigger: string;
}

interface TrendsTabProps {
  userId: string;
}

export default function TrendsTab({ userId }: TrendsTabProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${userId}/readiness/history?limit=30`);
      const data = await response.json();

      if (data.success && data.history) {
        setHistory([...data.history].reverse());
      } else {
        setError(data.error || 'Failed to load trends');
      }
    } catch (err) {
      console.error('Error fetching trends:', err);
      setError('Failed to load trends');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const stats = {
    average: history.length > 0 ? history.reduce((sum, h) => sum + h.percentage, 0) / history.length : 0,
    best: history.length > 0 ? Math.max(...history.map(h => h.percentage)) : 0,
    worst: history.length > 0 ? Math.min(...history.map(h => h.percentage)) : 0,
    latest: history.length > 0 ? history[history.length - 1].percentage : 0,
    trend: history.length >= 2 ? history[history.length - 1].percentage - history[0].percentage : 0,
  };

  const chartWidth = 800;
  const chartHeight = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const generatePath = () => {
    if (history.length < 2) return '';
    
    const xStep = innerWidth / (history.length - 1);
    
    const points = history.map((item, index) => {
      const x = padding.left + index * xStep;
      const y = padding.top + innerHeight - (item.percentage / 100) * innerHeight;
      return { x, y };
    });

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpX = (prev.x + curr.x) / 2;
      path += ` Q ${prev.x + (curr.x - prev.x) / 4} ${prev.y}, ${cpX} ${(prev.y + curr.y) / 2}`;
      path += ` Q ${curr.x - (curr.x - prev.x) / 4} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    
    return path;
  };

  const generateAreaPath = () => {
    if (history.length < 2) return '';
    
    const linePath = generatePath();
    const xStep = innerWidth / (history.length - 1);
    const lastX = padding.left + (history.length - 1) * xStep;
    const bottomY = padding.top + innerHeight;
    
    return `${linePath} L ${lastX} ${bottomY} L ${padding.left} ${bottomY} Z`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-80 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchHistory}
            className="mt-4 px-4 py-2 text-white rounded-lg transition-colors"
            style={{ backgroundColor: '#5693C1' }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Trends Yet</h3>
          <p className="text-gray-600 max-w-sm mx-auto">
            Your readiness score trends will appear here after you have multiple readiness calculations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Average Score"
          value={`${Math.round(stats.average)}%`}
          icon="chart"
          color="blue"
        />
        <StatCard
          title="Best Score"
          value={`${Math.round(stats.best)}%`}
          icon="up"
          color="green"
        />
        <StatCard
          title="Worst Score"
          value={`${Math.round(stats.worst)}%`}
          icon="down"
          color="red"
        />
        <StatCard
          title="Overall Trend"
          value={`${stats.trend >= 0 ? '+' : ''}${stats.trend.toFixed(1)}%`}
          icon={stats.trend >= 0 ? 'trending-up' : 'trending-down'}
          color={stats.trend >= 0 ? 'green' : 'red'}
        />
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Score Trend</h2>
        
        {history.length >= 2 ? (
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto min-w-[300px] sm:min-w-[600px]">
              {[0, 25, 50, 75, 100].map((value) => {
                const y = padding.top + innerHeight - (value / 100) * innerHeight;
                return (
                  <g key={value}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + innerWidth}
                      y2={y}
                      stroke="currentColor"
                      strokeOpacity={0.1}
                      className="text-gray-400"
                    />
                    <text
                      x={padding.left - 10}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="12"
                      className="fill-gray-500"
                    >
                      {value}%
                    </text>
                  </g>
                );
              })}

              <line
                x1={padding.left}
                y1={padding.top + innerHeight - (70 / 100) * innerHeight}
                x2={padding.left + innerWidth}
                y2={padding.top + innerHeight - (70 / 100) * innerHeight}
                stroke="#22c55e"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity={0.5}
              />
              <line
                x1={padding.left}
                y1={padding.top + innerHeight - (40 / 100) * innerHeight}
                x2={padding.left + innerWidth}
                y2={padding.top + innerHeight - (40 / 100) * innerHeight}
                stroke="#eab308"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity={0.5}
              />

              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#5693C1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#5693C1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <path
                d={generateAreaPath()}
                fill="url(#areaGradient)"
              />

              <path
                d={generatePath()}
                fill="none"
                stroke="#5693C1"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {history.map((item, index) => {
                const xStep = innerWidth / (history.length - 1);
                const x = padding.left + index * xStep;
                const y = padding.top + innerHeight - (item.percentage / 100) * innerHeight;
                
                return (
                  <g key={item.id}>
                    <circle
                      cx={x}
                      cy={y}
                      r="6"
                      fill="white"
                      stroke="#5693C1"
                      strokeWidth="2"
                      className="drop-shadow-sm"
                    />
                  </g>
                );
              })}

              {[0, Math.floor(history.length / 2), history.length - 1].map((index) => {
                if (!history[index]) return null;
                const xStep = innerWidth / (history.length - 1);
                const x = padding.left + index * xStep;
                const date = new Date(history[index].createdAt);
                const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                
                return (
                  <text
                    key={index}
                    x={x}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    fontSize="12"
                    className="fill-gray-500"
                  >
                    {label}
                  </text>
                );
              })}
            </svg>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>Need at least 2 data points to show trends.</p>
            <p className="text-sm mt-1">Calculate your readiness score more times to see the trend chart.</p>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-green-500" style={{ borderStyle: 'dashed' }} />
            <span className="text-gray-600">Ready (70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-yellow-500" style={{ borderStyle: 'dashed' }} />
            <span className="text-gray-600">Partial (40%)</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Changes</h3>
        <div className="space-y-3">
          {[...history].reverse().slice(0, 5).map((item, index, arr) => {
            const prevItem = arr[index + 1];
            const change = prevItem ? item.percentage - prevItem.percentage : null;
            
            return (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100 last:border-0 gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${item.percentage >= 70 ? 'bg-green-500' : item.percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{Math.round(item.percentage)}%</p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                {change !== null && (
                  <span className={`text-sm font-medium ${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'} sm:self-center`}>
                    {change > 0 ? '↑' : change < 0 ? '↓' : '—'} {change !== 0 ? `${Math.abs(change).toFixed(1)}%` : ''}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: 'blue' | 'green' | 'red' | 'yellow';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  };

  const iconColor = {
    blue: '#5693C1',
    green: '#22c55e',
    red: '#ef4444',
    yellow: '#eab308',
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {icon === 'chart' && (
            <svg className="w-6 h-6" fill="none" stroke={iconColor[color]} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )}
          {icon === 'up' && (
            <svg className="w-6 h-6" fill="none" stroke={iconColor[color]} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          )}
          {icon === 'down' && (
            <svg className="w-6 h-6" fill="none" stroke={iconColor[color]} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          )}
          {icon === 'trending-up' && (
            <svg className="w-6 h-6" fill="none" stroke={iconColor[color]} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          )}
          {icon === 'trending-down' && (
            <svg className="w-6 h-6" fill="none" stroke={iconColor[color]} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}