import { createFileRoute } from "@tanstack/react-router";
import { Check, ChefHat, Clock, Code, Gauge, Users, X } from "lucide-react";
import { useState } from "react";
import { Streamdown } from "streamdown";

import type { Recipe } from "./api.ai.structured";

type Mode = "structured" | "oneshot";

const SAMPLE_RECIPES = [
	"Homemade Margherita Pizza",
	"Thai Green Curry",
	"Classic Beef Bourguignon",
	"Chocolate Lava Cake",
	"Crispy Korean Fried Chicken",
	"Fresh Spring Rolls with Peanut Sauce",
	"Creamy Mushroom Risotto",
	"Authentic Pad Thai",
];

function RecipeCard({ recipe }: { recipe: Recipe }) {
	const difficultyColors = {
		easy: "bg-green-500/20 text-green-400",
		medium: "bg-yellow-500/20 text-yellow-400",
		hard: "bg-red-500/20 text-red-400",
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h3 className="text-2xl font-bold text-white mb-2">{recipe.name}</h3>
				<p className="text-gray-400">{recipe.description}</p>
			</div>

			{/* Meta info */}
			<div className="flex flex-wrap gap-4">
				<div className="flex items-center gap-2 text-gray-300">
					<Clock className="w-4 h-4 text-orange-400" />
					<span className="text-sm">Prep: {recipe.prepTime}</span>
				</div>
				<div className="flex items-center gap-2 text-gray-300">
					<Clock className="w-4 h-4 text-orange-400" />
					<span className="text-sm">Cook: {recipe.cookTime}</span>
				</div>
				<div className="flex items-center gap-2 text-gray-300">
					<Users className="w-4 h-4 text-orange-400" />
					<span className="text-sm">{recipe.servings} servings</span>
				</div>
				<div
					className={`flex items-center gap-2 px-2 py-1 rounded-full ${
						difficultyColors[recipe.difficulty]
					}`}
				>
					<Gauge className="w-4 h-4" />
					<span className="text-sm capitalize">{recipe.difficulty}</span>
				</div>
			</div>

			{/* Ingredients */}
			<div>
				<h4 className="text-lg font-semibold text-white mb-3">Ingredients</h4>
				<ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
					{recipe.ingredients.map((ing, idx) => (
						<li key={idx} className="flex items-start gap-2 text-gray-300">
							<span className="text-orange-400">•</span>
							<span>
								<span className="font-medium">{ing.amount}</span> {ing.item}
								{ing.notes && (
									<span className="text-gray-500 text-sm"> ({ing.notes})</span>
								)}
							</span>
						</li>
					))}
				</ul>
			</div>

			{/* Instructions */}
			<div>
				<h4 className="text-lg font-semibold text-white mb-3">Instructions</h4>
				<ol className="space-y-3">
					{recipe.instructions.map((step, idx) => (
						<li key={idx} className="flex gap-3 text-gray-300">
							<span className="flex-shrink-0 w-6 h-6 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center text-sm font-medium">
								{idx + 1}
							</span>
							<span>{step}</span>
						</li>
					))}
				</ol>
			</div>

			{/* Tips */}
			{recipe.tips && recipe.tips.length > 0 && (
				<div>
					<h4 className="text-lg font-semibold text-white mb-3">Tips</h4>
					<ul className="space-y-2">
						{recipe.tips.map((tip, idx) => (
							<li key={idx} className="flex items-start gap-2 text-gray-300">
								<span className="text-yellow-400">*</span>
								<span>{tip}</span>
							</li>
						))}
					</ul>
				</div>
			)}

			{/* Nutrition */}
			{recipe.nutritionPerServing && (
				<div>
					<h4 className="text-lg font-semibold text-white mb-3">
						Nutrition (per serving)
					</h4>
					<div className="flex flex-wrap gap-4 text-sm">
						{recipe.nutritionPerServing.calories && (
							<span className="px-3 py-1 bg-gray-700 rounded-full text-gray-300">
								{recipe.nutritionPerServing.calories} cal
							</span>
						)}
						{recipe.nutritionPerServing.protein && (
							<span className="px-3 py-1 bg-gray-700 rounded-full text-gray-300">
								Protein: {recipe.nutritionPerServing.protein}
							</span>
						)}
						{recipe.nutritionPerServing.carbs && (
							<span className="px-3 py-1 bg-gray-700 rounded-full text-gray-300">
								Carbs: {recipe.nutritionPerServing.carbs}
							</span>
						)}
						{recipe.nutritionPerServing.fat && (
							<span className="px-3 py-1 bg-gray-700 rounded-full text-gray-300">
								Fat: {recipe.nutritionPerServing.fat}
							</span>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

function StructuredPage() {
	const [recipeName, setRecipeName] = useState("");
	const [result, setResult] = useState<{
		mode: Mode;
		recipe?: Recipe;
		markdown?: string;
		provider: string;
		model: string;
		cached?: boolean;
	} | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);
	const [copied, setCopied] = useState(false);

	const handleGenerate = async (mode: Mode) => {
		if (!recipeName.trim()) return;

		setIsLoading(true);
		setError(null);
		setResult(null);

		try {
			const response = await fetch("/demo/api/ai/structured", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ recipeName, mode }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to generate recipe");
			}

			setResult(data);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCopy = () => {
		if (result?.recipe) {
			navigator.clipboard.writeText(JSON.stringify(result.recipe, null, 2));
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const canExecute = !!(!isLoading && recipeName.trim() && !error);

	return (
		<div className="min-h-[calc(100vh-80px)] bg-gray-900 p-6">
			<div className="max-w-6xl mx-auto">
				<div className="flex items-center gap-3 mb-6">
					<ChefHat className="w-8 h-8 text-orange-500" />
					<h1 className="text-2xl font-bold text-white">
						One-Shot & Structured Output
					</h1>
				</div>

				<p className="text-gray-400 mb-6">
					Compare two output modes:{" "}
					<strong className="text-orange-400">One-Shot</strong> returns freeform
					markdown, while{" "}
					<strong className="text-orange-400">Structured</strong> returns
					validated JSON conforming to a Zod schema.
				</p>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">
							Recipe Name
						</label>
						<input
							type="text"
							value={recipeName}
							onChange={(e) => setRecipeName(e.target.value)}
							disabled={isLoading}
							placeholder="e.g., Chocolate Chip Cookies"
							className="w-full rounded-lg border border-orange-500/20 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
						/>

						<div className="mt-2">
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Quick Picks
							</label>
							<div className="flex flex-wrap gap-2">
								{SAMPLE_RECIPES.map((name) => (
									<button
										key={name}
										onClick={() => setRecipeName(name)}
										disabled={isLoading}
										className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg border border-gray-700 transition-colors"
									>
										{name}
									</button>
								))}
							</div>
						</div>
					</div>

					<div>
						<div className="grid grid-cols-2 gap-2">
							<button
								onClick={() => handleGenerate("oneshot")}
								disabled={!canExecute}
								className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white ${
									!canExecute ? "bg-gray-600" : "bg-orange-500"
								}`}
							>
								One-Shot (Markdown)
							</button>
							<button
								onClick={() => handleGenerate("structured")}
								disabled={!canExecute}
								className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors  text-white ${
									!canExecute ? "bg-gray-600" : "bg-blue-500"
								}`}
							>
								Structured (JSON)
							</button>
						</div>
					</div>
				</div>

				{/* Output Panel */}
				<div className="mt-5 lg:col-span-2 bg-gray-800 rounded-lg p-6 border border-orange-500/20">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-lg font-semibold text-white">
							Generated Recipe
						</h2>
						<div className="flex items-center gap-3">
							{result && (
								<>
									<span
										className={`px-2 py-1 rounded text-xs font-medium ${
											result.mode === "structured"
												? "bg-purple-500/20 text-purple-400"
												: "bg-blue-500/20 text-blue-400"
										}`}
									>
										{result.mode === "structured"
											? "Structured JSON"
											: "Markdown"}
									</span>
									{result.cached && (
										<span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400">
											Cached
										</span>
									)}
								</>
							)}
							{result && result.mode === "structured" && (
								<button
									onClick={() => setIsDrawerOpen(true)}
									type="button"
									className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
								>
									<Code className="w-4 h-4" />
									View Raw JSON
								</button>
							)}
						</div>
					</div>

					{error && (
						<div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 mb-4">
							{error}
						</div>
					)}

					{result ? (
						<div className="space-y-4">
							{result.mode === "structured" && result.recipe ? (
								<RecipeCard recipe={result.recipe} />
							) : result.markdown ? (
								<div className="prose prose-invert max-w-none">
									<Streamdown>{result.markdown}</Streamdown>
								</div>
							) : null}
						</div>
					) : !error && !isLoading ? (
						<div className="flex flex-col items-center justify-center h-64 text-gray-500">
							<ChefHat className="w-16 h-16 mb-4 opacity-50" />
							<p>
								Enter a recipe name and click "Generate Recipe" to get started.
							</p>
						</div>
					) : null}
				</div>

				{/* Raw JSON Drawer */}
				{isDrawerOpen && result && result.recipe && (
					<div className="fixed inset-0 z-50 flex">
						<div
							className="absolute inset-0 bg-black/50"
							onClick={() => setIsDrawerOpen(false)}
						></div>
						<div className="relative ml-auto w-full max-w-2xl h-full bg-gray-800 shadow-xl flex flex-col">
							<div className="flex items-center justify-between p-4 border-b border-gray-700">
								<h2 className="text-lg font-semibold text-white">Raw JSON</h2>
								<button
									onClick={() => setIsDrawerOpen(false)}
									type="button"
									className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
								>
									<X className="w-5 h-5 text-gray-400" />
								</button>
							</div>
							<div className="flex-1 overflow-auto p-4">
								<pre className="text-sm text-gray-300 whitespace-pre-wrap break-all">
									{JSON.stringify(result.recipe, null, 2)}
								</pre>
							</div>
							<div className="p-4 border-t border-gray-700 flex justify-end">
								<button
									onClick={handleCopy}
									type="button"
									className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
								>
									{copied ? (
										<Check className="w-4 h-4" />
									) : (
										<Code className="w-4 h-4" />
									)}
									{copied ? "Copied!" : "Copy JSON"}
								</button>
							</div>
						</div>
					</div>
				)}

				{/* How It Works */}
				<div className="mt-6 bg-gray-800 rounded-lg p-6 border border-blue-500/20">
					<h3 className="text-lg font-semibold text-white mb-4">
						How It Works
					</h3>
					<div className="space-y-4 text-gray-300 text-sm">
						<div>
							<h4 className="font-medium text-orange-400 mb-1">
								Structured JSON Mode (New!)
							</h4>
							<p className="text-gray-400">
								Uses Cloudflare Workers AI's native{" "}
								<code className="bg-gray-700 px-1 rounded">
									response_format
								</code>{" "}
								parameter with{" "}
								<code className="bg-gray-700 px-1 rounded">json_schema</code>.
								The model (
								<code className="bg-gray-700 px-1 rounded">
									@cf/meta/llama-4-scout-17b-16e-instruct
								</code>
								) natively enforces the schema, guaranteeing valid JSON output
								without prompt engineering.
							</p>
						</div>
						<div>
							<h4 className="font-medium text-orange-400 mb-1">
								One-Shot Markdown Mode
							</h4>
							<p className="text-gray-400">
								Traditional prompt engineering approach. The AI generates
								freeform markdown text based on natural language instructions.
								No schema enforcement, but allows creative formatting.
							</p>
						</div>
						<div className="bg-gray-700/30 rounded-lg p-3 mt-3">
							<p className="text-xs text-gray-400">
								<strong className="text-white">Tech Stack:</strong> TanStack
								Start API routes → Cloudflare Workers AI
								(@cf/meta/llama-4-scout-17b-16e-instruct) → JSON Mode with
								response_format → Zod validation
							</p>
						</div>
					</div>
				</div>

				{/* What I Learned */}
				<div className="mt-6 bg-gray-800 rounded-lg p-6 border border-green-500/20">
					<h3 className="text-lg font-semibold text-white mb-4">
						What I Learned
					</h3>
					<div className="space-y-3 text-gray-300 text-sm">
						<div className="flex items-start gap-2">
							<span className="text-green-400 font-bold">✓</span>
							<div>
								<span className="text-white font-medium">
									Native JSON Mode is reliable:
								</span>
								<span className="text-gray-400">
									Cloudflare's{" "}
									<code className="bg-gray-700 px-1 rounded">
										response_format
									</code>{" "}
									parameter enforces schemas at the model level, not via
									prompts. This eliminates JSON parsing errors.
								</span>
							</div>
						</div>
						<div className="flex items-start gap-2">
							<span className="text-green-400 font-bold">✓</span>
							<div>
								<span className="text-white font-medium">
									Prompt engineering is brittle:
								</span>
								<span className="text-gray-400">
									The old approach (asking AI to "respond with valid JSON")
									failed 30-40% of the time. Models added markdown, extra text,
									or malformed JSON requiring regex hacks.
								</span>
							</div>
						</div>
						<div className="flex items-start gap-2">
							<span className="text-green-400 font-bold">✓</span>
							<div>
								<span className="text-white font-medium">
									Model selection matters:
								</span>
								<span className="text-gray-400">
									Not all Cloudflare models support JSON Mode. Must use{" "}
									<code className="bg-gray-700 px-1 rounded">
										@cf/meta/llama-4-scout-17b-16e-instruct
									</code>{" "}
									or other supported models.
								</span>
							</div>
						</div>
						<div className="flex items-start gap-2">
							<span className="text-green-400 font-bold">✓</span>
							<div>
								<span className="text-white font-medium">
									Zod + JSON Mode is the ideal combo:
								</span>
								<span className="text-gray-400">
									JSON Mode guarantees valid structure, Zod provides TypeScript
									types and runtime validation for extra safety.
								</span>
							</div>
						</div>
						<div className="flex items-start gap-2">
							<span className="text-red-400 font-bold">✗</span>
							<div>
								<span className="text-white font-medium">
									JSON Mode doesn't support streaming:
								</span>
								<span className="text-gray-400">
									Trade-off - you get guaranteed structure but can't stream
									tokens. Use streaming for chat, structured mode for data
									extraction.
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Key Differences */}
				<div className="mt-6 bg-gray-800 rounded-lg p-6 border border-purple-500/20">
					<h3 className="text-lg font-semibold text-white mb-4">
						Key Differences
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
						<div className="bg-purple-500/5 rounded-lg p-4 border border-purple-500/10">
							<h4 className="font-semibold text-purple-400 mb-2">
								Structured JSON
							</h4>
							<ul className="space-y-1 text-gray-300">
								<li>✅ Guaranteed valid JSON</li>
								<li>✅ Type-safe with Zod</li>
								<li>✅ Database-ready</li>
								<li>✅ No parsing errors</li>
								<li>⏱️ No streaming</li>
								<li>🎯 API endpoints</li>
							</ul>
						</div>
						<div className="bg-blue-500/5 rounded-lg p-4 border border-blue-500/10">
							<h4 className="font-semibold text-blue-400 mb-2">
								One-Shot Markdown
							</h4>
							<ul className="space-y-1 text-gray-300">
								<li>✅ Flexible formatting</li>
								<li>✅ Creative freedom</li>
								<li>✅ Human-readable</li>
								<li>✅ Streaming supported</li>
								<li>⚠️ No type safety</li>
								<li>📝 Content pages</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export const Route = createFileRoute("/demo/ai-structured")({
	component: StructuredPage,
});
