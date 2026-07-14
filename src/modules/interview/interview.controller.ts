import { NextFunction, Response } from "express";
import createHttpError from "http-errors";

import { AuthRequest } from "../../types/authRequest";
import {
  createInterview as createInterviewService,
  getMyInterviews as getMyInterviewsService,
  getInterviewById as getInterviewByIdService,
  startInterview as startInterviewService,
} from "./interview.service";

const createInterview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { interviewType, skills, difficulty, duration } = req.body;

    if (!interviewType || !skills || !difficulty || !duration) {
      throw createHttpError(400, "All fields are required");
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
      data: interview,
    });
  } catch (error) {
    next(error);
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
      data: interviews,
    });
  } catch (error) {
    next(error);
  }
};

const getInterviewById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const interview = await getInterviewByIdService(
      req.params.id,
      req.user._id.toString(),
    );

    res.status(200).json({
      success: true,
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

const startInterview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const interview = await startInterviewService(
      req.params.id,
      req.user._id.toString(),
    );

    res.status(200).json({
      success: true,
      message: "Interview started successfully",
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

export {
  createInterview,
  getMyInterviews,
  getInterviewById,
  startInterview,
};