import express from "express";

import auth from "../../middleware/auth";
import { createInterview, getMyInterviews } from "./interview.controller";

const interviewRouter = express.Router();

interviewRouter.post("/", auth, createInterview);

interviewRouter.get("/", auth, getMyInterviews);

export default interviewRouter;