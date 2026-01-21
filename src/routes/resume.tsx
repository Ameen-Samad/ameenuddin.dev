import { createFileRoute } from "@tanstack/react-router";
import { allEducations, allJobs, allSkills } from "content-collections";
import { marked } from "marked";
import DownloadPDFButton from "@/components/DownloadPDFButton";
import ResumeAssistant from "@/components/ResumeAssistant";
import { Paper, Title, Divider, Stack } from "@mantine/core";

export const Route = createFileRoute("/resume")({
	component: App,
});

function App() {
	return (
		<>
			<ResumeAssistant />
			<div
				id="resume-content"
				className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100"
			>
				<div className="flex">
					{/* Main content */}
					<div className="flex-1 p-8 lg:p-12">
						<div className="max-w-4xl mx-auto space-y-12">
							<div className="text-center space-y-4">
								<h1 className="text-5xl font-bold bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
									My Resume
								</h1>
								<p className="text-gray-600 text-lg">
									Education, Experience & Skills
								</p>
								<div className="mt-6">
									<DownloadPDFButton />
								</div>
								<Divider className="mt-8" />
							</div>

							{/* Career Summary */}
							<Paper shadow="lg" p="xl" radius="md" className="bg-white/50 backdrop-blur-sm">
								<Stack gap="md">
									<Title order={2} className="text-2xl text-gray-900">
										Career Summary
									</Title>
									<p className="text-gray-700 leading-relaxed mb-4">
										<strong className="text-blue-600">Fast learner who builds to understand.</strong>{" "}
										I don't claim expertise—I show proof through working code. This portfolio contains{" "}
										<strong className="text-purple-600">15+ live demos</strong> and a git history of{" "}
										<strong className="text-green-600">30+ commits</strong> showing real problem-solving.
									</p>
									<p className="text-gray-700 leading-relaxed mb-4">
										Currently pursuing a Diploma in IT at Ngee Ann Polytechnic (Year 2), I learn by implementing:
										built 5 AI-powered demos (voice agent with WebSocket streaming, text-to-speech, image generation,
										chat, structured output), deployed to Cloudflare Workers with D1 database and KV cache, and
										integrated the complete TanStack ecosystem (Start, Router, Query, Table, Form, Pacer, Store).
									</p>
									<p className="text-gray-700 leading-relaxed mb-4">
										My git history tells the story: <code className="bg-gray-100 px-2 py-1 rounded text-sm">8581789:
										"Removed OpenAI, used fully Cloudflare Workers"</code> shows I migrated from external APIs
										to Workers AI for security and performance. Multiple "Fix X" commits show I iterate until
										it works.
									</p>
									<p className="text-gray-700 leading-relaxed">
										<strong className="text-blue-600">I learn fast, apply immediately, and prove it with deployments.</strong>
										{" "}
										<a
											href="/#demos"
											className="text-blue-600 hover:text-blue-800 underline font-medium"
										>
											See the demos →
										</a>
									</p>
								</Stack>
							</Paper>

							{/* Education */}
							<section className="space-y-6">
								<h2 className="text-3xl font-semibold text-gray-900">
									Education
								</h2>
								<div className="space-y-6">
									{allEducations.map((education) => (
										<Paper
											key={education.school}
											shadow="md" p="lg" radius="md" className="hover:shadow-lg transition-shadow"
										>
											<div className="space-y-3">
												<Title order={3} className="text-xl text-gray-900">
													{education.school}
												</Title>
												<p className="text-gray-700 leading-relaxed">
													{education.summary}
												</p>
												{education.content && (
													<div
														className="mt-3 text-gray-700 prose prose-sm max-w-none"
														dangerouslySetInnerHTML={{
															__html: marked(education.content),
														}}
													/>
												)}
											</div>
										</Paper>
									))}
								</div>
							</section>

							{/* Work Experience */}
							<section className="space-y-6">
								<h2 className="text-3xl font-semibold text-gray-900">
									Work Experience
								</h2>
								<div className="space-y-6">
									{allJobs.map((job) => (
										<Paper
											key={job.jobTitle}
											shadow="md" p="lg" radius="md" className="hover:shadow-lg transition-shadow"
										>
											<div className="space-y-2">
												<Title order={3} className="text-xl text-gray-900">
													{job.jobTitle}
												</Title>
												<p className="text-lg text-gray-700">
													{job.company}
												</p>
												<div className="flex flex-wrap gap-x-2 items-center text-sm text-gray-500">
													<span>{job.location}</span>
													<span>·</span>
													<span>{job.startDate}{job.endDate && ` — ${job.endDate}`}</span>
												</div>
											</div>
											<div>
												<p className="text-gray-700 leading-relaxed mb-4">
													{job.summary}
												</p>
												{job.content && (
													<div
														className="text-gray-700 prose prose-sm max-w-none"
														dangerouslySetInnerHTML={{
															__html: marked(job.content),
														}}
													/>
												)}
												{job.tags && job.tags.length > 0 && (
													<div className="flex flex-wrap gap-2 mt-4">
														{job.tags.map((tag) => (
															<span
																key={tag}
																className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
															>
																{tag}
															</span>
														))}
													</div>
												)}
											</div>
										</Paper>
									))}
								</div>
							</section>

							{/* Skills */}
							<section className="space-y-6">
								<h2 className="text-3xl font-semibold text-gray-900">
									Skills & Expertise
								</h2>
								<div className="space-y-6">
									{allSkills.map((skill) => (
										<Paper
											key={skill.name}
											shadow="md" p="lg" radius="md" className="hover:shadow-lg transition-shadow"
										>
											<div className="space-y-3">
												<Title order={3} className="text-xl text-gray-900">
													{skill.name}
												</Title>
												<p className="text-gray-700 leading-relaxed">
													{skill.summary}
												</p>
												{skill.content && (
													<div
														className="text-gray-700 prose prose-sm max-w-none"
														dangerouslySetInnerHTML={{
															__html: marked(skill.content),
														}}
													/>
												)}
												{skill.tags && skill.tags.length > 0 && (
													<div className="flex flex-wrap gap-2 mt-4">
														{skill.tags.map((tag) => (
															<span
																key={tag}
																className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full"
															>
																{tag}
															</span>
														))}
													</div>
												)}
											</div>
										</Paper>
									))}
								</div>
							</section>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
