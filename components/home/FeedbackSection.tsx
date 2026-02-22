'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Mail,
    MessageSquare,
    Sparkles,
    AlertCircle,
    CheckCircle2,
    Heart,
    Star,
    ThumbsUp,
    Lightbulb,
    Flag,
    ArrowRight,
    X,
    Users,
    Clock,
    Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

type FeedbackType = 'suggestion' | 'issue' | 'praise' | 'other';

interface FeedbackOption {
    id: FeedbackType;
    label: string;
    icon: any;
    color: string;
    placeholder: string;
}

const FEEDBACK_TYPES: FeedbackOption[] = [
    {
        id: 'suggestion',
        label: 'Suggestion',
        icon: Lightbulb,
        color: '#5693C1',
        placeholder: 'Share your ideas for improvement...'
    },
    {
        id: 'issue',
        label: 'Issue',
        icon: Flag,
        color: '#EF4444',
        placeholder: 'Describe the issue you encountered...'
    },
    {
        id: 'praise',
        label: 'Praise',
        icon: Heart,
        color: '#10B981',
        placeholder: 'Tell us what you love about RoleReady...'
    },
    {
        id: 'other',
        label: 'Other',
        icon: MessageSquare,
        color: '#8B5CF6',
        placeholder: 'Share your thoughts with us...'
    }
];

