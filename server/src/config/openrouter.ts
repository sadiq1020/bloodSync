import OpenAI from "openai";
import { env } from "./env.js";

// OpenAI client configured to route requests through OpenRouter
export const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: env.OPENROUTER_API_KEY,
  timeout: env.OPENROUTER_TIMEOUT_MS,
  defaultHeaders: {
    "HTTP-Referer": env.FRONTEND_URL,
    "X-Title": "BloodSync",
  },
});
