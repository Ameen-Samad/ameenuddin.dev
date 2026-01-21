export interface NavItem {
	id: string;
	label: string;
	icon?: React.ReactNode;
	path?: string;
	external?: boolean;
	children?: NavItem[];
	action?: () => void;
}

export const navItems: NavItem[] = [
	{
		id: 'home',
		label: 'Home',
		icon: 'Home',
		path: '/',
	},
	{
		id: 'projects',
		label: 'Projects',
		icon: 'Folder',
		path: '/#projects',
	},
	{
		id: 'tetris',
		label: 'Tetris',
		icon: 'Robot',
		path: '/tetris',
	},
	{
		id: 'chatbot',
		label: 'Chatbot',
		icon: 'Robot',
		path: '/chatbot',
	},
	{
		id: 'builder',
		label: '3D Builder',
		icon: 'Cube',
		path: '/builder',
	},
	{
		id: 'skills',
		label: 'Skills',
		icon: 'Code',
		path: '/#skills',
		children: [
			{
				id: 'resume',
				label: 'Resume',
				icon: 'Download',
				path: '/#resume',
				children: [
					{
						id: 'experience',
						label: 'Experience',
						icon: 'Briefcase',
						path: '/#experience',
					},
					{
						id: 'download-cv',
						label: 'Download CV',
						icon: 'Download',
						path: '/#',
						children: [
							{
								id: 'resume',
								label: 'Resume',
								icon: 'Download',
								path: '/index-resume',
							},
							{
								id: 'download-cv',
								label: 'Download CV',
								icon: 'Download',
								path: '/#',
							},
						],
					},
				],
			},
		],
	},
];

export const socialLinks: SocialLink[] = [
	{
		id: 'linkedin',
		label: 'LinkedIn',
		icon: 'BrandLinkedin',
		url: 'https://www.linkedin.com/in/ameenuddin-bin-abdul-samad/',
	},
];
