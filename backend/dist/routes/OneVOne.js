"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userMiddleware_1 = require("../middlewares/userMiddleware");
const OneVOneController_1 = require("../controller/OneVOneController");
const OneVOneRouter = (0, express_1.Router)();
OneVOneRouter.get('/room/:id', userMiddleware_1.usermiddleware, OneVOneController_1.getRoom);
OneVOneRouter.get('/getRoomMessages/:id', userMiddleware_1.usermiddleware, OneVOneController_1.getRoomMessages);
exports.default = OneVOneRouter;
