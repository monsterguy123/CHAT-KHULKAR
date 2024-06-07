import { Socket } from "socket.io";
import JWT from 'jsonwebtoken';
import { ExtendedError } from 'socket.io/dist/namespace';

interface TokenPayload {
  id: string;
  iat: number;
  exp: number;
}

export const authMiddleware = (socket: Socket, next: (err?: ExtendedError) => void) => {
  const token = socket.handshake.query.token;

  if (!token || typeof token !== 'string') {
    return next(new Error('Authentication error: Token is missing or invalid.'));
  }

  try {
    const decoded = JWT.verify(token, process.env.JWTPRIVATEKEY || " ") as TokenPayload;
    if (decoded && decoded.id) {
      socket.data.userId = decoded.id;
      return next();
    } else {
      return next(new Error('Authentication error: Invalid token payload.'));
    }
  } catch (error:any) {
    console.error('Authentication error:', error.message);
    return next(new Error('Authentication error: Token verification failed.'));
  }
};

