import { Server } from "socket.io";
import { createServer } from "http";
import { PrismaClient } from "@prisma/client";
import cors from 'cors';
import express, { Application, Request, Response } from 'express';

const prisma = new PrismaClient();
const app: Application = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const adminNamespace = io.of('/admin');

interface Message {
  room: string;
  message: string;
}

app.use(cors());
app.use(express.json())

//get the message of the rooms
app.get('/getMessage/:groupName', async (req: Request, res: Response) => {
  try {
    const groupName = req.params.groupName;

    if (groupName === 'null') {
      return res.json({ msg: [{ msg: "" }] });
    }

    // Get group id
    const group = await prisma.group.findFirst({
      where: { groupName }
    });

    if (group?.id) {
      const data = await prisma.message.findMany({
        where: { groupId: group.id },
        select: { message: true }
      });
      return res.json({ msg: data });
    }

    return res.json({ msg: "no group as such..." });

  } catch (error: any) {
    console.error(error.message);
    return res.json({ msg: error.message });
  }
});

//Create Rooms of our choice:---
app.post('/createRoom', async (req: Request, res: Response) => {
  try {
    const { roomName, roomStatus } = req.body;

    const group = await prisma.group.findFirst({
       where:{
          groupName:roomName
       }
    })

    if(group?.id){
       return res.json({msg:"Room has already been created plz try different name..."})
    }

    const newRoom = await prisma.group.create({
      data: {
        groupName: roomName,
        groupStatus: roomStatus
      }
    });

    return res.status(201).json({ msg: "Room created successfully..."});

  } catch (error:any) {
    console.error('Error creating room:', error);
    return res.status(500).json({ msg: "An error occurred while creating the room.", error: error.message });
  }
});

//show All room:---
app.get('/getallrooms',async(req:Request,res:Response)=>{
    try {
      
      const rooms = await prisma.group.findMany({});
      return res.status(201).json({rooms});

    } catch (error:any) {
        return res.json({msg:error.message})
    }
})

adminNamespace.on("connection", (socket) => {
  console.log(`Client connected to /admin: ${socket.id}`);

  socket.on('joinRoom', async (room) => {
    try {
      socket.join(room);
    } catch (error) {
      console.error(`Error joining room ${room}:`, error);
    }
  });

  socket.on('message', async ({ room, message }: Message) => {
    try {
      console.log(message)
      adminNamespace.to(room).emit('message', { message });

      const group = await prisma.group.findFirst({
        where: { groupName: room },
        select: { id: true }
      });

      if (group) {
        await prisma.message.create({
          data: {
            message: message,
            groupId: group.id
          }
        });
      }
    } catch (error) {
      console.error(`Error handling message in room ${room}:`, error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected from /admin: ${socket.id}`);
  });
});

httpServer.listen(3000, () => {
  console.log('Server is running on port 3000');
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit();
});
