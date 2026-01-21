import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

export const Route = createFileRoute("/api/contact")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const data = await request.json();

				const formData = new FormData();
				formData.append("name", data.name);
				formData.append("email", data.email);
				formData.append("subject", data.subject);
				formData.append("message", data.message);
				formData.append("_subject", `Portfolio Contact: ${data.subject}`);
				formData.append("_replyto", data.email);

				const res = await fetch("https://formsubmit.co/amenddin@gmail.com", {
					method: "POST",
					body: formData,
				});

				if (!res.ok) {
					return json({ error: "Failed to send message" }, { status: 500 });
				}

				return json({ success: true });
			},
		},
	},
});
