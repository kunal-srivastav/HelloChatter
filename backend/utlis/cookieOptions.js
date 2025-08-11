
const isProduction = process.env.NODE_ENV === "production";

export const cookieOptions = {
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