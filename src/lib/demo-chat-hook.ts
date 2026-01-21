import { useCallback, useRef, useState } from "react";

interface StreamEvent {
	type: "content" | "done" | "error";
	content?: string;
	error?: string;
}

export function useDemoChat() {
	const [messages, setMessages] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const abortControllerRef = useRef<AbortController | null>(null);

	const sendMessage = useCallback(
		async (content: string) => {
			setIsLoading(true);

			// Add user message
			const userMessage = {
				id: Date.now(),
				role: "user",
				parts: [{ type: "text", content }],
			};
			setMessages((prev) => [...prev, userMessage]);

			// Add assistant message placeholder
			const assistantId = Date.now() + 1;
			const assistantMessage = {
				id: assistantId,
				role: "assistant",
				parts: [{ type: "text", content: "" }],
			};
			setMessages((prev) => [...prev, assistantMessage]);

			try {
				abortControllerRef.current = new AbortController();

				const response = await fetch("/demo/api/ai/chat", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						messages: [...messages, userMessage].map((m) => ({
							role: m.role,
							content: m.parts[0].content,
						})),
					}),
					signal: abortControllerRef.current.signal,
				});

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const reader = response.body?.getReader();
				const decoder = new TextDecoder();

				if (!reader) {
					throw new Error("Response body is not readable");
				}

				let fullContent = "";

				while (true) {
					const { done, value } = await reader.read();

					if (done) break;

					const chunk = decoder.decode(value);
					const lines = chunk.split("\n");

					for (const line of lines) {
						if (line.startsWith("data: ")) {
							try {
								const event: StreamEvent = JSON.parse(line.slice(6));

								switch (event.type) {
									case "content":
										fullContent += event.content;
										setMessages((prev) =>
											prev.map((m) =>
												m.id === assistantId
													? {
															...m,
															parts: [{ type: "text", content: fullContent }],
														}
													: m,
											),
										);
										break;

									case "error":
										console.error("Stream error:", event.error);
										break;
								}
							} catch (e) {
								// Ignore JSON parse errors for incomplete chunks
							}
						}
					}
				}
			} catch (error: any) {
				if (error.name === "AbortError") {
					console.log("Request aborted");
				} else {
					console.error("Chat error:", error);
					setMessages((prev) => [
						...prev,
						{
							id: Date.now(),
							role: "assistant",
							parts: [
								{
									type: "text",
									content: "Sorry, there was an error processing your request.",
								},
							],
						},
					]);
				}
			} finally {
				setIsLoading(false);
				abortControllerRef.current = null;
			}
		},
		[messages],
	);

	const stopMessage = useCallback(() => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			setIsLoading(false);
		}
	}, []);

	return {
		messages,
		sendMessage,
		isLoading,
		stopMessage,
	};
}
