import {
	Accordion,
	ActionIcon,
	Badge,
	Button,
	Code,
	Container,
	Divider,
	Group,
	Paper,
	ScrollArea,
	Stack,
	Text,
	Textarea,
	Title,
} from "@mantine/core";
import {
	IconBrain,
	IconFileText,
	IconMessage,
	IconRefresh,
	IconSend,
	IconSettings,
	IconTool,
} from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/chatbot")({
	component: Chatbot,
});

function Chatbot() {
	const [messages, setMessages] = useState<
		Array<{ role: "user" | "assistant"; content: string; toolCalls?: any[] }>
	>([]);
	const [input, setInput] = useState("");
	const [documents, setDocuments] = useState<
		Array<{ id: string; content: string }>
	>([
		{
			id: "1",
			content:
				"Python is a high-level programming language known for its simplicity and readability. It is widely used in web development, data science, and automation.",
		},
		{
			id: "2",
			content:
				"TypeScript is a strongly typed programming language that builds on JavaScript. It provides better tooling and catches errors at compile time.",
		},
		{
			id: "3",
			content:
				"Cloudflare Workers AI provides serverless AI inference at the edge, enabling fast and scalable applications.",
		},
	]);
	const [isSimulating, setIsSimulating] = useState(false);
	const [streamingContent, setStreamingContent] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const isStreamingRef = useRef(false);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages, streamingContent]);

	const handleSendMessage = async (content?: string) => {
		const messageContent = content || input.trim();
		if (!messageContent) return;

		setMessages((prev) => [...prev, { role: "user", content: messageContent }]);
		setInput("");
		setStreamingContent("");
		isStreamingRef.current = true;

		try {
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					messages: [...messages, { role: "user", content: messageContent }],
					documents,
				}),
			});

			if (!response.ok) throw new Error("Failed to get response");

			const reader = response.body?.getReader();
			if (!reader) return;

			const decoder = new TextDecoder();
			let fullContent = "";

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				const lines = chunk.split("\n");

				for (const line of lines) {
					if (line.startsWith("data: ")) {
						const data = JSON.parse(line.slice(6));
						if (data.type === "content") {
							fullContent += data.content;
							setStreamingContent(fullContent);
						} else if (data.type === "tool_call") {
							setMessages((prev) => [
								...prev.slice(0, -1),
								{
									...prev[prev.length - 1],
									toolCalls: [
										...(prev[prev.length - 1]?.toolCalls || []),
										data,
									],
								},
							]);
						} else if (data.type === "done") {
							setMessages((prev) => [
								...prev.slice(0, -1),
								{
									...prev[prev.length - 1],
									content: fullContent,
								},
							]);
							setStreamingContent("");
							isStreamingRef.current = false;
						}
					}
				}
			}
		} catch (error) {
			console.error("Chat error:", error);
			setMessages((prev) => [
				...prev.slice(0, -1),
				{
					...prev[prev.length - 1],
					content: "Sorry, I encountered an error. Please try again.",
				},
			]);
			setStreamingContent("");
			isStreamingRef.current = false;
		}
	};

	const handleSimulate = async () => {
		setIsSimulating(true);
		const simulatedConversation = [
			{
				role: "user",
				content: "What programming languages are you familiar with?",
			},
			{
				role: "assistant",
				content:
					"I am familiar with several programming languages:\n\n**Python**: Great for data science, automation, and backend development.\n\n**JavaScript**: Essential for web development and works in all browsers.\n\n**TypeScript**: Adds type safety to JavaScript for better development experience.\n\nI use these languages daily in my AI-assisted development workflow.",
			},
			{ role: "user", content: "How do you use AI tools in your development?" },
			{
				role: "assistant",
				content:
					"I leverage AI tools like Cursor and Claude Code to:\n\n1. **Accelerate development** - Generate boilerplate code quickly\n2. **Debug faster** - Get context-aware suggestions and fix issues\n3. **Learn continuously** - Understand codebases through AI explanations\n\nHowever, I always maintain strong fundamentals - proper testing, clean code practices, and understanding of what the code does.",
			},
		];

		for (const msg of simulatedConversation) {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			setMessages((prev) => [...prev, msg]);
			scrollToBottom();
		}

		setIsSimulating(false);
	};

	const addDocument = () => {
		const newDoc = {
			id: String(documents.length + 1),
			content: "New document content. Edit this to add context for RAG.",
		};
		setDocuments((prev) => [...prev, newDoc]);
	};

	const updateDocument = (id: string, content: string) => {
		setDocuments((prev) =>
			prev.map((doc) => (doc.id === id ? { ...doc, content } : doc)),
		);
	};

	const removeDocument = (id: string) => {
		setDocuments((prev) => prev.filter((doc) => doc.id !== id));
	};

	return (
		<div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
			<Container size="xl" py="xl">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
				>
					<Group justify="space-between" mb="xl">
						<Link to="/">
							<Button
								variant="outline"
								style={{ borderColor: "#00f3ff", color: "#00f3ff" }}
							>
								← Back to Portfolio
							</Button>
						</Link>
						<Title order={1} c="white">
							AI Chatbot with RAG
						</Title>
					</Group>

					<Stack
						style={{
							display: "grid",
							gridTemplateColumns: "280px 1fr",
							gap: "lg",
							height: "calc(100vh - 150px)",
						}}
					>
						<DocumentSidebar
							documents={documents}
							onAdd={addDocument}
							onUpdate={updateDocument}
							onRemove={removeDocument}
						/>

						<ChatArea
							messages={messages}
							streamingContent={streamingContent}
							isSimulating={isSimulating}
							onSendMessage={handleSendMessage}
							onSimulate={handleSimulate}
							messagesEndRef={messagesEndRef}
						/>
					</Stack>
				</motion.div>
			</Container>
		</div>
	);
}

