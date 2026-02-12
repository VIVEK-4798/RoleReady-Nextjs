/**
 * Skills Seed Data
 * 
 * Comprehensive list of professional skills across various domains
 */

export const skillsData = [
    // ============================================
    // PROGRAMMING LANGUAGES
    // ============================================
    { name: 'JavaScript', domain: 'languages', description: 'High-level programming language for web development', isActive: true },
    { name: 'TypeScript', domain: 'languages', description: 'Typed superset of JavaScript', isActive: true },
    { name: 'Python', domain: 'languages', description: 'High-level general-purpose programming language', isActive: true },
    { name: 'Java', domain: 'languages', description: 'Object-oriented programming language', isActive: true },
    { name: 'C++', domain: 'languages', description: 'General-purpose programming language', isActive: true },
    { name: 'C#', domain: 'languages', description: 'Modern object-oriented language by Microsoft', isActive: true },
    { name: 'Go', domain: 'languages', description: 'Open source programming language by Google', isActive: true },
    { name: 'Rust', domain: 'languages', description: 'Systems programming language focused on safety', isActive: true },
    { name: 'PHP', domain: 'languages', description: 'Server-side scripting language', isActive: true },
    { name: 'Ruby', domain: 'languages', description: 'Dynamic programming language', isActive: true },
    { name: 'Swift', domain: 'languages', description: 'Programming language for iOS and macOS', isActive: true },
    { name: 'Kotlin', domain: 'languages', description: 'Modern programming language for Android', isActive: true },
    { name: 'Scala', domain: 'languages', description: 'Functional and object-oriented language', isActive: true },
    { name: 'R', domain: 'languages', description: 'Programming language for statistical computing', isActive: true },
    { name: 'Dart', domain: 'languages', description: 'Programming language for Flutter', isActive: true },

    // ============================================
    // FRONTEND FRAMEWORKS & LIBRARIES
    // ============================================
    { name: 'React', domain: 'frameworks', description: 'JavaScript library for building user interfaces', isActive: true },
    { name: 'Next.js', domain: 'frameworks', description: 'React framework for production', isActive: true },
    { name: 'Vue.js', domain: 'frameworks', description: 'Progressive JavaScript framework', isActive: true },
    { name: 'Nuxt.js', domain: 'frameworks', description: 'Vue.js framework for production', isActive: true },
    { name: 'Angular', domain: 'frameworks', description: 'Platform for building web applications', isActive: true },
    { name: 'Svelte', domain: 'frameworks', description: 'Cybernetically enhanced web apps', isActive: true },
    { name: 'React Native', domain: 'frameworks', description: 'Framework for building native mobile apps', isActive: true },
    { name: 'Flutter', domain: 'frameworks', description: 'UI toolkit for mobile, web, and desktop', isActive: true },
    { name: 'Ionic', domain: 'frameworks', description: 'Cross-platform mobile app framework', isActive: true },

    // ============================================
    // BACKEND FRAMEWORKS
    // ============================================
    { name: 'Node.js', domain: 'frameworks', description: 'JavaScript runtime built on Chrome V8', isActive: true },
    { name: 'Express.js', domain: 'frameworks', description: 'Fast web framework for Node.js', isActive: true },
    { name: 'NestJS', domain: 'frameworks', description: 'Progressive Node.js framework', isActive: true },
    { name: 'Django', domain: 'frameworks', description: 'High-level Python web framework', isActive: true },
    { name: 'Flask', domain: 'frameworks', description: 'Lightweight Python web framework', isActive: true },
    { name: 'FastAPI', domain: 'frameworks', description: 'Modern Python web framework', isActive: true },
    { name: 'Spring Boot', domain: 'frameworks', description: 'Java-based framework', isActive: true },
    { name: 'Ruby on Rails', domain: 'frameworks', description: 'Web application framework for Ruby', isActive: true },
    { name: 'Laravel', domain: 'frameworks', description: 'PHP web application framework', isActive: true },
    { name: 'ASP.NET Core', domain: 'frameworks', description: 'Cross-platform .NET framework', isActive: true },

    // ============================================
    // DATABASES
    // ============================================
    { name: 'MongoDB', domain: 'databases', description: 'NoSQL document database', isActive: true },
    { name: 'PostgreSQL', domain: 'databases', description: 'Open source relational database', isActive: true },
    { name: 'MySQL', domain: 'databases', description: 'Open source relational database', isActive: true },
    { name: 'SQL', domain: 'databases', description: 'Structured Query Language', isActive: true },
    { name: 'Redis', domain: 'databases', description: 'In-memory data structure store', isActive: true },
    { name: 'Firebase', domain: 'databases', description: 'Google cloud platform for mobile and web', isActive: true },
    { name: 'Firestore', domain: 'databases', description: 'Cloud-hosted NoSQL database', isActive: true },
    { name: 'SQLite', domain: 'databases', description: 'Lightweight relational database', isActive: true },
    { name: 'Oracle', domain: 'databases', description: 'Multi-model database management system', isActive: true },
    { name: 'Cassandra', domain: 'databases', description: 'Distributed NoSQL database', isActive: true },
    { name: 'DynamoDB', domain: 'databases', description: 'AWS NoSQL database service', isActive: true },
    { name: 'Elasticsearch', domain: 'databases', description: 'Distributed search and analytics engine', isActive: true },

    // ============================================
    // CSS & STYLING
    // ============================================
    { name: 'HTML', domain: 'technical', description: 'HyperText Markup Language', isActive: true },
    { name: 'CSS', domain: 'technical', description: 'Cascading Style Sheets', isActive: true },
    { name: 'Tailwind CSS', domain: 'frameworks', description: 'Utility-first CSS framework', isActive: true },
    { name: 'Bootstrap', domain: 'frameworks', description: 'CSS framework for responsive design', isActive: true },
    { name: 'Material UI', domain: 'frameworks', description: 'React component library', isActive: true },
    { name: 'Sass', domain: 'tools', description: 'CSS preprocessor', isActive: true },
    { name: 'Less', domain: 'tools', description: 'CSS preprocessor', isActive: true },
    { name: 'Styled Components', domain: 'frameworks', description: 'CSS-in-JS library', isActive: true },

    // ============================================
    // CLOUD PLATFORMS
    // ============================================
    { name: 'AWS', domain: 'cloud', description: 'Amazon Web Services', isActive: true },
    { name: 'Azure', domain: 'cloud', description: 'Microsoft cloud platform', isActive: true },
    { name: 'Google Cloud', domain: 'cloud', description: 'Google Cloud Platform', isActive: true },
    { name: 'Vercel', domain: 'cloud', description: 'Platform for frontend deployment', isActive: true },
    { name: 'Netlify', domain: 'cloud', description: 'Platform for web projects', isActive: true },
    { name: 'Heroku', domain: 'cloud', description: 'Cloud platform as a service', isActive: true },
    { name: 'DigitalOcean', domain: 'cloud', description: 'Cloud infrastructure provider', isActive: true },

    // ============================================
    // DEVOPS & TOOLS
    // ============================================
    { name: 'Docker', domain: 'tools', description: 'Containerization platform', isActive: true },
    { name: 'Kubernetes', domain: 'tools', description: 'Container orchestration', isActive: true },
    { name: 'Jenkins', domain: 'tools', description: 'Automation server', isActive: true },
    { name: 'CI/CD', domain: 'tools', description: 'Continuous Integration and Deployment', isActive: true },
    { name: 'Git', domain: 'tools', description: 'Version control system', isActive: true },
    { name: 'GitHub', domain: 'tools', description: 'Git repository hosting service', isActive: true },
    { name: 'GitLab', domain: 'tools', description: 'DevOps platform', isActive: true },
    { name: 'Terraform', domain: 'tools', description: 'Infrastructure as code tool', isActive: true },
    { name: 'Ansible', domain: 'tools', description: 'Automation tool', isActive: true },
    { name: 'GitHub Actions', domain: 'tools', description: 'CI/CD platform by GitHub', isActive: true },

    // ============================================
    // TESTING
    // ============================================
    { name: 'Jest', domain: 'tools', description: 'JavaScript testing framework', isActive: true },
    { name: 'Cypress', domain: 'tools', description: 'End-to-end testing framework', isActive: true },
    { name: 'Mocha', domain: 'tools', description: 'JavaScript test framework', isActive: true },
    { name: 'Selenium', domain: 'tools', description: 'Browser automation tool', isActive: true },
    { name: 'JUnit', domain: 'tools', description: 'Java testing framework', isActive: true },
    { name: 'PyTest', domain: 'tools', description: 'Python testing framework', isActive: true },
    { name: 'Testing Library', domain: 'tools', description: 'Testing utilities for UI components', isActive: true },

    // ============================================
    // API & BACKEND SERVICES
    // ============================================
    { name: 'GraphQL', domain: 'technical', description: 'Query language for APIs', isActive: true },
    { name: 'REST API', domain: 'technical', description: 'Architectural style for APIs', isActive: true },
    { name: 'WebSocket', domain: 'technical', description: 'Protocol for real-time communication', isActive: true },
    { name: 'gRPC', domain: 'technical', description: 'High-performance RPC framework', isActive: true },
    { name: 'Microservices', domain: 'technical', description: 'Architectural style', isActive: true },
    { name: 'Serverless', domain: 'technical', description: 'Cloud computing execution model', isActive: true },

    // ============================================
    // DATA SCIENCE & ML
    // ============================================
    { name: 'TensorFlow', domain: 'frameworks', description: 'Machine learning framework', isActive: true },
    { name: 'PyTorch', domain: 'frameworks', description: 'Machine learning library', isActive: true },
    { name: 'Scikit-learn', domain: 'frameworks', description: 'Machine learning library for Python', isActive: true },
    { name: 'Pandas', domain: 'frameworks', description: 'Data analysis library for Python', isActive: true },
    { name: 'NumPy', domain: 'frameworks', description: 'Numerical computing library', isActive: true },
    { name: 'Keras', domain: 'frameworks', description: 'Deep learning API', isActive: true },
    { name: 'Machine Learning', domain: 'technical', description: 'AI and machine learning', isActive: true },
    { name: 'Deep Learning', domain: 'technical', description: 'Neural networks and AI', isActive: true },
    { name: 'Data Analysis', domain: 'technical', description: 'Analyzing and interpreting data', isActive: true },
    { name: 'Data Visualization', domain: 'technical', description: 'Visual representation of data', isActive: true },

    // ============================================
    // SECURITY
    // ============================================
    { name: 'OAuth', domain: 'technical', description: 'Authorization framework', isActive: true },
    { name: 'JWT', domain: 'technical', description: 'JSON Web Tokens', isActive: true },
    { name: 'Cybersecurity', domain: 'technical', description: 'Security practices and protocols', isActive: true },
    { name: 'Penetration Testing', domain: 'technical', description: 'Security testing methodology', isActive: true },
    { name: 'Network Security', domain: 'technical', description: 'Securing network infrastructure', isActive: true },

    // ============================================
    // MOBILE DEVELOPMENT
    // ============================================
    { name: 'Android', domain: 'frameworks', description: 'Mobile operating system', isActive: true },
    { name: 'iOS', domain: 'frameworks', description: 'Mobile operating system', isActive: true },
    { name: 'Expo', domain: 'frameworks', description: 'Platform for React Native', isActive: true },
    { name: 'SwiftUI', domain: 'frameworks', description: 'UI framework for iOS', isActive: true },
    { name: 'Jetpack Compose', domain: 'frameworks', description: 'Modern UI toolkit for Android', isActive: true },

    // ============================================
    // DESIGN & UI/UX
    // ============================================
    { name: 'Figma', domain: 'tools', description: 'Collaborative design tool', isActive: true },
    { name: 'Adobe XD', domain: 'tools', description: 'UI/UX design tool', isActive: true },
    { name: 'Sketch', domain: 'tools', description: 'Digital design toolkit', isActive: true },
    { name: 'UI/UX Design', domain: 'technical', description: 'User interface and experience design', isActive: true },
    { name: 'Wireframing', domain: 'technical', description: 'Creating design blueprints', isActive: true },
    { name: 'Prototyping', domain: 'technical', description: 'Creating interactive mockups', isActive: true },

    // ============================================
    // PROJECT MANAGEMENT & TOOLS
    // ============================================
    { name: 'Jira', domain: 'tools', description: 'Project management tool', isActive: true },
    { name: 'Trello', domain: 'tools', description: 'Project management tool', isActive: true },
    { name: 'Asana', domain: 'tools', description: 'Work management platform', isActive: true },
    { name: 'Agile', domain: 'technical', description: 'Agile methodology', isActive: true },
    { name: 'Scrum', domain: 'technical', description: 'Agile framework', isActive: true },
    { name: 'Kanban', domain: 'technical', description: 'Visual workflow management', isActive: true },

    // ============================================
    // SOFT SKILLS
    // ============================================
    { name: 'Problem Solving', domain: 'soft-skills', description: 'Ability to solve complex problems', isActive: true },
    { name: 'Communication', domain: 'soft-skills', description: 'Effective communication skills', isActive: true },
    { name: 'Teamwork', domain: 'soft-skills', description: 'Collaborative work ability', isActive: true },
    { name: 'Leadership', domain: 'soft-skills', description: 'Ability to lead teams', isActive: true },
    { name: 'Time Management', domain: 'soft-skills', description: 'Efficient time utilization', isActive: true },
    { name: 'Critical Thinking', domain: 'soft-skills', description: 'Analytical thinking ability', isActive: true },
    { name: 'Adaptability', domain: 'soft-skills', description: 'Ability to adapt to change', isActive: true },
    { name: 'Creativity', domain: 'soft-skills', description: 'Creative problem-solving', isActive: true },
    { name: 'Attention to Detail', domain: 'soft-skills', description: 'Meticulous and thorough', isActive: true },
    { name: 'Collaboration', domain: 'soft-skills', description: 'Working effectively with others', isActive: true },

    // ============================================
    // OTHER TECHNICAL SKILLS
    // ============================================
    { name: 'SEO', domain: 'technical', description: 'Search Engine Optimization', isActive: true },
    { name: 'Google Analytics', domain: 'tools', description: 'Web analytics service', isActive: true },
    { name: 'Webpack', domain: 'tools', description: 'Module bundler', isActive: true },
    { name: 'Vite', domain: 'tools', description: 'Frontend build tool', isActive: true },
    { name: 'Babel', domain: 'tools', description: 'JavaScript compiler', isActive: true },
    { name: 'ESLint', domain: 'tools', description: 'JavaScript linter', isActive: true },
    { name: 'Prettier', domain: 'tools', description: 'Code formatter', isActive: true },
    { name: 'Postman', domain: 'tools', description: 'API development tool', isActive: true },
    { name: 'VS Code', domain: 'tools', description: 'Code editor', isActive: true },
    { name: 'Linux', domain: 'technical', description: 'Unix-like operating system', isActive: true },
    { name: 'Bash', domain: 'technical', description: 'Unix shell and command language', isActive: true },
];
