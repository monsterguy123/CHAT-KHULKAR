"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteRequest = exports.addFriend = exports.getRequests = exports.sentRequest = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
//sent request:---
const sentRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { friendId } = req.body;
        const userId = req.userId;
        if (!friendId || !userId) {
            return res.status(400).json({ msg: "Invalid request data." });
        }
        //check if already a friend or not:---
        const alreadyFriend = yield prisma.friends.findFirst({
            where: { userId, friendId }
        });
        if (alreadyFriend) {
            return res.json({ msg: "already a friend no need to send request..." });
        }
        // Check if the request was already sent
        const alreadySent = yield prisma.addFriendNotification.findFirst({
            where: { friendId, userId }
        });
        if (alreadySent) {
            return res.json({ msg: "Already sent request." });
        }
        const data = yield prisma.addFriendNotification.create({
            data: {
                userId: userId,
                friendId: friendId
            }
        });
        res.status(201).json({ msg: "Request sent successfully." });
    }
    catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: "Internal server error." });
    }
});
exports.sentRequest = sentRequest;
// Get friend requests
const getRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(400).json({ msg: "Invalid user ID." });
        }
        const data = yield prisma.addFriendNotification.findMany({
            where: { friendId: userId },
            select: {
                id: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            }
        });
        if (data.length === 0) {
            return res.status(200).json({ msg: "No friend requests found.", data: [] });
        }
        res.status(200).json({ data });
    }
    catch (error) {
        console.log(error.message);
        res.status(500).json({ msg: "Internal server error." });
    }
});
exports.getRequests = getRequests;
//Add a firend:---
const addFriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { friendId, id } = req.body;
        const userId = req.userId;
        if (!friendId || !id || !userId) {
            return res.status(400).json({ msg: "Invalid request data." });
        }
        // Check if the friend request exists
        const friendRequest = yield prisma.addFriendNotification.findUnique({
            where: { id }
        });
        if (!friendRequest) {
            return res.status(404).json({ msg: "Friend request not found." });
        }
        // Delete the friend request
        yield prisma.addFriendNotification.delete({
            where: { id }
        });
        // Create friend
        const data = yield prisma.friends.create({
            data: {
                userId: userId,
                friendId: friendId
            }
        });
        return res.status(201).json({ msg: "Request Accepted." });
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({ msg: error.message });
    }
});
exports.addFriend = addFriend;
//Delete Request:---
const DeleteRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        //delete a request from database:--
        yield prisma.addFriendNotification.delete({
            where: {
                id: id
            }
        });
        return res.json({ msg: "FriendRequest Declined..." });
    }
    catch (error) {
        console.log(error.message);
    }
});
exports.DeleteRequest = DeleteRequest;
