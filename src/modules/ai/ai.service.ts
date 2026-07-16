import createHttpError from "http-errors";

import { AIInterviewResponse, GenerateInterviewOptions } from "./ai.types";
import { buildInterviewPrompt } from "./ai.prompt";

import { generateCompletion } from "../../services/llm.service";

const parseAIResponse = (content: string): AIInterviewResponse => {
  try {
    const parsed = JSON.parse(content) as AIInterviewResponse;

    if (
      !parsed.welcomeMessage ||
      !parsed.interviewPlan ||
      !Array.isArray(parsed.questions)
    ) {
      throw new Error("Invalid AI response.");
    }

    if (parsed.questions.length === 0) {
      throw new Error("AI returned no questions.");
    }

    return parsed;
  } catch (error) {
    console.error("AI Response Parse Error:", error);

    throw createHttpError(500, "Failed to parse AI interview response.");
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
