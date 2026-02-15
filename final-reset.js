const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function reset() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const email = 'vivkumar4798@gmail.com';
        const user = await mongoose.connection.db.collection('users').findOne({ email });

        if (user) {
            console.log('User ID:', user._id);

            const r1 = await mongoose.connection.db.collection('mentorapplications').deleteMany({ userId: user._id });
            console.log('mentorapplications deleted:', r1.deletedCount);

            const r2 = await mongoose.connection.db.collection('mentorrolerequests').deleteMany({ userId: user._id });
            console.log('mentorrolerequests deleted:', r2.deletedCount);

            await mongoose.connection.db.collection('users').updateOne({ _id: user._id }, { $set: { role: 'user' } });
            console.log('Role reset to user');
        } else {
            console.log('User not found');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

reset();
