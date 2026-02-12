/**
 * Benchmarks Seed Data
 * 
 * Maps skills to roles with importance, weight, and required levels
 * 
 * Importance: 'critical' | 'important' | 'nice-to-have'
 * Required Level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
 * Weight: 0-100 (percentage contribution to role readiness)
 */

export const benchmarksData = [
    // ============================================
    // FULL STACK DEVELOPER
    // ============================================
    {
        roleName: 'Full Stack Developer',
        skills: [
            { skillName: 'JavaScript', importance: 'critical', weight: 15, requiredLevel: 'advanced' },
            { skillName: 'TypeScript', importance: 'critical', weight: 12, requiredLevel: 'advanced' },
            { skillName: 'React', importance: 'critical', weight: 12, requiredLevel: 'advanced' },
            { skillName: 'Node.js', importance: 'critical', weight: 12, requiredLevel: 'advanced' },
            { skillName: 'HTML', importance: 'critical', weight: 8, requiredLevel: 'advanced' },
            { skillName: 'CSS', importance: 'critical', weight: 8, requiredLevel: 'advanced' },
            { skillName: 'MongoDB', importance: 'important', weight: 8, requiredLevel: 'intermediate' },
            { skillName: 'PostgreSQL', importance: 'important', weight: 7, requiredLevel: 'intermediate' },
            { skillName: 'REST API', importance: 'critical', weight: 10, requiredLevel: 'advanced' },
            { skillName: 'Git', importance: 'critical', weight: 5, requiredLevel: 'advanced' },
            { skillName: 'Docker', importance: 'nice-to-have', weight: 3, requiredLevel: 'beginner' },
        ],
    },

    // ============================================
    // FRONTEND DEVELOPER
    // ============================================
    {
        roleName: 'Frontend Developer',
        skills: [
            { skillName: 'JavaScript', importance: 'critical', weight: 18, requiredLevel: 'expert' },
            { skillName: 'TypeScript', importance: 'critical', weight: 15, requiredLevel: 'advanced' },
            { skillName: 'React', importance: 'critical', weight: 18, requiredLevel: 'expert' },
            { skillName: 'HTML', importance: 'critical', weight: 12, requiredLevel: 'expert' },
            { skillName: 'CSS', importance: 'critical', weight: 12, requiredLevel: 'expert' },
            { skillName: 'Tailwind CSS', importance: 'important', weight: 8, requiredLevel: 'advanced' },
            { skillName: 'Next.js', importance: 'important', weight: 10, requiredLevel: 'advanced' },
            { skillName: 'Git', importance: 'critical', weight: 5, requiredLevel: 'advanced' },
            { skillName: 'Webpack', importance: 'nice-to-have', weight: 2, requiredLevel: 'intermediate' },
        ],
    },

    // ============================================
    // BACKEND DEVELOPER
    // ============================================
    {
        roleName: 'Backend Developer',
        skills: [
            { skillName: 'Node.js', importance: 'critical', weight: 18, requiredLevel: 'expert' },
            { skillName: 'TypeScript', importance: 'critical', weight: 12, requiredLevel: 'advanced' },
            { skillName: 'Express.js', importance: 'critical', weight: 12, requiredLevel: 'advanced' },
            { skillName: 'MongoDB', importance: 'critical', weight: 12, requiredLevel: 'advanced' },
            { skillName: 'PostgreSQL', importance: 'important', weight: 10, requiredLevel: 'advanced' },
            { skillName: 'REST API', importance: 'critical', weight: 15, requiredLevel: 'expert' },
            { skillName: 'GraphQL', importance: 'important', weight: 8, requiredLevel: 'intermediate' },
            { skillName: 'Docker', importance: 'important', weight: 8, requiredLevel: 'intermediate' },
            { skillName: 'Git', importance: 'critical', weight: 5, requiredLevel: 'advanced' },
        ],
    },

    // ============================================
    // MOBILE APP DEVELOPER
    // ============================================
    {
        roleName: 'Mobile App Developer',
        skills: [
            { skillName: 'React Native', importance: 'critical', weight: 20, requiredLevel: 'expert' },
            { skillName: 'JavaScript', importance: 'critical', weight: 15, requiredLevel: 'advanced' },
            { skillName: 'TypeScript', importance: 'critical', weight: 12, requiredLevel: 'advanced' },
            { skillName: 'Flutter', importance: 'important', weight: 15, requiredLevel: 'advanced' },
            { skillName: 'Dart', importance: 'important', weight: 10, requiredLevel: 'advanced' },
            { skillName: 'iOS', importance: 'important', weight: 8, requiredLevel: 'intermediate' },
            { skillName: 'Android', importance: 'important', weight: 8, requiredLevel: 'intermediate' },
            { skillName: 'REST API', importance: 'critical', weight: 10, requiredLevel: 'advanced' },
            { skillName: 'Git', importance: 'critical', weight: 2, requiredLevel: 'advanced' },
        ],
    },

    // ============================================
    // DEVOPS ENGINEER
    // ============================================
    {
        roleName: 'DevOps Engineer',
        skills: [
            { skillName: 'Docker', importance: 'critical', weight: 18, requiredLevel: 'expert' },
            { skillName: 'Kubernetes', importance: 'critical', weight: 18, requiredLevel: 'expert' },
            { skillName: 'AWS', importance: 'critical', weight: 15, requiredLevel: 'advanced' },
            { skillName: 'CI/CD', importance: 'critical', weight: 15, requiredLevel: 'expert' },
            { skillName: 'Jenkins', importance: 'important', weight: 10, requiredLevel: 'advanced' },
            { skillName: 'Terraform', importance: 'important', weight: 10, requiredLevel: 'advanced' },
            { skillName: 'Git', importance: 'critical', weight: 8, requiredLevel: 'expert' },
            { skillName: 'Linux', importance: 'critical', weight: 6, requiredLevel: 'advanced' },
        ],
    },

    // ============================================
    // DATA SCIENTIST
    // ============================================
    {
        roleName: 'Data Scientist',
        skills: [
            { skillName: 'Python', importance: 'critical', weight: 20, requiredLevel: 'expert' },
            { skillName: 'Machine Learning', importance: 'critical', weight: 18, requiredLevel: 'expert' },
            { skillName: 'Pandas', importance: 'critical', weight: 12, requiredLevel: 'advanced' },
            { skillName: 'NumPy', importance: 'critical', weight: 10, requiredLevel: 'advanced' },
            { skillName: 'TensorFlow', importance: 'important', weight: 12, requiredLevel: 'advanced' },
            { skillName: 'PyTorch', importance: 'important', weight: 10, requiredLevel: 'advanced' },
            { skillName: 'Data Analysis', importance: 'critical', weight: 10, requiredLevel: 'expert' },
            { skillName: 'Data Visualization', importance: 'important', weight: 8, requiredLevel: 'advanced' },
        ],
    },

    // ============================================
    // DATA ANALYST
    // ============================================
    {
        roleName: 'Data Analyst',
        skills: [
            { skillName: 'SQL', importance: 'critical', weight: 20, requiredLevel: 'expert' },
            { skillName: 'Python', importance: 'critical', weight: 18, requiredLevel: 'advanced' },
            { skillName: 'Data Analysis', importance: 'critical', weight: 18, requiredLevel: 'expert' },
            { skillName: 'Data Visualization', importance: 'critical', weight: 15, requiredLevel: 'advanced' },
            { skillName: 'Pandas', importance: 'important', weight: 12, requiredLevel: 'advanced' },
            { skillName: 'Excel', importance: 'important', weight: 10, requiredLevel: 'advanced' },
            { skillName: 'Google Analytics', importance: 'nice-to-have', weight: 7, requiredLevel: 'intermediate' },
        ],
    },

    // ============================================
    // MACHINE LEARNING ENGINEER
    // ============================================
    {
        roleName: 'Machine Learning Engineer',
        skills: [
            { skillName: 'Python', importance: 'critical', weight: 18, requiredLevel: 'expert' },
            { skillName: 'Machine Learning', importance: 'critical', weight: 20, requiredLevel: 'expert' },
            { skillName: 'Deep Learning', importance: 'critical', weight: 15, requiredLevel: 'expert' },
            { skillName: 'TensorFlow', importance: 'critical', weight: 15, requiredLevel: 'expert' },
            { skillName: 'PyTorch', importance: 'critical', weight: 15, requiredLevel: 'expert' },
            { skillName: 'Scikit-learn', importance: 'important', weight: 10, requiredLevel: 'advanced' },
            { skillName: 'Docker', importance: 'important', weight: 7, requiredLevel: 'intermediate' },
        ],
    },

    // ============================================
    // UI/UX DESIGNER
    // ============================================
    {
        roleName: 'UI/UX Designer',
        skills: [
            { skillName: 'Figma', importance: 'critical', weight: 25, requiredLevel: 'expert' },
            { skillName: 'UI/UX Design', importance: 'critical', weight: 25, requiredLevel: 'expert' },
            { skillName: 'Wireframing', importance: 'critical', weight: 15, requiredLevel: 'advanced' },
            { skillName: 'Prototyping', importance: 'critical', weight: 15, requiredLevel: 'advanced' },
            { skillName: 'Adobe XD', importance: 'important', weight: 10, requiredLevel: 'advanced' },
            { skillName: 'HTML', importance: 'nice-to-have', weight: 5, requiredLevel: 'beginner' },
            { skillName: 'CSS', importance: 'nice-to-have', weight: 5, requiredLevel: 'beginner' },
        ],
    },

    // ============================================
    // PRODUCT MANAGER
    // ============================================
    {
        roleName: 'Product Manager',
        skills: [
            { skillName: 'Agile', importance: 'critical', weight: 20, requiredLevel: 'expert' },
            { skillName: 'Scrum', importance: 'critical', weight: 15, requiredLevel: 'advanced' },
            { skillName: 'Jira', importance: 'critical', weight: 15, requiredLevel: 'advanced' },
            { skillName: 'Communication', importance: 'critical', weight: 15, requiredLevel: 'expert' },
            { skillName: 'Leadership', importance: 'critical', weight: 15, requiredLevel: 'advanced' },
            { skillName: 'Problem Solving', importance: 'critical', weight: 10, requiredLevel: 'expert' },
            { skillName: 'Data Analysis', importance: 'important', weight: 10, requiredLevel: 'intermediate' },
        ],
    },

    // ============================================
    // CLOUD ENGINEER
    // ============================================
    {
        roleName: 'Cloud Engineer',
        skills: [
            { skillName: 'AWS', importance: 'critical', weight: 25, requiredLevel: 'expert' },
            { skillName: 'Azure', importance: 'important', weight: 15, requiredLevel: 'advanced' },
            { skillName: 'Google Cloud', importance: 'important', weight: 15, requiredLevel: 'advanced' },
            { skillName: 'Docker', importance: 'critical', weight: 15, requiredLevel: 'advanced' },
            { skillName: 'Kubernetes', importance: 'critical', weight: 15, requiredLevel: 'advanced' },
            { skillName: 'Terraform', importance: 'important', weight: 10, requiredLevel: 'advanced' },
            { skillName: 'Linux', importance: 'critical', weight: 5, requiredLevel: 'advanced' },
        ],
    },

    // ============================================
    // CYBERSECURITY ANALYST
    // ============================================
    {
        roleName: 'Cybersecurity Analyst',
        skills: [
            { skillName: 'Cybersecurity', importance: 'critical', weight: 25, requiredLevel: 'expert' },
            { skillName: 'Network Security', importance: 'critical', weight: 20, requiredLevel: 'expert' },
            { skillName: 'Penetration Testing', importance: 'critical', weight: 20, requiredLevel: 'advanced' },
            { skillName: 'Linux', importance: 'critical', weight: 15, requiredLevel: 'advanced' },
            { skillName: 'Python', importance: 'important', weight: 10, requiredLevel: 'intermediate' },
            { skillName: 'Problem Solving', importance: 'critical', weight: 10, requiredLevel: 'expert' },
        ],
    },

    // ============================================
    // QA ENGINEER
    // ============================================
    {
        roleName: 'QA Engineer',
        skills: [
            { skillName: 'Jest', importance: 'critical', weight: 18, requiredLevel: 'advanced' },
            { skillName: 'Cypress', importance: 'critical', weight: 18, requiredLevel: 'advanced' },
            { skillName: 'Selenium', importance: 'important', weight: 15, requiredLevel: 'advanced' },
            { skillName: 'JavaScript', importance: 'critical', weight: 15, requiredLevel: 'advanced' },
            { skillName: 'TypeScript', importance: 'important', weight: 12, requiredLevel: 'intermediate' },
            { skillName: 'Testing Library', importance: 'important', weight: 10, requiredLevel: 'advanced' },
            { skillName: 'Attention to Detail', importance: 'critical', weight: 12, requiredLevel: 'expert' },
        ],
    },

    // ============================================
    // SOFTWARE ENGINEER
    // ============================================
    {
        roleName: 'Software Engineer',
        skills: [
            { skillName: 'JavaScript', importance: 'critical', weight: 15, requiredLevel: 'advanced' },
            { skillName: 'TypeScript', importance: 'critical', weight: 12, requiredLevel: 'advanced' },
            { skillName: 'Python', importance: 'important', weight: 10, requiredLevel: 'intermediate' },
            { skillName: 'Java', importance: 'important', weight: 10, requiredLevel: 'intermediate' },
            { skillName: 'Git', importance: 'critical', weight: 10, requiredLevel: 'advanced' },
            { skillName: 'Problem Solving', importance: 'critical', weight: 15, requiredLevel: 'expert' },
            { skillName: 'Data Structures', importance: 'critical', weight: 15, requiredLevel: 'advanced' },
            { skillName: 'Algorithms', importance: 'critical', weight: 13, requiredLevel: 'advanced' },
        ],
    },

    // ============================================
    // BLOCKCHAIN DEVELOPER
    // ============================================
    {
        roleName: 'Blockchain Developer',
        skills: [
            { skillName: 'Solidity', importance: 'critical', weight: 25, requiredLevel: 'expert' },
            { skillName: 'JavaScript', importance: 'critical', weight: 15, requiredLevel: 'advanced' },
            { skillName: 'TypeScript', importance: 'important', weight: 12, requiredLevel: 'advanced' },
            { skillName: 'Web3', importance: 'critical', weight: 20, requiredLevel: 'expert' },
            { skillName: 'Ethereum', importance: 'critical', weight: 18, requiredLevel: 'expert' },
            { skillName: 'Node.js', importance: 'important', weight: 10, requiredLevel: 'intermediate' },
        ],
    },

    // ============================================
    // GAME DEVELOPER
    // ============================================
    {
        roleName: 'Game Developer',
        skills: [
            { skillName: 'Unity', importance: 'critical', weight: 25, requiredLevel: 'expert' },
            { skillName: 'C#', importance: 'critical', weight: 20, requiredLevel: 'expert' },
            { skillName: 'C++', importance: 'important', weight: 15, requiredLevel: 'advanced' },
            { skillName: 'Unreal Engine', importance: 'important', weight: 15, requiredLevel: 'advanced' },
            { skillName: '3D Graphics', importance: 'important', weight: 12, requiredLevel: 'advanced' },
            { skillName: 'Problem Solving', importance: 'critical', weight: 13, requiredLevel: 'expert' },
        ],
    },

    // ============================================
    // DIGITAL MARKETING SPECIALIST
    // ============================================
    {
        roleName: 'Digital Marketing Specialist',
        skills: [
            { skillName: 'SEO', importance: 'critical', weight: 20, requiredLevel: 'expert' },
            { skillName: 'Google Analytics', importance: 'critical', weight: 18, requiredLevel: 'advanced' },
            { skillName: 'Social Media Marketing', importance: 'critical', weight: 15, requiredLevel: 'advanced' },
            { skillName: 'Content Marketing', importance: 'important', weight: 15, requiredLevel: 'advanced' },
            { skillName: 'Email Marketing', importance: 'important', weight: 12, requiredLevel: 'intermediate' },
            { skillName: 'Communication', importance: 'critical', weight: 10, requiredLevel: 'advanced' },
            { skillName: 'Creativity', importance: 'important', weight: 10, requiredLevel: 'advanced' },
        ],
    },

    // ============================================
    // BUSINESS ANALYST
    // ============================================
    {
        roleName: 'Business Analyst',
        skills: [
            { skillName: 'Data Analysis', importance: 'critical', weight: 20, requiredLevel: 'expert' },
            { skillName: 'SQL', importance: 'critical', weight: 18, requiredLevel: 'advanced' },
            { skillName: 'Communication', importance: 'critical', weight: 15, requiredLevel: 'expert' },
            { skillName: 'Problem Solving', importance: 'critical', weight: 15, requiredLevel: 'expert' },
            { skillName: 'Excel', importance: 'critical', weight: 12, requiredLevel: 'advanced' },
            { skillName: 'Agile', importance: 'important', weight: 10, requiredLevel: 'intermediate' },
            { skillName: 'Critical Thinking', importance: 'critical', weight: 10, requiredLevel: 'expert' },
        ],
    },

    // ============================================
    // SITE RELIABILITY ENGINEER
    // ============================================
    {
        roleName: 'Site Reliability Engineer',
        skills: [
            { skillName: 'Kubernetes', importance: 'critical', weight: 20, requiredLevel: 'expert' },
            { skillName: 'Docker', importance: 'critical', weight: 18, requiredLevel: 'expert' },
            { skillName: 'Linux', importance: 'critical', weight: 15, requiredLevel: 'expert' },
            { skillName: 'Python', importance: 'critical', weight: 12, requiredLevel: 'advanced' },
            { skillName: 'AWS', importance: 'critical', weight: 15, requiredLevel: 'advanced' },
            { skillName: 'Terraform', importance: 'important', weight: 10, requiredLevel: 'advanced' },
            { skillName: 'Monitoring', importance: 'critical', weight: 10, requiredLevel: 'advanced' },
        ],
    },

    // ============================================
    // DATA ENGINEER
    // ============================================
    {
        roleName: 'Data Engineer',
        skills: [
            { skillName: 'Python', importance: 'critical', weight: 20, requiredLevel: 'expert' },
            { skillName: 'SQL', importance: 'critical', weight: 18, requiredLevel: 'expert' },
            { skillName: 'Apache Spark', importance: 'critical', weight: 15, requiredLevel: 'advanced' },
            { skillName: 'AWS', importance: 'important', weight: 12, requiredLevel: 'advanced' },
            { skillName: 'ETL', importance: 'critical', weight: 15, requiredLevel: 'expert' },
            { skillName: 'Data Warehousing', importance: 'critical', weight: 12, requiredLevel: 'advanced' },
            { skillName: 'Airflow', importance: 'important', weight: 8, requiredLevel: 'intermediate' },
        ],
    },
];
