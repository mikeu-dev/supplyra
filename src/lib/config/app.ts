export const APP_CONFIG = {
	app_name: {
		id: 'Supplyra Solutions',
		en: 'Supplyra Solutions'
	},
	address: {
		id: 'Jl. Contoh Alamat No. 123, Jakarta, Indonesia',
		en: 'Jl. Contoh Alamat No. 123, Jakarta, Indonesia'
	},
	phone: {
		id: '+6281 2345 6789',
		en: '+6281 2345 6789'
	},
	email: {
		id: 'office@supplyra.example.com',
		en: 'office@supplyra.example.com'
	},
	copyright: {
		id: '© 2025 Supplyra Solutions',
		en: '© 2025 Supplyra Solutions'
	},
	website: {
		id: 'https://supplyra.example.com/',
		en: 'https://supplyra.example.com/'
	},
	about: {
		id: `Supplyra Solutions adalah perusahaan teknologi informasi
yang berfokus pada penyediaan solusi bisnis digital yang inovatif.
Kami berdedikasi untuk membantu transformasi digital di berbagai sektor industri.`,
		en: `Supplyra Solutions is an information technology company
focused on providing innovative digital business solutions.
We are dedicated to supporting digital transformation across various industrial sectors.`
	}
};

// Helper to resolve dynamic company config
export function resolveCompanyConfig(
	defaultConfig: typeof APP_CONFIG,
	company: Record<string, string | null | undefined> | null
) {
	if (!company) return defaultConfig;

	return {
		...defaultConfig,
		app_name: {
			id: company.name,
			en: company.name
		},
		address: {
			id: company.address || defaultConfig.address.id,
			en: company.address || defaultConfig.address.en
		},
		phone: {
			id: company.phone || defaultConfig.phone.id,
			en: company.phone || defaultConfig.phone.en
		},
		email: {
			id: company.email || defaultConfig.email.id,
			en: company.email || defaultConfig.email.en
		},
		website: {
			id: company.website || defaultConfig.website.id,
			en: company.website || defaultConfig.website.en
		},
		// Keep other defaults or extend as needed
		copyright: {
			id: `© ${new Date().getFullYear()} ${company.name}`,
			en: `© ${new Date().getFullYear()} ${company.name}`
		},
		about: defaultConfig.about // Potentially override if company has about field
	};
}

export const services = {
	id: [
		{
			title: 'Pengembangan Web',
			description:
				'Website portofolio, sistem absensi, ERP, sistem keuangan, dan lainnya sesuai kebutuhan Anda.',
			image: '/undraw_web-developer_ggt0.svg'
		},
		{
			title: 'Pengembangan Mobile',
			description: 'Pengembangan aplikasi Android dan iOS untuk mendukung mobilitas bisnis Anda.',
			image: '/undraw_mobile-web_eqrb.svg'
		},
		{
			title: 'Jaringan Komputer',
			description:
				'Solusi jaringan komputer yang andal untuk meningkatkan efisiensi sistem bisnis Anda.',
			image: '/undraw_connected-world_anke.svg'
		},
		{
			title: 'Periklanan',
			description: 'Kampanye promosi digital dan konvensional yang tepat sasaran dan kreatif.',
			image: '/undraw_word-of-mouth_9ddm.svg'
		},
		{
			title: 'Penyelenggara Acara',
			description:
				'Kami menyediakan berbagai layanan berbasis teknologi untuk mendukung transformasi digital di berbagai sektor.',
			image: '/undraw_launch-event_aur1.svg'
		}
	],
	en: [
		{
			title: 'Web Development',
			description:
				'Portfolio websites, attendance systems, ERP, financial systems, and more tailored to your needs.',
			image: '/undraw_web-developer_ggt0.svg'
		},
		{
			title: 'Mobile Development',
			description: 'Android and iOS app development to support your business mobility.',
			image: '/undraw_mobile-web_eqrb.svg'
		},
		{
			title: 'Computer Network',
			description: 'Reliable computer network solutions to boost your business system efficiency.',
			image: '/undraw_connected-world_anke.svg'
		},
		{
			title: 'Advertising',
			description: 'Targeted and creative digital and conventional promotional campaigns.',
			image: '/undraw_word-of-mouth_9ddm.svg'
		},
		{
			title: 'Event Organizer',
			description:
				'We provide various technology-based services to support digital transformation across multiple sectors.',
			image: '/undraw_launch-event_aur1.svg'
		}
	]
};

