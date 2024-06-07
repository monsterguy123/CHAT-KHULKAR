"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usermiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const usermiddleware = (req, res, next) => {
    const authorizationHeader = req.headers["authorization"];
    if (!authorizationHeader) {
        return res.status(401).json({ msg: "Authorization header is missing" });
    }
    const token = authorizationHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ msg: "Token is missing" });
    }
    try {
        const object = jsonwebtoken_1.default.verify(token, process.env.JWTPRIVATEKEY || " ");
        if (object && object.id) {
            req.userId = object.id;
            return next();
        }
        else {
            return res.status(401).json({ msg: "Invalid token" });
        }
    }
    catch (error) {
        console.error(error.message);
        return res.status(401).json({ msg: "Error in token verification", error: error.message });
    }
};
exports.usermiddleware = usermiddleware;
