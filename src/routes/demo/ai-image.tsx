import { notifications } from "@mantine/notifications";
import { createFileRoute } from "@tanstack/react-router";
import { Download, ImageIcon, Loader2 } from "lucide-react";
import { useId, useState } from "react";
import {
	CoinAnimation,
	showPoorStudentRateLimit,
	showRateLimitNotification,
} from "@/components/RateLimitNotification";

const SIZES = ["1024x1024", "1536x1024", "1024x1536", "auto"];

interface GeneratedImage {
	url?: string;
	b64Json?: string;
	revisedPrompt?: string;
}

interface RateLimitInfo {
	limit: number;
	remaining: number;
	resetAt: number;
}

interface ImageGenerationResponse {
	images: Array<GeneratedImage>;
	rateLimit?: RateLimitInfo;
}

function ImagePage() {
	const sizeId = useId();
	const countId = useId();
	const promptId = useId();

	const [prompt, setPrompt] = useState(
		"A cute baby sea otter wearing a beret and glasses, sitting at a small cafe table, sipping a cappuccino",
	);
	const [size, setSize] = useState("1024x1024");
	const [numberOfImages, setNumberOfImages] = useState(1);
	const [images, setImages] = useState<Array<GeneratedImage>>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(null);
	const [showCoins, setShowCoins] = useState(false);

	const handleGenerate = async () => {
		setIsLoading(true);
		setError(null);
		setImages([]);
		setRateLimit(null);

		try {
			const response = await fetch("/demo/api/ai/image", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ prompt, size, numberOfImages }),
			});

			const data = (await response.json()) as ImageGenerationResponse;

			if (!response.ok) {
				if (response.status === 429) {
					setShowCoins(true);
					setTimeout(() => setShowCoins(false), 2000);
					showPoorStudentRateLimit();
					throw new Error("Rate limit exceeded");
				}
				throw new Error((data as any).error || "Failed to generate image");
			}

			setImages(data.images);
			if (data.rateLimit) {
				setRateLimit(data.rateLimit);
				showRateLimitNotification({
					title: "Image Generated! 🎨",
					message: `${data.rateLimit.remaining} of ${data.rateLimit.limit} generations remaining today.`,
					color: "green",
				});
			}
		} catch (err: any) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	const getImageSrc = (image: GeneratedImage) => {
		if (image.url) return image.url;
		if (image.b64Json) return `data:image/png;base64,${image.b64Json}`;
		return "";
	};

	const handleDownload = async (image: GeneratedImage, index: number) => {
		try {
			let blob: Blob;

			if (image.b64Json) {
				// Convert base64 to blob
				const base64Data = image.b64Json;
				const byteCharacters = atob(base64Data);
				const byteNumbers = new Array(byteCharacters.length);
				for (let i = 0; i < byteCharacters.length; i++) {
					byteNumbers[i] = byteCharacters.charCodeAt(i);
				}
				const byteArray = new Uint8Array(byteNumbers);
				blob = new Blob([byteArray], { type: "image/png" });
			} else if (image.url) {
				// Fetch from URL
				const response = await fetch(image.url);
				blob = await response.blob();
			} else {
				throw new Error("No image data available");
			}

			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `generated-image-${index + 1}.png`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);

			notifications.show({
				title: "Download Started",
				message: "Your image is being downloaded.",
				color: "green",
			});
		} catch (err) {
			console.error("Download error:", err);
			notifications.show({
				title: "Download Failed",
				message: "Could not download the image.",
				color: "red",
			});
		}
	};

	return (
		<div className="min-h-[calc(100vh-80px)] bg-gray-900 p-6">
			{showCoins && <CoinAnimation />}
			<style>{`
				@keyframes fall {
					0% {
						transform: translateY(0) rotate(0deg);
						opacity: 1;
					}
					100% {
						transform: translateY(100vh) rotate(720deg);
						opacity: 0;
					}
				}
				.animate-fall {
					animation-name: fall;
					animation-timing-function: ease-in;
					animation-fill-mode: forwards;
				}
			`}</style>
			<div className="max-w-6xl mx-auto">
				<div className="flex items-center gap-3 mb-6">
					<ImageIcon className="w-8 h-8 text-orange-500" />
					<h1 className="text-2xl font-bold text-white">Image Generation</h1>
					{rateLimit && (
						<span className="ml-auto text-sm text-gray-400">
							{rateLimit.remaining}/{rateLimit.limit} today
						</span>
					)}
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label
									htmlFor={sizeId}
									className="block text-sm font-medium text-gray-300 mb-2"
								>
									Size
								</label>
								<select
									id={sizeId}
									value={size}
									onChange={(e) => setSize(e.target.value)}
									disabled={isLoading}
									className="w-full rounded-lg border border-orange-500/20 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
								>
									{SIZES.map((s) => (
										<option key={s} value={s}>
											{s}
										</option>
									))}
								</select>
							</div>
							<div>
								<label
									htmlFor={countId}
									className="block text-sm font-medium text-gray-300 mb-2"
								>
									Count
								</label>
								<input
									id={countId}
									type="number"
									value={numberOfImages}
									onChange={(e) =>
										setNumberOfImages(
											Math.max(1, Math.min(4, parseInt(e.target.value) || 1)),
										)
									}
									min={1}
									max={4}
									disabled={isLoading}
									className="w-full rounded-lg border border-orange-500/20 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor={promptId}
								className="block text-sm font-medium text-gray-300 mb-2"
							>
								Prompt
							</label>
							<textarea
								id={promptId}
								value={prompt}
								onChange={(e) => setPrompt(e.target.value)}
								disabled={isLoading}
								rows={6}
								className="w-full rounded-lg border border-orange-500/20 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
								placeholder="Describe the visual you want to generate..."
							/>
						</div>

						<button
							type="button"
							onClick={handleGenerate}
							disabled={isLoading || !prompt.trim()}
							className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
						>
							{isLoading ? (
								<>
									<Loader2 className="w-5 h-5 animate-spin" />
									Generating...
								</>
							) : (
								"Generate Image"
							)}
						</button>
					</div>

					<div className="lg:col-span-2 bg-gray-800 rounded-lg p-6 border border-orange-500/20">
						<h2 className="text-lg font-semibold text-white mb-4">
							Generated Images
						</h2>

						{error && (
							<div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 mb-4">
								{error}
							</div>
						)}

						{images.length > 0 ? (
							<div className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{images.map((image, index) => (
										<div
											key={`img-${image.b64Json || index}`}
											className="relative group"
										>
											<img
												src={getImageSrc(image)}
												alt={`Generated visual ${index + 1}`}
												className="w-full rounded-lg border border-gray-700"
											/>
											<button
												type="button"
												onClick={() => handleDownload(image, index)}
												className="absolute top-2 right-2 p-2 bg-gray-900/80 hover:bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
												title="Download visual"
											>
												<Download className="w-4 h-4 text-white" />
											</button>
											{image.revisedPrompt && (
												<p className="mt-2 text-xs text-gray-400 italic">
													Revised: {image.revisedPrompt}
												</p>
											)}
										</div>
									))}
								</div>
							</div>
						) : !error && !isLoading ? (
							<div className="flex flex-col items-center justify-center h-64 text-gray-500">
								<ImageIcon className="w-16 h-16 mb-4 opacity-50" />
								<p>
									Enter a prompt and click "Generate Image" to create an image.
								</p>
							</div>
						) : null}
					</div>
				</div>
			</div>
		</div>
	);
}

export const Route = createFileRoute("/demo/ai-image")({
	component: ImagePage,
});
