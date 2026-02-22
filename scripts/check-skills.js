const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Skill = mongoose.connection.collection('skills');
        const skillNames = ['JavaScript', 'React', 'Angular', 'Vue', 'Git'];
        const skills = await Skill.find({ name: { $in: skillNames } }).toArray();
        console.log('Found skills:');
        skills.forEach(s => console.log(`- ${s.name}: ${s._id}`));
    } catch (error) {
        console.error(error);
    } finally {
        process.exit(0);
    }
}
run();
