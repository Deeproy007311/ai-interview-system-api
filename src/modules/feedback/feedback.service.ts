import { Types } from "mongoose";
import createHttpError from "http-errors";

import FeedbackReportModel from "./feedback.model";
import { CreateFeedbackReportDTO } from "./feedback.dto";

const getReportByInterview = async (interviewId: string) => {
    if (!Types.ObjectId.isValid(interviewId)) {
        throw createHttpError(400, "Invalid interview id.");
    }

    return await FeedbackReportModel.findOne({ interview: interviewId });
};

const createReport = async (data: CreateFeedbackReportDTO) => {
    return await FeedbackReportModel.create(data);
};

export { getReportByInterview, createReport };