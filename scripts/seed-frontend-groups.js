const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
require('dotenv').config({ path: '.env.local' });

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Skill = mongoose.connection.collection('skills');
        const Role = mongoose.connection.collection('roles');

        // 1. Ensure Skills exist
        const skillList = [
            { name: 'JavaScript', domain: 'languages' },
            { name: 'React', domain: 'frameworks' },
            { name: 'Angular', domain: 'frameworks' },
            { name: 'Vue', domain: 'frameworks' },
            { name: 'Git', domain: 'tools' }
        ];

        const skillMap = {};
        for (const s of skillList) {
            let skill = await Skill.findOne({ name: s.name });
            if (!skill) {
                const result = await Skill.insertOne({
                    name: s.name,
                    normalizedName: s.name.toLowerCase(),
                    domain: s.domain,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                skill = { _id: result.insertedId, name: s.name };
            }
            skillMap[s.name] = skill._id;
        }

        // 2. Define Benchmark Groups
        const benchmarkGroups = [
            {
                name: "Core Language",
                type: "ALL_REQUIRED",
                weight: 30,
                required: true,
                isActive: true,
                skills: [
                    { skillId: skillMap['JavaScript'], requiredLevel: 'intermediate' }
                ]
            },
            {
                name: "Frontend Framework",
                type: "ANY_ONE_REQUIRED",
                weight: 40,
                required: true,
                isActive: true,
                skills: [
                    { skillId: skillMap['React'], requiredLevel: 'intermediate' },
                    { skillId: skillMap['Angular'], requiredLevel: 'intermediate' },
                    { skillId: skillMap['Vue'], requiredLevel: 'intermediate' }
                ]
            },
            {
                name: "Version Control",
                type: "ALL_REQUIRED",
                weight: 30,
                required: true,
                isActive: true,
                skills: [
                    { skillId: skillMap['Git'], requiredLevel: 'beginner' }
                ]
            }
        ];

        // 3. Update Role
        const result = await Role.updateOne(
            { name: 'Frontend Developer' },
            {
                $set: {
                    benchmarkGroups: benchmarkGroups,
                    benchmarks: [], // Clear old flat benchmarks
                    updatedAt: new Date()
                }
            }
        );

        console.log(`Updated Frontend Developer role: ${result.modifiedCount} document(s) changed`);

    } catch (error) {
        console.error(error);
    } finally {
        process.exit(0);
    }
}
run();
