import { Types } from "mongoose";
import createHttpError from "http-errors";

import {
  startInterview as validateInterviewStart,
  saveInterviewContent,
  markInterviewStarted,
  completeInterview,
  getInterviewById,
} from "./interview.service";

import { InterviewDocument } from "./interview.types";
import {
  StartInterviewResponseDTO,
  InterviewQuestionDTO,
  SubmitAnswerInput,
  SubmitAnswerResponseDTO,
} from "./interview.engine.dto";

import {
  createQuestionsFromAI,
  createQuestions,
  getQuestionsByInterview,
  getQuestionById,
  getNextQuestion,
  getQuestionCount,
  getAskedQuestionCount,
  markQuestionAsAsked,
  markQuestionAnswered,
  markQuestionEvaluated,
} from "../question/question.service";
import { QuestionDocument } from "../question/question.types";

import { generateInterview, evaluateAnswer } from "../ai/ai.service";
import { AIQuestion, GenerateInterviewOptions } from "../ai/ai.types";

import { getResumeById } from "../resume/resume.service";

import {
  createOrUpdateAnswer,
  saveEvaluation,
} from "../answer/answer.service";

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
// enforced unique at the database level. We keep its section/content
// choices but always re-derive `order` from array position.
const normalizeQuestionOrder = (questions: AIQuestion[]): AIQuestion[] =>
  questions.map((question, index) => ({
    ...question,
    order: index + 1,
  }));

// `order` reflects insertion order (needed for DB uniqueness) and can
// jump around once follow-ups are inserted mid-interview. `questionNumber`
// is the field that should actually be shown as progress — it always
// increases by exactly 1 each time a question is asked, regardless of
// whether it's an original question or a follow-up.
const toQuestionDTO = (
  question: QuestionDocument,
  questionNumber: number,
): InterviewQuestionDTO => ({
  id: question._id.toString(),
  order: question.order,
  questionNumber,
  section: question.section,
  question: question.question,
});

const startInterviewEngine = async (
  interviewId: string,
  userId: string,
): Promise<StartInterviewResponseDTO> => {
  const interview = await validateInterviewStart(interviewId, userId);

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

  await markInterviewStarted(interviewId);

  const firstQuestion = questions[0];

  if (!firstQuestion) {
    throw createHttpError(
      500,
      "No questions are available to start this interview.",
    );
  }

  const askedQuestion = await markQuestionAsAsked(
    firstQuestion._id.toString(),
  );

  const questionNumber = await getAskedQuestionCount(interviewId);

  return {
    welcomeMessage,
    interviewPlan,
    firstQuestion: toQuestionDTO(askedQuestion, questionNumber),
    totalQuestions: questions.length,
  };
};

const submitAnswerEngine = async (
  userId: string,
  input: SubmitAnswerInput,
): Promise<SubmitAnswerResponseDTO> => {
  const { interviewId, questionId, transcript } = input;

  if (!transcript || !transcript.trim()) {
    throw createHttpError(400, "Answer transcript is required.");
  }

  const interview = await getInterviewById(interviewId, userId);

  if (interview.status !== "in_progress") {
    throw createHttpError(
      400,
      "You can only submit answers for an interview that is in progress.",
    );
  }

  const question = await getQuestionById(questionId);

  if (question.interview.toString() !== interviewId) {
    throw createHttpError(
      400,
      "This question does not belong to this interview.",
    );
  }

  if (question.status === "pending") {
    throw createHttpError(400, "This question has not been asked yet.");
  }

  if (question.status === "evaluated") {
    throw createHttpError(409, "This question has already been answered.");
  }

  const answer = await createOrUpdateAnswer({
    interview: new Types.ObjectId(interviewId),
    question: new Types.ObjectId(questionId),
    owner: new Types.ObjectId(userId),
    transcript,
  });

  if (question.status === "asked") {
    await markQuestionAnswered(questionId);
  }

  // Peek at the next pre-planned question BEFORE evaluating, so the AI's
  // transitionMessage can be grounded in what's actually coming up next
  // instead of guessing. We reuse this exact document afterward (if no
  // follow-up is triggered) rather than querying again — this both fixes
  // the transition/question mismatch and avoids a redundant DB call.
  const upcomingPlannedQuestion = await getNextQuestion(interviewId);

  const canFollowUp = !question.isFollowUp;

  const evaluation = await evaluateAnswer({
    question: question.question,
    expectedTopics: question.expectedTopics,
    transcript,
    section: question.section,
    difficulty: interview.difficulty,
    mode: interview.mode,
    upcomingQuestion: upcomingPlannedQuestion?.question ?? null,
    upcomingSection: upcomingPlannedQuestion?.section ?? null,
  });

  await saveEvaluation(answer._id, {
    score: evaluation.score,
    technicalScore: evaluation.technicalScore,
    communicationScore: evaluation.communicationScore,
    confidenceScore: evaluation.confidenceScore,
    feedback: evaluation.feedback,
    strengths: evaluation.strengths,
    weaknesses: evaluation.weaknesses,
    missingConcepts: evaluation.missingConcepts,
  });

  await markQuestionEvaluated(questionId);

  // Follow-ups are capped at one level deep: a follow-up question can
  // never spawn another follow-up.
  if (canFollowUp && evaluation.needsFollowUp && evaluation.followUpQuestion) {
    const questionCount = await getQuestionCount(interviewId);

    const [followUpQuestion] = await createQuestions([
      {
        interview: new Types.ObjectId(interviewId),
        order: questionCount + 1,
        section: question.section,
        question: evaluation.followUpQuestion.question,
        expectedTopics: evaluation.followUpQuestion.expectedTopics,
        status: "pending",
        isFollowUp: true,
        parentQuestion: question._id,
      },
    ]);

    const askedFollowUp = await markQuestionAsAsked(
      followUpQuestion._id.toString(),
    );

    const questionNumber = await getAskedQuestionCount(interviewId);

    return {
      interviewComplete: false,
      transitionMessage: evaluation.transitionMessage,
      nextQuestion: toQuestionDTO(askedFollowUp, questionNumber),
      totalQuestions: questionCount + 1,
    };
  }

  if (!upcomingPlannedQuestion) {
    await completeInterview(interviewId);

    return {
      interviewComplete: true,
      transitionMessage: null,
      nextQuestion: null,
      totalQuestions: await getQuestionCount(interviewId),
    };
  }

  const askedQuestion = await markQuestionAsAsked(
    upcomingPlannedQuestion._id.toString(),
  );
  const questionNumber = await getAskedQuestionCount(interviewId);

  return {
    interviewComplete: false,
    transitionMessage: evaluation.transitionMessage,
    nextQuestion: toQuestionDTO(askedQuestion, questionNumber),
    totalQuestions: await getQuestionCount(interviewId),
  };
};

export { startInterviewEngine, submitAnswerEngine };