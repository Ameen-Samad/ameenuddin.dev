import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import type { AISearchQuery } from "@/lib/cloudflare-ai";
import {
	parseNaturalLanguage,
	performSemanticSearch,
} from "@/lib/cloudflare-ai";

interface AISearchBarProps {
	onSearch: (query: AISearchQuery | string) => void;
	placeholder?: string;
	showSuggestions?: boolean;
	className?: string;
}

export function AISearchBar({
	onSearch,
	placeholder = "Search projects... (try 'AI projects')",
	showSuggestions = true,
	className = "",
}: AISearchBarProps) {
	const [query, setQuery] = useState("");
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [showDropdown, setShowDropdown] = useState(false);

	useEffect(() => {
		const timer = setTimeout(async () => {
			if (query.length > 2 && showSuggestions) {
				setIsSearching(true);
				try {
					const parsed = await parseNaturalLanguage(query);
					if (parsed.technologies.length > 0 || parsed.categories.length > 0) {
						setSuggestions([...parsed.technologies, ...parsed.categories]);
						setShowDropdown(true);
					} else {
						setSuggestions([]);
						setShowDropdown(false);
					}
				} catch (error) {
					console.error("Error parsing query:", error);
					setSuggestions([]);
				}
				setIsSearching(false);
			} else {
				setSuggestions([]);
				setShowDropdown(false);
			}
		}, 300);

		return () => clearTimeout(timer);
	}, [query, showSuggestions]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (query.trim()) {
			onSearch(query);
			setShowDropdown(false);
		}
	};

	const handleSuggestionClick = (suggestion: string) => {
		setQuery(suggestion);
		onSearch(suggestion);
		setShowDropdown(false);
	};

	const handleSemanticSearch = async () => {
		if (query.trim()) {
			setIsSearching(true);
			try {
				const results = await performSemanticSearch(query);
				onSearch({
					query,
					intent: "all",
					suggestions,
					similarProjects: results.map((r) => r.id),
				});
			} catch (error) {
				console.error("Semantic search error:", error);
				onSearch(query);
			}
			setIsSearching(false);
		}
		setShowDropdown(false);
	};

	return (
		<div className={`relative ${className}`}>
			<form onSubmit={handleSubmit} className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
				<motion.input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onFocus={() => setShowDropdown(true)}
					placeholder={placeholder}
					className="w-full pl-10 pr-24 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
					whileFocus={{ scale: 1.01 }}
					transition={{ type: "spring", stiffness: 300, damping: 20 }}
				/>
				<button
					type="button"
					onClick={handleSemanticSearch}
					disabled={isSearching || !query.trim()}
					className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm rounded-md transition-all"
				>
					AI Search
				</button>
			</form>

			{showDropdown && suggestions.length > 0 && (
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -10 }}
					className="absolute z-50 w-full mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden"
				>
					{suggestions.slice(0, 5).map((suggestion, index) => (
						<motion.button
							key={suggestion}
							type="button"
							onClick={() => handleSuggestionClick(suggestion)}
							className="w-full px-4 py-2 text-left text-gray-300 hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-2"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: index * 0.05 }}
						>
							<Search className="h-4 w-4 text-gray-400" />
							{suggestion}
						</motion.button>
					))}
				</motion.div>
			)}

			{isSearching && (
				<div className="absolute right-2 top-1/2 -translate-y-1/2">
					<motion.div
						className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full"
						animate={{ rotate: 360 }}
						transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
					/>
				</div>
			)}
		</div>
	);
}
