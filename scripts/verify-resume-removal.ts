const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const connectDB = require('../lib/db/mongoose').default;
const { User, Resume } = require('../lib/models');

async function checkUserResume() {
    const email = 'test@gmail.com';

    try {
        await connectDB();
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            process.exit(0);
        }

        console.log(`User: ${user.email}`);
        console.log(`Resume in profile: ${JSON.stringify(user.profile?.resume || 'None')}`);

        const resumes = await Resume.find({ userId: user._id });
        console.log(`Resume collection entries: ${resumes.length}`);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkUserResume();
