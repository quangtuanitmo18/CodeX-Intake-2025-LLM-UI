import LLMConversationPage from '@/pageSections/llm/llm-conversation-page'
import { buildPageMetadata } from '@/seo/next-metadata'

export const metadata = buildPageMetadata('llm-project')

export default async function LLmProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <LLMConversationPage projectId={projectId} />
    </main>
  )
}
