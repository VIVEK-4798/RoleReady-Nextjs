'use client';

import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.scrollY > 400) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the top scroll
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <div className={`fixed bottom-24 right-6 md:bottom-28 md:right-8 z-50 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
      <button
        type="button"
        onClick={scrollToTop}
        className="p-3 bg-[#5693C1] text-white rounded-full shadow-lg hover:bg-[#4a80b0] hover:shadow-xl transition-all hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#5693C1] focus:ring-offset-2 flex items-center justify-center group"
        aria-label="Scroll to top"
      >
        <ChevronUp className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
      </button>
    </div>
  );
}
