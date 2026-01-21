import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { useTRPC } from "@/integrations/trpc/react";

type Filter = "all" | "active" | "completed";
type SortBy = "name" | "createdAt" | "priority";

function HowTRPCWorks() {
	const [activeTab, setActiveTab] = useState<
		"query" | "mutation" | "validation"
	>("query");

	const codeExamples = {
		query: {
			backend: `// backend: src/integrations/trpc/router.ts
import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from './init'

const todosRouter = {
  list: publicProcedure
    .input(z.object({
      filter: z.enum(['all', 'active', 'completed']).default('all'),
      sortBy: z.enum(['name', 'createdAt', 'priority']).default('createdAt'),
      search: z.string().optional(),
    }).optional())
    .query(({ input }) => {
      // Type-safe input validation ✓
      let todos = getTodos()
      
      // Server-side filtering & sorting
      if (input?.filter === 'active') {
        todos = todos.filter(t => !t.completed)
      }
      return todos
    }),
} satisfies TRPCRouterRecord`,
			frontend: `// frontend: src/routes/demo/trpc-todo.tsx
import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '@/integrations/trpc/react'

function TodoList() {
  const trpc = useTRPC()
  
  const { data, isLoading } = useQuery(
    trpc.todos.list.queryOptions({
      filter: 'active',
      sortBy: 'createdAt',
      search: 'project'
    })
  )
  
  // data is automatically typed! ✓
  // data?: Array<{
  //   id: number
  //   name: string
  //   completed: boolean
  //   priority: 'low' | 'medium' | 'high'
  //   createdAt: Date
  // }>
}`,
			explanation:
				"Backend defines procedures with Zod input validation → Frontend gets autocomplete & type-safety automatically",
		},
		mutation: {
			backend: `// backend: src/integrations/trpc/router.ts
const todosRouter = {
  add: publicProcedure
    .input(z.object({
      name: z.string()
        .min(1, 'Name is required')
        .max(100, 'Name too long'),
      priority: z.enum(['low', 'medium', 'high'])
        .default('medium'),
    }))
    .mutation(({ input }) => {
      // input is fully typed! ✓
      const newTodo = {
        id: generateId(),
        name: input.name,
        completed: false,
        priority: input.priority,
        createdAt: new Date(),
      }
      todos.push(newTodo)
      return newTodo
    }),
}`,
			frontend: `// frontend: src/routes/demo/trpc-todo.tsx
import { useMutation } from '@tanstack/react-query'
import { useTRPC } from '@/integrations/trpc/react'

function AddTodoForm() {
  const trpc = useTRPC()
  
  const { mutate: addTodo, isPending } = useMutation({
    ...trpc.todos.add.mutationOptions(),
    onSuccess: () => {
      // Refetch automatically
      queryClient.invalidateQueries({
        queryKey: trpc.todos.list.queryKey
      })
    },
  })
  
  // addTodo is typed! ✓
  addTodo({ name: 'Buy milk', priority: 'high' })
  
  // TypeScript error:
  addTodo({ name: 123 }) // ❌ number not allowed
  addTodo({ name: 'x'.repeat(150) }) // ❌ validation fails
}`,
			explanation:
				"Mutations are fully typed with Zod validation → Errors caught at build time, not runtime",
		},
		validation: {
			backend: `// backend: src/integrations/trpc/router.ts
import { z } from 'zod'

const todoSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(100),
  completed: z.boolean().default(false),
  priority: z.enum(['low', 'medium', 'high'])
    .default('medium'),
  createdAt: z.date(),
})

// Infer types from Zod schema
type Todo = z.infer<typeof todoSchema>

// Validation happens on EVERY request
// No need to write validation logic twice! ✓`,
			frontend: `// frontend: src/routes/demo/trpc-todo.tsx
// Type automatically inferred from backend
// No manual TypeScript interfaces needed!

const { data } = useQuery(trpc.todos.list.queryOptions())

// data?.map(todo => {
//   todo.id        // number
//   todo.name      // string (min 1, max 100)
//   todo.completed // boolean
//   todo.priority  // 'low' | 'medium' | 'high'
//   todo.createdAt // Date
// })

// TypeScript will show autocomplete
// and catch type errors before running!`,
			explanation:
				"Zod schemas define your data model → Types auto-propagate to frontend → Single source of truth",
		},
	};

	return (
		<div className="mt-8 bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
			<div className="border-b border-white/10 px-6 py-4 bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
				<h2 className="text-xl font-bold mb-2">
					🔌 How tRPC Works: Type-Safe Full-Stack
				</h2>
				<p className="text-white/60 text-sm">
					Backend and frontend share the same types automatically
				</p>
			</div>

			<div className="flex border-b border-white/10">
				{(["query", "mutation", "validation"] as const).map((tab) => (
					<button
						key={tab}
						onClick={() => setActiveTab(tab)}
						type="button"
						className={`flex-1 px-4 py-3 text-sm font-medium transition-all capitalize ${
							activeTab === tab
								? "bg-cyan-500/20 text-cyan-300 border-b-2 border-cyan-500"
								: "text-white/60 hover:text-white hover:bg-white/5"
						}`}
					>
						{tab}
					</button>
				))}
			</div>

			<div className="p-6">
				<div className="grid md:grid-cols-2 gap-4">
					<div>
						<h3 className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-2">
							<span className="w-2 h-2 rounded-full bg-purple-400"></span>
							Backend Router
						</h3>
						<pre className="bg-black/40 rounded-lg p-4 overflow-x-auto text-sm">
							<code className="text-white/80">
								{codeExamples[activeTab].backend}
							</code>
						</pre>
					</div>

					<div>
						<h3 className="text-sm font-semibold text-cyan-400 mb-2 flex items-center gap-2">
							<span className="w-2 h-2 rounded-full bg-cyan-400"></span>
							Frontend Component
						</h3>
						<pre className="bg-black/40 rounded-lg p-4 overflow-x-auto text-sm">
							<code className="text-white/80">
								{codeExamples[activeTab].frontend}
							</code>
						</pre>
					</div>
				</div>

				<div className="mt-4 p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg border border-cyan-500/20">
					<p className="text-sm text-white/70">
						<span className="text-cyan-400 font-semibold">
							💡 {codeExamples[activeTab].explanation}
						</span>
					</p>
				</div>

				<div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs text-white/50">
					<div className="p-3 bg-white/5 rounded-lg">
						<div className="text-lg mb-1">🔒</div>
						<div>Type-Safe API</div>
						<div className="mt-1">No manual interfaces</div>
					</div>
					<div className="p-3 bg-white/5 rounded-lg">
						<div className="text-lg mb-1">✨</div>
						<div>Auto-Complete</div>
						<div className="mt-1">Full IDE support</div>
					</div>
					<div className="p-3 bg-white/5 rounded-lg">
						<div className="text-lg mb-1">🛡️</div>
						<div>Runtime Validation</div>
						<div className="mt-1">Zod-powered safety</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export const Route = createFileRoute("/demo/trpc-todo")({
	component: TRPCTodos,
	loader: async ({ context }) => {
		await Promise.all([
			context.queryClient.prefetchQuery(context.trpc.todos.list.queryOptions()),
			context.queryClient.prefetchQuery(
				context.trpc.todos.stats.queryOptions(),
			),
		]);
	},
});

function TRPCTodos() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const [filter, setFilter] = useState<Filter>("all");
	const [sortBy, setSortBy] = useState<SortBy>("createdAt");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
	const [search, setSearch] = useState("");

	const { data: todos, isLoading } = useQuery(
		trpc.todos.list.queryOptions({
			filter,
			sortBy,
			sortOrder,
			search: search || undefined,
		}),
	);

	const { data: stats } = useQuery(trpc.todos.stats.queryOptions());

	const [newTodo, setNewTodo] = useState("");
	const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">(
		"medium",
	);

	const { mutate: addTodo, isPending: isAdding } = useMutation({
		...trpc.todos.add.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: trpc.todos.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.todos.stats.queryKey() });
			setNewTodo("");
		},
	});

	const { mutate: toggleTodo, isPending: isToggling } = useMutation({
		...trpc.todos.toggle.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: trpc.todos.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.todos.stats.queryKey() });
		},
	});

	const { mutate: deleteTodo, isPending: isDeleting } = useMutation({
		...trpc.todos.delete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: trpc.todos.list.queryKey() });
			queryClient.invalidateQueries({ queryKey: trpc.todos.stats.queryKey() });
		},
	});

	const { mutate: updateTodo, isPending: isUpdating } = useMutation({
		...trpc.todos.update.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: trpc.todos.list.queryKey() });
		},
	});

	const { mutate: batchDelete, isPending: isBatchDeleting } = useMutation({
		...trpc.todos.batchDelete.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: trpc.todos.list.queryKey });
			queryClient.invalidateQueries({ queryKey: trpc.todos.stats.queryKey });
			setSelectedIds([]);
		},
	});

	const { mutate: clearCompleted, isPending: isClearing } = useMutation({
		...trpc.todos.clearCompleted.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: trpc.todos.list.queryKey });
			queryClient.invalidateQueries({ queryKey: trpc.todos.stats.queryKey });
			setSelectedIds([]);
		},
	});

	const [selectedIds, setSelectedIds] = useState<number[]>([]);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [editingName, setEditingName] = useState("");

	const submitTodo = useCallback(() => {
		addTodo({ name: newTodo, priority: newPriority });
	}, [addTodo, newTodo, newPriority]);

	const toggleAllSelected = useCallback(() => {
		if (selectedIds.length === todos?.length) {
			setSelectedIds([]);
		} else {
			setSelectedIds(todos?.map((t) => t.id) || []);
		}
	}, [selectedIds.length, todos]);

	const priorityColors = {
		low: "bg-green-500/20 text-green-300 border-green-500/30",
		medium: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
		high: "bg-red-500/20 text-red-300 border-red-500/30",
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 text-white">
			<div className="w-full max-w-4xl mx-auto space-y-6">
				<div className="text-center py-8">
					<h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
						tRPC Todo App
					</h1>
					<p className="text-white/60">
						Full-stack type safety with Zod validation
					</p>
				</div>

				<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
					<div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
						<div className="text-3xl font-bold text-cyan-400">
							{stats?.total || 0}
						</div>
						<div className="text-sm text-white/60">Total</div>
					</div>
					<div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
						<div className="text-3xl font-bold text-yellow-400">
							{stats?.active || 0}
						</div>
						<div className="text-sm text-white/60">Active</div>
					</div>
					<div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
						<div className="text-3xl font-bold text-green-400">
							{stats?.completed || 0}
						</div>
						<div className="text-sm text-white/60">Completed</div>
					</div>
					<div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
						<div className="text-3xl font-bold text-red-400">
							{stats?.highPriority || 0}
						</div>
						<div className="text-sm text-white/60">High Priority</div>
					</div>
				</div>

				<div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm shadow-2xl">
					<div className="flex flex-col md:flex-row gap-3 mb-4">
						<input
							type="text"
							value={newTodo}
							onChange={(e) => setNewTodo(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									submitTodo();
								}
							}}
							placeholder="Add a new todo..."
							className="flex-1 px-4 py-3 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
							disabled={isAdding}
						/>
						<select
							value={newPriority}
							onChange={(e) => setNewPriority(e.target.value as any)}
							className="px-4 py-3 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all cursor-pointer"
							disabled={isAdding}
						>
							<option value="low">Low Priority</option>
							<option value="medium">Medium Priority</option>
							<option value="high">High Priority</option>
						</select>
						<button
							disabled={newTodo.trim().length === 0 || isAdding}
							onClick={submitTodo}
							className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-cyan-500/25"
						>
							{isAdding ? "Adding..." : "Add Todo"}
						</button>
					</div>

					<div className="flex flex-col md:flex-row gap-4 mb-4 p-4 bg-black/20 rounded-lg">
						<div className="flex items-center gap-2">
							<label className="text-sm text-white/60">Filter:</label>
							<div className="flex gap-1">
								{(["all", "active", "completed"] as Filter[]).map((f) => (
									<button
										key={f}
										onClick={() => setFilter(f)}
										className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
											filter === f
												? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/25"
												: "bg-white/5 text-white/60 hover:bg-white/10"
										}`}
									>
										{f.charAt(0).toUpperCase() + f.slice(1)}
									</button>
								))}
							</div>
						</div>

						<div className="flex items-center gap-2">
							<label className="text-sm text-white/60">Sort:</label>
							<select
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value as SortBy)}
								className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-sm focus:outline-none cursor-pointer"
							>
								<option value="name">Name</option>
								<option value="createdAt">Date</option>
								<option value="priority">Priority</option>
							</select>
							<button
								onClick={() =>
									setSortOrder(sortOrder === "asc" ? "desc" : "asc")
								}
								className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
							>
								{sortOrder === "asc" ? "↑" : "↓"}
							</button>
						</div>

						<input
							type="text"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							placeholder="Search todos..."
							className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
						/>
					</div>

					{selectedIds.length > 0 && (
						<div className="flex gap-2 mb-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
							<span className="text-sm text-cyan-300 self-center">
								{selectedIds.length} selected
							</span>
							<button
								onClick={() => batchDelete({ ids: selectedIds })}
								disabled={isBatchDeleting}
								className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-sm transition-colors"
							>
								Delete Selected
							</button>
							<button
								onClick={() => setSelectedIds([])}
								className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/60 rounded-lg text-sm transition-colors"
							>
								Clear Selection
							</button>
						</div>
					)}

					{(stats?.completed || 0) > 0 && (
						<div className="flex gap-2 mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
							<span className="text-sm text-green-300 self-center">
								{stats?.completed} completed todos
							</span>
							<button
								onClick={() => clearCompleted()}
								disabled={isClearing}
								type="button"
								className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg text-sm transition-colors"
							>
								Clear Completed
							</button>
						</div>
					)}

					{isLoading ? (
						<div className="text-center py-8 text-white/60">
							Loading todos...
						</div>
					) : todos && todos.length === 0 ? (
						<div className="text-center py-12 text-white/40">
							<div className="text-4xl mb-2">📝</div>
							<div>No todos yet. Add one above!</div>
						</div>
					) : (
						<ul className="space-y-2">
							{todos?.map((t) => (
								<li
									key={t.id}
									className={`group bg-white/5 border ${selectedIds.includes(t.id) ? "border-cyan-500/50 bg-cyan-500/10" : "border-white/10"} rounded-lg p-4 transition-all hover:bg-white/10 hover:shadow-lg`}
								>
									<div className="flex items-start gap-3">
										<input
											type="checkbox"
											checked={selectedIds.includes(t.id)}
											onChange={(e) => {
												if (e.target.checked) {
													setSelectedIds([...selectedIds, t.id]);
												} else {
													setSelectedIds(
														selectedIds.filter((id) => id !== t.id),
													);
												}
											}}
											className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-cyan-500 focus:ring-2 focus:ring-cyan-400 cursor-pointer"
										/>

										<input
											type="checkbox"
											checked={t.completed}
											onChange={() => toggleTodo({ id: t.id })}
											disabled={isToggling}
											className="mt-1 w-5 h-5 rounded border-white/20 bg-white/10 text-green-500 focus:ring-2 focus:ring-green-400 cursor-pointer transition-all"
										/>

										<div className="flex-1 min-w-0">
											{editingId === t.id ? (
												<input
													type="text"
													value={editingName}
													onChange={(e) => setEditingName(e.target.value)}
													onKeyDown={(e) => {
														if (e.key === "Enter") {
															updateTodo({ id: t.id, name: editingName });
															setEditingId(null);
														} else if (e.key === "Escape") {
															setEditingId(null);
														}
													}}
													onBlur={() => {
														if (editingName.trim()) {
															updateTodo({ id: t.id, name: editingName });
														}
														setEditingId(null);
													}}
													autoFocus
													className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
													disabled={isUpdating}
												/>
											) : (
												<span
													onClick={() => {
														setEditingId(t.id);
														setEditingName(t.name);
													}}
													className={`cursor-pointer text-lg ${t.completed ? "line-through text-white/40" : "text-white"}`}
												>
													{t.name}
												</span>
											)}

											<div className="flex items-center gap-2 mt-2">
												<span
													className={`px-2 py-0.5 rounded text-xs font-medium border ${priorityColors[t.priority]}`}
												>
													{t.priority}
												</span>
												<span className="text-xs text-white/40">
													{new Date(t.createdAt).toLocaleDateString()}
												</span>
											</div>
										</div>

										<button
											onClick={() => deleteTodo({ id: t.id })}
											disabled={isDeleting}
											className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
										>
											<svg
												className="w-4 h-4"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
												/>
											</svg>
										</button>
									</div>
								</li>
							))}
						</ul>
					)}

					{todos && todos.length > 0 && selectedIds.length === 0 && (
						<div className="mt-4 flex items-center gap-2">
							<input
								type="checkbox"
								checked={false}
								onChange={toggleAllSelected}
								className="w-4 h-4 rounded border-white/20 bg-white/10 text-cyan-500 focus:ring-2 focus:ring-cyan-400 cursor-pointer"
							/>
							<span className="text-sm text-white/40">Select all</span>
						</div>
					)}
				</div>
			</div>

			<HowTRPCWorks />
		</div>
	);
}
