import { Types } from "mongoose";
import createHttpError from "http-errors";

import InterviewModel from "./interview.model";
import { CreateInterviewDTO } from "./interview.dto";
import { InterviewPlan } from "./interview.types";

import { getResumeById } from "../resume/resume.service";

const validateResumeOwnership = async (
  resumeId: Types.ObjectId,
  ownerId: Types.ObjectId,
) => {
  const resume = await getResumeById(resumeId.toString());

  if (!resume) {
    throw createHttpError(404, "Resume not found.");
  }

  if (resume.owner.toString() !== ownerId.toString()) {
    throw createHttpError(403, "You are not authorized to use this resume.");
  }

  return resume;
};

const createInterview = async (data: CreateInterviewDTO) => {
  const activeInterview = await InterviewModel.findOne({
    owner: data.owner,
    status: {
      $in: ["pending", "in_progress"],
    },
  });

  if (activeInterview) {
    throw createHttpError(409, "You already have an active interview.");
  }

  switch (data.mode) {
    case "resume":
      if (!data.resume) {
        throw createHttpError(400, "Resume is required for resume interview.");
      }

      await validateResumeOwnership(data.resume, data.owner);
      break;

    case "skills":
      if (!data.skills.length) {
        throw createHttpError(400, "Please select at least one skill.");
      }
      break;

    case "mixed":
      if (!data.resume) {
        throw createHttpError(400, "Resume is required for mixed interview.");
      }

      await validateResumeOwnership(data.resume, data.owner);

      if (!data.skills.length) {
        throw createHttpError(400, "Please select at least one skill.");
      }
      break;

    case "hr":
      if (!data.experienceLevel) {
        throw createHttpError(400, "Experience level is required.");
      }
      break;
  }

  return await InterviewModel.create(data);
};

const getMyInterviews = async (userId: string) => {
  return await InterviewModel.find({
    owner: userId,
  }).sort({
    createdAt: -1,
  });
};

const getInterviewById = async (interviewId: string, userId: string) => {
  if (!Types.ObjectId.isValid(interviewId)) {
    throw createHttpError(400, "Invalid interview id.");
  }

  const interview = await InterviewModel.findById(interviewId);

  if (!interview) {
    throw createHttpError(404, "Interview not found.");
  }

  if (interview.owner.toString() !== userId) {
    throw createHttpError(403, "You are not allowed to access this interview.");
  }

  return interview;
};

const startInterview = async (interviewId: string, userId: string) => {
  const interview = await getInterviewById(interviewId, userId);

  if (interview.status !== "pending") {
    switch (interview.status) {
      case "in_progress":
        throw createHttpError(400, "Interview is already in progress.");
      case "completed":
        throw createHttpError(400, "Interview has already been completed.");
      case "cancelled":
        throw createHttpError(400, "Interview has been cancelled.");
      default:
        throw createHttpError(400, "Interview cannot be started.");
    }
  }

  return interview;
};

const saveInterviewContent = async (
  interviewId: string,
  content: {
    interviewPlan: InterviewPlan;
    welcomeMessage: string;
  },
) => {
  const interview = await InterviewModel.findById(interviewId);

  if (!interview) {
    throw createHttpError(404, "Interview not found.");
  }

  interview.interviewPlan = content.interviewPlan;
  interview.welcomeMessage = content.welcomeMessage;

  await interview.save();

  return interview;
};

const markInterviewStarted = async (interviewId: string) => {
  const interview = await InterviewModel.findById(interviewId);

  if (!interview) {
    throw createHttpError(404, "Interview not found.");
  }

  interview.status = "in_progress";
  interview.startedAt = new Date();

  await interview.save();

  return interview;
};

const completeInterview = async (interviewId: string) => {
  const interview = await InterviewModel.findById(interviewId);

  if (!interview) {
    throw createHttpError(404, "Interview not found.");
  }

  interview.status = "completed";
  interview.endedAt = new Date();

  await interview.save();

  return interview;
};

const cancelInterview = async (interviewId: string) => {
  const interview = await InterviewModel.findById(interviewId);

  if (!interview) {
    throw createHttpError(404, "Interview not found.");
  }

  interview.status = "cancelled";
  interview.endedAt = new Date();

  await interview.save();

  return interview;
};

export {
  createInterview,
  getMyInterviews,
  getInterviewById,
  startInterview,
  saveInterviewContent,
  markInterviewStarted,
  completeInterview,
  cancelInterview,
};
