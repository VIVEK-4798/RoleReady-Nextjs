import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { ResumeData } from '@/types/resume';

// Register a standard sans-serif font for ATS compatibility
// React-pdf comes with standard PDF fonts which are very safe but limited.
// Helvetica is standard.

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 9.5, // Reduced from 10
        lineHeight: 1.3, // Reduced from 1.5
        color: '#000000',
    },
    header: {
        marginBottom: 12, // Reduced from 20
        borderBottom: '1.5pt solid #000000', // Thinner line
        paddingBottom: 8,
        textAlign: 'center',
    },
    name: {
        fontSize: 22, // Reduced from 24
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    contactLine: {
        fontSize: 8.5,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    section: {
        marginBottom: 10, // Reduced from 15
    },
    sectionTitle: {
        fontSize: 11, // Reduced from 12
        fontWeight: 'bold',
        textTransform: 'uppercase',
        borderBottom: '1pt solid #000000',
        marginBottom: 6,
        paddingTop: 3,
    },
    summary: {
        marginBottom: 6,
        textAlign: 'justify', // Cleaner for density
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontWeight: 'bold',
        marginBottom: 1,
    },
    entrySubHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontStyle: 'italic',
        fontSize: 9,
        marginBottom: 2,
    },
    bulletPoint: {
        flexDirection: 'row',
        marginLeft: 12,
        marginBottom: 1,
    },
    bullet: {
        width: 8,
    },
    bulletText: {
        flex: 1,
        fontSize: 9,
    },
    skillGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    skillItem: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 2,
    },
    skillName: {
        fontWeight: 'bold',
    },
    skillLevel: {
        fontSize: 8,
        fontStyle: 'italic',
        color: '#666666',
    },
});

