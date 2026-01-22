import { useEffect, useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  Send,
  Loader2,
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Menu,
  Sparkles
} from 'lucide-react'
import { Streamdown } from 'streamdown'
import { useStore } from '@tanstack/react-store'
import {
  useCurrentConversation,
  createConversation,
  switchConversation,
  deleteConversation,
  updateConversationTitle,
  updateConversationMessagesSimple,
} from '@/lib/demo-ai-hook'

import './ai-chat.css'

export const Route = createFileRoute('/demo/ai-chat')({
  component: AmeenuddinChat,
})

interface Message {
  role: 'user' | 'assistant'
  content: string
  toolCall?: {
    tool: string
    guitars?: Guitar[]
    reason?: string
  }
}

function AmeenuddinChat() {
  const { conversation, conversations, currentConversationId } = useCurrentConversation()
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Convert TanStack AI messages to simple format for display
  const messages: Message[] = conversation?.messages?.map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.parts?.[0]?.type === 'text' ? m.parts[0].content : ''
  })) || []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  // Create initial conversation if none exists
  useEffect(() => {
    if (conversations.length === 0) {
      createConversation()
    }
  }, [conversations.length])

  const handleSendMessage = async () => {
    const messageContent = input.trim()
    if (!messageContent || isStreaming || !currentConversationId) return

    const newMessages: Message[] = [
      ...messages, 
      { role: 'user', content: messageContent }
    ]
    
    // Update store immediately with user message
    updateConversationMessagesSimple(currentConversationId, newMessages)
    
    setInput('')
    setStreamingContent('')
    setIsStreaming(true)

    try {
      const response = await fetch('/demo/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const reader = response.body?.getReader()
      if (!reader) return

      const decoder = new TextDecoder()
      let fullContent = ''

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
                setStreamingContent(fullContent)
              } else if (data.type === 'done') {
                const finalMessages: Message[] = [
                  ...newMessages,
                  { role: 'assistant', content: fullContent }
                ]
                updateConversationMessagesSimple(currentConversationId, finalMessages)
                setStreamingContent('')
                setIsStreaming(false)
              } else if (data.type === 'error') {
                throw new Error(data.error || 'Unknown error')
              } else if (data.type === 'tool_call') {
                // Handle tool call - add as a message with tool data
                const toolMessage = {
                  role: 'assistant' as const,
                  content: data.reason || 'Here are my recommendations:',
                  toolCall: {
                    tool: data.tool,
                    guitars: data.guitars,
                    reason: data.reason,
                  },
                }
                setMessages(prev => [...prev, toolMessage])
                updateCurrentConversation([...newMessages, toolMessage])
              }
            } catch (e) {
              // Ignore JSON parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessages: Message[] = [
        ...newMessages,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]
      updateConversationMessagesSimple(currentConversationId, errorMessages)
      setStreamingContent('')
      setIsStreaming(false)
    }
  }

  const handleNewChat = () => {
    createConversation()
    setIsSidebarOpen(false)
  }

  const handleDeleteChat = (id: string) => {
    if (!window.confirm('Delete this conversation?')) return
    deleteConversation(id)
  }

  const handleRenameChat = (id: string, title: string) => {
    setEditingId(id)
    setEditingTitle(title)
  }

  const saveRename = () => {
    if (editingId && editingTitle.trim()) {
      updateConversationTitle(editingId, editingTitle.trim())
    }
    setEditingId(null)
    setEditingTitle('')
  }

  const cancelRename = () => {
    setEditingId(null)
    setEditingTitle('')
  }

  const hasMessages = messages.length > 0

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-800">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group relative mb-2 rounded-lg transition-colors ${
                  conv.id === currentConversationId
                    ? 'bg-gray-800 border border-emerald-500/30'
                    : 'hover:bg-gray-800/50 border border-transparent'
                }`}
              >
                {editingId === conv.id ? (
                  <div className="flex items-center gap-1 p-2">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveRename()
                        if (e.key === 'Escape') cancelRename()
                      }}
                      className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:outline-none focus:border-emerald-500"
                      autoFocus
                    />
                    <button onClick={saveRename} className="p-1 hover:bg-gray-700 rounded">
                      <Check className="w-4 h-4 text-emerald-400" />
                    </button>
                    <button onClick={cancelRename} className="p-1 hover:bg-gray-700 rounded">
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      switchConversation(conv.id)
                      setIsSidebarOpen(false)
                    }}
                    className="w-full text-left p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <MessageSquare className="w-4 h-4 flex-shrink-0 text-gray-400" />
                      <span className="text-sm truncate">{conv.title}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRenameChat(conv.id, conv.title)
                        }}
                        className="p-1 hover:bg-gray-700 rounded"
                      >
                        <Edit2 className="w-3 h-3 text-gray-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteChat(conv.id)
                        }}
                        className="p-1 hover:bg-gray-700 rounded"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Sparkles className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold">Ameenuddin Chat</h1>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {!hasMessages && !streamingContent && (
            <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}>
              <div className="text-center max-w-3xl mx-auto w-full">
                <h1 className="text-6xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-emerald-500 to-cyan-600 text-transparent bg-clip-text">
                    Ameenuddin
                  </span>{' '}
                  <span className="text-white">Chat</span>
                </h1>
                <p className="text-gray-400 mb-6 w-2/3 mx-auto text-lg">
                  Ask me about Ameen's background, skills, projects, or technical expertise.
                  I'm here to help you learn more about his work!
                </p>
              </div>
            </div>
          )}

          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
            >
              <div
                className={`inline-block max-w-[80%] ${
                  message.role === 'user'
                    ? ''
                    : message.toolCall
                      ? 'max-w-full'
                      : ''
                }`}
              >
                {message.toolCall ? (
                  // Tool call message - show text and guitar cards
                  <div className="space-y-3">
                    <div className="p-3 rounded-2xl bg-gray-800 text-gray-100 inline-block">
                      <Streamdown content={message.content} />
                    </div>
                    {message.toolCall.guitars && message.toolCall.guitars.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {message.toolCall.guitars.map((guitar) => (
                          <ChatGuitarCard key={guitar.id} guitar={guitar} />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Regular message
                  <div
                    className={`p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-800 text-gray-100'
                    }`}
                  >
                    {message.role === 'assistant' ? (
                      <Streamdown content={message.content} />
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {streamingContent && (
            <div className="mb-4 text-left">
              <div className="inline-block max-w-[80%] p-4 rounded-2xl bg-gray-800 text-gray-100">
                <Streamdown content={streamingContent} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="sticky bottom-0 bg-gray-900/80 backdrop-blur-sm border-t border-gray-800 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="Ask about Ameen's experience, projects, or skills..."
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
                disabled={isStreaming}
              />
              <button
                onClick={handleSendMessage}
                disabled={isStreaming || !input.trim()}
                className="p-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl transition-colors"
              >
                {isStreaming ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
