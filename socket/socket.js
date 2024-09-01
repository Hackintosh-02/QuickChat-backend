import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",  // Update this to match your frontend's origin
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"], // Optional: Specify allowed headers
    },
});

const userSocketMap = {}; // { userId: socketId }

export const getReceiverSocketId = (receiverId) => {
    console.log(`Fetching socketId for receiverId: ${receiverId}`);
    console.log(`Current userSocketMap:`, userSocketMap);
    return userSocketMap[receiverId];
};


io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    console.log(`A user connected with socket ID: ${socket.id} and user ID: ${userId}`);

    if (userId && userId !== "undefined") {
        userSocketMap[userId] = socket.id;
        // console.log(`User ${userId} connected and socket ID ${socket.id} added to userSocketMap`);
    } else {
        console.log("User ID is not defined or missing");
    }

    // console.log("Current userSocketMap:", userSocketMap);
    // Emit currently online users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    // console.log("Current online users after connection:", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log(`User with socket ID: ${socket.id} disconnected`);
        if (userId) {
            delete userSocketMap[userId];
            console.log(`User ${userId} with socket ID ${socket.id} has been removed from userSocketMap`);
        }
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
        console.log("Current online users after disconnect:", Object.keys(userSocketMap));
    });
});


export { app, io, server };
