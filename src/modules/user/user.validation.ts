import { z } from "zod";

const registerSchema = z.object({
    name: z
        .string({ message: "Name is required." })
        .trim()
        .min(2, "Name must be at least 2 characters.")
        .max(100, "Name must be under 100 characters."),

    email: z
        .string({ message: "Email is required." })
        .trim()
        .toLowerCase()
        .email("Please provide a valid email address."),

    // 72 chars is bcrypt's actual input limit — anything longer than that
    // gets silently truncated by bcrypt itself, which is worth preventing
    // explicitly rather than letting it happen invisibly.
    password: z
        .string({ message: "Password is required." })
        .min(8, "Password must be at least 8 characters.")
        .max(72, "Password must be under 72 characters."),
});

const loginSchema = z.object({
    email: z
        .string({ message: "Email is required." })
        .trim()
        .toLowerCase()
        .email("Please provide a valid email address."),

    password: z
        .string({ message: "Password is required." })
        .min(1, "Password is required."),
});

export { registerSchema, loginSchema };