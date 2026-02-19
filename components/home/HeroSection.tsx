/**
 * Hero Section Component
 * 
 * Main hero section for the landing page with stunning visuals and animations.
 * Fixed hydration issues by removing random values and ensuring server/client match.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle,
  Sparkles,
  Zap,
  Shield,
  Play,
  Star,
  Users,
  TrendingUp,
  Target,
  Brain,
  Award,
  BarChart3,
  ChevronRight,
  Cpu,
  Network,
  Workflow,
  Gauge,
  Rocket,
  Medal,
  Bot
} from 'lucide-react';

interface HeroSectionProps {
  onCheckReadiness: () => void;
  onLearnMore: () => void;
  content: {
    title: string;
    subtitle: string;
    primaryCTA: string;
    primaryHref: string;
    secondaryCTA: string;
    secondaryHref?: string;
  };
}

// Fixed particles with deterministic positions (no random values)
const FIXED_PARTICLES = [
  { left: '15%', top: '20%', delay: '0s', duration: '8s', scale: 0.8 },
  { left: '85%', top: '30%', delay: '2s', duration: '10s', scale: 1.2 },
  { left: '25%', top: '70%', delay: '1s', duration: '7s', scale: 0.9 },
  { left: '45%', top: '15%', delay: '3s', duration: '9s', scale: 1.1 },
  { left: '60%', top: '85%', delay: '0.5s', duration: '11s', scale: 0.7 },
  { left: '75%', top: '45%', delay: '2.5s', duration: '8.5s', scale: 1.3 },
  { left: '10%', top: '90%', delay: '1.5s', duration: '9.5s', scale: 0.85 },
  { left: '90%', top: '10%', delay: '3.5s', duration: '7.5s', scale: 1.15 },
  { left: '35%', top: '50%', delay: '0.2s', duration: '12s', scale: 0.95 },
  { left: '55%', top: '35%', delay: '2.2s', duration: '8.2s', scale: 1.05 },
  { left: '20%', top: '60%', delay: '1.2s', duration: '10.2s', scale: 1.25 },
  { left: '80%', top: '75%', delay: '3.2s', duration: '6.8s', scale: 0.75 },
  { left: '40%', top: '25%', delay: '0.8s', duration: '9.8s', scale: 1.35 },
  { left: '70%', top: '55%', delay: '1.8s', duration: '7.8s', scale: 0.65 },
  { left: '5%', top: '40%', delay: '2.8s', duration: '11.2s', scale: 1.45 },
  { left: '95%', top: '65%', delay: '0.3s', duration: '8.3s', scale: 0.55 },
  { left: '30%', top: '80%', delay: '1.3s', duration: '9.3s', scale: 1.4 },
  { left: '50%', top: '5%', delay: '2.3s', duration: '7.3s', scale: 0.6 },
  { left: '65%', top: '95%', delay: '3.3s', duration: '10.3s', scale: 1.5 },
  { left: '45%', top: '45%', delay: '0.7s', duration: '6.7s', scale: 0.9 },
  { left: '15%', top: '10%', delay: '1.7s', duration: '8.7s', scale: 1.2 },
  { left: '85%', top: '85%', delay: '2.7s', duration: '9.7s', scale: 0.8 },
  { left: '25%', top: '35%', delay: '0.4s', duration: '11.4s', scale: 1.1 },
  { left: '75%', top: '20%', delay: '1.4s', duration: '8.4s', scale: 0.95 },
  { left: '10%', top: '75%', delay: '2.4s', duration: '7.4s', scale: 1.3 },
  { left: '90%', top: '50%', delay: '3.4s', duration: '9.4s', scale: 0.7 },
  { left: '35%', top: '60%', delay: '0.9s', duration: '10.9s', scale: 1.15 },
  { left: '55%', top: '40%', delay: '1.9s', duration: '6.9s', scale: 0.85 },
  { left: '20%', top: '30%', delay: '2.9s', duration: '8.9s', scale: 1.25 },
  { left: '70%', top: '70%', delay: '0.1s', duration: '7.1s', scale: 0.75 },
];

// Floating particles component with fixed positions
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {FIXED_PARTICLES.map((particle, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-[#5693C1]/20 rounded-full animate-float"
          style={{
            left: particle.left,
            top: particle.top,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
            transform: `scale(${particle.scale})`,
          }}
        />
      ))}
    </div>
  );
};

// Animated gradient orb
const GradientOrb = () => {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-30 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-r from-[#5693C1] via-[#3a6a8c] to-[#5693C1] rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute inset-20 bg-gradient-to-r from-[#b8d4e8] via-[#5693C1] to-[#b8d4e8] rounded-full blur-2xl animate-pulse-slower" />
    </div>
  );
};

// Typewriter effect component - fixed to avoid hydration issues
const TypewriterText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState('Your Career');
  const [mounted, setMounted] = useState(false);

  const words = ['Your Career', 'Your Skills', 'Your Future'];

  useEffect(() => {
    setMounted(true);
    let currentIndex = 0;
    let currentWord = words[0];
    let isDeleting = false;
    let timeout: NodeJS.Timeout;

    const typeEffect = () => {
      if (!mounted) return;

      if (!isDeleting && displayText.length < currentWord.length) {
        // Typing
        setDisplayText(currentWord.slice(0, displayText.length + 1));
        timeout = setTimeout(typeEffect, 100);
      } else if (isDeleting && displayText.length > 0) {
        // Deleting
        setDisplayText(currentWord.slice(0, displayText.length - 1));
        timeout = setTimeout(typeEffect, 50);
      } else if (!isDeleting && displayText.length === currentWord.length) {
        // Pause at full word
        timeout = setTimeout(() => {
          isDeleting = true;
          typeEffect();
        }, 2000);
      } else if (isDeleting && displayText.length === 0) {
        // Move to next word
        isDeleting = false;
        currentIndex = (currentIndex + 1) % words.length;
        currentWord = words[currentIndex];
        timeout = setTimeout(typeEffect, 500);
      }
    };

    timeout = setTimeout(typeEffect, 500);

    return () => clearTimeout(timeout);
  }, [displayText, mounted, words]);

  // Return initial text during SSR to match server
  if (!mounted) {
    return <span className="bg-gradient-to-r from-[#5693C1] to-[#3a6a8c] bg-clip-text text-transparent">Your Career</span>;
  }

  return (
    <span className="bg-gradient-to-r from-[#5693C1] to-[#3a6a8c] bg-clip-text text-transparent">
      {displayText}
      <span className="animate-blink">|</span>
    </span>
  );
};

// Stats counter component with proper type fixes
const StatCounter = ({ value, label, icon: Icon, delay }: { value: string; label: string; icon: any; delay: number }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !mounted) return;

    // Parse the numeric value and suffix correctly
    const numericMatch = value.match(/\d+/);
    const suffixMatch = value.match(/[^0-9]/g)?.join('') || '';

    const numericValue = numericMatch ? parseInt(numericMatch[0]) : 0;
    const suffix = suffixMatch;

    let start = 0;
    const duration = 2000;
    const increment = numericValue / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start < numericValue) {
        setCount(Math.floor(start));
      } else {
        setCount(numericValue);
        clearInterval(timer);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [isVisible, mounted, value]);

  // Return static value during SSR
  if (!mounted) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5693C1]/10 to-[#3a6a8c]/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#5693C1]" />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-xs text-gray-500">{label}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5693C1]/10 to-[#3a6a8c]/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-[#5693C1]" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{count}{value.replace(/[0-9]/g, '')}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  );
};

// ============================================================================
// Skill Node Component for the Network Visualization
// ============================================================================
const SkillNode = ({
  x,
  y,
  label,
  value,
  color,
  delay,
  isActive,
  onHover
}: {
  x: number;
  y: number;
  label: string;
  value: number;
  color: string;
  delay: number;
  isActive: boolean;
  onHover: () => void;
}) => {
  const nodeX = useMotionValue(x);
  const nodeY = useMotionValue(y);

  const springX = useSpring(nodeX, { stiffness: 100, damping: 10 });
  const springY = useSpring(nodeY, { stiffness: 100, damping: 10 });

  useEffect(() => {
    const animate = () => {
      const time = Date.now() / 1000;
      nodeX.set(x + Math.sin(time * 0.5 + delay) * 5);
      nodeY.set(y + Math.cos(time * 0.3 + delay) * 5);
    };

    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, [x, y, delay, nodeX, nodeY]);

  return (
    <motion.g
      onMouseEnter={onHover}
      style={{ x: springX, y: springY }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: delay * 0.1, duration: 0.5 }}
    >
      {/* Node glow */}
      <circle
        r={30}
        fill={`${color}20`}
        className="transition-all duration-300"
        style={{
          filter: isActive ? `blur(8px)` : 'blur(4px)',
        }}
      />

      {/* Main node */}
      <circle
        r={20}
        fill={color}
        className="transition-all duration-300 cursor-pointer"
        style={{
          filter: isActive ? 'brightness(1.2)' : 'brightness(1)',
        }}
      />

      {/* Inner glow */}
      <circle
        r={12}
        fill="white"
        fillOpacity={0.3}
      />

      {/* Value text */}
      <text
        x={0}
        y={0}
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-xs font-bold fill-white"
      >
        {value}%
      </text>

      {/* Label */}
      <text
        x={0}
        y={35}
        textAnchor="middle"
        className="text-xs font-medium fill-gray-700"
      >
        {label}
      </text>
    </motion.g>
  );
};

