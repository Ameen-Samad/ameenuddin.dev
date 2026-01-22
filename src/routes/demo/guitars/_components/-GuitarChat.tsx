import { useState, useRef, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { useHydratedStore } from '@/hooks/useHydratedStore'
import { Send, Loader2, User, Sparkles, ShoppingCart, X, RefreshCw } from 'lucide-react'
import { cartStore, addToCart, isInCart } from '@/stores/cart-store'
import guitars from '@/data/demo-guitars'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  recommendation?: {
    guitarId: number
    reason: string
  }
}

interface GuitarChatProps {
  onClose: () => void
}

export function GuitarChat({ onClose }: GuitarChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hey there! I'm your guitar concierge with 30 years in the business. Whether you're a beginner or a seasoned pro, I'm here to help you find the perfect instrument. What kind of sound are you looking for?",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/demo/api/ai/guitars/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body')
      }

      const assistantId = (Date.now() + 1).toString()
      let fullContent = ''

      // Add empty assistant message
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', content: '' },
      ])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.type === 'content') {
                fullContent += data.content
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: fullContent } : m
                  )
                )
              } else if (data.type === 'recommendation') {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? {
                          ...m,
                          recommendation: {
                            guitarId: data.guitar.id,
                            reason: data.reason,
                          },
                        }
                      : m
                  )
                )
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content:
            "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickQuestion = (question: string) => {
    setInput(question)
    inputRef.current?.focus()
  }

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content:
          "Hey there! I'm your guitar concierge with 30 years in the business. Whether you're a beginner or a seasoned pro, I'm here to help you find the perfect instrument. What kind of sound are you looking for?",
      },
    ])
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          AI Guitar Expert
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            title="Clear chat"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "I'm a beginner, what should I start with?",
              'Looking for a guitar for jazz',
              'What do you have under $500?',
            ].map((q) => (
              <button
                key={q}
                onClick={() => handleQuickQuestion(q)}
                className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-full text-xs hover:bg-gray-700 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about guitars..."
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-blue-600' : 'bg-emerald-600'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Sparkles className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Content */}
      <div
        className={`flex-1 space-y-2 ${isUser ? 'flex flex-col items-end' : ''}`}
      >
        <div
          className={`px-4 py-2 rounded-2xl max-w-[85%] ${
            isUser
              ? 'bg-blue-600 text-white rounded-br-md'
              : 'bg-gray-800 text-gray-100 rounded-bl-md'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Recommendation Card */}
        {message.recommendation && (
          <GuitarRecommendation
            guitarId={message.recommendation.guitarId}
            reason={message.recommendation.reason}
          />
        )}
      </div>
    </div>
  )
}

function GuitarRecommendation({
  guitarId,
  reason,
}: {
  guitarId: number
  reason: string
}) {
  const guitar = guitars.find((g) => g.id === guitarId)
  const inCart = useHydratedStore(cartStore, (state) => isInCart(state, guitarId), false)

  if (!guitar) return null

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden max-w-xs">
      <Link
        to="/demo/guitars/$guitarId"
        params={{ guitarId: guitar.id.toString() }}
      >
        <div className="aspect-video overflow-hidden">
          <img
            src={guitar.image}
            alt={guitar.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link
            to="/demo/guitars/$guitarId"
            params={{ guitarId: guitar.id.toString() }}
            className="font-bold text-white hover:text-emerald-400 transition-colors"
          >
            {guitar.name}
          </Link>
          <span className="text-emerald-400 font-bold">${guitar.price}</span>
        </div>
        {reason && (
          <p className="text-gray-400 text-xs mb-3 italic">"{reason}"</p>
        )}
        <button
          onClick={() => addToCart(guitarId)}
          className={`w-full py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
            inCart
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          {inCart ? 'Added to Cart' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}
