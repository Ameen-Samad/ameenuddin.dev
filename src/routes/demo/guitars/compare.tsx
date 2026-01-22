import { useState, useEffect } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useHydratedStore } from '@/hooks/useHydratedStore'
import {
  ArrowLeft,
  ShoppingCart,
  Check,
  Sparkles,
  Loader2,
  X,
  Guitar,
} from 'lucide-react'
import guitars, { type Guitar as GuitarType } from '@/data/demo-guitars'
import {
  compareStore,
  getCompareGuitars,
  removeFromCompare,
  clearCompare,
} from '@/stores/compare-store'
import { cartStore, addToCart, isInCart } from '@/stores/cart-store'

export const Route = createFileRoute('/demo/guitars/compare')({
  component: ComparePage,
})

interface AIInsight {
  guitarId: number
  bestFor: string
  soundProfile: string
  whyChoose: string
}

function ComparePage() {
  const selectedGuitars = useHydratedStore(compareStore, getCompareGuitars, [])
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [isLoadingInsights, setIsLoadingInsights] = useState(false)

  // Fetch AI insights when guitars change
  useEffect(() => {
    if (selectedGuitars.length === 2) {
      fetchInsights(selectedGuitars as GuitarType[])
    }
  }, [selectedGuitars.length])

  const fetchInsights = async (guitars: GuitarType[]) => {
    setIsLoadingInsights(true)
    try {
      const response = await fetch('/demo/api/ai/guitars/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guitars: guitars.map((g) => ({
            id: g.id,
            name: g.name,
            description: g.description,
            price: g.price,
            type: g.type,
            tags: g.tags,
            features: g.features,
          })),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setInsights(data.insights || [])
      }
    } catch (error) {
      console.error('Failed to fetch insights:', error)
    } finally {
      setIsLoadingInsights(false)
    }
  }

  if (selectedGuitars.length < 2) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Guitar className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h1 className="text-2xl font-bold mb-4">Select Guitars to Compare</h1>
          <p className="text-gray-400 mb-6">
            You need to select 2 guitars to compare. Go back to the guitar
            catalog and click the compare button on the guitars you want to
            compare.
          </p>
          <Link
            to="/demo/guitars"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Guitars
          </Link>
        </div>
      </div>
    )
  }

  const guitar1 = selectedGuitars[0] as GuitarType
  const guitar2 = selectedGuitars[1] as GuitarType
  const insight1 = insights.find((i) => i.guitarId === guitar1?.id)
  const insight2 = insights.find((i) => i.guitarId === guitar2?.id)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/demo/guitars"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Guitars
          </Link>
          <h1 className="text-xl font-bold">Compare Guitars</h1>
          <button
            onClick={() => clearCompare()}
            className="text-gray-400 hover:text-white text-sm"
          >
            Clear
          </button>
        </div>
      </header>

      {/* Comparison Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* AI Insights Banner */}
        {isLoadingInsights && (
          <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
            <span className="text-emerald-400">
              AI is analyzing these guitars for you...
            </span>
          </div>
        )}

        {/* Side by Side Comparison */}
        <div className="grid grid-cols-2 gap-8">
          <GuitarCompareCard
            guitar={guitar1}
            insight={insight1}
            onRemove={() => removeFromCompare(guitar1.id)}
          />
          <GuitarCompareCard
            guitar={guitar2}
            insight={insight2}
            onRemove={() => removeFromCompare(guitar2.id)}
          />
        </div>

        {/* Feature Comparison Table */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6 text-center">
            Feature Comparison
          </h2>
          <div className="bg-gray-900/60 rounded-xl border border-gray-800 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-6 py-4 text-left text-gray-400 font-medium">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center font-medium">
                    {guitar1.name}
                  </th>
                  <th className="px-6 py-4 text-center font-medium">
                    {guitar2.name}
                  </th>
                </tr>
              </thead>
              <tbody>
                <CompareRow
                  label="Price"
                  value1={`$${guitar1.price}`}
                  value2={`$${guitar2.price}`}
                  highlight={guitar1.price < guitar2.price ? 1 : 2}
                />
                <CompareRow
                  label="Type"
                  value1={guitar1.type}
                  value2={guitar2.type}
                />
                <CompareRow
                  label="Style Tags"
                  value1={guitar1.tags.slice(0, 4).join(', ')}
                  value2={guitar2.tags.slice(0, 4).join(', ')}
                />
                <CompareRow
                  label="Features"
                  value1={guitar1.features.join(', ')}
                  value2={guitar2.features.join(', ')}
                />
                {insight1 && insight2 && (
                  <>
                    <CompareRow
                      label="Best For"
                      value1={insight1.bestFor}
                      value2={insight2.bestFor}
                      isAI
                    />
                    <CompareRow
                      label="Sound Profile"
                      value1={insight1.soundProfile}
                      value2={insight2.soundProfile}
                      isAI
                    />
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

function GuitarCompareCard({
  guitar,
  insight,
  onRemove,
}: {
  guitar: GuitarType
  insight?: AIInsight
  onRemove: () => void
}) {
  const inCart = useHydratedStore(cartStore, (state) => isInCart(state, guitar.id), false)

  return (
    <div className="bg-gray-900/60 rounded-2xl border border-gray-800 overflow-hidden">
      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-gray-400 hover:text-white transition-colors z-10"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={guitar.image}
          alt={guitar.name}
          className="w-full h-full object-cover"
        />
        <div
          className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${
            guitar.type === 'acoustic'
              ? 'bg-amber-500/20 text-amber-400'
              : guitar.type === 'electric'
                ? 'bg-purple-500/20 text-purple-400'
                : 'bg-cyan-500/20 text-cyan-400'
          }`}
        >
          {guitar.type}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <Link
            to="/demo/guitars/$guitarId"
            params={{ guitarId: guitar.id.toString() }}
            className="text-xl font-bold text-white hover:text-emerald-400 transition-colors"
          >
            {guitar.name}
          </Link>
          <span className="text-2xl font-bold text-emerald-400">
            ${guitar.price}
          </span>
        </div>

        <p className="text-gray-400 mb-4">{guitar.shortDescription}</p>

        {/* AI Insight */}
        {insight && (
          <div className="mb-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">
                AI Recommendation
              </span>
            </div>
            <p className="text-gray-300 text-sm italic">"{insight.whyChoose}"</p>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {guitar.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Add to Cart */}
        <button
          onClick={() => addToCart(guitar.id)}
          className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
            inCart
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          {inCart ? (
            <>
              <Check className="w-5 h-5" /> Added to Cart
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" /> Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function CompareRow({
  label,
  value1,
  value2,
  highlight,
  isAI,
}: {
  label: string
  value1: string
  value2: string
  highlight?: 1 | 2
  isAI?: boolean
}) {
  return (
    <tr className="border-b border-gray-800/50">
      <td className="px-6 py-4 text-gray-400">
        <div className="flex items-center gap-2">
          {isAI && <Sparkles className="w-4 h-4 text-emerald-400" />}
          {label}
        </div>
      </td>
      <td
        className={`px-6 py-4 text-center ${highlight === 1 ? 'text-emerald-400 font-medium' : ''}`}
      >
        {value1}
      </td>
      <td
        className={`px-6 py-4 text-center ${highlight === 2 ? 'text-emerald-400 font-medium' : ''}`}
      >
        {value2}
      </td>
    </tr>
  )
}
