/**
 * Who Is It For Section
 * 
 * Displays target audience cards with stats.
 * Migrated from WhoIsItFor component in the old React project.
 */

'use client';

const audienceCards = [
  { 
    id: 1, 
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
      </svg>
    ),
    title: 'Final Year Students', 
    description: 'Preparing for campus placements and want to maximize your chances of landing your dream role.', 
    features: ['Campus placement optimization', 'Role-specific gap analysis', 'Interview readiness tracking'], 
    color: '#5693C1' 
  },
  { 
    id: 2, 
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    title: 'Pre-Final Year Students', 
    description: 'Getting a head start on placement preparation to be ahead of the curve when the time comes.', 
    features: ['Early skill gap identification', 'Long-term preparation roadmap', 'Summer internship optimization'], 
    color: '#4299E1' 
  },
  { 
    id: 3, 
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: 'Career Switchers', 
    description: 'Transitioning to a new domain and want to understand what skills you need to make the switch.', 
    features: ['Cross-domain skill mapping', 'Transition strategy planning', 'Industry validation'], 
    color: '#48BB78' 
  },
  { 
    id: 4, 
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: 'Mentors & Educators', 
    description: 'Guide students with data-driven insights and track their progress effectively.', 
    features: ['Student progress monitoring', 'Data-driven interventions', 'Curriculum alignment insights'], 
    color: '#ED8936' 
  }
];

const stats = [
  { number: '85%', label: 'Final Year Students', color: '#5693C1' },
  { number: '65%', label: 'Pre-Final Year Students', color: '#4299E1' },
  { number: '40%', label: 'Career Switchers', color: '#48BB78' },
  { number: '200+', label: 'Mentors & Educators', color: '#ED8936' }
];

export default function WhoIsItForSection() {
  return (
    <section className="py-24 md:py-32 px-5 md:px-8 bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-[56px] font-bold text-slate-900 mb-4">
            Who Is It For?
          </h2>
          <p className="text-lg text-slate-600 max-w-[700px] mx-auto">
            RoleReady is designed for anyone looking to understand their readiness and improve strategically.
          </p>
        </div>

        {/* Audience Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {audienceCards.map((card) => (
            <div 
              key={card.id}
              className="bg-white rounded-2xl p-8 md:p-10 border border-gray-200 transition-all duration-300 ease-out cursor-pointer hover:-translate-y-3 hover:shadow-[0_24px_48px_rgba(0,0,0,0.12)] group"
              style={{ 
                '--card-color': card.color,
              } as React.CSSProperties}
            >
              {/* Icon */}
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mb-8 transition-colors duration-300"
                style={{ 
                  backgroundColor: `${card.color}15`,
                  color: card.color 
                }}
              >
                {card.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl md:text-2xl font-semibold text-slate-900 mb-4">
                {card.title}
              </h3>

              {/* Description */}
              <p className="text-[15px] text-slate-600 mb-6 leading-relaxed">
                {card.description}
              </p>

              {/* Features */}
              <div className="mt-6 space-y-3">
                {card.features.map((feature, i) => (
                  <div key={i} className="flex items-start">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                      style={{ 
                        backgroundColor: `${card.color}15`,
                        color: card.color 
                      }}
                    >
                      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                    <span className="text-sm text-slate-600">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button 
                className="w-full mt-8 py-3 px-4 text-sm font-semibold rounded-lg transition-all duration-300 border-2 bg-transparent hover:text-white"
                style={{ 
                  borderColor: card.color,
                  color: card.color,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = card.color;
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = card.color;
                }}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="p-10 md:p-12 rounded-2xl bg-gradient-to-br from-[#5693C1]/[0.08] to-[#5693C1]/[0.04] border border-[#5693C1]/20 mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div 
                  className="text-4xl md:text-5xl font-bold mb-2"
                  style={{ color: stat.color }}
                >
                  {stat.number}
                </div>
                <div className="text-[15px] text-slate-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="max-w-[800px] mx-auto text-center">
          <div className="flex flex-wrap gap-5 justify-center">
            <button className="px-12 py-4 text-base font-semibold bg-[#5693C1] text-white border-none rounded-[10px] cursor-pointer transition-all duration-300 shadow-[0_8px_24px_rgba(86,147,193,0.3)] hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(86,147,193,0.4)]">
              Start Your Free Assessment
            </button>
            <button className="px-12 py-4 text-base font-semibold bg-transparent text-[#5693C1] border-2 border-[#5693C1] rounded-[10px] cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:bg-[#5693C1]/5">
              Schedule a Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
