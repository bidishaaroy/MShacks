export type DeIdMode = 'tag' | 'redact' | 'surrogate'

export interface DeIdResult {
  originalText: string
  processedText: string
  entities: Array<{
    text: string
    category: string
    replacement: string
  }>
}

// Mock DeID patterns
const PHI_PATTERNS = [
  { pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, category: 'PHONE', replacement: '[PHONE]' },
  { pattern: /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, category: 'DATE', replacement: '[DATE]' },
  { pattern: /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi, category: 'DATE', replacement: '[DATE]' },
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, category: 'SSN', replacement: '[SSN]' },
  { pattern: /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g, category: 'NAME', replacement: '[NAME]' },
  { pattern: /\b\d+\s+[A-Z][a-zA-Z]+\s+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Blvd|Boulevard)\b/gi, category: 'ADDRESS', replacement: '[ADDRESS]' },
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, category: 'EMAIL', replacement: '[EMAIL]' },
]

function mockDeId(text: string, mode: DeIdMode): DeIdResult {
  const entities: DeIdResult['entities'] = []
  let processedText = text

  for (const { pattern, category, replacement } of PHI_PATTERNS) {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      entities.push({
        text: match[0],
        category,
        replacement: mode === 'tag' ? `<${category}>${match[0]}</${category}>` : replacement,
      })
    }

    if (mode !== 'tag') {
      processedText = processedText.replace(pattern, replacement)
    } else {
      processedText = processedText.replace(
        pattern,
        (match) => `<${category}>${match}</${category}>`
      )
    }
  }

  return {
    originalText: text,
    processedText,
    entities,
  }
}

async function azureDeId(text: string, mode: DeIdMode): Promise<DeIdResult> {
  // Real Azure Health Data Services DeID call
  // This would use the Azure SDK in production
  const endpoint = process.env.AZURE_DEID_ENDPOINT

  if (!endpoint) {
    throw new Error('Azure DeID endpoint not configured')
  }

  // Azure DeID API call would go here
  // For now, fall through to mock
  throw new Error('Azure DeID not fully implemented - using mock')
}

export async function deIdentifyText(
  text: string,
  mode: DeIdMode = 'redact'
): Promise<DeIdResult> {
  const hasAzureConfig =
    process.env.AZURE_DEID_ENDPOINT &&
    process.env.AZURE_DEID_TENANT_ID &&
    process.env.AZURE_DEID_CLIENT_ID &&
    process.env.AZURE_DEID_CLIENT_SECRET

  if (hasAzureConfig) {
    try {
      return await azureDeId(text, mode)
    } catch (error) {
      console.warn('[DeID] Azure service failed, falling back to mock:', error)
    }
  }

  return mockDeId(text, mode)
}

export async function redactPHI(text: string): Promise<string> {
  const result = await deIdentifyText(text, 'redact')
  return result.processedText
}

export async function tagPHI(text: string): Promise<string> {
  const result = await deIdentifyText(text, 'tag')
  return result.processedText
}
