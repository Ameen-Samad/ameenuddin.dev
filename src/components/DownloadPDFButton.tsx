import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

interface DownloadPDFButtonProps {
	elementId?: string;
	filename?: string;
	className?: string;
}

export default function DownloadPDFButton({
	elementId = "resume-content",
	filename = "Ameenuddin-Resume.pdf",
	className = "",
}: DownloadPDFButtonProps) {
	const [isDownloading, setIsDownloading] = useState(false);

	const handleDownloadPDF = async () => {
		setIsDownloading(true);
		try {
			const element = document.getElementById(elementId);
			if (!element) {
				throw new Error("Resume content element not found");
			}

			const canvas = await html2canvas(element, {
				scale: 2,
				useCORS: true,
				logging: false,
				backgroundColor: "#ffffff",
			});

			const imgData = canvas.toDataURL("image/png");
			const pdf = new jsPDF("p", "mm", "a4");

			const pdfWidth = pdf.internal.pageSize.getWidth();
			const pdfHeight = pdf.internal.pageSize.getHeight();
			const imgWidth = canvas.width;
			const imgHeight = canvas.height;
			const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
			const imgX = (pdfWidth - imgWidth * ratio) / 2;
			const imgY = 0;

			let heightLeft = imgHeight * ratio;
			let position = 0;

			pdf.addImage(
				imgData,
				"PNG",
				imgX,
				position,
				imgWidth * ratio,
				imgHeight * ratio,
			);
			heightLeft -= pdfHeight;

			while (heightLeft > 0) {
				position = heightLeft - imgHeight * ratio;
				pdf.addPage();
				pdf.addImage(
					imgData,
					"PNG",
					imgX,
					position,
					imgWidth * ratio,
					imgHeight * ratio,
				);
				heightLeft -= pdfHeight;
			}

			pdf.save(filename);
		} catch (error) {
			console.error("Error generating PDF:", error);
			alert("Failed to generate PDF. Please try again.");
		} finally {
			setIsDownloading(false);
		}
	};

	return (
		<button
			onClick={handleDownloadPDF}
			disabled={isDownloading}
			className={`flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 ${className}`}
			type="button"
		>
			{isDownloading ? (
				<>
					<Loader2 className="w-5 h-5 animate-spin" />
					<span>Generating PDF...</span>
				</>
			) : (
				<>
					<Download className="w-5 h-5" />
					<span>Download Resume</span>
				</>
			)}
		</button>
	);
}
