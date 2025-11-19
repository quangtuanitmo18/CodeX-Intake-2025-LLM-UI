'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#01030B] text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold">Settings</h1>

        <div className="space-y-6">
          {/* General Settings */}
          <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
            <h2 className="mb-4 text-xl font-semibold">General</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Language</p>
                  <p className="text-sm text-gray-400">Select your preferred language</p>
                </div>
                <select className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-blue-500">
                  <option>English</option>
                  <option>Vietnamese</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Theme</p>
                  <p className="text-sm text-gray-400">Choose your interface theme</p>
                </div>
                <select className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-blue-500">
                  <option>Dark</option>
                  <option>Light</option>
                  <option>System</option>
                </select>
              </div>
            </div>
          </div>

          {/* LLM Settings */}
          <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
            <h2 className="mb-4 text-xl font-semibold">LLM Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Default Model</p>
                  <p className="text-sm text-gray-400">Choose your default AI model</p>
                </div>
                <select className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-blue-500">
                  <option>GPT-4</option>
                  <option>GPT-3.5</option>
                  <option>Claude</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Temperature</p>
                  <p className="text-sm text-gray-400">Control response randomness (0-1)</p>
                </div>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  defaultValue="0.7"
                  className="w-24 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Max Tokens</p>
                  <p className="text-sm text-gray-400">Maximum response length</p>
                </div>
                <input
                  type="number"
                  min="100"
                  max="4000"
                  step="100"
                  defaultValue="2000"
                  className="w-24 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 outline-none transition focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
            <h2 className="mb-4 text-xl font-semibold">Privacy & Data</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Save conversation history</p>
                  <p className="text-sm text-gray-400">Store your chat history for future reference</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-5 w-5 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Analytics</p>
                  <p className="text-sm text-gray-400">Help improve our service with usage data</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-5 w-5 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-lg border border-red-900/50 bg-red-900/10 p-6">
            <h2 className="mb-4 text-xl font-semibold text-red-500">Danger Zone</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete all conversations</p>
                  <p className="text-sm text-gray-400">Permanently delete all your chat history</p>
                </div>
                <button className="rounded-lg border border-red-700 bg-red-900/50 px-4 py-2 font-medium text-red-500 transition hover:bg-red-900">
                  Delete All
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete account</p>
                  <p className="text-sm text-gray-400">Permanently delete your account and all data</p>
                </div>
                <button className="rounded-lg bg-red-600 px-4 py-2 font-medium transition hover:bg-red-700">
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
