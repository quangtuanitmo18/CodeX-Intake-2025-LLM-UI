import LLMConversationPage from '@/pageSections/llm/llm-conversation-page'
import { buildPageMetadata } from '@/seo/next-metadata'

export const metadata = buildPageMetadata('llm-project')

export default async function LLmProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  const { projectId } = await params
  console.log('projectId', projectId)

  return (
    <main className="relative min-h-screen bg-[#01030B] text-white">
      <LLMConversationPage projectId={projectId} />
    </main>
  )
}
