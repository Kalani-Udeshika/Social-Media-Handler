// import { defineFunction } from '@aws-amplify/backend';

// export const generateOrchidContent = defineFunction({
//   name: 'generate-orchid-content',
//   entry: './handler.ts',
// });

import { defineFunction, secret } from "@aws-amplify/backend";
export const generateOrchidContent = defineFunction({
  name: "generate-orchid-content",
  entry: "./handler.ts",
  timeoutSeconds: 60,
  memoryMB: 1024,
  environment: {
    OPENAI_API_KEY: secret("OPENAI_API_KEY"),
    OPENAI_MODEL: "gpt-4o-mini"
    // OPENAI_MODEL: "gpt-5.2",
    // ENAI_MODEL: process.env.OPENAI_MODEL || "gpt-4o-mini",
  },
});


