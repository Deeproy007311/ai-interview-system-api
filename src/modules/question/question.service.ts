import { Types } from "mongoose";
import createHttpError from "http-errors";

import QuestionModel from "./question.model";
import { CreateQuestionDTO } from "./question.dto";

const createQuestions = async (questions: CreateQuestionDTO[]) => {
  if (!questions.length) {
    throw createHttpError(400, "Questions are required.");
  }

  return await QuestionModel.insertMany(questions);
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

const getNextQuestion = async (interviewId: string, currentOrder: number) => {
  if (!Types.ObjectId.isValid(interviewId)) {
    throw createHttpError(400, "Invalid interview id.");
  }

  const nextQuestion = await QuestionModel.findOne({
    interview: interviewId,
    order: {
      $gt: currentOrder,
    },
  }).sort({
    order: 1,
  });

  return nextQuestion;
};

export {
  createQuestions,
  getQuestionsByInterview,
  getQuestionById,
  getNextQuestion,
};
