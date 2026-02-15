const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function checkAppState() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const email = 'vivkumar4798@gmail.com';
        const user = await mongoose.connection.db.collection('users').findOne({ email });

        if (!user) {
            console.log('User not found');
            process.exit(0);
        }
        console.log('User ID:', user._id);
        console.log('User Role:', user.role);

        const app = await mongoose.connection.db.collection('mentorapplications').findOne({ userId: user._id });

        if (app) {
            console.log('Application found!');
            console.log('Status:', app.status);
            console.log('Motivation:', app.intent?.motivation);
            console.log('Motivation Length:', app.intent?.motivation?.length);
            console.log('Full App:', JSON.stringify(app, null, 2));
        } else {
            console.log('No Application found for this user.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkAppState();
