import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/chat")({
	component: () => null,
});

export async function action({ request }: { request: Request }) {
	const body = await request.json();

	const { messages, documents } = body as {
		messages: Array<{ role: string; content: string }>;
		documents: Array<{ id: string; content: string }>;
	};

	const context =
		documents.length > 0
			? `\n\nRelevant Documents:\n${documents.map((doc) => `<document id="${doc.id}">${doc.content}</document>`).join("\n")}\n\n`
			: "";

	const systemPrompt = `You are an AI assistant helping users. Be helpful and concise. ${context}`;

	try {
		const response = await fetch(
			"https://api.cloudflare.com/client/v4/accounts/REPLACE_WITH_ACCOUNT_ID/ai/run/@cf/qwen/qwen2.5-coder-32b-instruct",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${process.env.CLOUDFLARE_API_KEY}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					model: "@cf/qwen/qwen2.5-coder-32b-instruct",
					messages: [{ role: "system", content: systemPrompt }, ...messages],
					stream: true,
					max_tokens: 2000,
				}),
			},
		);

		if (!response.ok) {
			return new Response(
				JSON.stringify({ error: "Failed to get AI response" }),
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		return new Response(response.body, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
			},
		});
	} catch (error) {
		console.error("AI API Error:", error);
		return new Response(JSON.stringify({ error: "Internal server error" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
