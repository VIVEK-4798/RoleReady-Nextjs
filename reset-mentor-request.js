const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function resetMentorRequest() {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
        console.error('MONGODB_URI not found');
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const email = 'vivkumar4798@gmail.com';

        // 1. Find the user
        const user = await mongoose.connection.db.collection('users').findOne({ email });
        if (!user) {
            console.error(`User with email ${email} not found`);
            process.exit(1);
        }
        console.log(`Found user: ${user.name} (${user._id})`);

        // 2. Remove from mentorapplications
        const appResult = await mongoose.connection.db.collection('mentorapplications').deleteMany({
            userId: user._id
        });
        console.log(`Deleted ${appResult.deletedCount} items from mentorapplications`);

        // 3. Remove from mentorrolerequests (older model if exists)
        const reqResult = await mongoose.connection.db.collection('mentorrolerequests').deleteMany({
            userId: user._id
        });
        console.log(`Deleted ${reqResult.deletedCount} items from mentorrolerequests`);

        // 4. Ensure user role is 'user'
        const userUpdate = await mongoose.connection.db.collection('users').updateOne(
            { _id: user._id },
            { $set: { role: 'user' } }
        );
        if (userUpdate.modifiedCount > 0) {
            console.log('Reset user role to "user"');
        }

        console.log('Success: Mentor requests have been reversed for this user.');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

resetMentorRequest();
