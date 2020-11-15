const jwt = require("jsonwebtoken");
const { Mongoose } = require("mongoose");
const User = require("./models/User");

module.exports = function auth(request, response, next) {
  const token = request.header("auth-token");
  if (!token) {
    response.status(401).send("Access denied");
  }

  try {
    const verified = jwt.verify(
      token,
      process.env.SECRET_TOKEN,
      (err, decodedToken) => {
        if (err) {
          return response.status(400).send({ message: "invalid token" });
        } else {
          request._id = decodedToken._id;
        }
      }
    );
    require.user = verified;
    next();
  } catch (err) {
    response.status(400).send("Invalid Token");
  }
};
