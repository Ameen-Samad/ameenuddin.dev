import { useHydratedStore } from '@/hooks/useHydratedStore'
import {
  cartStore,
  getCartItems,
  getCartTotal,
  updateQuantity,
  removeFromCart,
  clearCart,
} from '@/stores/cart-store'
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const items = useHydratedStore(cartStore, getCartItems, [])
  const total = useHydratedStore(cartStore, getCartTotal, 0)

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 md:left-[280px] bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md md:max-w-lg bg-gray-900 border-l border-gray-800 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Your Cart
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingBag className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg">Your cart is empty</p>
              <p className="text-sm mt-2">Add some guitars to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                if (!item.guitar) return null
                return (
                  <div
                    key={item.guitarId}
                    className="flex gap-4 bg-gray-800/50 rounded-lg p-3"
                  >
                    {/* Image */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.guitar.image}
                        alt={item.guitar.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">
                        {item.guitar.name}
                      </h3>
                      <p className="text-emerald-400 font-bold">
                        ${item.guitar.price}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.guitarId, item.quantity - 1)
                          }
                          className="p-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4 text-white" />
                        </button>
                        <span className="text-white w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.guitarId, item.quantity + 1)
                          }
                          className="p-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.guitarId)}
                          className="p-1 rounded bg-red-900/50 hover:bg-red-800/50 transition-colors ml-auto"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-gray-800 space-y-4">
            <div className="flex justify-between items-center text-lg">
              <span className="text-gray-400">Total</span>
              <span className="text-white font-bold">${total.toFixed(2)}</span>
            </div>

            <button
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors"
              onClick={() => {
                alert('This is a demo - checkout not implemented!')
              }}
            >
              Checkout
            </button>

            <button
              onClick={() => clearCart()}
              className="w-full py-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  )
}
