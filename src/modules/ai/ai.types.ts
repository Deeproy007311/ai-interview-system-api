import {
  InterviewMode,
  InterviewPlan,
  Difficulty,
  ExperienceLevel,
} from "../interview/interview.types";
import { QuestionSection } from "../question/question.types";

export { InterviewMode };

export interface GenerateInterviewOptions {
  mode: InterviewMode;

  difficulty: Difficulty;

  duration: number;

  skills?: string[];

  resumeText?: string;

  experienceLevel?: ExperienceLevel | null;
}

export interface AIQuestion {
  order: number;

  section: QuestionSection;

  question: string;

  expectedTopics: string[];
}

export interface AIInterviewResponse {
  welcomeMessage: string;

  interviewPlan: InterviewPlan;

  questions: AIQuestion[];
}
