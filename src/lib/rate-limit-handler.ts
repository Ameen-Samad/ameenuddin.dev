import { notifications } from "@mantine/notifications";

interface RateLimitError {
	error: string;
	message: string;
	limit: number;
	remaining: number;
	resetAt: number;
}

function isRateLimitError(response: any): response is RateLimitError {
	return (
		response &&
		typeof response === "object" &&
		response.error === "Rate limit exceeded" &&
		typeof response.limit === "number" &&
		typeof response.remaining === "number" &&
		typeof response.resetAt === "number"
	);
}

export async function handleRateLimitError(response: Response): Promise<void> {
	try {
		const data = await response.clone().json();

		if (isRateLimitError(data)) {
			const secondsUntilReset = Math.ceil((data.resetAt - Date.now()) / 1000);

			showPoorStudentToast();
			showCoinsAnimation();

			setTimeout(() => {
				showRateLimitToast(data.limit, data.remaining, secondsUntilReset);
			}, 2000);

			throw new Error(
				`Rate limit exceeded. Try again in ${secondsUntilReset} seconds.`,
			);
		}
	} catch (error) {
		if (
			error instanceof Error &&
			error.message.includes("Rate limit exceeded")
		) {
			throw error;
		}
	}
}

function showPoorStudentToast() {
	notifications.show({
		id: "rate-limit-poor-student",
		title: "⚠️ Slow down there, partner!",
		message:
			"I'm a poor student running on free-tier APIs. Please don't spam the requests! 🙏",
		color: "orange",
		autoClose: 6000,
		withBorder: true,
	});
}

function showCoinsAnimation() {
	const animation = document.createElement("div");
	animation.id = "coins-animation";
	animation.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 9998;
    overflow: hidden;
  `;

	document.body.appendChild(animation);

	const coinCount = 20;
	for (let i = 0; i < coinCount; i++) {
		const coin = document.createElement("div");
		coin.innerHTML = "💰";
		coin.style.cssText = `
      position: absolute;
      font-size: 24px;
      top: -50px;
      left: ${Math.random() * 100}vw;
      opacity: 1;
      transform: rotate(${Math.random() * 360}deg);
    `;

		const duration = 2 + Math.random() * 2;
		const delay = Math.random() * 0.5;

		coin.animate(
			[
				{
					top: "-50px",
					opacity: 1,
					transform: `rotate(${Math.random() * 360}deg) translateX(0)`,
				},
				{
					top: "110vh",
					opacity: 0.3,
					transform: `rotate(${Math.random() * 360 + 720}deg) translateX(${
						(Math.random() - 0.5) * 200
					}px)`,
				},
			],
			{
				duration: duration * 1000,
				delay: delay * 1000,
				easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
			},
		);

		animation.appendChild(coin);

		setTimeout(
			() => {
				coin.remove();
			},
			(duration + delay) * 1000,
		);
	}

	setTimeout(() => {
		animation.remove();
	}, 3500);
}

function showRateLimitToast(limit: number, remaining: number, seconds: number) {
	notifications.show({
		id: "rate-limit-info",
		title: "📊 Rate Limit Info",
		message: `Please wait ${seconds} seconds before trying again.

Limit: ${limit} requests
Remaining: ${remaining} requests`,
		color: "yellow",
		autoClose: 10000,
		withBorder: true,
	});
}

export function showRateLimitToastDirect(
	limit: number,
	remaining: number,
	seconds: number,
) {
	showPoorStudentToast();
	showCoinsAnimation();
	setTimeout(() => {
		showRateLimitToast(limit, remaining, seconds);
	}, 2000);
}
