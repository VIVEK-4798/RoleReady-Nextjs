require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function showAllRoleDetails() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    
    const roles = await db.collection('roles').find({ isActive: true }).sort({ name: 1 }).toArray();
    
    console.log('🚀 Complete Role Benchmarks Overview:');
    console.log('=====================================\n');
    
    for (const role of roles) {
      console.log(`🎯 ${role.name}`);
      console.log(`   ${role.description}`);
      console.log(`   Color: ${role.colorClass}`);
      console.log(`   Total Skills: ${role.benchmarks.length}`);
      console.log('   Benchmarks:');
      
      let totalWeight = 0;
      for (const benchmark of role.benchmarks) {
        const skill = await db.collection('skills').findOne({ _id: benchmark.skillId });
        totalWeight += benchmark.weight;
        const reqLevel = benchmark.requiredLevel.charAt(0).toUpperCase() + benchmark.requiredLevel.slice(1);
        console.log(`     • ${skill.name} (${skill.domain})`);
        console.log(`       ${benchmark.importance.toUpperCase()} | Weight: ${benchmark.weight}% | Level: ${reqLevel}`);
      }
      console.log(`   ✅ Total Weight: ${totalWeight}%\n`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

showAllRoleDetails();