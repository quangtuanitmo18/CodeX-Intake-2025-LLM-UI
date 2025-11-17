import envConfig from '@/config'
import { StatusError } from '@/utils/errors'
import { createFolder, randomId } from '@/utils/helpers'
import { MultipartFile } from '@fastify/multipart'
import fs from 'fs'
import path from 'path'
import { pipeline } from 'stream/promises'

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']

const ATTACHMENT_MIME_TYPES = [
  // Images
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  // PDFs
  'application/pdf',
  // Text files
  'text/plain',
  'text/markdown',
  'text/csv',
  // Documents
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]

const MIME_TO_EXTENSION: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'application/pdf': '.pdf',
  'text/plain': '.txt',
  'text/markdown': '.md',
  'text/csv': '.csv',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx'
}

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024 // 10MB

export const mediaService = {
  async uploadImage(file?: MultipartFile) {
    if (!file) {
      throw new StatusError({ status: 400, message: 'No file provided' })
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new StatusError({ status: 415, message: 'Unsupported file type' })
    }

    // Derive extension from MIME type for security
    const extension = MIME_TO_EXTENSION[file.mimetype] || '.png'
    const fileName = `${randomId()}${extension}`
    const uploadDir = path.resolve(envConfig.UPLOAD_FOLDER)
    createFolder(uploadDir)
    const filePath = path.join(uploadDir, fileName)

    await pipeline(file.file, fs.createWriteStream(filePath))

    return `/static/${fileName}`
  },

  /**
   * Upload file attachment for conversation messages
   * Validates file type and size, organizes by conversation/message
   */
  async uploadAttachment(file: MultipartFile, conversationId: string, messageId?: string) {
    if (!file) {
      throw new StatusError({ status: 400, message: 'No file provided' })
    }

    // Validate file type
    if (!ATTACHMENT_MIME_TYPES.includes(file.mimetype)) {
      throw new StatusError({
        status: 415,
        message: `Unsupported file type. Allowed: images, PDFs, text files, documents`
      })
    }

    // Validate file size
    const fileSize = file.file.readableLength || 0
    if (fileSize > MAX_ATTACHMENT_SIZE) {
      throw new StatusError({
        status: 413,
        message: `File too large. Maximum size is ${MAX_ATTACHMENT_SIZE / 1024 / 1024}MB`
      })
    }

    // Derive extension from MIME type for security (not from user filename)
    const extension = MIME_TO_EXTENSION[file.mimetype] || '.bin'
    const fileId = randomId()
    const fileName = `${fileId}${extension}`

    // Organize by conversation and message: uploads/conversations/{conversationId}/{messageId}/{fileId}.ext
    const messagePath = messageId || 'temp'
    const uploadDir = path.resolve(envConfig.UPLOAD_FOLDER, 'conversations', conversationId, messagePath)
    createFolder(uploadDir)
    const filePath = path.join(uploadDir, fileName)

    await pipeline(file.file, fs.createWriteStream(filePath))

    return {
      fileId,
      fileName: file.filename,
      fileUrl: `/static/conversations/${conversationId}/${messagePath}/${fileName}`,
      fileType: file.mimetype,
      fileSize: fileSize
    }
  },

  /**
   * Delete attachment file from disk
   */
  async deleteAttachment(fileUrl: string) {
    try {
      // Extract file path from URL: /static/conversations/{conversationId}/{messageId}/{fileName}
      const urlPath = fileUrl.replace('/static/', '')
      const filePath = path.resolve(envConfig.UPLOAD_FOLDER, urlPath)

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    } catch (error) {
      console.error('Failed to delete attachment file:', error)
      // Don't throw - file deletion is not critical
    }
  },

  /**
   * Delete all attachments for a conversation
   */
  async deleteConversationAttachments(conversationId: string) {
    try {
      const conversationDir = path.resolve(envConfig.UPLOAD_FOLDER, 'conversations', conversationId)

      if (fs.existsSync(conversationDir)) {
        fs.rmSync(conversationDir, { recursive: true, force: true })
      }
    } catch (error) {
      console.error('Failed to delete conversation attachments:', error)
      // Don't throw - file deletion is not critical
    }
  }
}
