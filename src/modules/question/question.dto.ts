import { Types } from "mongoose";
import { QuestionSection, QuestionStatus } from "./question.types";

export interface CreateQuestionDTO {
  interview: Types.ObjectId;

  order: number;

  section: QuestionSection;

  question: string;

  expectedTopics: string[];

  status: QuestionStatus;

  isFollowUp?: boolean;

  parentQuestion?: Types.ObjectId | null;
}
