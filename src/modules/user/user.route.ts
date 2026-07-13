import express from "express";
import { createUser, getCurrentUser, loginUser } from "./user.controller";
import auth from "../../middleware/auth";

const userRouter = express.Router();

// routes
userRouter.post("/register", createUser);

userRouter.post("/login", loginUser);

userRouter.get("/me", auth, getCurrentUser);




export default userRouter;
