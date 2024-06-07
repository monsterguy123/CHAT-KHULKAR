import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

const prisma = new PrismaClient();

//sent request:---
export const sentRequest = async (req: Request, res: Response) => {
    try {
        const { friendId } = req.body;
        const userId = req.userId;

        if (!friendId || !userId) {
            return res.status(400).json({ msg: "Invalid request data." });
        }

        //check if already a friend or not:---
        const alreadyFriend = await prisma.friends.findFirst({
            where:{userId,friendId}
        })

        if(alreadyFriend){
            return res.json({msg:"already a friend no need to send request..."})
        }

        // Check if the request was already sent
        const alreadySent = await prisma.addFriendNotification.findFirst({
            where: { friendId, userId }
        });

        if (alreadySent) {
            return res.json({ msg: "Already sent request." });
        }

        const data = await prisma.addFriendNotification.create({
            data: {
                userId: userId,
                friendId: friendId
            }
        });

        res.status(201).json({ msg: "Request sent successfully." });

    } catch (error: any) {
        console.log(error.message);
        res.status(500).json({ msg: "Internal server error." });
    }
};

// Get friend requests
export const getRequests = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(400).json({ msg: "Invalid user ID." });
        }

        const data = await prisma.addFriendNotification.findMany({
            where: { friendId: userId },
            select: {
                id:true,
                user: {
                    select: {
                        id:true,
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

    } catch (error: any) {
        console.log(error.message);
        res.status(500).json({ msg: "Internal server error." });
    }
};

//Add a firend:---
export const addFriend = async (req: Request, res: Response) => {
    try {
        const { friendId, id } = req.body;
        const userId = req.userId;

        if (!friendId || !id || !userId) {
            return res.status(400).json({ msg: "Invalid request data." });
        }


        // Check if the friend request exists
        const friendRequest = await prisma.addFriendNotification.findUnique({
            where: { id }
        });

        if (!friendRequest) {
            return res.status(404).json({ msg: "Friend request not found." });
        }

        // Delete the friend request
        await prisma.addFriendNotification.delete({
            where: { id }
        });

        // Create friend
        await prisma.friends.create({
            data: {
                userId: userId,
                friendId: friendId
            }
        });

        await prisma.friends.create({
            data: {
                userId: friendId,
                friendId: userId
            }
        });

        //Create OneVOneChat:---
        const OneVOneChat = await prisma.oneVOneChat.create({
            data:{
                user1Id:userId,
                user2Id:friendId
            }
        })

        return res.status(201).json({ msg: "Request Accepted." });

    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ msg: error.message });
    }
};


//Delete Request:---
export const DeleteRequest = async (req:Request,res:Response)=>{
      try {
        
        const {id} = req.body;

        //delete a request from database:--
        await prisma.addFriendNotification.delete({
            where:{
                id:id
            }
        })

         return res.json({msg:"FriendRequest Declined..."})

      } catch (error:any) {
          console.log(error.message)
      }
}