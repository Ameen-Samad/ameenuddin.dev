import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "./init";

const todoSchema = z.object({
	id: z.number(),
	name: z.string().min(1, "Name is required").max(100, "Name too long"),
	completed: z.boolean().default(false),
	priority: z.enum(["low", "medium", "high"]).default("medium"),
	createdAt: z.date(),
});

type Todo = z.infer<typeof todoSchema>;

let todos: Todo[] = [
	{
		id: 1,
		name: "Get groceries",
		completed: false,
		priority: "high",
		createdAt: new Date(Date.now() - 86400000 * 2),
	},
	{
		id: 2,
		name: "Buy a new phone",
		completed: true,
		priority: "medium",
		createdAt: new Date(Date.now() - 86400000),
	},
	{
		id: 3,
		name: "Finish the project",
		completed: false,
		priority: "high",
		createdAt: new Date(),
	},
];

const todosRouter = {
	list: publicProcedure
		.input(
			z
				.object({
					filter: z.enum(["all", "active", "completed"]).default("all"),
					sortBy: z
						.enum(["name", "createdAt", "priority"])
						.default("createdAt"),
					sortOrder: z.enum(["asc", "desc"]).default("desc"),
					search: z.string().optional(),
				})
				.optional(),
		)
		.query(({ input }) => {
			let filtered = [...todos];

			if (input?.search) {
				const searchLower = input.search.toLowerCase();
				filtered = filtered.filter((t) =>
					t.name.toLowerCase().includes(searchLower),
				);
			}

			if (input?.filter === "active") {
				filtered = filtered.filter((t) => !t.completed);
			} else if (input?.filter === "completed") {
				filtered = filtered.filter((t) => t.completed);
			}

			if (input?.sortBy === "name") {
				filtered.sort((a, b) => a.name.localeCompare(b.name));
			} else if (input?.sortBy === "priority") {
				const priorityOrder = { high: 0, medium: 1, low: 2 };
				filtered.sort(
					(a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
				);
			} else {
				filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
			}

			if (input?.sortOrder === "desc") {
				filtered.reverse();
			}

			return filtered;
		}),

	byId: publicProcedure
		.input(z.object({ id: z.number() }))
		.query(({ input }) => {
			const todo = todos.find((t) => t.id === input.id);
			if (!todo) {
				throw new Error("Todo not found");
			}
			return todo;
		}),

	add: publicProcedure
		.input(
			z.object({
				name: z.string().min(1, "Name is required").max(100, "Name too long"),
				priority: z.enum(["low", "medium", "high"]).default("medium"),
			}),
		)
		.mutation(({ input }) => {
			const newTodo: Todo = {
				id: Math.max(...todos.map((t) => t.id), 0) + 1,
				name: input.name,
				completed: false,
				priority: input.priority,
				createdAt: new Date(),
			};
			todos.push(newTodo);
			return newTodo;
		}),

	update: publicProcedure
		.input(
			z.object({
				id: z.number(),
				name: z
					.string()
					.min(1, "Name is required")
					.max(100, "Name too long")
					.optional(),
				completed: z.boolean().optional(),
				priority: z.enum(["low", "medium", "high"]).optional(),
			}),
		)
		.mutation(({ input }) => {
			const index = todos.findIndex((t) => t.id === input.id);
			if (index === -1) {
				throw new Error("Todo not found");
			}
			todos[index] = { ...todos[index], ...input };
			return todos[index];
		}),

	toggle: publicProcedure
		.input(z.object({ id: z.number() }))
		.mutation(({ input }) => {
			const todo = todos.find((t) => t.id === input.id);
			if (!todo) {
				throw new Error("Todo not found");
			}
			todo.completed = !todo.completed;
			return todo;
		}),

	delete: publicProcedure
		.input(z.object({ id: z.number() }))
		.mutation(({ input }) => {
			const index = todos.findIndex((t) => t.id === input.id);
			if (index === -1) {
				throw new Error("Todo not found");
			}
			const deleted = todos.splice(index, 1)[0];
			return deleted;
		}),

	stats: publicProcedure.query(() => {
		const total = todos.length;
		const completed = todos.filter((t) => t.completed).length;
		const active = total - completed;
		const highPriority = todos.filter(
			(t) => t.priority === "high" && !t.completed,
		).length;

		return { total, completed, active, highPriority };
	}),

	batchDelete: publicProcedure
		.input(z.object({ ids: z.array(z.number()) }))
		.mutation(({ input }) => {
			const deleted = todos.filter((t) => input.ids.includes(t.id));
			todos = todos.filter((t) => !input.ids.includes(t.id));
			return { count: deleted.length, deleted };
		}),

	markAllComplete: publicProcedure.mutation(() => {
		let count = 0;
		todos.forEach((t) => {
			if (!t.completed) {
				t.completed = true;
				count++;
			}
		});
		return { count };
	}),

	clearCompleted: publicProcedure.mutation(() => {
		const completedCount = todos.filter((t) => t.completed).length;
		todos = todos.filter((t) => !t.completed);
		return { count: completedCount };
	}),
} satisfies TRPCRouterRecord;

export const trpcRouter = createTRPCRouter({
	todos: todosRouter,
});
export type TRPCRouter = typeof trpcRouter;
