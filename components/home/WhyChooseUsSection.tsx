/**
 * Why Choose Us Section
 * 
 * Shows core differentiators and comparison table with enhanced visual design.
 * Includes Demo Modal for landing page readiness demo.
 */

'use client';

import { useState, useRef, forwardRef, useImperativeHandle, useEffect, KeyboardEvent } from 'react';
import Link from 'next/link';
import { useAuth, useDebounce } from '@/hooks';
import { SkillLevel } from '@/types';
import {
  Target,
  Shield,
  Sparkles,
  BarChart3,
  Map,
  Users,
  CheckCircle,
  XCircle,
  ArrowRight,
  Zap,
  TrendingUp,
  Award,
  Clock,
  Heart,
  Brain,
  Star,
  Eye,
  PlayCircle,
  Rocket,
  Lightbulb,
  GraduationCap,
  FileCheck,
  UserCheck,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  X,
  Play,
  Search,
  Loader2,
  ChevronDown,
  Check
} from 'lucide-react';

// ============================================================================
// Constants & Types
// ============================================================================

const LEVEL_POINTS: Record<SkillLevel, number> = {
  none: 0,
  beginner: 0.25,
  intermediate: 0.5,
  advanced: 0.75,
  expert: 1.0,
};

const LEVEL_ORDER: SkillLevel[] = ['none', 'beginner', 'intermediate', 'advanced', 'expert'];

const LEVEL_COLORS: Record<SkillLevel, { bg: string; text: string; border: string }> = {
  none: { bg: 'bg-gray-50', text: 'text-gray-400', border: 'border-gray-200' },
  beginner: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  intermediate: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' },
  advanced: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  expert: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
};

export interface WhyChooseUsSectionRef {
  scrollToCTA: () => void;
  scrollToCTAAndOpenDemo: () => void;
}

interface WhyChooseUsSectionProps {
  content: {
    badge: string;
    title: string;
    subtitle: string;
    differences: {
      title: string;
      text: string;
    }[];
  };
}

interface RoleOption {
  id: string;
  name: string;
}

interface Benchmark {
  skillId: string;
  skillName: string;
  requiredLevel: string;
  weight: number;
  required: boolean;
}

// ============================================================================
// Demo Modal Component
// ============================================================================

interface DemoModalProps {
  onClose: () => void;
}

