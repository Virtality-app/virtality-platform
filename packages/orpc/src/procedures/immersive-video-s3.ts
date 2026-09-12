import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListPartsCommand,
  PutObjectCommand,
  UploadPartCommand,
} from '@aws-sdk/client-s3'
import { Readable } from 'node:stream'
import type { VirtalityS3Client } from '../s3/index.ts'

export type ImmersiveVideoListedPart = {
  partNumber: number
  etag: string
}

export type ImmersiveVideoS3 = {
  createMultipartUpload: (input: {
    key: string
    contentType: string
  }) => Promise<{ uploadId: string }>
  uploadPart: (input: {
    key: string
    uploadId: string
    partNumber: number
    body: Buffer
    contentLength: number
  }) => Promise<void>
  listParts: (input: {
    key: string
    uploadId: string
  }) => Promise<ImmersiveVideoListedPart[]>
  completeMultipartUpload: (input: {
    key: string
    uploadId: string
    parts: ImmersiveVideoListedPart[]
  }) => Promise<void>
  abortMultipartUpload: (input: {
    key: string
    uploadId: string
  }) => Promise<void>
  putObject: (input: {
    key: string
    body: Buffer
    contentType: string
  }) => Promise<void>
  deleteObject: (input: { key: string }) => Promise<void>
  getObjectStream: (input: { key: string }) => Promise<Readable>
}

function requireBucket(): string {
  const bucket = process.env.AWS_S3_BUCKET
  if (!bucket) {
    throw new Error('AWS_S3_BUCKET is missing')
  }
  return bucket
}

export function createImmersiveVideoS3(
  client: VirtalityS3Client,
): ImmersiveVideoS3 {
  const Bucket = requireBucket()

  return {
    async createMultipartUpload({ key, contentType }) {
      const response = await client.send(
        new CreateMultipartUploadCommand({
          Bucket,
          Key: key,
          ContentType: contentType,
        }),
      )
      if (!response.UploadId) {
        throw new Error('CreateMultipartUpload did not return an upload id')
      }
      return { uploadId: response.UploadId }
    },

    async uploadPart({ key, uploadId, partNumber, body, contentLength }) {
      await client.send(
        new UploadPartCommand({
          Bucket,
          Key: key,
          UploadId: uploadId,
          PartNumber: partNumber,
          Body: body,
          ContentLength: contentLength,
        }),
      )
    },

    async listParts({ key, uploadId }) {
      const parts: ImmersiveVideoListedPart[] = []
      let partNumberMarker: string | undefined

      for (;;) {
        const response = await client.send(
          new ListPartsCommand({
            Bucket,
            Key: key,
            UploadId: uploadId,
            PartNumberMarker: partNumberMarker,
          }),
        )

        for (const part of response.Parts ?? []) {
          if (part.PartNumber == null || part.ETag == null) {
            continue
          }
          parts.push({ partNumber: part.PartNumber, etag: part.ETag })
        }

        if (!response.IsTruncated) {
          break
        }
        partNumberMarker = response.NextPartNumberMarker
      }

      return parts
    },

    async completeMultipartUpload({ key, uploadId, parts }) {
      await client.send(
        new CompleteMultipartUploadCommand({
          Bucket,
          Key: key,
          UploadId: uploadId,
          MultipartUpload: {
            Parts: parts
              .slice()
              .sort((a, b) => a.partNumber - b.partNumber)
              .map((part) => ({
                PartNumber: part.partNumber,
                ETag: part.etag,
              })),
          },
        }),
      )
    },

    async abortMultipartUpload({ key, uploadId }) {
      await client.send(
        new AbortMultipartUploadCommand({
          Bucket,
          Key: key,
          UploadId: uploadId,
        }),
      )
    },

    async putObject({ key, body, contentType }) {
      await client.send(
        new PutObjectCommand({
          Bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
        }),
      )
    },

    async deleteObject({ key }) {
      await client.send(
        new DeleteObjectCommand({
          Bucket,
          Key: key,
        }),
      )
    },

    async getObjectStream({ key }) {
      const response = await client.send(
        new GetObjectCommand({
          Bucket,
          Key: key,
        }),
      )
      const body = response.Body
      if (!body) {
        throw new Error(`S3 object ${key} has no body`)
      }
      if (body instanceof Readable) {
        return body
      }
      if (typeof body.transformToWebStream === 'function') {
        return Readable.fromWeb(
          body.transformToWebStream() as import('node:stream/web').ReadableStream,
        )
      }
      throw new Error(`S3 object ${key} body is not a readable stream`)
    },
  }
}