function DocumentSidebar({
	documents,
	onAdd,
	onUpdate,
	onRemove,
}: {
	documents: Array<{ id: string; content: string }>;
	onAdd: () => void;
	onUpdate: (id: string, content: string) => void;
	onRemove: (id: string) => void;
}) {
	return (
		<Paper
			shadow="xl"
			radius="lg"
			p="md"
			style={{
				background: "rgba(26, 26, 26, 0.8)",
				border: "1px solid rgba(0, 243, 255, 0.1)",
			}}
		>
			<Group justify="space-between" mb="md">
				<Group gap="sm">
					<IconFileText size={20} style={{ color: "#00f3ff" }} />
					<Title order={4} c="white">
						Documents ({documents.length})
					</Title>
				</Group>
				<Button
					size="xs"
					variant="light"
					onClick={onAdd}
					style={{ background: "#00f3ff15" }}
				>
					+ Add
				</Button>
			</Group>

			<ScrollArea h={600}>
				<Stack gap="sm">
					{documents.map((doc) => (
						<Paper
							key={doc.id}
							p="sm"
							radius="sm"
							style={{
								background: "rgba(0, 0, 0, 0.3)",
								border: "1px solid rgba(255, 255, 255, 0.1)",
							}}
						>
							<Group justify="space-between" mb="xs">
								<Text size="xs" fw={600} c="white">
									Document {doc.id}
								</Text>
								<ActionIcon
									size={18}
									variant="transparent"
									onClick={() => onRemove(doc.id)}
									style={{ color: "#ff5555" }}
								>
									<IconRefresh size={16} />
								</ActionIcon>
							</Group>
							<Textarea
								value={doc.content}
								onChange={(e) => onUpdate(doc.id, e.currentTarget.value)}
								minRows={3}
								maxRows={8}
								size="xs"
								variant="unstyled"
								style={{
									color: "white",
									background: "transparent",
									resize: "vertical",
								}}
							/>
						</Paper>
					))}
				</Stack>
			</ScrollArea>
		</Paper>
	);
}

