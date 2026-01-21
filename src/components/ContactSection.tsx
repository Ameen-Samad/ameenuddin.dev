import { Container, Stack } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
	type ContactFormData,
	contactFormActions,
} from "@/lib/contact-form-store";
import { ContactForm } from "./ContactForm";
import { ContactSuccess } from "./ContactSuccess";
import { SocialLinks } from "./SocialLinks";

async function submitContactForm(data: ContactFormData): Promise<void> {
	const response = await fetch("/api/contact", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		throw new Error("Failed to send message");
	}
}

export function ContactSection() {
	const queryClient = useQueryClient();
	const [isSuccess, setIsSuccess] = useState(false);

	const mutation = useMutation({
		mutationFn: submitContactForm,
		onSuccess: () => {
			setIsSuccess(true);
			queryClient.invalidateQueries({ queryKey: ["contact-form"] });
		},
		onError: (error) => {
			console.error("Contact form error:", error);
			alert(
				"Failed to send message. Please email directly at amenddin@gmail.com",
			);
		},
	});

	const handleSubmit = async (data: ContactFormData) => {
		await mutation.mutateAsync(data);
	};

	const handleReset = () => {
		setIsSuccess(false);
		contactFormActions.resetForm();
	};

	return (
		<section
			id="contact"
			style={{
				padding: "100px 0",
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
			}}
		>
			<Container size="xl" style={{ width: "100%" }}>
				<Stack
					gap="xl"
					style={{
						maxWidth: "800px",
						margin: "0 auto",
					}}
				>
					{isSuccess ? (
						<ContactSuccess onReset={handleReset} />
					) : (
						<>
							<ContactForm
								onSubmit={handleSubmit}
								isSubmitting={mutation.isPending}
							/>
							<div
								style={{
									marginTop: "2rem",
									textAlign: "center",
								}}
							>
								<p
									style={{
										color: "#94a3b8",
										fontSize: "1rem",
										marginBottom: "1rem",
									}}
								>
									Or connect with me on social media
								</p>
								<SocialLinks />
							</div>
						</>
					)}
				</Stack>
			</Container>
		</section>
	);
}
