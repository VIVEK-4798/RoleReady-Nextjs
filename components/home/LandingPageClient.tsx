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
  FooterSection,
  WhyChooseUsSectionRef,
} from '@/components/home';

interface LandingPageClientProps {
  isAuthenticated: boolean;
}

export default function LandingPageClient({ isAuthenticated }: LandingPageClientProps) {
  const whyChooseUsRef = useRef<WhyChooseUsSectionRef>(null);
  const howItWorksRef = useRef<HTMLElement>(null);

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
        <HowItWorksSection />
      </section>

      {/* Why Choose Us */}
      <section id="features">
        <WhyChooseUsSection ref={whyChooseUsRef} />
      </section>

      {/* Who Is It For */}
      <section id="for-who">
        <WhoIsItForSection />
      </section>

      {/* Conditional Call To Action */}
      {isAuthenticated ? (
        <AuthenticatedCTASection />
      ) : (
        <GuestCTASection />
      )}

      <FooterSection />
    </>
  );
}
