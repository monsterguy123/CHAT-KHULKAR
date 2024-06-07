import { Request, Response, NextFunction } from "express";
import JWT from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const usermiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authorizationHeader = req.headers["authorization"];
  if (!authorizationHeader) {
    return res.status(401).json({ msg: "Authorization header is missing" });
  }

  const token = authorizationHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ msg: "Token is missing" });
  }

  try {
    const object = JWT.verify(token, process.env.JWTPRIVATEKEY || " ") as { id: string };

    if (object && object.id) {
      req.userId = object.id;
      return next();
    } else {
      return res.status(401).json({ msg: "Invalid token" });
    }
  } catch (error: any) {
    console.error(error.message);
    return res.status(401).json({ msg: "Error in token verification", error: error.message });
  }
};
