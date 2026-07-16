import { Types } from "mongoose";
import createHttpError from "http-errors";

import QuestionModel from "./question.model";
import { CreateQuestionDTO } from "./question.dto";
import { AIQuestion } from "../ai/ai.types";
import { QuestionDocument } from "./question.types";

const createQuestions = async (questions: CreateQuestionDTO[]) => {
  if (!questions.length) {
    throw createHttpError(400, "Questions are required.");
  }

  return await QuestionModel.insertMany(questions);
};

const createQuestionsFromAI = async (
  interviewId: Types.ObjectId,
  questions: AIQuestion[],
): Promise<QuestionDocument[]> => {
  if (!questions.length) {
    throw createHttpError(400, "AI did not generate any questions.");
  }

  const payload: CreateQuestionDTO[] = questions.map((question) => ({
    interview: interviewId,
    order: question.order,
    section: question.section,
    question: question.question,
    expectedTopics: question.expectedTopics,
    status: "pending",
    isFollowUp: false,
    parentQuestion: null,
  }));

  // Mongoose 9 insertMany returns hydrated documents at runtime.
  // We assert the type explicitly because TS infers a raw union type
  // that is not directly assignable to HydratedDocument<IQuestion>.
  return QuestionModel.insertMany(payload) as unknown as Promise<QuestionDocument[]>;
};

const getQuestionsByInterview = async (interviewId: string) => {
  if (!Types.ObjectId.isValid(interviewId)) {
    throw createHttpError(400, "Invalid interview id.");
  }

  return await QuestionModel.find({
    interview: interviewId,
  }).sort({
    order: 1,
  });
};

const getQuestionById = async (questionId: string) => {
  if (!Types.ObjectId.isValid(questionId)) {
    throw createHttpError(400, "Invalid question id.");
  }

  const question = await QuestionModel.findById(questionId);

  if (!question) {
    throw createHttpError(404, "Question not found.");
  }

  return question;
};

const getCurrentQuestion = async (interviewId: string) => {
  if (!Types.ObjectId.isValid(interviewId)) {
    throw createHttpError(400, "Invalid interview id.");
  }

  return await QuestionModel.findOne({
    interview: interviewId,
    status: "asked",
  });
};

const getNextQuestion = async (interviewId: string) => {
  if (!Types.ObjectId.isValid(interviewId)) {
    throw createHttpError(400, "Invalid interview id.");
  }

  return await QuestionModel.findOne({
    interview: interviewId,
    status: "pending",
  }).sort({
    order: 1,
  });
};

const markQuestionAsAsked = async (questionId: string) => {
  const question = await getQuestionById(questionId);

  question.status = "asked";

  await question.save();

  return question;
};

export {
  createQuestions,
  createQuestionsFromAI,
  getQuestionsByInterview,
  getQuestionById,
  getCurrentQuestion,
  getNextQuestion,
  markQuestionAsAsked,
};
