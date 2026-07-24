import { GenerateInterviewOptions, EvaluateAnswerOptions, GenerateReportOptions } from "./ai.types";

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

CRITICAL RULES FOR SECTIONS:
- The section name inside "interviewPlan.sections" and the section of each item inside "questions" MUST strictly be one of: "introduction", "resume", "technical", "behavioral", "hr", "closing".
- Do NOT invent or use other section names (such as "communication", "leadership", etc.). Map any such behavioral questions to the "behavioral" or "hr" sections.

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
- When phrasing a question, reference specific details from the resume by name where natural (e.g. their degree, a named project, or a specific technology they listed) instead of generic phrasing.
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

- When phrasing a question, reference specific details from the resume by name where natural (e.g. their degree, a named project, or a specific technology they listed) instead of generic phrasing.

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
- You will be told what question is coming up next in the plan (or that none remain). Write a short, natural, one-sentence transition line in the voice of a real interviewer.
  - If you decide a follow-up is needed, the transition line MUST bridge toward your OWN follow-up question's topic — not the upcoming planned question.
  - If you do NOT request a follow-up, the transition line MUST bridge toward the upcoming planned question's general topic.
  - The transition line must NEVER quote or closely paraphrase the exact wording of the next question — only gesture at the general area (e.g. "let's move on to how you'd approach deployment" rather than restating the question).
  - If there is no upcoming question and you are not requesting a follow-up, write a brief natural wrap-up line instead.
- The transition line must NOT state, hint at, or imply whether the answer was correct, complete, strong, or weak, and must NOT compliment the candidate.
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
  "followUpQuestion": null,
  "transitionMessage": "Let's shift over to how you'd approach database design."
}

If needsFollowUp is true, followUpQuestion must instead be:

{
  "question": "A single, specific follow-up question.",
  "expectedTopics": ["..."]
}

transitionMessage rules:
- Always required, never empty.
- One sentence, conversational, in the interviewer's voice.
- Must always match whichever question is actually coming next (your follow-up, or the provided upcoming question) — never invent an unrelated topic.
- Must never reveal or imply correctness of the answer.
- Must never compliment the candidate.

All scores are integers from 0 to 100.
Return only JSON.
Do not return markdown.
Do not wrap JSON inside code blocks.
Do not explain anything.
`;

export const buildEvaluationPrompt = (
  options: EvaluateAnswerOptions,
): InterviewPrompt => {
  const upcomingContext = options.upcomingQuestion
    ? `The next planned question in the interview (section: ${options.upcomingSection}) is:
${options.upcomingQuestion}

If you do NOT request a follow-up, your transitionMessage must naturally bridge toward this topic — without quoting or closely paraphrasing its exact wording.`
    : `There is no further planned question. This may be the final question of the interview unless you request a follow-up.`;

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

${upcomingContext}

${EVALUATION_OUTPUT_FORMAT}
`;

  return {
    systemPrompt: EVALUATION_SYSTEM_PROMPT,
    userPrompt,
  };
};

const REPORT_SYSTEM_PROMPT = `
You are a Senior Technical Interviewer preparing a final written performance report for a candidate after a completed mock interview.

Rules:

- Base your synthesis only on the evaluation data provided — do not invent facts not supported by it.
- Deduplicate and consolidate: if multiple answers show the same strength or weakness, mention it once, not repeatedly.
- Be specific and constructive, not generic.
- Keep the feedback concise: limit each of the list fields ("strengths", "weaknesses", "missedConcepts", "improvementSuggestions", and "learningPath") to a maximum of 3-5 key, high-impact items.
- Improvement suggestions must be actionable, not vague ("practice more").
- Recommended learning path should be an ordered list of concrete topics or skills to study next, based on the weaknesses and missed concepts observed.
- Do not mention that this is an automated or AI-generated evaluation.
- Return ONLY valid JSON.
`;

const REPORT_OUTPUT_FORMAT = `
Return ONLY valid JSON in exactly this structure.

{
  "summary": "A short 2-4 sentence overview of the candidate's overall performance.",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "missedConcepts": ["..."],
  "improvementSuggestions": ["..."],
  "learningPath": ["..."]
}

Return only JSON.
Do not return markdown.
Do not wrap JSON inside code blocks.
Do not explain anything.
`;

export const buildReportPrompt = (
  options: GenerateReportOptions,
): InterviewPrompt => {
  const answersBlock = options.answers
    .map(
      (a, i) => `
Question ${i + 1} (${a.section}):
${a.question}

Scores — Overall: ${a.score}, Technical: ${a.technicalScore}, Communication: ${a.communicationScore}, Confidence: ${a.confidenceScore}
Strengths: ${a.strengths.join(", ") || "None noted"}
Weaknesses: ${a.weaknesses.join(", ") || "None noted"}
Missing concepts: ${a.missingConcepts.join(", ") || "None noted"}
`,
    )
    .join("\n---\n");

  const userPrompt = `
Prepare a final performance report for this ${options.mode} interview at ${options.difficulty} difficulty.

Here is the evaluation data for each question answered:

${answersBlock}

${REPORT_OUTPUT_FORMAT}
`;

  return {
    systemPrompt: REPORT_SYSTEM_PROMPT,
    userPrompt,
  };
};