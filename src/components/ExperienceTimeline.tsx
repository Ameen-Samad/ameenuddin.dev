import { useStore } from "@tanstack/react-store";
import {
	type ColumnDef,
	getCoreRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	type SortingState,
} from "@tanstack/react-table";
import { Store } from "@tanstack/store";
import { motion } from "framer-motion";
import { useEffect, useMemo } from "react";
import { type Experience, experiences } from "@/lib/experience-data";
import { ExperienceCard } from "./ExperienceCard";
import { ExperienceFilter } from "./ExperienceFilter";
import { ExperienceStats } from "./ExperienceStats";

interface ExperienceTimelineProps {
	experiences?: Experience[];
	initialFilter?: string;
	initialSort?: string;
	showStats?: boolean;
	enableFilter?: boolean;
	enableSort?: boolean;
	className?: string;
}

interface ExperienceState {
	filter: string;
	expandedCard: string | null;
	sorting: SortingState;
}

export const experienceStore = new Store<ExperienceState>({
	filter: "all",
	expandedCard: null,
	sorting: [],
});

export const ExperienceTimeline = ({
	experiences: customExperiences,
	initialFilter = "all",
	// initialSort = 'date', // TODO: Implement sorting
	showStats = true,
	enableFilter = true,
	// enableSort = true, // TODO: Implement sorting
	className = "",
}: ExperienceTimelineProps) => {
	const filter = useStore(experienceStore, (state) => state.filter);
	const expandedCard = useStore(experienceStore, (state) => state.expandedCard);
	const sorting = useStore(experienceStore, (state) => state.sorting);

	useEffect(() => {
		if (!filter || filter === "all") {
			experienceStore.setState((state) => ({
				...state,
				filter: initialFilter,
			}));
		}
	}, [initialFilter, filter]);

	const allExperiences = useMemo(
		() => customExperiences || experiences,
		[customExperiences],
	);

	const columns = useMemo<ColumnDef<Experience>[]>(
		() => [
			{
				accessorKey: "startDate",
				header: "Start Date",
			},
			{
				accessorKey: "category",
				header: "Category",
			},
			{
				accessorKey: "isCurrent",
				header: "Current",
			},
		],
		[],
	);

	const _table = useReactTable({
		data: allExperiences,
		columns,
		state: {
			sorting,
			globalFilter: filter,
		},
		onSortingChange: (updater) => {
			experienceStore.setState((state) => ({
				...state,
				sorting:
					typeof updater === "function" ? updater(state.sorting) : updater,
			}));
		},
		onGlobalFilterChange: (updater) => {
			experienceStore.setState((state) => ({
				...state,
				filter: typeof updater === "function" ? updater(state.filter) : updater,
			}));
		},
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		initialState: {
			globalFilter: initialFilter,
		},
	});

	const filteredExperiences = useMemo(() => {
		if (filter === "current") {
			return allExperiences.filter((exp) => exp.isCurrent);
		}

		if (filter !== "all") {
			return allExperiences.filter((exp) => exp.category === filter);
		}

		return allExperiences.sort(
			(a, b) =>
				new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
		);
	}, [filter, allExperiences]);

	const toggleCard = (id: string) => {
		experienceStore.setState((state) => ({
			...state,
			expandedCard: state.expandedCard === id ? null : id,
		}));
	};

	return (
		<div className={`max-w-4xl mx-auto px-4 ${className}`}>
			{/* Section Title */}
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="text-center mb-12"
			>
				<h2 className="text-4xl font-bold text-white mb-4">Work Experience</h2>
				<p className="text-lg text-slate-400 max-w-2xl mx-auto">
					My professional journey, achievements, and technical expertise
				</p>
			</motion.div>

			{/* Stats Section */}
			{showStats && <ExperienceStats layout="compact" />}

			{/* Filters */}
			{enableFilter && (
				<ExperienceFilter
					currentFilter={filter}
					onFilterChange={(newFilter) => {
						experienceStore.setState((state) => ({
							...state,
							filter: newFilter,
						}));
					}}
					experiences={allExperiences}
				/>
			)}

			{/* Timeline */}
			<div className="relative pl-12">
				{/* Timeline Line */}
				<motion.div
					initial={{ scaleY: 0 }}
					animate={{ scaleY: 1 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
					className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-blue-500/30 rounded-full"
				/>

				{/* Experience Cards */}
				<div className="space-y-6">
					{filteredExperiences.map((experience, index) => (
						<ExperienceCard
							key={experience.id}
							experience={experience}
							isExpanded={expandedCard === experience.id}
							onToggle={() => toggleCard(experience.id)}
							index={index}
						/>
					))}

					{filteredExperiences.length === 0 && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="text-center py-12"
						>
							<p className="text-slate-400 text-lg">
								No experiences found matching your filter.
							</p>
						</motion.div>
					)}
				</div>
			</div>
		</div>
	);
};
