import { Tooltip } from "@mantine/core";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export function WhatsAppButton() {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		// Show button after 1 second
		const timer = setTimeout(() => {
			setIsVisible(true);
		}, 1000);

		return () => clearTimeout(timer);
	}, []);

	const handleWhatsAppClick = () => {
		const phoneNumber = "6596494212";
		window.open(`https://wa.me/${phoneNumber}`, "_blank");
	};

	return (
		<AnimatePresence>
			{isVisible && (
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
						zIndex: 9999,
					}}
				>
					<Tooltip
						label="Click to start a conversation on WhatsApp"
						position="left"
					>
						<button
							type="button"
							onClick={handleWhatsAppClick}
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
								border: "none",
							}}
						>
							<IconBrandWhatsapp size={24} color="white" />
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
						</button>
					</Tooltip>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
