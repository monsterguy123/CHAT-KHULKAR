import { Request,Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();


export const getRoom = async(req:Request,res:Response)=>{
    try {
        const friendId = req.params.id;
        const userId = req.userId;

        const room1 = await prisma.oneVOneChat.findFirst({
            where:{
                user1Id:userId,
                user2Id:friendId
            },
            select:{
                id:true
            }
        })
        let room2;
        if(!room1){
            room2 = await prisma.oneVOneChat.findFirst({
                where:{
                    user1Id:friendId,
                    user2Id:userId
                },
                select:{
                    id:true
                }
            })
        }
        if(room2){
            return res.status(200).json({room2});
        }
        if(room1){
            return res.status(200).json({room1});
        }

        return res.json({msg:"error occured..."});

    } catch (error:any) {
        return res.json({msg:error.message})
    }
}

export const getRoomMessages = async(req:Request,res:Response)=>{
    try {
        
        const roomId = req.params.id;


        const message = await prisma.oneVOneMessage.findMany({
            where:{
                ChatId:roomId
            },
            select:{
                id:true,
                senderId:true,
                message:true,
                date:true,
                sender:{
                    select:{
                        name:true,
                        image:true
                    }
                }
            }
        })


        return res.status(200).json({message});

    } catch (error:any) {
        return res.json({msg:error.message});
    }
}