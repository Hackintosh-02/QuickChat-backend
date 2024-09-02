import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Update this to match your frontend's origin
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"], // Optional: Specify allowed headers
    },
});

const userSocketMap = {}; // { userId: socketId }

// Function to get the receiver's socket ID
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
        emitActiveUsers();
    } else {
        console.log("User ID is not defined or missing");
    }

    socket.on("disconnect", () => {
        console.log(`User with socket ID: ${socket.id} disconnected`);
        if (userId) {
            delete userSocketMap[userId];
            emitActiveUsers();
        }
    });
});

// Function to emit the active users list to all connected clients
const emitActiveUsers = () => {
    const activeUsers = Object.keys(userSocketMap);
    io.emit('activeUsers', activeUsers);
    console.log("Current online users:", activeUsers);
};

export { app, io, server };
