import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useHydratedStore } from '@/hooks/useHydratedStore'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type SortingState,
} from '@tanstack/react-table'
import guitars, { type Guitar } from '@/data/demo-guitars'
import { cartStore, addToCart, isInCart } from '@/stores/cart-store'
import { GuitarCard } from './-GuitarCard'
import { GuitarFilters, getDefaultFilters, type FilterState } from './-GuitarFilters'
import { ArrowUpDown, ArrowUp, ArrowDown, LayoutGrid, List, ShoppingCart, Check } from 'lucide-react'

type ViewMode = 'grid' | 'list'
type SortField = 'name' | 'price' | null

export function GuitarGrid() {
  const [filters, setFilters] = useState<FilterState>(getDefaultFilters())
  const [sorting, setSorting] = useState<SortingState>([])
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortField, setSortField] = useState<SortField>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Filter guitars based on current filters
  const filteredGuitars = useMemo(() => {
    return guitars.filter((guitar) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          guitar.name.toLowerCase().includes(searchLower) ||
          guitar.description.toLowerCase().includes(searchLower) ||
          guitar.tags.some((tag) => tag.toLowerCase().includes(searchLower))
        if (!matchesSearch) return false
      }

      // Type filter
      if (filters.types.length > 0 && !filters.types.includes(guitar.type)) {
        return false
      }

      // Price filter
      if (guitar.price < filters.minPrice || guitar.price > filters.maxPrice) {
        return false
      }

      return true
    })
  }, [filters])

  // Sort guitars
  const sortedGuitars = useMemo(() => {
    if (!sortField) return filteredGuitars

    return [...filteredGuitars].sort((a, b) => {
      let comparison = 0
      if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name)
      } else if (sortField === 'price') {
        comparison = a.price - b.price
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredGuitars, sortField, sortDirection])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else {
        setSortField(null)
        setSortDirection('asc')
      }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-500" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-4 h-4 text-emerald-400" />
    ) : (
      <ArrowDown className="w-4 h-4 text-emerald-400" />
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Filters Sidebar */}
      <div className="lg:w-64 flex-shrink-0">
        <GuitarFilters filters={filters} onFilterChange={setFilters} />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 bg-gray-900/60 backdrop-blur-md rounded-xl border border-gray-800/50 p-3">
          <div className="text-gray-400 text-sm">
            {sortedGuitars.length} guitar{sortedGuitars.length !== 1 ? 's' : ''}{' '}
            found
          </div>

          <div className="flex items-center gap-4">
            {/* Sort Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">Sort by:</span>
              <button
                onClick={() => toggleSort('name')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  sortField === 'name'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                Name {getSortIcon('name')}
              </button>
              <button
                onClick={() => toggleSort('price')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  sortField === 'price'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                Price {getSortIcon('price')}
              </button>
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Guitar Grid/List */}
        {sortedGuitars.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No guitars match your filters</p>
            <button
              onClick={() => setFilters(getDefaultFilters())}
              className="mt-4 text-emerald-400 hover:text-emerald-300"
            >
              Clear all filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedGuitars.map((guitar) => (
              <GuitarCard key={guitar.id} guitar={guitar} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedGuitars.map((guitar) => (
              <GuitarListItem key={guitar.id} guitar={guitar} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// List view item component
function GuitarListItem({ guitar }: { guitar: Guitar }) {
  const inCart = useHydratedStore(cartStore, (state) => isInCart(state, guitar.id), false)

  return (
    <Link
      to="/demo/guitars/$guitarId"
      params={{ guitarId: guitar.id.toString() }}
      className="flex gap-4 bg-gray-900/60 backdrop-blur-md rounded-xl border border-gray-800/50 p-4 hover:border-emerald-500/30 transition-colors"
    >
      <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={guitar.image}
          alt={guitar.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">{guitar.name}</h3>
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                guitar.type === 'acoustic'
                  ? 'bg-amber-500/20 text-amber-400'
                  : guitar.type === 'electric'
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'bg-cyan-500/20 text-cyan-400'
              }`}
            >
              {guitar.type}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-emerald-400">
              ${guitar.price}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                addToCart(guitar.id)
              }}
              className={`px-3 py-1.5 rounded-lg font-medium text-sm flex items-center gap-1.5 transition-colors ${
                inCart
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {inCart ? (
                <>
                  <Check className="w-4 h-4" /> Added
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" /> Add
                </>
              )}
            </button>
          </div>
        </div>
        <p className="text-gray-400 text-sm mt-2 line-clamp-2">
          {guitar.shortDescription}
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          {guitar.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
