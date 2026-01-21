import type { RankingInfo } from "@tanstack/match-sorter-utils";
import { rankItem } from "@tanstack/match-sorter-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	createColumnHelper,
	type FilterFn,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useRef, useState } from "react";

export const Route = createFileRoute("/demo/tanstack-query")({
	component: TanStackQueryDemo,
});

declare module "@tanstack/react-table" {
	interface FilterFns {
		fuzzy: FilterFn<unknown>;
	}
	interface FilterMeta {
		itemRank: RankingInfo;
	}
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
	const itemRank = rankItem(row.getValue(columnId), value);
	addMeta({ itemRank });
	return itemRank.passed;
};

type Todo = {
	id: number;
	name: string;
};

function TanStackQueryDemo() {
	const queryClient = useQueryClient();
	const { data, refetch } = useQuery<Todo[]>({
		queryKey: ["todos"],
		queryFn: () => fetch("/demo/api/tq-todos").then((res) => res.json()),
		initialData: [],
	});

	const { mutate: addTodo } = useMutation({
		mutationFn: (todo: string) =>
			fetch("/demo/api/tq-todos", {
				method: "POST",
				body: JSON.stringify(todo),
			}).then((res) => res.json()),
		onMutate: async (newTodoName) => {
			await queryClient.cancelQueries({ queryKey: ["todos"] });
			const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]);
			const newTodo = {
				id: (previousTodos?.length || 0) + 1,
				name: newTodoName,
			};
			queryClient.setQueryData<Todo[]>(["todos"], (old) => [
				...(old || []),
				newTodo,
			]);
			return { previousTodos };
		},
		onError: (_err, _newTodoName, context) => {
			if (context?.previousTodos) {
				queryClient.setQueryData(["todos"], context.previousTodos);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["todos"] });
		},
	});

	const { mutate: deleteTodo } = useMutation({
		mutationFn: (id: number) =>
			fetch("/demo/api/tq-todos", {
				method: "DELETE",
				body: JSON.stringify({ id }),
			}).then((res) => res.json()),
		onMutate: async (id) => {
			await queryClient.cancelQueries({ queryKey: ["todos"] });
			const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]);
			queryClient.setQueryData<Todo[]>(["todos"], (old) =>
				old?.filter((todo) => todo.id !== id),
			);
			return { previousTodos };
		},
		onError: (_err, _id, context) => {
			if (context?.previousTodos) {
				queryClient.setQueryData(["todos"], context.previousTodos);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["todos"] });
		},
	});

	const { mutate: updateTodo } = useMutation({
		mutationFn: ({ id, name }: { id: number; name: string }) =>
			fetch("/demo/api/tq-todos", {
				method: "PUT",
				body: JSON.stringify({ id, name }),
			}).then((res) => res.json()),
		onMutate: async ({ id, name }) => {
			await queryClient.cancelQueries({ queryKey: ["todos"] });
			const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]);
			queryClient.setQueryData<Todo[]>(["todos"], (old) =>
				old?.map((todo) => (todo.id === id ? { ...todo, name } : todo)),
			);
			return { previousTodos };
		},
		onError: (_err, _variables, context) => {
			if (context?.previousTodos) {
				queryClient.setQueryData(["todos"], context.previousTodos);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["todos"] });
		},
	});

	const { mutate: generateBulkTodos } = useMutation({
		mutationFn: (count: number) =>
			fetch("/demo/api/tq-todos", {
				method: "POST",
				body: JSON.stringify({ count }),
			}).then((res) => res.json()),
		onSuccess: () => refetch(),
	});

	const [todo, setTodo] = useState("");
	const [editingId, setEditingId] = useState<number | null>(null);
	const [editingName, setEditingName] = useState("");
	const [sorting, setSorting] = useState<SortingState>([]);
	const parentRef = useRef<HTMLDivElement>(null);

	const submitTodo = useCallback(async () => {
		await addTodo(todo);
		setTodo("");
	}, [addTodo, todo]);

	const handleEdit = (id: number, name: string) => {
		setEditingId(id);
		setEditingName(name);
	};

	const handleSaveEdit = async () => {
		if (editingId !== null) {
			await updateTodo({ id: editingId, name: editingName });
			setEditingId(null);
			setEditingName("");
		}
	};

	const handleCancelEdit = () => {
		setEditingId(null);
		setEditingName("");
	};

	const handleDelete = async (id: number) => {
		await deleteTodo(id);
	};

	const columnHelper = createColumnHelper<Todo>();

	const columns = [
		columnHelper.accessor("id", {
			header: "ID",
			size: 80,
		}),
		columnHelper.accessor("name", {
			header: "Todo",
			cell: (info) => {
				const row = info.row.original;
				if (editingId === row.id) {
					return (
						<input
							type="text"
							value={editingName}
							onChange={(e) => setEditingName(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") handleSaveEdit();
								if (e.key === "Escape") handleCancelEdit();
							}}
							className="w-full px-2 py-1 bg-white/20 text-white rounded border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
						/>
					);
				}
				return info.getValue();
			},
		}),
		columnHelper.display({
			id: "actions",
			cell: (info) => {
				const row = info.row.original;
				return (
					<div className="flex gap-2">
						{editingId === row.id ? (
							<>
								<button
									type="button"
									onClick={handleSaveEdit}
									className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded transition-colors"
								>
									Save
								</button>
								<button
									type="button"
									onClick={handleCancelEdit}
									className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded transition-colors"
								>
									Cancel
								</button>
							</>
						) : (
							<>
								<button
									type="button"
									onClick={() => handleEdit(row.id, row.name)}
									className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
								>
									Edit
								</button>
								<button
									type="button"
									onClick={() => handleDelete(row.id)}
									className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors"
								>
									Delete
								</button>
							</>
						)}
					</div>
				);
			},
			size: 200,
		}),
	];

	const table = useReactTable({
		data,
		columns,
		filterFns: {
			fuzzy: fuzzyFilter,
		},
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		state: {
			sorting,
		},
		onSortingChange: setSorting,
	});

	const rowVirtualizer = useVirtualizer({
		count: table.getRowModel().rows.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 60,
		overscan: 10,
	});

	const virtualRows = rowVirtualizer.getVirtualItems();
	const totalSize = rowVirtualizer.getTotalSize();

	return (
		<div
			className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-black p-4 text-white"
			style={{
				backgroundImage:
					"radial-gradient(50% 50% at 80% 20%, #3B021F 0%, #7B1028 60%, #1A000A 100%)",
			}}
		>
			<div className="w-full max-w-4xl p-8 rounded-xl backdrop-blur-md bg-black/50 shadow-xl border-8 border-black/10">
				<div className="mb-4">
					<h1 className="text-2xl mb-2">TanStack Query Todos list</h1>
					<p className="text-white/60 text-sm mb-4">
						Powered by TanStack Table with Virtualization &bull;{" "}
						{data?.length || 0} todos
					</p>
				</div>

				<div className="flex flex-col gap-2 mb-4">
					<input
						type="text"
						value={todo}
						onChange={(e) => setTodo(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								submitTodo();
							}
						}}
						placeholder="Enter a new todo..."
						className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
					/>
					<div className="flex gap-2">
						<button
							type="button"
							disabled={todo.trim().length === 0}
							onClick={submitTodo}
							className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
						>
							Add todo
						</button>
						<button
							type="button"
							onClick={() => generateBulkTodos(100)}
							className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
						>
							Generate 100 todos
						</button>
					</div>
				</div>

				<div
					ref={parentRef}
					className="border border-white/20 rounded-lg overflow-auto bg-white/5"
					style={{ height: "500px" }}
				>
					<div
						style={{
							height: `${totalSize}px`,
							width: "100%",
							position: "relative",
						}}
					>
						<table className="w-full text-left">
							<thead className="bg-white/10 sticky top-0 z-10">
								{table.getHeaderGroups().map((headerGroup) => (
									<tr key={headerGroup.id}>
										{headerGroup.headers.map((header) => (
											<th
												key={header.id}
												className="px-4 py-3 text-sm font-medium text-white/90 border-b border-white/10"
												style={{ width: header.getSize() }}
												onClick={header.column.getToggleSortingHandler()}
											>
												{header.isPlaceholder
													? null
													: flexRender(
															header.column.columnDef.header,
															header.getContext(),
														)}
												{{
													asc: " ↑",
													desc: " ↓",
												}[header.column.getIsSorted() as string] ?? null}
											</th>
										))}
									</tr>
								))}
							</thead>
							<tbody>
								{virtualRows.map((virtualRow) => {
									const row = table.getRowModel().rows[virtualRow.index];
									return (
										<tr
											key={row.id}
											className="hover:bg-white/10 border-b border-white/5"
											style={{
												position: "absolute",
												top: 0,
												left: 0,
												width: "100%",
												height: `${virtualRow.size}px`,
												transform: `translateY(${virtualRow.start}px)`,
											}}
										>
											{row.getVisibleCells().map((cell) => (
												<td
													key={cell.id}
													className="px-4 py-3 text-sm text-white/90"
													style={{ width: cell.column.getSize() }}
												>
													{flexRender(
														cell.column.columnDef.cell,
														cell.getContext(),
													)}
												</td>
											))}
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>

				{data?.length === 0 && (
					<div className="text-center py-8 text-white/60">
						No todos yet. Add one above or generate 100 random todos!
					</div>
				)}
			</div>
		</div>
	);
}
