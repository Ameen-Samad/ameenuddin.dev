import { Text, Title } from "@mantine/core";
import { IconCircleCheck } from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ContactSuccessProps {
	onReset: () => void;
}

export function ContactSuccess({ onReset }: ContactSuccessProps) {
	const [countdown, setCountdown] = useState(3);
	const [particles, setParticles] = useState<
		Array<{
			id: number;
			left: number;
			duration: number;
			color: string;
		}>
	>([]);

	useEffect(() => {
		const timer = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	useEffect(() => {
		const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7"];
		const particleData = Array.from({ length: 50 }).map((_, i) => ({
			id: i,
			left: Math.random() * 100,
			duration: Math.random() * 1 + 0.5,
			color: colors[Math.floor(Math.random() * colors.length)],
		}));
		setParticles(particleData);
		const timer = setTimeout(() => setParticles([]), 3000);
		return () => clearTimeout(timer);
	}, []);

	const handleReset = () => {
		onReset();
	};

	if (countdown > 0) {
		return (
			<motion.div
				initial={{ opacity: 0, scale: 0.8 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.5, ease: "easeOut" }}
				style={{
					textAlign: "center",
					padding: "3rem 2rem",
					background: "rgba(16, 185, 129, 0.1)",
					border: "1px solid #10b981",
					borderRadius: "0.5rem",
					position: "relative",
					overflow: "hidden",
				}}
			>
				{particles.map((particle) => (
					<motion.div
						key={particle.id}
						initial={{
							opacity: 0,
							scale: 0,
							y: 0,
						}}
						animate={{
							opacity: 1,
							scale: 1,
							y: -200,
						}}
						transition={{
							duration: particle.duration,
							delay: particle.id * 0.03,
						}}
						style={{
							position: "absolute",
							left: `${particle.left}%`,
							bottom: "0",
							width: "8px",
							height: "8px",
							borderRadius: "50%",
							backgroundColor: particle.color,
							pointerEvents: "none",
						}}
					/>
				))}

				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{
						type: "spring",
						stiffness: 200,
						damping: 15,
						delay: 0.2,
					}}
					style={{
						fontSize: "5rem",
						color: "#10b981",
						marginBottom: "1.5rem",
						position: "relative",
						zIndex: 1,
					}}
				>
					<IconCircleCheck size={64} />
				</motion.div>

				<Title
					order={2}
					c="white"
					mb="md"
					style={{
						position: "relative",
						zIndex: 1,
						fontSize: "1.5rem",
						fontWeight: 700,
					}}
				>
					Message Sent!
				</Title>

				<Text
					c="white"
					size="lg"
					mb="xl"
					style={{
						position: "relative",
						zIndex: 1,
						color: "#6ee7b7",
						fontSize: "1.125rem",
					}}
				>
					Thank you for reaching out! I'll get back to you within 24-48 hours.
				</Text>

				<Text
					c="white"
					size="sm"
					style={{
						position: "relative",
						zIndex: 1,
						color: "#94a3b8",
						fontSize: "0.875rem",
					}}
				>
					Form will reset in {countdown} seconds...
				</Text>
			</motion.div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 1, scale: 1 }}
			animate={{ opacity: 0, scale: 0.8 }}
			transition={{ duration: 0.3 }}
			onAnimationComplete={handleReset}
		/>
	);
}
