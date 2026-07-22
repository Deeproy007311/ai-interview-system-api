import express from "express";

import auth from "../../middleware/auth";
import { aiLimiter } from "../../middleware/rateLimiter";

import {
  createInterview,
  getMyInterviews,
  getInterviewById,
  startInterview,
  submitAnswer,
  getInterviewReport,
} from "./interview.controller";

const interviewRouter = express.Router();

// Create Interview
interviewRouter.post("/", auth, createInterview);

// Get All Interviews
interviewRouter.get("/", auth, getMyInterviews);

// Get Interview By Id
interviewRouter.get("/:id", auth, getInterviewById);

// Start Interview
interviewRouter.post("/:id/start", auth, aiLimiter, startInterview);

interviewRouter.post("/:id/answer", auth, aiLimiter, submitAnswer);

interviewRouter.post("/:id/report", auth, aiLimiter, getInterviewReport);

export default interviewRouter;