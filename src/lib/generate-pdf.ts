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

	// ATS-friendly header with complete contact information
	doc.setFontSize(20);
	doc.setFont("helvetica", "bold");
	doc.setTextColor(40, 40, 40);
	doc.text("AMEENUDDIN BIN SAMAD", pageWidth / 2, yPos, { align: "center" });
	yPos += 8;

	doc.setFontSize(12);
	doc.setFont("helvetica", "normal");
	doc.setTextColor(60, 60, 60);
	doc.text("AI-Native Software Engineer", pageWidth / 2, yPos, {
		align: "center",
	});
	yPos += 7;

	doc.setFontSize(10);
	doc.text(
		"Singapore | +65 9649 4212 | amenddin@gmail.com",
		pageWidth / 2,
		yPos,
		{ align: "center" },
	);
	yPos += 6;

	doc.text(
		"linkedin.com/in/ameenuddin-bin-abdul-samad-6b33722a0 | github.com/Ameen-Samad",
		pageWidth / 2,
		yPos,
		{ align: "center" },
	);
	yPos += 15;

	doc.setDrawColor(51, 51, 51);
	doc.setFillColor(245, 245, 247);
	doc.rect(margin, yPos, pageWidth - margin * 2, 0.5, "FD");
	yPos += 10;

	// Professional Summary Section
	doc.setFontSize(14);
	doc.setFont("helvetica", "bold");
	doc.setTextColor(40, 40, 40);
	doc.text("PROFESSIONAL SUMMARY", margin, yPos);
	yPos += 8;

	doc.setFont("helvetica", "normal");
	doc.setFontSize(10);
	doc.setTextColor(60, 60, 60);

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
	summaryLines.forEach((line: string) => {
		doc.text(line, margin, yPos);
		yPos += 6;
	});

	yPos += 10;

	doc.setFontSize(14);
	doc.setFont("helvetica", "bold");
	doc.setTextColor(40, 40, 40);
	doc.text("TECHNICAL SKILLS", margin, yPos);
	yPos += 10;

	// ATS-friendly skills in grid format with clear categories
	const techSkills = [
		{
			category: "Languages",
			items: ["Python", "JavaScript", "TypeScript", "SQL"],
		},
		{
			category: "Frameworks",
			items: ["React", "TanStack", "Three.js", "Mantine", "Phaser.js"],
		},
		{
			category: "AI & Tools",
			items: ["Claude Code", "MCPs", "Cursor", "Vite", "LLM Integration"],
		},
		{
			category: "Cloud Platforms",
			items: [
				"Cloudflare Workers",
				"Cloudflare Pages",
				"Cloudflare D1",
				"Netlify",
			],
		},
		{ category: "Databases", items: ["SQLite", "PostgreSQL", "MySQL", "D1"] },
		{
			category: "Dev Tools",
			items: ["Git", "Docker", "REST APIs", "GraphQL", "WebSocket"],
		},
	];

	techSkills.forEach((skillGroup) => {
		doc.setFontSize(11);
		doc.setFont("helvetica", "bold");
		doc.setTextColor(40, 40, 40);
		doc.text(`${skillGroup.category}:`, margin, yPos);

		doc.setFont("helvetica", "normal");
		doc.setFontSize(10);
		doc.setTextColor(60, 60, 60);

		// Create grid layout - 2 columns
		const itemsPerRow = 2;
		const colWidth = contentWidth / itemsPerRow;
		let currentCol = 0;
		let currentRow = 0;

		skillGroup.items.forEach((item, index) => {
			const xPos = margin + currentCol * colWidth;
			const itemYPos = yPos + 6 + currentRow * 6;

			doc.text(`• ${item}`, xPos + 10, itemYPos);

			currentCol++;
			if (currentCol >= itemsPerRow) {
				currentCol = 0;
				currentRow++;
			}
		});

		// Move to next skill group
		const rowsUsed = Math.ceil(skillGroup.items.length / itemsPerRow);
		yPos += 6 + rowsUsed * 6 + 4;
	});

	if (yPos > pageHeight - 50) {
		doc.addPage();
		yPos = 20;
	}

	yPos += 15;

	doc.setFontSize(14);
	doc.setFont("helvetica", "bold");
	doc.setTextColor(40, 40, 40);
	doc.text("PROFESSIONAL EXPERIENCE", margin, yPos);
	yPos += 10;

	jobs.forEach((job: Job, index: number) => {
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
		jobSummaryLines.forEach((line: string) => {
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

		job.tags.forEach((tag: string) => {
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
		contentLines.forEach((line: string) => {
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
	doc.setFont("helvetica", "bold");
	doc.setTextColor(40, 40, 40);
	doc.text("EDUCATION", margin, yPos);
	yPos += 10;

	educations.forEach((edu: Education) => {
		doc.setFontSize(12);
		doc.setTextColor(40, 40, 40);
		doc.text(edu.school, margin, yPos);
		yPos += 8;

		doc.setFontSize(10);
		doc.setFont("helvetica", "bold");
		doc.setTextColor(60, 60, 60);
		doc.text(edu.summary, margin, yPos);
		yPos += 10;

		const duration =
			edu.endDate && edu.endDate !== "Present"
				? `${edu.startDate} – ${edu.endDate}`
				: `${edu.startDate} – Present`;

		doc.setFont("helvetica", "normal");
		doc.text(duration, margin + contentWidth / 2, yPos);
		yPos += 10;

		edu.tags.forEach((tag: string) => {
			doc.setFontSize(9);
			doc.setFont("helvetica", "italic");
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
		contentLines.forEach((line: string) => {
			doc.setFontSize(10);
			doc.setFont("helvetica", "normal");
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
	doc.setFont("helvetica", "bold");
	doc.setTextColor(40, 40, 40);
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
		doc.setFont("helvetica", "bold");
		doc.text(project.name, margin, yPos);
		yPos += 8;

		doc.setFontSize(10);
		doc.setFont("helvetica", "normal");
		doc.setTextColor(60, 60, 60);
		const descLines = doc.splitTextToSize(
			project.description,
			contentWidth - 10,
			10,
		);
		descLines.forEach((line: string) => {
			doc.text(line, margin, yPos);
			yPos += 6;
		});

		yPos += 8;

		doc.setFontSize(9);
		project.tech.forEach((tech) => {
			doc.setFont("helvetica", "italic");
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

	const pdfOutput = doc.output("blob");
	return pdfOutput;
}

export async function downloadResumePDF() {
	const pdfBlob = await generateResumePDF();
	const link = document.createElement("a");
	link.href = URL.createObjectURL(pdfBlob);
	link.download = "ameenuddin-resume.pdf";
	link.click();
}
