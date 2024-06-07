import cors from 'cors';
import { config } from 'dotenv';
import fileUpload from 'express-fileupload';
import express, { Application } from 'express';
import messageRouter from "./routes/MessageRoute";
import userRouter from "./routes/UserRoute";
import { createServer } from 'http';
import { PrismaClient } from "@prisma/client";
import { Socket, Server } from "socket.io";
import FriendRequestRouter from './routes/FriendRequest';
import friendRouter from './routes/Friends';
import OneVOneRouter from './routes/OneVOne';

const prisma = new PrismaClient();
const app: Application = express();
const httpServer = createServer(app);

config();
app.use(cors());
app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));

app.use('/api/message', messageRouter);
app.use('/api/user', userRouter);
app.use('/api/', FriendRequestRouter);
app.use('/api/friends', friendRouter);
app.use('/api/oneVone', OneVOneRouter);

export const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const oneV1Chat = io.of('/friend');

interface Message {
  room: string;
  message: string;
  senderId: string;
  imgUrl: string;
  name: string;
}

io.on("connection", (socket: Socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("joinRoom", async (room: string) => {
    try {
      socket.join(room);
    } catch (error) {
      console.error(`Error joining room ${room}:`, error);
    }
  });

  socket.on("message", async ({ room, message, senderId, imgUrl, name }: Message) => {
    try {

      io.to(room).emit("message", { message, createdAt: new Date().toISOString(), sender: { id: senderId, image: imgUrl, name: name } });

      const group = await prisma.group.findFirst({
        where: { groupName: room },
        select: { id: true }
      });

      if (group) {
        await prisma.message.create({
          data: {
            message: message,
            groupId: group.id,
            senderId: senderId
          }
        });
      } else {
        socket.emit("error", `Group ${room} not found`);
      }
    } catch (error) {
      socket.emit("error", `Error handling message in room ${room}`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

oneV1Chat.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle joining a room
  socket.on("JoinRoom", (roomId: string) => {
    console.log(`User ${socket.id} joining room: ${roomId}`);
    socket.join(roomId);
  });

  // Handle sending messages
  socket.on('message', async({ roomId, message, senderId, receiverId, image, name }: { roomId: string; message: string; senderId: string; receiverId: string; image: string; name: string }) => {
    const date = new Date();
    console.log(message,roomId)
    oneV1Chat.to(roomId).emit('message', { message, senderId, sender:{image, name}, date });
  
    //create message:---
    await prisma.oneVOneMessage.create({
        data:{
           receiverId,
           senderId,
           message,
           ChatId:roomId
        }
      })
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit();
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit();
});

httpServer.listen(3000, () => {
  console.log('Server is running on port 3000');
});
