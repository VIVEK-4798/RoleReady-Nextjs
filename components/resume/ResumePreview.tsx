'use client';

import React from 'react';
import { ResumeData } from '@/types/resume';
import { Download, Printer, ArrowLeft, Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react';
import Link from 'next/link';

interface ResumePreviewProps {
    data: ResumeData;
    onDownload: () => void;
    isDownloading?: boolean;
}

export default function ResumePreview({ data, onDownload, isDownloading }: ResumePreviewProps) {
    const { contact, summary, skills, experience, projects, education } = data;

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
            {/* Header Actions */}
            <div className="flex items-center justify-between no-print">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100">
                        Generated from RoleReady Profile
                    </div>
                    <button
                        onClick={onDownload}
                        disabled={isDownloading}
                        className="flex items-center gap-2 px-6 py-2 bg-[#5693C1] text-white rounded-xl font-semibold hover:bg-[#4a80b0] transition-all shadow-md disabled:opacity-50"
                    >
                        {isDownloading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Generating PDF...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                Download PDF
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Resume Document Wrapper */}
            <div className="bg-white p-[1in] shadow-2xl border border-gray-100 min-h-[11in] w-full max-w-[8.5in] mx-auto print:shadow-none print:border-none print:p-0">
                <div className="space-y-6 text-black font-serif">
                    {/* Header */}
                    {/* Header */}
                    {/* Header */}
                    <div className="text-center space-y-3 mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">{data.contact.fullName}</h1>
                        {data.contact.headline && (
                            <p className="text-blue-600 font-bold uppercase tracking-widest text-xs mt-3 mb-1">{data.contact.headline}</p>
                        )}
                        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-gray-500 pt-1">
                            <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {data.contact.email}</span>
                            {data.contact.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {data.contact.phone}</span>}
                            {data.contact.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {data.contact.location}</span>}
                        </div>
                        <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs font-semibold text-blue-700">
                            {data.contact.linkedin && (
                                <a href={data.contact.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                                    <Linkedin className="w-3 h-3" /> LinkedIn
                                </a>
                            )}
                            {data.contact.github && (
                                <a href={data.contact.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                                    <Github className="w-3 h-3" /> GitHub
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Summary */}
                    {summary && (
                        <section className="space-y-2">
                            <h2 className="text-lg font-bold uppercase border-b border-black">Professional Summary</h2>
                            <p className="text-sm leading-relaxed text-justify">{summary}</p>
                        </section>
                    )}

                    {/* Skills */}
                    {skills.length > 0 && (
                        <section className="space-y-2">
                            <h2 className="text-lg font-bold uppercase border-b border-black">Technical Skills</h2>
                            <div className="text-sm space-y-1">
                                {data.groupedSkills ? (
                                    Object.entries(data.groupedSkills).map(([category, skillList], i) => (
                                        <div key={i}>
                                            <span className="font-bold">{category}:</span> {skillList.join(', ')}
                                        </div>
                                    ))
                                ) : (
                                    skills.map(s => s.name).join(', ')
                                )}
                            </div>
                        </section>
                    )}

                    {/* Experience */}
                    {experience.length > 0 && (
                        <section className="space-y-3">
                            <h2 className="text-lg font-bold uppercase border-b border-black">Professional Experience</h2>
                            <div className="space-y-4">
                                {experience.map((exp, i) => (
                                    <div key={i} className="space-y-1">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="font-bold">{exp.title}</h3>
                                            <span className="text-sm italic">{exp.startDate} - {exp.endDate}</span>
                                        </div>
                                        <div className="flex justify-between items-baseline italic text-sm">
                                            <span>{exp.company}</span>
                                            {exp.location && <span>{exp.location}</span>}
                                        </div>
                                        {exp.description && (
                                            <ul className="list-disc ml-5 text-sm space-y-1 mt-1">
                                                {exp.description.split('\n').filter(l => l.trim()).map((line, idx) => (
                                                    <li key={idx}>{line}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Projects */}
                    {projects.length > 0 && (
                        <section className="space-y-3">
                            <h2 className="text-lg font-bold uppercase border-b border-black">Key Projects</h2>
                            <div className="space-y-4">
                                {projects.map((proj, i) => (
                                    <div key={i} className="space-y-1">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="font-bold">{proj.name}</h3>
                                            <span className="text-sm italic">{proj.startDate} - {proj.endDate}</span>
                                        </div>
                                        {proj.technologies.length > 0 && (
                                            <p className="text-xs font-semibold italic opacity-80">
                                                Technologies: {proj.technologies.join(', ')}
                                            </p>
                                        )}
                                        {proj.description && (
                                            <ul className="list-disc ml-5 text-sm space-y-1 mt-1">
                                                {proj.description.split('\n').filter(l => l.trim()).map((line, idx) => (
                                                    <li key={idx}>{line}</li>
                                                ))}
                                            </ul>
                                        )}
                                        {(proj.url || proj.githubUrl) && (
                                            <div className="text-[10px] flex gap-3 text-gray-900 font-medium">
                                                {proj.url && <a href={proj.url} target="_blank" rel="noopener noreferrer" className="hover:underline">Live Demo</a>}
                                                {proj.githubUrl && <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">Source Code</a>}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Education */}
                    {education.length > 0 && (
                        <section className="space-y-3">
                            <h2 className="text-lg font-bold uppercase border-b border-black">Education</h2>
                            <div className="space-y-3">
                                {education.map((edu, i) => (
                                    <div key={i} className="space-y-0.5">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="font-bold">{edu.institution}</h3>
                                            <span className="text-sm italic">{edu.startDate} - {edu.endDate}</span>
                                        </div>
                                        <div className="text-sm">
                                            <span>{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</span>
                                            {edu.grade && <span className="ml-2 font-medium whitespace-nowrap"> · Grade: {edu.grade}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Certifications */}
                    {data.certificates && data.certificates.length > 0 && (
                        <section className="space-y-2">
                            <h2 className="text-lg font-bold uppercase border-b border-black">Certifications</h2>
                            <div className="space-y-1 text-sm">
                                {data.certificates.map((cert, i) => (
                                    <div key={i}>
                                        <span className="font-bold">{cert.name}</span> – {cert.issuer} {cert.date ? `(${cert.date})` : ''}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Achievements */}
                    {data.achievements && data.achievements.length > 0 && (
                        <section className="space-y-2">
                            <h2 className="text-lg font-bold uppercase border-b border-black">Achievements & Awards</h2>
                            <div className="space-y-3">
                                {data.achievements.map((ach, i) => (
                                    <div key={i} className="text-sm">
                                        <div><span className="font-bold">{ach.title}</span> – {ach.issuer} {ach.date ? `(${ach.date})` : ''}</div>
                                        {ach.description && <p className="text-xs text-gray-600 mt-0.5 ml-4">{ach.description}</p>}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>

            <p className="text-center text-gray-400 text-xs mt-8 no-print pb-12">
                Note: This template is designed for ATS systems. Selectable text and clean structure ensure maximum compatibility.
            </p>

            <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
        </div>
    );
}
