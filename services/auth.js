const JWT = require("jsonwebtoken");
const secret = "Batman@123";
function createToken(user) {
  const payload = {
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    profilePicture: user.profilePicture,
  };
  const token = JWT.sign(payload, secret, {
    expiresIn: "1h",
  });
  return token;
}

function verifyToken(token) {
  const payload = JWT.verify(token, secret);
  return payload;
}
module.exports = {
  createToken,
  verifyToken,
  secret,
};
