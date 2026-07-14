import { NextFunction, Response } from "express";
import createHttpError from "http-errors";

import { AuthRequest } from "../../types/authRequest";
import {
  createInterview as createInterviewService,
  getMyInterviews as getMyInterviewsService,
} from "./interview.service";

const createInterview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { interviewType, skills, difficulty, duration } = req.body;

    if (!interviewType || !skills || !difficulty || !duration) {
      return next(createHttpError(400, "All fields are required"));
    }

    const interview = await createInterviewService({
      owner: req.user._id,
      interviewType,
      skills,
      difficulty,
      duration,
    });

    res.status(201).json({
      success: true,
      message: "Interview created successfully",
      interview,
    });
  } catch (error) {
    return next(createHttpError(500, "Failed to create interview"));
  }
};

const getMyInterviews = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const interviews = await getMyInterviewsService(
      req.user._id.toString(),
    );

    res.status(200).json({
      success: true,
      interviews,
    });
  } catch (error) {
    return next(createHttpError(500, "Failed to get interviews"));
  }
};

export { createInterview, getMyInterviews };
