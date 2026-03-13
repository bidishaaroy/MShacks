import { UploadType } from '@prisma/client'

export interface UploadResult {
  url: string
  blobName: string
  isMock: boolean
}

function getContainerPath(patientId: string, type: UploadType): string {
  switch (type) {
    case 'IMAGE':
      return `patient-uploads/${patientId}/images`
    case 'AUDIO':
      return `patient-uploads/${patientId}/audio`
    case 'DOCUMENT':
      return `patient-uploads/${patientId}/documents`
    default:
      return `patient-uploads/${patientId}/misc`
  }
}

async function uploadToAzure(
  buffer: Buffer,
  filename: string,
  patientId: string,
  type: UploadType
): Promise<UploadResult> {
  const { BlobServiceClient } = await import('@azure/storage-blob')

  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING
  if (!connectionString) {
    throw new Error('Azure Storage connection string not configured')
  }

  const containerName = process.env.AZURE_STORAGE_CONTAINER || 'clinai-uploads'
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
  const containerClient = blobServiceClient.getContainerClient(containerName)

  // Ensure container exists
  await containerClient.createIfNotExists({
    access: 'blob',
  })

  const blobPath = getContainerPath(patientId, type)
  const blobName = `${blobPath}/${Date.now()}-${filename}`
  const blockBlobClient = containerClient.getBlockBlobClient(blobName)

  await blockBlobClient.upload(buffer, buffer.length, {
    blobHTTPHeaders: {
      blobContentType: getMimeType(filename),
    },
  })

  return {
    url: blockBlobClient.url,
    blobName,
    isMock: false,
  }
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    pdf: 'application/pdf',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    mp4: 'video/mp4',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  }
  return mimeTypes[ext || ''] || 'application/octet-stream'
}

function mockUpload(
  _buffer: Buffer,
  filename: string,
  patientId: string,
  type: UploadType
): UploadResult {
  const blobPath = getContainerPath(patientId, type)
  const blobName = `${blobPath}/${Date.now()}-${filename}`
  return {
    url: `/mock-uploads/${blobName}`,
    blobName,
    isMock: true,
  }
}

export async function uploadFile(
  buffer: Buffer,
  filename: string,
  patientId: string,
  type: UploadType
): Promise<UploadResult> {
  const hasAzureConfig = !!process.env.AZURE_STORAGE_CONNECTION_STRING

  if (hasAzureConfig) {
    try {
      return await uploadToAzure(buffer, filename, patientId, type)
    } catch (error) {
      console.warn('[Blob] Azure upload failed, falling back to mock:', error)
    }
  }

  console.log('[Blob] Using mock upload (no Azure configuration)')
  return mockUpload(buffer, filename, patientId, type)
}

export async function deleteFile(blobName: string): Promise<void> {
  const hasAzureConfig = !!process.env.AZURE_STORAGE_CONNECTION_STRING

  if (!hasAzureConfig) {
    console.log(`[Blob] Mock delete: ${blobName}`)
    return
  }

  try {
    const { BlobServiceClient } = await import('@azure/storage-blob')
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!
    const containerName = process.env.AZURE_STORAGE_CONTAINER || 'clinai-uploads'
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString)
    const containerClient = blobServiceClient.getContainerClient(containerName)
    const blockBlobClient = containerClient.getBlockBlobClient(blobName)
    await blockBlobClient.deleteIfExists()
  } catch (error) {
    console.error('[Blob] Delete failed:', error)
  }
}
