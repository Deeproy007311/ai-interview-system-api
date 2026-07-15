import createHttpError from "http-errors";

import { AIInterviewResponse, InterviewMode } from "./ai.types";
import { buildInterviewPrompt } from "./ai.prompt";

import { generateCompletion } from "../../services/llm.service";

interface GenerateInterviewOptions {
  mode: InterviewMode;

  difficulty: string;

  duration: number;

  skills?: string[];

  resumeText?: string;

  experienceLevel?: string;
}

const parseAIResponse = (content: string): AIInterviewResponse => {
  try {
    const parsed = JSON.parse(content) as AIInterviewResponse;

    if (!parsed.welcomeMessage || !parsed.interviewPlan || !parsed.questions) {
      throw new Error();
    }

    return parsed;
  } catch {
    throw createHttpError(500, "Invalid AI response format.");
  }
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

export { generateInterview };
