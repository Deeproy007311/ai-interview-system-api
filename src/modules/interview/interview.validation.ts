import { z } from "zod";
import { Types } from "mongoose";

const objectIdSchema = z
    .string({ message: "This field is required." })
    .refine((val) => Types.ObjectId.isValid(val), {
        message: "Invalid id format.",
    });

const createInterviewSchema = z.object({
    mode: z.enum(["resume", "skills", "mixed", "hr"], {
        message: "Interview mode must be one of resume, skills, mixed, or hr.",
    }),

    skills: z.array(z.string().trim().min(1)).optional().default([]),

    difficulty: z.enum(["beginner", "intermediate", "advanced"], {
        message: "Difficulty must be one of beginner, intermediate, or advanced.",
    }),

    duration: z
        .number({ message: "Duration is required." })
        .int("Duration must be a whole number of minutes.")
        .min(5, "Duration must be at least 5 minutes.")
        .max(120, "Duration cannot exceed 120 minutes."),

    resume: objectIdSchema.optional(),

    experienceLevel: z.enum(["fresher", "experienced"]).optional(),
});

const submitAnswerSchema = z.object({
    questionId: objectIdSchema,

    transcript: z
        .string({ message: "Transcript is required." })
        .trim()
        .min(1, "Answer cannot be empty.")
        .max(5000, "Answer is too long — please keep it under 5000 characters."),
});

const interviewIdParamSchema = z.object({
    id: objectIdSchema,
});

export { createInterviewSchema, submitAnswerSchema, interviewIdParamSchema };