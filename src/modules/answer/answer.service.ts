import { Types } from "mongoose";
import createHttpError from "http-errors";

import AnswerModel from "./answer.model";
import { CreateAnswerDTO } from "./answer.dto";
import { IAnswerEvaluation } from "./answer.types";

const getAnswerByQuestion = async (questionId: string) => {
    if (!Types.ObjectId.isValid(questionId)) {
        throw createHttpError(400, "Invalid question id.");
    }

    return await AnswerModel.findOne({ question: questionId });
};

const createOrUpdateAnswer = async (data: CreateAnswerDTO) => {
    const existing = await getAnswerByQuestion(data.question.toString());

    if (existing) {
        // A previous attempt already saved this transcript (likely the AI
        // evaluation step failed after the save). Reuse the record with the
        // latest transcript rather than violating the unique index.
        existing.transcript = data.transcript;
        await existing.save();
        return existing;
    }

    return await AnswerModel.create(data);
};

const saveEvaluation = async (
    answerId: Types.ObjectId,
    evaluation: IAnswerEvaluation,
) => {
    const answer = await AnswerModel.findById(answerId);

    if (!answer) {
        throw createHttpError(404, "Answer not found.");
    }

    answer.evaluation = evaluation;
    await answer.save();

    return answer;
};

const getAnswersByInterview = async (interviewId: string) => {
    if (!Types.ObjectId.isValid(interviewId)) {
        throw createHttpError(400, "Invalid interview id.");
    }

    return await AnswerModel.find({ interview: interviewId }).sort({
        createdAt: 1,
    });
};

export {
    getAnswerByQuestion,
    createOrUpdateAnswer,
    saveEvaluation,
    getAnswersByInterview,
};