'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import {
  LandingHeader,
  HeroSection,
  CounterSection,
  HowItWorksSection,
  WhyChooseUsSection,
  WhoIsItForSection,
  GuestCTASection,
  AuthenticatedCTASection,
  WhyChooseUsSectionRef,
  MentorBenefitsSection,
  LandingOpportunitiesSection,
  FeedbackSection,
  UsagePlansSection,
  UsagePlansTrigger,
  LoginNudgeModal,
  ScrollToTop,
} from '@/components/home';
import { useAuth } from '@/hooks';
import { LANDING_CONTENT } from '@/lib/constants/landingContent';
import PublicFooter from '@/components/layout/PublicFooter';
import LandingUsagePopup from './LandingUsagePopup';

const LandingDemoVideo = dynamic(
  () => import('@/components/home/LandingDemoVideo'),
  { ssr: false }
);

interface LandingPageClientProps {
  isAuthenticated: boolean;
}

export default function LandingPageClient({ isAuthenticated }: LandingPageClientProps) {
  const { data: session } = useSession();
  const { user } = useAuth();
  const router = useRouter();
  const whyChooseUsRef = useRef<WhyChooseUsSectionRef>(null);
  const howItWorksRef = useRef<HTMLElement>(null);
  const pricingRef = useRef<HTMLElement>(null);
  
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  
  // Logical triggers for popups
  const [shouldShowLoginNudge, setShouldShowLoginNudge] = useState(false);
  const [shouldShowUsagePopup, setShouldShowUsagePopup] = useState(false);
  
  // Determine which popup to actually show (Priority: Login > Usage)
  const activePopup = shouldShowLoginNudge ? 'login' : (shouldShowUsagePopup ? 'usage' : null);

  const userRole = (user?.role === 'mentor' ? 'mentor' : 'student') as 'student' | 'mentor';
  const content = LANDING_CONTENT[userRole];
  const showPricingContent = userRole !== 'mentor';

  // 1️⃣ Login Nudge Effect (15 seconds delay, frequency-capped)
  useEffect(() => {
    if (session) return;

    const timer = setTimeout(() => {
      const lastShown = localStorage.getItem("login_popup_time");
      // Prevent repeated popup (24 hour expiry)
      if (!lastShown || Date.now() - Number(lastShown) > 24 * 60 * 60 * 1000) {
        setShouldShowLoginNudge(true);
        localStorage.setItem("login_popup_time", Date.now().toString());
      }
    }, 15000); // 15 seconds

    return () => clearTimeout(timer);
  }, [session]);

  // 2️⃣ Usage Popup Effect (Scroll 60% OR Pricing Section Intersection)
  useEffect(() => {
    if (!showPricingContent) return;

    const handleTriggerUsage = () => {
      const hasSeen = sessionStorage.getItem('hasSeenFreeUsagePopup');
      if (!hasSeen) {
        setShouldShowUsagePopup(true);
        sessionStorage.setItem('hasSeenFreeUsagePopup', 'true');
      }
    };

    // Scroll 60% trigger
    const handleScroll = () => {
      const scrollPercent = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (scrollPercent > 0.6) {
        handleTriggerUsage();
        window.removeEventListener('scroll', handleScroll);
      }
    };

    // Intersection Observer for Pricing Section
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          handleTriggerUsage();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    window.addEventListener('scroll', handleScroll, { passive: true });
    if (pricingRef.current) observer.observe(pricingRef.current);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [showPricingContent]);

  const handleCheckReadiness = () => {
    whyChooseUsRef.current?.scrollToCTA();
  };

  const handleLearnMore = () => {
    howItWorksRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleStudentCTA = () => {
    setIsDemoOpen(true);
  };

  const handleMentorCTA = () => {
    if (!session) {
      router.push('/login?intent=mentor');
    } else if ((session.user as any)?.role === 'mentor') {
      router.push('/mentor');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <>
      <LandingHeader isAuthenticated={isAuthenticated} />

      <HeroSection
        onCheckReadiness={handleCheckReadiness}
        onLearnMore={handleLearnMore}
        content={content.hero}
      />

      {/* Counter Section */}
      <CounterSection />

      {/* How It Works */}
      <section ref={howItWorksRef} id="how-it-works">
        <HowItWorksSection content={content.howItWorks} />
      </section>

      {/* Lightweight Lazy Video Demo */}
      {/* <LandingDemoVideo /> */}

      <section id="features">
        <WhyChooseUsSection
          ref={whyChooseUsRef}
          content={content.problem}
          isDemoOpen={isDemoOpen}
          setIsDemoOpen={setIsDemoOpen}
        />
      </section>

      {/* Mentor Benefits */}
      {(userRole === 'mentor' || !isAuthenticated) && <MentorBenefitsSection />}

      {/* Usage Plans Section (Pricing) */}
      {showPricingContent && <UsagePlansSection ref={pricingRef} />}

      {/* Who Is It For */}
      <section id="for-who">
        <WhoIsItForSection
          content={content.whoIsItFor}
          role={userRole}
          onStudentCTA={handleStudentCTA}
          onMentorCTA={handleMentorCTA}
        />
      </section>

      {/* Explore Opportunities */}
      <LandingOpportunitiesSection />

      {/* Conditional Call To Action */}
      {isAuthenticated ? (
        <AuthenticatedCTASection content={content.footerCTA} />
      ) : (
        <GuestCTASection />
      )}

      {/* Feedback Section */}
      <FeedbackSection />

      <PublicFooter />
      
      {/* Free Usage Promotion Popup (Secondary Priority) */}
      <LandingUsagePopup 
        isVisible={activePopup === 'usage'} 
        onClose={() => setShouldShowUsagePopup(false)} 
      />

      {showPricingContent && <UsagePlansTrigger />}
      
      {/* Login Nudge Modal (High Priority) */}
      {activePopup === 'login' && (
        <LoginNudgeModal onClose={() => setShouldShowLoginNudge(false)} />
      )}

      {/* Scroll to Top */}
      <ScrollToTop />
    </>
  );
}
