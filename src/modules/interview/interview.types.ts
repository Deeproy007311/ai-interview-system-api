import { HydratedDocument, Types } from "mongoose";

export type InterviewType = "technical" | "hr" | "resume";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type InterviewStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface IInterview {
  owner: Types.ObjectId;

  interviewType: InterviewType;

  skills: string[];

  difficulty: Difficulty;

  duration: number;

  status: InterviewStatus;

  resume?: Types.ObjectId | null;

  startedAt: Date | null;

  endedAt: Date | null;
}

export type InterviewDocument = HydratedDocument<IInterview>;