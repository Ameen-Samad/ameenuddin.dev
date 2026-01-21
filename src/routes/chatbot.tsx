import {
	Accordion,
	ActionIcon,
	Badge,
	Button,
	Code,
	Container,
	Divider,
	Drawer,
	Group,
	Modal,
	Paper,
	ScrollArea,
	Stack,
	Text,
	Textarea,
	Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
	IconBook,
	IconBrain,
	IconCheck,
	IconChevronDown,
	IconChevronUp,
	IconDatabase,
	IconEdit,
	IconFileText,
	IconMessage,
	IconRefresh,
	IconSend,
	IconSparkles,
	IconTool,
	IconX,
} from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/chatbot")({
	component: Chatbot,
});

interface ContextDoc {
	id: string;
	content: string;
	snippet: string;
	score: number;
}

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
	const [showRagDescription, setShowRagDescription] = useState(false);
	const [drawerOpened, setDrawerOpened] = useState(false);
	const [drawerContent, setDrawerContent] = useState<ContextDoc | null>(null);
	const [editingDocument, setEditingDocument] = useState<{ id: string; content: string } | null>(null);
	const [editingContent, setEditingContent] = useState("");
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
			let contextShown = false;

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				const lines = chunk.split("\n");

				for (const line of lines) {
					if (line.startsWith("data: ")) {
						const data = JSON.parse(line.slice(6));
						if (data.type === "context") {
							if (!contextShown && data.context && data.context.length > 0) {
								contextShown = true;
								notifications.show({
									id: `rag-context-${Date.now()}`,
									title: (
										<Group gap="xs">
											<IconDatabase size={16} color="#00f3ff" />
											<Text size="sm" fw={600}>
												RAG Context Applied - {data.context.length} document
												{data.context.length > 1 ? "s" : ""} retrieved
											</Text>
										</Group>
									),
									message: (
										<Stack gap="xs">
											{data.context.map((doc: ContextDoc) => (
												<Paper
													key={doc.id}
													p="sm"
													radius="sm"
													style={{
														background: "rgba(0, 243, 255, 0.1)",
														border: "1px solid rgba(0, 243, 255, 0.2)",
														cursor: "pointer",
													}}
													onClick={() => {
														setDrawerContent(doc);
														setDrawerOpened(true);
													}}
												>
													<Stack gap="xs">
														<Group justify="space-between">
															<Text size="xs" fw={600} c="#00f3ff">
																Document {doc.id}
															</Text>
															<Badge size="xs" variant="light" color="cyan">
																{Math.round(doc.score * 100)}% match
															</Badge>
														</Group>
														<Text size="xs" c="dimmed">
															{doc.snippet}
														</Text>
														<Text
															size="xs"
															c="#00f3ff"
															style={{
																display: "flex",
																alignItems: "center",
																gap: 4,
															}}
														>
															Click to expand <IconChevronDown size={12} />
														</Text>
													</Stack>
												</Paper>
											))}
										</Stack>
									),
									color: "cyan",
									autoClose: 8000,
									withCloseButton: true,
								});
							}
						} else if (data.type === "content") {
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
		setShowRagDescription(true);

		const simulatedConversation = [
			{
				role: "user" as const,
				content: "What programming languages are you familiar with?",
			},
			{
				role: "assistant" as const,
				content:
					"I am familiar with several programming languages:\n\n**Python**: Great for data science, automation, and backend development.\n\n**JavaScript**: Essential for web development and works in all browsers.\n\n**TypeScript**: Adds type safety to JavaScript for better development experience.\n\nI use these languages daily in my AI-assisted development workflow.",
			},
			{
				role: "user" as const,
				content: "How do you use AI tools in your development?",
			},
			{
				role: "assistant" as const,
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
		setShowRagDescription(false);
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

	const openEditModal = (doc: { id: string; content: string }) => {
		setEditingDocument(doc);
		setEditingContent(doc.content);
	};

	const closeEditModal = () => {
		setEditingDocument(null);
		setEditingContent("");
	};

	const saveEditedDocument = () => {
		if (editingDocument) {
			updateDocument(editingDocument.id, editingContent);
			closeEditModal();
		}
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

					{showRagDescription && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.3 }}
						>
							<Paper
								shadow="xl"
								radius="lg"
								p="md"
								mb="lg"
								style={{
									background:
										"linear-gradient(135deg, rgba(0, 243, 255, 0.1) 0%, rgba(255, 0, 255, 0.1) 100%)",
									border: "1px solid rgba(0, 243, 255, 0.2)",
								}}
							>
								<Group justify="space-between" mb="sm">
									<Group gap="sm">
										<IconSparkles size={20} style={{ color: "#00f3ff" }} />
										<Title order={4} c="white">
											How RAG Works
										</Title>
									</Group>
									<ActionIcon
										variant="transparent"
										onClick={() => setShowRagDescription(false)}
										style={{ color: "white" }}
									>
										<IconChevronUp size={20} />
									</ActionIcon>
								</Group>
								<Stack gap="md">
									<Group gap="md">
										<Paper
											p="sm"
											radius="sm"
											style={{
												background: "rgba(0, 0, 0, 0.3)",
												flex: 1,
												textAlign: "center",
											}}
										>
											<IconFileText
												size={24}
												style={{ color: "#00f3ff", marginBottom: 8 }}
											/>
											<Text size="xs" c="white">
												Documents
											</Text>
											<Text size="xs" c="dimmed">
												Knowledge base
											</Text>
										</Paper>
										<Text size="xl" c="dimmed">
											→
										</Text>
										<Paper
											p="sm"
											radius="sm"
											style={{
												background: "rgba(0, 0, 0, 0.3)",
												flex: 1,
												textAlign: "center",
											}}
										>
											<IconDatabase
												size={24}
												style={{ color: "#ff00ff", marginBottom: 8 }}
											/>
											<Text size="xs" c="white">
												Vector Search
											</Text>
											<Text size="xs" c="dimmed">
												Semantic matching
											</Text>
										</Paper>
										<Text size="xl" c="dimmed">
											→
										</Text>
										<Paper
											p="sm"
											radius="sm"
											style={{
												background: "rgba(0, 0, 0, 0.3)",
												flex: 1,
												textAlign: "center",
											}}
										>
											<IconBook
												size={24}
												style={{ color: "#00f3ff", marginBottom: 8 }}
											/>
											<Text size="xs" c="white">
												Context
											</Text>
											<Text size="xs" c="dimmed">
												Relevant info
											</Text>
										</Paper>
										<Text size="xl" c="dimmed">
											→
										</Text>
										<Paper
											p="sm"
											radius="sm"
											style={{
												background: "rgba(0, 0, 0, 0.3)",
												flex: 1,
												textAlign: "center",
											}}
										>
											<IconBrain
												size={24}
												style={{ color: "#ff00ff", marginBottom: 8 }}
											/>
											<Text size="xs" c="white">
												AI Response
											</Text>
											<Text size="xs" c="dimmed">
												Grounded answers
											</Text>
										</Paper>
									</Group>
									<Text size="sm" c="white">
										<Text span c="#00f3ff" fw={600}>
											RAG (Retrieval-Augmented Generation)
										</Text>{" "}
										searches your documents to find relevant information, then
										injects that context into the AI model. This ensures
										accurate, factual responses based on your knowledge base
										rather than general training data.
									</Text>
								</Stack>
							</Paper>
						</motion.div>
					)}

					<Stack
						style={{
							display: "grid",
							gridTemplateColumns: "280px 1fr",
							gap: "lg",
							height: showRagDescription
								? "calc(100vh - 350px)"
								: "calc(100vh - 150px)",
						}}
					>
						<DocumentSidebar
							documents={documents}
							onAdd={addDocument}
							onUpdate={updateDocument}
							onRemove={removeDocument}
						onEdit={openEditModal}
						/>

						<ChatArea
							messages={messages}
							streamingContent={streamingContent}
							isSimulating={isSimulating}
							onSendMessage={handleSendMessage}
							onSimulate={handleSimulate}
							messagesEndRef={messagesEndRef}
						input={input}
						setInput={setInput}
						/>
					</Stack>
				</motion.div>

				<Drawer
					opened={drawerOpened}
					onClose={() => setDrawerOpened(false)}
					position="right"
					size="md"
					title={
						<Group gap="sm">
							<IconBook size={20} style={{ color: "#00f3ff" }} />
							<Text fw={600}>Full Document Context</Text>
						</Group>
					}
					styles={{
						content: { background: "#1a1a1a" },
						header: {
							background: "#1a1a1a",
							borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
						},
					}}
				>
					{drawerContent && (
						<Stack gap="md">
							<Paper
								p="md"
								radius="sm"
								style={{
									background: "rgba(0, 243, 255, 0.1)",
									border: "1px solid rgba(0, 243, 255, 0.2)",
								}}
							>
								<Group justify="space-between" mb="xs">
									<Text fw={600} c="#00f3ff">
										Document {drawerContent.id}
									</Text>
									<Badge variant="light" color="cyan">
										{Math.round(drawerContent.score * 100)}% match
									</Badge>
								</Group>
								<Text size="xs" c="dimmed" mb="sm">
									Relevance Score: {drawerContent.score}
								</Text>
							</Paper>

							<Paper
								p="md"
								radius="sm"
								style={{
									background: "rgba(0, 0, 0, 0.3)",
									border: "1px solid rgba(255, 255, 255, 0.1)",
								}}
							>
								<Title order={5} c="white" mb="sm">
									Full Content
								</Title>
								<Text size="sm" c="white" style={{ whiteSpace: "pre-wrap" }}>
									{drawerContent.content}
								</Text>
							</Paper>

							<Paper
								p="md"
								radius="sm"
								style={{
									background: "rgba(255, 0, 255, 0.1)",
									border: "1px solid rgba(255, 0, 255, 0.2)",
								}}
							>
								<Title order={5} c="#ff00ff" mb="sm">
									Retrieved Snippet
								</Title>
								<Text size="sm" c="white" style={{ whiteSpace: "pre-wrap" }}>
									{drawerContent.snippet}
								</Text>
							</Paper>
						</Stack>
					)}
				</Drawer>
			</Container>
		</div>
	);
}

function DocumentSidebar({
	documents,
	onAdd,
	onUpdate,
	onRemove,
	onEdit,
}: {
	documents: Array<{ id: string; content: string }>;
	onAdd: () => void;
	onUpdate: (id: string, content: string) => void;
	onRemove: (id: string) => void;
	onEdit: (doc: { id: string; content: string }) => void;
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

			<ScrollArea h="calc(100vh - 400px)">
				<Stack gap="sm">
					{documents.map((doc) => (
						<Paper
							key={doc.id}
							p="sm"
							radius="sm"
							style={{
								background: "rgba(0, 0, 0, 0.3)",
								border: "1px solid rgba(255, 255, 255, 0.1)",
								cursor: "pointer",
								transition: "all 0.2s",
							}}
							onClick={() => onEdit(doc)}
							onMouseEnter={(e) => {
								e.currentTarget.style.background = "rgba(0, 243, 255, 0.1)";
								e.currentTarget.style.borderColor = "rgba(0, 243, 255, 0.3)";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.background = "rgba(0, 0, 0, 0.3)";
								e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
							}}
						>
							<Group justify="space-between" mb="xs">
								<Text size="xs" fw={600} c="white">
									Document {doc.id}
								</Text>
								<Group gap="xs">
									<ActionIcon
										size={18}
										variant="transparent"
										onClick={(e) => {
											e.stopPropagation();
											onEdit(doc);
										}}
										style={{ color: "#00f3ff" }}
									>
										<IconEdit size={16} />
									</ActionIcon>
									<ActionIcon
										size={18}
										variant="transparent"
										onClick={(e) => {
											e.stopPropagation();
											onRemove(doc.id);
										}}
										style={{ color: "#ff5555" }}
									>
										<IconX size={16} />
									</ActionIcon>
								</Group>
							</Group>
							<Text
								size="xs"
								c="dimmed"
								lineClamp={3}
								style={{
									whiteSpace: "pre-wrap",
								}}
							>
								{doc.content}
							</Text>
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
	input,
	setInput,
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
	messagesEndRef: React.RefObject<HTMLDivElement | null>;
	input: string;
	setInput: (value: string) => void;
}) {
	return (
		<Paper
			shadow="xl"
			radius="lg"
			p={0}
			style={{
				background: "rgba(26, 26, 26, 0.8)",
				border: "1px solid rgba(0, 243, 255, 0.1)",
				display: "flex",
				flexDirection: "column",
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

			<ScrollArea flex={1} h={700} p="md">
				<Stack gap="md">
					{messages.length === 0 && (
						<Paper
							p="xl"
							radius="md"
							style={{
								background: "rgba(0, 243, 255, 0.05)",
								border: "1px dashed rgba(0, 243, 255, 0.2)",
								textAlign: "center",
							}}
						>
							<Stack gap="sm" align="center">
								<IconSparkles size={32} style={{ color: "#00f3ff" }} />
								<Text c="white" size="lg" fw={600}>
									Ready to Chat!
								</Text>
								<Text c="dimmed" size="sm">
									Ask me anything about the documents in the sidebar.
									<br />
									RAG will search for relevant context automatically.
								</Text>
							</Stack>
						</Paper>
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
											<Accordion.Item key={`${toolIdx}`} value={`${toolIdx}`}>
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
