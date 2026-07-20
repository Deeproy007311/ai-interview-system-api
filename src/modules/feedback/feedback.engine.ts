import { Types } from "mongoose";
import createHttpError from "http-errors";

import { getInterviewById } from "../interview/interview.service";
import { getQuestionsByInterview } from "../question/question.service";
import { getAnswersByInterview } from "../answer/answer.service";
import { generateReport } from "../ai/ai.service";
import { AnswerSummaryInput } from "../ai/ai.types";

import { getReportByInterview, createReport } from "./feedback.service";
import { FeedbackReportDocument } from "./feedback.types";

const average = (numbers: number[]): number => {
    if (!numbers.length) return 0;
    const sum = numbers.reduce((acc, n) => acc + n, 0);
    return Math.round(sum / numbers.length);
};

const getOrGenerateReport = async (
    interviewId: string,
    userId: string,
): Promise<FeedbackReportDocument> => {
    const interview = await getInterviewById(interviewId, userId);

    if (interview.status !== "completed") {
        throw createHttpError(
            400,
            "The report is only available once the interview has been completed.",
        );
    }

    // Idempotency guard — same pattern as startInterviewEngine. Never
    // regenerate (and re-bill) an existing report.
    const existingReport = await getReportByInterview(interviewId);

    if (existingReport) {
        return existingReport;
    }

    const questions = await getQuestionsByInterview(interviewId);
    const answers = await getAnswersByInterview(interviewId);

    const evaluatedAnswers = answers.filter((a) => a.evaluation !== null);

    if (!evaluatedAnswers.length) {
        throw createHttpError(
            400,
            "No evaluated answers were found for this interview — a report cannot be generated.",
        );
    }

    const questionById = new Map(questions.map((q) => [q._id.toString(), q]));

    const answerSummaries: AnswerSummaryInput[] = evaluatedAnswers.map((a) => {
        const question = questionById.get(a.question.toString());

        return {
            question: question?.question ?? "Unknown question",
            section: question?.section ?? "technical",
            score: a.evaluation!.score,
            technicalScore: a.evaluation!.technicalScore,
            communicationScore: a.evaluation!.communicationScore,
            confidenceScore: a.evaluation!.confidenceScore,
            strengths: a.evaluation!.strengths,
            weaknesses: a.evaluation!.weaknesses,
            missingConcepts: a.evaluation!.missingConcepts,
        };
    });

    // These headline numbers are computed here, deterministically, from
    // data already persisted per-answer — not asked from the AI. This
    // guarantees they can never drift from or contradict the underlying
    // per-question scores.
    const overallScore = average(evaluatedAnswers.map((a) => a.evaluation!.score));
    const technicalScore = average(
        evaluatedAnswers.map((a) => a.evaluation!.technicalScore),
    );
    const communicationScore = average(
        evaluatedAnswers.map((a) => a.evaluation!.communicationScore),
    );
    const confidenceScore = average(
        evaluatedAnswers.map((a) => a.evaluation!.confidenceScore),
    );

    const aiReport = await generateReport({
        mode: interview.mode,
        difficulty: interview.difficulty,
        answers: answerSummaries,
    });

    const report = await createReport({
        interview: new Types.ObjectId(interviewId),
        owner: new Types.ObjectId(userId),
        overallScore,
        technicalScore,
        communicationScore,
        confidenceScore,
        totalQuestions: evaluatedAnswers.length,
        summary: aiReport.summary,
        strengths: aiReport.strengths,
        weaknesses: aiReport.weaknesses,
        missedConcepts: aiReport.missedConcepts,
        improvementSuggestions: aiReport.improvementSuggestions,
        learningPath: aiReport.learningPath,
    });

    return report;
};

export { getOrGenerateReport };