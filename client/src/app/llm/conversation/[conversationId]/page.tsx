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
    <main className="relative min-h-screen bg-background text-foreground">
      <LLMConversationPage conversationId={conversationId} />
    </main>
  )
}
