import { HydratedDocument, Types } from "mongoose";

export interface IFeedbackReport {
    interview: Types.ObjectId;
    owner: Types.ObjectId;

    overallScore: number;
    technicalScore: number;
    communicationScore: number;
    confidenceScore: number;

    totalQuestions: number;

    summary: string;

    strengths: string[];
    weaknesses: string[];
    missedConcepts: string[];
    improvementSuggestions: string[];
    learningPath: string[];
}

export type FeedbackReportDocument = HydratedDocument<IFeedbackReport>;