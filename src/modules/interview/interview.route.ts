import express from "express";

import auth from "../../middleware/auth";

import {
  createInterview,
  getMyInterviews,
  getInterviewById,
  startInterview,
  submitAnswer,
} from "./interview.controller";

const interviewRouter = express.Router();

// Create Interview
interviewRouter.post("/", auth, createInterview);

// Get All Interviews
interviewRouter.get("/", auth, getMyInterviews);

// Get Interview By Id
interviewRouter.get("/:id", auth, getInterviewById);

// Start Interview
interviewRouter.post("/:id/start", auth, startInterview);

interviewRouter.post("/:id/answer", auth, submitAnswer);

export default interviewRouter;