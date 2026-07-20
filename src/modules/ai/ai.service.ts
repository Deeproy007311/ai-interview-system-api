import createHttpError from "http-errors";

import {
  AIInterviewResponse,
  GenerateInterviewOptions,
  AIAnswerEvaluation,
  EvaluateAnswerOptions,
  AIFeedbackReport,
  GenerateReportOptions,
} from "./ai.types";
import {
  buildInterviewPrompt,
  buildEvaluationPrompt,
  buildReportPrompt,
} from "./ai.prompt";
import { QuestionSection } from "../question/question.types";

import { generateCompletion } from "../../services/llm.service";

const VALID_SECTIONS: QuestionSection[] = [
  "introduction",
  "resume",
  "technical",
  "behavioral",
  "hr",
  "closing",
];

const isValidSection = (value: unknown): value is QuestionSection =>
  typeof value === "string" &&
  VALID_SECTIONS.includes(value as QuestionSection);

const validateAIResponse = (parsed: AIInterviewResponse): void => {
  if (!parsed.welcomeMessage || typeof parsed.welcomeMessage !== "string") {
    throw new Error("AI response is missing a welcome message.");
  }

  if (
    !parsed.interviewPlan ||
    !Array.isArray(parsed.interviewPlan.sections) ||
    parsed.interviewPlan.sections.length === 0
  ) {
    throw new Error("AI response is missing a valid interview plan.");
  }

  for (const section of parsed.interviewPlan.sections) {
    if (!isValidSection(section.name)) {
      throw new Error(
        `AI response contains an invalid plan section: ${section.name}`,
      );
    }

    if (typeof section.questions !== "number" || section.questions < 0) {
      throw new Error(
        `AI response has an invalid question count for section: ${section.name}`,
      );
    }
  }

  if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
    throw new Error("AI returned no questions.");
  }

  for (const question of parsed.questions) {
    if (!isValidSection(question.section)) {
      throw new Error(
        `AI generated a question with an invalid section: ${question.section}`,
      );
    }

    if (
      !question.question ||
      typeof question.question !== "string" ||
      !question.question.trim()
    ) {
      throw new Error("AI generated a question with empty text.");
    }

    if (!Array.isArray(question.expectedTopics)) {
      question.expectedTopics = [];
    }
  }
};

const parseAIResponse = (content: string): AIInterviewResponse => {
  let parsed: AIInterviewResponse;

  try {
    parsed = JSON.parse(content) as AIInterviewResponse;
  } catch (error) {
    console.error("AI Response JSON Parse Error:", error);
    throw createHttpError(500, "AI returned malformed JSON.");
  }

  try {
    validateAIResponse(parsed);
  } catch (error) {
    console.error("AI Response Validation Error:", error, parsed);
    throw createHttpError(
      500,
      "AI returned an interview response in an unexpected format.",
    );
  }

  return parsed;
};

const generateInterview = async (
  options: GenerateInterviewOptions,
): Promise<AIInterviewResponse> => {
  const { systemPrompt, userPrompt } = buildInterviewPrompt(options);

  const completion = await generateCompletion({
    systemPrompt,
    userPrompt,
    temperature: 0.4,
    maxTokens: 4096,
  });

  return parseAIResponse(completion);
};

const validateEvaluationResponse = (parsed: AIAnswerEvaluation): void => {
  const scoreFields: (keyof AIAnswerEvaluation)[] = [
    "score",
    "technicalScore",
    "communicationScore",
    "confidenceScore",
  ];

  for (const field of scoreFields) {
    const value = parsed[field];
    if (typeof value !== "number" || value < 0 || value > 100) {
      throw new Error(`AI evaluation has an invalid value for ${field}.`);
    }
  }

  if (!parsed.feedback || typeof parsed.feedback !== "string") {
    throw new Error("AI evaluation is missing feedback.");
  }

  if (!Array.isArray(parsed.strengths)) parsed.strengths = [];
  if (!Array.isArray(parsed.weaknesses)) parsed.weaknesses = [];
  if (!Array.isArray(parsed.missingConcepts)) parsed.missingConcepts = [];

  if (typeof parsed.needsFollowUp !== "boolean") {
    throw new Error("AI evaluation is missing needsFollowUp.");
  }

  if (parsed.needsFollowUp) {
    if (
      !parsed.followUpQuestion ||
      !parsed.followUpQuestion.question ||
      typeof parsed.followUpQuestion.question !== "string"
    ) {
      throw new Error(
        "AI evaluation requested a follow-up but did not provide one.",
      );
    }

    if (!Array.isArray(parsed.followUpQuestion.expectedTopics)) {
      parsed.followUpQuestion.expectedTopics = [];
    }
  } else {
    parsed.followUpQuestion = null;
  }

  if (
    !parsed.transitionMessage ||
    typeof parsed.transitionMessage !== "string" ||
    !parsed.transitionMessage.trim()
  ) {
    throw new Error("AI evaluation is missing a transition message.");
  }
};

const parseEvaluationResponse = (content: string): AIAnswerEvaluation => {
  let parsed: AIAnswerEvaluation;

  try {
    parsed = JSON.parse(content) as AIAnswerEvaluation;
  } catch (error) {
    console.error("Evaluation JSON Parse Error:", error);
    throw createHttpError(500, "AI returned malformed evaluation JSON.");
  }

  try {
    validateEvaluationResponse(parsed);
  } catch (error) {
    console.error("Evaluation Validation Error:", error, parsed);
    throw createHttpError(
      500,
      "AI returned an evaluation in an unexpected format.",
    );
  }

  return parsed;
};

const evaluateAnswer = async (
  options: EvaluateAnswerOptions,
): Promise<AIAnswerEvaluation> => {
  const { systemPrompt, userPrompt } = buildEvaluationPrompt(options);

  const completion = await generateCompletion({
    systemPrompt,
    userPrompt,
    temperature: 0.3,
    maxTokens: 1024,
  });

  return parseEvaluationResponse(completion);
};

const validateReportResponse = (parsed: AIFeedbackReport): void => {
  if (!parsed.summary || typeof parsed.summary !== "string") {
    throw new Error("AI report is missing a summary.");
  }

  type ArrayFields = "strengths" | "weaknesses" | "missedConcepts" | "improvementSuggestions" | "learningPath";

  const arrayFields: ArrayFields[] = [
    "strengths",
    "weaknesses",
    "missedConcepts",
    "improvementSuggestions",
    "learningPath",
  ];

  for (const field of arrayFields) {
    if (!Array.isArray(parsed[field])) {
      parsed[field] = [];
    }
  }
};

const parseReportResponse = (content: string): AIFeedbackReport => {
  let parsed: AIFeedbackReport;

  try {
    parsed = JSON.parse(content) as AIFeedbackReport;
  } catch (error) {
    console.error("Report JSON Parse Error:", error);
    throw createHttpError(500, "AI returned malformed report JSON.");
  }

  try {
    validateReportResponse(parsed);
  } catch (error) {
    console.error("Report Validation Error:", error, parsed);
    throw createHttpError(
      500,
      "AI returned a report in an unexpected format.",
    );
  }

  return parsed;
};

const generateReport = async (
  options: GenerateReportOptions,
): Promise<AIFeedbackReport> => {
  const { systemPrompt, userPrompt } = buildReportPrompt(options);

  const completion = await generateCompletion({
    systemPrompt,
    userPrompt,
    temperature: 0.4,
    maxTokens: 2048,
  });

  return parseReportResponse(completion);
};

export { generateInterview, evaluateAnswer, generateReport };