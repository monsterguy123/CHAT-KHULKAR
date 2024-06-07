import { Router } from "express";
import { CreateRoom, GetAllRoom, GetGroupMessage } from "../controller/MessageController";
import { usermiddleware } from "../middlewares/userMiddleware";
const messageRouter = Router();

messageRouter.get('/getMessage/:groupName',usermiddleware,GetGroupMessage);
messageRouter.post('/createRoom',usermiddleware,CreateRoom)
messageRouter.get('/getallrooms',usermiddleware,GetAllRoom)

export default messageRouter;