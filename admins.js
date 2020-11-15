const User = require('./models/User');

module.exports = async (id) => {
    const user = await User.findOne({_id: id}).select('-password');
    return user.isAdmin;
}