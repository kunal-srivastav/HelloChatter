import dotenv from "dotenv/config";
import express from "express";
import path from "path"
import {connectDB} from "./db/db-connection.js";
await connectDB();
import userRouter from "./routes/userRouter.js";
import messageRouter from "./routes/messageRouter.js";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import cookieParser from "cookie-parser";

const port = process.env.PORT || 3000;
const app = express();

const server = createServer(app);
export const io = new Server(server, {cors: {
    origin: process.env.CORS_ORIGIN
}});

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(path.resolve(), "public")));

export const userSocketMap = new Map();

io.on("connection", (socket) => {
    socket.on("user-connect", (userId) => {
        userSocketMap.set(userId, socket.id);
        socket.broadcast.emit("online-user", userId);
    })
    socket.on("send-offer", ({from, to, offer}) => {
        const remoteSocketId = userSocketMap.get(to);
        if(remoteSocketId){
            io.to(remoteSocketId).emit("receive-offer", {from, offer})
        }
    });

    socket.on("send-answer", ({to, answer}) => {
        const remoteSocketId = userSocketMap.get(to);
        if(remoteSocketId) {
            io.to(remoteSocketId).emit("receive-answer", {answer})
        }
    });

    socket.on("ice-candidate", ({to, candidate}) => {
        const remoteSocketId = userSocketMap.get(to);
        if(remoteSocketId) {
            io.to(remoteSocketId).emit("ice-candidate", {candidate});
        }
    });

    socket.on("end-call", ({from, to}) => {
        const remoteSocketId = userSocketMap.get(to);
        if(remoteSocketId) {
            io.to(remoteSocketId).emit("end-call", {from});
        }
    })

    socket.on("user-disconnect", (userId, callback) => {
        userSocketMap.delete(userId);
        socket.broadcast.emit("offline-user", userId);
        if(callback) return callback();
    })
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/messages", messageRouter);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})
