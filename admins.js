const User = require("./models/User");
// const { use } = require("./routes/user_management");

module.exports = async (id) => {
  const user = await User.findOne({ _id: id });
  if (!user) return false;
  else return user.isAdmin;
};