const DemoModal = ({ onClose }: DemoModalProps) => {
  // Search state
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<RoleOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Benchmark state
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [isLoadingBenchmarks, setIsLoadingBenchmarks] = useState(false);
  const benchmarkCache = useRef<Record<string, Benchmark[]>>({});

  // Interactive Simulation State
  const [userLevels, setUserLevels] = useState<Record<string, SkillLevel>>({});

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Fetch roles
  useEffect(() => {
    const fetchRoles = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/roles/search?q=${encodeURIComponent(debouncedQuery)}`);
        const result = await response.json();

        if (result.success) {
          setResults(result.data);
          setIsOpen(true);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error('Failed to fetch roles:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, [debouncedQuery]);

  // Fetch benchmarks when role is selected
  useEffect(() => {
    if (!selectedRole) {
      setBenchmarks([]);
      setUserLevels({});
      return;
    }

    // Check cache first
    if (benchmarkCache.current[selectedRole.id]) {
      setBenchmarks(benchmarkCache.current[selectedRole.id]);
      return;
    }

    const fetchBenchmarks = async () => {
      setIsLoadingBenchmarks(true);
      try {
        const response = await fetch(`/api/roles/${selectedRole.id}/benchmarks`);
        const result = await response.json();
        if (result.success) {
          setBenchmarks(result.data.benchmarks);
          // Cache the result
          benchmarkCache.current[selectedRole.id] = result.data.benchmarks;
        }
      } catch (error) {
        console.error('Failed to fetch benchmarks:', error);
      } finally {
        setIsLoadingBenchmarks(false);
      }
    };

    fetchBenchmarks();
  }, [selectedRole]);

  // Reset user levels when benchmarks change
  useEffect(() => {
    if (benchmarks.length > 0) {
      const initialLevels: Record<string, SkillLevel> = {};
      benchmarks.forEach(b => {
        initialLevels[b.skillId] = 'none';
      });
      setUserLevels(initialLevels);
    }
  }, [benchmarks]);

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && results[highlightedIndex]) {
          handleSelect(results[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (role: RoleOption) => {
    setSelectedRole(role);
    setQuery(role.name);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        inputRef.current &&
        !inputRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate simulated stats based on user input
  const simulation = benchmarks.length > 0 ? (() => {
    let totalWeight = 0;
    let earnedWeight = 0;
    let requiredMet = 0;
    let requiredTotal = 0;

    benchmarks.forEach((b) => {
      const userLevel = userLevels[b.skillId] || 'none';
      const levelPoints = LEVEL_POINTS[userLevel];

      // Calculate weighted score
      const weightedScore = levelPoints * b.weight;

      totalWeight += b.weight;
      earnedWeight += weightedScore;

      if (b.required) {
        requiredTotal++;
        // Check if requirement is met (user level >= required level)
        const userLevelIndex = LEVEL_ORDER.indexOf(userLevel);
        const requiredLevelIndex = LEVEL_ORDER.indexOf(b.requiredLevel as SkillLevel);

        if (userLevelIndex >= requiredLevelIndex) {
          requiredMet++;
        }
      }
    });

    return {
      score: totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0,
      matched: benchmarks.filter(b => userLevels[b.skillId] && userLevels[b.skillId] !== 'none').length,
      total: benchmarks.length,
      required: requiredMet,
      requiredTotal
    };
  })() : { score: 0, matched: 0, total: 0, required: 0, requiredTotal: 0 };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-green-600';
    if (score >= 40) return 'text-yellow-600';
    if (score >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-50';
    if (score >= 60) return 'bg-green-50';
    if (score >= 40) return 'bg-yellow-50';
    if (score >= 20) return 'bg-orange-50';
    return 'bg-red-50';
  };

  const handleLevelChange = (skillId: string, level: SkillLevel) => {
    setUserLevels((prev) => ({
      ...prev,
      [skillId]: level,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#5693C1] to-[#2c5a7a] rounded-xl flex items-center justify-center shadow-lg shadow-[#5693C1]/20">
              <Play className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Interactive Readiness Demo</h3>
              <p className="text-sm text-gray-500">
                {selectedRole ? `Analyzing: ${selectedRole.name}` : 'Select a role to begin analysis'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Demo Content */}
        <div className="p-6 overflow-y-auto">
          {/* Role Selector */}
          <div className="relative mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search for your target role
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                ref={inputRef}
                type="text"
                className="block w-full pl-11 pr-12 py-4 border-2 border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent transition-all"
                placeholder="e.g., Frontend Developer, Product Manager..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsOpen(true);
                  if (!e.target.value) setSelectedRole(null);
                }}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 text-[#5693C1] animate-spin" />
                ) : (
                  <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                )}
              </div>
            </div>

            {/* Dropdown Results */}
            {isOpen && (
              <div
                ref={dropdownRef}
                className="absolute mt-2 w-full bg-white shadow-xl rounded-xl py-2 border border-gray-200 overflow-auto focus:outline-none z-10 animate-in fade-in slide-in-from-top-2 duration-200"
                style={{ maxHeight: '280px' }}
              >
                {results.length > 0 ? (
                  results.map((role, index) => (
                    <button
                      key={role.id}
                      className={`w-full text-left cursor-pointer select-none relative py-3 px-4 transition-colors ${index === highlightedIndex
                          ? 'bg-[#5693C1]/10 text-[#5693C1]'
                          : 'text-gray-900 hover:bg-gray-50'
                        } ${selectedRole?.id === role.id ? 'bg-[#5693C1]/5' : ''}`}
                      onClick={() => handleSelect(role)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`block truncate ${selectedRole?.id === role.id ? 'font-medium' : 'font-normal'}`}>
                          {role.name}
                        </span>
                        {selectedRole?.id === role.id && (
                          <Check className="h-5 w-5 text-[#5693C1]" />
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="py-8 px-4 text-center">
                    {query ? (
                      <>
                        <AlertCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">No roles found for &quot;{query}&quot;</p>
                        <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                      </>
                    ) : (
                      <>
                        <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">Start typing to search roles</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dynamic Content Area */}
          <div className={`bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 transition-all duration-500 ${selectedRole ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4'}`}>
            {isLoadingBenchmarks ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <Loader2 className="w-16 h-16 text-[#5693C1] animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Target className="w-6 h-6 text-[#5693C1] opacity-50" />
                  </div>
                </div>
                <p className="text-gray-600 font-medium mt-4">Loading requirements...</p>
                <p className="text-sm text-gray-400 mt-1">Fetching benchmarks for {selectedRole?.name}</p>
              </div>
            ) : selectedRole ? (
              <>
                {/* Simulated Stats Header */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Readiness Score</span>
                      <Zap className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className={`text-3xl font-bold ${getScoreColor(simulation.score)}`}>
                      {simulation.score}%
                    </div>
                    <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${simulation.score >= 80 ? 'bg-emerald-500' :
                            simulation.score >= 60 ? 'bg-green-500' :
                              simulation.score >= 40 ? 'bg-yellow-500' :
                                simulation.score >= 20 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                        style={{ width: `${simulation.score}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Skills Matched</span>
                      <CheckCircle2 className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="text-3xl font-bold text-[#5693C1]">
                      {simulation.matched}/{simulation.total}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {Math.round((simulation.matched / simulation.total) * 100)}% of skills identified
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Requirements Met</span>
                      <Shield className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="text-3xl font-bold text-emerald-600">
                      {simulation.required}/{simulation.requiredTotal}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {simulation.requiredTotal > 0 ? Math.round((simulation.required / simulation.requiredTotal) * 100) : 0}% of required skills
                    </p>
                  </div>
                </div>

                {/* Benchmarks List */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-[#5693C1]/10 rounded-lg">
                        <Target className="w-4 h-4 text-[#5693C1]" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">Role Requirements</h4>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                      Adjust sliders to simulate your level
                    </span>
                  </div>

                  {benchmarks.length > 0 ? (
                    <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                      {benchmarks.map((benchmark) => {
                        const userLevel = userLevels[benchmark.skillId] || 'none';
                        const levelColor = LEVEL_COLORS[userLevel];
                        const requiredLevelIndex = LEVEL_ORDER.indexOf(benchmark.requiredLevel as SkillLevel);
                        const userLevelIndex = LEVEL_ORDER.indexOf(userLevel);
                        const isRequirementMet = userLevelIndex >= requiredLevelIndex;

                        return (
                          <div
                            key={benchmark.skillId}
                            className={`bg-white rounded-xl p-4 border-2 transition-all ${benchmark.required
                                ? isRequirementMet
                                  ? 'border-emerald-200 hover:border-emerald-300'
                                  : 'border-amber-200 hover:border-amber-300'
                                : 'border-gray-100 hover:border-gray-200'
                              }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="font-semibold text-gray-900">{benchmark.skillName}</h5>
                                  {benchmark.required && (
                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                                      Required
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                  <span className="text-gray-500">Target: <span className="font-medium text-gray-700 capitalize">{benchmark.requiredLevel}</span></span>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-gray-500">Weight: <span className="font-medium text-gray-700">{benchmark.weight} pts</span></span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <select
                                  value={userLevel}
                                  onChange={(e) => handleLevelChange(benchmark.skillId, e.target.value as SkillLevel)}
                                  className={`px-3 py-2 rounded-lg border-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent cursor-pointer transition-all ${levelColor.bg} ${levelColor.text} ${levelColor.border}`}
                                >
                                  {LEVEL_ORDER.map((level) => (
                                    <option key={level} value={level} className="capitalize">
                                      {level}
                                    </option>
                                  ))}
                                </select>

                                {benchmark.required && (
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isRequirementMet ? 'bg-emerald-100' : 'bg-amber-100'
                                    }`}>
                                    {isRequirementMet ? (
                                      <Check className="w-4 h-4 text-emerald-600" />
                                    ) : (
                                      <AlertCircle className="w-4 h-4 text-amber-600" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      <AlertCircle className="w-12 h-12 mb-3 text-gray-300" />
                      <p className="font-medium">No benchmarks configured</p>
                      <p className="text-sm text-gray-400 mt-1">This role doesn&apos;t have any requirements yet</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-16">
                <div className="w-20 h-20 bg-[#5693C1]/10 rounded-2xl flex items-center justify-center mb-4">
                  <Target className="w-10 h-10 text-[#5693C1]" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Select a Role to Begin</h4>
                <p className="text-gray-500 max-w-sm">
                  Search for your target role above to see real requirements and simulate your readiness
                </p>
              </div>
            )}

            {/* CTA */}
            {selectedRole && (
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/signup"
                  className="flex-1 bg-gradient-to-r from-[#5693C1] to-[#2c5a7a] text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#5693C1]/30 transition-all duration-300 text-center flex items-center justify-center gap-2 group"
                  onClick={onClose}
                >
                  Analyze My Full Profile
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={onClose}
                  className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-colors border-2 border-gray-200 hover:border-gray-300"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// Difference Card Component
// ============================================================================

interface DifferenceCardProps {
  icon: React.ReactNode;
  title: string;
  text: string;
  color: string;
  gradient: string;
  index: number;
  isHovered: boolean;
  onHover: (index: number | null) => void;
}

const DifferenceCard = ({ icon, title, text, color, gradient, index, isHovered, onHover }: DifferenceCardProps) => {
  return (
    <div
      className="group relative"
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Glow effect */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`} />

      {/* Card */}
      <div className={`relative bg-white rounded-2xl p-8 border border-gray-100 transition-all duration-500 ${isHovered
          ? 'shadow-2xl -translate-y-2 border-transparent'
          : 'shadow-lg hover:shadow-xl hover:-translate-y-1 hover:border-gray-200'
        }`}>
        {/* Icon */}
        <div
          className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 transition-all duration-500 ${isHovered ? 'scale-110 rotate-3' : ''
            }`}
          style={{
            background: `linear-gradient(135deg, ${color}15, ${color}05)`,
            color: color
          }}
        >
          <div className="transform transition-transform duration-500 group-hover:scale-110">
            {icon}
          </div>
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#5693C1] transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {text}
        </p>

        {/* Bottom accent */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl transition-all duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          style={{
            background: `linear-gradient(90deg, ${color}, ${color}dd)`,
          }}
        />
      </div>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

const WhyChooseUsSection = forwardRef<WhyChooseUsSectionRef, WhyChooseUsSectionProps>(({ content }, ref) => {
  const ctaRef = useRef<HTMLDivElement>(null);
  const [showDemo, setShowDemo] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [activeComparison, setActiveComparison] = useState<number | null>(null);
  const { user } = useAuth();

  useImperativeHandle(ref, () => ({
    scrollToCTA() {
      ctaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
    scrollToCTAAndOpenDemo() {
      ctaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        setShowDemo(true);
      }, 400);
    },
  }));

  // Define differences with proper icons
  const differences = [
    {
      icon: <Target className="w-7 h-7" />,
      title: "Not a Job Portal",
      text: "We don't just list jobs. We prepare you to actually get them by focusing on readiness first.",
      color: '#5693C1',
      gradient: 'from-blue-500 to-[#5693C1]'
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: "Focuses on Readiness, Not Applications",
      text: "We help you understand when you're ready to apply, not just where to apply.",
      color: '#0EA5E9',
      gradient: 'from-cyan-500 to-sky-500'
    },
    {
      icon: <Sparkles className="w-7 h-7" />,
      title: "Clear Explanations, Not Just Scores",
      text: "Every score comes with detailed reasoning so you know exactly what to improve.",
      color: '#10B981',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      icon: <Map className="w-7 h-7" />,
      title: "Structured Guidance, Not Guesswork",
      text: "Follow a personalized roadmap instead of random preparation strategies.",
      color: '#F59E0B',
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      icon: <Users className="w-7 h-7" />,
      title: "Mentor-Backed Validation",
      text: "Get your skills verified by industry professionals for credibility.",
      color: '#8B5CF6',
      gradient: 'from-purple-500 to-violet-500'
    },
  ];

  // Comparison points
  const comparisonPoints = [
    {
      traditional: 'Apply everywhere, hope something sticks',
      roleready: "Apply selectively, knowing you're ready",
      traditionalIcon: XCircle,
      rolereadyIcon: CheckCircle
    },
    {
      traditional: 'Generic preparation advice',
      roleready: 'Personalized, role-specific guidance',
      traditionalIcon: XCircle,
      rolereadyIcon: CheckCircle
    },
    {
      traditional: 'No feedback on rejections',
      roleready: 'Detailed gap analysis before applying',
      traditionalIcon: XCircle,
      rolereadyIcon: CheckCircle
    },
    {
      traditional: 'Unstructured learning',
      roleready: 'Step-by-step improvement roadmap',
      traditionalIcon: XCircle,
      rolereadyIcon: CheckCircle
    },
  ];

  return (
    <section className="relative overflow-hidden bg-white bg-gradient-to-b from-white via-blue-50/20 to-white py-20 md:py-32 px-4 sm:px-6 lg:px-8">
      {/* Background decorative elements - light theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#5693C1]/5 to-transparent" />
        <div className="absolute top-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-bl from-blue-100/40 to-cyan-100/30 blur-3xl" />
        <div className="absolute bottom-20 -left-20 w-96 h-96 rounded-full bg-gradient-to-tr from-emerald-100/30 to-teal-100/20 blur-3xl" />
      </div>

      {/* Animated floating elements - light theme */}
      <div className="absolute top-32 left-10 w-4 h-4 rounded-full bg-[#5693C1]/30 animate-float" />
      <div className="absolute top-1/2 right-20 w-6 h-6 rounded-full bg-[#5693C1]/20 animate-float-delayed" />
      <div className="absolute bottom-40 left-1/4 w-3 h-3 rounded-full bg-amber-400/30 animate-float-slow" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* CTA Section - Moved to top */}
        <div ref={ctaRef} className="max-w-6xl mx-auto mb-20 md:mb-32">
          <div className="relative bg-white rounded-3xl p-8 md:p-12 border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-500">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#5693C1]/5 to-transparent rounded-full blur-3xl" />

            <div className="relative grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#5693C1]/10 rounded-full text-sm font-medium mb-6 text-[#5693C1] border border-[#5693C1]/20">
                  <Sparkles className="w-4 h-4" />
                  Experience the Difference
                </div>
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  See How RoleReady Transforms{' '}
                  <span className="bg-gradient-to-r from-[#5693C1] to-[#2c5a7a] bg-clip-text text-transparent">
                    Your Journey
                  </span>
                </h3>
                <p className="text-gray-600 text-lg mb-8 max-w-xl leading-relaxed">
                  Don&apos;t just guess your readiness. See exactly how our AI analyzes your profile against industry standards.
                </p>

                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-[#5693C1]" />
                    <span>5-minute setup</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Zap className="w-4 h-4 text-[#5693C1]" />
                    <span>Instant insights</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4 text-[#5693C1]" />
                    <span>No credit card needed</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Link
                  href="/signup"
                  className="group w-full h-16 bg-gradient-to-r from-[#5693C1] to-[#2c5a7a] text-white rounded-xl font-semibold flex items-center justify-center gap-3 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 active:scale-[0.98]"
                >
                  Start Free Analysis
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <button
                  onClick={() => setShowDemo(true)}
                  className="group w-full h-16 bg-white text-[#5693C1] border-2 border-[#5693C1] rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-gradient-to-r hover:from-[#5693C1] hover:to-[#2c5a7a] hover:text-white transition-all duration-300"
                >
                  <PlayCircle className="w-5 h-5" />
                  Explore Readiness Demo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#5693C1]/10 to-[#2c5a7a]/10 text-[#5693C1] text-xs font-semibold uppercase tracking-wider mb-6 border border-[#5693C1]/20 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            {content.badge}
            <Zap className="w-3.5 h-3.5" />
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {content.title.split(' ').map((word, i, arr) =>
              i === arr.length - 1 ? (
                <span key={i} className="bg-gradient-to-r from-[#5693C1] to-[#2c5a7a] bg-clip-text text-transparent">
                  {word}
                </span>
              ) : (
                <span key={i}>{word} </span>
              )
            )}
          </h2>

          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {content.subtitle}
          </p>
        </div>

        {/* Differences Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {differences.map((diff, index) => (
            <DifferenceCard
              key={index}
              icon={diff.icon}
              title={diff.title}
              text={diff.text}
              color={diff.color}
              gradient={diff.gradient}
              index={index}
              isHovered={hoveredCard === index}
              onHover={setHoveredCard}
            />
          ))}
        </div>

        {/* Comparison Section */}
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-200 shadow-xl">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              RoleReady vs. Traditional Approach
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See how we&apos;re different from traditional job preparation platforms
            </p>
          </div>

          {/* Comparison Header */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-red-50/50 rounded-xl border border-red-200">
              <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <span className="font-semibold text-red-700">Traditional Approach</span>
            </div>
            <div className="text-center p-4 bg-green-50/50 rounded-xl border border-green-200">
              <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <span className="font-semibold text-green-700">RoleReady</span>
            </div>
          </div>

          {/* Comparison Rows */}
          <div className="space-y-3">
            {comparisonPoints.map((point, index) => {
              const TraditionalIcon = point.traditionalIcon;
              const RoleReadyIcon = point.rolereadyIcon;

              return (
                <div
                  key={index}
                  className="group relative grid grid-cols-2 gap-4 p-4 rounded-xl bg-white border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  onMouseEnter={() => setActiveComparison(index)}
                  onMouseLeave={() => setActiveComparison(null)}
                >
                  {/* Glow effect */}
                  {activeComparison === index && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#5693C1]/5 to-transparent rounded-xl" />
                  )}

                  {/* Traditional */}
                  <div className="flex items-start gap-3">
                    <TraditionalIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{point.traditional}</span>
                  </div>

                  {/* RoleReady */}
                  <div className="flex items-start gap-3">
                    <RoleReadyIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-900 font-medium">{point.roleready}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="mt-10 text-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#5693C1] to-[#2c5a7a] text-white rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 group"
            >
              Experience the Difference
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-sm text-gray-500 mt-4">
              Join thousands of professionals who&apos;ve found their path with RoleReady
            </p>
          </div>
        </div>
      </div>

      {/* Demo Modal */}
      {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
          animation-delay: 1s;
        }
        .animate-float-slow {
          animation: float-slow 5s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
});

WhyChooseUsSection.displayName = 'WhyChooseUsSection';

export default WhyChooseUsSection;