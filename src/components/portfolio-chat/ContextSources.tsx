/**
 * ContextSources Component
 *
 * Displays RAG context sources - shows which documents were retrieved
 * to answer the user's question
 */

import { Sparkles } from 'lucide-react'

export interface ContextSource {
	id: string
	type: 'skill' | 'project' | 'experience'
	title: string
	score: number
}

interface ContextSourcesProps {
	sources: ContextSource[]
}

export function ContextSources({ sources }: ContextSourcesProps) {
	if (sources.length === 0) return null

	return (
		<div className="mt-3 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
			<div className="flex items-center gap-2 mb-2">
				<Sparkles className="w-4 h-4 text-cyan-400" />
				<span className="text-xs font-medium text-cyan-400">
					Sources Used ({sources.length})
				</span>
			</div>
			<div className="space-y-1">
				{sources.map((ctx, idx) => (
					<div key={idx} className="text-xs text-gray-300">
						<span className="font-medium">{ctx.title}</span>
						<span className="text-gray-500 ml-2">
							({ctx.type}, {(ctx.score * 100).toFixed(0)}% match)
						</span>
					</div>
				))}
			</div>
		</div>
	)
}
