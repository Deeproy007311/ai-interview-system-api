import { HydratedDocument, Types } from "mongoose";

export type InterviewMode = "resume" | "skills" | "mixed" | "hr";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type ExperienceLevel = "fresher" | "experienced";

export type InterviewStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface IInterview {
  owner: Types.ObjectId;

  mode: InterviewMode;

  skills: string[];

  difficulty: Difficulty;

  duration: number;

  status: InterviewStatus;

  resume: Types.ObjectId | null;

  experienceLevel: ExperienceLevel | null;

  startedAt: Date | null;

  endedAt: Date | null;
}

export type InterviewDocument = HydratedDocument<IInterview>;
