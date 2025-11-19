import z from 'zod'

export const ProjectStatsSchema = z
  .object({
    conversations: z.number().int().nonnegative(),
  })
  .optional()

export const ProjectSchema = z.object({
  id: z.string(),
  accountId: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  lastOpenedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
  stats: ProjectStatsSchema,
})

export type ProjectType = z.infer<typeof ProjectSchema>

export const ProjectRes = z.object({
  data: ProjectSchema,
  message: z.string(),
})

export type ProjectResType = z.infer<typeof ProjectRes>

export const ProjectListRes = z.object({
  data: z.array(ProjectSchema),
  message: z.string(),
})

export type ProjectListResType = z.infer<typeof ProjectListRes>

export const CreateProjectBody = z
  .object({
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().max(500).optional(),
  })
  .strict()

export type CreateProjectBodyType = z.infer<typeof CreateProjectBody>

export const UpdateProjectBody = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    description: z.string().trim().max(500).nullable().optional(),
    lastOpenedAt: z.string().optional(),
  })
  .strict()

export type UpdateProjectBodyType = z.infer<typeof UpdateProjectBody>
