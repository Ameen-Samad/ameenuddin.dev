import {
	Button,
	Group,
	Text as MantineText,
	Select,
	Stack,
	Textarea,
	Title,
} from "@mantine/core";
import { IconSend, IconX } from "@tabler/icons-react";
import { useStore } from "@tanstack/react-store";
import { motion } from "framer-motion";
import { useDebouncedCallback } from "@tanstack/react-pacer/debouncer";
import {
	type ContactErrors,
	type ContactFormData,
	contactFormActions,
	contactFormStore,
} from "@/lib/contact-form-store";
import { ContactInput } from "./ContactInput";

const validationRules = {
	name: {
		required: true,
		minLength: 2,
		maxLength: 50,
		pattern: /^[a-zA-Z\s'-]+$/,
	},
	email: {
		required: true,
		pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
	},
	subject: {
		required: true,
	},
	message: {
		required: true,
		minLength: 10,
		maxLength: 1000,
	},
} as const;

const validateField = (
	field: keyof ContactFormData,
	value: string,
): { isValid: boolean; error?: string } => {
	const rules = validationRules[field];

	if ("required" in rules && rules.required && !value.trim()) {
		return { isValid: false, error: "This field is required" };
	}

	if ("minLength" in rules && value.length < rules.minLength) {
		return {
			isValid: false,
			error: `Minimum ${rules.minLength} characters required`,
		};
	}

	if ("maxLength" in rules && value.length > rules.maxLength) {
		return {
			isValid: false,
			error: `Maximum ${rules.maxLength} characters allowed`,
		};
	}

	if ("pattern" in rules && !rules.pattern.test(value)) {
		return { isValid: false, error: "Invalid format" };
	}

	return { isValid: true };
};

const validateForm = (
	data: ContactFormData,
): { isValid: boolean; errors: ContactErrors } => {
	const newErrors: ContactErrors = {};
	let isValid = true;

	(Object.keys(data) as Array<keyof ContactFormData>).forEach((field) => {
		const result = validateField(field, data[field]);
		if (!result.isValid) {
			isValid = false;
			newErrors[field] = result.error;
		}
	});

	return { isValid, errors: newErrors };
};

interface ContactFormProps {
	onSubmit: (data: ContactFormData) => Promise<void>;
	isSubmitting: boolean;
}

export function ContactForm({ onSubmit, isSubmitting }: ContactFormProps) {
	const formData = useStore(contactFormStore, (state) => state.formData);
	const errors = useStore(contactFormStore, (state) => state.errors);
	const touched = useStore(contactFormStore, (state) => state.touched);

	const subjectOptions = [
		{ value: "general", label: "General Inquiry" },
		{ value: "collaboration", label: "Collaboration" },
		{ value: "opportunity", label: "Job Opportunity" },
		{ value: "consulting", label: "Consulting/Freelance" },
		{ value: "feedback", label: "Feedback" },
	];

	// Debounced validation to avoid validating on every keystroke
	const debouncedValidate = useDebouncedCallback(
		(field: keyof ContactFormData, value: string) => {
			const result = validateField(field, value);
			contactFormActions.setError(
				field,
				result.isValid ? undefined : result.error,
			);
		},
		{ wait: 300 },
	);

	const handleBlur = (field: keyof ContactFormData) => {
		contactFormActions.setTouched(field, true);
		const result = validateField(field, formData[field]);
		if (!result.isValid) {
			contactFormActions.setError(field, result.error);
		}
	};

	const handleChange = (field: keyof ContactFormData, value: string) => {
		// Update field value immediately (no lag in typing)
		contactFormActions.setField(field, value);

		// Debounce validation to reduce unnecessary checks
		if (touched[field]) {
			debouncedValidate(field, value);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const { isValid, errors: validationErrors } = validateForm(formData);
		contactFormActions.setErrors(validationErrors);
		contactFormActions.setAllTouched(true);

		if (!isValid) return;

		try {
			await onSubmit(formData);
		} catch (error) {
			console.error("Contact form error:", error);
		}
	};

	const handleClear = () => {
		contactFormActions.resetForm();
	};

	const isValidForm = () => {
		const { isValid } = validateForm(formData);
		return isValid;
	};

	return (
		<motion.form
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, ease: "easeOut" }}
			onSubmit={handleSubmit}
			style={{ width: "100%" }}
		>
			<Stack gap="lg">
				<Title
					order={2}
					c="white"
					style={{ fontSize: "1.5rem", fontWeight: 700 }}
				>
					Get In Touch
				</Title>
				<MantineText
					c="white"
					size="lg"
					style={{ color: "#94a3b8", fontSize: "1.125rem" }}
				>
					Let's discuss your next project
				</MantineText>

				<ContactInput
					label="Full Name"
					placeholder="John Doe"
					value={formData.name}
					onChange={(e) => handleChange("name", e.currentTarget.value)}
					onBlur={() => handleBlur("name")}
					error={errors.name}
					required
					aria-invalid={!!errors.name}
					aria-describedby={errors.name ? "name-error" : undefined}
				/>

				<ContactInput
					label="Email Address"
					placeholder="john@example.com"
					type="email"
					value={formData.email}
					onChange={(e) => handleChange("email", e.currentTarget.value)}
					onBlur={() => handleBlur("email")}
					error={errors.email}
					required
					aria-invalid={!!errors.email}
					aria-describedby={errors.email ? "email-error" : undefined}
				/>

				<Select
					label="Subject"
					placeholder="Select a subject"
					data={subjectOptions}
					value={formData.subject}
					onChange={(value) => handleChange("subject", value || "general")}
					onBlur={() => handleBlur("subject")}
					required
					error={errors.subject}
					styles={{
						input: {
							background: "rgba(26, 26, 26, 0.6)",
							borderColor: errors.subject
								? "#ef4444"
								: "rgba(255, 255, 255, 0.1)",
							color: "#e2e8f0",
							fontSize: "1rem",
						},
						label: {
							color: "#e2e8f0",
							fontWeight: 500,
							fontSize: "0.875rem",
							marginBottom: "0.5rem",
						},
						error: {
							color: "#ef4444",
							fontSize: "0.75rem",
							marginTop: "0.25rem",
						},
						dropdown: {
							background: "rgba(26, 26, 26, 0.95)",
							border: "1px solid rgba(255, 255, 255, 0.1)",
						},
						option: {
							color: "#e2e8f0",
							"&:hover": {
								background: "rgba(255, 255, 255, 0.1)",
							},
						},
					}}
					aria-invalid={!!errors.subject}
				/>

				<Textarea
					label="Message"
					placeholder="I'd like to discuss..."
					minRows={5}
					maxRows={10}
					value={formData.message}
					onChange={(e) => handleChange("message", e.currentTarget.value)}
					onBlur={() => handleBlur("message")}
					error={errors.message}
					required
					resize="vertical"
					description={`${formData.message.length}/1000 characters`}
					styles={{
						input: {
							background: "rgba(26, 26, 26, 0.6)",
							borderColor: errors.message
								? "#ef4444"
								: "rgba(255, 255, 255, 0.1)",
							color: "#e2e8f0",
							fontSize: "1rem",
						},
						label: {
							color: "#e2e8f0",
							fontWeight: 500,
							fontSize: "0.875rem",
							marginBottom: "0.5rem",
						},
						error: {
							color: "#ef4444",
							fontSize: "0.75rem",
							marginTop: "0.25rem",
						},
						description: {
							color: "#94a3b8",
							fontSize: "0.75rem",
							marginTop: "0.25rem",
						},
					}}
					aria-invalid={!!errors.message}
				/>

				<Group justify="space-between">
					<Group gap="sm">
						<Button
							variant="filled"
							color="blue"
							type="submit"
							loading={isSubmitting}
							disabled={!isValidForm()}
							rightSection={isSubmitting ? <div /> : <IconSend size={16} />}
							styles={{
								root: {
									background: "#3b82f6",
									"&:hover:not(:disabled)": {
										background: "#2563eb",
									},
									"&:disabled": {
										background: "rgba(255, 255, 255, 0.1)",
										cursor: "not-allowed",
									},
								},
							}}
						>
							{isSubmitting ? "Sending..." : "Send Message"}
						</Button>
						<Button
							variant="outline"
							color="gray"
							onClick={handleClear}
							rightSection={<IconX size={16} />}
							disabled={isSubmitting}
							styles={{
								root: {
									borderColor: "rgba(255, 255, 255, 0.1)",
									color: "#e2e8f0",
									"&:hover:not(:disabled)": {
										background: "rgba(255, 255, 255, 0.1)",
									},
									"&:disabled": {
										opacity: 0.5,
										cursor: "not-allowed",
									},
								},
							}}
						>
							Clear
						</Button>
					</Group>
				</Group>
			</Stack>
		</motion.form>
	);
}