function ChatArea({
	messages,
	streamingContent,
	isSimulating,
	onSendMessage,
	onSimulate,
	messagesEndRef,
}: {
	messages: Array<{
		role: "user" | "assistant";
		content: string;
		toolCalls?: any[];
	}>;
	streamingContent: string;
	isSimulating: boolean;
	onSendMessage: (content?: string) => void;
	onSimulate: () => void;
	messagesEndRef: React.RefObject<HTMLDivElement>;
}) {
	return (
		<Paper
			shadow="xl"
			radius="lg"
			p={0}
			style={{
				background: "rgba(26, 26, 26, 0.8)",
				border: "1px solid rgba(0, 243, 255, 0.1)",
			}}
		>
			<Group
				justify="space-between"
				p="md"
				style={{ borderBottom: "1px solid rgba(0, 243, 255, 0.1)" }}
			>
				<Group gap="sm">
					<IconMessage size={20} style={{ color: "#ff00ff" }} />
					<Title order={4} c="white">
						Chat Interface
					</Title>
				</Group>
				<Button
					size="xs"
					variant={isSimulating ? "filled" : "outline"}
					onClick={isSimulating ? () => {} : onSimulate}
					disabled={isSimulating}
					style={{
						background: isSimulating ? "#ff00ff" : "transparent",
						border: isSimulating ? "none" : "1px solid #ff00ff",
						color: isSimulating ? "white" : "#ff00ff",
					}}
				>
					<Group gap="xs">
						<IconBrain size={14} />
						{isSimulating ? "Simulating..." : "Simulate User"}
					</Group>
				</Button>
			</Group>

			<ScrollArea h={500} mb="md">
				<Stack gap="md" p="md">
					{messages.length === 0 && (
						<Text c="dimmed" align="center" py="xl">
							No messages yet. Start a conversation!
						</Text>
					)}

					{messages.map((msg, idx) => (
						<motion.div
							key={idx}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3 }}
						>
							<Paper
								p="md"
								radius="md"
								style={{
									background:
										msg.role === "user"
											? "rgba(0, 243, 255, 0.1)"
											: "rgba(26, 26, 26, 0.5)",
									border: `1px solid ${msg.role === "user" ? "#00f3ff30" : "transparent"}`,
								}}
							>
								<Group gap="sm" mb="sm">
									<Badge
										size="sm"
										variant="filled"
										style={{
											background: msg.role === "user" ? "#00f3ff" : "#ff00ff",
										}}
									>
										{msg.role === "user" ? "You" : "AI"}
									</Badge>
									<Text size="xs" c="dimmed">
										{new Date().toLocaleTimeString()}
									</Text>
								</Group>

								<ReactMarkdown>{msg.content}</ReactMarkdown>

								{msg.toolCalls && msg.toolCalls.length > 0 && (
									<Accordion mt="md">
										{msg.toolCalls.map((toolCall: any, toolIdx: number) => (
											<Accordion.Item key={toolIdx} value={toolIdx}>
												<Accordion.Control>
													<Group gap="sm">
														<IconTool size={16} style={{ color: "#0066ff" }} />
														<Text size="sm" fw={600} c="white">
															Tool Call: {toolCall.name}
														</Text>
													</Group>
												</Accordion.Control>
												<Accordion.Panel>
													<Code block p="sm">
														{JSON.stringify(toolCall.args, null, 2)}
													</Code>
												</Accordion.Panel>
											</Accordion.Item>
										))}
									</Accordion>
								)}
							</Paper>
						</motion.div>
					))}

					{streamingContent && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.3 }}
						>
							<Paper
								p="md"
								radius="md"
								style={{
									background: "rgba(255, 0, 255, 0.1)",
									border: "1px solid #ff00ff30",
								}}
							>
								<Group gap="sm" mb="sm">
									<Badge
										size="sm"
										variant="filled"
										style={{ background: "#ff00ff" }}
									>
										AI
									</Badge>
									<Text size="xs" c="dimmed">
										Streaming...
									</Text>
								</Group>
								<ReactMarkdown>{streamingContent}</ReactMarkdown>
							</Paper>
						</motion.div>
					)}

					<div ref={messagesEndRef} />
				</Stack>
			</ScrollArea>

			<Divider my="md" style={{ borderColor: "rgba(255, 255, 255, 0.1)" }} />

			<Group p="md">
				<Textarea
					placeholder="Type your message here... (RAG context from documents will be applied)"
					minRows={2}
					onKeyDown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							onSendMessage();
						}
					}}
					style={{
						background: "rgba(0, 0, 0, 0.3)",
						border: "1px solid rgba(0, 243, 255, 0.2)",
						color: "white",
					}}
				/>
				<ActionIcon
					size="lg"
					variant="filled"
					onClick={() => onSendMessage()}
					style={{ background: "linear-gradient(45deg, #00f3ff, #0066ff)" }}
				>
					<IconSend size={20} />
				</ActionIcon>
			</Group>
		</Paper>
	);
}
