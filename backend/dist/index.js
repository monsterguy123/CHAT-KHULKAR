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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const client_1 = require("@prisma/client");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
        methods: ['GET', 'POST'],
        credentials: true
    }
});
const adminNamespace = io.of('/admin');
app.use((0, cors_1.default)());
app.use(express_1.default.json());
//get the message of the rooms
app.get('/getMessage/:groupName', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
                select: { message: true }
            });
            return res.json({ msg: data });
        }
        return res.json({ msg: "no group as such..." });
    }
    catch (error) {
        console.error(error.message);
        return res.json({ msg: error.message });
    }
}));
//Create Rooms of our choice:---
app.post('/createRoom', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
                groupStatus: roomStatus
            }
        });
        return res.status(201).json({ msg: "Room created successfully..." });
    }
    catch (error) {
        console.error('Error creating room:', error);
        return res.status(500).json({ msg: "An error occurred while creating the room.", error: error.message });
    }
}));
//show All room:---
app.get('/getallrooms', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rooms = yield prisma.group.findMany({});
        return res.status(201).json({ rooms });
    }
    catch (error) {
        return res.json({ msg: error.message });
    }
}));
adminNamespace.on("connection", (socket) => {
    console.log(`Client connected to /admin: ${socket.id}`);
    socket.on('joinRoom', (room) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            socket.join(room);
        }
        catch (error) {
            console.error(`Error joining room ${room}:`, error);
        }
    }));
    socket.on('message', ({ room, message }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log(message);
            adminNamespace.to(room).emit('message', { message });
            const group = yield prisma.group.findFirst({
                where: { groupName: room },
                select: { id: true }
            });
            if (group) {
                yield prisma.message.create({
                    data: {
                        message: message,
                        groupId: group.id
                    }
                });
            }
        }
        catch (error) {
            console.error(`Error handling message in room ${room}:`, error);
        }
    }));
    socket.on("disconnect", () => {
        console.log(`Client disconnected from /admin: ${socket.id}`);
    });
});
httpServer.listen(3000, () => {
    console.log('Server is running on port 3000');
});
process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
    process.exit();
}));
process.on('SIGTERM', () => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
    process.exit();
}));
