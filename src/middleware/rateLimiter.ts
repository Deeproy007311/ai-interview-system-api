import rateLimit, { ipKeyGenerator } from "express-rate-limit";

import { AuthRequest } from "../types/authRequest";

// Applied globally in app.ts — a generous baseline against basic abuse
// or scraping. Not meant to restrict normal usage.
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
});

// Applied to endpoints that trigger a paid Groq call: start / answer /
// report. Must be placed AFTER the auth middleware on each route so
// req.user is populated — falls back to a normalized IP key only if
// somehow reached unauthenticated.
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req, res) => {
        const userId = (req as AuthRequest).user?._id?.toString();
        return userId || ipKeyGenerator(req.ip || "unknown");
    },
    message: {
        success: false,
        message:
            "You're sending AI requests too quickly. Please wait a few minutes and try again.",
    },
});

export { generalLimiter, aiLimiter };