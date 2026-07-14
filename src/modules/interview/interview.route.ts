import express from "express";

import auth from "../../middleware/auth";
import {
  createInterview,
  getMyInterviews,
  getInterviewById,
  startInterview,
} from "./interview.controller";

const interviewRouter = express.Router();

interviewRouter.post("/", auth, createInterview);

interviewRouter.get("/", auth, getMyInterviews);

interviewRouter.get("/:id", auth, getInterviewById);

interviewRouter.post("/:id/start", auth, startInterview);

export default interviewRouter;