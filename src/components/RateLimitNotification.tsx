import { type NotificationData, notifications } from "@mantine/notifications";

export function CoinAnimation() {
	const coinIds = Array.from({ length: 12 }).map(() =>
		Math.random().toString(36).substring(7),
	);

	return (
		<div className="fixed inset-0 pointer-events-none z-[10000]">
			{coinIds.map((id, i) => (
				<div
					key={id}
					className="absolute text-4xl animate-fall"
					style={{
						left: `${Math.random() * 100}%`,
						top: "-50px",
						animationDelay: `${i * 0.1}s`,
						animationDuration: `${1.5 + Math.random()}s`,
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
