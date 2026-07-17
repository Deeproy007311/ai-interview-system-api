import { Schema, model } from "mongoose";
import { IInterview } from "./interview.types";

const interviewSectionSchema = new Schema(
  {
    name: {
      type: String,
      enum: [
        "introduction",
        "resume",
        "technical",
        "behavioral",
        "hr",
        "closing",
      ],
    },
    questions: {
      type: Number,
      min: 0,
    },
  },
  { _id: false }, // no need for an _id on each section entry
);

const interviewPlanSchema = new Schema(
  {
    estimatedDuration: {
      type: Number,
      default: null,
    },
    sections: {
      type: [interviewSectionSchema],
      default: [],
    },
  },
  { _id: false }, // no need for an _id on the plan subdocument itself
);

const interviewSchema = new Schema<IInterview>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    mode: {
      type: String,
      enum: ["resume", "skills", "mixed", "hr"],
      required: true,
    },

    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },

    duration: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending",
    },

    resume: {
      type: Schema.Types.ObjectId,
      ref: "Resume",
      default: null,
    },

    experienceLevel: {
      type: String,
      enum: ["fresher", "experienced"],
      default: null,
    },

    interviewPlan: {
      type: interviewPlanSchema,
      default: null,
    },

    welcomeMessage: {
      type: String,
      default: null,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    endedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Fast lookup for user's interviews
interviewSchema.index({
  owner: 1,
  createdAt: -1,
});

// Prevent multiple active interviews per user (application also enforces this)
interviewSchema.index({
  owner: 1,
  status: 1,
});

export default model<IInterview>("Interview", interviewSchema);