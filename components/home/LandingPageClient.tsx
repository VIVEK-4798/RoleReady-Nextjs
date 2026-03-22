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
} from '@/components/home';
import { useAuth } from '@/hooks';
import { LANDING_CONTENT } from '@/lib/constants/landingContent';
import PublicFooter from '@/components/layout/PublicFooter';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import LandingUsagePopup from './LandingUsagePopup';

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

  const userRole = (user?.role === 'mentor' ? 'mentor' : 'student') as 'student' | 'mentor';
  const content = LANDING_CONTENT[userRole];

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
    </>
  );
}
