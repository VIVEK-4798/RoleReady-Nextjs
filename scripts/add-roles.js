/**
 * Script to add Data Analyst and QA Tester roles with their skills
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

const rolesData = [
  {
    name: 'Frontend Developer',
    description: 'Builds user interfaces using HTML, CSS, JavaScript, and modern frameworks.',
    colorClass: 'bg-blue-500',
    skills: [
      {
        name: 'HTML',
        domain: 'languages',
        description: 'Markup language for creating web page structure.',
        importance: 'required',
        weight: 15,
        requiredLevel: 'intermediate'
      },
      {
        name: 'CSS',
        domain: 'languages',
        description: 'Style sheet language for describing web page presentation.',
        importance: 'required',
        weight: 15,
        requiredLevel: 'intermediate'
      },
      {
        name: 'JavaScript',
        domain: 'languages',
        description: 'Programming language for interactive web applications.',
        importance: 'required',
        weight: 25,
        requiredLevel: 'intermediate'
      },
      {
        name: 'React',
        domain: 'frameworks',
        description: 'JavaScript library for building user interfaces.',
        importance: 'required',
        weight: 25,
        requiredLevel: 'intermediate'
      },
      {
        name: 'Responsive Design',
        domain: 'technical',
        description: 'Design approach for optimal viewing across devices.',
        importance: 'required',
        weight: 10,
        requiredLevel: 'intermediate'
      },
      {
        name: 'Git',
        domain: 'tools',
        description: 'Version control system for tracking code changes.',
        importance: 'optional',
        weight: 10,
        requiredLevel: 'beginner'
      }
    ]
  },
  {
    name: 'Backend Developer',
    description: 'Develops server-side logic, APIs, and manages databases.',
    colorClass: 'bg-green-500',
    skills: [
      {
        name: 'Node.js',
        domain: 'frameworks',
        description: 'JavaScript runtime for building server-side applications.',
        importance: 'required',
        weight: 25,
        requiredLevel: 'intermediate'
      },
      {
        name: 'Express.js',
        domain: 'frameworks',
        description: 'Web framework for Node.js applications.',
        importance: 'required',
        weight: 20,
        requiredLevel: 'intermediate'
      },
      {
        name: 'REST APIs',
        domain: 'technical',
        description: 'Architectural style for designing web services.',
        importance: 'required',
        weight: 20,
        requiredLevel: 'intermediate'
      },
      {
        name: 'MongoDB',
        domain: 'databases',
        description: 'NoSQL database for storing application data.',
        importance: 'required',
        weight: 15,
        requiredLevel: 'intermediate'
      },
      {
        name: 'SQL',
        domain: 'databases',
        description: 'Language for managing relational databases.',
        importance: 'required',
        weight: 10,
        requiredLevel: 'beginner'
      },
      {
        name: 'Authentication (JWT)',
        domain: 'technical',
        description: 'JSON Web Token authentication for secure applications.',
        importance: 'optional',
        weight: 10,
        requiredLevel: 'beginner'
      }
    ]
  },
  {
    name: 'Full Stack Developer',
    description: 'Works on both frontend and backend of web applications.',
    colorClass: 'bg-purple-500',
    skills: [
      {
        name: 'JavaScript',
        domain: 'languages',
        description: 'Programming language for interactive web applications.',
        importance: 'required',
        weight: 20,
        requiredLevel: 'intermediate'
      },
      {
        name: 'React',
        domain: 'frameworks',
        description: 'JavaScript library for building user interfaces.',
        importance: 'required',
        weight: 20,
        requiredLevel: 'intermediate'
      },
      {
        name: 'Node.js',
        domain: 'frameworks',
        description: 'JavaScript runtime for building server-side applications.',
        importance: 'required',
        weight: 20,
        requiredLevel: 'intermediate'
      },
      {
        name: 'Express.js',
        domain: 'frameworks',
        description: 'Web framework for Node.js applications.',
        importance: 'required',
        weight: 15,
        requiredLevel: 'intermediate'
      },
      {
        name: 'MongoDB',
        domain: 'databases',
        description: 'NoSQL database for storing application data.',
        importance: 'required',
        weight: 15,
        requiredLevel: 'intermediate'
      },
      {
        name: 'Git',
        domain: 'tools',
        description: 'Version control system for tracking code changes.',
        importance: 'optional',
        weight: 10,
        requiredLevel: 'beginner'
      }
    ]
  },
  {
    name: 'Data Analyst',
    description: 'Analyzes data to provide insights for business decisions',
    colorClass: 'bg-purple-500',
    skills: [
      {
        name: 'Python',
        domain: 'languages',
        description: 'Programming language widely used for data analysis.',
        importance: 'required',
        weight: 25,
        requiredLevel: 'intermediate'
      },
      {
        name: 'Excel',
        domain: 'tools',
        description: 'Spreadsheet tool for data analysis and reporting.',
        importance: 'required',
        weight: 20,
        requiredLevel: 'intermediate'
      },
      {
        name: 'Data Visualization',
        domain: 'technical',
        description: 'Converts data into charts and visual insights.',
        importance: 'required',
        weight: 20,
        requiredLevel: 'intermediate'
      },
      {
        name: 'Power BI / Tableau',
        domain: 'tools',
        description: 'Business intelligence tools for dashboards and reports.',
        importance: 'required',
        weight: 20,
        requiredLevel: 'intermediate'
      },
      {
        name: 'Statistics',
        domain: 'technical',
        description: 'Mathematical methods for analyzing data trends.',
        importance: 'required',
        weight: 15,
        requiredLevel: 'intermediate'
      }
    ]
  },
  {
    name: 'QA / Software Tester',
    description: 'Ensures software quality through testing and validation',
    colorClass: 'bg-orange-500',
    skills: [
      {
        name: 'Manual Testing',
        domain: 'technical',
        description: 'Tests software manually to identify defects.',
        importance: 'required',
        weight: 25,
        requiredLevel: 'intermediate'
      },
      {
        name: 'Test Case Design',
        domain: 'technical',
        description: 'Creates structured test scenarios.',
        importance: 'required',
        weight: 20,
        requiredLevel: 'intermediate'
      },
      {
        name: 'Bug Tracking',
        domain: 'tools',
        description: 'Tracks and manages software defects.',
        importance: 'required',
        weight: 15,
        requiredLevel: 'beginner'
      },
      {
        name: 'Selenium',
        domain: 'tools',
        description: 'Automation tool for testing web applications.',
        importance: 'required',
        weight: 20,
        requiredLevel: 'beginner'
      },
      {
        name: 'API Testing',
        domain: 'technical',
        description: 'Tests backend APIs for correctness and reliability.',
        importance: 'required',
        weight: 20,
        requiredLevel: 'beginner'
      }
    ]
  }
];

async function addRoles() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const skillsCollection = db.collection('skills');
    const rolesCollection = db.collection('roles');
    
    for (const roleData of rolesData) {
      console.log(`\n📝 Processing role: ${roleData.name}`);
      
      // Check if role already exists
      const existingRole = await rolesCollection.findOne({ name: roleData.name });
      if (existingRole) {
        console.log(`   🔄 Role "${roleData.name}" exists, updating with new benchmarks...`);
      }
      
      // Process skills and create benchmarks
      const benchmarks = [];
      
      for (const skillData of roleData.skills) {
        console.log(`   🔧 Processing skill: ${skillData.name}`);
        
        // Check if skill exists, if not create it
        let skill = await skillsCollection.findOne({ normalizedName: skillData.name.toLowerCase() });
        
        if (!skill) {
          // Create new skill
          const newSkill = {
            name: skillData.name,
            normalizedName: skillData.name.toLowerCase(),
            domain: skillData.domain,
            description: skillData.description,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          const result = await skillsCollection.insertOne(newSkill);
          skill = { _id: result.insertedId, ...newSkill };
          console.log(`      ✅ Created skill: ${skillData.name}`);
        } else {
          console.log(`      🔄 Using existing skill: ${skillData.name}`);
        }
        
        // Create benchmark for this skill
        benchmarks.push({
          skillId: skill._id,
          importance: skillData.importance,
          weight: skillData.weight,
          requiredLevel: skillData.requiredLevel,
          isActive: true
        });
      }
      
      // Create or update the role
      if (existingRole) {
        // Update existing role with new benchmarks
        const result = await rolesCollection.updateOne(
          { _id: existingRole._id },
          { 
            $set: { 
              benchmarks: benchmarks,
              description: roleData.description,
              colorClass: roleData.colorClass,
              updatedAt: new Date() 
            } 
          }
        );
        console.log(`   ✅ Updated existing role: ${roleData.name} with ${benchmarks.length} skills`);
      } else {
        // Create new role
        const newRole = {
          name: roleData.name,
          description: roleData.description,
          colorClass: roleData.colorClass,
          isActive: true,
          benchmarks: benchmarks,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const result = await rolesCollection.insertOne(newRole);
        console.log(`   ✅ Created role: ${roleData.name} with ${benchmarks.length} skills`);
      }
    }
    
    console.log('\n🎉 All roles added successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

// Run the script
addRoles();