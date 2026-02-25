
const mongoose = require('mongoose');

async function checkUserData() {
    const MONGODB_URI = "mongodb+srv://rolereadycontact_db_user:PYPmBDy4vVoPhCmD@cluster0.rpmn4fa.mongodb.net/roleready?retryWrites=true&w=majority";

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        // Define schemas
        const UserSchema = new mongoose.Schema({ name: String, email: String, profile: { headline: String, about: String } }, { collection: 'users' });
        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        const email = "test@gmail.com";
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found with email:', email);
            return;
        }

        console.log('USER:', user.name);
        console.log('ABOUT:', user.profile?.about);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

checkUserData();
