/**
 * Counter Section Component
 * 
 * Displays problem cards and animated statistics with enhanced visual design.
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Target,
  XCircle,
  AlertCircle,
  BarChart,
  Users,
  MessageSquare,
  Zap,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Brain,
  Frown,
  Eye,
  Search,
  Compass,
  Shield,
  Rocket,
  Flame,
  Lightbulb,
  Award,
  ChevronRight,
  Gauge,
  AlertTriangle,
  PieChart,
  Activity,
  Heart,
  X,
  CheckCircle2
} from 'lucide-react';

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  suffix?: string;
  inView: boolean;
}

function AnimatedCounter({ target, duration = 2000, suffix = '', inView }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!inView || hasAnimated) return;

    setHasAnimated(true);
    let startTime: number;
    const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);

      if (progress < 1) {
        setCount(Math.floor(eased * target));
        requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration, inView, hasAnimated]);

  return <motion.span
    className="counter-value"
    animate={{ scale: [1, 1.1, 1] }}
    transition={{ duration: 0.3, delay: 0.5 }}
  >
    {count}{suffix}
  </motion.span>;
}

const problems = [
  {
    icon: <Eye className="w-8 h-8" />,
    title: 'Blind Applications',
    description: "Students apply without knowing if they're truly ready, wasting time and opportunities.",
    color: '#4F46E5',
    gradient: 'from-indigo-500 to-purple-600',
    bgColor: '#EEF2FF',
    pattern: 'dots',
    stat: '78% apply blindly'
  },
  {
    icon: <MessageSquare className="w-8 h-8" />,
    title: 'Silent Rejections',
    description: 'Rejections come without meaningful feedback, leaving students confused about what to improve.',
    color: '#0EA5E9',
    gradient: 'from-sky-500 to-cyan-500',
    bgColor: '#F0F9FF',
    pattern: 'lines',
    stat: '9/10 get no feedback'
  },
  {
    icon: <AlertTriangle className="w-8 h-8" />,
    title: 'Hidden Skill Gaps',
    description: 'Critical skill gaps remain invisible until it\'s too late to address them.',
    color: '#10B981',
    gradient: 'from-emerald-500 to-teal-500',
    bgColor: '#F0FDF4',
    pattern: 'grid',
    stat: '70% unaware of gaps'
  },
  {
    icon: <Compass className="w-8 h-8" />,
    title: 'Unstructured Efforts',
    description: 'Preparation becomes random and inefficient without a clear roadmap to follow.',
    color: '#F59E0B',
    gradient: 'from-amber-500 to-orange-500',
    bgColor: '#FFFBEB',
    pattern: 'waves',
    stat: '82% lack structure'
  },
];

const stats = [
  {
    value: 85,
    label: 'Students apply blindly',
    suffix: '%',
    color: '#4F46E5',
    icon: <Users className="w-6 h-6" />,
    description: 'apply without proper assessment',
    impact: '3x lower success rate',
    gradient: 'from-indigo-500 to-purple-500'
  },
  {
    value: 9,
    label: 'Get no feedback on rejections',
    suffix: '/10',
    color: '#0EA5E9',
    icon: <MessageSquare className="w-6 h-6" />,
    description: 'receive zero actionable feedback',
    impact: '6 months delayed growth',
    gradient: 'from-sky-500 to-cyan-500'
  },
  {
    value: 70,
    label: "Don't know their skill gaps",
    suffix: '%',
    color: '#10B981',
    icon: <Zap className="w-6 h-6" />,
    description: 'are unaware of critical weaknesses',
    impact: '2x longer preparation',
    gradient: 'from-emerald-500 to-teal-500'
  },
];

export default function CounterSection() {
  const [inView, setInView] = useState(false);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const isStatsInView = useInView(statsRef, { once: true, amount: 0.3 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.2, rootMargin: '-50px' }
    );

    const element = sectionRef.current;
    if (element) observer.observe(element);
    return () => { if (element) observer.unobserve(element); };
  }, []);

  // Track mouse position for parallax effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-white py-20 md:py-32 px-4 sm:px-6 lg:px-8"
    >
      {/* Enhanced animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs with parallax */}
        <motion.div
          animate={{
            x: mousePosition.x * 2,
            y: mousePosition.y * 2,
          }}
          transition={{ type: "spring", damping: 50 }}
          className="absolute top-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-bl from-indigo-200/20 via-purple-200/20 to-transparent blur-3xl"
        />
        <motion.div
          animate={{
            x: -mousePosition.x,
            y: -mousePosition.y,
          }}
          transition={{ type: "spring", damping: 50 }}
          className="absolute bottom-20 -left-20 w-96 h-96 rounded-full bg-gradient-to-tr from-emerald-200/20 via-teal-200/20 to-transparent blur-3xl"
        />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />

        {/* Floating particles */}
        {mounted && [...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#5693C1]/20 rounded-full"
            initial={{
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%",
              scale: 0
            }}
            animate={{
              y: [null, "-30%"],
              scale: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3
            }}
          />
        ))}

        {/* Animated lines */}
        <svg className="absolute inset-0 w-full h-full">
          <motion.path
            d="M0,200 Q300,100 600,200 T1200,200"
            stroke="url(#gradientLine)"
            strokeWidth="1"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.1 }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <defs>
            <linearGradient id="gradientLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5693C1" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#2c5a7a" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 md:mb-24"
        >
          {/* Animated badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500/10 to-orange-500/10 text-red-600 font-semibold text-sm mb-6 border border-red-200/50 backdrop-blur-sm"
          >
            <Flame className="w-4 h-4" />
            The Real Challenge
            <Sparkles className="w-4 h-4" />
          </motion.div>

          {/* Main title with animated gradient */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
          >
            The Problem{' '}
            <motion.span
              className="text-[#5693C1] relative inline-block"
              whileHover={{ scale: 1.05 }}
            >
              Students
              <motion.span
                className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#5693C1] to-indigo-300 rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                transition={{ delay: 0.5, duration: 0.8 }}
                viewport={{ once: true }}
              />
            </motion.span>{' '}
            Face
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8"
          >
            Traditional placement preparation leaves students guessing about their readiness,
            leading to frustration and missed opportunities.
          </motion.p>

          {/* Feature tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-4 text-sm"
          >
            {[
              { icon: CheckCircle2, text: 'Data-driven insights', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { icon: TrendingUp, text: 'Industry research', color: 'text-[#5693C1]', bg: 'bg-[#5693C1]/10' },
              { icon: Award, text: 'Proven methodology', color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05, y: -2 }}
                className={`flex items-center gap-2 px-4 py-2 ${item.bg} rounded-full border border-gray-200/50 backdrop-blur-sm`}
              >
                <item.icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-gray-700 font-medium">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Problem Cards Grid with enhanced design and equal heights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20 md:mb-28">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onHoverStart={() => setActiveCard(index)}
              onHoverEnd={() => setActiveCard(null)}
              className="group relative h-full flex"
            >
              {/* Animated gradient border - toned down opacity */}
              <motion.div
                animate={{
                  opacity: activeCard === index ? 0.3 : 0, // Reduced from 1 to 0.3
                  scale: activeCard === index ? 1.03 : 1, // Reduced scale from 1.05 to 1.03
                }}
                className={`absolute -inset-0.5 bg-gradient-to-r ${problem.gradient} rounded-2xl blur-md transition-opacity duration-500`} // Changed blur-xl to blur-md
              />

              {/* Card - fixed height with flex column */}
              <motion.div
                animate={{
                  y: activeCard === index ? -4 : 0, // Reduced from -8 to -4
                  scale: activeCard === index ? 1.01 : 1, // Reduced from 1.02 to 1.01
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`relative bg-white rounded-2xl p-8 border-2 transition-all duration-300 w-full flex flex-col ${activeCard === index
                  ? 'border-transparent shadow-lg' // Changed from shadow-2xl to shadow-lg
                  : 'border-gray-100 shadow-md hover:shadow-lg hover:border-gray-200' // Changed shadow-xl to shadow-md, hover:shadow-xl to hover:shadow-lg
                  }`}
                style={{
                  minHeight: '480px', // Fixed minimum height
                  height: '100%',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20h20v20H20z' fill='${problem.color.replace('#', '%23')}' fill-opacity='0.03'/%3E%3C/svg%3E")`
                }}
              >
                {/* Card accent */}
                <motion.div
                  className="absolute top-0 left-0 w-full h-1 rounded-t-2xl"
                  initial={{ width: '0%' }}
                  whileInView={{ width: '100%' }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                  viewport={{ once: true }}
                  style={{
                    background: `linear-gradient(90deg, ${problem.color}, ${problem.color}80)`,
                  }}
                />

                {/* Icon container with enhanced animation */}
                <motion.div
                  animate={{
                    rotate: activeCard === index ? [0, 5, -5, 0] : 0, // Reduced rotation from 10 to 5
                    scale: activeCard === index ? 1.05 : 1, // Reduced from 1.1 to 1.05
                  }}
                  transition={{ duration: 0.4 }}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden flex-shrink-0`}
                  style={{
                    backgroundColor: problem.bgColor,
                    color: problem.color
                  }}
                >
                  <div className="relative z-10">
                    {problem.icon}
                  </div>

                  {/* Shine effect - toned down */}
                  <motion.div
                    animate={{
                      x: activeCard === index ? ['-100%', '100%'] : '-100%',
                    }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" // Reduced from white/30 to white/20
                  />

                  {/* Animated rings - toned down */}
                  {activeCard === index && (
                    <>
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1.1, opacity: 0 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute inset-0 rounded-2xl border"
                        style={{ borderColor: problem.color, borderWidth: '1px' }}
                      />
                    </>
                  )}
                </motion.div>

                {/* Title - fixed height */}
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-[#5693C1] transition-colors min-h-[56px] flex items-start">
                  {problem.title}
                </h3>

                {/* Description - fixed height with line clamping */}
                <p className="text-gray-600 leading-relaxed mb-6 flex-1 line-clamp-3">
                  {problem.description}
                </p>

                {/* Stat badge */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  className="flex items-center gap-2 mb-4"
                >
                  <div className="w-1 h-4 rounded-full" style={{ backgroundColor: problem.color }} />
                  <span className="text-xs font-medium" style={{ color: problem.color }}>
                    {problem.stat}
                  </span>
                </motion.div>

                {/* Learn more link - fixed at bottom */}
                <div
                  className="flex items-center text-[#5693C1] font-medium text-sm group/link mt-auto pt-2"
                >
                  <span>Learn more</span>
                  <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover/link:translate-x-1" />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Stats Section */}
        <motion.div
          ref={statsRef}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Main stats container */}
          <div className="relative max-w-6xl mx-auto">
            {/* Background with glass effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-gray-50/80 to-white rounded-3xl" />

            <motion.div
              className="relative backdrop-blur-xl rounded-3xl border border-gray-200/50 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
                backdropFilter: 'blur(10px)'
              }}
            >
              {/* Header with animated icon */}
              <div className="text-center pt-12 pb-8 px-8">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5693C1] to-indigo-600 text-white mb-6"
                >
                  <PieChart className="w-8 h-8" />
                </motion.div>

                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  The Numbers Don't Lie
                </h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Based on comprehensive research with thousands of students across 50+ colleges
                </p>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 pb-12">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    onHoverStart={() => setHoveredStat(index)}
                    onHoverEnd={() => setHoveredStat(null)}
                    className="relative group/stat"
                  >
                    {/* Animated background - toned down */}
                    <motion.div
                      animate={{
                        opacity: hoveredStat === index ? 0.05 : 0, // Reduced from 0.1 to 0.05
                        scale: hoveredStat === index ? 1.05 : 1, // Reduced from 1.1 to 1.05
                      }}
                      className={`absolute -inset-4 bg-gradient-to-r ${stat.gradient} rounded-2xl blur-md`} // Changed blur-xl to blur-md
                    />

                    {/* Stat card - fixed height */}
                    <div className="relative text-center p-6 rounded-2xl bg-white border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 h-full flex flex-col"> {/* Changed shadow-lg to shadow-md, hover:shadow-xl to hover:shadow-lg */}
                      {/* Icon */}
                      <motion.div
                        animate={{
                          rotate: hoveredStat === index ? 15 : 0, // Reduced from 360 to 15
                          scale: hoveredStat === index ? 1.05 : 1, // Reduced from 1.1 to 1.05
                        }}
                        transition={{ duration: 0.3 }}
                        className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 mx-auto"
                        style={{
                          backgroundColor: `${stat.color}15`,
                          color: stat.color
                        }}
                      >
                        {stat.icon}
                      </motion.div>

                      {/* Counter */}
                      <motion.div
                        className="text-5xl md:text-6xl font-bold mb-2 tracking-tight relative"
                        style={{ color: stat.color }}
                      >
                        {isStatsInView ? (
                          <AnimatedCounter
                            target={stat.value}
                            duration={2000}
                            suffix={stat.suffix}
                            inView={isStatsInView}
                          />
                        ) : (
                          `0${stat.suffix}`
                        )}

                        {/* Glow effect - toned down */}
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.2, 0.4, 0.2], // Reduced from 0.5,0.8,0.5
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 blur-lg" // Changed blur-xl to blur-lg
                          style={{ color: stat.color }}
                        >
                          {stat.value}{stat.suffix}
                        </motion.div>
                      </motion.div>

                      {/* Label */}
                      <h4 className="text-lg font-semibold text-gray-900 mb-2 min-h-[56px] flex items-center justify-center">
                        {stat.label}
                      </h4>

                      {/* Description */}
                      <p className="text-sm text-gray-500 mb-4 min-h-[40px]">
                        {stat.description}
                      </p>

                      {/* Impact badge */}
                      <motion.div
                        initial={{ opacity: 0.7, scale: 0.95 }}
                        animate={{ opacity: hoveredStat === index ? 1 : 0.7, scale: 1 }}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mx-auto"
                        style={{
                          backgroundColor: `${stat.color}10`,
                          color: stat.color
                        }}
                      >
                        <TrendingUp className="w-3 h-3" />
                        {stat.impact}
                      </motion.div>

                      {/* Progress indicator */}
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl"
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        transition={{ delay: index * 0.2 + 0.5, duration: 0.8 }}
                        style={{
                          background: `linear-gradient(90deg, ${stat.color}, ${stat.color}80)`
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Bottom CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                viewport={{ once: true }}
                className="text-center pb-12 px-8"
              >
                <div className="max-w-2xl mx-auto pt-8 border-t border-gray-200">
                  <motion.p
                    animate={{ scale: [1, 1.01, 1] }} // Reduced from 1.02 to 1.01
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-gray-600 mb-6 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5 text-[#5693C1]" />
                    Ready to solve these problems?
                    <Sparkles className="w-5 h-5 text-[#5693C1]" />
                  </motion.p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.div
                      whileHover={{ scale: 1.03 }} // Reduced from 1.05 to 1.03
                      whileTap={{ scale: 0.97 }}
                    >
                      <Link
                        href="/readiness"
                        className="group relative overflow-hidden inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#5693C1] to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300" // Changed hover:shadow-2xl to hover:shadow-lg
                      >
                        <Target className="w-5 h-5" />
                        <span>Start Your Journey</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        <motion.div
                          className="absolute inset-0 bg-white"
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 0.5 }}
                          style={{ opacity: 0.15 }} // Reduced from 0.2 to 0.15
                        />
                      </Link>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.03 }} // Reduced from 1.05 to 1.03
                      whileTap={{ scale: 0.97 }}
                    >
                      <Link
                        href="/roadmap"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-[#5693C1] hover:text-[#5693C1] hover:shadow-md transition-all duration-300" // Added hover:shadow-md
                      >
                        <PieChart className="w-5 h-5" />
                        View Roadmap
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .counter-value {
          font-variant-numeric: tabular-nums;
        }
        
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
          background-size: 50px 50px;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .floating {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        
        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}