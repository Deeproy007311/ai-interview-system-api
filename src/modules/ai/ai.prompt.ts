import { GenerateInterviewOptions } from "./ai.types";

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
- Ask only one interview question at a time.
- Questions should gradually increase in difficulty.
- Questions must feel practical and production-oriented.
- Avoid duplicate questions.
- Include follow-up questions only when appropriate.
- Return ONLY valid JSON.
`;

const OUTPUT_FORMAT = `
Return ONLY valid JSON in exactly this structure.

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

Return only JSON.
Do not return markdown.
Do not wrap JSON inside code blocks.
Do not explain anything.
`;

const buildResumePrompt = (options: GenerateInterviewOptions): string => `
Conduct a resume interview.

Resume:

${options.resumeText}

Difficulty:
${options.difficulty}

Duration:
${options.duration} minutes

Requirements:

- Start with exactly one introduction question.
- Focus on projects.
- Focus on technologies.
- Ask architecture decisions.
- Ask experience-based questions.
- Finish with exactly one closing question.

${OUTPUT_FORMAT}
`;

const buildSkillsPrompt = (options: GenerateInterviewOptions): string => `
Conduct a technical interview.

Skills:

${options.skills?.join(", ")}

Difficulty:
${options.difficulty}

Duration:
${options.duration} minutes

Requirements:

- Practical questions only.
- Scenario-based questions.
- Increase difficulty gradually.
- Avoid theory-only questions.

${OUTPUT_FORMAT}
`;

const buildMixedPrompt = (options: GenerateInterviewOptions): string => `
Conduct a mixed interview.

Resume:

${options.resumeText}

Skills:

${options.skills?.join(", ")}

Difficulty:
${options.difficulty}

Duration:
${options.duration} minutes

Requirements:

Combine:

- Resume
- Projects
- Skills
- Real-world scenarios
- Problem solving

Finish with one behavioral question.

${OUTPUT_FORMAT}
`;

const buildHRPrompt = (options: GenerateInterviewOptions): string => `
Conduct an HR interview.

Experience Level:

${options.experienceLevel}

Duration:
${options.duration} minutes

Evaluate:

- Communication
- Leadership
- Teamwork
- Career Goals
- Decision Making
- Conflict Resolution
- Pressure Handling

Do NOT ask technical questions.

${OUTPUT_FORMAT}
`;

export const buildInterviewPrompt = (
  options: GenerateInterviewOptions,
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
