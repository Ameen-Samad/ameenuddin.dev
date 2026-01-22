import { cartStore, getCartItemCount } from '@/stores/cart-store'
import { useHydratedStore } from '@/hooks/useHydratedStore'
import { ShoppingCart } from 'lucide-react'

interface CartIconProps {
  onClick: () => void
}

export function CartIcon({ onClick }: CartIconProps) {
  // Use hydration-safe store hook (returns 0 during SSR/hydration)
  const itemCount = useHydratedStore(cartStore, getCartItemCount, 0)

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <ShoppingCart className="w-6 h-6 text-white" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  )
}
