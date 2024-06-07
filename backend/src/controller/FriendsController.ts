import { PrismaClient } from "@prisma/client";
import { Request,Response } from "express";
const prisma = new PrismaClient();

export const GetFriends = async(req:Request,res:Response)=>{
    try {
        
        const friends = await prisma.friends.findMany({
            where:{userId:req.userId},
            select:{
                id:true,
                friend:{
                    select:{
                        id:true,
                        name:true,
                        image:true,
                    }
                }
            }
        })

        return res.status(200).json({friends});

    } catch (error:any) {
        return res.json({msg:error.message});
    }
}