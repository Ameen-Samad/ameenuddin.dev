import { Container, Stack } from "@mantine/core";
import { useState } from "react";
import { ContactForm } from "./ContactForm";
import { ContactSuccess } from "./ContactSuccess";
import { SocialLinks } from "./SocialLinks";

interface ContactFormData {
	name: string;
	email: string;
	subject: string;
	message: string;
}

export function ContactSection() {
	const [isSuccess, setIsSuccess] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (data: ContactFormData) => {
		setIsSubmitting(true);
		try {
			const response = await fetch("/api/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				throw new Error("Failed to send message");
			}

			setIsSuccess(true);
		} catch (error) {
			console.error("Contact form error:", error);
			alert(
				"Failed to send message. Please email directly at amenddin@gmail.com",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleReset = () => {
		setIsSuccess(false);
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
								isSubmitting={isSubmitting}
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
