import { Router } from "express";
import { userInfo, userSignIn, userSignUp } from "../controller/UserController";
import { usermiddleware } from "../middlewares/userMiddleware";
const userRouter = Router();

userRouter.post('/signup',userSignUp);
userRouter.post('/signin',userSignIn);
userRouter.get('/info',usermiddleware,userInfo);

export default userRouter;