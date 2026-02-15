const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function listUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('--- USER LIST ---');
        const users = await mongoose.connection.db.collection('users').find({}).limit(10).toArray();
        users.forEach(u => console.log(`${u.email} | ${u.role}`));
        console.log('--- END LIST ---');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listUsers();
