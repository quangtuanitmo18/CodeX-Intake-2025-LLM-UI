import z from 'zod'

export const UploadMediaRes = z.object({
  data: z.string(),
  message: z.string()
})

export type UploadMediaResType = z.TypeOf<typeof UploadMediaRes>
import z from 'zod'

export const UploadImageRes = z.object({
  data: z.string(),
  message: z.string()
})

export type UploadImageResType = z.TypeOf<typeof UploadImageRes>
