export function generateRandomTodos(count: number) {
	const actions = [
		"Implement",
		"Refactor",
		"Optimize",
		"Debug",
		"Test",
		"Deploy",
		"Review",
		"Document",
		"Analyze",
		"Design",
		"Build",
		"Fix",
		"Refine",
		"Integrate",
		"Migrate",
		"Scale",
		"Secure",
		"Audit",
	];

	const objects = [
		"API endpoint",
		"database schema",
		"user interface",
		"authentication flow",
		"payment gateway",
		"notification system",
		"analytics dashboard",
		"search algorithm",
		"file upload handler",
		"real-time websocket",
		"data pipeline",
		"caching layer",
		"rate limiter",
		"error handler",
		"logging system",
		"monitoring dashboard",
		"CI/CD pipeline",
		"test suite",
		"documentation",
		"access control",
	];

	const adjectives = [
		"efficient",
		"scalable",
		"secure",
		"user-friendly",
		"responsive",
		"performant",
		"maintainable",
		"testable",
		"accessible",
		"SEO-friendly",
		"modular",
		"flexible",
		"robust",
		"reliable",
		"fault-tolerant",
	];

	const modifiers = [
		"using TanStack Query",
		"with Cloudflare Workers",
		"leveraging TanStack Table",
		"using React Server Components",
		"with Edge runtime",
		"leveraging TanStack Router",
		"using TypeScript strict mode",
		"with automated testing",
		"leveraging caching strategies",
		"using virtual scrolling",
		"with SSR streaming",
		"leveraging AI integration",
	];

	const todos: { id: number; name: string }[] = [];

	for (let i = 0; i < count; i++) {
		const action = actions[Math.floor(Math.random() * actions.length)];
		const object = objects[Math.floor(Math.random() * objects.length)];
		const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
		const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];

		const todo = `${action} ${adjective} ${object} ${modifier}`;

		todos.push({
			id: i + 1,
			name: todo,
		});
	}

	return todos;
}
