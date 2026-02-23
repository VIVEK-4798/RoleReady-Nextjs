import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { ResumeData } from '@/types/resume';

// Register a standard sans-serif font for ATS compatibility
// React-pdf comes with standard PDF fonts which are very safe but limited.
// Helvetica is standard.

const styles = StyleSheet.create({
    page: {
        padding: 50,
        fontFamily: 'Helvetica',
        fontSize: 10,
        lineHeight: 1.5,
        color: '#000000',
    },
    header: {
        marginBottom: 20,
        borderBottom: '2pt solid #000000',
        paddingBottom: 10,
        textAlign: 'center',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 5,
    },
    contactLine: {
        fontSize: 9,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        borderBottom: '1pt solid #000000',
        marginBottom: 8,
        paddingTop: 5,
    },
    summary: {
        marginBottom: 10,
    },
    entryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontWeight: 'bold',
        marginBottom: 2,
    },
    entrySubHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontStyle: 'italic',
        marginBottom: 3,
    },
    bulletPoint: {
        flexDirection: 'row',
        marginLeft: 15,
        marginBottom: 2,
    },
    bullet: {
        width: 10,
    },
    bulletText: {
        flex: 1,
    },
    skillGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
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
                <View style={styles.contactLine}>
                    <Text>{data.contact.email}</Text>
                    {data.contact.phone && <Text>|  {data.contact.phone}</Text>}
                    {data.contact.location && <Text>|  {data.contact.location}</Text>}
                </View>
                {(data.contact.linkedin || data.contact.github) && (
                    <View style={[styles.contactLine, { marginTop: 3 }]}>
                        {data.contact.linkedin && <Text>LinkedIn: {data.contact.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</Text>}
                        {data.contact.github && <Text>{data.contact.linkedin ? '|  ' : ''}GitHub: {data.contact.github.replace(/^https?:\/\/(www\.)?/, '')}</Text>}
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
                    <View style={styles.skillGroup}>
                        {data.skills.map((skill, i) => (
                            <View key={i} style={styles.skillItem}>
                                <Text style={styles.skillName}>{skill.name}</Text>
                                <Text style={styles.skillLevel}>({skill.level})</Text>
                            </View>
                        ))}
                    </View>
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
                                    <Text style={styles.bulletText}>{line.replace(/^-\s*/, '')}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>
            )}

            {/* Projects */}
            {data.projects.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Projects</Text>
                    {data.projects.map((proj, i) => (
                        <View key={i} style={{ marginBottom: 8 }}>
                            <View style={styles.entryHeader}>
                                <Text>{proj.name}</Text>
                                <Text>{proj.startDate} - {proj.endDate}</Text>
                            </View>
                            {proj.technologies.length > 0 && (
                                <Text style={{ fontSize: 8, fontStyle: 'italic', marginBottom: 2 }}>
                                    Technologies: {proj.technologies.join(', ')}
                                </Text>
                            )}
                            {proj.description && <Text style={{ marginBottom: 2 }}>{proj.description}</Text>}
                            {(proj.url || proj.githubUrl) && (
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    {proj.url && <Text style={{ fontSize: 8, color: '#0000EE' }}>Link: {proj.url}</Text>}
                                    {proj.githubUrl && <Text style={{ fontSize: 8, color: '#0000EE' }}>Source: {proj.githubUrl}</Text>}
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
                        <View key={i} style={{ marginBottom: 5 }}>
                            <View style={styles.entryHeader}>
                                <Text>{edu.institution}</Text>
                                <Text>{edu.startDate} - {edu.endDate}</Text>
                            </View>
                            <View style={styles.entrySubHeader}>
                                <Text>{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}</Text>
                                {edu.grade && <Text>Grade: {edu.grade}</Text>}
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </Page>
    </Document>
);
