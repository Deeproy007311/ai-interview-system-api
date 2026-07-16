import { Types } from "mongoose";
import createHttpError from "http-errors";

import {
  startInterview as validateInterviewStart,
  saveInterviewContent,
  markInterviewStarted,
} from "./interview.service";

import { InterviewDocument } from "./interview.types";
import {
  StartInterviewResponseDTO,
  InterviewQuestionDTO,
} from "./interview.engine.dto";

import {
  createQuestionsFromAI,
  getQuestionsByInterview,
  markQuestionAsAsked,
} from "../question/question.service";
import { QuestionDocument } from "../question/question.types";

import { generateInterview } from "../ai/ai.service";
import { AIQuestion, GenerateInterviewOptions } from "../ai/ai.types";

import { getResumeById } from "../resume/resume.service";

const buildAIOptions = async (
  interview: InterviewDocument,
): Promise<GenerateInterviewOptions> => {
  const baseOptions = {
    mode: interview.mode,
    difficulty: interview.difficulty,
    duration: interview.duration,
  };

  switch (interview.mode) {
    case "resume": {
      if (!interview.resume) {
        throw createHttpError(500, "Interview is missing a resume reference.");
      }

      const resume = await getResumeById(interview.resume.toString());

      if (!resume) {
        throw createHttpError(
          404,
          "The resume linked to this interview could not be found. It may have been deleted.",
        );
      }

      return { ...baseOptions, resumeText: resume.extractedText };
    }

    case "skills":
      return { ...baseOptions, skills: interview.skills };

    case "mixed": {
      if (!interview.resume) {
        throw createHttpError(500, "Interview is missing a resume reference.");
      }

      const resume = await getResumeById(interview.resume.toString());

      if (!resume) {
        throw createHttpError(
          404,
          "The resume linked to this interview could not be found. It may have been deleted.",
        );
      }

      return {
        ...baseOptions,
        resumeText: resume.extractedText,
        skills: interview.skills,
      };
    }

    case "hr":
      return { ...baseOptions, experienceLevel: interview.experienceLevel };

    default:
      throw createHttpError(400, "Unsupported interview mode.");
  }
};

// The AI's own numbering is not a reliable source of truth for a field
// that's enforced unique at the database level. We keep its section and
// content choices but always re-derive `order` from array position.
const normalizeQuestionOrder = (questions: AIQuestion[]): AIQuestion[] =>
  questions.map((question, index) => ({
    ...question,
    order: index + 1,
  }));

const toQuestionDTO = (question: QuestionDocument): InterviewQuestionDTO => ({
  id: question._id.toString(),
  order: question.order,
  section: question.section,
  question: question.question,
});

const startInterviewEngine = async (
  interviewId: string,
  userId: string,
): Promise<StartInterviewResponseDTO> => {
  // 1. Ownership + status validation
  const interview = await validateInterviewStart(interviewId, userId);

  // 2. Idempotency guard — if questions already exist (e.g. a previous
  // attempt generated and saved them but crashed before flipping the
  // interview to "in_progress"), don't call the AI again. Just resume.
  let questions = await getQuestionsByInterview(interviewId);
  let welcomeMessage = interview.welcomeMessage;
  let interviewPlan = interview.interviewPlan;

  if (questions.length === 0) {
    const aiOptions = await buildAIOptions(interview);
    const aiResponse = await generateInterview(aiOptions);

    const normalizedQuestions = normalizeQuestionOrder(aiResponse.questions);

    questions = await createQuestionsFromAI(
      new Types.ObjectId(interviewId),
      normalizedQuestions,
    );

    welcomeMessage = aiResponse.welcomeMessage;
    interviewPlan = aiResponse.interviewPlan;

    await saveInterviewContent(interviewId, {
      interviewPlan: aiResponse.interviewPlan,
      welcomeMessage: aiResponse.welcomeMessage,
    });
  }

  if (!welcomeMessage || !interviewPlan) {
    throw createHttpError(
      500,
      "Interview content is incomplete and could not be started.",
    );
  }

  // 3. Flip status last — only once questions are confirmed persisted.
  await markInterviewStarted(interviewId);

  // 4. Present the first question to the candidate.
  const firstQuestion = questions[0];

  if (!firstQuestion) {
    throw createHttpError(
      500,
      "No questions are available to start this interview.",
    );
  }

  const askedQuestion = await markQuestionAsAsked(firstQuestion._id.toString());

  return {
    welcomeMessage,
    interviewPlan,
    firstQuestion: toQuestionDTO(askedQuestion),
    totalQuestions: questions.length,
  };
};

export { startInterviewEngine };
