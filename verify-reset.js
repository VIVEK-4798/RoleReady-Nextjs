const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function verify() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const email = 'vivkumar4798@gmail.com';
        const user = await mongoose.connection.db.collection('users').findOne({ email });
        console.log('User Role:', user.role);

        const count1 = await mongoose.connection.db.collection('mentorapplications').countDocuments({ userId: user._id });
        console.log('Mentor Applications Count:', count1);

        const count2 = await mongoose.connection.db.collection('mentorrolerequests').countDocuments({ userId: user._id });
        console.log('Mentor Role Requests Count:', count2);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
