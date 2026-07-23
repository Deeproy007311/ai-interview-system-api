import express from "express";
import { createUser, getCurrentUser, loginUser } from "./user.controller";
import auth from "../../middleware/auth";
import validate from "../../middleware/validate";
import { registerSchema, loginSchema } from "./user.validation";

const userRouter = express.Router();

// routes
userRouter.post("/register", validate(registerSchema), createUser);

userRouter.post("/login", validate(loginSchema), loginUser);

userRouter.get("/me", auth, getCurrentUser);

export default userRouter;