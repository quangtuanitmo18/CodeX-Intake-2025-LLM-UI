import { MultipartFile } from '@fastify/multipart'
import { mediaService } from '@/services/media.service'

export const uploadMediaController = async (file?: MultipartFile) => {
  return await mediaService.uploadImage(file)
}
