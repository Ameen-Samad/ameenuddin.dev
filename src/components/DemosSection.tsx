import {
	Accordion,
	Badge,
	Code,
	Container,
	Group,
	List,
	Paper,
	SimpleGrid,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
	ArrowRight,
	Bot,
	Box,
	Code2,
	Database,
	FileCode,
	FileText,
	FormInput,
	Gamepad2,
	GitCommit,
	Globe,
	Guitar,
	ImageIcon,
	Lightbulb,
	MessageSquare,
	Mic,
	Server,
	Table,
	Volume2,
	Zap,
} from "lucide-react";

interface Demo {
	id: string;
	title: string;
	description: string;
	icon: React.ReactNode;
	path: string;
	badge: string;
	color: string;
	features: string[];
	learnings: string[];
	gitEvidence?: string;
	technicalHighlights?: string[];
}

const demos: Demo[] = [
	{
		id: "ai-voice",
		title: "Voice Agent",
		description:
			"Real-time speech-to-text transcription using WebSocket streaming",
		icon: <Mic className="w-8 h-8" />,
		path: "/demo/ai-voice",
		badge: "Live AI",
		color: "#339af0",
		features: ["Real-time", "WebSocket", "Live transcription"],
		learnings: [
			"WebSocket binary streaming for real-time audio data",
			"AudioContext API: 16kHz Float32→Int16 PCM conversion",
			"Real-time state synchronization (connection + recording + transcription)",
			"Graceful error recovery for connection failures",
		],
		technicalHighlights: [
			"Browsers use Float32 audio by default, but Cloudflare Workers AI expects Int16 PCM",
			"Binary data must be properly buffered to avoid audio glitches",
			"Connection state must be tracked separately from recording state",
		],
		gitEvidence: "https://github.com/Ameen-Samad/ameenuddin.dev/blob/main/src/components/demo-VoiceAgent.tsx#L183",
	},
	{
		id: "chatbot",
		title: "AI Chatbot with RAG",
		description:
			"Retrieval-Augmented Generation chatbot with document search and context",
		icon: <Bot className="w-8 h-8" />,
		path: "/chatbot",
		badge: "RAG AI",
		color: "#7950f2",
		features: ["RAG", "Vector search", "Context-aware"],
		learnings: [
			"Building RAG (Retrieval-Augmented Generation) systems with vector search",
			"Document chunking and embedding strategies for semantic search",
			"Context window management for large documents",
			"Combining retrieved context with LLM responses",
		],
		technicalHighlights: [
			"Vector embeddings enable semantic search beyond keyword matching",
			"RAG reduces hallucinations by grounding responses in actual data",
			"Context window limits require smart chunking strategies",
		],
		gitEvidence: "https://github.com/Ameen-Samad/ameenuddin.dev/blob/main/src/routes/chatbot.tsx",
	},
	{
		id: "tetris",
		title: "Tetris with AI Agent",
		description:
			"Classic Tetris game with WebAssembly and AI-powered gameplay assistant",
		icon: <Gamepad2 className="w-8 h-8" />,
		path: "/tetris",
		badge: "Game AI",
		color: "#f783ac",
		features: ["WebAssembly", "AI agent", "Real-time"],
		learnings: [
			"Compiling game logic to WebAssembly for performance",
			"Building AI agents that can play games autonomously",
			"Managing game state synchronization between WASM and JavaScript",
			"Optimizing render loops for smooth 60fps gameplay",
		],
		technicalHighlights: [
			"WebAssembly runs at near-native speed (vs pure JavaScript)",
			"AI agent uses heuristics to evaluate board states",
			"Game loop runs independently from React render cycle",
		],
		gitEvidence: "https://github.com/Ameen-Samad/ameenuddin.dev/blob/main/src/routes/tetris.tsx",
	},
	{
		id: "guitar-concierge",
		title: "AI Guitar Concierge",
		description:
			"Full-stack AI-powered shopping experience with chat recommendations, semantic search, and comparison tools",
		icon: <Guitar className="w-8 h-8" />,
		path: "/demo/guitars",
		badge: "Full-Stack AI",
		color: "#10b981",
		features: ["AI Chat", "Semantic Search", "E-commerce", "Comparison"],
		learnings: [
			"Building conversational AI with tool calling for product recommendations",
			"Semantic search using vector embeddings for 'vibe-based' queries",
			"TanStack Store for persistent shopping cart with localStorage sync",
			"TanStack Table for sortable, filterable product grids",
			"Side-by-side comparison with AI-generated insights",
		],
		technicalHighlights: [
			"AI tool calling enables structured recommendations in chat",
			"Vector embeddings find guitars by feel/vibe, not just keywords",
			"TanStack Store + localStorage provides seamless cart persistence",
			"Streaming responses give real-time AI chat feedback",
		],
		gitEvidence: "https://github.com/Ameen-Samad/ameenuddin.dev/tree/main/src/routes/demo/guitars",
	},
	{
		id: "builder",
		title: "AI-Powered 3D Builder",
		description:
			"Interactive 3D scene builder with AI-generated models and natural language",
		icon: <Box className="w-8 h-8" />,
		path: "/builder",
		badge: "3D AI",
		color: "#20c997",
		features: ["3D rendering", "AI generation", "Interactive"],
		learnings: [
			"Three.js fundamentals for WebGL-based 3D rendering",
			"Converting AI text descriptions into 3D model parameters",
			"Managing scene graph and object transformations",
			"Performance optimization for real-time 3D interaction",
		],
		technicalHighlights: [
			"Three.js abstracts WebGL complexity while keeping performance",
			"AI can generate parametric 3D models from text descriptions",
			"Scene optimization is critical for smooth 60fps rendering",
		],
		gitEvidence: "https://github.com/Ameen-Samad/ameenuddin.dev/blob/main/src/routes/builder.tsx",
	},
	{
		id: "ai-image",
		title: "Image Generation",
		description:
			"Generate stunning images from text prompts using Stable Diffusion XL Lightning",
		icon: <ImageIcon className="w-8 h-8" />,
		path: "/demo/ai-image",
		badge: "Image AI",
		color: "#ff6b6b",
		features: ["Multiple sizes", "Batch generation", "Instant download"],
		learnings: [
			"Batch processing with Promise.all for parallel image generation",
			"Base64 image handling and rendering in React",
			"Progress tracking for long-running AI operations",
			"Error handling for generation failures",
		],
		technicalHighlights: [
			"Generate 1-4 images in parallel using Cloudflare Workers AI",
			"Handle loading states during generation (15-30 seconds per image)",
			"Convert base64 responses to downloadable files",
		],
		gitEvidence: "https://github.com/Ameen-Samad/ameenuddin.dev/blob/main/src/routes/demo/ai-image.tsx",
	},
	{
		id: "ai-tts",
		title: "Text-to-Speech",
		description:
			"Convert text to natural-sounding speech with Deepgram Aura voices",
		icon: <Volume2 className="w-8 h-8" />,
		path: "/demo/ai-tts",
		badge: "Voice AI",
		color: "#51cf66",
		features: ["12 voices", "Live playback", "MP3 download"],
		learnings: [
			"Deepgram Aura API integration for high-quality TTS",
			"Audio file generation and browser playback",
			"File download handling for generated audio",
			"Voice selection and parameter tuning",
		],
		technicalHighlights: [
			"12 different voice options with natural intonation",
			"Live audio playback with HTML5 Audio API",
			"Generate downloadable MP3 files",
		],
		gitEvidence: "https://github.com/Ameen-Samad/ameenuddin.dev/commit/8581789",
	},
	{
		id: "ai-chat",
		title: "AI Chat",
		description:
			"Interactive chat with streaming responses and context awareness",
		icon: <MessageSquare className="w-8 h-8" />,
		path: "/demo/ai-portfolio",
		badge: "Chat AI",
		color: "#ffd43b",
		features: ["Streaming", "Context aware", "Tool calling"],
		learnings: [
			"Server-Sent Events (SSE) for streaming AI responses",
			"Custom ReadableStream parsing for chunked data",
			"Context management for multi-turn conversations",
			"Real-time UI updates during streaming",
		],
		technicalHighlights: [
			"SSE allows server to push updates without polling",
			"Stream responses word-by-word for better UX",
			"Maintain conversation context across multiple messages",
		],
		gitEvidence: "https://github.com/Ameen-Samad/ameenuddin.dev/blob/main/src/lib/demo-chat-hook.ts#L132",
	},
	{
		id: "ai-structured",
		title: "Structured Output",
		description: "Generate structured recipe data with type-safe validation",
		icon: <FileCode className="w-8 h-8" />,
		path: "/demo/ai-structured",
		badge: "Data AI",
		color: "#cc5de8",
		features: ["JSON output", "Zod validation", "Type-safe"],
		learnings: [
			"Forcing LLMs to return structured JSON with Zod schemas",
			"Type-safe parsing and validation of AI outputs",
			"Handling parsing errors gracefully",
			"Schema design for reliable AI responses",
		],
		technicalHighlights: [
			"Zod provides runtime validation for AI-generated data",
			"Type inference ensures compile-time safety",
			"Structured outputs are more reliable than free-form text",
		],
		gitEvidence: "https://github.com/Ameen-Samad/ameenuddin.dev/blob/main/src/routes/demo/ai-structured.tsx",
	},
	{
		id: "tanstack-query",
		title: "TanStack Query",
		description: "CRUD with caching, optimistic updates, and virtualization",
		icon: <Database className="w-8 h-8" />,
		path: "/demo/tanstack-query",
		badge: "TanStack",
		color: "#ff4154",
		features: [
			"Caching",
			"Optimistic updates",
			"Virtualization",
			"Bulk operations",
		],
		learnings: [
			"useQuery hook for data fetching with automatic caching",
			"Optimistic updates: instant UI without waiting",
			"Row virtualization for 1000+ items performance",
			"TanStack Table with sorting and CRUD operations",
			"Mutation callbacks: onMutate, onError, onSettled",
		],
		technicalHighlights: [
			"Optimistic updates: update UI immediately, rollback on error",
			"Virtual scrolling: only renders visible rows",
			"QueryClient: manual cache manipulation",
			"TanStack Table + Virtual: large datasets",
		],
		gitEvidence: "https://github.com/Ameen-Samad/ameenuddin.dev/blob/main/src/routes/demo/tanstack-query.tsx",
	},
	{
		id: "store",
		title: "TanStack Store",
		description:
			"Reactive state with derived values, computed state, and theme toggling",
		icon: <Code2 className="w-8 h-8" />,
		path: "/demo/store",
		badge: "TanStack",
		color: "#20c997",
		features: [
			"Derived state",
			"Computed values",
			"Fine-grained reactivity",
			"Theme management",
		],
		learnings: [
			"Derived state: compute values from other state",
			"Chained derived state: displayName depends on isAdult and fullName",
			"Fine-grained subscriptions: only re-render used components",
			"Global state without Context API",
		],
		technicalHighlights: [
			"Derived values auto-update when dependencies change",
			"Computation caching: derived values computed once per state change",
			"Performance: component only re-renders on accessed state changes",
			"Framework-agnostic: works with React, Vue, Solid, Svelte",
		],
		gitEvidence: "https://github.com/Ameen-Samad/ameenuddin.dev/blob/main/src/routes/demo/store.tsx",
	},
	{
		id: "pacer",
		title: "TanStack Pacer",
		description:
			"Performance optimization: debounce, throttle, rate limit, batch, queue",
		icon: <Zap className="w-8 h-8" />,
		path: "/demo/pacer",
		badge: "TanStack",
		color: "#0891b2",
		features: ["Debounce", "Throttle", "Rate limit", "Batch", "Queue"],
		learnings: [
			"Debouncing inputs to reduce unnecessary API calls",
			"Throttling scroll/resize events for performance",
			"Rate limiting client-side to prevent spam",
			"Batching multiple operations together",
			"Queueing sequential tasks with delays",
		],
		technicalHighlights: [
			"Debounce: wait Xms after user stops typing",
			"Throttle: max once per Xms interval",
			"Rate limit: max N calls per time window",
			"Batch: collect and process together",
			"Queue: sequential processing with delays",
		],
		gitEvidence: "https://github.com/Ameen-Samad/ameenuddin.dev/blob/main/src/routes/demo/pacer.tsx",
	},
	{
		id: "table",
		title: "TanStack Table",
		description:
			"Headless table with sorting, filtering, row selection, and pagination",
		icon: <Table className="w-8 h-8" />,
		path: "/demo/table",
		badge: "TanStack",
		color: "#748ffc",
		features: ["Sorting", "Filtering", "Pagination", "Row selection"],
		learnings: [
			"Building fully type-safe tables with TanStack Table",
			"Row selection state with checkboxes",
			"Indeterminate checkbox for partial selection",
			"Fuzzy search with ranking",
			"Headless UI pattern: bring your own styling",
		],
		technicalHighlights: [
			"Row selection: getIsSelected(), getToggleSelectedHandler()",
			"Indeterminate state: getIsSomeSelected() for partial selection",
			"Full TypeScript inference for column types",
			"50,000 rows with instant sorting and filtering",
		],
		gitEvidence: "https://github.com/Ameen-Samad/ameenuddin.dev/blob/main/src/routes/demo/table.tsx",
	},
	{
		id: "trpc-todo",
		title: "tRPC Todo App",
		description: "Type-safe API with tRPC + React Query integration",
		icon: <Zap className="w-8 h-8" />,
		path: "/demo/trpc-todo",
		badge: "TanStack",
		color: "#2e9aff",
		features: ["Type-safe API", "No codegen", "Auto-complete"],
		learnings: [
			"Building type-safe APIs with tRPC",
			"Integrating tRPC with TanStack Query",
			"End-to-end type safety from server to client",
			"CRUD operations without REST boilerplate",
		],
		technicalHighlights: [
			"TypeScript types shared between client and server",
			"No GraphQL schema or REST endpoints needed",
			"Automatic IDE autocomplete for API calls",
		],
		gitEvidence: "https://github.com/Ameen-Samad/ameenuddin.dev/blob/main/src/routes/demo/trpc-todo.tsx",
	},
	{
		id: "form-simple",
		title: "TanStack Form (Simple)",
		description: "Type-safe form state management with validation",
		icon: <FormInput className="w-8 h-8" />,
		path: "/demo/form/simple",
		badge: "TanStack",
		color: "#ffa94d",
		features: ["Type-safe", "Validation", "Error handling"],
		learnings: [
			"Building forms with TanStack Form",
			"Field-level validation with Zod",
			"Handling form submission and errors",
			"Type-safe form values throughout",
		],
		technicalHighlights: [
			"No uncontrolled/controlled component confusion",
			"Validates on change, blur, or submit",
			"Full TypeScript inference for form values",
		],
		gitEvidence: "https://github.com/Ameen-Samad/ameenuddin.dev/blob/main/src/routes/demo/form/simple.tsx",
	},
	{
		id: "form-address",
		title: "TanStack Form (Address)",
		description: "Complex form with nested fields and array validation",
		icon: <FileText className="w-8 h-8" />,
		path: "/demo/form/address",
		badge: "TanStack",
		color: "#f783ac",
		features: ["Nested fields", "Arrays", "Complex validation"],
		learnings: [
			"Handling complex nested form structures",
			"Dynamic field arrays with add/remove",
			"Cross-field validation rules",
			"Form field context for nested components",
		],
		technicalHighlights: [
			"Type-safe nested object and array fields",
			"Dynamic validation based on other field values",
			"Composable form components",
		],
		gitEvidence: "https://github.com/Ameen-Samad/ameenuddin.dev/blob/main/src/routes/demo/form/address.tsx",
	},
	{
		id: "start-ssr-index",
		title: "TanStack Start SSR Overview",
		description: "Introduction to TanStack Start SSR modes and patterns",
		icon: <Server className="w-8 h-8" />,
		path: "/demo/start.ssr.index",
		badge: "Start SSR",
		color: "#4c6ef5",
		features: ["SSR", "Streaming", "SEO"],
		learnings: [
			"Understanding SSR vs SPA vs data-only modes",
			"When to use each rendering mode",
			"SEO benefits of server-side rendering",
			"Performance tradeoffs of different modes",
		],
		technicalHighlights: [
			"TanStack Start supports 3 rendering modes",
			"SSR improves initial load and SEO",
			"Streaming SSR for progressive hydration",
		],
		gitEvidence: "https://github.com/Ameen-Samad/ameenuddin.dev/blob/main/src/routes/demo/start.ssr.index.tsx",
	},
	{
		id: "start-ssr-full",
		title: "Full SSR Mode",
		description: "Complete server-side rendering with streaming hydration",
		icon: <Server className="w-8 h-8" />,
		path: "/demo/start.ssr.full-ssr",
		badge: "Start SSR",
		color: "#4263eb",
		features: ["Full SSR", "Streaming", "Fast FCP"],
		learnings: [
			"Implementing full server-side rendering",
			"Streaming HTML for faster first paint",
			"Handling server-only code vs client code",
			"SEO optimization with SSR",
		],
		technicalHighlights: [
			"HTML sent from server with data pre-rendered",
			"React hydrates the server-rendered markup",
			"Fastest First Contentful Paint (FCP)",
		],
		gitEvidence: "https://github.com/Ameen-Samad/ameenuddin.dev/blob/main/src/routes/demo/start.ssr.full-ssr.tsx",
	},
	{
		id: "start-ssr-data",
		title: "Data-Only SSR",
		description: "Fetch data on server, render on client",
		icon: <Database className="w-8 h-8" />,
		path: "/demo/start.ssr.data-only",
		badge: "Start SSR",
		color: "#5c7cfa",
		features: ["Server data", "Client render", "Balance"],
		learnings: [
			"Fetching data on server but rendering on client",
			"When to use data-only mode over full SSR",
			"Avoiding layout shift with skeleton loaders",
			"Balancing server and client load",
		],
		technicalHighlights: [
			"Data fetched securely on server (API keys safe)",
			"Client receives pre-loaded data and renders",
			"Good middle ground between SPA and full SSR",
		],
		gitEvidence: "https://github.com/Ameen-Samad/ameenuddin.dev/blob/main/src/routes/demo/start.ssr.data-only.tsx",
	},
	{
		id: "start-ssr-spa",
		title: "SPA Mode",
		description: "Pure client-side rendering (traditional React)",
		icon: <Globe className="w-8 h-8" />,
		path: "/demo/start.ssr.spa-mode",
		badge: "Start SSR",
		color: "#748ffc",
		features: ["Client-only", "No SSR", "Simple"],
		learnings: [
			"Traditional SPA mode with no SSR",
			"When to choose SPA over SSR",
			"Client-side routing and data fetching",
			"Simplicity vs performance tradeoffs",
		],
		technicalHighlights: [
			"All rendering happens in the browser",
			"No server complexity, easier deployment",
			"Slower initial load but simpler architecture",
		],
		gitEvidence: "https://github.com/Ameen-Samad/ameenuddin.dev/blob/main/src/routes/demo/start.ssr.spa-mode.tsx",
	},
	{
		id: "start-server-funcs",
		title: "Server Functions",
		description: "Call server-side functions from client components",
		icon: <Zap className="w-8 h-8" />,
		path: "/demo/start.server-funcs",
		badge: "Start SSR",
		color: "#20c997",
		features: ["Server RPC", "Type-safe", "Zero API"],
		learnings: [
			"Creating server functions with createServerFn",
			"Calling server code directly from React components",
			"Type-safe RPC without REST endpoints",
			"Automatic request/response handling",
		],
		technicalHighlights: [
			"Server functions run only on the server",
			"No need to create API routes manually",
			"Full type safety from server to client",
		],
		gitEvidence: "https://github.com/Ameen-Samad/ameenuddin.dev/blob/main/src/routes/demo/start.server-funcs.tsx",
	},
	{
		id: "start-api-request",
		title: "API Request Handling",
		description: "Building API routes with TanStack Start",
		icon: <Code2 className="w-8 h-8" />,
		path: "/demo/start.api-request",
		badge: "Start SSR",
		color: "#ff6b6b",
		features: ["REST API", "Request/Response", "Middleware"],
		learnings: [
			"Creating API routes with file-based routing",
			"Handling POST, GET, PUT, DELETE methods",
			"Request validation and error handling",
			"Returning JSON responses",
		],
		technicalHighlights: [
			"File-based API routes (like Next.js)",
			"Access to Request/Response objects",
			"Can use middleware for auth, logging, etc.",
		],
		gitEvidence: "https://github.com/Ameen-Samad/ameenuddin.dev/blob/main/src/routes/demo/start.api-request.tsx",
	},
];

