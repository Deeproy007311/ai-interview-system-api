import { GenerateInterviewOptions, EvaluateAnswerOptions } from "./ai.types";

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

const EVALUATION_SYSTEM_PROMPT = `
You are a Senior Technical Interviewer evaluating a candidate's answer during a live mock interview.

Rules:

- Be an objective, consistent grader. Do not be lenient or harsh based on tone — grade on substance.
- Never reveal the "correct" answer in your feedback text.
- Feedback is for later review only — the candidate will not see it during the interview.
- Only request a follow-up if the answer is genuinely incomplete, vague, or worth probing deeper. Most answers should NOT need one — do not request a follow-up just to be thorough.
- A follow-up question must dig into the SAME topic the candidate just answered, never introduce a new topic.
- Return ONLY valid JSON.
`;

const EVALUATION_OUTPUT_FORMAT = `
Return ONLY valid JSON in exactly this structure.

{
  "score": 78,
  "technicalScore": 80,
  "communicationScore": 75,
  "confidenceScore": 70,
  "feedback": "One or two sentences of specific, constructive feedback.",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "missingConcepts": ["..."],
  "needsFollowUp": false,
  "followUpQuestion": null
}

If needsFollowUp is true, followUpQuestion must instead be:

{
  "question": "A single, specific follow-up question.",
  "expectedTopics": ["..."]
}

All scores are integers from 0 to 100.
Return only JSON.
Do not return markdown.
Do not wrap JSON inside code blocks.
Do not explain anything.
`;

export const buildEvaluationPrompt = (
  options: EvaluateAnswerOptions,
): InterviewPrompt => {
  const userPrompt = `
Evaluate this candidate's answer.

Interview Section: ${options.section}
Difficulty: ${options.difficulty}

Question asked:
${options.question}

Expected topics for this question:
${options.expectedTopics.join(", ") || "None specified"}

Candidate's answer:
${options.transcript}

${EVALUATION_OUTPUT_FORMAT}
`;

  return {
    systemPrompt: EVALUATION_SYSTEM_PROMPT,
    userPrompt,
  };
};