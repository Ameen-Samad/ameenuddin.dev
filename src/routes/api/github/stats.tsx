import { createFileRoute } from "@tanstack/react-router";
import { Octokit } from "octokit";

export const Route = createFileRoute("/api/github/stats")({
	server: {
		handlers: {
			GET: async () => {
				try {
					// Public repo - no auth needed for basic stats
					const octokit = new Octokit();

					const owner = "Ameen-Samad";
					const repo = "ameenuddin.dev";

					// Fetch repository info
					const { data: repoData } = await octokit.rest.repos.get({
						owner,
						repo,
					});

					// Get commit count from contributors API
					let totalCommits = 0;
					try {
						const { data: contributors } =
							await octokit.rest.repos.listContributors({
								owner,
								repo,
								per_page: 100,
							});

						totalCommits = contributors.reduce(
							(sum, contributor) => sum + contributor.contributions,
							0,
						);
					} catch {
						// Fallback: use a reasonable estimate
						totalCommits = 50;
					}

					return new Response(
						JSON.stringify({
							commits: totalCommits,
							stars: repoData.stargazers_count,
							forks: repoData.forks_count,
							lastUpdated: repoData.updated_at,
							url: repoData.html_url,
							name: repoData.full_name,
						}),
						{
							headers: { "Content-Type": "application/json" },
						},
					);
				} catch (error) {
					console.error("GitHub API Error:", error);

					// Return fallback data if API fails
					return new Response(
						JSON.stringify({
							commits: 50,
							stars: 0,
							forks: 0,
							lastUpdated: new Date().toISOString(),
							url: "https://github.com/Ameen-Samad/ameenuddin.dev",
							name: "Ameen-Samad/ameenuddin.dev",
							error: "Failed to fetch live data",
						}),
						{
							status: 200,
							headers: { "Content-Type": "application/json" },
						},
					);
				}
			},
		},
	},
});
