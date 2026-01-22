import { type NotificationData, notifications } from "@mantine/notifications";
import { useState, useEffect } from "react";

export function CoinAnimation() {
	const [coins, setCoins] = useState<
		Array<{
			id: number;
			left: number;
			duration: number;
		}>
	>([]);

	useEffect(() => {
		const coinData = Array.from({ length: 12 }).map((_, i) => ({
			id: i,
			left: Math.random() * 100,
			duration: 1.5 + Math.random(),
		}));
		setCoins(coinData);
	}, []);

	if (coins.length === 0) return null;

	return (
		<div className="fixed inset-0 pointer-events-none z-[10000]">
			{coins.map((coin, i) => (
				<div
					key={coin.id}
					className="absolute text-4xl animate-fall"
					style={{
						left: `${coin.left}%`,
						top: "-50px",
						animationDelay: `${i * 0.1}s`,
						animationDuration: `${coin.duration}s`,
					}}
				>
					💰
				</div>
			))}
		</div>
	);
}

export function showRateLimitNotification(data: NotificationData) {
	notifications.show({
		...data,
		withCloseButton: true,
		autoClose: 5000,
	});
}

export function showPoorStudentRateLimit() {
	showRateLimitNotification({
		title: "Rate Limit Exceeded! 🚫",
		message:
			"Hey, I'm just a poor student trying to keep costs down! Please don't spam my API. You've used up your daily allowance. Come back tomorrow!",
		color: "yellow",
	});
}
