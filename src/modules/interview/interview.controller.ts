import { NextFunction, Response } from "express";
import createHttpError from "http-errors";

import { AuthRequest } from "../../types/authRequest";
import {
  createInterview as createInterviewService,
  getMyInterviews as getMyInterviewsService,
  getInterviewById as getInterviewByIdService,
} from "./interview.service";

import { startInterviewEngine, submitAnswerEngine } from "./interview.engine";
import { getOrGenerateReport } from "../feedback/feedback.engine";

const createInterview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      mode,
      skills,
      difficulty,
      duration,
      resume,
      experienceLevel,
    } = req.body;

    // Basic validation only
    if (!mode || !difficulty || !duration) {
      throw createHttpError(
        400,
        "Mode, difficulty and duration are required."
      );
    }

    const interview = await createInterviewService({
      owner: req.user._id,
      mode,
      skills: skills || [],
      difficulty,
      duration,
      resume,
      experienceLevel,
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
      req.user._id.toString()
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
      req.user._id.toString()
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
    const { id: interviewId } = req.params;
    const userId = req.user._id.toString();

    if (!interviewId) {
      throw createHttpError(400, "Interview ID is required.");
    }

    const result = await startInterviewEngine(interviewId, userId);

    res.status(200).json({
      success: true,
      message: "Interview started successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const submitAnswer = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { questionId, transcript } = req.body;

    if (!questionId || !transcript) {
      throw createHttpError(400, "questionId and transcript are required.");
    }

    const result = await submitAnswerEngine(req.user._id.toString(), {
      interviewId: req.params.id,
      questionId,
      transcript,
    });

    res.status(200).json({
      success: true,
      message: result.interviewComplete
        ? "Interview completed"
        : "Answer submitted successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getInterviewReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const report = await getOrGenerateReport(
      req.params.id,
      req.user._id.toString(),
    );

    res.status(200).json({
      success: true,
      data: report,
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
  submitAnswer,
  getInterviewReport
};