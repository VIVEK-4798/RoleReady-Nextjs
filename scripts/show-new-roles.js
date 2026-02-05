require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function showRoleDetails() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    // Get Data Analyst and QA roles with populated skills
    const roles = await db.collection('roles').find({ 
      name: { $in: ['Data Analyst', 'QA / Software Tester'] }
    }).toArray();
    
    console.log('🚀 Newly Added Role Details:');
    console.log('============================');
    
    for (const role of roles) {
      console.log(`\n📊 ${role.name}`);
      console.log(`   Description: ${role.description}`);
      console.log(`   Color: ${role.colorClass}`);
      console.log(`   Skills (${role.benchmarks.length}):`);
      
      // Get skill details for each benchmark
      for (const benchmark of role.benchmarks) {
        const skill = await db.collection('skills').findOne({ _id: benchmark.skillId });
        console.log(`     • ${skill.name} (${skill.domain})`);
        console.log(`       - Importance: ${benchmark.importance}`);
        console.log(`       - Weight: ${benchmark.weight}%`);
        console.log(`       - Required Level: ${benchmark.requiredLevel}`);
        console.log(`       - Description: ${skill.description}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

showRoleDetails();