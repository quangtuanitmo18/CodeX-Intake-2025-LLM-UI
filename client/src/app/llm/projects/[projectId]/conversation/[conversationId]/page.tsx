import LLMConversationPage from '@/components/llm/llm-conversation-page'

export const metadata = {
  title: 'Project Conversation · LLM UI',
}

export default async function ProjectConversationPage({
  params,
}: {
  params: Promise<{ projectId: string; conversationId: string }>
}) {
  const { projectId, conversationId } = await params
  console.log('projectId', projectId)
  console.log('conversationId', conversationId)

  return (
    <main className="relative min-h-screen bg-[#01030B] text-white">
      <LLMConversationPage projectId={projectId} conversationId={conversationId} />
    </main>
  )
}
