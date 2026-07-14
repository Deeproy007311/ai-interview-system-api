import createHttpError from "http-errors";
import InterviewModel from "./interview.model";
import { CreateInterviewDTO } from "./interview.dto";

const createInterview = async (
  data: CreateInterviewDTO) => {
  const activeInterview = await InterviewModel.findOne({
    owner: data.owner,
    status: {
      $in: ["pending", "in_progress"],
    },
  });

  if (activeInterview) {
    throw createHttpError(409, "You already have an active interview.");
  }

  return await InterviewModel.create(data);
};

const getMyInterviews = async (userId: string) => {
  return await InterviewModel.find({ owner: userId }).sort({
    createdAt: -1,
  });
};

export { createInterview, getMyInterviews };
