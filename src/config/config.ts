import { config as conf } from "dotenv";

conf();

const requiredEnvVars = [
  "PORT",
  "MONGO_CONNECTION_STRING",
  "JWT_KEY",
  "GROQ_API_KEY",
  "GROQ_MODEL",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
] as const;

const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
  console.error(
    `❌ Missing required environment variables: ${missingEnvVars.join(", ")}`,
  );
  console.error("Check your .env file against .env.example.");
  process.exit(1);
}

const _config = {
  port: process.env.PORT as string,
  databaseUrl: process.env.MONGO_CONNECTION_STRING as string,
  env: process.env.NODE_ENV || "development",

  jwtSecretKey: process.env.JWT_KEY as string,

  groqApiKey: process.env.GROQ_API_KEY as string,
  groqModel: process.env.GROQ_MODEL as string,

  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY as string,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET as string,

  // Optional — only required in production. In development this is left
  // permissive so local frontends on any port (or Postman) work without
  // extra setup.
  corsOrigin: process.env.CLIENT_URL,
};

if (_config.env === "production" && !_config.corsOrigin) {
  console.warn(
    "⚠️  CORS_ORIGIN is not set. In production, cross-origin requests will be blocked by default until it's configured.",
  );
}

export const config = Object.freeze(_config);