import { clientTools } from "@tanstack/ai-client";
import type { InferChatMessages } from "@tanstack/ai-react";
import {
	createChatClientOptions,
	fetchServerSentEvents,
	useChat,
} from "@tanstack/ai-react";
import { Store } from "@tanstack/store";

// Guitar tools removed - this is now a general chat assistant

interface Conversation {
	id: string;
	title: string;
	messages: ChatMessages;
	createdAt: number;
	updatedAt: number;
}

interface ConversationsState {
	conversations: Conversation[];
	currentConversationId: string | null;
}

const conversationsStore = new Store<ConversationsState>({
	conversations: [],
	currentConversationId: null,
});

// Hydrate from localStorage and persist changes (client-side only)
if (typeof window !== 'undefined') {
	// Load saved conversations on mount
	const saved = localStorage.getItem('ameenuddin-conversations')
	if (saved) {
		try {
			const parsed = JSON.parse(saved) as ConversationsState
			if (parsed && Array.isArray(parsed.conversations)) {
				conversationsStore.setState(parsed)
			}
		} catch {
			// Invalid JSON, keep empty state
		}
	}

	// Subscribe to changes and persist to localStorage
	conversationsStore.subscribe(() => {
		localStorage.setItem('ameenuddin-conversations', JSON.stringify(conversationsStore.state))
	})
}

export const useConversations = () => {
	return conversationsStore.state;
};

export const useCurrentConversation = () => {
	const state = conversationsStore.state;
	return {
		conversation:
			state.conversations.find((c) => c.id === state.currentConversationId) ||
			null,
		conversations: state.conversations,
		currentConversationId: state.currentConversationId,
	};
};

export const createConversation = () => {
	const newConversation: Conversation = {
		id: Date.now().toString(),
		title: "New Conversation",
		messages: [],
		createdAt: Date.now(),
		updatedAt: Date.now(),
	};
	const currentState = conversationsStore.state;
	conversationsStore.setState({
		conversations: [...currentState.conversations, newConversation],
		currentConversationId: newConversation.id,
	});
	return newConversation.id;
};

export const switchConversation = (id: string) => {
	const currentState = conversationsStore.state;
	conversationsStore.setState({
		conversations: currentState.conversations,
		currentConversationId: id,
	});
};

export const deleteConversation = (id: string) => {
	const currentState = conversationsStore.state;
	const newConversations = currentState.conversations.filter(
		(c) => c.id !== id,
	);
	const newCurrentId =
		currentState.currentConversationId === id
			? newConversations[0]?.id || null
			: currentState.currentConversationId;
	conversationsStore.setState({
		conversations: newConversations,
		currentConversationId: newCurrentId,
	});
};

export const updateConversationTitle = (id: string, title: string) => {
	const currentState = conversationsStore.state;
	conversationsStore.setState({
		conversations: currentState.conversations.map((c) =>
			c.id === id ? { ...c, title, updatedAt: Date.now() } : c,
		),
		currentConversationId: currentState.currentConversationId,
	});
};

export const updateConversationMessages = (
	id: string,
	messages: ChatMessages,
) => {
	const currentState = conversationsStore.state;
	conversationsStore.setState({
		conversations: currentState.conversations.map((c) => {
			if (c.id === id) {
				const firstUserMessage = messages.find(
					(m) => m.role === "user" && m.parts[0]?.type === "text",
				);
				const autoTitle =
					firstUserMessage?.parts[0]?.type === "text"
						? firstUserMessage.parts[0].content.slice(0, 30) + "..."
						: "New Conversation";
				return {
					...c,
					messages,
					title: c.title === "New Conversation" ? autoTitle : c.title,
					updatedAt: Date.now(),
				};
			}
			return c;
		}),
		currentConversationId: currentState.currentConversationId,
	});
};

const createChatOptions = () =>
	createChatClientOptions({
		connection: fetchServerSentEvents("/demo/api/ai/chat"),
		// No tools - general conversation only
	});

export type ChatMessages = InferChatMessages<
	ReturnType<typeof createChatOptions>
>;


// Simpler message update for direct SSE streaming (non-TanStack AI)
export const updateConversationMessagesSimple = (
	id: string,
	messages: Array<{ role: 'user' | 'assistant'; content: string }>,
) => {
	const currentState = conversationsStore.state;
	conversationsStore.setState({
		conversations: currentState.conversations.map((c) => {
			if (c.id === id) {
				const firstUserMessage = messages.find((m) => m.role === 'user');
				const autoTitle =
					firstUserMessage
						? firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
						: 'New Conversation';
				// Convert simple messages to TanStack AI format
				const tanstackMessages = messages.map(m => ({
					role: m.role,
					parts: [{ type: 'text' as const, content: m.content }]
				}));
				return {
					...c,
					messages: tanstackMessages as any,
					title: c.title === 'New Conversation' ? autoTitle : c.title,
					updatedAt: Date.now(),
				};
			}
			return c;
		}),
		currentConversationId: currentState.currentConversationId,
	});
};

export const useGuitarRecommendationChat = () => {
	const { conversation } = useCurrentConversation();

	const baseOptions = createChatOptions();

	const chat = useChat({
		...baseOptions,
		initialMessages: conversation?.messages || [],
	});

	return chat;
};
