import { Link } from '@tanstack/react-router'
import type { Guitar } from '@/data/demo-guitars'
import { ExternalLink } from 'lucide-react'

interface ChatGuitarCardProps {
  guitar: Guitar
}

export function ChatGuitarCard({ guitar }: ChatGuitarCardProps) {
  const typeColors = {
    acoustic: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    electric: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    ukulele: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  }

  return (
    <Link
      to="/demo/guitars/$guitarId"
      params={{ guitarId: guitar.id.toString() }}
      className="block group"
    >
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 hover:border-emerald-500/50 overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={guitar.image}
            alt={guitar.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Type Badge */}
          <div
            className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium border ${typeColors[guitar.type]}`}
          >
            {guitar.type}
          </div>

          {/* View Details Overlay */}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 rounded-lg text-white text-sm font-medium">
              View Details
              <ExternalLink className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <h4 className="text-base font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
            {guitar.name}
          </h4>
          <p className="text-gray-400 text-sm mb-2 line-clamp-2">
            {guitar.shortDescription}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-2">
            {guitar.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 bg-gray-700/50 text-gray-400 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {guitar.tags.length > 3 && (
              <span className="px-1.5 py-0.5 text-gray-500 text-xs">
                +{guitar.tags.length - 3}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="text-lg font-bold text-emerald-400">
            ${guitar.price}
          </div>
        </div>
      </div>
    </Link>
  )
}
