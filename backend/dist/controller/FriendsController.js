"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetFriends = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const GetFriends = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const friends = yield prisma.friends.findMany({
            where: { userId: req.userId },
            select: {
                id: true,
                friend: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    }
                }
            }
        });
        return res.status(200).json({ friends });
    }
    catch (error) {
        return res.json({ msg: error.message });
    }
});
exports.GetFriends = GetFriends;
