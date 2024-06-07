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
exports.getRoomMessages = exports.getRoom = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const friendId = req.params.id;
        const userId = req.userId;
        const room1 = yield prisma.oneVOneChat.findFirst({
            where: {
                user1Id: userId,
                user2Id: friendId
            },
            select: {
                id: true
            }
        });
        let room2;
        if (!room1) {
            room2 = yield prisma.oneVOneChat.findFirst({
                where: {
                    user1Id: friendId,
                    user2Id: userId
                },
                select: {
                    id: true
                }
            });
        }
        if (room2) {
            return res.status(200).json({ room2 });
        }
        if (room1) {
            return res.status(200).json({ room1 });
        }
        return res.json({ msg: "error occured..." });
    }
    catch (error) {
        return res.json({ msg: error.message });
    }
});
exports.getRoom = getRoom;
const getRoomMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roomId = req.params.id;
        const message = yield prisma.oneVOneMessage.findMany({
            where: {
                ChatId: roomId
            },
            select: {
                id: true,
                senderId: true,
                message: true,
                date: true,
                sender: {
                    select: {
                        name: true,
                        image: true
                    }
                }
            }
        });
        return res.status(200).json({ message });
    }
    catch (error) {
        return res.json({ msg: error.message });
    }
});
exports.getRoomMessages = getRoomMessages;
