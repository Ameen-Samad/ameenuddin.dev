import { IconBrandWhatsapp, IconX } from "@tabler/icons-react";
import { useLocation } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export function WhatsAppButton() {
	const [isVisible, setIsVisible] = useState(false);
	const [isDismissed, setIsDismissed] = useState(false);
	const location = useLocation();

	// Reset dismissed state when route changes
	useEffect(() => {
		setIsDismissed(false);
	}, [location.pathname]);

	const handleDismiss = () => {
		setIsDismissed(true);
	};

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
			{isVisible && !isDismissed && (
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
						display: "flex",
						alignItems: "flex-start",
						gap: "8px",
					}}
				>
					<button
						type="button"
						onClick={handleWhatsAppClick}
						style={{
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
					<button
						type="button"
						onClick={handleDismiss}
						aria-label="Dismiss"
						style={{
							background: "#25D366",
							borderRadius: "50%",
							width: "24px",
							height: "24px",
							minWidth: "24px",
							padding: 0,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							cursor: "pointer",
							border: "none",
							boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
						}}
					>
						<IconX size={14} color="white" />
					</button>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
