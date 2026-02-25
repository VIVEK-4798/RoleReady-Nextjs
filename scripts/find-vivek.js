
const mongoose = require('mongoose');

async function findVivek() {
    const MONGODB_URI = "mongodb+srv://rolereadycontact_db_user:PYPmBDy4vVoPhCmD@cluster0.rpmn4fa.mongodb.net/roleready?retryWrites=true&w=majority";

    try {
        await mongoose.connect(MONGODB_URI);
        const User = mongoose.model('User', new mongoose.Schema({ name: String, email: String, profile: { headline: String } }));
        const Role = mongoose.model('Role', new mongoose.Schema({ name: String }));
        const TargetRole = mongoose.model('TargetRole', new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' }, isActive: Boolean }));

        const users = await User.find({ name: /vivek/i });
        console.log('Founds users:', users.length);

        for (const user of users) {
            console.log('--- USER ---');
            console.log('Name:', user.name);
            console.log('Email:', user.email);
            console.log('ID:', user._id.toString());
            console.log('Profile Headline:', user.profile?.headline);

            const activeTR = await TargetRole.findOne({ userId: user._id, isActive: true }).populate('roleId');
            if (activeTR) {
                console.log('Active Target Role:', activeTR.roleId?.name);
            } else {
                console.log('No active target role');
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

findVivek();
