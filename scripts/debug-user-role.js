
const mongoose = require('mongoose');

async function checkUserData() {
    const MONGODB_URI = "mongodb+srv://rolereadycontact_db_user:PYPmBDy4vVoPhCmD@cluster0.rpmn4fa.mongodb.net/roleready?retryWrites=true&w=majority";

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        // Define schemas
        const RoleSchema = new mongoose.Schema({ name: String }, { collection: 'roles' });
        const UserSchema = new mongoose.Schema({ name: String, email: String, profile: { headline: String } }, { collection: 'users' });
        const TargetRoleSchema = new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' }, isActive: Boolean }, { collection: 'targetroles' });

        const Role = mongoose.models.Role || mongoose.model('Role', RoleSchema);
        const User = mongoose.models.User || mongoose.model('User', UserSchema);
        const TargetRole = mongoose.models.TargetRole || mongoose.model('TargetRole', TargetRoleSchema);

        const email = "test@gmail.com";
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found with email:', email);
            return;
        }

        console.log('USER:', user.name, '(', user._id.toString(), ')');
        console.log('HEADLINE:', user.profile?.headline);

        const activeTargetRole = await TargetRole.findOne({ userId: user._id, isActive: true }).populate('roleId');

        if (activeTargetRole) {
            console.log('ACTIVE TARGET ROLE:', activeTargetRole.roleId?.name, '(', activeTargetRole.roleId?._id.toString(), ')');
        } else {
            console.log('NO ACTIVE TARGET ROLE FOUND FOR USER');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

checkUserData();
