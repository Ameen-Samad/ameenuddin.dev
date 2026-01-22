import { Link } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import {
  compareStore,
  getCompareGuitars,
  removeFromCompare,
  clearCompare,
} from '@/stores/compare-store'
import { X, GitCompare } from 'lucide-react'

export function CompareBar() {
  const guitars = useStore(compareStore, getCompareGuitars)

  if (guitars.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 p-4">
      <div className="max-w-2xl mx-auto bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-2xl p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-medium flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-blue-400" />
            Compare Guitars ({guitars.length}/2)
          </h3>
          <button
            onClick={clearCompare}
            className="text-gray-400 hover:text-white text-sm"
          >
            Clear All
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Selected Guitars */}
          <div className="flex-1 flex gap-3">
            {guitars.map((guitar) => (
              <div
                key={guitar!.id}
                className="flex items-center gap-2 bg-gray-800 rounded-lg p-2 pr-3"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={guitar!.image}
                    alt={guitar!.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate max-w-[120px]">
                    {guitar!.name}
                  </p>
                  <p className="text-emerald-400 text-sm">${guitar!.price}</p>
                </div>
                <button
                  onClick={() => removeFromCompare(guitar!.id)}
                  className="p-1 rounded-full hover:bg-gray-700 transition-colors ml-1"
                  aria-label={`Remove ${guitar!.name} from compare`}
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            ))}

            {/* Empty slots */}
            {guitars.length < 2 && (
              <div className="flex items-center justify-center w-32 h-16 border-2 border-dashed border-gray-700 rounded-lg">
                <span className="text-gray-500 text-sm">Select another</span>
              </div>
            )}
          </div>

          {/* Compare Button */}
          <Link
            to="/demo/guitars/compare"
            className={`px-6 py-3 rounded-lg font-bold transition-colors flex items-center gap-2 ${
              guitars.length === 2
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed pointer-events-none'
            }`}
          >
            <GitCompare className="w-5 h-5" />
            Compare
          </Link>
        </div>
      </div>
    </div>
  )
}
