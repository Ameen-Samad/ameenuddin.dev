import { useDebouncedCallback } from '@tanstack/react-pacer/debouncer'
import type { GuitarType } from '@/data/demo-guitars'
import { getPriceRange } from '@/data/demo-guitars'
import { Search, X, SlidersHorizontal } from 'lucide-react'

export interface FilterState {
  search: string
  types: GuitarType[]
  minPrice: number
  maxPrice: number
}

interface GuitarFiltersProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
}

const GUITAR_TYPES: { value: GuitarType; label: string; color: string }[] = [
  { value: 'acoustic', label: 'Acoustic', color: 'amber' },
  { value: 'electric', label: 'Electric', color: 'purple' },
  { value: 'ukulele', label: 'Ukulele', color: 'cyan' },
]

export function GuitarFilters({ filters, onFilterChange }: GuitarFiltersProps) {
  const priceRange = getPriceRange()

  const debouncedSearch = useDebouncedCallback(
    (value: string) => {
      onFilterChange({ ...filters, search: value })
    },
    { wait: 300 }
  )

  const toggleType = (type: GuitarType) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type]
    onFilterChange({ ...filters, types: newTypes })
  }

  const handleMinPriceChange = (value: number) => {
    onFilterChange({
      ...filters,
      minPrice: Math.min(value, filters.maxPrice - 50),
    })
  }

  const handleMaxPriceChange = (value: number) => {
    onFilterChange({
      ...filters,
      maxPrice: Math.max(value, filters.minPrice + 50),
    })
  }

  const clearFilters = () => {
    onFilterChange({
      search: '',
      types: [],
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
    })
  }

  const hasActiveFilters =
    filters.search ||
    filters.types.length > 0 ||
    filters.minPrice > priceRange.min ||
    filters.maxPrice < priceRange.max

  return (
    <div className="bg-gray-900/60 backdrop-blur-md rounded-xl border border-gray-800/50 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-gray-400 hover:text-white text-sm flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search guitars..."
          defaultValue={filters.search}
          onChange={(e) => debouncedSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      {/* Type Filter */}
      <div>
        <label className="text-gray-400 text-sm mb-2 block">Type</label>
        <div className="flex flex-wrap gap-2">
          {GUITAR_TYPES.map(({ value, label, color }) => {
            const isActive = filters.types.includes(value)
            const colorClasses = {
              amber: isActive
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-amber-500/30',
              purple: isActive
                ? 'bg-purple-500/20 text-purple-400 border-purple-500/50'
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-purple-500/30',
              cyan: isActive
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-cyan-500/30',
            }
            return (
              <button
                key={value}
                onClick={() => toggleType(value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${colorClasses[color]}`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="text-gray-400 text-sm mb-2 block">
          Price Range: ${filters.minPrice} - ${filters.maxPrice}
        </label>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              value={filters.minPrice}
              onChange={(e) => handleMinPriceChange(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>
          <div className="flex-1">
            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              value={filters.maxPrice}
              onChange={(e) => handleMaxPriceChange(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>${priceRange.min}</span>
          <span>${priceRange.max}</span>
        </div>
      </div>
    </div>
  )
}

export function getDefaultFilters(): FilterState {
  const priceRange = getPriceRange()
  return {
    search: '',
    types: [],
    minPrice: priceRange.min,
    maxPrice: priceRange.max,
  }
}
