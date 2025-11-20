import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

const WIDTH = 1200
const HEIGHT = 630

type OgPreset = {
  title: string
  subtitle?: string
  accent?: string
  background?: string
}

const OG_PRESETS: Record<string, OgPreset> = {
  home: {
    title: 'CodeX LLM UI',
    subtitle: 'Open-source playground for AI teams',
    accent: '#00F0FF',
  },
  login: {
    title: 'Welcome back to CodeX',
    subtitle: 'Use demo credentials to explore the UI',
    accent: '#FF8C69',
  },
  llm: {
    title: 'LLM Workspace',
    subtitle: 'Chat, reason, and iterate faster',
    accent: '#9B5CFF',
  },
  profile: {
    title: 'Profile & Identity',
    subtitle: 'Personalize your CodeX workspace',
    accent: '#4ADE80',
  },
  settings: {
    title: 'Workspace Settings',
    subtitle: 'Fine-tune preferences & integrations',
    accent: '#FDE047',
  },
  default: {
    title: 'CodeX LLM UI',
    subtitle: 'Build with motivated teams',
    accent: '#38BDF8',
  },
}

const brandBackground =
  'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.35), transparent 55%), radial-gradient(circle at 80% 0%, rgba(168,85,247,0.45), transparent 45%), radial-gradient(circle at 50% 100%, rgba(16,185,129,0.35), transparent 55%), #030712'

const getPreset = (slug: string): OgPreset => {
  return OG_PRESETS[slug] ?? OG_PRESETS.default
}

export async function GET(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  const preset = getPreset(slug)

  return new ImageResponse(
    (
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          backgroundImage: preset.background ?? brandBackground,
          color: '#F8FAFC',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: 28,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#94A3B8',
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(59,130,246,0.9), rgba(14,165,233,0.9))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              fontWeight: 700,
              color: '#F8FAFC',
            }}
          >
            C
          </div>
          CodeX
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h1
            style={{
              fontSize: 84,
              lineHeight: 1.1,
              fontWeight: 700,
              margin: 0,
            }}
          >
            {preset.title}
          </h1>
          {preset.subtitle && (
            <p
              style={{
                fontSize: 34,
                color: '#E2E8F0',
                margin: 0,
              }}
            >
              {preset.subtitle}
            </p>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            fontSize: 26,
            color: '#CBD5F5',
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              backgroundColor: preset.accent ?? '#38BDF8',
            }}
          />
          codex.llmui.com
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
    }
  )
}
