import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { uploadImages } from "../cloudinary/cloudinary";
import { UploadedFile } from "express-fileupload";
import JWT from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import fs from "fs";
import path from "path";

declare global {
    namespace Express {
      interface Request {
        userId?: string;
      }
    }
  }

const prisma = new PrismaClient();

interface User {
    name: string;
    email: string;
    password: string;
}

// Ensure the temp directory exists
const ensureTempDirExists = (tempDir: string) => {
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }
}

// User Registration :---
export const userSignUp = async (req: Request, res: Response) => {
    try {
        const file = req.files?.file as UploadedFile;
        if (!file) {
            return res.status(400).json({ msg: "No file uploaded" });
        }

        const tempDir = path.join(__dirname, 'temp');
        ensureTempDirExists(tempDir);

        // Move file to a temporary location
        const tempFilePath = path.join(tempDir, file.name);
        await file.mv(tempFilePath);

        // Upload image to Cloudinary
        const url = await uploadImages(tempFilePath);

        // Delete the temporary file
        fs.unlinkSync(tempFilePath);

        if (!url) {
            return res.status(500).json({ msg: "Image upload failed" });
        }

        const { name, email, password }: User = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ msg: "Required fields are missing" });
        }

        const existingUser = await prisma.user.findFirst({
            where: { email: email }
        });

        if (existingUser) {
            return res.status(401).json({ msg: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        // Database Insertion
        const result = await prisma.user.create({
            data: {
                name,
                email,
                password: hashPassword,
                image: url,
            }
        });

        return res.status(201).json({ msg: "User has been created successfully" });
    } catch (error: any) {
        return res.status(500).json({ msg: error.message });
    }
};

//User Sign In:---
export const userSignIn = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: "Email and password are required" });
        }

        // Database find user:--
        const existingUser = await prisma.user.findFirst({
            where: { email }
        });

        if (!existingUser) {
            return res.status(401).json({ msg: "No user exists with this email" });
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ msg: "Incorrect password" });
        }

        const token = JWT.sign({ id: existingUser.id }, process.env.JWTPRIVATEKEY || "", {
            expiresIn: '3d'
        });

        return res.status(200).json({ msg: "User signed in successfully", token });
    } catch (error: any) {
        return res.status(500).json({ msg: error.message });
    }
};

//user information:---

export const userInfo = async(req:Request,res:Response)=>{
    try {
        
        const data = await prisma.user.findFirst({
            where:{id:req.userId},
            select:{
                id:true,
                image:true,
                name:true
            }
        })
        
        if(data){
            return res.status(200).json({data})
        }
        return res.json({msg:"No user data is found..."})

    } catch (error:any) {
        return res.status(500).json({msg:error.message});
    }
}