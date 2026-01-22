import { useState, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { useDebouncedCallback } from '@tanstack/react-pacer/debouncer'
import { useHydratedStore } from '@/hooks/useHydratedStore'
import { Search, Sparkles, Loader2, X, ShoppingCart, Check, MessageSquare } from 'lucide-react'
import type { Guitar } from '@/data/demo-guitars'
import { cartStore, addToCart, isInCart } from '@/stores/cart-store'

interface SearchResult {
  guitar: Guitar
  similarity: number
  relevance: string
}

interface SemanticSearchProps {
  isChatOpen: boolean
  onChatToggle: () => void
}

export function SemanticSearch({ isChatOpen, onChatToggle }: SemanticSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const performSearch = useDebouncedCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([])
        setIsOpen(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/demo/api/ai/guitars/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('Search API error:', response.status, errorData)
          throw new Error(errorData.message || errorData.error || 'Search failed')
        }

        const data = await response.json()
        setResults(data.results || [])
        setIsOpen(true)
      } catch (err) {
        console.error('Search error:', err)
        setError('Search temporarily unavailable. Please try again.')
        setResults([])
      } finally {
        setIsLoading(false)
      }
    },
    { wait: 500 }
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    performSearch(value)
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const closeResults = () => {
    setIsOpen(false)
  }

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Search Row */}
      <div className="flex items-center gap-3">
        {/* Ask AI Button */}
        <button
          onClick={onChatToggle}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors flex-shrink-0 ${
            isChatOpen
              ? "bg-emerald-600 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="hidden sm:inline">Ask AI</span>
          {!isChatOpen && <Sparkles className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            placeholder='Try: "warm vintage jazz tone" or "beginner friendly acoustic"'
            className="w-full pl-12 pr-40 py-3 bg-gray-800/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {query && (
              <button
                onClick={clearSearch}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <span className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium whitespace-nowrap">
              <Sparkles className="w-3 h-3" />
              AI Semantic Search
            </span>
          </div>
        </div>
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={closeResults}
          />

          {/* Results Panel */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-20 max-h-[70vh] overflow-y-auto">
            {error ? (
              <div className="p-4 text-center text-gray-400">
                <p>{error}</p>
              </div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                <p>No matches found. Try a different description!</p>
              </div>
            ) : (
              <>
                <div className="p-3 border-b border-gray-800 flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    {results.length} results for "{query}"
                  </span>
                  <button
                    onClick={closeResults}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="divide-y divide-gray-800">
                  {results.map((result) => (
                    <SearchResultItem
                      key={result.guitar.id}
                      result={result}
                      onSelect={closeResults}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function SearchResultItem({
  result,
  onSelect,
}: {
  result: SearchResult
  onSelect: () => void
}) {
  const { guitar, relevance } = result
  const inCart = useHydratedStore(cartStore, (state) => isInCart(state, guitar.id), false)

  const relevanceColors: Record<string, string> = {
    'Excellent match': 'bg-emerald-500/20 text-emerald-400',
    'Good match': 'bg-blue-500/20 text-blue-400',
    Relevant: 'bg-amber-500/20 text-amber-400',
    Related: 'bg-gray-500/20 text-gray-400',
  }

  return (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-800/50 transition-colors">
      {/* Image */}
      <Link
        to="/demo/guitars/$guitarId"
        params={{ guitarId: guitar.id.toString() }}
        onClick={onSelect}
        className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0"
      >
        <img
          src={guitar.image}
          alt={guitar.name}
          className="w-full h-full object-cover"
        />
      </Link>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link
              to="/demo/guitars/$guitarId"
              params={{ guitarId: guitar.id.toString() }}
              onClick={onSelect}
              className="font-medium text-white hover:text-emerald-400 transition-colors"
            >
              {guitar.name}
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${relevanceColors[relevance] || relevanceColors.Related}`}
              >
                {relevance}
              </span>
              <span className="text-gray-500 text-xs">{guitar.type}</span>
            </div>
          </div>
          <span className="text-emerald-400 font-bold">${guitar.price}</span>
        </div>
        <p className="text-gray-400 text-sm mt-1 line-clamp-1">
          {guitar.shortDescription}
        </p>
      </div>

      {/* Add to Cart */}
      <button
        onClick={(e) => {
          e.preventDefault()
          addToCart(guitar.id)
        }}
        className={`p-2 rounded-lg transition-colors ${
          inCart
            ? 'bg-emerald-600/20 text-emerald-400'
            : 'bg-gray-700 text-gray-300 hover:bg-emerald-600 hover:text-white'
        }`}
        title={inCart ? 'Added to cart' : 'Add to cart'}
      >
        {inCart ? (
          <Check className="w-5 h-5" />
        ) : (
          <ShoppingCart className="w-5 h-5" />
        )}
      </button>
    </div>
  )
}
