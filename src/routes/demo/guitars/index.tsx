import { createFileRoute } from "@tanstack/react-router";
import { Guitar } from "lucide-react";
import { useState } from "react";
import { CompareDrawer } from "@/components/CompareDrawer";
import { CartDrawer } from "./_components/-CartDrawer";
import { CartIcon } from "./_components/-CartIcon";
import { GuitarChat } from "./_components/-GuitarChat";
import { GuitarGrid } from "./_components/-GuitarGrid";
import { SemanticSearch } from "./_components/-SemanticSearch";

export const Route = createFileRoute("/demo/guitars/")({
	component: GuitarsIndex,
});

function GuitarsIndex() {
	const [isCartOpen, setIsCartOpen] = useState(false);
	const [isChatOpen, setIsChatOpen] = useState(false);

	return (
		<div className="min-h-screen bg-black text-white">
			{/* Header */}
			<header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-gray-800">
				<div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Guitar className="w-8 h-8 text-emerald-400" />
						<div>
							<h1 className="text-2xl font-bold">AI Guitar Concierge</h1>
							<p className="text-gray-400 text-sm">
								Find your perfect guitar with AI assistance
							</p>
						</div>
					</div>

					<div className="flex items-center gap-3">
						{/* Cart Icon */}
						<CartIcon onClick={() => setIsCartOpen(true)} />
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="max-w-7xl mx-auto px-4 py-8">
				<div className="flex gap-6">
					{/* Guitar Grid (main content) */}
					<div className={`flex-1 ${isChatOpen ? "lg:mr-96" : ""}`}>
						{/* Hero Section */}
						<div className="mb-8 text-center">
							<h2 className="text-3xl font-bold mb-3">Discover Your Sound</h2>
							<p className="text-gray-400 max-w-2xl mx-auto mb-6">
								Browse our collection of unique guitars or chat with our AI
								concierge to find the perfect instrument for your style.
							</p>

							{/* Semantic Search */}
							<SemanticSearch
								isChatOpen={isChatOpen}
								onChatToggle={() => setIsChatOpen(!isChatOpen)}
							/>
						</div>

						<GuitarGrid />
					</div>

					{/* AI Chat Panel (collapsible) */}
					{isChatOpen && (
						<aside className="hidden lg:block fixed right-0 top-[73px] bottom-0 w-96 bg-gray-900/95 backdrop-blur-md border-l border-gray-800 z-10">
							<GuitarChat onClose={() => setIsChatOpen(false)} />
						</aside>
					)}
				</div>
			</main>

			{/* Compare Drawer */}
			<CompareDrawer />

			{/* Cart Drawer */}
			<CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
		</div>
	);
}
