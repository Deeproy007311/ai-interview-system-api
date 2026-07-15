import { Types } from "mongoose";
import { QuestionSection } from "./question.types";

export interface CreateQuestionDTO {
  interview: Types.ObjectId;

  order: number;

  section: QuestionSection;

  question: string;

  expectedTopics: string[];

  isFollowUp?: boolean;

  parentQuestion?: Types.ObjectId | null;
}
