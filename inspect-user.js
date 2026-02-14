const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await mongoose.connection.db.collection('users').findOne({ email: 'vivkumar4583@gmail.com' });
        console.log('USER_DATA_START');
        console.log(JSON.stringify(user, null, 2));
        console.log('USER_DATA_END');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
