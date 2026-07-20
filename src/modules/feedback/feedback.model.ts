import { Schema, model } from "mongoose";
import { IFeedbackReport } from "./feedback.types";

const feedbackReportSchema = new Schema<IFeedbackReport>(
    {
        interview: {
            type: Schema.Types.ObjectId,
            ref: "Interview",
            required: true,
            unique: true,
            index: true,
        },

        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        overallScore: { type: Number, required: true, min: 0, max: 100 },
        technicalScore: { type: Number, required: true, min: 0, max: 100 },
        communicationScore: { type: Number, required: true, min: 0, max: 100 },
        confidenceScore: { type: Number, required: true, min: 0, max: 100 },

        totalQuestions: { type: Number, required: true, min: 0 },

        summary: {
            type: String,
            required: true,
        },

        strengths: { type: [String], default: [] },
        weaknesses: { type: [String], default: [] },
        missedConcepts: { type: [String], default: [] },
        improvementSuggestions: { type: [String], default: [] },
        learningPath: { type: [String], default: [] },
    },
    { timestamps: true },
);

export default model<IFeedbackReport>("FeedbackReport", feedbackReportSchema);