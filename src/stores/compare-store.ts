import { Store } from "@tanstack/store";
import guitars from "@/data/demo-guitars";

export interface CompareState {
	guitarIds: number[];
}

const MAX_COMPARE_ITEMS = 2;

// Create the compare store with empty initial state
export const compareStore = new Store<CompareState>({ guitarIds: [] });

// Initialize from localStorage on client mount
if (typeof window !== "undefined") {
	// Load initial state from localStorage
	try {
		const saved = localStorage.getItem("guitar-compare");
		if (saved) {
			const parsed = JSON.parse(saved) as CompareState;
			if (parsed && Array.isArray(parsed.guitarIds)) {
				compareStore.setState(parsed);
			}
		}
	} catch (error) {
		// Invalid JSON, keep empty state
	}

	// Subscribe to changes and persist to localStorage
	compareStore.subscribe(() => {
		localStorage.setItem("guitar-compare", JSON.stringify(compareStore.state));
	});
}

// Actions
export function addToCompare(guitarId: number): boolean {
	const state = compareStore.state;

	// Already in compare
	if (state.guitarIds.includes(guitarId)) {
		return true;
	}

	// Max items reached
	if (state.guitarIds.length >= MAX_COMPARE_ITEMS) {
		return false;
	}

	compareStore.setState((state) => ({
		guitarIds: [...state.guitarIds, guitarId],
	}));
	return true;
}

export function removeFromCompare(guitarId: number) {
	compareStore.setState((state) => ({
		guitarIds: state.guitarIds.filter((id) => id !== guitarId),
	}));
}

export function clearCompare() {
	compareStore.setState({ guitarIds: [] });
}

// Computed selectors
export function getCompareGuitars(state: CompareState) {
	return state.guitarIds
		.map((id) => guitars.find((g) => g.id === id))
		.filter(Boolean);
}

export function isInCompare(state: CompareState, guitarId: number): boolean {
	return state.guitarIds.includes(guitarId);
}

export function canAddToCompare(state: CompareState): boolean {
	return state.guitarIds.length < MAX_COMPARE_ITEMS;
}

export function getCompareCount(state: CompareState): number {
	return state.guitarIds.length;
}
