'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
    Briefcase,
    GraduationCap,
    ArrowRight,
    Sparkles,
    Zap,
    TrendingUp,
    Users,
    Star,
    MapPin,
    Calendar,
    Building2,
    CheckCircle2,
    Target
} from 'lucide-react';

export default function LandingOpportunitiesSection() {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    // Mouse position for parallax effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rotateX = useTransform(mouseY, [-300, 300], [3, -3]);
    const rotateY = useTransform(mouseX, [-300, 300], [-3, 3]);

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>, cardId: string) => {
        if (hoveredCard === cardId) {
            const rect = event.currentTarget.getBoundingClientRect();
            const x = event.clientX - rect.left - rect.width / 2;
            const y = event.clientY - rect.top - rect.height / 2;
            mouseX.set(x);
            mouseY.set(y);
        }
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    const cards = [
        {
            id: 'jobs',
            title: 'Jobs',
            description: 'Browse role-aligned job opportunities tailored to your preparation level.',
            icon: Briefcase,
            href: '/jobs',
            gradient: 'from-blue-500/20 to-cyan-500/20',
            color: '#5693C1',
            lightColor: '#e8f0f7',
            stats: [
                { icon: Building2, label: 'Top companies', value: '500+' },
                { icon: MapPin, label: 'Locations', value: 'All major cities' },
                { icon: TrendingUp, label: 'Avg. salary', value: '₹12LPA' },
            ],
            features: [
                'Role-aligned matching',
                'Company insights',
                'Salary benchmarks'
            ]
        },
        {
            id: 'internships',
            title: 'Internships',
            description: 'Discover internships that match your preparation level and career goals.',
            icon: GraduationCap,
            href: '/internships',
            gradient: 'from-emerald-500/20 to-teal-500/20',
            color: '#10B981',
            lightColor: '#e6f7f0',
            stats: [
                { icon: Building2, label: 'Partner companies', value: '300+' },
                { icon: Calendar, label: 'Duration', value: '2-6 months' },
                { icon: Users, label: 'Live positions', value: '1.2k' },
            ],
            features: [
                'Stipend information',
                'PPO opportunities',
                'Flexible timing'
            ]
        }
    ];

    return (
        <section className="relative py-20 md:py-28 overflow-hidden bg-white">
            {/* Background decorative elements */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Gradient orbs */}
                <div className="absolute top-0 -left-20 w-96 h-96 bg-gradient-to-br from-blue-100/30 to-cyan-100/30 rounded-full blur-3xl" />
                <div className="absolute bottom-0 -right-20 w-96 h-96 bg-gradient-to-tl from-emerald-100/30 to-teal-100/30 rounded-full blur-3xl" />

                {/* Grid pattern */}
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, #5693C1 1px, transparent 0)`,
                    backgroundSize: '40px 40px',
                    opacity: 0.03
                }} />

                {/* Animated lines */}
                <svg className="absolute inset-0 w-full h-full">
                    <motion.path
                        d="M0,200 Q300,150 600,200 T1200,200"
                        stroke="url(#gradientLine)"
                        strokeWidth="1"
                        fill="none"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.1 }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                    />
                    <defs>
                        <linearGradient id="gradientLine" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#5693C1" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#10B981" stopOpacity="0.2" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#5693C1]/10 to-emerald-500/10 text-[#5693C1] text-sm font-medium mb-6 border border-[#5693C1]/20 backdrop-blur-sm"
                    >
                        <Sparkles className="w-4 h-4" />
                        Your Next Opportunity Awaits
                        <Zap className="w-4 h-4" />
                    </motion.div>

                    {/* Title */}
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                    >
                        Explore{' '}
                        <span className="relative">
                            <span className="bg-gradient-to-r from-[#5693C1] to-emerald-500 bg-clip-text text-transparent">
                                Opportunities
                            </span>
                            <motion.span
                                initial={{ width: 0 }}
                                whileInView={{ width: '100%' }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                                className="absolute -bottom-2 left-0 h-0.5 bg-gradient-to-r from-[#5693C1] to-emerald-500 rounded-full"
                            />
                        </span>
                    </motion.h2>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        viewport={{ once: true }}
                        className="text-gray-600 max-w-2xl mx-auto text-lg"
                    >
                        Once you're ready, explore curated roles and internships aligned with your preparation.
                        <span className="block text-sm text-gray-400 mt-2">
                            All opportunities are verified and regularly updated
                        </span>
                    </motion.p>
                </motion.div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {cards.map((card, index) => {
                        const Icon = card.icon;
                        const isHovered = hoveredCard === card.id;

                        return (
                            <motion.div
                                key={card.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                onHoverStart={() => setHoveredCard(card.id)}
                                onHoverEnd={() => setHoveredCard(null)}
                                onMouseMove={(e) => handleMouseMove(e, card.id)}
                                onMouseLeave={handleMouseLeave}
                                style={{
                                    rotateX: isHovered ? rotateX : 0,
                                    rotateY: isHovered ? rotateY : 0,
                                    perspective: 1200,
                                }}
                                className="group relative"
                            >
                                {/* Animated gradient border */}
                                <motion.div
                                    animate={{
                                        opacity: isHovered ? 0.5 : 0,
                                        scale: isHovered ? 1.02 : 1,
                                    }}
                                    className={`absolute -inset-0.5 bg-gradient-to-r ${card.gradient} rounded-2xl blur-md transition-opacity duration-500`}
                                />

                                {/* Main card */}
                                <div className={`relative bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden ${isHovered
                                        ? 'border-transparent shadow-2xl'
                                        : 'border-gray-100 shadow-lg hover:shadow-xl hover:border-gray-200'
                                    }`}>
                                    {/* Card header with gradient */}
                                    <div className="relative h-32 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
                                        {/* Decorative pattern */}
                                        <div className="absolute inset-0 opacity-[0.03]" style={{
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20h20v20H20z' fill='${card.color}' fill-opacity='0.1'/%3E%3C/svg%3E")`
                                        }} />

                                        {/* Icon */}
                                        <motion.div
                                            animate={{
                                                scale: isHovered ? 1.1 : 1,
                                                rotate: isHovered ? [0, -5, 5, 0] : 0,
                                            }}
                                            transition={{ duration: 0.3 }}
                                            className="absolute -bottom-8 left-8"
                                        >
                                            <div
                                                className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                                                style={{
                                                    background: `linear-gradient(135deg, ${card.color}, ${card.color}dd)`,
                                                }}
                                            >
                                                <Icon className="w-8 h-8 text-white" />
                                            </div>
                                        </motion.div>

                                        {/* Floating elements */}
                                        <motion.div
                                            animate={{
                                                y: [0, -5, 0],
                                            }}
                                            transition={{ duration: 3, repeat: Infinity }}
                                            className="absolute top-4 right-4"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center border border-white/50">
                                                <Target className="w-4 h-4" style={{ color: card.color }} />
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Card content */}
                                    <div className="pt-12 p-8">
                                        {/* Title and description */}
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                            {card.title}
                                        </h3>
                                        <p className="text-gray-600 mb-6">
                                            {card.description}
                                        </p>

                                        {/* Stats grid */}
                                        <div className="grid grid-cols-3 gap-4 mb-6">
                                            {card.stats.map((stat, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 + idx * 0.1 }}
                                                    className="text-center"
                                                >
                                                    <stat.icon className="w-4 h-4 mx-auto mb-1" style={{ color: card.color }} />
                                                    <div className="text-sm font-semibold text-gray-900">{stat.value}</div>
                                                    <div className="text-xs text-gray-400">{stat.label}</div>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Features list */}
                                        <div className="space-y-2 mb-6">
                                            {card.features.map((feature, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    whileInView={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 + idx * 0.1 + 0.3 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" style={{ color: card.color }} />
                                                    <span className="text-sm text-gray-600">{feature}</span>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* CTA Button */}
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Link
                                                href={card.href}
                                                className="group/btn relative overflow-hidden w-full inline-flex items-center justify-between gap-2 px-6 py-4 bg-white border-2 rounded-xl font-semibold transition-all duration-300"
                                                style={{
                                                    borderColor: isHovered ? card.color : '#e5e7eb',
                                                    color: isHovered ? card.color : '#374151'
                                                }}
                                                aria-label={`View ${card.title}`}
                                            >
                                                <span className="relative z-10 flex items-center gap-2">
                                                    View {card.title}
                                                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                                </span>
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-r"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${card.color}10, ${card.color}05)`,
                                                    }}
                                                    initial={{ x: '-100%' }}
                                                    whileHover={{ x: '100%' }}
                                                    transition={{ duration: 0.5 }}
                                                />
                                            </Link>
                                        </motion.div>

                                        {/* Bottom indicator */}
                                        <motion.div
                                            animate={{
                                                width: isHovered ? '100%' : '0%',
                                            }}
                                            className="absolute bottom-0 left-0 h-1 rounded-b-2xl"
                                            style={{
                                                background: `linear-gradient(90deg, ${card.color}, ${card.color}dd)`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Bottom trust indicators */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-wrap items-center justify-center gap-8 mt-16"
                >
                    {[
                        { icon: CheckCircle2, text: 'Verified opportunities' },
                        { icon: Users, text: '10k+ successful placements' },
                        { icon: Star, text: '4.9 rating from users' },
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                            <item.icon className="w-4 h-4 text-[#5693C1]" />
                            <span>{item.text}</span>
                        </div>
                    ))}
                </motion.div>

                {/* Decorative bottom line */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mt-16"
                />
            </div>
        </section>
    );
}