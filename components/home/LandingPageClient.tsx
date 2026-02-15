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
} from '@/components/home';
import { useAuth } from '@/hooks';
import { LANDING_CONTENT } from '@/lib/constants/landingContent';
import PublicFooter from '@/components/layout/PublicFooter';

interface LandingPageClientProps {
  isAuthenticated: boolean;
}

export default function LandingPageClient({ isAuthenticated }: LandingPageClientProps) {
  const { user } = useAuth();
  const whyChooseUsRef = useRef<WhyChooseUsSectionRef>(null);
  const howItWorksRef = useRef<HTMLElement>(null);
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

      {/* Why Choose Us */}
      <section id="features">
        <WhyChooseUsSection ref={whyChooseUsRef} content={content.problem} />
      </section>

      {/* Who Is It For */}
      <section id="for-who">
        <WhoIsItForSection content={content.whoIsItFor} role={userRole} />
      </section>

      {/* Conditional Call To Action */}
      {isAuthenticated ? (
        <AuthenticatedCTASection content={content.footerCTA} />
      ) : (
        <GuestCTASection />
      )}

      <PublicFooter />
    </>
  );
}
