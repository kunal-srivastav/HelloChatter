import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

export const isLoggedIn = async (req, res, next) => {
    const {accessToken, refreshToken} = req.cookies;
    if(!(accessToken && refreshToken)) return res.status(401).json({message: "Unauthorized request"});
   try {
     const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
     const user = await userModel.findOne({email: decoded.email}).select("-password -refreshToken");
     req.user = user;
     next();
   } catch (err) {
        return res.status(401).json({message: `Authentication failed. Please log in again.`})
   }
}