import z from 'zod'

// ==================== Request Schemas ====================

export const ProjectIdParam = z
  .object({
    id: z.string().cuid()
  })
  .strict()

export type ProjectIdParamType = z.TypeOf<typeof ProjectIdParam>

export const CreateProjectBody = z
  .object({
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().max(500).optional()
  })
  .strict()

export type CreateProjectBodyType = z.TypeOf<typeof CreateProjectBody>

export const UpdateProjectBody = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    description: z.string().trim().max(500).nullable().optional(),
    lastOpenedAt: z.coerce.date().optional()
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field must be provided'
  })

export type UpdateProjectBodyType = z.TypeOf<typeof UpdateProjectBody>

export const ListProjectsQuery = z
  .object({
    includeCounts: z.coerce.boolean().optional()
  })
  .strict()

export type ListProjectsQueryType = z.TypeOf<typeof ListProjectsQuery>

// ==================== Response Schemas ====================

const ProjectShape = z.object({
  id: z.string().cuid(),
  accountId: z.number().int().positive(),
  name: z.string(),
  description: z.string().nullable(),
  lastOpenedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  stats: z
    .object({
      conversations: z.number().int().nonnegative()
    })
    .optional()
})

export const ProjectRes = z.object({
  data: ProjectShape,
  message: z.string()
})

export type ProjectResType = z.TypeOf<typeof ProjectRes>

export const ProjectListRes = z.object({
  data: z.array(ProjectShape),
  message: z.string()
})

export type ProjectListResType = z.TypeOf<typeof ProjectListRes>
