import { Link, createFileRoute } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { ArrowLeft, ShoppingCart, Check, GitCompare, Tag } from 'lucide-react'

import guitars from '@/data/demo-guitars'
import { cartStore, addToCart, isInCart } from '@/stores/cart-store'
import {
  compareStore,
  addToCompare,
  removeFromCompare,
  isInCompare,
  canAddToCompare,
} from '@/stores/compare-store'

export const Route = createFileRoute('/demo/guitars/$guitarId')({
  component: GuitarDetailPage,
  loader: async ({ params }) => {
    const guitar = guitars.find((guitar) => guitar.id === +params.guitarId)
    if (!guitar) {
      throw new Error('Guitar not found')
    }
    return guitar
  },
})

function GuitarDetailPage() {
  const guitar = Route.useLoaderData()
  const inCart = useStore(cartStore, (state) => isInCart(state, guitar.id))
  const inCompare = useStore(compareStore, (state) =>
    isInCompare(state, guitar.id)
  )
  const canCompare = useStore(compareStore, canAddToCompare)

  const handleToggleCompare = () => {
    if (inCompare) {
      removeFromCompare(guitar.id)
    } else if (canCompare) {
      addToCompare(guitar.id)
    }
  }

  const typeColors = {
    acoustic: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    electric: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    ukulele: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative min-h-[70vh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={guitar.image}
            alt={guitar.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 w-full">
          <div className="max-w-2xl">
            {/* Back Link */}
            <Link
              to="/demo/guitars"
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to all guitars
            </Link>

            {/* Type Badge */}
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border mb-4 ${typeColors[guitar.type]}`}
            >
              {guitar.type}
            </div>

            {/* Title & Price */}
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {guitar.name}
            </h1>
            <div className="text-3xl font-bold text-emerald-400 mb-6">
              ${guitar.price}
            </div>

            {/* Short Description */}
            <p className="text-xl text-gray-300 mb-8">
              {guitar.shortDescription}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => addToCart(guitar.id)}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-lg transition-all ${
                  inCart
                    ? 'bg-emerald-600/20 text-emerald-400 border-2 border-emerald-600/50'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-105'
                }`}
              >
                {inCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </>
                )}
              </button>

              <button
                onClick={handleToggleCompare}
                disabled={!inCompare && !canCompare}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  inCompare
                    ? 'bg-blue-600 text-white'
                    : canCompare
                      ? 'bg-gray-800 text-white hover:bg-gray-700'
                      : 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                }`}
              >
                <GitCompare className="w-5 h-5" />
                {inCompare ? 'In Compare' : 'Add to Compare'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Description */}
          <div>
            <h2 className="text-2xl font-bold mb-4">About This Guitar</h2>
            <p className="text-gray-300 leading-relaxed">{guitar.description}</p>
          </div>

          {/* Features & Tags */}
          <div className="space-y-8">
            {/* Features */}
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-emerald-400" />
                Features
              </h3>
              <ul className="space-y-2">
                {guitar.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-gray-300"
                  >
                    <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Style Tags */}
            <div>
              <h3 className="text-xl font-bold mb-4">Style & Sound</h3>
              <div className="flex flex-wrap gap-2">
                {guitar.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Guitars */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {guitars
              .filter((g) => g.id !== guitar.id && g.type === guitar.type)
              .slice(0, 4)
              .map((similar) => (
                <Link
                  key={similar.id}
                  to="/demo/guitars/$guitarId"
                  params={{ guitarId: similar.id.toString() }}
                  className="group bg-gray-900/60 rounded-xl border border-gray-800 overflow-hidden hover:border-emerald-500/30 transition-colors"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={similar.image}
                      alt={similar.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-white truncate group-hover:text-emerald-400 transition-colors">
                      {similar.name}
                    </h3>
                    <p className="text-emerald-400 font-bold">${similar.price}</p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
