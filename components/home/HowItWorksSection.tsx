'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks';
import {
  Rocket,
  Target,
  BarChart3,
  Map,
  Users,
  CheckCircle2,
  ArrowRight,
  Zap,
  Sparkles,
  Crown,
  Medal,
  Bot,
  Cpu,
  Workflow,
  Gauge,
  TrendingUp,
  Award,
  Star,
  ChevronRight,
  Play,
  Brain,
  GraduationCap,
  FileCheck,
  UserCheck,
  Clock,
  Heart,
  Shield,
  Sparkle
} from 'lucide-react';

interface HowItWorksSectionProps {
  content: {
    title: string;
    subtitle: string;
    steps: {
      title: string;
      description: string;
      features: string[];
    }[];
    finalCTATitle: string;
    finalCTASubtitle: string;
    finalCTAButton: string;
  };
}

export default function HowItWorksSection({ content }: HowItWorksSectionProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLElement>(null);
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  // Enhanced step icons with modern design
  const stepIcons = [
    { icon: Rocket, label: 'Setup', gradient: 'from-blue-500 to-[#5693C1]', color: '#5693C1' },
    { icon: BarChart3, label: 'Analyze', gradient: 'from-emerald-500 to-teal-500', color: '#10B981' },
    { icon: Map, label: 'Plan', gradient: 'from-amber-500 to-orange-500', color: '#F59E0B' },
    { icon: Users, label: 'Validate', gradient: 'from-purple-500 to-violet-500', color: '#8B5CF6' },
    { icon: Target, label: 'Achieve', gradient: 'from-pink-500 to-rose-500', color: '#EC4899' }
  ];

  // Progress stats
  const progressStats = [
    { label: 'Time to first job', value: '60%', change: 'faster', icon: Clock, color: '#5693C1' },
    { label: 'Skill improvement', value: '85%', change: 'increase', icon: TrendingUp, color: '#10B981' },
    { label: 'Interview success', value: '3x', change: 'higher', icon: Award, color: '#8B5CF6' },
  ];

  return (
    <motion.section
      ref={sectionRef}
      className="relative overflow-hidden bg-white py-24 md:py-32 px-4 sm:px-6 lg:px-8"
    >
      {/* Enhanced animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs with mouse following effect */}
        <motion.div
          animate={{
            x: mousePosition.x * 2,
            y: mousePosition.y * 2,
          }}
          transition={{ type: "spring", damping: 50 }}
          className="absolute top-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-bl from-[#5693C1]/10 via-blue-200/10 to-transparent blur-3xl"
        />
        <motion.div
          animate={{
            x: -mousePosition.x,
            y: -mousePosition.y,
          }}
          transition={{ type: "spring", damping: 50 }}
          className="absolute bottom-20 -left-20 w-96 h-96 rounded-full bg-gradient-to-tr from-emerald-200/10 via-teal-200/10 to-transparent blur-3xl"
        />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />

        {/* Animated lines */}
        <svg className="absolute inset-0 w-full h-full">
          <motion.path
            d="M0,100 Q150,50 300,100 T600,100"
            stroke="url(#gradient1)"
            strokeWidth="1"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.1 }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5693C1" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#2c5a7a" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>

        {/* Floating particles */}
        {mounted && [...Array(20)].map((_, i) => (
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
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with enhanced animations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 md:mb-20"
        >
          {/* Animated badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#5693C1]/10 to-[#2c5a7a]/10 text-[#5693C1] text-xs font-semibold uppercase tracking-wider mb-6 border border-[#5693C1]/20 backdrop-blur-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Your Journey to Success
            <Zap className="w-3.5 h-3.5" />
          </motion.div>

          {/* Main title with animated gradient */}
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

          {/* Subtitle with animated underline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            {content.subtitle}
          </motion.p>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            viewport={{ once: true }}
            className="w-24 h-1 bg-gradient-to-r from-[#5693C1] to-[#2c5a7a] mx-auto mt-8 rounded-full"
          />
        </motion.div>

        {/* Progress Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {progressStats.map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative overflow-hidden group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                style={{ background: `linear-gradient(135deg, ${stat.color}, transparent)` }}
              />

              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 rounded-full border-2 border-dashed"
                  style={{ borderColor: stat.color }}
                />
              </div>

              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
              <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {stat.change} than average
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Steps Grid with enhanced animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {content.steps.map((step, index) => {
            const StepIcon = stepIcons[index].icon;
            const isLastRow = index >= content.steps.length - 2;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                onHoverStart={() => setHoveredCard(index)}
                onHoverEnd={() => setHoveredCard(null)}
                className={`relative group ${isLastRow ? 'lg:col-span-1' : ''}`}
              >
                {/* Animated gradient border */}
                <motion.div
                  animate={{
                    opacity: hoveredCard === index ? 1 : 0,
                    scale: hoveredCard === index ? 1.05 : 1,
                  }}
                  className="absolute -inset-0.5 bg-gradient-to-r from-[#5693C1] to-[#2c5a7a] rounded-2xl blur-xl transition-opacity duration-500"
                  style={{ opacity: 0 }}
                />

                {/* Main card */}
                <motion.div
                  animate={{
                    y: hoveredCard === index ? -8 : 0,
                    scale: hoveredCard === index ? 1.02 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`relative bg-white rounded-2xl p-8 border-2 transition-all duration-300 ${hoveredCard === index
                    ? index >= content.steps.length - 3 ? 'border-[#5693C1] shadow-md' : 'border-[#5693C1] shadow-lg'
                    : 'border-gray-100 shadow-md hover:shadow-sm hover:border-gray-200'
                    }`}
                >
                  {/* Step number badge with animation */}
                  <motion.div
                    animate={{
                      rotate: hoveredCard === index ? 5 : 0,
                      scale: hoveredCard === index ? 1.1 : 1,
                    }}
                    className="absolute top-6 right-6 z-10"
                  >
                    <div className="relative">
                      <div className={`absolute inset-0 bg-gradient-to-r ${stepIcons[index].gradient} rounded-full blur-md opacity-50`} />
                      <div className="relative w-12 h-12 bg-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg border-2 border-gray-100">
                        <span className="bg-gradient-to-r from-[#5693C1] to-[#2c5a7a] bg-clip-text text-transparent">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Icon container with animated background */}
                  <motion.div
                    animate={{
                      rotate: hoveredCard === index ? [0, 10, -10, 0] : 0,
                    }}
                    transition={{ duration: 0.5 }}
                    className="relative mb-8"
                  >
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${stepIcons[index].gradient} flex items-center justify-center shadow-lg relative overflow-hidden`}>
                      <StepIcon className="w-8 h-8 text-white relative z-10" />

                      {/* Shine effect */}
                      <motion.div
                        animate={{
                          x: hoveredCard === index ? ['-100%', '100%'] : '-100%',
                        }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      />
                    </div>

                    {/* Step label */}
                    <motion.span
                      animate={{ opacity: hoveredCard === index ? 1 : 0.5 }}
                      className="absolute -bottom-2 left-0 text-xs font-medium text-gray-400 bg-white px-2 py-1 rounded-full shadow-sm"
                    >
                      {stepIcons[index].label}
                    </motion.span>
                  </motion.div>

                  {/* Title with hover effect */}
                  <motion.h3
                    animate={{ x: hoveredCard === index ? 5 : 0 }}
                    className="text-xl font-bold text-gray-900 mb-4 group-hover:text-[#5693C1] transition-colors"
                  >
                    {step.title}
                  </motion.h3>

                  {/* Description */}
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Features list with enhanced animations */}
                  <div className="space-y-3">
                    {step.features.map((feature, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + i * 0.1 }}
                        viewport={{ once: true }}
                        whileHover={{ x: 5 }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group/item"
                      >
                        <div className="relative">
                          <div className="absolute inset-0 bg-green-500 rounded-full blur-sm opacity-0 group-hover/item:opacity-20 transition-opacity" />
                          <CheckCircle2 className="w-5 h-5 text-green-500 relative z-10" />
                        </div>
                        <span className="text-sm text-gray-700 font-medium flex-1">
                          {feature}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover/item:opacity-100 transition-all group-hover/item:translate-x-1" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Progress indicator */}
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#5693C1] to-[#2c5a7a] rounded-b-2xl"
                    style={{ width: hoveredCard === index ? '100%' : '0%' }}
                  />
                </motion.div>

                {/* Connector line (between steps) */}
                {index < content.steps.length - 1 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ delay: index * 0.2, duration: 0.5 }}
                    className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-[#5693C1]/30 to-transparent"
                    style={{ transform: 'translateY(-50%)' }}
                  />
                )}
              </motion.div>
            );
          })}

          {/* Enhanced CTA Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            viewport={{ once: true }}
            className="lg:col-span-1 relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-[#5693C1] to-[#2c5a7a] rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" />

            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              className="relative h-full bg-gradient-to-br from-[#5693C1] to-[#2c5a7a] rounded-2xl p-8 text-white overflow-hidden"
            >
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full">
                  <pattern id="pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="1" fill="white" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#pattern)" />
                </svg>
              </div>

              {/* Floating icons */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute top-8 right-8 opacity-20"
              >
                <Crown className="w-16 h-16 text-white" />
              </motion.div>

              <motion.div
                animate={{
                  y: [0, 10, 0],
                  x: [0, 5, 0],
                }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                className="absolute bottom-8 left-8 opacity-20"
              >
                <Sparkle className="w-12 h-12 text-white" />
              </motion.div>

              {/* Content */}
              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center mb-8 border border-white/30"
                >
                  <Bot className="w-8 h-8 text-white" />
                </motion.div>

                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  {content.finalCTATitle}
                </h3>

                <p className="text-white/80 mb-8 leading-relaxed">
                  {content.finalCTASubtitle}
                </p>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={user?.role === 'mentor' ? '/mentor' : '/readiness'}
                    className="group relative overflow-hidden w-full h-14 bg-white text-[#5693C1] rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-300"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {content.finalCTAButton}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.5 }}
                    />
                  </Link>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/60 text-sm text-center mt-4 flex items-center justify-center gap-1"
                >
                  {user?.role === 'mentor' ? (
                    <>
                      <Shield className="w-3 h-3" />
                      Centralized validation workflow
                    </>
                  ) : (
                    <>
                      <Zap className="w-3 h-3" />
                      No credit card required • 5-min setup
                    </>
                  )}
                </motion.p>


              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
    </motion.section>
  );
}