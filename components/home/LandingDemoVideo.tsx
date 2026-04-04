'use client';

import { useState, useRef, useEffect } from "react";
import { Play } from "lucide-react";

export default function LandingDemoVideo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Intersection Observer to only load component when in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, we can disconnect the observer
          if (containerRef.current) {
            observer.unobserve(containerRef.current);
          }
        }
      },
      { rootMargin: "200px" } // Load slightly before it comes into view
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handlePlay = async () => {
    if (!videoRef.current) return;
    
    // Optimistic UI update
    setIsPlaying(true);
    
    try {
      await videoRef.current.play();
    } catch (err) {
      console.error("Autoplay prevented or video not found:", err);
      // Let the user rely on native controls if programmatic play fails
    }
  };

  return (
    <section className="py-20 bg-white" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            See How Readiness Works
          </h2>
          <p className="text-lg text-gray-600">
            Calculate your readiness score in seconds. 
            <br/>
            <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full">
              10-second demo — no signup required
            </span>
          </p>
        </div>

        {isVisible && (
          <div className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-900/5 bg-gray-900 aspect-video group custom-video-container">
            
            {/* Custom Play UI Overlay */}
            <div
              className={`absolute inset-0 z-20 cursor-pointer overflow-hidden transition-opacity duration-500 ${isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              onClick={handlePlay}
            >
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">Loading thumbnail...</span>
              </div>
              <img
                src="/img/video-thumbnail.png"
                alt="Readiness Demo"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:opacity-100"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-80"></div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-[#5693C1] transition-all duration-300">
                  <Play className="w-8 h-8 ml-1 fill-white" />
                </div>
              </div>
            </div>

            {/* Video Element */}
            <video
              ref={videoRef}
              src="/videos/readiness-demo.mp4"
              controls
              playsInline
              preload="auto"
              className="w-full h-full absolute inset-0 object-cover z-10 bg-black"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}
      </div>
    </section>
  );
}