// ============================================================================
// Connection Line Component
// ============================================================================
const ConnectionLine = ({
  start,
  end,
  color,
  isActive
}: {
  start: { x: number; y: number };
  end: { x: number; y: number };
  color: string;
  isActive: boolean;
}) => {
  const [path, setPath] = useState('');

  useEffect(() => {
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const controlX = midX + (Math.random() - 0.5) * 40;
    const controlY = midY + (Math.random() - 0.5) * 40;

    setPath(`M ${start.x} ${start.y} Q ${controlX} ${controlY} ${end.x} ${end.y}`);
  }, [start, end]);

  return (
    <motion.path
      d={path}
      stroke={color}
      strokeWidth={isActive ? 2 : 1}
      strokeOpacity={isActive ? 0.4 : 0.2}
      fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: isActive ? 0.4 : 0.2 }}
      transition={{ duration: 1, delay: 0.5 }}
      strokeDasharray="5,5"
    />
  );
};

// ============================================================================
// Main Animated Visualization Component
// ============================================================================
const RoleReadyVisualization = () => {
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Fixed node positions
  const nodes = [
    { x: 150, y: 120, label: 'React', value: 85, color: '#5693C1' },
    { x: 250, y: 80, label: 'Node.js', value: 70, color: '#10B981' },
    { x: 350, y: 120, label: 'Python', value: 60, color: '#F59E0B' },
    { x: 180, y: 220, label: 'TypeScript', value: 75, color: '#8B5CF6' },
    { x: 280, y: 270, label: 'MongoDB', value: 65, color: '#EC4899' },
    { x: 380, y: 220, label: 'AWS', value: 55, color: '#0EA5E9' },
    { x: 120, y: 320, label: 'Docker', value: 45, color: '#EF4444' },
    { x: 220, y: 370, label: 'GraphQL', value: 50, color: '#F97316' },
    { x: 320, y: 320, label: 'Kubernetes', value: 40, color: '#A855F7' },
  ];

  // Readiness score calculation
  const avgScore = Math.round(nodes.reduce((acc, node) => acc + node.value, 0) / nodes.length);
  const readinessColor = avgScore >= 80 ? '#10B981' : avgScore >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="relative w-full h-[500px] bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
    >
      {/* Background grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #5693C1 1px, transparent 0)`,
        backgroundSize: '20px 20px',
        opacity: 0.1
      }} />

      {/* Animated background orbs */}
      <motion.div
        animate={{
          rotate: rotation,
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[#5693C1]/10 to-[#3a6a8c]/10 rounded-full blur-3xl"
      />

      {/* Main visualization container */}
      <div className="absolute inset-0">
        <svg width="500" height="450" className="absolute inset-0">
          {/* Connections */}
          {nodes.map((node, i) =>
            nodes.slice(i + 1).map((otherNode, j) => (
              <ConnectionLine
                key={`${i}-${j}`}
                start={{ x: node.x, y: node.y }}
                end={{ x: otherNode.x, y: otherNode.y }}
                color={node.color}
                isActive={activeNode === i || activeNode === i + j + 1}
              />
            ))
          )}

          {/* Skill nodes */}
          {nodes.map((node, index) => (
            <SkillNode
              key={index}
              x={node.x}
              y={node.y}
              label={node.label}
              value={node.value}
              color={node.color}
              delay={index}
              isActive={activeNode === index}
              onHover={() => setActiveNode(index)}
            />
          ))}
        </svg>

        {/* Central Readiness Score */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: "spring" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-2xl shadow-2xl flex flex-col items-center justify-center border-4"
          style={{ borderColor: readinessColor }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-3xl font-bold"
            style={{ color: readinessColor }}
          >
            {avgScore}%
          </motion.div>
          <div className="text-xs text-gray-500 mt-1">Readiness</div>
          <Gauge className="w-4 h-4 mt-1" style={{ color: readinessColor }} />
        </motion.div>

        {/* Floating info cards */}
        <AnimatePresence>
          {activeNode !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-4 border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: nodes[activeNode].color }} />
                <div>
                  <div className="font-semibold text-gray-900">{nodes[activeNode].label}</div>
                  <div className="text-sm text-gray-500">Proficiency: {nodes[activeNode].value}%</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top right stats */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-gray-200"
        >
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-[#5693C1]" />
            <span className="text-xs font-medium">AI Analysis Active</span>
          </div>
          <div className="text-[10px] text-gray-400 mt-1">9 skills analyzed</div>
        </motion.div>

        {/* Bottom right career path */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-gray-200"
        >
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium">Target: Senior Dev</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <div className="h-1 w-16 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                transition={{ delay: 1.5, duration: 1 }}
                className="h-full bg-gradient-to-r from-[#5693C1] to-green-500"
              />
            </div>
            <span className="text-[10px] text-gray-400">75% match</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent" />
    </motion.div>
  );
};

export default function HeroSection({ onCheckReadiness, onLearnMore, content }: HeroSectionProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  /* Removed unused mouse position state that was causing render loop */

  const handlePrimaryClick = () => {
    if (content.primaryHref.startsWith('/')) {
      router.push(content.primaryHref);
    } else {
      onCheckReadiness();
    }
  };

  const handleSecondaryClick = () => {
    if (content.secondaryHref?.startsWith('/')) {
      router.push(content.secondaryHref);
    } else {
      onLearnMore();
    }
  };

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50"
    >
      {/* Background elements */}
      <GradientOrb />
      <FloatingParticles />

      {/* Animated grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, #5693C1 1px, transparent 0)`,
        backgroundSize: '50px 50px',
        opacity: 0.03
      }} />

      {/* Decorative lines */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#5693C1]/20 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#5693C1]/20 to-transparent" />

      {/* Diagonal lines */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-[#5693C1]/10 to-transparent" style={{ left: '10%' }} />
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-[#5693C1]/10 to-transparent" style={{ right: '10%' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#5693C1]/10 to-[#3a6a8c]/10 text-[#5693C1] text-xs font-semibold uppercase tracking-wider mb-8 border border-[#5693C1]/20 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="w-3.5 h-3.5" />
              Be Placement Ready
              <Zap className="w-3.5 h-3.5" />
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              {content.title.split('.')[0]}{' '}
              <span className="block text-4xl md:text-5xl lg:text-6xl mt-2">
                for{' '}
                <TypewriterText text="" />
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              {content.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <button
                onClick={handlePrimaryClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="group relative px-8 py-4 bg-gradient-to-r from-[#5693C1] to-[#3a6a8c] text-white rounded-xl font-semibold text-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-1"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {content.primaryCTA}
                  <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#3a6a8c] to-[#5693C1] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>

              <button
                onClick={handleSecondaryClick}
                className="group px-8 py-4 bg-white text-[#5693C1] border-2 border-[#5693C1] rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-1 hover:bg-[#5693C1]/5 flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                {content.secondaryCTA}
              </button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-gray-200 to-gray-300"
                      style={{
                        backgroundImage: `url(https://i.pravatar.cc/32?img=${i})`,
                        backgroundSize: 'cover'
                      }}
                    />
                  ))}
                </div>
                <div className="text-sm">
                  <span className="font-bold text-gray-900">10k+</span>
                  <span className="text-gray-500 ml-1">active users</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-sm text-gray-500 ml-2">4.9 (2.3k reviews)</span>
              </div>
            </div>
          </div>

          {/* Right Content - Animated Visualization */}
          <div className="relative animate-in fade-in slide-in-from-right-4 duration-700 delay-500">
            {/* Main visualization */}
            <RoleReadyVisualization />

            {/* Stats grid below visualization */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <StatCounter value="10k+" label="Students" icon={Users} delay={600} />
              <StatCounter value="500+" label="Mentors" icon={Shield} delay={700} />
              <StatCounter value="98%" label="Satisfaction" icon={TrendingUp} delay={800} />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-[#5693C1]/30 flex justify-center">
            <div className="w-1 h-2 bg-[#5693C1] rounded-full mt-2 animate-scroll" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.4; }
        }
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.3; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes scroll {
          0% { transform: translateY(0); opacity: 1; }
          75% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 3s ease-in-out infinite;
          animation-delay: 1.5s;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-pulse-slower {
          animation: pulse-slower 6s ease-in-out infinite;
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
        .animate-scroll {
          animation: scroll 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}