export const ResumePDF = ({ data }: { data: ResumeData }) => (
    <Document title={`Resume - ${data.contact.fullName}`}>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.name}>{data.contact.fullName}</Text>
                {data.contact.headline && (
                    <Text style={{ fontSize: 11, color: '#4a80b0', fontWeight: 'bold', textAlign: 'center', marginTop: 8, marginBottom: 6 }}>
                        {data.contact.headline}
                    </Text>
                )}
                <View style={styles.contactLine}>
                    <Text>{data.contact.email}</Text>
                    {data.contact.phone && <Text>|  {data.contact.phone}</Text>}
                    {data.contact.location && <Text>|  {data.contact.location}</Text>}
                </View>
                {(data.contact.linkedin || data.contact.github || data.contact.portfolio) && (
                    <View style={[styles.contactLine, { marginTop: 3 }]}>
                        {data.contact.linkedin && <Text>LinkedIn: {data.contact.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</Text>}
                        {data.contact.github && <Text>{data.contact.linkedin ? '  |  ' : ''}GitHub: {data.contact.github.replace(/^https?:\/\/(www\.)?/, '')}</Text>}
                        {data.contact.portfolio && <Text>{(data.contact.linkedin || data.contact.github) ? '  |  ' : ''}Portfolio: {data.contact.portfolio.replace(/^https?:\/\/(www\.)?/, '')}</Text>}
                    </View>
                )}
            </View>

            {/* Summary */}
            {data.summary && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Professional Summary</Text>
                    <Text style={styles.summary}>{data.summary}</Text>
                </View>
            )}

            {/* Skills */}
            {data.skills.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Technical Skills</Text>
                    {data.groupedSkills ? (
                        <View style={{ gap: 4 }}>
                            {Object.entries(data.groupedSkills).map(([category, skillList], i) => (
                                <Text key={i} style={{ fontSize: 10 }}>
                                    <Text style={{ fontWeight: 'bold' }}>{category}: </Text>
                                    {skillList.join(', ')}
                                </Text>
                            ))}
                        </View>
                    ) : (
                        <View style={styles.skillGroup}>
                            <Text style={{ fontSize: 10 }}>
                                {data.skills.map(s => s.name).join(', ')}
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* Experience */}
            {data.experience.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Professional Experience</Text>
                    {data.experience.map((exp, i) => (
                        <View key={i} style={{ marginBottom: 10 }}>
                            <View style={styles.entryHeader}>
                                <Text>{exp.title}</Text>
                                <Text>{exp.startDate} - {exp.endDate}</Text>
                            </View>
                            <View style={styles.entrySubHeader}>
                                <Text>{exp.company}</Text>
                                <Text>{exp.location}</Text>
                            </View>
                            {exp.description && exp.description.split('\n').filter(l => l.trim()).map((line, idx) => (
                                <View key={idx} style={styles.bulletPoint}>
                                    <Text style={styles.bullet}>{'\u2022'}</Text>
                                    <Text style={styles.bulletText}>{line}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>
            )}

            {/* Projects */}
            {data.projects.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Key Projects</Text>
                    {data.projects.map((proj, i) => (
                        <View key={i} style={{ marginBottom: 10 }}>
                            <View style={styles.entryHeader}>
                                <Text>{proj.name}</Text>
                                <Text>{proj.startDate} - {proj.endDate}</Text>
                            </View>
                            {proj.technologies.length > 0 && (
                                <Text style={{ fontSize: 9, fontStyle: 'italic', marginBottom: 3, opacity: 0.8 }}>
                                    Technologies: {proj.technologies.join(', ')}
                                </Text>
                            )}
                            {proj.description && proj.description.split('\n').filter(l => l.trim()).map((line, idx) => (
                                <View key={idx} style={styles.bulletPoint}>
                                    <Text style={styles.bullet}>{'\u2022'}</Text>
                                    <Text style={styles.bulletText}>{line}</Text>
                                </View>
                            ))}
                            {(proj.url || proj.githubUrl) && (
                                <View style={{ flexDirection: 'row', gap: 10, marginLeft: 15, marginTop: 2 }}>
                                    {proj.url && <Text style={{ fontSize: 8, color: '#000000' }}>Live: {proj.url.replace(/^https?:\/\/(www\.)?/, '')}</Text>}
                                    {proj.githubUrl && <Text style={{ fontSize: 8, color: '#000000' }}>Source: {proj.githubUrl.replace(/^https?:\/\/(www\.)?/, '')}</Text>}
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            )}

            {/* Education */}
            {data.education.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Education</Text>
                    {data.education.map((edu, i) => (
                        <View key={i} style={{ marginBottom: 8 }}>
                            <View style={styles.entryHeader}>
                                <Text>{edu.institution}</Text>
                                <Text>{edu.startDate} - {edu.endDate}</Text>
                            </View>
                            <Text style={{ fontSize: 10 }}>
                                {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}{edu.grade ? ` · Grade: ${edu.grade}` : ''}
                            </Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Merged or Separate Certifications & Achievements */}
            {(data as any).shouldMergeSmallSections ? (
                (data.certificates || data.achievements) && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Certifications & Achievements</Text>
                        {data.certificates?.map((cert, i) => (
                            <View key={`cert-${i}`} style={{ marginBottom: 3 }}>
                                <Text style={{ fontSize: 9 }}>
                                    <Text style={{ fontWeight: 'bold' }}>{cert.name}</Text> – {cert.issuer} {cert.date ? `(${cert.date})` : ''}
                                </Text>
                            </View>
                        ))}
                        {data.achievements?.map((ach, i) => (
                            <View key={`ach-${i}`} style={{ marginBottom: 4, marginTop: data.certificates?.length ? 2 : 0 }}>
                                <Text style={{ fontSize: 9 }}>
                                    <Text style={{ fontWeight: 'bold' }}>{ach.title}</Text> – {ach.issuer} {ach.date ? `(${ach.date})` : ''}
                                </Text>
                                {ach.description && (
                                    <Text style={{ fontSize: 8.5, color: '#444444', marginLeft: 10 }}>{ach.description}</Text>
                                )}
                            </View>
                        ))}
                    </View>
                )
            ) : (
                <>
                    {/* Certifications */}
                    {data.certificates && data.certificates.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Certifications</Text>
                            {data.certificates.map((cert, i) => (
                                <View key={i} style={{ marginBottom: 3 }}>
                                    <Text style={{ fontSize: 9 }}>
                                        <Text style={{ fontWeight: 'bold' }}>{cert.name}</Text> – {cert.issuer} {cert.date ? `(${cert.date})` : ''}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Achievements */}
                    {data.achievements && data.achievements.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Achievements & Awards</Text>
                            {data.achievements.map((ach, i) => (
                                <View key={i} style={{ marginBottom: 4 }}>
                                    <Text style={{ fontSize: 9 }}>
                                        <Text style={{ fontWeight: 'bold' }}>{ach.title}</Text> – {ach.issuer} {ach.date ? `(${ach.date})` : ''}
                                    </Text>
                                    {ach.description && (
                                        <Text style={{ fontSize: 8.5, color: '#444444', marginLeft: 10 }}>{ach.description}</Text>
                                    )}
                                </View>
                            ))}
                        </View>
                    )}
                </>
            )}
        </Page>
    </Document>
);
