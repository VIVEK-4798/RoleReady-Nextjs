/**
 * Landing Page Content Configuration
 * 
 * Defines role-aware content for different user segments (guest, student, mentor).
 */

import { Zap, Target, Users, BarChart3, Clock, Compass } from 'lucide-react';

export const LANDING_CONTENT = {
    student: {
        hero: {
            title: "Know if you're ready before you apply.",
            subtitle: "RoleReady - Placement Readiness. We're redefining placement preparation with a focus on readiness, not just applications.",
            primaryCTA: "Start Free Analysis",
            primaryHref: "/signup",
            secondaryCTA: "Learn How It Works"
        },
        problem: {
            badge: "What Makes Us Different",
            title: "Why Choose RoleReady?",
            subtitle: "We're redefining placement preparation with a focus on readiness, not just applications.",
            differences: [
                {
                    title: 'Not a Job Portal',
                    text: "We don't just list jobs. We prepare you to actually get them by focusing on readiness first."
                },
                {
                    title: 'Focuses on Readiness, Not Applications',
                    text: 'We help you understand when you\'re ready to apply, not just where to apply.'
                },
                {
                    title: 'Clear Explanations, Not Just Scores',
                    text: 'Every score comes with detailed reasoning so you know exactly what to improve.'
                },
                {
                    title: 'Structured Guidance, Not Guesswork',
                    text: 'Follow a personalized roadmap instead of random preparation strategies.'
                },
                {
                    title: 'Mentor-Backed Validation',
                    text: 'Get your skills verified by industry professionals for credibility.'
                },
            ]
        },
        howItWorks: {
            title: "How RoleReady Works",
            subtitle: "A simple 5-step process to transform your placement preparation from guesswork to precision.",
            steps: [
                {
                    title: 'Upload Resume & Select Target Role',
                    description: 'Start by uploading your resume and selecting the role you want to prepare for.',
                    features: ['Resume parsing', 'Role matching', 'Company alignment']
                },
                {
                    title: 'Skill Gap Analysis Based on Role Benchmarks',
                    description: 'Our AI analyzes your skills against industry benchmarks for your target role.',
                    features: ['Technical skills gap', 'Soft skills assessment', 'Industry benchmark comparison']
                },
                {
                    title: 'Get a Readiness Score with Clear Explanation',
                    description: 'Receive a comprehensive readiness score with detailed breakdown of each area.',
                    features: ['Overall readiness score', 'Area-wise breakdown', 'Improvement priorities']
                },
                {
                    title: 'Follow a Personalized Improvement Roadmap',
                    description: 'Get a step-by-step learning path tailored to bridge your specific skill gaps.',
                    features: ['Weekly learning plan', 'Resource recommendations', 'Progress tracking']
                },
                {
                    title: 'Mentor Review & Validation',
                    description: 'Get your progress validated by experienced mentors for added credibility.',
                    features: ['Expert feedback', 'Mock interviews', 'Career guidance']
                }
            ],
            finalCTATitle: "Ready to Transform Your Career?",
            finalCTASubtitle: "Start your journey to placement readiness today.",
            finalCTAButton: "Get Your Free Analysis"
        },
        whoIsItFor: {
            title: "Who is this for?",
            subtitle: "Tailored experience for every stage of your career journey.",
            order: ['student', 'mentor', 'university']
        },
        footerCTA: {
            title: "Prepare smarter, not harder.",
            subtitle: "Join thousands of students who achieved their dream roles with data-backed confidence.",
            primaryCTA: "Go to Dashboard",
            primaryHref: "/dashboard"
        }
    },
    mentor: {
        hero: {
            title: "Help Students Succeed with Confidence.",
            subtitle: "Provide structured validation, prioritize effort, and see measurable progress across your learners.",
            primaryCTA: "Open Mentor Dashboard",
            primaryHref: "/mentor",
            secondaryCTA: "Review Learners",
            secondaryHref: "/mentor/validations"
        },
        problem: {
            badge: "The Challenge Mentors Face",
            title: "Why Mentors Choose RoleReady?",
            subtitle: "Supporting students without structured insight makes it hard to prioritize who needs help and measure improvement.",
            differences: [
                {
                    title: 'Blind Guidance',
                    text: "Mentors advise without visibility into actual readiness levels."
                },
                {
                    title: 'No Impact Measurement',
                    text: "It’s difficult to track whether feedback truly improves outcomes."
                },
                {
                    title: 'Hidden Priority Learners',
                    text: "Students who urgently need help are not easily identifiable."
                },
                {
                    title: 'Scattered Efforts',
                    text: "Time is lost without a centralized validation workflow."
                },
                {
                    title: 'Credibility Unlock',
                    text: "Help students build verified credibility that employers trust."
                },
            ]
        },
        howItWorks: {
            title: "Focused Mentoring with Structured Insights",
            subtitle: "A structured system that helps mentors focus effort where it creates maximum improvement.",
            steps: [
                {
                    title: 'Students Define Goals & Profiles',
                    description: 'Students upload resumes and select targets, providing the context required for validation.',
                    features: ['Goal clarity', 'Contextual review', 'Standardized profiles']
                },
                {
                    title: 'System Identifies Gaps',
                    description: 'AI handles the initial heavy lifting by identifying technical and soft skill gaps.',
                    features: ['Gap visibility', 'Automated screening', 'Objective benchmarks']
                },
                {
                    title: 'Readiness Becomes Measurable',
                    description: 'Access quantified readiness scores that show exactly where a student stands today.',
                    features: ['Data-driven insights', 'Objective scores', 'Visual progress']
                },
                {
                    title: 'Improvement Paths are Tracked',
                    description: 'Follow-up on student progress as they complete their personalized learning roadmaps.',
                    features: ['Progress tracking', 'Milestone monitoring', 'Accountability']
                },
                {
                    title: 'Mentors Validate & Unlock Credibility',
                    description: 'Mentors provide final validation, unlocking verified status for the student.',
                    features: ['Expert validation', 'Quality assurance', 'Impactful feedback']
                }
            ],
            finalCTATitle: "Ready to Empower Your Learners?",
            finalCTASubtitle: "Focus your effort where it matters most and track measurable student growth.",
            finalCTAButton: "Go to Mentor Dashboard"
        },
        whoIsItFor: {
            title: "Who is this for?",
            subtitle: "Tools for mentors, educators, and placement cells to drive student success.",
            order: ['mentor', 'student', 'university']
        },
        footerCTA: {
            title: "Drive student success with structured data.",
            subtitle: "Provide structured validation, prioritize your effort, and see measurable progress across all your learners.",
            primaryCTA: "Go to Mentor Dashboard",
            primaryHref: "/mentor"
        }
    }
};
