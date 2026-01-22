import { TextInput, type TextInputProps } from "@mantine/core";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

interface ContactInputProps extends TextInputProps {
	error?: string;
	isFocused?: boolean;
	onFocus?: () => void;
	onBlur?: () => void;
}

export function ContactInput({
	error,
	onFocus,
	onBlur,
	...props
}: ContactInputProps) {
	const [isFocused, setIsFocused] = useState(false);
	const controls = useAnimation();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (error) {
			controls.start({
				x: [-5, 5, -5, 5, -5, 5, 0],
				transition: { duration: 0.5 },
			});
		}
	}, [error, controls]);

	const handleFocus = () => {
		setIsFocused(true);
		onFocus?.();
	};

	const handleBlur = () => {
		setIsFocused(false);
		onBlur?.();
	};

	if (!mounted) {
		return null;
	}

	return (
		<motion.div animate={controls}>
			<TextInput
				{...props}
				onFocus={handleFocus}
				onBlur={handleBlur}
				styles={{
					input: {
						background: "rgba(26, 26, 26, 0.6)",
						borderColor: error
							? "#ef4444"
							: isFocused
								? "rgba(59, 130, 246, 0.5)"
								: "rgba(255, 255, 255, 0.1)",
						color: "#e2e8f0",
						fontSize: "1rem",
						"&:focus": {
							background: "rgba(26, 26, 26, 0.8)",
							boxShadow: isFocused
								? "0 0 0 4px rgba(59, 130, 246, 0.2)"
								: "none",
						},
						"&::placeholder": {
							color: "#64748b",
						},
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
			/>
		</motion.div>
	);
}
