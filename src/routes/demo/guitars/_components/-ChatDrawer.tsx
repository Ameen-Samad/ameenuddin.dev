import { GuitarChat } from "./-GuitarChat";

interface ChatDrawerProps {
	isOpen: boolean;
	onClose: () => void;
}

export function ChatDrawer({ isOpen, onClose }: ChatDrawerProps) {
	if (!isOpen) return null;

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
				onClick={onClose}
			/>

			{/* Mobile Drawer */}
			<div className="fixed right-0 top-0 h-full w-full max-w-md bg-gray-900 border-l border-gray-800 z-50 flex flex-col shadow-2xl lg:hidden">
				<GuitarChat onClose={onClose} />
			</div>

			{/* Desktop Sidebar (fixed position) */}
			<aside className="hidden lg:block fixed right-0 top-[73px] bottom-0 w-96 bg-gray-900/95 backdrop-blur-md border-l border-gray-800 z-10">
				<GuitarChat onClose={onClose} />
			</aside>
		</>
	);
}
