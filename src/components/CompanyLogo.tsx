import { motion } from "framer-motion";
import { Building2 } from "lucide-react";

interface CompanyLogoProps {
	logo?: string;
	company: string;
	size?: number;
}

export const CompanyLogo = ({ logo, company, size = 48 }: CompanyLogoProps) => {
	return (
		<motion.div
			className="flex items-center justify-center w-12 h-12 rounded-xl bg-white p-2 shadow-lg"
			whileHover={{ scale: 1.1, rotate: 3 }}
			transition={{ type: "spring", stiffness: 400, damping: 17 }}
		>
			{logo ? (
				<img
					src={logo}
					alt={`${company} logo`}
					className="w-full h-full object-contain"
					loading="lazy"
				/>
			) : (
				<Building2 size={size - 16} className="text-slate-700" />
			)}
		</motion.div>
	);
};
