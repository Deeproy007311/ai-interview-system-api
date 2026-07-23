import { NextFunction, Request, Response } from "express";
import { ZodError, ZodType } from "zod";
import createHttpError from "http-errors";

type ValidationTarget = "body" | "params" | "query";

const validate = (schema: ZodType, target: ValidationTarget = "body") => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = schema.parse(req[target]);
            req[target] = parsed;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const message = error.issues
                    .map((issue) => {
                        const field = issue.path.join(".");
                        return field ? `${field}: ${issue.message}` : issue.message;
                    })
                    .join(" | ");

                return next(createHttpError(400, message));
            }

            next(error);
        }
    };
};

export default validate;