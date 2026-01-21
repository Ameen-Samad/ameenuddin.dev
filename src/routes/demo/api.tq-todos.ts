import { createFileRoute } from "@tanstack/react-router";
import { generateRandomTodos } from "@/lib/generate-todos";

let todos = [
	{
		id: 1,
		name: "Buy groceries",
	},
	{
		id: 2,
		name: "Buy mobile phone",
	},
	{
		id: 3,
		name: "Buy laptop",
	},
];

export const Route = createFileRoute("/demo/api/tq-todos")({
	server: {
		handlers: {
			GET: () => {
				return Response.json(todos);
			},
			POST: async ({ request }) => {
				const body = await request.json();

				if (typeof body === "string") {
					const todo = {
						id: todos.length + 1,
						name: body,
					};
					todos.push(todo);
					return Response.json(todo);
				}

				if (body.count) {
					const newTodos = generateRandomTodos(body.count);
					todos = [
						...todos,
						...newTodos.map((t, i) => ({ ...t, id: todos.length + 1 + i })),
					];
					return Response.json({ added: newTodos.length, total: todos.length });
				}

				return Response.json({ error: "Invalid request" }, { status: 400 });
			},
			PUT: async ({ request }) => {
				const { id, name } = await request.json();
				const index = todos.findIndex((t) => t.id === id);
				if (index !== -1) {
					todos[index].name = name;
					return Response.json(todos[index]);
				}
				return Response.json({ error: "Todo not found" }, { status: 404 });
			},
			DELETE: async ({ request }) => {
				const { id } = await request.json();
				const index = todos.findIndex((t) => t.id === id);
				if (index !== -1) {
					const deleted = todos.splice(index, 1)[0];
					return Response.json(deleted);
				}
				return Response.json({ error: "Todo not found" }, { status: 404 });
			},
		},
	},
});
