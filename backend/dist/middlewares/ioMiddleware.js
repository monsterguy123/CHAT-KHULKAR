"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (socket, next) => {
    const token = socket.handshake.query.token;
    if (!token || typeof token !== 'string') {
        return next(new Error('Authentication error: Token is missing or invalid.'));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWTPRIVATEKEY || " ");
        if (decoded && decoded.id) {
            socket.data.userId = decoded.id;
            return next();
        }
        else {
            return next(new Error('Authentication error: Invalid token payload.'));
        }
    }
    catch (error) {
        console.error('Authentication error:', error.message);
        return next(new Error('Authentication error: Token verification failed.'));
    }
};
exports.authMiddleware = authMiddleware;
