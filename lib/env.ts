import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().optional(),
  NEXTAUTH_SECRET: z.string().default("clinai-bridge-demo-secret"),
  GEMINI_API_KEY: z.string().optional(),
  AZURE_STORAGE_CONNECTION_STRING: z.string().optional(),
  AZURE_STORAGE_CONTAINER: z.string().default("clinai-bridge"),
  AZURE_DEID_ENDPOINT: z.string().optional(),
  AZURE_DEID_TENANT_ID: z.string().optional(),
  AZURE_DEID_CLIENT_ID: z.string().optional(),
  AZURE_DEID_CLIENT_SECRET: z.string().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().default("ClinAI Bridge")
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  AZURE_STORAGE_CONNECTION_STRING: process.env.AZURE_STORAGE_CONNECTION_STRING,
  AZURE_STORAGE_CONTAINER: process.env.AZURE_STORAGE_CONTAINER,
  AZURE_DEID_ENDPOINT: process.env.AZURE_DEID_ENDPOINT,
  AZURE_DEID_TENANT_ID: process.env.AZURE_DEID_TENANT_ID,
  AZURE_DEID_CLIENT_ID: process.env.AZURE_DEID_CLIENT_ID,
  AZURE_DEID_CLIENT_SECRET: process.env.AZURE_DEID_CLIENT_SECRET,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME
});

export const featureFlags = {
  database: Boolean(env.DATABASE_URL),
  gemini: Boolean(env.GEMINI_API_KEY),
  blob: Boolean(env.AZURE_STORAGE_CONNECTION_STRING),
  deid: Boolean(
    env.AZURE_DEID_ENDPOINT &&
      env.AZURE_DEID_TENANT_ID &&
      env.AZURE_DEID_CLIENT_ID &&
      env.AZURE_DEID_CLIENT_SECRET
  )
};
