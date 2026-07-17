import { Schema, model } from "mongoose";
import { IAnswer } from "./answer.types";

const evaluationSchema = new Schema(
    {
        score: { type: Number, required: true, min: 0, max: 100 },
        technicalScore: { type: Number, required: true, min: 0, max: 100 },
        communicationScore: { type: Number, required: true, min: 0, max: 100 },
        confidenceScore: { type: Number, required: true, min: 0, max: 100 },
        feedback: { type: String, required: true },
        strengths: { type: [String], default: [] },
        weaknesses: { type: [String], default: [] },
        missingConcepts: { type: [String], default: [] },
    },
    { _id: false },
);

const answerSchema = new Schema<IAnswer>(
    {
        interview: {
            type: Schema.Types.ObjectId,
            ref: "Interview",
            required: true,
            index: true,
        },

        question: {
            type: Schema.Types.ObjectId,
            ref: "Question",
            required: true,
        },

        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        transcript: {
            type: String,
            required: true,
            trim: true,
        },

        // null until the AI evaluation completes — lets us distinguish
        // "answer saved, evaluation pending/failed" from "fully processed"
        evaluation: {
            type: evaluationSchema,
            default: null,
        },
    },
    { timestamps: true },
);

// One answer per question — also guards against duplicate submissions
// at the database layer, not just in application logic.
answerSchema.index({ question: 1 }, { unique: true });

export default model<IAnswer>("Answer", answerSchema);