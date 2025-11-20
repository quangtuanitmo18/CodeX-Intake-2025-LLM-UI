import LLMConversationPage from '@/pageSections/llm/llm-conversation-page'

export const metadata = {
  title: 'Conversation · LLM UI',
}

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
