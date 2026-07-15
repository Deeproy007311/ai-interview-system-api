import { InterviewMode } from "./ai.types";

interface BuildPromptOptions {
  mode: InterviewMode;
  difficulty: string;
  duration: number;
  skills?: string[];
  resumeText?: string;
  experienceLevel?: string;
}

interface InterviewPrompt {
  systemPrompt: string;
  userPrompt: string;
}

const SYSTEM_PROMPT = `
You are a Senior Technical Interviewer with over 15 years of interviewing experience.

Your responsibility is to conduct realistic mock interviews exactly like a human interviewer.

Rules:

- Behave exactly like a real interviewer.
- Never mention that you are an AI.
- Never compliment the candidate.
- Never reveal answers.
- Never provide hints.
- Never explain whether an answer is correct.
- Ask only interview questions.
- Questions should gradually increase in difficulty.
- Questions must feel realistic and production-oriented.
- Avoid duplicate questions.
- Include follow-up questions only when appropriate.
- Return ONLY valid JSON.
`;

const OUTPUT_FORMAT = `
Return ONLY valid JSON in this exact structure.

{
  "welcomeMessage": "Welcome message",

  "interviewPlan": {
    "estimatedDuration": 10,
    "sections": [
      {
        "name": "introduction",
        "questions": 1
      },
      {
        "name": "technical",
        "questions": 4
      }
    ]
  },

  "questions": [
    {
      "order": 1,
      "section": "introduction",
      "question": "Tell me about yourself.",
      "expectedTopics": [
        "background",
        "education"
      ]
    }
  ]
}

Do not return markdown.

Do not wrap JSON inside code blocks.

Do not explain anything.

Return only JSON.
`;

const buildResumePrompt = (options: BuildPromptOptions): string => `
Conduct a Resume Interview.

Resume:

${options.resumeText}

Difficulty:
${options.difficulty}

Duration:
${options.duration} minutes

Instructions:

- Start with one introduction question.
- Focus mainly on resume projects.
- Ask about technologies used.
- Ask architecture-related questions.
- Ask experience-based questions.
- End with one closing question.

${OUTPUT_FORMAT}
`;

const buildSkillsPrompt = (options: BuildPromptOptions): string => `
Conduct a Skills Interview.

Skills:

${options.skills?.join(", ")}

Difficulty:
${options.difficulty}

Duration:
${options.duration} minutes

Instructions:

- Generate practical questions.
- Include real-world scenarios.
- Avoid theory-only questions.
- Increase difficulty gradually.

${OUTPUT_FORMAT}
`;

const buildMixedPrompt = (options: BuildPromptOptions): string => `
Conduct a Mixed Interview.

Resume:

${options.resumeText}

Skills:

${options.skills?.join(", ")}

Difficulty:
${options.difficulty}

Duration:
${options.duration} minutes

Instructions:

Mix questions from:

- Resume
- Projects
- Skills
- Real-world scenarios
- Problem solving

Finish with one behavioral question.

${OUTPUT_FORMAT}
`;

const buildHRPrompt = (options: BuildPromptOptions): string => `
Conduct an HR Interview.

Candidate Experience:

${options.experienceLevel}

Duration:

${options.duration} minutes

Instructions:

Evaluate:

- Communication
- Leadership
- Teamwork
- Career Goals
- Conflict Resolution
- Decision Making
- Pressure Handling

Do NOT ask technical questions.

${OUTPUT_FORMAT}
`;

export const buildInterviewPrompt = (
  options: BuildPromptOptions,
): InterviewPrompt => {
  switch (options.mode) {
    case "resume":
      return {
        systemPrompt: SYSTEM_PROMPT,
        userPrompt: buildResumePrompt(options),
      };

    case "skills":
      return {
        systemPrompt: SYSTEM_PROMPT,
        userPrompt: buildSkillsPrompt(options),
      };

    case "mixed":
      return {
        systemPrompt: SYSTEM_PROMPT,
        userPrompt: buildMixedPrompt(options),
      };

    case "hr":
      return {
        systemPrompt: SYSTEM_PROMPT,
        userPrompt: buildHRPrompt(options),
      };

    default:
      throw new Error("Unsupported interview mode.");
  }
};
