import express from "express";
import { getAllUsers, getCurrentUser, loginUser, logOut, registerUser, updateProfile } from "../controller/authController.js";
import upload from "../middelware/multer.js";
import { isLoggedIn } from "../middelware/isLoggedIn.js";
const router = express.Router();

router.post("/register", upload.single("avatar") ,registerUser);

router.post("/login", loginUser);

router.get("/logout", isLoggedIn, logOut);

router.get("/getAllUsers", isLoggedIn, getAllUsers);

router.put("/:userId/update-profile", isLoggedIn, upload.single("avatar"), updateProfile)

router.get("/current-user", isLoggedIn ,getCurrentUser);

export default router;