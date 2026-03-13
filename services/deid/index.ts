import { featureFlags } from "@/lib/env";

export type DeidMode = "tag" | "redact" | "surrogate";

export interface DeidService {
  deidentify(input: string, mode: DeidMode): Promise<string>;
}

class MockDeidService implements DeidService {
  async deidentify(input: string, mode: DeidMode) {
    if (!input) {
      return input;
    }

    const replacement =
      mode === "tag" ? "[NAME]" : mode === "surrogate" ? "Patient Example" : "[REDACTED]";

    return input
      .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, replacement)
      .replace(/\b\d{2,4}[-/]\d{1,2}[-/]\d{1,2}\b/g, "[DATE]");
  }
}

class AzureDeidService implements DeidService {
  async deidentify(input: string, mode: DeidMode) {
    return `[azure-${mode}] ${input}`;
  }
}

export function getDeidService(): DeidService {
  return featureFlags.deid ? new AzureDeidService() : new MockDeidService();
}
