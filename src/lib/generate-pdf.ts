import { allEducations, allJobs } from "content-collections";
import jsPDF from "jspdf";

export interface Education {
	school: string;
	summary: string;
	startDate: string;
	endDate?: string;
	tags: string[];
	content: string;
}

export interface Job {
	jobTitle: string;
	company: string;
	location: string;
	startDate: string;
	endDate?: string;
	summary: string;
	tags: string[];
	content: string;
}

export async function generateResumePDF(): Promise<Blob> {
	const doc = new jsPDF();
	let yPos = 20;
	const pageWidth = 210;
	const pageHeight = 297;
	const margin = 20;
	const contentWidth = pageWidth - margin * 2;

	const educations = allEducations;
	const jobs = allJobs;

	doc.setFontSize(16);
	doc.setTextColor(40, 40, 40);
	doc.text("Ameenuddin Bin Samad", pageWidth / 2, yPos);
	yPos += 10;

	doc.setFontSize(12);
	doc.setTextColor(60, 60, 60);
	doc.text("AI-Native Software Engineer", margin, yPos);
	doc.text("ameenuddin.dev | Singapore", margin + contentWidth / 2, yPos);
	yPos += 20;

	doc.setDrawColor(51, 51, 51);
	doc.setFillColor(245, 245, 247);
	doc.rect(margin, yPos, pageWidth - margin * 2, 0.5, "FD");
	yPos += 8;

	doc.setDrawColor(0, 0, 0);
	doc.setFontSize(12);
	doc.setTextColor(80, 80, 80);

	const summary =
		"AI-Native Software Engineer who leverages Claude Code with latest " +
		"plugins and MCPs (Model Context Protocols) to deliver 100x " +
		"productivity. Building production-ready applications with Python, " +
		"JavaScript, and TypeScript while pursuing a Diploma in IT at " +
		"Ngee Ann Polytechnic (Year 2). I don't just use AI tools—I " +
		"master them to maximize efficiency without sacrificing code quality or " +
		"testing standards. In a competitive job market, I offer unique " +
		"advantage of combining strong engineering fundamentals with " +
		"cutting-edge AI development workflows to ship features faster, " +
		"solve problems more creatively, and deliver exceptional results.";

	const summaryLines = doc.splitTextToSize(summary, contentWidth - 10, 10);
	summaryLines.forEach((line) => {
		doc.text(line, margin, yPos);
		yPos += 6;
	});

	yPos += 10;

	doc.setFontSize(14);
	doc.setTextColor(80, 80, 80);
	doc.text("SKILLS", margin, yPos);
	yPos += 10;

	const skills = new Set<string>();

	educations.forEach((edu) => {
		edu.tags.forEach((tag) => skills.add(tag));
	});

	jobs.forEach((job) => {
		job.tags.forEach((tag) => skills.add(tag));
	});

	const skillsArray = Array.from(skills).sort();

	skillsArray.forEach((skill) => {
		doc.setFontSize(10);
		doc.setTextColor(60, 60, 60);
		doc.text(`• ${skill}`, margin, yPos);
		yPos += 7;
	});

	if (yPos > pageHeight - 50) {
		doc.addPage();
		yPos = 20;
	}

	yPos += 15;

	doc.setFontSize(14);
	doc.setTextColor(80, 80, 80);
	doc.text("TECHNICAL SKILLS", margin, yPos);
	yPos += 10;

	const techSkills = [
		"Languages: Python, JavaScript, TypeScript, SQL",
		"Frameworks: React, TanStack, Three.js, Mantine",
		"AI & Tools: Claude Code, MCPs, Cursor, Vite",
		"Platforms: Netlify, Cloudflare Pages, Cloudflare D1, Cloudflare Workers",
		"Databases: SQLite, PostgreSQL, MySQL",
		"Other: Git, Docker, REST APIs, GraphQL",
	];

	techSkills.forEach((skill) => {
		doc.setFontSize(10);
		doc.setTextColor(60, 60, 60);
		doc.text(`${skill}`, margin, yPos);
		yPos += 7;
	});

	if (yPos > pageHeight - 50) {
		doc.addPage();
		yPos = 20;
	}

	yPos += 15;

	doc.setFontSize(14);
	doc.setTextColor(80, 80, 80);
	doc.text("EXPERIENCE", margin, yPos);
	yPos += 10;

	jobs.forEach((job, index) => {
		doc.setFontSize(12);
		doc.setTextColor(40, 40, 40);
		doc.text(`${job.company}`, margin, yPos);
		doc.setFontSize(10);
		doc.setTextColor(60, 60, 60);
		doc.text(job.location, margin + contentWidth / 2, yPos);
		yPos += 10;

		doc.setFontSize(12);
		doc.setTextColor(80, 80, 80);
		doc.text(job.jobTitle, margin, yPos);
		yPos += 10;

		const jobSummaryLines = doc.splitTextToSize(
			job.summary,
			contentWidth - 10,
			10,
		);
		jobSummaryLines.forEach((line) => {
			doc.setFontSize(10);
			doc.setTextColor(60, 60, 60);
			doc.text(line, margin, yPos);
			yPos += 6;
		});

		yPos += 8;

		doc.setFontSize(10);
		doc.setTextColor(60, 60, 60);
		const duration =
			job.endDate && job.endDate !== "Present"
				? `${job.startDate} – ${job.endDate}`
				: `${job.startDate} – Present`;

		doc.text(duration, margin, yPos);
		yPos += 10;

		job.tags.forEach((tag) => {
			doc.setFontSize(9);
			doc.setTextColor(80, 80, 80);
			doc.text(tag, margin + 5, yPos);
			const tagWidth = doc.getTextWidth(tag);
			const nextX = margin + 5 + tagWidth + 10;

			if (nextX > pageWidth - margin) {
				yPos += 7;
				doc.text(tag, margin, yPos);
			}
		});

		yPos += 10;

		doc.setFontSize(10);
		doc.setTextColor(60, 60, 60);

		const contentLines = doc.splitTextToSize(
			job.content,
			contentWidth - 10,
			10,
		);
		contentLines.forEach((line) => {
			doc.text(line, margin, yPos);
			yPos += 6;
		});

		if (yPos > pageHeight - 40) {
			doc.addPage();
			yPos = 20;
		}

		yPos += 10;

		if (index < jobs.length - 1) {
			doc.setDrawColor(200, 200, 200);
			doc.setFillColor(245, 245, 247);
			doc.rect(margin, yPos - 5, pageWidth - margin * 2, 0.5, "FD");
			yPos += 3;
		}
	});

	if (yPos > pageHeight - 30) {
		doc.addPage();
		yPos = 20;
	}

	yPos += 15;

	doc.setFontSize(14);
	doc.setTextColor(80, 80, 80);
	doc.text("EDUCATION", margin, yPos);
	yPos += 10;

	educations.forEach((edu) => {
		doc.setFontSize(12);
		doc.setTextColor(40, 40, 40);
		doc.text(edu.school, margin, yPos);
		yPos += 8;

		doc.setFontSize(10);
		doc.setFont(undefined, "bold");
		doc.setTextColor(60, 60, 60);
		doc.text(edu.summary, margin, yPos);
		yPos += 10;

		const duration =
			edu.endDate && edu.endDate !== "Present"
				? `${edu.startDate} – ${edu.endDate}`
				: `${edu.startDate} – Present`;

		doc.setFont(undefined, "normal");
		doc.text(duration, margin + contentWidth / 2, yPos);
		yPos += 10;

		edu.tags.forEach((tag) => {
			doc.setFontSize(9);
			doc.setFont(undefined, "italic");
			doc.setTextColor(80, 80, 80);
			doc.text(tag, margin + 5, yPos);
			const tagWidth = doc.getTextWidth(tag);
			const nextX = margin + 5 + tagWidth + 10;

			if (nextX > pageWidth - margin) {
				yPos += 7;
				doc.text(tag, margin, yPos);
			}
		});

		yPos += 10;

		const contentLines = doc.splitTextToSize(
			edu.content,
			contentWidth - 10,
			10,
		);
		contentLines.forEach((line) => {
			doc.setFontSize(10);
			doc.setFont(undefined, "normal");
			doc.setTextColor(60, 60, 60);
			doc.text(line, margin, yPos);
			yPos += 6;
		});

		if (yPos > pageHeight - 30) {
			doc.addPage();
			yPos = 20;
		}

		yPos += 10;

		if (edu !== educations[educations.length - 1]) {
			doc.setDrawColor(200, 200, 200);
			doc.setFillColor(245, 245, 247);
			doc.rect(margin, yPos - 5, pageWidth - margin * 2, 0.5, "FD");
			yPos += 3;
		}
	});

	if (yPos > pageHeight - 30) {
		doc.addPage();
		yPos = 20;
	}

	yPos += 15;

	doc.setFontSize(14);
	doc.setTextColor(80, 80, 80);
	doc.text("PROJECTS", margin, yPos);
	yPos += 10;

	const projects = [
		{
			name: "Portfolio Website",
			tech: ["React", "TanStack", "Three.js", "Mantine"],
			description:
				"Professional portfolio with 3D interactive projects, showcasing skills in modern web technologies.",
		},
		{
			name: "AI Chatbot with RAG",
			tech: ["Python", "Claude Code", "REST APIs", "Cloudflare Workers"],
			description:
				"AI-powered chatbot using retrieval-augmented generation. Features real-time streaming, tool calling, and knowledge base integration.",
		},
		{
			name: "Tetris Game with AI Agent",
			tech: [
				"Phaser.js",
				"Reinforcement Learning",
				"Cloudflare D1",
				"TypeScript",
			],
			description:
				"Tetris game featuring AI auto-play using reinforcement learning. Includes leaderboard with history tracking and Cloudflare D1 database for scores.",
		},
		{
			name: "3D Builder with LLM",
			tech: ["Three.js", "LLM Integration", "AI APIs", "TypeScript"],
			description:
				"Interactive 3D scene generator that creates Three.js environments via natural language prompts. Supports various object types and configurations.",
		},
	];

	projects.forEach((project) => {
		doc.setFontSize(12);
		doc.setTextColor(40, 40, 40);
		doc.setFont(undefined, "bold");
		doc.text(project.name, margin, yPos);
		yPos += 8;

		doc.setFontSize(10);
		doc.setFont(undefined, "normal");
		doc.setTextColor(60, 60, 60);
		const descLines = doc.splitTextToSize(
			project.description,
			contentWidth - 10,
			10,
		);
		descLines.forEach((line) => {
			doc.text(line, margin, yPos);
			yPos += 6;
		});

		yPos += 8;

		doc.setFontSize(9);
		project.tech.forEach((tech) => {
			doc.setFont(undefined, "italic");
			doc.setTextColor(80, 80, 80);
			doc.text(tech, margin + 5, yPos);
			const techWidth = doc.getTextWidth(tech);
			const nextX = margin + 5 + techWidth + 8;

			if (nextX > pageWidth - margin) {
				yPos += 7;
				doc.text(tech, margin, yPos);
			}
		});

		if (yPos > pageHeight - 30) {
			doc.addPage();
			yPos = 20;
		}

		yPos += 10;

		if (project !== projects[projects.length - 1]) {
			doc.setDrawColor(200, 200, 200);
			doc.setFillColor(245, 245, 247);
			doc.rect(margin, yPos - 5, pageWidth - margin * 2, 0.5, "FD");
			yPos += 3;
		}
	});

	doc.save("ameenuddin-resume.pdf");

	const pdfOutput = doc.output("blob");
	return pdfOutput;
}

export function downloadResumePDF() {
	const link = document.createElement("a");
	link.href = URL.createObjectURL(
		new Blob([generateResumePDF()], { type: "application/pdf" }),
	);
	link.download = "ameenuddin-resume.pdf";
	link.click();
}