export const teams = [
	{
		id: 'komisaris-utama',
		name: 'Alexander Smith',
		position: 'Chairman',
		image: 'https://ui-avatars.com/api/?name=Alexander+Smith',
		reportsTo: null,
		division: 'Board'
	},
	{
		id: 'komisaris',
		name: 'Emma Watson',
		position: 'Commissioner',
		image: 'https://ui-avatars.com/api/?name=Emma+Watson',
		reportsTo: 'komisaris-utama',
		division: 'Board'
	},
	{
		id: 'direktur',
		name: 'John Doe',
		position: 'Director',
		image: 'https://ui-avatars.com/api/?name=John+Doe',
		reportsTo: 'komisaris',
		division: 'Board'
	},
	{
		id: 'kepala-keuangan',
		name: 'Michael Brown',
		position: 'Finance Head',
		image: 'https://ui-avatars.com/api/?name=Michael+Brown',
		reportsTo: 'direktur',
		division: 'Finance'
	},
	{
		id: 'staff-keuangan',
		name: 'Sarah Miller',
		position: 'Finance Staff',
		image: 'https://ui-avatars.com/api/?name=Sarah+Miller',
		reportsTo: 'kepala-keuangan',
		division: 'Finance'
	},
	{
		id: 'kepala-devisi-hr',
		name: 'David Wilson',
		position: 'HR Head',
		image: 'https://ui-avatars.com/api/?name=David+Wilson',
		reportsTo: 'direktur',
		division: 'HR & Development'
	},
	{
		id: 'software-engineer',
		name: 'James Taylor',
		position: 'Software Engineer',
		image: 'https://ui-avatars.com/api/?name=James+Taylor',
		reportsTo: 'kepala-devisi-hr',
		division: 'HR & Development'
	},
	{
		id: 'web-developer-1',
		name: 'Robert Moore',
		position: 'Web Developer',
		image: 'https://ui-avatars.com/api/?name=Robert+Moore',
		reportsTo: 'kepala-devisi-hr',
		division: 'HR & Development'
	},
	{
		id: 'web-developer-2',
		name: 'Linda Anderson',
		position: 'Web Developer',
		image: 'https://ui-avatars.com/api/?name=Linda+Anderson',
		reportsTo: 'kepala-devisi-hr',
		division: 'HR & Development'
	},
	{
		id: 'web-developer-3',
		name: 'William Thomas',
		position: 'Web Developer',
		image: 'https://ui-avatars.com/api/?name=William+Thomas',
		reportsTo: 'kepala-devisi-hr',
		division: 'HR & Development'
	},
	{
		id: 'android-developer',
		name: 'Jennifer Jackson',
		position: 'Android Developer',
		image: 'https://ui-avatars.com/api/?name=Jennifer+Jackson',
		reportsTo: 'kepala-devisi-hr',
		division: 'HR & Development'
	},
	{
		id: 'kepala-pemasaran',
		name: 'Richard White',
		position: 'Marketing Head',
		image: 'https://ui-avatars.com/api/?name=Richard+White',
		reportsTo: 'direktur',
		division: 'Marketing & Operations'
	},
	{
		id: 'staff-operasional',
		name: 'Charles Harris',
		position: 'Operations Staff',
		image: 'https://ui-avatars.com/api/?name=Charles+Harris',
		reportsTo: 'kepala-pemasaran',
		division: 'Marketing & Operations'
	}
];
export const banks = [
	{ code: 'bri', name: 'Bank Rakyat Indonesia (BRI)' },
	{ code: 'mandiri', name: 'Bank Mandiri' },
	{ code: 'bni', name: 'Bank Negara Indonesia (BNI)' },
	{ code: 'bca', name: 'Bank Central Asia (BCA)' },
	{ code: 'bsm', name: 'Bank Syariah Indonesia (BSI)' },
	{ code: 'artos', name: 'Bank Jago' },
	{ code: 'sinarmas', name: 'Bank Sinarmas' },
	{ code: 'royal', name: 'Blu/BCA Digital' },
	{ code: 'cimb', name: 'CIMB Niaga' },
	{ code: 'citibank', name: 'Citibank' },
	{ code: 'muamalat', name: 'Bank Muamalat' },
	{ code: 'permata', name: 'Bank Permata' },
	{ code: 'uob', name: 'TMRW/UOB' },
	{ code: 'dana', name: 'Dana' },
	{ code: 'gopay', name: 'GoPay' },
	{ code: 'linkaja', name: 'LinkAja' },
	{ code: 'ovo', name: 'OVO' },
	{ code: 'shopeepay', name: 'ShopeePay' },
	{ code: 'bjb', name: 'Bank BJB' }
];

