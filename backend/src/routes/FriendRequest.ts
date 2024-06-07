import { Router } from "express";
import { usermiddleware } from "../middlewares/userMiddleware";
import { DeleteRequest, addFriend, getRequests, sentRequest } from "../controller/FriendRequestController";
const FriendRequestRouter = Router();

FriendRequestRouter.post('/friendRequest',usermiddleware,sentRequest);
FriendRequestRouter.get('/requests',usermiddleware,getRequests);
FriendRequestRouter.put('/declineRequest',usermiddleware,DeleteRequest);
FriendRequestRouter.post('/addFriend',usermiddleware,addFriend);

export default FriendRequestRouter;