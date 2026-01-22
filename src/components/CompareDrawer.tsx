import { Link } from "@tanstack/react-router";
import { useHydratedStore } from "@/hooks/useHydratedStore";
import {
	Check,
	GitCompare,
	Loader2,
	ShoppingCart,
	Sparkles,
	X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Guitar as GuitarType } from "@/data/demo-guitars";

// Prevent SSR issues by only rendering on client
function useIsMounted() {
	const [isMounted, setIsMounted] = useState(false);
	useEffect(() => {
		setIsMounted(true);
	}, []);
	return isMounted;
}

import { addToCart, cartStore, isInCart } from "@/stores/cart-store";
import {
	clearCompare,
	compareStore,
	getCompareGuitars,
	removeFromCompare,
} from "@/stores/compare-store";

interface AIInsight {
	guitarId: number;
	bestFor: string;
	soundProfile: string;
	whyChoose: string;
}

export function CompareDrawer() {
	const isMounted = useIsMounted();
	const selectedGuitars = useHydratedStore(compareStore, getCompareGuitars, []);
	const [isOpen, setIsOpen] = useState(false);
	const [insights, setInsights] = useState<AIInsight[]>([]);
	const [isLoadingInsights, setIsLoadingInsights] = useState(false);
	const hasAutoOpened = useRef(false);

	const fetchInsights = useCallback(async (guitars: GuitarType[]) => {
		setIsLoadingInsights(true);
		try {
			const response = await fetch("/demo/api/ai/guitars/compare", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					guitars: guitars.map((g) => ({
						id: g.id,
						name: g.name,
						description: g.description,
						price: g.price,
						type: g.type,
						tags: g.tags,
						features: g.features,
					})),
				}),
			});

			if (response.ok) {
				const data = await response.json();
				setInsights(data.insights || []);
			}
		} catch (error) {
			console.error("Failed to fetch insights:", error);
		} finally {
			setIsLoadingInsights(false);
		}
	}, []);

	// Fetch AI insights when guitars change
	useEffect(() => {
		if (selectedGuitars.length === 2) {
			fetchInsights(selectedGuitars as GuitarType[]);
		}
	}, [selectedGuitars, fetchInsights]);

	// Auto-open when 2 guitars are selected (only once)
	useEffect(() => {
		if (selectedGuitars.length === 2 && !isOpen && !hasAutoOpened.current) {
			setIsOpen(true);
			hasAutoOpened.current = true;
		}

		// Reset auto-open flag when compare list is cleared
		if (selectedGuitars.length === 0) {
			hasAutoOpened.current = false;
		}
	}, [selectedGuitars.length, isOpen]);

	if (!isMounted || selectedGuitars.length === 0) {
		return null;
	}

	const guitar1 = selectedGuitars[0] as GuitarType;
	const guitar2 = selectedGuitars[1] as GuitarType | undefined;
	const insight1 = insights.find((i) => i.guitarId === guitar1?.id);
	const insight2 = guitar2
		? insights.find((i) => i.guitarId === guitar2.id)
		: undefined;

	return (
		<>
			{/* Floating Toggle Button */}
			{!isOpen && (
				<button
					type="button"
					onClick={() => setIsOpen(true)}
					className="fixed bottom-6 right-6 md:left-[300px] md:right-auto z-50 bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110"
					aria-label="Open compare drawer"
				>
					<div className="relative">
						<GitCompare className="w-6 h-6" />
						<span className="absolute -top-2 -right-2 bg-white text-emerald-600 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
							{selectedGuitars.length}
						</span>
					</div>
				</button>
			)}

			{/* Drawer */}
			<div
				className={`fixed inset-y-0 right-0 md:left-[280px] md:right-auto z-50 bg-black/95 backdrop-blur-xl border-l border-gray-800 shadow-2xl transition-all duration-300 ease-out ${
					isOpen ? "w-full md:w-[600px] lg:w-[800px]" : "translate-x-full"
				}`}
			>
				{/* Header */}
				<div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-gray-800">
					<div className="px-6 py-4 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
								<GitCompare className="w-5 h-5 text-emerald-400" />
								<span className="text-emerald-400 font-medium">
									{selectedGuitars.length}/2
								</span>
							</div>
							<h2 className="text-xl font-bold">Compare Guitars</h2>
						</div>
						<button
							type="button"
							onClick={() => setIsOpen(false)}
							className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
							aria-label="Close drawer"
						>
							<X className="w-5 h-5" />
						</button>
					</div>
				</div>

				{/* Content */}
				<div className="overflow-y-auto h-full pb-20">
					<div className="px-6 py-6">
						{/* AI Insights Banner */}
						{isLoadingInsights && (
							<div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center gap-3">
								<Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
								<span className="text-emerald-400">
									AI is analyzing these guitars for you...
								</span>
							</div>
						)}

						{/* Single Guitar View */}
						{!guitar2 && (
							<div className="flex-1">
								<MiniGuitarCard guitar={guitar1} insight={insight1} />
								<div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
									<p className="text-blue-400 text-sm text-center">
										Select one more guitar to compare
									</p>
								</div>
							</div>
						)}

						{/* Two Guitar Comparison */}
						{guitar2 && (
							<>
								{/* Side by Side */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
									<MiniGuitarCard
										guitar={guitar1}
										insight={insight1}
										onRemove={() => removeFromCompare(guitar1.id)}
									/>
									<MiniGuitarCard
										guitar={guitar2}
										insight={insight2}
										onRemove={() => removeFromCompare(guitar2.id)}
									/>
								</div>

								{/* Feature Comparison */}
								<div className="bg-gray-900/60 rounded-xl border border-gray-800 overflow-hidden">
									<h3 className="px-6 py-4 font-bold bg-gray-900/80 border-b border-gray-800">
										Feature Comparison
									</h3>
									<table className="w-full">
										<tbody>
											<CompareRow
												label="Price"
												value1={`$${guitar1.price}`}
												value2={`$${guitar2.price}`}
												highlight={guitar1.price < guitar2.price ? 1 : 2}
											/>
											<CompareRow
												label="Type"
												value1={guitar1.type}
												value2={guitar2.type}
											/>
											<CompareRow
												label="Features"
												value1={guitar1.features.join(", ")}
												value2={guitar2.features.join(", ")}
											/>
											{insight1 && insight2 && (
												<>
													<CompareRow
														label="Best For"
														value1={insight1.bestFor}
														value2={insight2.bestFor}
														isAI
													/>
													<CompareRow
														label="Sound Profile"
														value1={insight1.soundProfile}
														value2={insight2.soundProfile}
														isAI
													/>
												</>
											)}
										</tbody>
									</table>
								</div>
							</>
						)}

						{/* Clear All Button */}
						<div className="mt-6">
							<button
								type="button"
								onClick={() => {
									clearCompare();
									setIsOpen(false);
								}}
								className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors"
							>
								Clear All
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Backdrop */}
			{isOpen && (
				<button
					type="button"
					onClick={() => setIsOpen(false)}
					className="fixed inset-0 bg-black/60 z-40 md:hidden"
					aria-label="Close drawer"
				/>
			)}
		</>
	);
}

