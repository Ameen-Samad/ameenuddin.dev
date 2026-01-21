import { AnimatePresence, motion } from "framer-motion";
import { Copy, Download, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PacerAI } from "@/lib/pacer-ai-utils";
import { Button, Paper } from "@mantine/core";

interface ProjectAIAssistantProps {
	projectId: string;
	projectTitle: string;
	projectDescription: string;
	projectTags: string[];
	initialQuestion?: string;
}

export function ProjectAIAssistant({
	projectId,
	projectTitle,
	projectDescription: _projectDescription,
	projectTags: _projectTags,
	initialQuestion,
}: ProjectAIAssistantProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [messages, setMessages] = useState<
		Array<{ role: string; content: string }>
	>([]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isMinimized, setIsMinimized] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const quickQuestions = [
		"How do I set up this project?",
		"What technologies are used?",
		"What makes this project unique?",
		"How can I contribute?",
	];

	useEffect(() => {
		if (isOpen && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isOpen]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	useEffect(() => {
		if (initialQuestion && isOpen) {
			handleSendMessage(initialQuestion);
		}
	}, [initialQuestion, isOpen]);

	const handleSendMessage = async (message?: string) => {
		const messageText = message || input;
		if (!messageText.trim()) return;

		const userMessage = { role: "user", content: messageText };
		setMessages((prev) => [...prev, userMessage]);
		setInput("");
		setIsLoading(true);

		try {
			const response = await PacerAI.chat(projectId, messageText, messages);
			setMessages((prev) => [
				...prev,
				{ role: "assistant", content: response || "No response received" },
			]);
		} catch (error) {
			console.error("Chat error:", error);
			const errorMessage = error instanceof Error ? error.message : "Sorry, I'm having trouble connecting right now. Please try again later.";
			setMessages((prev) => [
				...prev,
				{
					role: "assistant",
					content: errorMessage,
				},
			]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCopyMessage = (content: string) => {
		navigator.clipboard.writeText(content);
	};

	const handleExportChat = () => {
		const chatContent = messages
			.map((m) => `${m.role.toUpperCase()}: ${m.content}`)
			.join("\n\n");
		const blob = new Blob([chatContent], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `chat-${projectId}.txt`;
		a.click();
		URL.revokeObjectURL(url);
	};

	return (
		<>
			{!isOpen && (
				<motion.button
					onClick={() => setIsOpen(true)}
					className="fixed bottom-6 right-6 z-50 p-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full shadow-lg transition-all"
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.95 }}
				>
					<MessageCircle className="w-6 h-6" />
				</motion.button>
			)}

			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, scale: 0.8, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.8, y: 20 }}
						transition={{ type: "spring", damping: 25, stiffness: 300 }}
						className={`fixed bottom-6 right-6 z-50 ${
							isMinimized ? "h-16" : "h-[600px]"
						} w-[400px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden`}
					>
						<Paper className="h-full flex flex-col bg-transparent border-0 shadow-none">
							<div className="p-4 border-b border-slate-700 flex items-center justify-between">
								<div className="flex items-center gap-3">
									<Sparkles className="w-5 h-5 text-cyan-500" />
									<div>
										<h3 className="font-semibold text-white">
											{projectTitle} AI Assistant
										</h3>
										<p className="text-xs text-gray-400">
											Ask anything about this project
										</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<Button
										variant="ghost"
										size="icon"
										onClick={() => setIsMinimized(!isMinimized)}
									>
										{isMinimized ? (
											<MessageCircle className="w-4 h-4" />
										) : (
											<MessageCircle className="w-4 h-4" />
										)}
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={handleExportChat}
									>
										<Download className="w-4 h-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => setIsOpen(false)}
									>
										<X className="w-4 h-4" />
									</Button>
								</div>
							</div>

							{!isMinimized && (
								<>
									<div className="flex-1 overflow-y-auto p-4 space-y-4">
										{messages.length === 0 && (
											<div className="text-center py-8 space-y-4">
												<Sparkles className="w-12 h-12 text-cyan-500 mx-auto" />
												<div>
													<p className="text-white font-medium mb-2">
														Get help with this project
													</p>
													<p className="text-sm text-gray-400 mb-4">
														Ask questions about setup, technologies, or how to
														contribute
													</p>
												</div>
												<div className="flex flex-wrap gap-2 justify-center">
													{quickQuestions.map((q) => (
														<Button
															key={q}
															variant="outline"
															size="sm"
															onClick={() => handleSendMessage(q)}
															className="text-xs"
														>
															{q}
														</Button>
													))}
												</div>
											</div>
										)}

										{messages.map((message, index) => (
											<motion.div
												key={index}
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												className={`flex gap-3 ${
													message.role === "user"
														? "justify-end"
														: "justify-start"
												}`}
											>
												{message.role === "assistant" && (
													<div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center flex-shrink-0">
														<Sparkles className="w-4 h-4 text-white" />
													</div>
												)}
												<div
													className={`max-w-[80%] p-3 rounded-lg ${
														message.role === "user"
															? "bg-cyan-600 text-white"
															: "bg-slate-800 text-gray-100"
													}`}
												>
													<p className="text-sm whitespace-pre-wrap">
														{message.content}
													</p>
													{message.role === "assistant" && (
														<button
															onClick={() => handleCopyMessage(message.content)}
															className="mt-2 text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
														>
															<Copy className="w-3 h-3" />
															Copy
														</button>
													)}
												</div>
											</motion.div>
										))}
										{isLoading && (
											<motion.div
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												className="flex gap-3"
											>
												<div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center flex-shrink-0">
													<Sparkles className="w-4 h-4 text-white" />
												</div>
												<div className="bg-slate-800 p-3 rounded-lg">
													<motion.div
														className="flex gap-1"
														animate={{ opacity: [0.5, 1, 0.5] }}
														transition={{
															duration: 1.5,
															repeat: Infinity,
														}}
													>
														<span className="w-2 h-2 bg-cyan-500 rounded-full" />
														<span className="w-2 h-2 bg-cyan-500 rounded-full" />
														<span className="w-2 h-2 bg-cyan-500 rounded-full" />
													</motion.div>
												</div>
											</motion.div>
										)}
										<div ref={messagesEndRef} />
									</div>

									<div className="p-4 border-t border-slate-700">
										<form
											onSubmit={(e) => {
												e.preventDefault();
												handleSendMessage();
											}}
											className="flex gap-2"
										>
											<input
												ref={inputRef}
												type="text"
												value={input}
												onChange={(e) => setInput(e.target.value)}
												placeholder="Ask about this project..."
												className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
												disabled={isLoading}
											/>
											<Button
												type="submit"
												size="icon"
												disabled={isLoading || !input.trim()}
												className="bg-cyan-600 hover:bg-cyan-700"
											>
												<Send className="w-4 h-4" />
											</Button>
										</form>
									</div>
								</>
							)}
						</Paper>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
