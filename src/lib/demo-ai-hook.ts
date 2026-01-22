import { clientTools } from "@tanstack/ai-client";
import type { InferChatMessages } from "@tanstack/ai-react";
import {
	createChatClientOptions,
	fetchServerSentEvents,
	useChat,
} from "@tanstack/ai-react";
import { Store } from "@tanstack/store";

import { recommendGuitarToolDef } from "@/lib/demo-guitar-tools";

const recommendGuitarToolClient = recommendGuitarToolDef.client(({ id }) => ({
	id: +id,
}));

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
		tools: clientTools(recommendGuitarToolClient),
	});

export type ChatMessages = InferChatMessages<
	ReturnType<typeof createChatOptions>
>;

export const useGuitarRecommendationChat = () => {
	const { conversation } = useCurrentConversation();

	const baseOptions = createChatOptions();

	const chat = useChat({
		...baseOptions,
		initialMessages: conversation?.messages || [],
	});

	return chat;
};
