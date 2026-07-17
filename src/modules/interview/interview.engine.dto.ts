import { InterviewPlan } from "./interview.types";
import { QuestionSection } from "../question/question.types";

export interface InterviewQuestionDTO {
  id: string;
  order: number;
  section: QuestionSection;
  question: string;
}

export interface StartInterviewResponseDTO {
  welcomeMessage: string;
  interviewPlan: InterviewPlan;
  firstQuestion: InterviewQuestionDTO;
  totalQuestions: number;
}

export interface SubmitAnswerInput {
  interviewId: string;
  questionId: string;
  transcript: string;
}

export interface SubmitAnswerResponseDTO {
  interviewComplete: boolean;
  nextQuestion: InterviewQuestionDTO | null;
  totalQuestions: number;
}