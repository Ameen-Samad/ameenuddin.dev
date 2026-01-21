import { createFileRoute } from "@tanstack/react-router";
import { projects } from "@/lib/projects-data";

export const Route = createFileRoute("/api/workers/chat")({
	GET: async () => {
		return new Response("Method not allowed", { status: 405 });
	},
	POST: async ({ request }) => {
		try {
			const { projectId, message, history = [] } = await request.json();

			if (!projectId || !message) {
				return new Response("Project ID and message are required", {
					status: 400,
				});
			}

			const project = projects.find((p) => p.id === projectId);

			if (!project) {
				return new Response("Project not found", { status: 404 });
			}

			const responses = {
				setup: `To set up ${project.title}, you'll need: ${project.tags.slice(0, 3).join(", ")}. The project uses ${project.techStack?.frontend?.join(", ") || "modern web technologies"}. Start by cloning the repository and installing dependencies with npm install.`,
				technologies: `This project uses: ${project.tags.join(", ")}. The tech stack includes ${Object.values(
					project.techStack || {},
				)
					.flat()
					.join(", ")}.`,
				unique: `What makes ${project.title} unique is its ${project.category} features and ${project.techStack?.ai?.length ? "AI integration" : "innovative approach"}. It has ${project.stats?.stars || 0} stars and ${project.stats?.views || 0} views.`,
				contribute: `To contribute to ${project.title}, you can: 1) Report issues on GitHub, 2) Submit pull requests for bug fixes, 3) Add new features following the project guidelines, 4) Improve documentation.`,
				default: `I can help you with ${project.title}. Some things you can ask about:\n• How to set up the project\n• Technologies used\n• What makes it unique\n• How to contribute\n• Technical details`,
			};

			const lowerMessage = message.toLowerCase();
			let response = responses.default;

			if (
				lowerMessage.includes("set up") ||
				lowerMessage.includes("install") ||
				lowerMessage.includes("start")
			) {
				response = responses.setup;
			} else if (
				lowerMessage.includes("technolog") ||
				lowerMessage.includes("stack") ||
				lowerMessage.includes("tech")
			) {
				response = responses.technologies;
			} else if (
				lowerMessage.includes("unique") ||
				lowerMessage.includes("special") ||
				lowerMessage.includes("different")
			) {
				response = responses.unique;
			} else if (
				lowerMessage.includes("contribut") ||
				lowerMessage.includes("help") ||
				lowerMessage.includes("improve")
			) {
				response = responses.contribute;
			}

			return new Response(JSON.stringify({ response }));
		} catch (error) {
			console.error("Chat error:", error);
			return new Response("Internal server error", { status: 500 });
		}
	},
});
