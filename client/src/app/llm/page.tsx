import LLMConversationPage from '@/pageSections/llm/llm-conversation-page'
import { buildPageMetadata } from '@/seo/next-metadata'

export const metadata = buildPageMetadata('llm')

export default function LLMPage() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <LLMConversationPage />
    </main>
  )
}
