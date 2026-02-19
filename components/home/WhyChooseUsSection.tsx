/**
 * Why Choose Us Section
 * 
 * Shows core differentiators and comparison table with enhanced visual design.
 * Includes Demo Modal for landing page readiness demo.
 */

'use client';

import { useState, useRef, forwardRef, useImperativeHandle, useEffect, KeyboardEvent } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
  Check,
  Menu,
  Globe,
  Layers,
  Compass,
  Gem,
  Sparkle,
  Crown,
  Medal,
  Bot,
  Cpu,
  Network,
  Workflow,
  Gauge,
  Calculator,
  ShieldCheck
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

const LEVEL_COLORS: Record<SkillLevel, { bg: string; text: string; border: string; gradient: string }> = {
  none: { 
    bg: 'bg-gray-50', 
    text: 'text-gray-400', 
    border: 'border-gray-200',
    gradient: 'from-gray-50 to-gray-100'
  },
  beginner: { 
    bg: 'bg-blue-50', 
    text: 'text-blue-600', 
    border: 'border-blue-200',
    gradient: 'from-blue-50 to-blue-100'
  },
  intermediate: { 
    bg: 'bg-green-50', 
    text: 'text-green-600', 
    border: 'border-green-200',
    gradient: 'from-green-50 to-green-100'
  },
  advanced: { 
    bg: 'bg-purple-50', 
    text: 'text-purple-600', 
    border: 'border-purple-200',
    gradient: 'from-purple-50 to-purple-100'
  },
  expert: { 
    bg: 'bg-amber-50', 
    text: 'text-amber-600', 
    border: 'border-amber-200',
    gradient: 'from-amber-50 to-amber-100'
  },
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
  category?: string;
  popularity?: number;
}

interface Benchmark {
  skillId: string;
  skillName: string;
  requiredLevel: string;
  weight: number;
  required: boolean;
  category?: string;
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
  const [activeTab, setActiveTab] = useState<'search' | 'popular'>('search');

  // Benchmark state
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [isLoadingBenchmarks, setIsLoadingBenchmarks] = useState(false);
  const benchmarkCache = useRef<Record<string, Benchmark[]>>({});

