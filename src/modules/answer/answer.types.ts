import { HydratedDocument, Types } from "mongoose";

export interface IAnswerEvaluation {
    score: number;
    technicalScore: number;
    communicationScore: number;
    confidenceScore: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
    missingConcepts: string[];
}

export interface IAnswer {
    interview: Types.ObjectId;
    question: Types.ObjectId;
    owner: Types.ObjectId;
    transcript: string;
    evaluation: IAnswerEvaluation | null;
}

export type AnswerDocument = HydratedDocument<IAnswer>;