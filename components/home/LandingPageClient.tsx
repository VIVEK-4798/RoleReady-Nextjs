'use client';

import { useRef } from 'react';
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
} from '@/components/home';
import { useAuth } from '@/hooks';
import { LANDING_CONTENT } from '@/lib/constants/landingContent';
import PublicFooter from '@/components/layout/PublicFooter';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
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
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [showLoginNudge, setShowLoginNudge] = useState(false);

  const userRole = (user?.role === 'mentor' ? 'mentor' : 'student') as 'student' | 'mentor';
  const content = LANDING_CONTENT[userRole];

  // Login Nudge Effect
  useEffect(() => {
    // DO NOT show for logged-in users
    if (session) return;

    const timer = setTimeout(() => {
      const lastShown = localStorage.getItem("login_popup_time");
      // Prevent repeated popup (24 hour expiry)
      if (!lastShown || Date.now() - Number(lastShown) > 24 * 60 * 60 * 1000) {
        setShowLoginNudge(true);
        localStorage.setItem("login_popup_time", Date.now().toString());
      }
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, [session]);

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

      {/* Job Listings - Currently disabled */}
      {/* <section className="py-16 bg-blue-50">
        <JobListings />
      </section> */}

      {/* Internship Listings - Currently disabled */}
      {/* <section className="py-16 bg-blue-50">
        <InternshipListings />
      </section> */}

      {/* How It Works (JoinOurBusiness equivalent) */}
      <section ref={howItWorksRef} id="how-it-works">
        <HowItWorksSection content={content.howItWorks} />
      </section>

      {/* Lightweight Lazy Video Demo */}
      <LandingDemoVideo />

      <section id="features">
        <WhyChooseUsSection
          ref={whyChooseUsRef}
          content={content.problem}
          isDemoOpen={isDemoOpen}
          setIsDemoOpen={setIsDemoOpen}
        />
      </section>

      {/* Mentor Benefits - For Verified Mentors and Guests */}
      {(userRole === 'mentor' || !isAuthenticated) && <MentorBenefitsSection />}

      {/* Usage Plans Section */}
      <UsagePlansSection />

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
      
      {/* Free Usage Promotion */}
      <LandingUsagePopup />
      <UsagePlansTrigger />
      
      {/* Login Nudge */}
      {showLoginNudge && <LoginNudgeModal onClose={() => setShowLoginNudge(false)} />}
    </>
  );
}
