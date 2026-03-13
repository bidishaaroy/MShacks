import { BlobServiceClient } from "@azure/storage-blob";
import { featureFlags, env } from "@/lib/env";
import { slugify } from "@/lib/utils";

export interface BlobUploadResult {
  url: string;
  key: string;
}

export interface BlobService {
  upload(params: {
    patientId: string;
    folder: "images" | "audio" | "documents" | "redacted-transcripts" | "audit";
    fileName: string;
    contentType: string;
    buffer: Buffer;
  }): Promise<BlobUploadResult>;
}

class MockBlobService implements BlobService {
  async upload({ patientId, folder, fileName }: Parameters<BlobService["upload"]>[0]) {
    const key = `patient-uploads/${patientId}/${folder}/${slugify(fileName)}`;
    return {
      key,
      url: `/mock-blob/${key}`
    };
  }
}

class AzureBlobService implements BlobService {
  private client = BlobServiceClient.fromConnectionString(env.AZURE_STORAGE_CONNECTION_STRING!);

  async upload({ patientId, folder, fileName, contentType, buffer }: Parameters<BlobService["upload"]>[0]) {
    const key = `patient-uploads/${patientId}/${folder}/${Date.now()}-${slugify(fileName)}`;
    const container = this.client.getContainerClient(env.AZURE_STORAGE_CONTAINER);
    const blob = container.getBlockBlobClient(key);
    await blob.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: contentType
      }
    });

    return { key, url: blob.url };
  }
}

export function getBlobService(): BlobService {
  return featureFlags.blob ? new AzureBlobService() : new MockBlobService();
}
