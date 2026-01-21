import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";

import {
	displayName,
	fullName,
	isAdult,
	store,
	themeClass,
} from "@/lib/demo-store";

export const Route = createFileRoute("/demo/store")({
	component: DemoStore,
});

function FirstName() {
	const firstName = useStore(store, (state) => state.firstName);
	return (
		<div className="flex flex-col gap-2">
			<label className="text-sm font-medium">First Name</label>
			<input
				type="text"
				value={firstName}
				onChange={(e) =>
					store.setState((state) => ({ ...state, firstName: e.target.value }))
				}
				className="bg-white/10 rounded-lg px-4 py-2 outline-none border border-white/20 hover:border-white/40 focus:border-white/60 transition-colors duration-200 placeholder-white/40"
			/>
		</div>
	);
}

function LastName() {
	const lastName = useStore(store, (state) => state.lastName);
	return (
		<div className="flex flex-col gap-2">
			<label className="text-sm font-medium">Last Name</label>
			<input
				type="text"
				value={lastName}
				onChange={(e) =>
					store.setState((state) => ({ ...state, lastName: e.target.value }))
				}
				className="bg-white/10 rounded-lg px-4 py-2 outline-none border border-white/20 hover:border-white/40 focus:border-white/60 transition-colors duration-200 placeholder-white/40"
			/>
		</div>
	);
}

function Age() {
	const age = useStore(store, (state) => state.age);
	return (
		<div className="flex flex-col gap-2">
			<label className="text-sm font-medium">Age</label>
			<input
				type="number"
				value={age}
				onChange={(e) =>
					store.setState((state) => ({
						...state,
						age: parseInt(e.target.value) || 0,
					}))
				}
				className="bg-white/10 rounded-lg px-4 py-2 outline-none border border-white/20 hover:border-white/40 focus:border-white/60 transition-colors duration-200 placeholder-white/40"
			/>
		</div>
	);
}

function Email() {
	const email = useStore(store, (state) => state.email);
	return (
		<div className="flex flex-col gap-2">
			<label className="text-sm font-medium">Email</label>
			<input
				type="email"
				value={email}
				onChange={(e) =>
					store.setState((state) => ({ ...state, email: e.target.value }))
				}
				className="bg-white/10 rounded-lg px-4 py-2 outline-none border border-white/20 hover:border-white/40 focus:border-white/60 transition-colors duration-200 placeholder-white/40"
			/>
		</div>
	);
}

function ThemeToggle() {
	const theme = useStore(store, (state) => state.theme);
	return (
		<button
			onClick={() =>
				store.setState((state) => ({
					...state,
					theme: state.theme === "dark" ? "light" : "dark",
				}))
			}
			className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors font-medium"
		>
			{theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
		</button>
	);
}

function DerivedOutputs() {
	const fName = useStore(fullName);
	const adult = useStore(isAdult);
	const dName = useStore(displayName);
	return (
		<div className="space-y-3 bg-white/5 rounded-lg p-4">
			<div className="flex justify-between">
				<span className="text-white/70">Full Name:</span>
				<span className="font-medium">{fName}</span>
			</div>
			<div className="flex justify-between">
				<span className="text-white/70">Is Adult:</span>
				<span
					className={`font-medium ${adult ? "text-green-400" : "text-yellow-400"}`}
				>
					{adult ? "✓ Yes" : "✗ No"}
				</span>
			</div>
			<div className="flex justify-between">
				<span className="text-white/70">Display Name:</span>
				<span className="font-medium">{dName}</span>
			</div>
		</div>
	);
}

function DemoStore() {
	const theme = useStore(store, (state) => state.theme);
	const tClass = useStore(themeClass);

	return (
		<div
			className={`min-h-[calc(100vh-32px)] p-8 flex items-center justify-center w-full h-full transition-colors duration-300 ${tClass}`}
			style={{
				backgroundImage:
					theme === "dark"
						? "radial-gradient(50% 50% at 80% 80%, #f4a460 0%, #8b4513 70%, #1a0f0a 100%)"
						: "radial-gradient(50% 50% at 80% 80%, #ffd8a8 0%, #d4a574 70%, #8b5a2b 100%)",
			}}
		>
			<div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-lg flex flex-col gap-4 min-w-1/2">
				<div className="flex justify-between items-center mb-2">
					<h1 className="text-4xl font-bold">Advanced Store Demo</h1>
					<ThemeToggle />
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<FirstName />
					<LastName />
					<Age />
					<Email />
				</div>

				<DerivedOutputs />
			</div>
		</div>
	);
}
