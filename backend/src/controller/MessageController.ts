import { Request,Response } from "express"
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

//get message of a group
export const GetGroupMessage = async(req:Request,res:Response)=>{
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
            select: {
               message: true,
               createdAt:true,
               sender:{
                 select:{
                    image:true,
                    name:true,
                    id:true
                 }
               }
              }
          });
          return res.json({ msg: data });
        }
    
        return res.json({ msg: "no group as such..." });
    
      } catch (error: any) {
        console.error(error.message);
        return res.json({ msg: error.message });
      }
}

//Create a room
export const CreateRoom = async (req:Request,res:Response)=>{
  try {
    const { roomName, roomStatus} = req.body;

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
        groupStatus: roomStatus,
        userId:req.userId||""
      }
    });

    return res.status(201).json({ msg: "Room created successfully..."});

  } catch (error:any) {
    console.error('Error creating room:', error);
    return res.status(500).json({ msg: "An error occurred while creating the room.", error: error.message });
  }
}

//get all rooms
export const GetAllRoom = async(req:Request,res:Response)=>{
  try {
    const rooms = await prisma.group.findMany({});
    return res.status(201).json({rooms});

  } catch (error:any) {
      return res.json({msg:error.message})
  }
}