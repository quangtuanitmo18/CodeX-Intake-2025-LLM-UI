import envConfig from '@/config'
import { StatusError } from '@/utils/errors'
import { createFolder, randomId } from '@/utils/helpers'
import { MultipartFile } from '@fastify/multipart'
import fs from 'fs'
import path from 'path'
import { pipeline } from 'stream/promises'

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']

export const mediaService = {
  async uploadImage(file?: MultipartFile) {
    if (!file) {
      throw new StatusError({ status: 400, message: 'No file provided' })
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new StatusError({ status: 415, message: 'Unsupported file type' })
    }

    const extension = path.extname(file.filename || '') || '.png'
    const fileName = `${randomId()}${extension}`
    const uploadDir = path.resolve(envConfig.UPLOAD_FOLDER)
    createFolder(uploadDir)
    const filePath = path.join(uploadDir, fileName)

    await pipeline(file.file, fs.createWriteStream(filePath))

    return `/static/${fileName}`
  }
}
