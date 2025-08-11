
const isProduction = process.env.NODE_ENV === "production";

module.exports.cookieOptions = {
  accessToken: {
    httpOnly: true,
    secure: isProduction,
    sameSite: "None",
  },
  refreshToken: {
    httpOnly: true,
    secure: isProduction,
    sameSite: "None",
  }
};