import { Router } from "express";
import { usermiddleware } from "../middlewares/userMiddleware";
import { getRoom, getRoomMessages } from "../controller/OneVOneController";
const OneVOneRouter = Router();

OneVOneRouter.get('/room/:id',usermiddleware,getRoom)
OneVOneRouter.get('/getRoomMessages/:id',usermiddleware,getRoomMessages)

export default OneVOneRouter;