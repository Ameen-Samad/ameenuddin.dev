import { ActionIcon, Tooltip } from "@mantine/core";
import { IconBrandWhatsapp, IconX } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function WhatsAppButton() {
	const [isVisible, setIsVisible] = useState(false);
	const [isDismissed, setIsDismissed] = useState(false);

	useEffect(() => {
		// Check if user has previously dismissed
		const dismissed = localStorage.getItem("whatsapp-button-dismissed");
		if (dismissed === "true") {
			setIsDismissed(true);
			return;
		}

		// Show button after 2 seconds
		const timer = setTimeout(() => {
			setIsVisible(true);
		}, 2000);

		return () => clearTimeout(timer);
	}, []);

	const handleDismiss = (e: React.MouseEvent) => {
		e.stopPropagation();
		setIsVisible(false);
		setIsDismissed(true);
		localStorage.setItem("whatsapp-button-dismissed", "true");
	};

	const handleWhatsAppClick = () => {
		// WhatsApp link format: https://wa.me/[country code][phone number]
		// Remove spaces and + from number
		const phoneNumber = "6596494212"; // +65 9649 4212 without formatting
		window.open(`https://wa.me/${phoneNumber}`, "_blank");
	};

	if (isDismissed) {
		return null;
	}

	return (
		<AnimatePresence>
			{isVisible && (
				<Tooltip
					label="Click to start a conversation on WhatsApp"
					position="left"
				>
					<motion.div
						initial={{ scale: 0, opacity: 0, y: 20 }}
						animate={{ scale: 1, opacity: 1, y: 0 }}
						exit={{ scale: 0, opacity: 0, y: 20 }}
						transition={{
							type: "spring",
							stiffness: 400,
							damping: 17,
						}}
						style={{
							position: "fixed",
							bottom: "24px",
							right: "24px",
							zIndex: 1000,
						}}
					>
						<div
							style={{
								position: "relative",
								display: "flex",
								alignItems: "center",
								gap: "12px",
								background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
								padding: "12px 20px",
								borderRadius: "50px",
								boxShadow: "0 4px 20px rgba(37, 211, 102, 0.4)",
								cursor: "pointer",
							}}
							onClick={handleWhatsAppClick}
						>
							{/* Close button */}
							<ActionIcon
								size="xs"
								variant="transparent"
								onClick={handleDismiss}
								style={{
									position: "absolute",
									top: "-8px",
									right: "-8px",
									background: "rgba(0, 0, 0, 0.6)",
									borderRadius: "50%",
									color: "white",
									zIndex: 1,
								}}
								aria-label="Dismiss WhatsApp button"
							>
								<IconX size={14} />
							</ActionIcon>

							{/* WhatsApp Icon */}
							<IconBrandWhatsapp size={24} color="white" />

							{/* Text */}
							<span
								style={{
									color: "white",
									fontSize: "14px",
									fontWeight: 600,
									whiteSpace: "nowrap",
								}}
							>
								Chat on WhatsApp
							</span>
						</div>
					</motion.div>
				</Tooltip>
			)}
		</AnimatePresence>
	);
}
