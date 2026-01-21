import { Derived, Store } from "@tanstack/store";

export const store = new Store({
	firstName: "Jane",
	lastName: "Smith",
	age: 28,
	email: "jane.smith@example.com",
	theme: "dark",
});

export const fullName = new Derived({
	fn: () => `${store.state.firstName} ${store.state.lastName}`,
	deps: [store],
});

export const isAdult = new Derived({
	fn: () => store.state.age >= 18,
	deps: [store],
});

export const displayName = new Derived({
	fn: () =>
		isAdult.state ? `${fullName.state} (Adult)` : `${fullName.state} (Minor)`,
	deps: [fullName, isAdult],
});

export const themeClass = new Derived({
	fn: () =>
		store.state.theme === "dark"
			? "bg-slate-900 text-white"
			: "bg-white text-slate-900",
	deps: [store],
});

fullName.mount();
isAdult.mount();
displayName.mount();
themeClass.mount();
