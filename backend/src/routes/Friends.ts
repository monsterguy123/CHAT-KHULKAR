import { Router } from "express";
import { usermiddleware } from "../middlewares/userMiddleware";
import { GetFriends } from "../controller/FriendsController";
const friendRouter = Router();

friendRouter.get('/getAllFriends',usermiddleware,GetFriends)

export default friendRouter;