export function DemosSection() {
	return (
		<section
			id="demos"
			style={{ padding: "100px 0", background: "rgba(0, 0, 0, 0.2)" }}
		>
			<Container size="xl">
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
				>
					<Stack gap="md" mb="xl" style={{ textAlign: "center" }}>
						<Title order={2} c="white">
							Demos: What I Built & Learned
						</Title>
						<Text
							size="lg"
							c="dimmed"
							style={{ maxWidth: 700, margin: "0 auto" }}
						>
							Live demos with working code + learning stories. Each demo shows
							what I built, what I learned, and the technical challenges I
							solved.
						</Text>
						<Text size="sm" c="dimmed" style={{ fontStyle: "italic" }}>
							Click "What I Learned" to see the journey behind each
							implementation
						</Text>
					</Stack>

					<SimpleGrid
						cols={{ base: 1, sm: 2, lg: 3 }}
						spacing="xl"
						style={{ marginTop: 40 }}
					>
						{demos.map((demo, index) => (
							<motion.div
								key={demo.id}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: index * 0.1, duration: 0.5 }}
							>
								<Link to={demo.path} style={{ textDecoration: "none" }}>
									<Paper
										p="xl"
										radius="md"
										style={{
											background: "rgba(255, 255, 255, 0.05)",
											backdropFilter: "blur(10px)",
											border: "1px solid rgba(255, 255, 255, 0.1)",
											cursor: "pointer",
											transition: "all 0.3s ease",
											height: "100%",
											position: "relative",
											overflow: "hidden",
										}}
										onMouseEnter={(e) => {
											const el = e.currentTarget;
											el.style.transform = "translateY(-8px)";
											el.style.borderColor = demo.color;
											el.style.boxShadow = `0 8px 32px ${demo.color}40`;
										}}
										onMouseLeave={(e) => {
											const el = e.currentTarget;
											el.style.transform = "translateY(0)";
											el.style.borderColor = "rgba(255, 255, 255, 0.1)";
											el.style.boxShadow = "none";
										}}
									>
										{/* Background gradient */}
										<div
											style={{
												position: "absolute",
												top: 0,
												left: 0,
												right: 0,
												height: "4px",
												background: `linear-gradient(90deg, ${demo.color}, transparent)`,
											}}
										/>

										<Stack gap="md">
											{/* Icon and Badge */}
											<Group justify="space-between" align="flex-start">
												<div
													style={{
														padding: 12,
														borderRadius: 12,
														background: `${demo.color}20`,
														color: demo.color,
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
													}}
												>
													{demo.icon}
												</div>
												<Badge
													variant="light"
													size="sm"
													style={{
														background: `${demo.color}20`,
														color: demo.color,
														border: `1px solid ${demo.color}40`,
													}}
												>
													{demo.badge}
												</Badge>
											</Group>

											{/* Title */}
											<Title order={4} c="white" style={{ marginTop: 8 }}>
												{demo.title}
											</Title>

											{/* Description */}
											<Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
												{demo.description}
											</Text>

											{/* Features */}
											<Group gap="xs" mt="xs">
												{demo.features.map((feature) => (
													<Badge
														key={feature}
														size="xs"
														variant="outline"
														style={{
															color: "rgba(255, 255, 255, 0.7)",
															borderColor: "rgba(255, 255, 255, 0.2)",
														}}
													>
														{feature}
													</Badge>
												))}
											</Group>

											{/* What I Learned Section */}
											<Accordion
												variant="separated"
												onClick={(e) => e.stopPropagation()}
												styles={{
													root: { marginTop: 16 },
													item: {
														background: "rgba(255, 255, 255, 0.02)",
														border: "1px solid rgba(255, 255, 255, 0.1)",
													},
													control: {
														padding: "8px 12px",
														"&:hover": {
															background: "rgba(255, 255, 255, 0.05)",
														},
													},
													label: {
														color: demo.color,
														fontSize: "14px",
														fontWeight: 600,
													},
													content: {
														padding: "12px",
														fontSize: "13px",
													},
												}}
											>
												<Accordion.Item value="learnings">
													<Accordion.Control
														icon={<Lightbulb size={16} color={demo.color} />}
													>
														What I Learned
													</Accordion.Control>
													<Accordion.Panel>
														<Stack gap="sm">
															<List
																spacing="xs"
																size="sm"
																styles={{
																	item: { color: "rgba(255, 255, 255, 0.8)" },
																}}
															>
																{demo.learnings.map((learning, idx) => (
																	<List.Item key={idx}>{learning}</List.Item>
																))}
															</List>

															{demo.technicalHighlights &&
																demo.technicalHighlights.length > 0 && (
																	<>
																		<Text size="xs" fw={600} c="dimmed" mt="xs">
																			<Code2
																				size={14}
																				style={{
																					display: "inline",
																					marginRight: 4,
																				}}
																			/>
																			Technical Insights:
																		</Text>
																		<List
																			spacing="xs"
																			size="xs"
																			styles={{
																				item: {
																					color: "rgba(255, 255, 255, 0.7)",
																					fontStyle: "italic",
																				},
																			}}
																		>
																			{demo.technicalHighlights.map(
																				(highlight, idx) => (
																					<List.Item key={idx}>
																						{highlight}
																					</List.Item>
																				),
																			)}
																		</List>
																	</>
																)}

															{demo.gitEvidence && (
																<Group gap="xs" mt="sm">
																	<GitCommit size={14} color={demo.color} />
																	<Text size="xs" c="dimmed">
																		Code:{" "}
																		<Code style={{ fontSize: "11px" }}>
																			{demo.gitEvidence}
																		</Code>
																	</Text>
																</Group>
															)}
														</Stack>
													</Accordion.Panel>
												</Accordion.Item>
											</Accordion>

											{/* Arrow icon */}
											<Group justify="flex-end" mt="md">
												<ArrowRight
													size={20}
													style={{
														color: demo.color,
														transition: "transform 0.3s ease",
													}}
													onMouseEnter={(e) => {
														e.currentTarget.style.transform = "translateX(4px)";
													}}
													onMouseLeave={(e) => {
														e.currentTarget.style.transform = "translateX(0)";
													}}
												/>
											</Group>
										</Stack>
									</Paper>
								</Link>
							</motion.div>
						))}
					</SimpleGrid>

					{/* Tech Stack Info */}
					<motion.div
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ delay: 0.6 }}
						style={{ marginTop: 60 }}
					>
						<Paper
							p="xl"
							radius="md"
							style={{
								background: "rgba(255, 255, 255, 0.02)",
								border: "1px solid rgba(255, 255, 255, 0.1)",
								textAlign: "center",
							}}
						>
							<Text size="sm" c="dimmed" mb="xs">
								Powered by
							</Text>
							<Group justify="center" gap="xl">
								<Badge
									size="lg"
									variant="light"
									style={{
										background: "rgba(255, 135, 0, 0.1)",
										color: "#ff8700",
										border: "1px solid rgba(255, 135, 0, 0.2)",
									}}
								>
									Cloudflare Workers AI
								</Badge>
								<Badge
									size="lg"
									variant="light"
									style={{
										background: "rgba(0, 122, 255, 0.1)",
										color: "#007aff",
										border: "1px solid rgba(0, 122, 255, 0.2)",
									}}
								>
									Deepgram
								</Badge>
								<Badge
									size="lg"
									variant="light"
									style={{
										background: "rgba(147, 51, 234, 0.1)",
										color: "#9333ea",
										border: "1px solid rgba(147, 51, 234, 0.2)",
									}}
								>
									Stable Diffusion XL
								</Badge>
							</Group>
						</Paper>
					</motion.div>
				</motion.div>
			</Container>
		</section>
	);
}
