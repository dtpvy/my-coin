const jwt = require("jsonwebtoken");

const sendToken = (wallet, statusCode, res) => {
  const token = jwt.sign({ id: wallet._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  const options = {
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 1000),
    httpOnly: false,
    secure: true,
  };

  res.status(statusCode).cookie("token", token, options).json({
    wallet,
    token,
  });
};

module.exports = sendToken;
