import { HydratedDocument, Types } from "mongoose";

export type QuestionSection =
  | "introduction"
  | "resume"
  | "technical"
  | "behavioral"
  | "hr"
  | "closing";

export type QuestionStatus = "pending" | "asked" | "answered" | "evaluated";

export interface IQuestion {
  interview: Types.ObjectId;

  order: number;

  section: QuestionSection;

  question: string;

  expectedTopics: string[];

  status: QuestionStatus;

  isFollowUp: boolean;

  parentQuestion: Types.ObjectId | null;
}

export type QuestionDocument = HydratedDocument<IQuestion>;
