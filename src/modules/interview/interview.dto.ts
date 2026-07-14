import { Types } from "mongoose";
import {
  Difficulty,
  InterviewType,
} from "./interview.types";

export interface CreateInterviewDTO {
  owner: Types.ObjectId;
  interviewType: InterviewType;
  skills: string[];
  difficulty: Difficulty;
  duration: number;
}