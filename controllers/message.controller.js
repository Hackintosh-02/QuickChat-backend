import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        console.log("sendMessage called");
        console.log("Sender ID:", senderId);
        console.log("Receiver ID:", receiverId);
        console.log("Message:", message);

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!conversation) {
            console.log("No conversation found, creating a new one");
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            });
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            message,
        });

        if (newMessage) {
            console.log("New message created:", newMessage);
            conversation.messages.push(newMessage._id);
        }

        await Promise.all([conversation.save(), newMessage.save()]);

        console.log("Message and conversation saved to the database");

        const receiverSocketId = getReceiverSocketId(receiverId);
        console.log("Receiver Socket ID:", receiverSocketId);
        
        if (receiverSocketId) {
            console.log("Receiver Socket ID:", receiverSocketId);
            io.to(receiverSocketId).emit("newMessage", newMessage);
            console.log("Message emitted to receiver");
        } else {
            console.log("Receiver is not connected");
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage controller:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const getMessages = async (req, res) => {
	try {
		const { id: userToChatId } = req.params;
		const senderId = req.user._id;

		const conversation = await Conversation.findOne({
			participants: { $all: [senderId, userToChatId] },
		}).populate("messages"); // NOT REFERENCE BUT ACTUAL MESSAGES

		if (!conversation) return res.status(200).json([]);

		const messages = conversation.messages;

		res.status(200).json(messages);
	} catch (error) {
		console.log("Error in getMessages controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};
