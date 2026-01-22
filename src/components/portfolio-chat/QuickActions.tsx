/**
 * QuickActions Component
 *
 * Suggested questions to help users get started
 */

interface QuickActionsProps {
	onSelectQuestion: (question: string) => void
	isVisible: boolean
}

const SUGGESTED_QUESTIONS = [
	"What are Ameen's AI/ML projects?",
	"Show me full-stack development work",
	"What's Ameen's experience with React?",
	"Tell me about work at Replikate Labs",
]

export function QuickActions({ onSelectQuestion, isVisible }: QuickActionsProps) {
	if (!isVisible) return null

	return (
		<div className="flex gap-2 mb-4 flex-wrap">
			{SUGGESTED_QUESTIONS.map((question) => (
				<button
					key={question}
					onClick={() => onSelectQuestion(question)}
					className="px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors border border-gray-700 hover:border-emerald-500/50"
				>
					{question}
				</button>
			))}
		</div>
	)
}
