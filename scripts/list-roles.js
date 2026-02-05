require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function listRoles() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    const roles = await client.db().collection('roles').find({ isActive: true }).toArray();
    
    console.log('📋 Available roles in database:');
    console.log('================================');
    
    roles.forEach(role => {
      console.log(`\n🎯 ${role.name}`);
      console.log(`   Description: ${role.description || 'No description'}`);
      console.log(`   Skills: ${role.benchmarks?.length || 0}`);
      console.log(`   Color: ${role.colorClass || 'default'}`);
      
      if (role.benchmarks && role.benchmarks.length > 0) {
        console.log('   Required Skills:');
        role.benchmarks.forEach(b => {
          console.log(`     • ${b.importance} (weight: ${b.weight}%)`);
        });
      }
    });
    
    console.log(`\n📊 Total roles: ${roles.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

listRoles();