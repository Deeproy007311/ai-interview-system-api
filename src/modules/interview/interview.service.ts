import { Types } from "mongoose";
import createHttpError from "http-errors";

import InterviewModel from "./interview.model";
import { CreateInterviewDTO } from "./interview.dto";

import { getResumeById } from "../resume/resume.service";

const createInterview = async (data: CreateInterviewDTO) => {
  // Allow only one active interview
  const activeInterview = await InterviewModel.findOne({
    owner: data.owner,
    status: {
      $in: ["pending", "in_progress"],
    },
  });

  if (activeInterview) {
    throw createHttpError(409, "You already have an active interview.");
  }

  // Resume Interview
  if (data.mode === "resume") {
    if (!data.resume) {
      throw createHttpError(400, "Resume is required for resume interview.");
    }

    const resume = await getResumeById(data.resume.toString());

    if (!resume) {
      throw createHttpError(404, "Resume not found.");
    }

    if (resume.owner.toString() !== data.owner.toString()) {
      throw createHttpError(403, "You are not authorized to use this resume.");
    }
  }

  // Skills Interview
  if (data.mode === "skills") {
    if (!data.skills.length) {
      throw createHttpError(400, "Please select at least one skill.");
    }
  }

  // Mixed Interview
  if (data.mode === "mixed") {
    if (!data.resume) {
      throw createHttpError(400, "Resume is required for mixed interview.");
    }

    const resume = await getResumeById(data.resume.toString());

    if (!resume) {
      throw createHttpError(404, "Resume not found.");
    }

    if (resume.owner.toString() !== data.owner.toString()) {
      throw createHttpError(403, "You are not authorized to use this resume.");
    }

    if (!data.skills.length) {
      throw createHttpError(400, "Please select at least one skill.");
    }
  }

  // HR Interview
  if (data.mode === "hr") {
    if (!data.experienceLevel) {
      throw createHttpError(400, "Experience level is required.");
    }
  }

  const interview = await InterviewModel.create(data);

  return interview;
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
    throw createHttpError(404, "Interview not found");
  }

  if (interview.owner.toString() !== userId) {
    throw createHttpError(403, "You are not allowed to access this interview.");
  }

  return interview;
};

const startInterview = async (interviewId: string, userId: string) => {
  const interview = await getInterviewById(interviewId, userId);

  if (interview.status === "completed") {
    throw createHttpError(400, "Interview has already been completed.");
  }

  if (interview.status === "cancelled") {
    throw createHttpError(400, "Interview has been cancelled.");
  }

  if (interview.status === "in_progress") {
    throw createHttpError(400, "Interview is already in progress.");
  }

  interview.status = "in_progress";
  interview.startedAt = new Date();

  await interview.save();

  return interview;
};

export { createInterview, getMyInterviews, getInterviewById, startInterview };
