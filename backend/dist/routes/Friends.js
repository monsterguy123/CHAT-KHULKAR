"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userMiddleware_1 = require("../middlewares/userMiddleware");
const FriendsController_1 = require("../controller/FriendsController");
const friendRouter = (0, express_1.Router)();
friendRouter.get('/getAllFriends', userMiddleware_1.usermiddleware, FriendsController_1.GetFriends);
exports.default = friendRouter;
