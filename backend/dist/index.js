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
exports.io = void 0;
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = require("dotenv");
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const express_1 = __importDefault(require("express"));
const MessageRoute_1 = __importDefault(require("./routes/MessageRoute"));
const UserRoute_1 = __importDefault(require("./routes/UserRoute"));
const http_1 = require("http");
const client_1 = require("@prisma/client");
const socket_io_1 = require("socket.io");
const FriendRequest_1 = __importDefault(require("./routes/FriendRequest"));
const Friends_1 = __importDefault(require("./routes/Friends"));
const OneVOne_1 = __importDefault(require("./routes/OneVOne"));
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
(0, dotenv_1.config)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, express_fileupload_1.default)({ useTempFiles: true }));
app.use('/api/message', MessageRoute_1.default);
app.use('/api/user', UserRoute_1.default);
app.use('/api/', FriendRequest_1.default);
app.use('/api/friends', Friends_1.default);
app.use('/api/oneVone', OneVOne_1.default);
exports.io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
        methods: ['GET', 'POST'],
        credentials: true
    }
});
const oneV1Chat = exports.io.of('/friend');
exports.io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);
    socket.on("joinRoom", (room) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            socket.join(room);
        }
        catch (error) {
            console.error(`Error joining room ${room}:`, error);
        }
    }));
    socket.on("message", ({ room, message, senderId, imgUrl, name }) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            exports.io.to(room).emit("message", { message, createdAt: new Date().toISOString(), sender: { id: senderId, image: imgUrl, name: name } });
            const group = yield prisma.group.findFirst({
                where: { groupName: room },
                select: { id: true }
            });
            if (group) {
                yield prisma.message.create({
                    data: {
                        message: message,
                        groupId: group.id,
                        senderId: senderId
                    }
                });
            }
            else {
                socket.emit("error", `Group ${room} not found`);
            }
        }
        catch (error) {
            socket.emit("error", `Error handling message in room ${room}`);
        }
    }));
    socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});
oneV1Chat.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    // Handle joining a room
    socket.on("JoinRoom", (roomId) => {
        console.log(`User ${socket.id} joining room: ${roomId}`);
        socket.join(roomId);
    });
    // Handle sending messages
    socket.on('message', ({ roomId, message, senderId, receiverId, image, name }) => __awaiter(void 0, void 0, void 0, function* () {
        const date = new Date();
        console.log(message, roomId);
        oneV1Chat.to(roomId).emit('message', { message, senderId, sender: { image, name }, date });
        //create message:---
        yield prisma.oneVOneMessage.create({
            data: {
                receiverId,
                senderId,
                message,
                ChatId: roomId
            }
        });
    }));
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});
process.on("SIGINT", () => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
    process.exit();
}));
process.on("SIGTERM", () => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
    process.exit();
}));
httpServer.listen(3000, () => {
    console.log('Server is running on port 3000');
});
