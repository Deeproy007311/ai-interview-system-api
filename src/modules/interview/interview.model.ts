import { Schema, model } from "mongoose";
import { IInterview } from "./interview.types";

const interviewSchema = new Schema<IInterview>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    interviewType: {
      type: String,
      enum: ["technical", "hr", "resume"],
      required: true,
    },

    skills: [
      {
        type: String,
        required: true,
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

export default model<IInterview>("Interview", interviewSchema);
