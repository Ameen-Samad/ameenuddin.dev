import { createFileRoute } from "@tanstack/react-router";
import { Guitar, MessageCircle } from "lucide-react";
import { useState } from "react";
import { CompareDrawer } from "@/components/CompareDrawer";
import { CartDrawer } from "./_components/-CartDrawer";
import { CartIcon } from "./_components/-CartIcon";
import { ChatDrawer } from "./_components/-ChatDrawer";
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
				</div>
			</main>

			{/* Floating Chat Button (Mobile Only) */}
			{!isChatOpen && (
				<button
					onClick={() => setIsChatOpen(true)}
					className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg flex items-center justify-center z-30 transition-colors"
					aria-label="Open AI chat"
				>
					<MessageCircle className="w-6 h-6" />
				</button>
			)}

			{/* AI Chat Drawer (Mobile) / Sidebar (Desktop) */}
			<ChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

			{/* Compare Drawer */}
			<CompareDrawer />

			{/* Cart Drawer */}
			<CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
		</div>
	);
}
