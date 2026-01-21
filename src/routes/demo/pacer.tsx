import {
	useDebouncedCallback,
	useThrottledCallback,
} from "@tanstack/react-pacer";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/demo/pacer")({
	component: PacerDemo,
});

function PacerDemo() {
	const [value, setValue] = useState("");
	const [debouncedCount, setDebouncedCount] = useState(0);
	const [throttledCount, setThrottledCount] = useState(0);
	const [immediateCount, setImmediateCount] = useState(0);

	const debouncedHandler = useDebouncedCallback(
		(newValue: string) => {
			console.log("Debounced:", newValue);
			setDebouncedCount((prev) => prev + 1);
		},
		{ wait: 500 },
	);

	const throttledHandler = useThrottledCallback(
		(newValue: string) => {
			console.log("Throttled:", newValue);
			setThrottledCount((prev) => prev + 1);
		},
		{ wait: 200 },
	);

	const immediateHandler = (newValue: string) => {
		console.log("Immediate:", newValue);
		setImmediateCount((prev) => prev + 1);
	};

	return (
		<div
			className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900 p-4 text-white"
			style={{
				backgroundImage:
					"radial-gradient(50% 50% at 30% 50%, #0891b2 0%, #1e3a8a 70%, #0f172a 100%)",
			}}
		>
			<div className="w-full max-w-2xl p-8 rounded-xl backdrop-blur-md bg-black/50 shadow-xl border-8 border-black/10">
				<h1 className="text-3xl font-bold mb-2">TanStack Pacer Demo</h1>
				<p className="text-white/70 mb-8">
					Performance optimization patterns: debounce, throttle, and immediate
					execution
				</p>

				<div className="space-y-6">
					<div className="space-y-2">
						<label className="block text-sm font-medium">
							Type something rapidly...
						</label>
						<input
							type="text"
							value={value}
							onChange={(e) => {
								setValue(e.target.value);
								immediateHandler(e.target.value);
								debouncedHandler(e.target.value);
								throttledHandler(e.target.value);
							}}
							placeholder="Type fast to see the difference..."
							className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
						/>
					</div>

					<div className="grid grid-cols-3 gap-4">
						<div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-center">
							<div className="text-xs text-red-200 mb-1">Immediate</div>
							<div className="text-3xl font-bold">{immediateCount}</div>
							<div className="text-xs text-red-200 mt-1">
								Called every keystroke
							</div>
						</div>

						<div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 text-center">
							<div className="text-xs text-yellow-200 mb-1">
								Throttled (200ms)
							</div>
							<div className="text-3xl font-bold">{throttledCount}</div>
							<div className="text-xs text-yellow-200 mt-1">
								Max once per 200ms
							</div>
						</div>

						<div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
							<div className="text-xs text-green-200 mb-1">
								Debounced (500ms)
							</div>
							<div className="text-3xl font-bold">{debouncedCount}</div>
							<div className="text-xs text-green-200 mt-1">
								Wait 500ms after typing
							</div>
						</div>
					</div>

					<div className="bg-white/5 rounded-lg p-4 space-y-3">
						<h3 className="font-semibold text-lg">Performance Patterns</h3>
						<div className="space-y-2 text-sm">
							<div className="flex items-start gap-2">
								<span className="text-red-400 font-bold">Immediate:</span>
								<span className="text-white/80">
									Every keystroke triggers handler. Use for simple updates.
								</span>
							</div>
							<div className="flex items-start gap-2">
								<span className="text-yellow-400 font-bold">Throttled:</span>
								<span className="text-white/80">
									Handler runs at most once per interval. Use for resizing,
									scrolling.
								</span>
							</div>
							<div className="flex items-start gap-2">
								<span className="text-green-400 font-bold">Debounced:</span>
								<span className="text-white/80">
									Handler runs only after a pause. Use for search, autocomplete,
									API calls.
								</span>
							</div>
						</div>
					</div>

					<div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
						<h4 className="font-semibold mb-2">Real-World Use Cases</h4>
						<ul className="text-sm space-y-1 text-white/80">
							<li>
								✓ <strong>Debounce:</strong> Search inputs, autocomplete, window
								resize final state
							</li>
							<li>
								✓ <strong>Throttle:</strong> Scroll events, mouse movement,
								resize events
							</li>
							<li>
								✓ <strong>Rate Limit:</strong> API calls, button clicks to
								prevent spam
							</li>
							<li>
								✓ <strong>Batch:</strong> Multiple operations that can be
								processed together
							</li>
							<li>
								✓ <strong>Queue:</strong> Sequential processing of tasks with
								delays
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
