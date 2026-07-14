import { Types } from "mongoose";
import createHttpError from "http-errors";
import InterviewModel from "./interview.model";
import { CreateInterviewDTO } from "./interview.dto";

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
