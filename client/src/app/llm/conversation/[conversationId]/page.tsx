import LLMConversationPage from '@/pageSections/llm/llm-conversation-page'
import { buildPageMetadata } from '@/seo/next-metadata'

export const metadata = buildPageMetadata('llm-conversation')

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>
}) {
  const { conversationId } = await params

  return (
    <main className="relative min-h-screen bg-[#01030B] text-white">
      <LLMConversationPage conversationId={conversationId} />
    </main>
  )
}
