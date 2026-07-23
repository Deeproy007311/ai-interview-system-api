import express from "express";

import auth from "../../middleware/auth";
import { aiLimiter } from "../../middleware/rateLimiter";
import validate from "../../middleware/validate";
import {
  createInterviewSchema,
  submitAnswerSchema,
  interviewIdParamSchema,
} from "./interview.validation";

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
interviewRouter.post(
  "/",
  auth,
  validate(createInterviewSchema),
  createInterview,
);

// Get All Interviews
interviewRouter.get("/", auth, getMyInterviews);

// Get Interview By Id
interviewRouter.get(
  "/:id",
  auth,
  validate(interviewIdParamSchema, "params"),
  getInterviewById,
);

// Start Interview
interviewRouter.post(
  "/:id/start",
  auth,
  validate(interviewIdParamSchema, "params"),
  aiLimiter,
  startInterview,
);

interviewRouter.post(
  "/:id/answer",
  auth,
  validate(interviewIdParamSchema, "params"),
  validate(submitAnswerSchema),
  aiLimiter,
  submitAnswer,
);

interviewRouter.post(
  "/:id/report",
  auth,
  validate(interviewIdParamSchema, "params"),
  aiLimiter,
  getInterviewReport,
);

export default interviewRouter;