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
import { 
    ArrowRight, 
    CheckCircle, 
    Sparkles, 
    Zap, 
    Shield, 
    Play,
    Star,
    Users,
    TrendingUp
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

export default function HeroSection({ onCheckReadiness, onLearnMore, content }: HeroSectionProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Parallax effect on mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!heroRef.current || !mounted) return;
    const { left, top, width, height } = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    setMousePosition({ x, y });
  };

  return (
    <section 
      ref={heroRef}
      onMouseMove={handleMouseMove}
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
              AI-Powered Career Validation
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

          {/* Right Content - Hero Image with 3D Effect */}
          <div className="relative animate-in fade-in slide-in-from-right-4 duration-700 delay-500">
            {/* Main image container */}
            <div 
              className="relative rounded-2xl overflow-hidden shadow-2xl transform-gpu transition-transform duration-200 ease-out"
              style={{
                transform: mounted ? `perspective(1000px) rotateY(${mousePosition.x * 10}deg) rotateX(${-mousePosition.y * 10}deg) scale3d(1.05, 1.05, 1.05)` : 'none',
              }}
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src="/img/hero/hero.png"
                  alt="RoleReady platform preview"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#5693C1]/20 via-transparent to-transparent" />
              
              {/* Floating stats cards */}
              <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 animate-float">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">92% success rate</span>
                </div>
              </div>
              
              <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 animate-float-delayed">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#5693C1]" />
                  <span className="text-sm font-medium">500+ mentors</span>
                </div>
              </div>
            </div>

            {/* Stats grid below image */}
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