  // Interactive Simulation State
  const [userLevels, setUserLevels] = useState<Record<string, SkillLevel>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Popular roles for quick selection
  const popularRoles: RoleOption[] = [
    { id: '1', name: 'Frontend Developer', category: 'Development', popularity: 95 },
    { id: '2', name: 'Backend Developer', category: 'Development', popularity: 92 },
    { id: '3', name: 'Full Stack Developer', category: 'Development', popularity: 98 },
    { id: '4', name: 'DevOps Engineer', category: 'Infrastructure', popularity: 88 },
    { id: '5', name: 'Data Scientist', category: 'Data', popularity: 90 },
    { id: '6', name: 'Product Manager', category: 'Product', popularity: 85 },
    { id: '7', name: 'UX Designer', category: 'Design', popularity: 87 },
    { id: '8', name: 'ML Engineer', category: 'AI/ML', popularity: 89 },
  ];

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Fetch roles
  useEffect(() => {
    const fetchRoles = async () => {
      if (!debouncedQuery.trim() || activeTab !== 'search') {
        if (activeTab === 'search') setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        // Simulated API call - replace with actual
        await new Promise(resolve => setTimeout(resolve, 500));
        const mockResults = popularRoles.filter(role => 
          role.name.toLowerCase().includes(debouncedQuery.toLowerCase())
        );
        setResults(mockResults);
        setIsOpen(true);
      } catch (error) {
        console.error('Failed to fetch roles:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoles();
  }, [debouncedQuery, activeTab, popularRoles]);

  // Fetch benchmarks when role is selected
  useEffect(() => {
    if (!selectedRole) {
      setBenchmarks([]);
      setUserLevels({});
      return;
    }

    if (benchmarkCache.current[selectedRole.id]) {
      setBenchmarks(benchmarkCache.current[selectedRole.id]);
      return;
    }

    const fetchBenchmarks = async () => {
      setIsLoadingBenchmarks(true);
      try {
        // Simulated API call - replace with actual
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockBenchmarks: Benchmark[] = [
          { 
            skillId: '1', 
            skillName: 'JavaScript/TypeScript', 
            requiredLevel: 'advanced', 
            weight: 25, 
            required: true,
            category: 'Core Languages'
          },
          { 
            skillId: '2', 
            skillName: 'React.js', 
            requiredLevel: 'advanced', 
            weight: 20, 
            required: true,
            category: 'Frontend Frameworks'
          },
          { 
            skillId: '3', 
            skillName: 'HTML/CSS', 
            requiredLevel: 'intermediate', 
            weight: 15, 
            required: true,
            category: 'Core Languages'
          },
          { 
            skillId: '4', 
            skillName: 'State Management', 
            requiredLevel: 'intermediate', 
            weight: 15, 
            required: false,
            category: 'Frontend Frameworks'
          },
          { 
            skillId: '5', 
            skillName: 'REST APIs', 
            requiredLevel: 'intermediate', 
            weight: 15, 
            required: true,
            category: 'Backend Concepts'
          },
          { 
            skillId: '6', 
            skillName: 'Version Control (Git)', 
            requiredLevel: 'intermediate', 
            weight: 10, 
            required: true,
            category: 'Development Tools'
          },
        ];
        
        setBenchmarks(mockBenchmarks);
        benchmarkCache.current[selectedRole.id] = mockBenchmarks;
        
        // Initialize expanded categories
        const categories = [...new Set(mockBenchmarks.map(b => b.category))];
        const expanded: Record<string, boolean> = {};
        categories.forEach(cat => { if (cat) expanded[cat] = true; });
        setExpandedCategories(expanded);
        
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

      const weightedScore = levelPoints * b.weight;

      totalWeight += b.weight;
      earnedWeight += weightedScore;

      if (b.required) {
        requiredTotal++;
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

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-green-500';
    if (score >= 60) return 'from-green-500 to-emerald-500';
    if (score >= 40) return 'from-yellow-500 to-orange-500';
    if (score >= 20) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-rose-500';
  };

  const handleLevelChange = (skillId: string, level: SkillLevel) => {
    setUserLevels((prev) => ({
      ...prev,
      [skillId]: level,
    }));
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Group benchmarks by category
  const groupedBenchmarks = benchmarks.reduce((acc, benchmark) => {
    const category = benchmark.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(benchmark);
    return acc;
  }, {} as Record<string, Benchmark[]>);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className="relative flex items-center justify-between p-6 border-b border-gray-100 shrink-0 bg-gradient-to-r from-gray-50 via-white to-gray-50">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          
          <div className="relative flex items-center gap-4">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-14 h-14 bg-gradient-to-br from-[#5693C1] via-[#3a7aa5] to-[#2c5a7a] rounded-2xl flex items-center justify-center shadow-lg shadow-[#5693C1]/30"
            >
              <Bot className="w-7 h-7 text-white" />
            </motion.div>
            <div>
              <motion.h3 
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-gray-900"
              >
                AI-Powered Readiness Analysis
              </motion.h3>
              <motion.p 
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-gray-500"
              >
                {selectedRole ? `Analyzing: ${selectedRole.name}` : 'Select a role to begin your personalized analysis'}
              </motion.p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors relative z-10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </motion.button>
        </div>

        {/* Demo Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {/* Role Selector with Tabs */}
          <div className="relative mb-8">
            <div className="flex gap-2 mb-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('search')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  activeTab === 'search'
                    ? 'bg-[#5693C1] text-white shadow-lg shadow-[#5693C1]/30'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Search className="w-4 h-4 inline mr-2" />
                Search Roles
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('popular')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  activeTab === 'popular'
                    ? 'bg-[#5693C1] text-white shadow-lg shadow-[#5693C1]/30'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Popular Roles
              </motion.button>
            </div>

            {activeTab === 'search' ? (
              <div className="relative">
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
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      ref={dropdownRef}
                      className="absolute mt-2 w-full bg-white shadow-xl rounded-xl py-2 border border-gray-200 overflow-auto z-10"
                      style={{ maxHeight: '280px' }}
                    >
                      {results.length > 0 ? (
                        results.map((role, index) => (
                          <motion.button
                            key={role.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`w-full text-left cursor-pointer select-none relative py-3 px-4 transition-colors ${
                              index === highlightedIndex
                                ? 'bg-[#5693C1]/10 text-[#5693C1]'
                                : 'text-gray-900 hover:bg-gray-50'
                            } ${selectedRole?.id === role.id ? 'bg-[#5693C1]/5' : ''}`}
                            onClick={() => handleSelect(role)}
                            onMouseEnter={() => setHighlightedIndex(index)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="block font-medium">{role.name}</span>
                                {role.category && (
                                  <span className="text-xs text-gray-400">{role.category}</span>
                                )}
                              </div>
                              {selectedRole?.id === role.id && (
                                <Check className="h-5 w-5 text-[#5693C1]" />
                              )}
                            </div>
                          </motion.button>
                        ))
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="py-8 px-4 text-center"
                        >
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
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {popularRoles.map((role, index) => (
                  <motion.button
                    key={role.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelect(role)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedRole?.id === role.id
                        ? 'border-[#5693C1] bg-[#5693C1]/5 shadow-lg'
                        : 'border-gray-200 hover:border-[#5693C1]/50 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${
                        role.popularity && role.popularity > 90 ? 'bg-green-500' : 'bg-blue-500'
                      }`} />
                      <span className="text-xs font-medium text-gray-500">{role.category}</span>
                    </div>
                    <p className="font-semibold text-gray-900">{role.name}</p>
                    {role.popularity && (
                      <div className="mt-2 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-gray-500">{role.popularity}% match rate</span>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Content Area */}
          <motion.div
            initial={false}
            animate={{ 
              opacity: selectedRole ? 1 : 0.5,
              y: selectedRole ? 0 : 20
            }}
            transition={{ duration: 0.5 }}
            className={`bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 ${
              selectedRole ? '' : 'pointer-events-none'
            }`}
          >
            {isLoadingBenchmarks ? (
              <div className="flex flex-col items-center justify-center py-16">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="relative"
                >
                  <Loader2 className="w-20 h-20 text-[#5693C1]" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <Cpu className="w-8 h-8 text-[#5693C1] opacity-50" />
                  </motion.div>
                </motion.div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-600 font-medium mt-4"
                >
                  Loading AI analysis...
                </motion.p>
                <p className="text-sm text-gray-400 mt-1">Fetching benchmarks for {selectedRole?.name}</p>
              </div>
            ) : selectedRole ? (
              <>
                {/* Enhanced Stats with Animations */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
                >
                  {[
                    {
                      label: 'Readiness Score',
                      value: simulation.score,
                      icon: Gauge,
                      suffix: '%',
                      gradient: getScoreGradient(simulation.score)
                    },
                    {
                      label: 'Skills Matched',
                      value: simulation.matched,
                      total: simulation.total,
                      icon: CheckCircle2,
                      suffix: '',
                      gradient: 'from-[#5693C1] to-[#2c5a7a]'
                    },
                    {
                      label: 'Requirements Met',
                      value: simulation.required,
                      total: simulation.requiredTotal,
                      icon: Shield,
                      suffix: '',
                      gradient: 'from-emerald-500 to-green-500'
                    }
                  ].map((stat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="bg-white rounded-xl p-5 shadow-lg border border-gray-100 relative overflow-hidden group"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                      
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {stat.label}
                        </span>
                        <motion.div
                          whileHover={{ rotate: 15 }}
                          className="p-2 bg-gray-50 rounded-lg"
                        >
                          <stat.icon className="w-4 h-4 text-gray-400" />
                        </motion.div>
                      </div>
                      
                      <div className="flex items-baseline gap-1">
                        <motion.span 
                          key={stat.value}
                          initial={{ scale: 1.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className={`text-3xl font-bold ${getScoreColor(stat.value)}`}
                        >
                          {stat.value}
                        </motion.span>
                        {stat.total && (
                          <span className="text-lg text-gray-400">/{stat.total}</span>
                        )}
                        {stat.suffix}
                      </div>

                      {stat.label === 'Readiness Score' && (
                        <div className="mt-3 relative">
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${stat.value}%` }}
                              transition={{ duration: 1, delay: 0.5 }}
                              className={`h-2 rounded-full bg-gradient-to-r ${stat.gradient}`}
                            />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>

                {/* Benchmarks List with Categories */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <motion.div
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.3 }}
                        className="p-2 bg-[#5693C1]/10 rounded-lg"
                      >
                        <Network className="w-4 h-4 text-[#5693C1]" />
                      </motion.div>
                      <h4 className="text-lg font-semibold text-gray-900">Role Requirements</h4>
                    </div>
                    <motion.span 
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full"
                    >
                      Interactive sliders - adjust your level
                    </motion.span>
                  </div>

                  {benchmarks.length > 0 ? (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {Object.entries(groupedBenchmarks).map(([category, categoryBenchmarks], categoryIdx) => (
                        <motion.div
                          key={category}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: categoryIdx * 0.1 }}
                          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                        >
                          <button
                            onClick={() => toggleCategory(category)}
                            className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Workflow className="w-4 h-4 text-[#5693C1]" />
                              <span className="font-semibold text-gray-900">{category}</span>
                              <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full text-gray-600">
                                {categoryBenchmarks.length}
                              </span>
                            </div>
                            <motion.div
                              animate={{ rotate: expandedCategories[category] ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            </motion.div>
                          </button>

                          <AnimatePresence>
                            {expandedCategories[category] && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="divide-y divide-gray-100"
                              >
                                {categoryBenchmarks.map((benchmark, idx) => {
                                  const userLevel = userLevels[benchmark.skillId] || 'none';
                                  const levelColor = LEVEL_COLORS[userLevel];
                                  const requiredLevelIndex = LEVEL_ORDER.indexOf(benchmark.requiredLevel as SkillLevel);
                                  const userLevelIndex = LEVEL_ORDER.indexOf(userLevel);
                                  const isRequirementMet = userLevelIndex >= requiredLevelIndex;

                                  return (
                                    <motion.div
                                      key={benchmark.skillId}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: idx * 0.05 }}
                                      className={`p-4 transition-all ${
                                        benchmark.required
                                          ? isRequirementMet
                                            ? 'bg-emerald-50/30'
                                            : 'bg-amber-50/30'
                                          : ''
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
                                            <span className="text-gray-500">
                                              Target: <span className="font-medium text-gray-700 capitalize">{benchmark.requiredLevel}</span>
                                            </span>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-gray-500">
                                              Weight: <span className="font-medium text-gray-700">{benchmark.weight} pts</span>
                                            </span>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                          <motion.select
                                            whileHover={{ scale: 1.02 }}
                                            value={userLevel}
                                            onChange={(e) => handleLevelChange(benchmark.skillId, e.target.value as SkillLevel)}
                                            className={`px-3 py-2 rounded-lg border-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:border-transparent cursor-pointer transition-all ${levelColor.bg} ${levelColor.text} ${levelColor.border}`}
                                          >
                                            {LEVEL_ORDER.map((level) => (
                                              <option key={level} value={level} className="capitalize">
                                                {level}
                                              </option>
                                            ))}
                                          </motion.select>

                                          {benchmark.required && (
                                            <motion.div
                                              initial={{ scale: 0 }}
                                              animate={{ scale: 1 }}
                                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                isRequirementMet ? 'bg-emerald-100' : 'bg-amber-100'
                                              }`}
                                            >
                                              {isRequirementMet ? (
                                                <Check className="w-4 h-4 text-emerald-600" />
                                              ) : (
                                                <AlertCircle className="w-4 h-4 text-amber-600" />
                                              )}
                                            </motion.div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Progress bar for skill level */}
                                      <div className="mt-3">
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                          <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${LEVEL_POINTS[userLevel] * 100}%` }}
                                            transition={{ duration: 0.3 }}
                                            className={`h-1.5 rounded-full bg-gradient-to-r ${levelColor.gradient}`}
                                          />
                                        </div>
                                      </div>
                                    </motion.div>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-12 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200"
                    >
                      <AlertCircle className="w-12 h-12 mb-3 text-gray-300" />
                      <p className="font-medium">No benchmarks configured</p>
                      <p className="text-sm text-gray-400 mt-1">This role doesn&apos;t have any requirements yet</p>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center text-center py-16"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-24 h-24 bg-gradient-to-br from-[#5693C1]/10 to-[#2c5a7a]/10 rounded-3xl flex items-center justify-center mb-6"
                >
                  <Bot className="w-12 h-12 text-[#5693C1]" />
                </motion.div>
                <h4 className="text-2xl font-bold text-gray-900 mb-3">Ready to Begin?</h4>
                <p className="text-gray-500 max-w-sm mb-6">
                  Select a role above to see real requirements and simulate your readiness with our AI-powered analysis
                </p>
                <div className="flex gap-2 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" /> 5-min setup
                  </span>
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3 h-3" /> AI-powered
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Free
                  </span>
                </div>
              </motion.div>
            )}

            {/* Enhanced CTA */}
            {selectedRole && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 flex flex-col sm:flex-row gap-3"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1"
                >
                  <Link
                    href="/signup"
                    className="group relative overflow-hidden bg-gradient-to-r from-[#5693C1] to-[#2c5a7a] text-white py-4 rounded-xl font-semibold hover:shadow-2xl hover:shadow-[#5693C1]/30 transition-all duration-300 text-center flex items-center justify-center gap-2 w-full"
                    onClick={onClose}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Get Full Analysis
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-white"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.5 }}
                      style={{ opacity: 0.2 }}
                    />
                  </Link>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-colors border-2 border-gray-200 hover:border-gray-300"
                >
                  Close
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>

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
        .bg-grid-pattern {
          background-image: linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>
    </motion.div>
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group relative"
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Animated glow effect */}
      <motion.div
        animate={isHovered ? { opacity: 0.2, scale: 1.1 } : { opacity: 0, scale: 1 }}
        className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl blur-xl transition-opacity duration-500`}
      />

      {/* Floating particles */}
      {isHovered && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -20 }}
            transition={{ duration: 0.5 }}
            className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-gradient-to-br from-white to-gray-50 shadow-lg flex items-center justify-center"
          >
            <Sparkle className="w-4 h-4 text-yellow-500" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full bg-gradient-to-br from-white to-gray-50 shadow-md flex items-center justify-center"
          >
            <Zap className="w-3 h-3 text-[#5693C1]" />
          </motion.div>
        </>
      )}

      {/* Card */}
      <motion.div
        animate={isHovered ? { y: -8 } : { y: 0 }}
        className={`relative bg-white rounded-2xl p-8 border border-gray-100 transition-all duration-500 ${
          isHovered
            ? 'shadow-2xl border-transparent'
            : 'shadow-lg hover:shadow-xl hover:-translate-y-1 hover:border-gray-200'
        }`}
      >
        {/* Icon with animated background */}
        <motion.div
          animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
          className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${color}15, ${color}05)`,
            color: color
          }}
        >
          <motion.div
            animate={isHovered ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 0.5 }}
          >
            {icon}
          </motion.div>
          
          {/* Shine effect */}
          <motion.div
            animate={isHovered ? { x: '100%' } : { x: '-100%' }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        </motion.div>

        {/* Content */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#5693C1] transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {text}
        </p>

        {/* Bottom accent with animation */}
        <motion.div
          animate={isHovered ? { height: 4, opacity: 1 } : { height: 2, opacity: 0.5 }}
          className="absolute bottom-0 left-0 right-0 rounded-b-2xl"
          style={{
            background: `linear-gradient(90deg, ${color}, ${color}dd)`,
          }}
        />
      </motion.div>
    </motion.div>
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

  // Define differences with enhanced icons
  const differences = [
    {
      icon: <Rocket className="w-7 h-7" />,
      title: "AI-Powered Readiness",
      text: "Our advanced AI analyzes your skills against industry standards, providing real-time readiness scores and personalized improvement paths.",
      color: '#5693C1',
      gradient: 'from-blue-500 to-[#5693C1]'
    },
    {
      icon: <Network className="w-7 h-7" />,
      title: "Smart Skill Mapping",
      text: "Visualize your skills in relation to your dream role with interactive skill graphs and competency heatmaps.",
      color: '#0EA5E9',
      gradient: 'from-cyan-500 to-sky-500'
    },
    {
      icon: <Workflow className="w-7 h-7" />,
      title: "Personalized Learning Paths",
      text: "Get a step-by-step roadmap with curated resources, projects, and milestones tailored to your goals.",
      color: '#10B981',
      gradient: 'from-emerald-500 to-teal-500'
    },
    {
      icon: <Crown className="w-7 h-7" />,
      title: "Industry Benchmarking",
      text: "Compare your profile against top performers in your field and see exactly where you stand.",
      color: '#F59E0B',
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      icon: <Medal className="w-7 h-7" />,
      title: "Verified Skill Badges",
      text: "Earn verifiable credentials that showcase your expertise to employers and recruiters.",
      color: '#8B5CF6',
      gradient: 'from-purple-500 to-violet-500'
    },
    {
      icon: <Bot className="w-7 h-7" />,
      title: "24/7 AI Mentor",
      text: "Get instant answers, practice interviews, and career advice from our AI mentor anytime.",
      color: '#EC4899',
      gradient: 'from-pink-500 to-rose-500'
    },
  ];

  // Enhanced comparison points
  const comparisonPoints = [
    {
      traditional: 'Apply to hundreds of jobs with no strategy',
      roleready: 'Apply strategically to roles you\'re ready for',
      traditionalIcon: XCircle,
      rolereadyIcon: CheckCircle,
      metric: '75% higher interview rate'
    },
    {
      traditional: 'Generic learning paths',
      roleready: 'AI-personalized skill development',
      traditionalIcon: XCircle,
      rolereadyIcon: CheckCircle,
      metric: '3x faster skill acquisition'
    },
    {
      traditional: 'No feedback on gaps',
      roleready: 'Real-time gap analysis and fixes',
      traditionalIcon: XCircle,
      rolereadyIcon: CheckCircle,
      metric: '90% gap reduction'
    },
    {
      traditional: 'Manual progress tracking',
      roleready: 'Automated progress dashboards',
      traditionalIcon: XCircle,
      rolereadyIcon: CheckCircle,
      metric: 'Save 10+ hours/month'
    },
  ];

  // Stats for social proof
const stats = [
  { 
    label: 'Explainable Scoring Model', 
    value: 'Weighted & Transparent', 
    icon: Calculator, 
    color: '#5693C1' 
  },
  { 
    label: 'Mentor Validation System', 
    value: 'Credibility Driven', 
    icon: ShieldCheck, 
    color: '#10B981' 
  },
  { 
    label: 'Role-Based Benchmarks', 
    value: 'Structured & Dynamic', 
    icon: Globe, 
    color: '#8B5CF6' 
  },
  { 
    label: 'Progress Tracking', 
    value: 'Snapshot History', 
    icon: TrendingUp, 
    color: '#F59E0B' 
  },
];

  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-32 px-4 sm:px-6 lg:px-8">
      {/* Enhanced background with animated gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-bl from-[#5693C1]/10 via-blue-200/10 to-transparent blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-20 -left-20 w-96 h-96 rounded-full bg-gradient-to-tr from-emerald-200/10 via-teal-200/10 to-transparent blur-3xl"
        />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        
        {/* Animated lines */}
        <svg className="absolute inset-0 w-full h-full">
          <motion.line
            x1="0"
            y1="0"
            x2="100%"
            y2="100%"
            stroke="url(#gradient)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.1 }}
            transition={{ duration: 3, delay: 1 }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5693C1" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#2c5a7a" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Floating elements */}
      <div className="absolute top-32 left-10">
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-[#5693C1]/30"
        />
      </div>
      <div className="absolute top-1/2 right-20">
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="w-3 h-3 rounded-full bg-emerald-400/30"
        />
      </div>
      <div className="absolute bottom-40 left-1/4">
        <motion.div
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-1 h-1 rounded-full bg-amber-400/30"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Hero CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          ref={ctaRef}
          className="max-w-6xl mx-auto mb-20 md:mb-32"
        >
          <div className="relative bg-white rounded-3xl p-8 md:p-12 border border-gray-200 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden group">
            {/* Animated background gradient */}
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 20, repeat: Infinity }}
              className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#5693C1]/10 to-[#2c5a7a]/10 rounded-full blur-3xl"
            />
            
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            <div className="relative grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#5693C1]/10 rounded-full text-sm font-medium mb-6 text-[#5693C1] border border-[#5693C1]/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Experience the Future of Career Growth</span>
                </motion.div>

                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
                >
                  Transform Your Career Journey with{' '}
                  <span className="bg-gradient-to-r from-[#5693C1] to-[#2c5a7a] bg-clip-text text-transparent relative">
                    AI-Powered Insights
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-6 -right-6 text-4xl"
                    >
                      ✨
                    </motion.span>
                  </span>
                </motion.h3>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 text-lg mb-8 max-w-xl leading-relaxed"
                >
                  Stop guessing your readiness. Our AI analyzes your profile against 500+ roles, providing personalized roadmaps and real-time feedback.
                </motion.p>

                {/* Feature pills */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap gap-3 mb-8"
                >
                  {[
                    { icon: Zap, text: '5-min setup' },
                    { icon: Cpu, text: 'AI-powered' },
                    { icon: Shield, text: 'Free analysis' },
                    { icon: TrendingUp, text: 'Real-time insights' },
                  ].map((feature, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full text-sm text-gray-600 border border-gray-200"
                    >
                      <feature.icon className="w-3.5 h-3.5 text-[#5693C1]" />
                      <span>{feature.text}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/signup"
                    className="group relative overflow-hidden w-full h-16 bg-gradient-to-r from-[#5693C1] to-[#2c5a7a] text-white rounded-xl font-semibold flex items-center justify-center gap-3 hover:shadow-2xl transition-all duration-300"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Start Free Analysis
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-white"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.5 }}
                      style={{ opacity: 0.2 }}
                    />
                  </Link>
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDemo(true)}
                  className="group relative overflow-hidden w-full h-16 bg-white text-[#5693C1] border-2 border-[#5693C1] rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-gradient-to-r hover:from-[#5693C1] hover:to-[#2c5a7a] hover:text-white transition-all duration-300"
                >
                  <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Try Interactive Demo</span>
                </motion.button>

                {/* Trust indicators */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-center gap-4 pt-4"
                >
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.1, y: -2 }}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-white"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-900">10,000+</span> professionals
                  </span>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#5693C1]/10 to-[#2c5a7a]/10 text-[#5693C1] text-xs font-semibold uppercase tracking-wider mb-6 border border-[#5693C1]/20 backdrop-blur-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {content.badge}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            {content.title.split(' ').map((word, i, arr) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                viewport={{ once: true }}
                className={i === arr.length - 1 ? "bg-gradient-to-r from-[#5693C1] to-[#2c5a7a] bg-clip-text text-transparent" : ""}
              >
                {word}{i < arr.length - 1 ? ' ' : ''}
              </motion.span>
            ))}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            {content.subtitle}
          </motion.p>
        </div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-lg relative overflow-hidden group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500`} style={{ background: `linear-gradient(135deg, ${stat.color}, transparent)` }} />
              <stat.icon className="w-8 h-8 mx-auto mb-3" style={{ color: stat.color }} />
              <motion.div
                initial={{ scale: 0.5 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="text-2xl font-bold text-gray-900"
              >
                {stat.value}
              </motion.div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

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

        {/* Enhanced Comparison Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-8 md:p-12 border border-gray-200 shadow-xl relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#5693C1]/5 to-transparent rounded-full blur-3xl" />
          
          <div className="text-center mb-10">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-3xl font-bold text-gray-900 mb-4"
            >
              RoleReady vs. Traditional Approach
            </motion.h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              See how our AI-powered platform outperforms traditional job preparation methods
            </p>
          </div>

          {/* Comparison Header with animations */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { icon: XCircle, label: 'Traditional Approach', color: 'red' },
              { icon: CheckCircle, label: 'RoleReady', color: 'green' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center p-4 rounded-xl border-2 relative overflow-hidden group"
                style={{ borderColor: `var(--${item.color}-200)` }}
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <item.icon className={`w-8 h-8 mx-auto mb-2 text-${item.color}-500`} />
                </motion.div>
                <span className={`font-semibold text-${item.color}-700`}>{item.label}</span>
                
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileInView={{ x: '100%' }}
                  transition={{ duration: 1, delay: 1 }}
                />
              </motion.div>
            ))}
          </div>

          {/* Comparison Rows */}
          <div className="space-y-3">
            {comparisonPoints.map((point, index) => {
              const TraditionalIcon = point.traditionalIcon;
              const RoleReadyIcon = point.rolereadyIcon;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative grid grid-cols-2 gap-4 p-4 rounded-xl bg-white border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  onMouseEnter={() => setActiveComparison(index)}
                  onMouseLeave={() => setActiveComparison(null)}
                >
                  {/* Glow effect */}
                  <AnimatePresence>
                    {activeComparison === index && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-r from-[#5693C1]/5 to-transparent rounded-xl"
                      />
                    )}
                  </AnimatePresence>

                  {/* Traditional */}
                  <div className="flex items-start gap-3">
                    <TraditionalIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-600">{point.traditional}</span>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={activeComparison === index ? { width: '100%' } : { width: 0 }}
                        className="h-0.5 bg-red-200 mt-1"
                      />
                    </div>
                  </div>

                  {/* RoleReady */}
                  <div className="flex items-start gap-3">
                    <RoleReadyIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-gray-900 font-medium">{point.roleready}</span>
                      {point.metric && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={activeComparison === index ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                          className="text-xs text-green-600 font-medium mt-1"
                        >
                          {point.metric}
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-10 text-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Link
                href="/dashboard"
                className="group relative overflow-hidden inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#5693C1] to-[#2c5a7a] text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300"
              >
                <span className="relative z-10">Experience the Difference</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                <motion.div
                  className="absolute inset-0 bg-white"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                  style={{ opacity: 0.2 }}
                />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Trust badges */}
        {/* <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-gray-400 mb-4">Trusted by leading companies</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
            {['Company 1', 'Company 2', 'Company 3', 'Company 4'].map((company, i) => (
              <motion.div
                key={i}
                whileHover={{ opacity: 1, scale: 1.1 }}
                className="text-gray-300 font-semibold text-lg"
              >
                {company}
              </motion.div>
            ))}
          </div>
        </motion.div> */}
      </div>

      {/* Demo Modal */}
      <AnimatePresence>
        {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}
      </AnimatePresence>

      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </section>
  );
});

WhyChooseUsSection.displayName = 'WhyChooseUsSection';

export default WhyChooseUsSection;