export const positions = [
	{ name: 'Komisaris Utama' },
	{ name: 'Komisaris' },
	{ name: 'Direktur' },
	{ name: 'Kepala Keuangan' },
	{ name: 'Staff Keuangan' },
	{ name: 'Kepala Devisi HR' },
	{ name: 'Software Engineer' },
	{ name: 'Web Developer' },
	{ name: 'Android Developer' },
	{ name: 'Staff Admin' },
	{ name: 'Kepala Pemasaran' },
	{ name: 'Staff Operasional' },
	{ name: 'Human Resource Manager' }, // Keep potentially used ones
	{ name: 'Chief Executive Officer' },
	{ name: 'Chief Technology Officer' },
	{ name: 'Chief Information Officer' },
	{ name: 'Finance Manager' },
	{ name: 'Marketing Executive' },
	{ name: 'UI/UX Designer' },
	{ name: 'Quality Assurance' },
	{ name: 'Network Engineer' }
];

export const religions = [
	{ name: 'Islam' },
	{ name: 'Kristen' },
	{ name: 'Katolik' },
	{ name: 'Hindu' },
	{ name: 'Buddha' },
	{ name: 'Konghucu' }
];

export const shifts = [{ name: 'Non Shift' }, { name: 'Part Time' }, { name: 'Internship' }];

export const stages = [
	{ name: 'Diploma Satu (D1)', code: 'D1' },
	{ name: 'Diploma Dua (D2)', code: 'D2' },
	{ name: 'Diploma Tiga (D3)', code: 'D3' },
	{ name: 'Diploma Empat (D4)', code: 'D4' },
	{ name: 'Strata Satu (S1)', code: 'S1' },
	{ name: 'Strata Dua (S2)', code: 'S2' },
	{ name: 'Strata Tiga (S3)', code: 'S3' },
	{ name: 'Sekolah Menengah Atas', code: 'SMA' },
	{ name: 'Sekolah Menengah Kejuruan', code: 'SMK' }
];

export const units = [
	{ name: 'Orang' },
	{ name: 'Unit' },
	{ name: 'Paket' },
	{ name: 'Pcs' },
	{ name: 'Meter' },
	{ name: 'Tahun' },
	{ name: 'Bulan' },
	{ name: 'Fitur' }
];

export const schools = [
	{ name: 'University of Technology Alpha', address: 'Main Campus, Jakarta' },
	{ name: 'Technical Institute Beta', address: 'Science Park, Bandung' },
	{ name: 'Vocational School 1', address: 'East Side, Semarang' },
	{ name: 'Vocational School 2', address: 'West Side, Surabaya' },
	{ name: 'Politeknik Negeri Gamma', address: 'North Coast, Indramayu' },
	{ name: 'Politeknik Negeri Delta', address: 'Hilltop, Subang' },
	{ name: 'Private College Kappa', address: 'City Center, Medan' },
	{ name: 'Regional University Sigma', address: 'South Bridge, Makassar' }
];

export const clients = [
	{ id: 1, name: 'Regency Council Alpha', logo: '/client/logo-placeholder.png' },
	{ id: 2, name: 'Regional HR Agency', logo: '/client/logo-placeholder.png' },
	{ id: 3, name: 'Health Department Beta', logo: '/client/logo-placeholder.png' },
	{ id: 4, name: 'Social Welfare Office', logo: '/client/logo-placeholder.png' },
	{ id: 5, name: 'Education Board Gamma', logo: '/client/logo-placeholder.png' },
	{ id: 6, name: 'Info & Tech Service', logo: '/client/logo-placeholder.png' },
	{ id: 7, name: 'Urban Planning Agency', logo: '/client/logo-placeholder.png' },
	{ id: 8, name: 'Investment Board', logo: '/client/logo-placeholder.png' },
	{ id: 9, name: 'Public Works Office', logo: '/client/logo-placeholder.png' },
	{ id: 10, name: 'Political Affairs Dept', logo: '/client/logo-placeholder.png' },
	{ id: 11, name: 'Strategic Industry Partner', logo: '/client/logo-placeholder.png' },
	{ id: 12, name: 'Disaster Management Agency', logo: '/client/logo-placeholder.png' },
	{ id: 13, name: 'Regional Housing Dept', logo: '/client/logo-placeholder.png' },
	{ id: 14, name: 'Manufacturing Co Ltd', logo: '/client/logo-placeholder.png' },
	{ id: 15, name: 'Regional Police Dept', logo: '/client/logo-placeholder.png' },
	{ id: 16, name: 'Secretariat General', logo: '/client/logo-placeholder.png' },
	{ id: 17, name: 'Inspectorate Office', logo: '/client/logo-placeholder.png' },
	{ id: 18, name: 'Financial Asset Agency', logo: '/client/logo-placeholder.png' },
	{ id: 19, name: 'Community Dev Dept', logo: '/client/logo-placeholder.png' },
	{ id: 20, name: 'SME Support Office', logo: '/client/logo-placeholder.png' },
	{ id: 21, name: 'Fishery & Livestock Dept', logo: '/client/logo-placeholder.png' },
	{ id: 22, name: 'Youth & Sport Dept', logo: '/client/logo-placeholder.png' },
	{ id: 23, name: 'Planning & Research Board', logo: '/client/logo-placeholder.png' },
	{ id: 24, name: 'Communication Dept Delta', logo: '/client/logo-placeholder.png' }
];

