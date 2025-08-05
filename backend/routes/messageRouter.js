import express from "express";
import { deleteMessage, getUnreadMessages, getUserMessages, markMessagesAsRead, sendMessage } from "../controller/messageController.js";
import { isLoggedIn } from "../middelware/isLoggedIn.js";
import upload from "../middelware/multer.js";
const router = express.Router();

router.get("/:id/message", isLoggedIn, getUserMessages);

router.post("/send-message", isLoggedIn, upload.fields([{
    name: "image",
    maxCount: 1
}, {
    name: "video",
    maxCount: 1
}
]) ,sendMessage);

router.get("/:userId/unread", isLoggedIn, getUnreadMessages);

router.post("/read", isLoggedIn, markMessagesAsRead);

router.get("/:msgId/delete", isLoggedIn, deleteMessage)

export default router;