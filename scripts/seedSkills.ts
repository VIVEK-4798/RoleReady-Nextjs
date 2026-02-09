/**
 * Seed common tech skills into the database
 * Run: npx tsx scripts/seedSkills.ts
 * Or: npm run seed-skills
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import Skill from '../lib/models/Skill';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const COMMON_SKILLS = [
  // Frontend Frameworks & Libraries
  { name: 'React', domain: 'frameworks' as const, description: 'JavaScript library for building user interfaces' },
  { name: 'React.js', domain: 'frameworks' as const, description: 'JavaScript library for building user interfaces' },
  { name: 'Next.js', domain: 'frameworks' as const, description: 'React framework for production' },
  { name: 'Vue.js', domain: 'frameworks' as const, description: 'Progressive JavaScript framework' },
  { name: 'Angular', domain: 'frameworks' as const, description: 'Platform for building web applications' },
  { name: 'React Native', domain: 'frameworks' as const, description: 'Framework for building native mobile apps' },
  { name: 'Svelte', domain: 'frameworks' as const, description: 'Cybernetically enhanced web apps' },
  
  // Backend Frameworks
  { name: 'Node.js', domain: 'frameworks' as const, description: 'JavaScript runtime built on Chrome V8' },
  { name: 'Express', domain: 'frameworks' as const, description: 'Fast, unopinionated web framework for Node.js' },
  { name: 'Express.js', domain: 'frameworks' as const, description: 'Fast web framework for Node.js' },
  { name: 'NestJS', domain: 'frameworks' as const, description: 'Progressive Node.js framework' },
  { name: 'Django', domain: 'frameworks' as const, description: 'High-level Python web framework' },
  { name: 'Flask', domain: 'frameworks' as const, description: 'Lightweight Python web framework' },
  { name: 'Spring Boot', domain: 'frameworks' as const, description: 'Java-based framework' },
  { name: 'FastAPI', domain: 'frameworks' as const, description: 'Modern Python web framework' },
  
  // Programming Languages
  { name: 'JavaScript', domain: 'languages' as const, description: 'High-level programming language' },
  { name: 'TypeScript', domain: 'languages' as const, description: 'Typed superset of JavaScript' },
  { name: 'Python', domain: 'languages' as const, description: 'High-level general-purpose language' },
  { name: 'Java', domain: 'languages' as const, description: 'Object-oriented programming language' },
  { name: 'C++', domain: 'languages' as const, description: 'General-purpose programming language' },
  { name: 'C#', domain: 'languages' as const, description: 'Modern object-oriented language' },
  { name: 'Go', domain: 'languages' as const, description: 'Open source programming language' },
  { name: 'Rust', domain: 'languages' as const, description: 'Systems programming language' },
  { name: 'PHP', domain: 'languages' as const, description: 'Server-side scripting language' },
  { name: 'Ruby', domain: 'languages' as const, description: 'Dynamic programming language' },
  { name: 'Swift', domain: 'languages' as const, description: 'Programming language for iOS' },
  { name: 'Kotlin', domain: 'languages' as const, description: 'Modern programming language for Android' },
  
  // Databases
  { name: 'MongoDB', domain: 'databases' as const, description: 'NoSQL document database' },
  { name: 'PostgreSQL', domain: 'databases' as const, description: 'Open source relational database' },
  { name: 'MySQL', domain: 'databases' as const, description: 'Open source relational database' },
  { name: 'SQL', domain: 'databases' as const, description: 'Structured Query Language' },
  { name: 'Redis', domain: 'databases' as const, description: 'In-memory data structure store' },
  { name: 'Firebase', domain: 'databases' as const, description: 'Google cloud platform for mobile and web' },
  { name: 'Firestore', domain: 'databases' as const, description: 'Cloud-hosted NoSQL database' },
  { name: 'SQLite', domain: 'databases' as const, description: 'Lightweight relational database' },
  { name: 'Oracle', domain: 'databases' as const, description: 'Multi-model database management system' },
  { name: 'Cassandra', domain: 'databases' as const, description: 'Distributed NoSQL database' },
  { name: 'Mongoose', domain: 'databases' as const, description: 'MongoDB object modeling tool' },
  
  // CSS Frameworks & Tools
  { name: 'Tailwind CSS', domain: 'frameworks' as const, description: 'Utility-first CSS framework' },
  { name: 'Bootstrap', domain: 'frameworks' as const, description: 'CSS framework for responsive design' },
  { name: 'Material UI', domain: 'frameworks' as const, description: 'React component library' },
  { name: 'Sass', domain: 'tools' as const, description: 'CSS preprocessor' },
  { name: 'CSS', domain: 'technical' as const, description: 'Cascading Style Sheets' },
  { name: 'HTML', domain: 'technical' as const, description: 'HyperText Markup Language' },
  
  // Cloud & DevOps
  { name: 'AWS', domain: 'cloud' as const, description: 'Amazon Web Services' },
  { name: 'Azure', domain: 'cloud' as const, description: 'Microsoft cloud platform' },
  { name: 'Google Cloud', domain: 'cloud' as const, description: 'Google Cloud Platform' },
  { name: 'Docker', domain: 'tools' as const, description: 'Containerization platform' },
  { name: 'Kubernetes', domain: 'tools' as const, description: 'Container orchestration' },
  { name: 'Jenkins', domain: 'tools' as const, description: 'Automation server' },
  { name: 'CI/CD', domain: 'tools' as const, description: 'Continuous Integration and Deployment' },
  { name: 'Vercel', domain: 'cloud' as const, description: 'Platform for frontend deployment' },
  { name: 'Netlify', domain: 'cloud' as const, description: 'Platform for web projects' },
  
  // Version Control & Tools
  { name: 'Git', domain: 'tools' as const, description: 'Version control system' },
  { name: 'GitHub', domain: 'tools' as const, description: 'Git repository hosting service' },
  { name: 'GitLab', domain: 'tools' as const, description: 'DevOps platform' },
  { name: 'Postman', domain: 'tools' as const, description: 'API development tool' },
  { name: 'VS Code', domain: 'tools' as const, description: 'Code editor' },
  
  // Mobile Development
  { name: 'Expo', domain: 'frameworks' as const, description: 'Platform for React Native' },
  { name: 'Flutter', domain: 'frameworks' as const, description: 'UI toolkit for mobile apps' },
  { name: 'Android', domain: 'frameworks' as const, description: 'Mobile operating system' },
  { name: 'iOS', domain: 'frameworks' as const, description: 'Mobile operating system' },
  
  // Backend Services
  { name: 'Appwrite', domain: 'cloud' as const, description: 'Backend server for web and mobile' },
  { name: 'Supabase', domain: 'cloud' as const, description: 'Open source Firebase alternative' },
  { name: 'GraphQL', domain: 'technical' as const, description: 'Query language for APIs' },
  { name: 'REST API', domain: 'technical' as const, description: 'Architectural style for APIs' },
  { name: 'WebSocket', domain: 'technical' as const, description: 'Protocol for real-time communication' },
  
  // Payment & Auth
  { name: 'Razorpay', domain: 'tools' as const, description: 'Payment gateway' },
  { name: 'Stripe', domain: 'tools' as const, description: 'Payment processing platform' },
  { name: 'OAuth', domain: 'technical' as const, description: 'Authorization framework' },
  { name: 'JWT', domain: 'technical' as const, description: 'JSON Web Tokens' },
  
  // Testing
  { name: 'Jest', domain: 'tools' as const, description: 'JavaScript testing framework' },
  { name: 'Cypress', domain: 'tools' as const, description: 'End-to-end testing framework' },
  { name: 'Mocha', domain: 'tools' as const, description: 'JavaScript test framework' },
  { name: 'Selenium', domain: 'tools' as const, description: 'Browser automation tool' },
  
  // Other Tools
  { name: 'Webpack', domain: 'tools' as const, description: 'Module bundler' },
  { name: 'Vite', domain: 'tools' as const, description: 'Frontend build tool' },
  { name: 'Babel', domain: 'tools' as const, description: 'JavaScript compiler' },
  { name: 'ESLint', domain: 'tools' as const, description: 'JavaScript linter' },
  { name: 'Prettier', domain: 'tools' as const, description: 'Code formatter' },
  
  // Analytics & SEO
  { name: 'Google Analytics', domain: 'tools' as const, description: 'Web analytics service' },
  { name: 'SEO', domain: 'technical' as const, description: 'Search Engine Optimization' },
  
  // Soft Skills
  { name: 'Problem Solving', domain: 'soft-skills' as const, description: 'Ability to solve complex problems' },
  { name: 'Communication', domain: 'soft-skills' as const, description: 'Effective communication skills' },
  { name: 'Teamwork', domain: 'soft-skills' as const, description: 'Collaborative work ability' },
  { name: 'Leadership', domain: 'soft-skills' as const, description: 'Ability to lead teams' },
  { name: 'Time Management', domain: 'soft-skills' as const, description: 'Efficient time utilization' },
];

async function seedSkills() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/roleready';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    console.log(`\nSeeding ${COMMON_SKILLS.length} skills...`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const skillData of COMMON_SKILLS) {
      try {
        const existing = await Skill.findOne({ 
          normalizedName: skillData.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim()
        });
        
        if (existing) {
          console.log(`⏭️  Skipped: ${skillData.name} (already exists)`);
          skippedCount++;
        } else {
          await Skill.create(skillData);
          console.log(`✅ Added: ${skillData.name}`);
          addedCount++;
        }
      } catch (error: any) {
        if (error.code === 11000) {
          console.log(`⏭️  Skipped: ${skillData.name} (duplicate)`);
          skippedCount++;
        } else {
          console.error(`❌ Error adding ${skillData.name}:`, error.message);
        }
      }
    }
    
    console.log(`\n✅ Seeding complete!`);
    console.log(`   Added: ${addedCount} skills`);
    console.log(`   Skipped: ${skippedCount} skills`);
    console.log(`   Total in DB: ${await Skill.countDocuments()}`);
    
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    
  } catch (error) {
    console.error('Error seeding skills:', error);
    process.exit(1);
  }
}

seedSkills();
