import { useStore } from '@tanstack/react-store'
import { useState, useEffect } from 'react'
import type { Store } from '@tanstack/store'

/**
 * Hydration-safe wrapper around useStore.
 *
 * During SSR and initial client hydration, returns the initial value.
 * After hydration completes, returns the actual store value.
 *
 * This prevents hydration mismatches when stores are populated from localStorage.
 *
 * @param store - TanStack Store instance
 * @param selector - Selector function to derive value from store state
 * @param initialValue - Value to use during SSR/hydration
 */
export function useHydratedStore<TState, TSelected>(
  store: Store<TState>,
  selector: (state: TState) => TSelected,
  initialValue: TSelected
): TSelected {
  const storeValue = useStore(store, selector)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return isHydrated ? storeValue : initialValue
}
