import LLMConversationPage from '@/pageSections/llm/llm-conversation-page'

export const metadata = {
  title: 'Project Conversation · LLM UI',
}

export default async function ProjectConversationPage({
  params,
}: {
  params: Promise<{ projectId: string; conversationId: string }>
}) {
  const { projectId, conversationId } = await params

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <LLMConversationPage projectId={projectId} conversationId={conversationId} />
    </main>
  )
}
