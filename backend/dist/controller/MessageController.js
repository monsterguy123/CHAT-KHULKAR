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
exports.GetAllRoom = exports.CreateRoom = exports.GetGroupMessage = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
//get message of a group
const GetGroupMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const groupName = req.params.groupName;
        if (groupName === 'null') {
            return res.json({ msg: [{ msg: "" }] });
        }
        // Get group id
        const group = yield prisma.group.findFirst({
            where: { groupName }
        });
        if (group === null || group === void 0 ? void 0 : group.id) {
            const data = yield prisma.message.findMany({
                where: { groupId: group.id },
                select: {
                    message: true,
                    createdAt: true,
                    sender: {
                        select: {
                            image: true,
                            name: true,
                            id: true
                        }
                    }
                }
            });
            return res.json({ msg: data });
        }
        return res.json({ msg: "no group as such..." });
    }
    catch (error) {
        console.error(error.message);
        return res.json({ msg: error.message });
    }
});
exports.GetGroupMessage = GetGroupMessage;
//Create a room
const CreateRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roomName, roomStatus } = req.body;
        const group = yield prisma.group.findFirst({
            where: {
                groupName: roomName
            }
        });
        if (group === null || group === void 0 ? void 0 : group.id) {
            return res.json({ msg: "Room has already been created plz try different name..." });
        }
        const newRoom = yield prisma.group.create({
            data: {
                groupName: roomName,
                groupStatus: roomStatus,
                userId: req.userId || ""
            }
        });
        return res.status(201).json({ msg: "Room created successfully..." });
    }
    catch (error) {
        console.error('Error creating room:', error);
        return res.status(500).json({ msg: "An error occurred while creating the room.", error: error.message });
    }
});
exports.CreateRoom = CreateRoom;
//get all rooms
const GetAllRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rooms = yield prisma.group.findMany({});
        return res.status(201).json({ rooms });
    }
    catch (error) {
        return res.json({ msg: error.message });
    }
});
exports.GetAllRoom = GetAllRoom;
