import LLMPreview from '@/components/llm/llm-preview'

export const metadata = {
  title: 'LLM UI · Reference Experience',
}

export default function LLMPage() {
  return (
    <main className="relative min-h-screen bg-[#01030B] px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <LLMPreview />
      </div>
    </main>
  )
}


