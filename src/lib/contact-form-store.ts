import { Store } from "@tanstack/store";

export interface ContactFormData {
	name: string;
	email: string;
	subject: string;
	message: string;
}

export interface ContactErrors {
	name?: string;
	email?: string;
	subject?: string;
	message?: string;
}

export interface ContactTouched {
	name: boolean;
	email: boolean;
	subject: boolean;
	message: boolean;
}

export interface ContactFormState {
	formData: ContactFormData;
	errors: ContactErrors;
	touched: ContactTouched;
}

const initialFormData: ContactFormData = {
	name: "",
	email: "",
	subject: "general",
	message: "",
};

const initialTouched: ContactTouched = {
	name: false,
	email: false,
	subject: false,
	message: false,
};

export const contactFormStore = new Store<ContactFormState>({
	formData: initialFormData,
	errors: {},
	touched: initialTouched,
});

export const contactFormActions = {
	setFormData: (formData: Partial<ContactFormData>) => {
		contactFormStore.setState((state: ContactFormState) => ({
			...state,
			formData: { ...state.formData, ...formData },
		}));
	},

	setField: (field: keyof ContactFormData, value: string) => {
		contactFormStore.setState((state: ContactFormState) => ({
			...state,
			formData: { ...state.formData, [field]: value },
		}));
	},

	setError: (field: keyof ContactErrors, error?: string) => {
		contactFormStore.setState((state: ContactFormState) => ({
			...state,
			errors: { ...state.errors, [field]: error },
		}));
	},

	setErrors: (errors: ContactErrors) => {
		contactFormStore.setState((state: ContactFormState) => ({
			...state,
			errors: { ...errors },
		}));
	},

	setTouched: (field: keyof ContactTouched, value: boolean) => {
		contactFormStore.setState((state: ContactFormState) => ({
			...state,
			touched: { ...state.touched, [field]: value },
		}));
	},

	setAllTouched: (value: boolean) => {
		contactFormStore.setState((state: ContactFormState) => ({
			...state,
			touched: {
				name: value,
				email: value,
				subject: value,
				message: value,
			},
		}));
	},

	resetForm: () => {
		contactFormStore.setState(() => ({
			formData: { ...initialFormData },
			errors: {},
			touched: { ...initialTouched },
		}));
	},
};
