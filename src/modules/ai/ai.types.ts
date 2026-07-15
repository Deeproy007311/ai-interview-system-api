export type InterviewMode = "resume" | "skills" | "mixed" | "hr";

export type QuestionSection =
  | "introduction"
  | "resume"
  | "technical"
  | "behavioral"
  | "hr"
  | "closing";

export interface AIQuestion {
  order: number;

  section: QuestionSection;

  question: string;

  expectedTopics: string[];
}

export interface AIInterviewPlan {
  estimatedDuration: number;

  sections: {
    name: QuestionSection;
    questions: number;
  }[];
}

export interface AIInterviewResponse {
  welcomeMessage: string;

  interviewPlan: AIInterviewPlan;

  questions: AIQuestion[];
}
