const User = require("./models/User");

module.exports = async (request, response, next) => {
  try {
    const user = await User.findOne({ _id: request._id }, (err, docs) => {
      if (err) {
        return response.status(200).send({ message: "Invalid user id" });
      }
    });

if (!user) {
    return user;
}

if (!user.isAdmin) {
    return response.status(401).send({message: "You are not allowed to perform that operation"});
}

    next();
  } catch (err) {
    return;
  }
};