export const projects = [
	{
		id: 1,
		clientId: 13,
		tag: 'website',
		title: 'Health-Sync Portal',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 2,
		clientId: 7,
		tag: 'website',
		title: 'Urban Flow Manager',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 3,
		clientId: 8,
		tag: 'website',
		title: 'Investment Tracker',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 4,
		clientId: 7,
		tag: 'website',
		title: 'Housing Data Hub',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 5,
		clientId: 11,
		tag: 'server',
		title: 'Strategic SOC Deployment',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 6,
		clientId: 14,
		tag: 'server',
		title: 'Enterprise NAS Setup',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 7,
		clientId: 14,
		tag: 'qr code',
		title: 'Smart Label System',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 8,
		clientId: 5,
		tag: 'website',
		title: 'School Management Web',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 9,
		clientId: 1,
		tag: 'website',
		title: 'Legal Archive Portal',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 10,
		clientId: 8,
		tag: 'website',
		title: 'Public Queue Manager',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 11,
		clientId: 23,
		tag: 'website',
		title: 'Insights Dashboard',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 12,
		clientId: 23,
		tag: 'website',
		title: 'CSR Tracking Tool',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 13,
		clientId: 18,
		tag: 'website',
		title: 'Financial Asset Web',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 14,
		clientId: 6,
		tag: 'website',
		title: 'Civic Data Hub',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 15,
		clientId: 12,
		tag: 'website',
		title: 'Emergency Response App',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 16,
		clientId: 8,
		tag: 'website',
		title: 'License Approval Portal',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 17,
		clientId: 12,
		tag: 'website',
		title: 'Public Safety 113',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 18,
		clientId: 3,
		tag: 'website',
		title: 'Health Monitoring Web',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 19,
		clientId: 6,
		tag: 'website',
		title: 'Info Transparency App',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 20,
		clientId: 20,
		tag: 'website',
		title: 'SME Network Platform',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 21,
		clientId: 6,
		tag: 'website',
		title: 'Smart CCTV Hub',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 22,
		clientId: 6,
		tag: 'website',
		title: 'Judicial Data Portal',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 23,
		clientId: 4,
		tag: 'website',
		title: 'Social Service Gateway',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 24,
		clientId: 6,
		tag: 'website',
		title: 'Resource Management Tool',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 25,
		clientId: 23,
		tag: 'website',
		title: 'Strategy & Planning Web',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 26,
		clientId: 9,
		tag: 'website',
		title: 'Infrastructure Tracker',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 27,
		clientId: 2,
		tag: 'website',
		title: 'HR Management System A',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 28,
		clientId: 2,
		tag: 'website',
		title: 'HR Management System B',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 29,
		clientId: 21,
		tag: 'website',
		title: 'Agro-Business Portal',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 30,
		clientId: 6,
		tag: 'website',
		title: 'Public Gateway Web',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 31,
		clientId: 17,
		tag: 'website',
		title: 'Compliance Monitoring',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 32,
		clientId: 22,
		tag: 'website',
		title: 'Sports Activity Tracker',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 33,
		clientId: 16,
		tag: 'website',
		title: 'Gov Archive System',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 34,
		clientId: 5,
		tag: 'website',
		title: 'Audit & Monitoring Web',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 35,
		clientId: 16,
		tag: 'website',
		title: 'Service Platform X',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	},
	{
		id: 36,
		clientId: 16,
		tag: 'website',
		title: 'Service Platform Y',
		description: null,
		thumbnail: null,
		moockup: null,
		techs: null
	}
];

export const navigation = {
	id: [
		{ label: 'Beranda', href: '/' },
		{ label: 'Proyek', href: '/portfolio' },
		{ label: 'Tentang Kami', href: '/about' },
		{ label: 'Karier', href: '/career' },
		{ label: 'Berita', href: '/news' },
		{ label: 'Faq', href: '/FAQs' }
	],
	en: [
		{ label: 'Home', href: '/' },
		{ label: 'Projects', href: '/portfolio' },
		{ label: 'About Us', href: '/about' },
		{ label: 'Career', href: '/career' },
		{ label: 'News', href: '/news' },
		{ label: 'Faq', href: '/FAQs' }
	]
};
