import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    image: {
        type: String
    },
    video: {
        type: String
    },
    text : {
        type: String
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    isRead: {
        type: Boolean,
        default: false
    }
},
    {timestamps: true}
);

const messageModel = mongoose.model("Message", messageSchema);

export default messageModel;