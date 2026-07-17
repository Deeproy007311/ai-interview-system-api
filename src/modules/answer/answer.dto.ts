import { Types } from "mongoose";

export interface CreateAnswerDTO {
    interview: Types.ObjectId;
    question: Types.ObjectId;
    owner: Types.ObjectId;
    transcript: string;
}