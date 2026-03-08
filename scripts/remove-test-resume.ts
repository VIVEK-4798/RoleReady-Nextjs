const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const connectDB = require('../lib/db/mongoose').default;
const { User, Resume } = require('../lib/models');

async function removeUserResume() {
    const email = 'test@gmail.com';

    try {
        console.log(`Connecting to database to remove resume for ${email}...`);
        await connectDB();

        const user = await User.findOne({ email });
        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        const userId = user._id;
        console.log(`Found user ${user.name} (ID: ${userId})`);

        // 1. Clear resume info from User profile
        if (user.profile) {
            await User.updateOne(
                { _id: userId },
                { $unset: { "profile.resume": 1 } }
            );
            console.log('Cleared resume info from user profile.');
        }

        // 2. Delete entries from Resume collection
        const deleteResult = await Resume.deleteMany({ userId });
        console.log(`Deleted ${deleteResult.deletedCount} records from Resume collection.`);

        console.log('Successfully removed resume data for the user.');
        process.exit(0);
    } catch (error) {
        console.error('Error removing resume:', error);
        process.exit(1);
    }
}

removeUserResume();

export {};
