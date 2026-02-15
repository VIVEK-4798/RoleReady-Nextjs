/**
 * Hero Section Component
 * 
 * Main hero section for the landing page with CTA buttons.
 * Migrated from Hero5 component in the old React project.
 */

'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

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

export default function HeroSection({ onCheckReadiness, onLearnMore, content }: HeroSectionProps) {
  const router = useRouter();

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
    <section className="pt-32 pb-16 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-10">
          {/* Left Side - Content */}
          <div className="flex-1 min-w-[300px] max-w-[600px] mb-10">
            <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold leading-tight text-slate-900 mb-6 tracking-tight">
              {content.title.split('.').map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && <span className="text-[#5693C1]">.</span>}
                </span>
              ))}
            </h1>

            <p className="text-lg md:text-xl leading-relaxed text-slate-500 mb-10 max-w-[600px]">
              {content.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handlePrimaryClick}
                className="px-10 py-4 text-base font-bold bg-gradient-to-br from-[#5693C1] to-[#4a80b0] text-white border-none rounded-xl cursor-pointer transition-all duration-300 shadow-[0_4px_20px_rgba(86,147,193,0.3)] hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(86,147,193,0.4)]"
              >
                {content.primaryCTA}
              </button>

              <button
                onClick={handleSecondaryClick}
                className="px-10 py-4 text-base font-bold bg-white text-[#5693C1] border-2 border-[#5693C1] rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(86,147,193,0.15)] hover:bg-[#5693C1]/5"
              >
                {content.secondaryCTA}
              </button>
            </div>

            {/* Additional Info */}
            <p className="mt-6 text-sm text-slate-400 font-medium flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              Takes 5 minutes • No credit card required
            </p>
          </div>

          {/* Right Side - Hero Image */}
          <div className="flex-1 min-w-[300px] max-w-[600px] flex justify-center items-center">
            <div className="relative w-full max-w-[600px] aspect-[4/3] rounded-2xl shadow-[0_25px_50px_rgba(0,0,0,0.1)] overflow-hidden transform perspective-[1000px] -rotate-y-[10deg] hover:rotate-y-0 transition-transform duration-500">
              <Image
                src="/img/hero/hero.png"
                alt="RoleReady preview"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
