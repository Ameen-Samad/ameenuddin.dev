import { LRUCache } from "lru-cache";

export interface AISearchQuery {
	query: string;
	intent: "technology" | "category" | "problem" | "all";
	suggestions: string[];
	similarProjects: string[];
}

export interface AIContent {
	summary: string;
	keyFeatures: string[];
	complexity: "low" | "medium" | "high";
	learningPath: string[];
}

export interface ParsedQuery {
	technologies: string[];
	categories: string[];
	complexity?: "beginner" | "intermediate" | "advanced";
	features?: string[];
	status?: string;
}

export interface ProjectEmbedding {
	projectId: string;
	description: number[];
	tags: number[];
	techStack: {
		frontend: number[];
		backend: number[];
		ai: number[];
	};
	timestamp: number;
}

const embeddingCache = new LRUCache<string, number[]>({
	max: 1000,
	ttl: 24 * 60 * 60 * 1000,
});

const summaryCache = new LRUCache<string, AIContent>({
	max: 500,
	ttl: 7 * 24 * 60 * 60 * 1000,
});

const chatCache = new LRUCache<string, string>({
	max: 500,
	ttl: 60 * 60 * 1000,
});

export async function generateEmbedding(text: string): Promise<number[]> {
	const cacheKey = `embed:${text}`;
	const cached = embeddingCache.get(cacheKey);
	if (cached) return cached;

	try {
		const response = await fetch("/api/workers/embeddings", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				text,
				model: "@cf/google/embeddinggemma-300m",
			}),
		});

		if (!response.ok) throw new Error("Failed to generate embedding");

		const data = await response.json();
		embeddingCache.set(cacheKey, data.embedding);
		return data.embedding;
	} catch (error) {
		console.error("Embedding generation error:", error);
		throw error;
	}
}

export async function performSemanticSearch(
	query: string,
	limit = 10,
): Promise<any[]> {
	try {
		const embedding = await generateEmbedding(query);

		const response = await fetch("/api/workers/search", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				embedding,
				limit,
			}),
		});

		if (!response.ok) throw new Error("Failed to perform semantic search");

		const data = await response.json();
		return data.results || [];
	} catch (error) {
		console.error("Semantic search error:", error);
		return [];
	}
}

export async function generateSummary(project: any): Promise<AIContent> {
	const cacheKey = `summary:${project.id}`;
	const cached = summaryCache.get(cacheKey);
	if (cached) return cached;

	try {
		const response = await fetch("/api/workers/summary", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				project,
				model: "@cf/meta/llama-4-scout-17b-16e-instruct",
			}),
		});

		if (!response.ok) throw new Error("Failed to generate summary");

		const data = await response.json();
		const summary: AIContent = {
			summary: data.summary || project.description,
			keyFeatures: data.keyFeatures || project.tags || [],
			complexity: data.complexity || "medium",
			learningPath: data.learningPath || [],
		};

		summaryCache.set(cacheKey, summary);
		return summary;
	} catch (error) {
		console.error("Summary generation error:", error);
		return {
			summary: project.description,
			keyFeatures: project.tags || [],
			complexity: "medium",
			learningPath: [],
		};
	}
}

export async function suggestTags(description: string): Promise<string[]> {
	try {
		const response = await fetch("/api/workers/tags", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				description,
				model: "@cf/mistral/mistral-7b-instruct-v0.1",
			}),
		});

		if (!response.ok) throw new Error("Failed to suggest tags");

		const data = await response.json();
		return data.tags || [];
	} catch (error) {
		console.error("Tag suggestion error:", error);
		return [];
	}
}

export async function parseNaturalLanguage(
	query: string,
): Promise<ParsedQuery> {
	try {
		const response = await fetch("/api/workers/parse-query", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				query,
				model: "@cf/meta/llama-4-scout-17b-16e-instruct",
			}),
		});

		if (!response.ok) throw new Error("Failed to parse query");

		const data = await response.json();
		return (
			data.parsed || {
				technologies: [],
				categories: [],
			}
		);
	} catch (error) {
		console.error("Query parsing error:", error);
		return {
			technologies: [],
			categories: [],
		};
	}
}

export async function chatWithProject(
	projectId: string,
	message: string,
	history: Array<{ role: string; content: string }> = [],
): Promise<string> {
	const cacheKey = `chat:${projectId}:${message}`;
	const cached = chatCache.get(cacheKey);
	if (cached) return cached;

	try {
		const response = await fetch("/api/workers/chat", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				projectId,
				message,
				history,
				model: "@cf/meta/llama-4-scout-17b-16e-instruct",
			}),
		});

		if (!response.ok) throw new Error("Failed to chat with project");

		const data = await response.json();
		chatCache.set(cacheKey, data.response);
		return data.response;
	} catch (error) {
		console.error("Chat error:", error);
		throw error;
	}
}

export async function getRecommendations(
	projectId: string,
	userInterests: string[] = [],
	limit = 5,
): Promise<any[]> {
	try {
		const response = await fetch("/api/workers/recommendations", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				projectId,
				userInterests,
				limit,
			}),
		});

		if (!response.ok) throw new Error("Failed to get recommendations");

		const data = await response.json();
		return data.results || [];
	} catch (error) {
		console.error("Recommendations error:", error);
		return [];
	}
}

export async function categorizeProject(project: any): Promise<string> {
	try {
		const response = await fetch("/api/workers/categorize", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				project,
				model: "@cf/meta/llama-4-scout-17b-16e-instruct",
			}),
		});

		if (!response.ok) throw new Error("Failed to categorize project");

		const data = await response.json();
		return data.category || project.category;
	} catch (error) {
		console.error("Categorization error:", error);
		return project.category;
	}
}

export function clearCache(): void {
	embeddingCache.clear();
	summaryCache.clear();
	chatCache.clear();
}
