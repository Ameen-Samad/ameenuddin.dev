import { Store } from '@tanstack/store'
import guitars from '@/data/demo-guitars'

export interface CartItem {
  guitarId: number
  quantity: number
}

export interface CartState {
  items: CartItem[]
}

// Initialize from localStorage if available
function getInitialState(): CartState {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('guitar-cart')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // Invalid JSON, return empty cart
      }
    }
  }
  return { items: [] }
}

// Create the cart store
export const cartStore = new Store<CartState>(getInitialState())

// Subscribe to changes and persist to localStorage
if (typeof window !== 'undefined') {
  cartStore.subscribe(() => {
    localStorage.setItem('guitar-cart', JSON.stringify(cartStore.state))
  })
}

// Actions
export function addToCart(guitarId: number, quantity: number = 1) {
  cartStore.setState((state) => {
    const existingItem = state.items.find((item) => item.guitarId === guitarId)
    if (existingItem) {
      return {
        items: state.items.map((item) =>
          item.guitarId === guitarId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ),
      }
    }
    return {
      items: [...state.items, { guitarId, quantity }],
    }
  })
}

export function removeFromCart(guitarId: number) {
  cartStore.setState((state) => ({
    items: state.items.filter((item) => item.guitarId !== guitarId),
  }))
}

export function updateQuantity(guitarId: number, quantity: number) {
  if (quantity <= 0) {
    removeFromCart(guitarId)
    return
  }
  cartStore.setState((state) => ({
    items: state.items.map((item) =>
      item.guitarId === guitarId ? { ...item, quantity } : item
    ),
  }))
}

export function clearCart() {
  cartStore.setState({ items: [] })
}

// Computed selectors
export function getCartTotal(state: CartState): number {
  return state.items.reduce((total, item) => {
    const guitar = guitars.find((g) => g.id === item.guitarId)
    return total + (guitar?.price ?? 0) * item.quantity
  }, 0)
}

export function getCartItemCount(state: CartState): number {
  return state.items.reduce((count, item) => count + item.quantity, 0)
}

export function getCartItems(state: CartState) {
  return state.items.map((item) => ({
    ...item,
    guitar: guitars.find((g) => g.id === item.guitarId),
  }))
}

export function isInCart(state: CartState, guitarId: number): boolean {
  return state.items.some((item) => item.guitarId === guitarId)
}
