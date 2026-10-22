// AI parsing configuration constants
export const MAX_TOKENS = 1000;

// Set to false if the configured OpenRouter model does not support response_format { type: "json_object" }
export const SEND_RESPONSE_FORMAT = true;

// Retry settings for transient failures or rate limits
export const RETRY_SETTINGS = {
  maxRetries: 2,
  baseDelayMs: 1000,
  maxDelayMs: 4000,
};
