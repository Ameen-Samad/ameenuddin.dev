import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/resume-chat")({
	server: {
		handlers: {
			POST: async ({ request, context }) => {
				const requestSignal = request.signal;

				if (requestSignal.aborted) {
					return new Response(null, { status: 499 });
				}

				try {
					const body = await request.json();
					const { messages } = body;

					const SYSTEM_PROMPT = `You are a helpful resume assistant helping recruiters and hiring managers evaluate if this candidate is a good fit for their job requirements.

CAPABILITIES:
1. Use getJobsBySkill to find jobs where the candidate used specific technologies or skills
2. Use getAllJobs to get the candidate's complete work history with all details
3. Use getAllEducation to get the candidate's educational background
4. Use searchExperience to search for specific types of roles or experience by keywords

INSTRUCTIONS:
- When asked about specific technologies or skills, use getJobsBySkill to find relevant experience
- When asked about overall experience or career progression, use getAllJobs
- When asked about education or training, use getAllEducation
- When asked about specific types of roles (e.g., "senior", "lead"), use searchExperience
- Be professional, concise, and helpful in your responses
- Provide specific details from the resume when available
- When calculating years of experience, consider the date ranges provided
- If the candidate has experience with something, highlight specific roles and time periods
- If the candidate lacks certain experience, be honest but constructive

CONTEXT: You are helping evaluate this candidate's qualifications for potential job opportunities.`;

					const aiMessages = [
						{ role: "system", content: SYSTEM_PROMPT },
						...messages.map((m: any) => ({
							role: m.role,
							content: m.content,
						})),
					];

					const env = (context as any)?.cloudflare?.env;
					if (!env?.AI) {
						return new Response(
							JSON.stringify({
								error: "Cloudflare AI binding not available",
							}),
							{
								status: 500,
								headers: { "Content-Type": "application/json" },
							},
						);
					}

					const response = await env.AI.run(
						"@cf/meta/llama-4-scout-17b-16e-instruct",
						{ messages: aiMessages },
					);

					return new Response(
						JSON.stringify({ response: response.response || response }),
						{
							status: 200,
							headers: { "Content-Type": "application/json" },
						},
					);
				} catch (error: any) {
					console.error("Resume chat error:", error);
					return new Response(
						JSON.stringify({
							error: "Failed to process chat request",
							message: error.message,
						}),
						{
							status: 500,
							headers: { "Content-Type": "application/json" },
						},
					);
				}
			},
		},
	},
});
