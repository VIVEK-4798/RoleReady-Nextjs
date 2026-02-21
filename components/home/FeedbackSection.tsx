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
    Zap,
    Award,
    MessageSquareHeart,
    Rocket,
    Bot,
    Cpu,
    Sparkle,
    ChevronRight,
    X
} from 'lucide-react';
import toast from 'react-hot-toast';

// Feedback type options
const feedbackTypes = [
    { id: 'general', label: 'General Feedback', icon: MessageSquareHeart, color: '#5693C1' },
    { id: 'bug', label: 'Bug Report', icon: AlertCircle, color: '#EF4444' },
    { id: 'feature', label: 'Feature Request', icon: Rocket, color: '#10B981' },
    { id: 'praise', label: 'Praise', icon: Heart, color: '#F59E0B' },
];

// Rating options
const ratings = [1, 2, 3, 4, 5];

export default function FeedbackSection() {
    const [formData, setFormData] = useState({
        email: '',
        message: '',
        type: 'general',
        rating: 0,
        name: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; message?: string; name?: string }>({});
    const [charCount, setCharCount] = useState(0);
    const [isFocused, setIsFocused] = useState<'email' | 'message' | 'name' | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [formData.message]);

    const validate = () => {
        const newErrors: { email?: string; message?: string; name?: string } = {};
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

        if (!formData.name) {
            newErrors.name = 'Name is required';
        } else if (formData.name.length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Invalid email format';
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
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || 'Thank you for your feedback!', {
                    icon: '🎉',
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                });
                setFormData({ email: '', message: '', type: 'general', rating: 0, name: '' });
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

    return (
        <section className="relative py-24 overflow-hidden bg-gradient-to-b from-white via-gray-50/50 to-white">
            {/* Enhanced animated background */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Gradient orbs */}
                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="absolute top-20 -right-20 w-96 h-96 rounded-full bg-gradient-to-bl from-[#5693C1]/10 via-blue-200/10 to-transparent blur-3xl"
                />
                <motion.div
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 50, 0],
                    }}
                    transition={{ duration: 25, repeat: Infinity }}
                    className="absolute bottom-20 -left-20 w-96 h-96 rounded-full bg-gradient-to-tr from-emerald-200/10 via-teal-200/10 to-transparent blur-3xl"
                />

                {/* Grid pattern */}
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, #5693C1 1px, transparent 0)`,
                    backgroundSize: '40px 40px',
                    opacity: 0.03
                }} />

                {/* Floating particles */}
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-[#5693C1]/20 rounded-full"
                        initial={{
                            x: Math.random() * 100 + "%",
                            y: Math.random() * 100 + "%",
                        }}
                        animate={{
                            y: [null, "-30%"],
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: 4 + Math.random() * 3,
                            repeat: Infinity,
                            delay: Math.random() * 2
                        }}
                    />
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    {/* Animated badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#5693C1]/10 to-purple-500/10 text-[#5693C1] text-sm font-medium mb-6 border border-[#5693C1]/20 backdrop-blur-sm"
                    >
                        <MessageSquareHeart className="w-4 h-4" />
                        We Value Your Voice
                        <Sparkle className="w-4 h-4" />
                    </motion.div>

                    {/* Title with animated gradient */}
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
                    >
                        We'd Love Your{' '}
                        <span className="relative">
                            <span className="bg-gradient-to-r from-[#5693C1] to-purple-500 bg-clip-text text-transparent">
                                Feedback
                            </span>
                            <motion.span
                                initial={{ width: 0 }}
                                whileInView={{ width: '100%' }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                                className="absolute -bottom-2 left-0 h-0.5 bg-gradient-to-r from-[#5693C1] to-purple-500 rounded-full"
                            />
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        viewport={{ once: true }}
                        className="text-gray-600 text-lg max-w-2xl mx-auto"
                    >
                        Help us shape the future of RoleReady. Share your thoughts, report issues, or suggest features.
                    </motion.p>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        viewport={{ once: true }}
                        className="flex items-center justify-center gap-6 mt-8"
                    >
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-1">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-white" />
                                ))}
                            </div>
                            <span className="text-sm text-gray-500">500+ responses this month</span>
                        </div>
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                            <span className="text-sm text-gray-500 ml-2">4.9 rating</span>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Main Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="max-w-3xl mx-auto"
                >
                    <div className="relative group">
                        {/* Animated gradient border */}
                        <motion.div
                            animate={{
                                opacity: [0.3, 0.5, 0.3],
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute -inset-0.5 bg-gradient-to-r from-[#5693C1] via-purple-500 to-[#5693C1] rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"
                        />

                        {/* Main card */}
                        <div className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
                            {/* Decorative header */}
                            <div className="relative h-32 bg-gradient-to-r from-[#5693C1] to-purple-500 overflow-hidden">
                                <div className="absolute inset-0 opacity-10">
                                    <svg className="w-full h-full">
                                        <pattern id="feedback-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                            <circle cx="20" cy="20" r="2" fill="white" />
                                        </pattern>
                                        <rect width="100%" height="100%" fill="url(#feedback-pattern)" />
                                    </svg>
                                </div>

                                {/* Floating icons */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute top-6 right-12"
                                >
                                    <MessageSquareHeart className="w-8 h-8 text-white/20" />
                                </motion.div>
                                <motion.div
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                                    className="absolute bottom-4 left-12"
                                >
                                    <Sparkle className="w-6 h-6 text-white/20" />
                                </motion.div>

                                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent" />
                            </div>

                            <div className="p-8 -mt-16 relative">
                                {/* Success message */}
                                <AnimatePresence>
                                    {showSuccess && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-green-800">Thank you!</p>
                                                <p className="text-sm text-green-600">Your feedback has been received.</p>
                                            </div>
                                            <button
                                                onClick={() => setShowSuccess(false)}
                                                className="ml-auto p-1 hover:bg-green-200 rounded-lg transition-colors"
                                            >
                                                <X className="w-4 h-4 text-green-600" />
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Feedback Type Selection */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            What would you like to share?
                                        </label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {feedbackTypes.map((type) => {
                                                const Icon = type.icon;
                                                const isSelected = formData.type === type.id;

                                                return (
                                                    <motion.button
                                                        key={type.id}
                                                        type="button"
                                                        whileHover={{ scale: 1.02, y: -2 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => setFormData({ ...formData, type: type.id })}
                                                        className={`relative p-3 rounded-xl border-2 transition-all duration-300 ${isSelected
                                                            ? 'border-transparent bg-gradient-to-br text-white'
                                                            : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                                                            }`}
                                                        style={{
                                                            background: isSelected ? `linear-gradient(135deg, ${type.color}, ${type.color}dd)` : undefined
                                                        }}
                                                    >
                                                        <Icon className={`w-5 h-5 mx-auto mb-1 ${isSelected ? 'text-white' : ''}`} style={{ color: isSelected ? 'white' : type.color }} />
                                                        <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                                                            {type.label}
                                                        </span>
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Rating */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                                            How would you rate your experience?
                                        </label>
                                        <div className="flex gap-2">
                                            {ratings.map((rating) => (
                                                <motion.button
                                                    key={rating}
                                                    type="button"
                                                    whileHover={{ scale: 1.1, y: -2 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => setFormData({ ...formData, rating })}
                                                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${formData.rating === rating
                                                        ? 'bg-gradient-to-br from-[#5693C1] to-purple-500 text-white shadow-lg'
                                                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100 border border-gray-200'
                                                        }`}
                                                >
                                                    <Star className={`w-5 h-5 ${formData.rating === rating ? 'fill-white' : ''}`} />
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Name Field */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Your Name
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <MessageSquareHeart className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <motion.input
                                                whileFocus={{ scale: 1.01 }}
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                onFocus={() => setIsFocused('name')}
                                                onBlur={() => setIsFocused(null)}
                                                className={`block w-full pl-11 pr-4 py-3 bg-gray-50 border-2 ${errors.name
                                                    ? 'border-red-200 focus:border-red-400'
                                                    : isFocused === 'name'
                                                        ? 'border-[#5693C1]'
                                                        : 'border-gray-200'
                                                    } rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1]/20 transition-all`}
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        {errors.name && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-2 text-sm text-red-600 flex items-center gap-1"
                                            >
                                                <AlertCircle className="w-4 h-4" /> {errors.name}
                                            </motion.p>
                                        )}
                                    </div>

                                    {/* Email Field */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <motion.input
                                                whileFocus={{ scale: 1.01 }}
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                onFocus={() => setIsFocused('email')}
                                                onBlur={() => setIsFocused(null)}
                                                className={`block w-full pl-11 pr-4 py-3 bg-gray-50 border-2 ${errors.email
                                                    ? 'border-red-200 focus:border-red-400'
                                                    : isFocused === 'email'
                                                        ? 'border-[#5693C1]'
                                                        : 'border-gray-200'
                                                    } rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5693C1]/20 transition-all`}
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                        {errors.email && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-2 text-sm text-red-600 flex items-center gap-1"
                                            >
                                                <AlertCircle className="w-4 h-4" /> {errors.email}
                                            </motion.p>
                                        )}
                                    </div>

                                    {/* Message Field */}
                                    <div>
                                        <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                                            Your Message
                                        </label>
                                        <div className="relative">
                                            <div className="absolute top-3 left-0 pl-4 flex items-start pointer-events-none">
                                                <MessageSquare className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <motion.textarea
                                                ref={textareaRef}
                                                whileFocus={{ scale: 1.01 }}
                                                id="message"
                                                name="message"
                                                rows={5}
                                                value={formData.message}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, message: e.target.value });
                                                    setCharCount(e.target.value.length);
                                                }}
                                                onFocus={() => setIsFocused('message')}
                                                onBlur={() => setIsFocused(null)}
                                                className={`block w-full pl-11 pr-4 py-3 bg-gray-50 border-2 ${errors.message
                                                    ? 'border-red-200 focus:border-red-400'
                                                    : isFocused === 'message'
                                                        ? 'border-[#5693C1]'
                                                        : 'border-gray-200'
                                                    } rounded-xl text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-[#5693C1]/20 transition-all min-h-[120px]`}
                                                placeholder="Tell us what you think..."
                                            />
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            {errors.message ? (
                                                <p className="text-sm text-red-600 flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4" /> {errors.message}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-gray-400">
                                                    Minimum 10 characters
                                                </p>
                                            )}
                                            <span className={`text-sm ${charCount >= 10 ? 'text-green-600' : 'text-gray-400'}`}>
                                                {charCount}/10
                                            </span>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <motion.button
                                        type="submit"
                                        disabled={isSubmitting}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="relative w-full overflow-hidden group"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#5693C1] to-purple-500 rounded-xl opacity-100 group-hover:opacity-90 transition-opacity" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                                        <div className="relative flex items-center justify-center gap-2 px-8 py-4 text-white font-bold text-lg">
                                            {isSubmitting ? (
                                                <>
                                                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                                                    <span>Sending...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5" />
                                                    <span>Send Feedback</span>
                                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </div>
                                    </motion.button>
                                </form>
                            </div>

                            {/* Footer */}
                            <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-4 border-t border-gray-100">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <CheckCircle2 className="w-4 h-4 text-[#5693C1]" />
                                        <span>Your feedback helps us grow and improve</span>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1">
                                            <Bot className="w-4 h-4 text-gray-400" />
                                            <span className="text-xs text-gray-400">AI-powered analysis</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Zap className="w-4 h-4 text-gray-400" />
                                            <span className="text-xs text-gray-400">Instant response</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Trust badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    viewport={{ once: true }}
                    className="flex flex-wrap items-center justify-center gap-8 mt-12"
                >
                    {['Privacy Guaranteed', 'No Spam', '24h Response', 'Team Reads All'].map((text, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                            <CheckCircle2 className="w-4 h-4 text-[#5693C1]" />
                            <span>{text}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}