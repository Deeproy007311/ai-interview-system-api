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

export interface EvaluateAnswerOptions {
  question: string;
  expectedTopics: string[];
  transcript: string;
  section: QuestionSection;
  difficulty: Difficulty;
  mode: InterviewMode;
  upcomingQuestion: string | null;
  upcomingSection: QuestionSection | null;
}

export interface AIFollowUpQuestion {
  question: string;
  expectedTopics: string[];
}

export interface AIAnswerEvaluation {
  score: number;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  missingConcepts: string[];
  needsFollowUp: boolean;
  followUpQuestion: AIFollowUpQuestion | null;
  transitionMessage: string;
}