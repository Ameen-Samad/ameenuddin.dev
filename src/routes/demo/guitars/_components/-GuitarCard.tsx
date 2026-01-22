import { Link } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import type { Guitar } from '@/data/demo-guitars'
import { cartStore, addToCart, isInCart } from '@/stores/cart-store'
import {
  compareStore,
  addToCompare,
  removeFromCompare,
  isInCompare,
  canAddToCompare,
} from '@/stores/compare-store'
import { ShoppingCart, Check, GitCompare } from 'lucide-react'

interface GuitarCardProps {
  guitar: Guitar
}

export function GuitarCard({ guitar }: GuitarCardProps) {
  const inCart = useStore(cartStore, (state) => isInCart(state, guitar.id))
  const inCompare = useStore(compareStore, (state) =>
    isInCompare(state, guitar.id)
  )
  const canCompare = useStore(compareStore, canAddToCompare)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(guitar.id)
  }

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
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
    <div className="group relative bg-gray-900/60 backdrop-blur-md rounded-2xl border border-gray-800/50 overflow-hidden hover:border-emerald-500/30 transition-all duration-300">
      {/* Image */}
      <Link
        to="/demo/guitars/$guitarId"
        params={{ guitarId: guitar.id.toString() }}
        className="block"
      >
        <div className="relative aspect-square overflow-hidden">
          <img
            src={guitar.image}
            alt={guitar.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Type Badge */}
          <div
            className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium border ${typeColors[guitar.type]}`}
          >
            {guitar.type}
          </div>

          {/* Quick Actions Overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                inCart
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/90 text-gray-900 hover:bg-white'
              }`}
            >
              {inCart ? (
                <>
                  <Check className="w-4 h-4" /> In Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" /> Add
                </>
              )}
            </button>
            <button
              onClick={handleToggleCompare}
              disabled={!inCompare && !canCompare}
              className={`py-2 px-3 rounded-lg font-medium text-sm flex items-center justify-center transition-colors ${
                inCompare
                  ? 'bg-blue-600 text-white'
                  : canCompare
                    ? 'bg-white/90 text-gray-900 hover:bg-white'
                    : 'bg-gray-500/50 text-gray-400 cursor-not-allowed'
              }`}
              title={
                inCompare
                  ? 'Remove from compare'
                  : canCompare
                    ? 'Add to compare'
                    : 'Compare list full'
              }
            >
              <GitCompare className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link
          to="/demo/guitars/$guitarId"
          params={{ guitarId: guitar.id.toString() }}
        >
          <h3 className="text-lg font-bold text-white mb-1 hover:text-emerald-400 transition-colors">
            {guitar.name}
          </h3>
        </Link>
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
          {guitar.shortDescription}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {guitar.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {guitar.tags.length > 3 && (
            <span className="px-2 py-0.5 text-gray-500 text-xs">
              +{guitar.tags.length - 3}
            </span>
          )}
        </div>

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-emerald-400">
            ${guitar.price}
          </span>
          <button
            onClick={handleAddToCart}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              inCart
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {inCart ? 'Added' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}
