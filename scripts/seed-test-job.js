/**
 * Seed Test Job with Notifications
 * 
 * Creates a "Backend Developer" job and triggers notifications for users 
 * who have this role as their target role.
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// We use basic require/MongoClient/Mongoose because of Next.js TS environment limitations for direct execution
async function seedTestJob() {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        console.error('MONGODB_URI is not defined in .env.local');
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Find the Backend Developer Role
        const Role = mongoose.connection.collection('roles');
        const role = await Role.findOne({ name: 'Backend Developer' });

        if (!role) {
            console.error('Backend Developer role not found. Please run roles seed first.');
            process.exit(1);
        }

        console.log(`Found role: ${role.name} (${role._id})`);

        // 2. Create the test job
        const Job = mongoose.connection.collection('jobs');

        // Check if job already exists to avoid duplicates
        const existingJob = await Job.findOne({
            title: 'Backend Developer',
            company: 'RoleReady Labs',
            source: 'internal'
        });

        let jobId;
        if (existingJob) {
            console.log('Test job already exists. Using existing job.');
            jobId = existingJob._id;
        } else {
            const result = await Job.insertOne({
                title: 'Backend Developer',
                company: 'RoleReady Labs',
                city: 'Remote (India)',
                salary: '₹15L - ₹25L',
                experience: '2-5 Years',
                type: 'Full-time',
                workDetail: 'In-office / Remote Hybrid',
                description: 'Looking for a Node.js backend developer with REST API experience.',
                requirements: 'Node.js, Express.js, MongoDB, REST APIs, JWT',
                skills: ['Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'JWT'],
                isActive: true,
                isFeatured: true,
                source: 'internal',
                postedByRole: 'admin',
                priority: 100,
                roleId: role._id,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            jobId = result.insertedId;
            console.log(`Created test job with ID: ${jobId}`);
        }

        // 3. Trigger notifications manually since we are in a script
        const User = mongoose.connection.collection('users');
        const Notification = mongoose.connection.collection('notifications');

        // Find users matching roleId
        const users = await User.find({
            'profile.targetRoleId': role._id,
            isActive: true
        }).project({ _id: 1 }).toArray();

        console.log(`Found ${users.length} matching users for notification.`);

        if (users.length > 0) {
            const notifications = users.map(user => ({
                userId: user._id,
                title: "New Role-Matched Job Posted",
                message: `A new Backend Developer opportunity has been posted for your selected role.`,
                actionUrl: `/jobs/${jobId}`,
                type: "job_match",
                isRead: false,
                metadata: {
                    jobId: jobId,
                    roleId: role._id
                },
                createdAt: new Date(),
                updatedAt: new Date()
            }));

            await Notification.insertMany(notifications, { ordered: false });
            console.log(`Successfully sent ${notifications.length} notifications.`);
        } else {
            console.log('No matching users found. Try updating a user profile to have "Backend Developer" as target role.');
        }

        console.log('Seed completed successfully.');
    } catch (error) {
        console.error('Error seeding test job:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seedTestJob();