export default function FeedbackSection() {
    const [formData, setFormData] = useState({ email: '', message: '' });
    const [selectedType, setSelectedType] = useState<FeedbackType>('suggestion');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; message?: string }>({});
    const [charCount, setCharCount] = useState(0);
    const [isFocused, setIsFocused] = useState({ email: false, message: false });
    const [showSuccess, setShowSuccess] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    const validate = () => {
        const newErrors: { email?: string; message?: string } = {};
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.message) {
            newErrors.message = 'Message is required';
        } else if (formData.message.length < 10) {
            newErrors.message = 'Message must be at least 10 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    message: formData.message,
                    type: selectedType
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || 'Thank you for your feedback!', {
                    icon: '🎉',
                });
                setFormData({ email: '', message: '' });
                setCharCount(0);
                setErrors({});
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            } else {
                toast.error(data.error || 'Something went wrong.');
            }
        } catch (error) {
            toast.error('Connection error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getCurrentType = () => {
        return FEEDBACK_TYPES.find(t => t.id === selectedType) || FEEDBACK_TYPES[0];
    };

    return (
        <section className="relative py-24 overflow-hidden bg-gradient-to-b from-white via-gray-50 to-white">
            {/* Background decorative elements */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Gradient orbs */}
                <div className="absolute top-0 -left-20 w-96 h-96 bg-gradient-to-br from-[#5693C1]/10 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 -right-20 w-96 h-96 bg-gradient-to-tl from-[#5693C1]/10 to-transparent rounded-full blur-3xl" />

                {/* Grid pattern */}
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, #5693C1 1px, transparent 0)`,
                    backgroundSize: '40px 40px',
                    opacity: 0.03
                }} />

                {/* Animated lines */}
                <svg className="absolute inset-0 w-full h-full">
                    <motion.path
                        d="M0,200 Q400,150 800,200 T1600,200"
                        stroke="url(#gradientLine)"
                        strokeWidth="1"
                        fill="none"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.1 }}
                        transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
                    />
                    <defs>
                        <linearGradient id="gradientLine" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#5693C1" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#5693C1" stopOpacity="0.1" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                {/* Section Header */}
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5693C1]/10 text-[#5693C1] text-sm font-medium mb-6 border border-[#5693C1]/20"
                        >
                            <Sparkles className="w-4 h-4" />
                            Share Your Thoughts
                            <Sparkles className="w-4 h-4" />
                        </motion.div>

                        {/* Title */}
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                        >
                            We Value Your{' '}
                            <span className="relative">
                                <span className="bg-gradient-to-r from-[#5693C1] to-[#3a6a8c] bg-clip-text text-transparent">
                                    Feedback
                                </span>
                                <motion.span
                                    initial={{ width: 0 }}
                                    whileInView={{ width: '100%' }}
                                    transition={{ delay: 0.3, duration: 0.8 }}
                                    className="absolute -bottom-2 left-0 h-0.5 bg-gradient-to-r from-[#5693C1] to-[#3a6a8c] rounded-full"
                                />
                            </span>
                        </motion.h2>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-600 text-lg"
                        >
                            Help us shape the future of RoleReady. Your insights drive our improvements.
                        </motion.p>
                    </motion.div>
                </div>

                {/* Main Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl mx-auto"
                >
                    <div className="relative">
                        {/* Decorative corner elements */}
                        <div className="absolute -top-2 -left-2 w-24 h-24 border-l-2 border-t-2 border-[#5693C1]/20 rounded-tl-3xl" />
                        <div className="absolute -bottom-2 -right-2 w-24 h-24 border-r-2 border-b-2 border-[#5693C1]/20 rounded-br-3xl" />

                        {/* Main card */}
                        <div className="relative bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                            {/* Card header with gradient */}
                            <div className="relative h-24 bg-gradient-to-r from-[#5693C1]/5 to-[#3a6a8c]/5 border-b border-gray-100">
                                {/* Pattern overlay */}
                                <div className="absolute inset-0 opacity-[0.03]" style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20 L40 20 L20 40 Z' fill='%235693C1' fill-opacity='0.1'/%3E%3C/svg%3E")`
                                }} />

                                {/* Floating icons */}
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="absolute top-4 right-8"
                                >
                                    <MessageSquare className="w-6 h-6 text-[#5693C1]/20" />
                                </motion.div>
                                <motion.div
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute bottom-4 left-8"
                                >
                                    <Heart className="w-5 h-5 text-[#5693C1]/20" />
                                </motion.div>
                            </div>

                            <div className="p-8 md:p-10">
                                {/* Feedback Type Selection */}
                                <div className="mb-8">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        What would you like to share?
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {FEEDBACK_TYPES.map((type) => {
                                            const Icon = type.icon;
                                            const isSelected = selectedType === type.id;

                                            return (
                                                <motion.button
                                                    key={type.id}
                                                    type="button"
                                                    whileHover={{ scale: 1.02, y: -2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => setSelectedType(type.id)}
                                                    className={`relative p-3 rounded-xl border-2 transition-all duration-300 ${isSelected
                                                        ? 'border-[#5693C1] bg-[#5693C1]/5'
                                                        : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                                                        }`}
                                                >
                                                    <Icon
                                                        className="w-5 h-5 mx-auto mb-1"
                                                        style={{ color: isSelected ? type.color : '#9CA3AF' }}
                                                    />
                                                    <span className={`text-xs font-medium ${isSelected ? 'text-gray-900' : 'text-gray-500'
                                                        }`}>
                                                        {type.label}
                                                    </span>

                                                    {isSelected && (
                                                        <motion.div
                                                            layoutId="selectedType"
                                                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                                                            style={{ backgroundColor: type.color }}
                                                        />
                                                    )}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                                    {/* Email Field */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Mail className={`h-5 w-5 transition-colors duration-300 ${isFocused.email ? 'text-[#5693C1]' : 'text-gray-400'
                                                    }`} />
                                            </div>
                                            <input
                                                type="email"
                                                id="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                onFocus={() => setIsFocused(prev => ({ ...prev, email: true }))}
                                                onBlur={() => setIsFocused(prev => ({ ...prev, email: false }))}
                                                className={`block w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 ${errors.email
                                                    ? 'border-red-300 bg-red-50/50'
                                                    : isFocused.email
                                                        ? 'border-[#5693C1] bg-white'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    } rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5693C1]/20 transition-all duration-300`}
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                        <AnimatePresence>
                                            {errors.email && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="mt-2 text-sm text-red-600 flex items-center gap-1"
                                                >
                                                    <AlertCircle className="w-4 h-4" />
                                                    {errors.email}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Message Field */}
                                    <div>
                                        <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Your Message
                                        </label>
                                        <div className="relative">
                                            <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none">
                                                <MessageSquare className={`h-5 w-5 transition-colors duration-300 ${isFocused.message ? 'text-[#5693C1]' : 'text-gray-400'
                                                    }`} />
                                            </div>
                                            <textarea
                                                id="message"
                                                rows={5}
                                                value={formData.message}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, message: e.target.value });
                                                    setCharCount(e.target.value.length);
                                                }}
                                                onFocus={() => setIsFocused(prev => ({ ...prev, message: true }))}
                                                onBlur={() => setIsFocused(prev => ({ ...prev, message: false }))}
                                                className={`block w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 ${errors.message
                                                    ? 'border-red-300 bg-red-50/50'
                                                    : isFocused.message
                                                        ? 'border-[#5693C1] bg-white'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    } rounded-xl text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#5693C1]/20 transition-all duration-300`}
                                                placeholder={getCurrentType().placeholder}
                                            />

                                            {/* Character counter */}
                                            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                                                {charCount}/500
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {errors.message && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="mt-2 text-sm text-red-600 flex items-center gap-1"
                                                >
                                                    <AlertCircle className="w-4 h-4" />
                                                    {errors.message}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Submit Button */}
                                    <motion.button
                                        type="submit"
                                        disabled={isSubmitting}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="relative w-full overflow-hidden group"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#5693C1] to-[#3a6a8c] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <div className="relative flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#5693C1] to-[#3a6a8c] text-white rounded-xl font-semibold text-lg group-hover:shadow-xl transition-all duration-300">
                                            {isSubmitting ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    <span>Sending...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                    <span>Send Feedback</span>
                                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </div>
                                    </motion.button>

                                    {/* Success Message */}
                                    <AnimatePresence>
                                        {showSuccess && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                className="p-4 bg-green-50 rounded-xl border border-green-200 flex items-center gap-3"
                                            >
                                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-green-800">Thank you!</p>
                                                    <p className="text-sm text-green-600">Your feedback means a lot to us.</p>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </form>
                            </div>

                            {/* Footer with trust indicators */}
                            <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
                                <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Shield className="w-4 h-4 text-[#5693C1]" />
                                        <span>Your privacy matters</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Clock className="w-4 h-4 text-[#5693C1]" />
                                        <span>Typically replies within 24h</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Users className="w-4 h-4 text-[#5693C1]" />
                                        <span>1,000+ feedbacks received</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Bottom quote */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="text-center mt-12"
                >
                    <p className="text-gray-400 text-sm">
                        "The only way to do great work is to love what you do." – Steve Jobs
                    </p>
                </motion.div>
            </div>
        </section>
    );
}