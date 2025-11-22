import { mediaService } from '@/services/media.service'
import { MultipartFile } from '@fastify/multipart'

export const uploadMediaController = async (file?: MultipartFile) => {
  return await mediaService.uploadImage(file)
}

export const uploadAttachmentController = async (file: MultipartFile, conversationId: string, messageId?: string) => {
  return await mediaService.uploadAttachment(file, conversationId, messageId)
}
