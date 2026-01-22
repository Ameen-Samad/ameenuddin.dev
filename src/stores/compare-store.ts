import { Store } from '@tanstack/store'
import guitars from '@/data/demo-guitars'

export interface CompareState {
  guitarIds: number[]
}

const MAX_COMPARE_ITEMS = 2

// Initialize from localStorage if available
function getInitialState(): CompareState {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('guitar-compare')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // Invalid JSON, return empty compare
      }
    }
  }
  return { guitarIds: [] }
}

// Create the compare store
export const compareStore = new Store<CompareState>(getInitialState())

// Subscribe to changes and persist to localStorage
if (typeof window !== 'undefined') {
  compareStore.subscribe(() => {
    localStorage.setItem('guitar-compare', JSON.stringify(compareStore.state))
  })
}

// Actions
export function addToCompare(guitarId: number): boolean {
  const state = compareStore.state

  // Already in compare
  if (state.guitarIds.includes(guitarId)) {
    return true
  }

  // Max items reached
  if (state.guitarIds.length >= MAX_COMPARE_ITEMS) {
    return false
  }

  compareStore.setState((state) => ({
    guitarIds: [...state.guitarIds, guitarId],
  }))
  return true
}

export function removeFromCompare(guitarId: number) {
  compareStore.setState((state) => ({
    guitarIds: state.guitarIds.filter((id) => id !== guitarId),
  }))
}

export function clearCompare() {
  compareStore.setState({ guitarIds: [] })
}

// Computed selectors
export function getCompareGuitars(state: CompareState) {
  return state.guitarIds
    .map((id) => guitars.find((g) => g.id === id))
    .filter(Boolean)
}

export function isInCompare(state: CompareState, guitarId: number): boolean {
  return state.guitarIds.includes(guitarId)
}

export function canAddToCompare(state: CompareState): boolean {
  return state.guitarIds.length < MAX_COMPARE_ITEMS
}

export function getCompareCount(state: CompareState): number {
  return state.guitarIds.length
}
