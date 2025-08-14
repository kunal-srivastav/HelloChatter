import userModel from "../models/userModel.js";
import { deleteImgOnCloudinary, uploadOnCloudinary } from "../utlis/cloudinary.js";
import { generateAccessAndRefreshToken} from "../middelware/generateTokens.js"
import { cookieOptions } from "../utlis/cookieOptions.js";

export const registerUser = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        const avatarLocalFilePath = req.file?.path;
        if(!avatarLocalFilePath) return res.status(400).json({message: "Avatar is required"});
        if(!(fullName || email || password)) return res.status(400).json({message: "All fields are required"});
        const userExists = await userModel.findOne({email});
        if(userExists) return res.status(400).json({message: "You already have an account"});
        const avatar = await uploadOnCloudinary(avatarLocalFilePath);
        if(!avatar) return res.status(400).json({message: "Avatar failed to upload"});
        const createdUser = await userModel.create({fullName, email, password, avatar: avatar.secure_url});
        const newUser = await userModel.findOne({_id: createdUser._id}).select("-password -refreshToken");
        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(createdUser);
        return res
        .status(201)
        .cookie("accessToken", accessToken, cookieOptions.accessToken)
        .cookie("refreshToken", refreshToken, cookieOptions.refreshToken)
        .json({
            message: "Your account has been created",
            newUser
        })

    } catch (err) {
        return res.status(500).json({message : `Internal server error`});
    }
};

export const loginUser = async (req, res) => {
   try {
     const {email, password} = req.body;
     if(!email) return res.status(400).json({message: "Email is required"});
     if(!password) return res.status(400).json({message: "Password is required"});
     const user = await userModel.findOne({email});
     if(!user) return res.status(401).json({message: "Email or password is incorrect"});
     const isPasswordCorrect = await user.isPasswordCorrect(password)
     if(!isPasswordCorrect) return res.status(401).json({message: "Email or password is incorrect"});
     const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user); 
     const loginUser = await userModel.findById(user._id).select("-password -refreshToken");
     return res
     .status(200)
     .cookie("accessToken", accessToken, cookieOptions.accessToken)
     .cookie("refreshToken", refreshToken, cookieOptions.refreshToken)
     .json({
        message: "Successfully login",
        loginUser
     });
   } catch (err) {
      return res.status(500).json({message: `Interna server error`});
   }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find({_id: {$ne: req.user._id}}).select("-password -refreshToken");
    if(users.length <= 0) return res.status(200).json({message: "No users found"});
    return res
    .status(200)
    .json({
      message: "All users retrive successfully",
      users
    })
  } catch (err) {
    return res.status(500).json({message: "failed to retrieve all users", error: err.message});
  }
};

export const getCurrentUser = async (req, res) => {
    try {
      const user = req.user;
      return res
      .status(200)
      .json({message: "Successfully fetched current user data", user});
    } catch (err) {
      return res.status(500).json({message: `Failed to fetch current user data ${err.message}`});
    }
};

export const updateProfile = async (req, res) => {
  try {
    const {userId} = req.params;
    const { fullName, email, password } = req.body;
    const avatarLocalFilePath = req?.file?.path;

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let newAvatar;
    if (avatarLocalFilePath) {
      newAvatar = await uploadOnCloudinary(avatarLocalFilePath);
    }

    if(password?.trim()) {
        user.password = password.trim();
        await user.save();
    }

    const updatedUser = await userModel.findOneAndUpdate(
      { email: user.email },
      {
        $set: {
          fullName: fullName?.trim() || user.fullName,
          email: email?.trim() || user.email,
          avatar: newAvatar?.secure_url || user.avatar,
        },
      },
      { new: true }
    );

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(updatedUser);

    if (newAvatar?.url && updatedUser) {
      await deleteImgOnCloudinary(user.avatar);
    }

    const newUser = await userModel.findById(updatedUser._id).select("-password -refreshToken");

    return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions.accessToken)
    .cookie("refreshToken", refreshToken, cookieOptions.refreshToken)
    .json({
      message: "Profile updated successfully",
      updatedUser: newUser
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong"});
  }
};

export const logOut = async (req, res) => {
    try {
      await userModel.findOneAndUpdate({email: req.user.email}, {$unset: {refreshToken: 1}}, {new: true});
      return res
      .status(200)
      .clearCookie("accessToken", cookieOptions.accessToken)
      .clearCookie("refreshToken", cookieOptions.refreshToken)
      .json({message: "User logout"});
    } catch (err) {
      return res.status(500).json({message: `Failed to logout user ${err.message}`});
    }
};
