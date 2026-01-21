import { createFileRoute } from "@tanstack/react-router";
import allEducations from "content-collections";
import { marked } from "marked";
import ResumeAssistant from "@/components/ResumeAssistant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/index-resume")({
	component: App,
});

function App() {
	return (
		<>
			<ResumeAssistant />
			<div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100">
				<div className="flex">
					{/* Main content */}
					<div className="flex-1 p-8 lg:p-12">
						<div className="max-w-4xl mx-auto space-y-12">
							<div className="text-center space-y-4">
								<h1 className="text-5xl font-bold bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
									My Resume
								</h1>
								<p className="text-gray-600 text-lg">Education</p>
								<Separator className="mt-8" />
							</div>

							{/* Career Summary */}
							<Card className="border-0 shadow-lg bg-white/50 backdrop-blur-sm">
								<CardHeader>
									<CardTitle className="text-2xl text-gray-900">
										Career Summary
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-gray-700 leading-relaxed mb-4">
										<strong className="text-blue-600">
											AI-Native Software Engineer
										</strong>{" "}
										who leverages Claude Code with the latest plugins and MCPs
										(Model Context Protocols) to deliver{" "}
										<strong className="text-purple-600">
											100x productivity
										</strong>
										.
									</p>
									<p className="text-gray-700 leading-relaxed mb-4">
										Building production-ready applications with Python,
										JavaScript, and TypeScript while pursuing a Diploma in IT at
										Ngee Ann Polytechnic (Year 2). I don't just use AI tools—I
										<strong className="text-green-600">master them</strong> to
										maximize efficiency without sacrificing code quality or
										testing standards.
									</p>
									<p className="text-gray-700 leading-relaxed">
										In a competitive job market, I offer the{" "}
										<strong className="text-blue-600">unique advantage</strong>{" "}
										of combining strong engineering fundamentals with
										cutting-edge AI development workflows to ship features
										faster, solve problems more creatively, and deliver
										exceptional results.
									</p>
								</CardContent>
							</Card>

							{/* Education */}
							<section className="space-y-6">
								<h2 className="text-3xl font-semibold text-gray-900">
									Education
								</h2>
								<div className="space-y-6">
									{allEducations.map((education) => (
										<Card
											key={education.school}
											className="border-0 shadow-md hover:shadow-lg transition-shadow"
										>
											<CardHeader>
												<CardTitle className="text-xl text-gray-900">
													{education.school}
												</CardTitle>
											</CardHeader>
											<CardContent>
												<p className="text-gray-700 leading-relaxed">
													{education.summary}
												</p>
												{education.content && (
													<div
														className="mt-6 text-gray-700 prose prose-sm max-w-none"
														dangerouslySetInnerHTML={{
															__html: marked(education.content),
														}}
													/>
												)}
											</CardContent>
										</Card>
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
