import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEFAULT_PROJECT_NAME = 'General'

async function ensureDefaultProject(accountId: number) {
  const existing = await prisma.project.findFirst({
    where: {
      accountId,
      name: DEFAULT_PROJECT_NAME,
      deletedAt: null,
    },
  })

  if (existing) {
    return { project: existing, created: false }
  }

  const project = await prisma.project.create({
    data: {
      accountId,
      name: DEFAULT_PROJECT_NAME,
      description: 'Default project for existing conversations',
      lastOpenedAt: new Date(),
    },
  })

  return { project, created: true }
}

async function main() {
  const accounts = await prisma.account.findMany({ select: { id: true } })

  let createdProjects = 0
  let updatedConversations = 0

  for (const account of accounts) {
    const { project, created } = await ensureDefaultProject(account.id)
    if (created) {
      createdProjects += 1
    }

    const updateResult = await prisma.conversation.updateMany({
      where: {
        accountId: account.id,
        projectId: null,
      },
      data: {
        projectId: project.id,
      },
    })

    if (updateResult.count > 0) {
      updatedConversations += updateResult.count
      console.log(
        `Assigned ${updateResult.count} conversations to project ${project.id} for account ${account.id}`
      )
    }
  }

  console.log(
    `Finished seeding: ${createdProjects} new "${DEFAULT_PROJECT_NAME}" projects, ${updatedConversations} conversations reassigned.`
  )
}

main()
  .catch((error) => {
    console.error('Failed to seed default projects', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

