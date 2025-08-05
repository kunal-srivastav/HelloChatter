import mongoose from "mongoose";
import messageModel from "../models/messageModel.js"
import { deleteImgOnCloudinary, deleteVideoOnCloudinary, uploadOnCloudinary } from "../utlis/cloudinary.js";
import { io, userSocketMap } from "../server.js";

export const getUserMessages = async (req, res) => {
    const userId = req.params.id;
    const myId = req.user._id;
    try {
        const messages = await messageModel.aggregate([
        {
            $match: {
                $or: [
                    { 
                        senderId: myId,
                        receiverId: new mongoose.Types.ObjectId(userId) },
                    {
                        senderId:  new mongoose.Types.ObjectId(userId),
                        receiverId: myId
                    }
                ]}
        },
        { $sort: {createdAt: 1}},
        {
            $lookup: {
                from: "users",
                localField: "senderId",
                foreignField: "_id",
                as: "senderId",
                pipeline: [
                    {
                        $project: {
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$senderId"
        },
        {
            $project: {
                text: 1,
                senderId: 1,
                image: 1,
                video: 1,
                createdAt: 1,
            }
        }
        ]);
        if(messages.length <= 0) return res.status(200).json({message: "Message not found", messages: []});
        return res
        .status(200)
        .json({
            message: "Successfully fetched user messages",
            messages
        })
    } catch (err) {
        return res.status(500).json({message: err.message})
    }
};

export const sendMessage = async (req, res) => {
    const { text, receiverId, senderId } = req.body;
    const imageLocalFilePath = req?.files?.image ? req.files.image[0].path : null;
    const videoLocalFilePath = req?.files?.video ? req.files.video[0].path : null;
    if (!text && !imageLocalFilePath && !videoLocalFilePath) {
        return res.status(400).json({ message: "Please provide at least one of text, image, or video" });
    }
    let image;
    let video;
    try {
        if(imageLocalFilePath) {
            image = await uploadOnCloudinary(imageLocalFilePath);
        } 
        if(videoLocalFilePath) {
            video = await uploadOnCloudinary(videoLocalFilePath);
        };
        const newMessage = await messageModel.create({text: text, image: image?.url, video: video?.url, senderId, receiverId});
        const message = await messageModel.findById(newMessage._id).populate("senderId", "avatar createdAt fullName")
        const receiverSocketId = userSocketMap.get(receiverId);
        if(receiverSocketId) {
            io.to(receiverSocketId).emit("receive-message", {
                message
            });
        }
        return res
        .status(201)
        .json({
            message: "Message sent successfully",
            message
        })
    } catch (err) {
        return res.status(500).json({message: err.message});
    }
};

export const getUnreadMessages = async (req, res) => {
    const { userId } = req.params;
    try {
        const unreadMessages = await messageModel.find({receiverId: userId, isRead: false});
        if(!unreadMessages.length) return res.status(200).json({message: "No unread message", unreadMessages: []});
        return res
        .status(200)
        .json({
            message: "Successfully fetched unread message", 
            unreadMessages
        })
    } catch (err) {
        return res.status(500).json({message: "Internal server error unable to fetch unread messages"});
    }
};

export const markMessagesAsRead = async (req, res) => {
    const { senderId, receiverId } = req.body;
    try {
        await messageModel.updateMany({senderId, receiverId, isRead: false}, {$set: {isRead: true}});
        return res
        .status(200)
        .json({
            message: 'Messages marked as read'
        })
    } catch (err) {
        res.status(500).json({ error: 'Failed to mark messages as read' });
    }

}

export const deleteMessage = async (req, res) => {
    const {msgId} = req.params;
    try {
        const msg = await messageModel.findById(msgId);
        let imageUrl;
        let videoUrl;
        if(msg.image) {
            imageUrl = msg.image
        }
        if(msg.video) {
            videoUrl = msg.video;
        }
        if(!msg) return res.status(404).json({message: "Message not found"});
        if(!msg.senderId.equals( req.user._id)) return res.status(403).json({message: "Permission-denied"});
        
        const deletedMsg = await messageModel.findByIdAndDelete(msgId);
        if(deletedMsg && imageUrl) {
            await deleteImgOnCloudinary(imageUrl)
        }
        if(deletedMsg && videoUrl) {
            await deleteVideoOnCloudinary(videoUrl);
        }
        return res
        .status(200)
        .json({
            message: "Message deleted",
            deletedMsgId: deletedMsg._id
        })
    } catch (err) {
        return res.status(500).json({message: `Failed to delete message ${err.message}` });
    }
   
}