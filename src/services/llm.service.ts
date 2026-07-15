import Groq from "groq-sdk";
import createHttpError from "http-errors";

import { config } from "../config/config";

const groq = new Groq({
  apiKey: config.groqApiKey,
});

interface GenerateCompletionOptions {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

const generateCompletion = async ({
  systemPrompt,
  userPrompt,
  temperature = 0.3,
  maxTokens = 4096,
}: GenerateCompletionOptions): Promise<string> => {
  try {
    const completion = await groq.chat.completions.create({
      model: config.groqModel,
      temperature,
      max_completion_tokens: maxTokens,
      response_format: {
        type: "json_object",
      },
      messages: [
        ...(systemPrompt
          ? [
              {
                role: "system" as const,
                content: systemPrompt,
              },
            ]
          : []),
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw createHttpError(500, "LLM returned an empty response.");
    }

    return content;
  } catch (error) {
    console.error("Groq Error:", error);

    throw createHttpError(500, "Failed to generate AI response.");
  }
};

export { generateCompletion };
