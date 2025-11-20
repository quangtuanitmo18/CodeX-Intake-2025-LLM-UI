'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#01030B] text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="mx-auto max-w-4xl px-4 py-3 md:py-4">
          <button
            onClick={() => router.back()}
            className="inline-flex min-h-[32px] items-center gap-2 text-sm text-gray-400 transition hover:text-white active:text-white/80 md:min-h-0"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-6 md:py-8">
        <h1 className="mb-6 text-2xl font-bold md:mb-8 md:text-3xl">Settings</h1>

        <div className="space-y-4 md:space-y-6">
          {/* General Settings */}
          <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 md:p-6">
            <h2 className="mb-3 text-lg font-semibold md:mb-4 md:text-xl">General</h2>
            <div className="space-y-3 md:space-y-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium md:text-base">Language</p>
                  <p className="text-xs text-gray-400 md:text-sm">Select your preferred language</p>
                </div>
                <select className="min-h-[32px] w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm outline-none transition focus:border-blue-500 md:w-auto md:px-4">
                  <option>English</option>
                  <option>Vietnamese</option>
                </select>
              </div>

              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium md:text-base">Theme</p>
                  <p className="text-xs text-gray-400 md:text-sm">Choose your interface theme</p>
                </div>
                <select className="min-h-[32px] w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm outline-none transition focus:border-blue-500 md:w-auto md:px-4">
                  <option>Dark</option>
                  <option>Light</option>
                  <option>System</option>
                </select>
              </div>
            </div>
          </div>

          {/* LLM Settings */}
          <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 md:p-6">
            <h2 className="mb-3 text-lg font-semibold md:mb-4 md:text-xl">LLM Preferences</h2>
            <div className="space-y-3 md:space-y-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium md:text-base">Default Model</p>
                  <p className="text-xs text-gray-400 md:text-sm">Choose your default AI model</p>
                </div>
                <select className="min-h-[32px] w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm outline-none transition focus:border-blue-500 md:w-auto md:px-4">
                  <option>GPT-4</option>
                  <option>GPT-3.5</option>
                  <option>Claude</option>
                </select>
              </div>

              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium md:text-base">Temperature</p>
                  <p className="text-xs text-gray-400 md:text-sm">
                    Control response randomness (0-1)
                  </p>
                </div>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  defaultValue="0.7"
                  className="min-h-[32px] w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm outline-none transition focus:border-blue-500 md:w-24 md:px-4"
                />
              </div>

              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium md:text-base">Max Tokens</p>
                  <p className="text-xs text-gray-400 md:text-sm">Maximum response length</p>
                </div>
                <input
                  type="number"
                  min="100"
                  max="4000"
                  step="100"
                  defaultValue="2000"
                  className="min-h-[32px] w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm outline-none transition focus:border-blue-500 md:w-24 md:px-4"
                />
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 md:p-6">
            <h2 className="mb-3 text-lg font-semibold md:mb-4 md:text-xl">Privacy & Data</h2>
            <div className="space-y-3 md:space-y-4">
              <label className="flex min-h-[32px] items-center justify-between gap-4 md:min-h-0">
                <div className="flex-1">
                  <p className="text-sm font-medium md:text-base">Save conversation history</p>
                  <p className="text-xs text-gray-400 md:text-sm">
                    Store your chat history for future reference
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-5 min-h-[32px] w-5 min-w-[44px] shrink-0 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-2 focus:ring-blue-500 md:min-h-0 md:min-w-0"
                />
              </label>

              <label className="flex min-h-[32px] items-center justify-between gap-4 md:min-h-0">
                <div className="flex-1">
                  <p className="text-sm font-medium md:text-base">Analytics</p>
                  <p className="text-xs text-gray-400 md:text-sm">
                    Help improve our service with usage data
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-5 min-h-[32px] w-5 min-w-[44px] shrink-0 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-2 focus:ring-blue-500 md:min-h-0 md:min-w-0"
                />
              </label>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-lg border border-red-900/50 bg-red-900/10 p-4 md:p-6">
            <h2 className="mb-3 text-lg font-semibold text-red-500 md:mb-4 md:text-xl">
              Danger Zone
            </h2>
            <div className="space-y-3 md:space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium md:text-base">Delete all conversations</p>
                  <p className="text-xs text-gray-400 md:text-sm">
                    Permanently delete all your chat history
                  </p>
                </div>
                <button className="min-h-[32px] w-full rounded-lg border border-red-700 bg-red-900/50 px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-900 active:bg-red-900/80 md:min-h-0 md:w-auto">
                  Delete All
                </button>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium md:text-base">Delete account</p>
                  <p className="text-xs text-gray-400 md:text-sm">
                    Permanently delete your account and all data
                  </p>
                </div>
                <button className="min-h-[32px] w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium transition hover:bg-red-700 active:bg-red-800 md:min-h-0 md:w-auto">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