function MiniGuitarCard({
	guitar,
	insight,
	onRemove,
}: {
	guitar: GuitarType;
	insight?: AIInsight;
	onRemove?: () => void;
}) {
	const inCart = useHydratedStore(cartStore, (state) => isInCart(state, guitar.id), false);

	return (
		<div className="bg-gray-900/60 rounded-xl border border-gray-800 overflow-hidden">
			{/* Header with remove button */}
			<div className="relative">
				<div className="aspect-video overflow-hidden">
					<img
						src={guitar.image}
						alt={guitar.name}
						className="w-full h-full object-cover"
					/>
				</div>
				{onRemove && (
					<button
						type="button"
						onClick={onRemove}
						className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-gray-400 hover:text-white hover:bg-black transition-colors"
						aria-label="Remove from compare"
					>
						<X className="w-4 h-4" />
					</button>
				)}
			</div>

			{/* Content */}
			<div className="p-4">
				<Link
					to="/demo/guitars/$guitarId"
					params={{ guitarId: guitar.id.toString() }}
					className="text-lg font-bold text-white hover:text-emerald-400 transition-colors"
				>
					{guitar.name}
				</Link>
				<div className="text-xl font-bold text-emerald-400 mt-1">
					${guitar.price}
				</div>

				{/* AI Insight */}
				{insight && (
					<div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
						<div className="flex items-center gap-2 mb-1">
							<Sparkles className="w-3.5 h-3.5 text-emerald-400" />
							<span className="text-xs font-medium text-emerald-400">
								AI Recommendation
							</span>
						</div>
						<p className="text-gray-300 text-xs italic">
							"{insight.whyChoose}"
						</p>
					</div>
				)}

				{/* Add to Cart */}
				<button
					type="button"
					onClick={() => addToCart(guitar.id)}
					className={`w-full mt-3 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors text-sm ${
						inCart
							? "bg-emerald-600/20 text-emerald-400 border border-emerald-600/30"
							: "bg-emerald-600 hover:bg-emerald-500 text-white"
					}`}
				>
					{inCart ? (
						<>
							<Check className="w-4 h-4" /> Added
						</>
					) : (
						<>
							<ShoppingCart className="w-4 h-4" /> Add to Cart
						</>
					)}
				</button>
			</div>
		</div>
	);
}

function CompareRow({
	label,
	value1,
	value2,
	highlight,
	isAI,
}: {
	label: string;
	value1: string;
	value2: string;
	highlight?: 1 | 2;
	isAI?: boolean;
}) {
	return (
		<tr className="border-b border-gray-800/50 last:border-0">
			<td className="px-6 py-3 text-gray-400 text-sm">
				<div className="flex items-center gap-2">
					{isAI && <Sparkles className="w-3.5 h-3.5 text-emerald-400" />}
					{label}
				</div>
			</td>
			<td
				className={`px-4 py-3 text-sm text-center ${
					highlight === 1 ? "text-emerald-400 font-medium" : "text-gray-300"
				}`}
			>
				{value1}
			</td>
			<td
				className={`px-4 py-3 text-sm text-center ${
					highlight === 2 ? "text-emerald-400 font-medium" : "text-gray-300"
				}`}
			>
				{value2}
			</td>
		</tr>
	);
}
