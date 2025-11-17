import LLMConversationPage from '@/components/llm/llm-conversation-page'

export const metadata = {
  title: 'LLM UI · Chat History',
}

export default function LLMPage() {
  return (
    <main className="relative min-h-screen bg-[#01030B] text-white">
      <LLMConversationPage />
    </main>
  )
}
