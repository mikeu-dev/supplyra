import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
import FolderGit2 from '@lucide/svelte/icons/folder-git-2';
import Settings2Icon from '@lucide/svelte/icons/settings-2';
import Users from '@lucide/svelte/icons/users';
import Contact from '@lucide/svelte/icons/contact';
import MailCheck from '@lucide/svelte/icons/mail-check';
import Newspaper from '@lucide/svelte/icons/newspaper';
import Briefcase from '@lucide/svelte/icons/briefcase';
import Shield from '@lucide/svelte/icons/shield';
import Bell from '@lucide/svelte/icons/bell';
import BookUser from '@lucide/svelte/icons/book-user';
import LayoutGrid from '@lucide/svelte/icons/layout-grid';
import CircleDollarSign from '@lucide/svelte/icons/circle-dollar-sign';
import Megaphone from '@lucide/svelte/icons/megaphone';
import ScrollText from '@lucide/svelte/icons/scroll-text';
import Receipt from '@lucide/svelte/icons/receipt';
import Landmark from '@lucide/svelte/icons/landmark';
import Clock from '@lucide/svelte/icons/clock';
import CalendarIcon from '@lucide/svelte/icons/calendar';
import ChartBar from '@lucide/svelte/icons/chart-bar';
import Church from '@lucide/svelte/icons/church';
import ChartPie from '@lucide/svelte/icons/chart-pie';
import Database from '@lucide/svelte/icons/database';
import Logs from '@lucide/svelte/icons/logs';
import Tag from '@lucide/svelte/icons/tag';
import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
import BookOpen from '@lucide/svelte/icons/book-open';
import Handshake from '@lucide/svelte/icons/handshake';
import Package from '@lucide/svelte/icons/package';
import ArrowLeftRight from '@lucide/svelte/icons/arrow-left-right';
import CalendarCheck from '@lucide/svelte/icons/calendar-check';
import Wallet from '@lucide/svelte/icons/wallet';
import Fingerprint from '@lucide/svelte/icons/fingerprint';
import Monitor from '@lucide/svelte/icons/monitor';
import Building from '@lucide/svelte/icons/building';
import ShieldCheck from '@lucide/svelte/icons/shield-check';
import Map from '@lucide/svelte/icons/map';

import type { Component } from 'svelte';

export type MenuItem = {
	title: string;
	url: string;
	icon: Component;
	exact?: boolean;
	groups: string[];
	permissions?: string[];
};

export type MenuSection = {
	label: string;
	menus: MenuItem[];
};

export const MODULES = [
	{ id: 'all', name: 'All Apps', icon: LayoutGrid },
	{ id: 'hr', name: 'HR & Management', icon: Users },
	{ id: 'finance', name: 'Finance', icon: CircleDollarSign },
	{ id: 'engineering', name: 'Engineering', icon: Briefcase },
	{ id: 'marketing', name: 'Marketing', icon: Megaphone }
];

export const NAVIGATION_ITEMS: MenuSection[] = [
	{
		label: 'Overview',
		menus: [
			{
				title: 'Dashboard',
				url: '/panel',
				icon: LayoutDashboard,
				exact: true,
				groups: ['all', 'hr', 'finance', 'engineering', 'marketing']
			},
			{
				title: 'Analytics',
				url: '/panel/analytics',
				icon: ChartPie,
				groups: ['all', 'finance', 'marketing'],
				permissions: ['reports.read']
			},
			{
				title: 'Calendar',
				url: '/panel/calendar',
				icon: CalendarIcon,
				groups: ['all', 'hr', 'marketing']
			},
			{
				title: 'Reporting',
				url: '/panel/reporting',
				icon: ChartBar,
				groups: ['all', 'hr', 'finance'],
				permissions: ['reports.read']
			},
			{
				title: 'Notifications',
				url: '/panel/notifications',
				icon: Bell,
				groups: ['all']
			},
			{
				title: 'Pengumuman',
				url: '/panel/announcements',
				icon: Megaphone,
				groups: ['all', 'hr', 'marketing'],
				permissions: ['announcements.view']
			}
		]
	},
	{
		label: 'Workspace',
		menus: [
			{
				title: 'Clients & Vendors',
				url: '/panel/client',
				icon: BookUser,
				groups: ['all', 'marketing', 'engineering', 'finance'],
				permissions: ['clients.read']
			},
			{
				title: 'Projects',
				url: '/panel/project',
				icon: FolderGit2,
				groups: ['all', 'engineering', 'finance'],
				permissions: ['projects.read']
			},
			{
				title: 'Layanan',
				url: '/panel/masters/services',
				icon: Briefcase,
				groups: ['all', 'marketing'],
				permissions: ['services.read']
			},
			{
				title: 'Karier',
				url: '/panel/career',
				icon: Briefcase,
				groups: ['all', 'hr'],
				permissions: ['jobs.read']
			}
		]
	},
	{
		label: 'HR & Management',
		menus: [
			{
				title: 'Timesheets',
				url: '/panel/hr/timesheets',
				icon: Clock,
				groups: ['all', 'hr'],
				permissions: ['timesheets.read']
			},
			{
				title: 'Employees',
				url: '/panel/hr/employee',
				icon: Users,
				groups: ['all', 'hr'],
				permissions: ['users.read']
			},
			{
				title: 'Leave',
				url: '/panel/hr/leave',
				icon: CalendarCheck,
				groups: ['all', 'hr'],
				permissions: ['leave_requests.read']
			},
			{
				title: 'Presensi',
				url: '/panel/presence',
				icon: Fingerprint,
				groups: ['all', 'hr'],
				permissions: ['presences.read']
			}
		]
	},
	{
		label: 'Finance',
		menus: [
			{
				title: 'Invoices',
				url: '/panel/finance/invoices',
				icon: ScrollText,
				groups: ['all', 'finance'],
				permissions: ['invoices.read']
			},
			{
				title: 'Expenses',
				url: '/panel/finance/expenses',
				icon: Receipt,
				groups: ['all', 'finance'],
				permissions: ['expenses.read']
			},
			{
				title: 'Payroll',
				url: '/panel/finance/payroll',
				icon: Wallet,
				groups: ['all', 'finance', 'hr'],
				permissions: ['payroll.read']
			}
		]
	},
	{
		label: 'Accounting',
		menus: [
			{
				title: 'Chart of Accounts',
				url: '/panel/accounting/accounts',
				icon: BookOpen,
				groups: ['all', 'finance'],
				permissions: ['accounting.read']
			},
			{
				title: 'Jurnal',
				url: '/panel/accounting/journals',
				icon: ScrollText,
				groups: ['all', 'finance'],
				permissions: ['accounting.read']
			}
		]
	},
	{
		label: 'CRM',
		menus: [
			{
				title: 'Leads',
				url: '/panel/crm/leads',
				icon: Handshake,
				groups: ['all', 'marketing'],
				permissions: ['leads.read']
			},
			{
				title: 'Sales Orders',
				url: '/panel/crm/orders',
				icon: ShoppingCart,
				groups: ['all', 'marketing', 'finance'],
				permissions: ['orders.read']
			}
		]
	},
	{
		label: 'Inventory',
		menus: [
			{
				title: 'Products',
				url: '/panel/inventory/products',
				icon: Package,
				groups: ['all', 'engineering', 'finance'],
				permissions: ['products.read']
			},
			{
				title: 'Stock Moves',
				url: '/panel/inventory/stock_moves',
				icon: ArrowLeftRight,
				groups: ['all', 'engineering', 'finance'],
				permissions: ['stock_moves.read']
			},
			{
				title: 'Warehouses',
				url: '/panel/inventory/warehouses',
				icon: Building,
				groups: ['all', 'engineering', 'finance'],
				permissions: ['warehouses.read']
			},
			{
				title: 'Locations',
				url: '/panel/inventory/locations',
				icon: Tag,
				groups: ['all', 'engineering', 'finance'],
				permissions: ['locations.read']
			}
		]
	},
	{
		label: 'Procurement',
		menus: [
			{
				title: 'Requisitions',
				url: '/panel/purchase/requisitions',
				icon: ScrollText,
				groups: ['all', 'finance', 'engineering'],
				permissions: ['purchase_requisitions.read']
			},
			{
				title: 'Purchase Orders',
				url: '/panel/purchase/orders',
				icon: ShoppingCart,
				groups: ['all', 'finance'],
				permissions: ['purchase_orders.read']
			},
			{
				title: 'Procurement Map',
				url: '/panel/purchase/map',
				icon: Map,
				groups: ['all', 'finance', 'engineering'],
				permissions: ['purchase_orders.read']
			}
		]
	},
	{
		label: 'Front Content',
		menus: [
			{
				title: 'News',
				url: '/panel/news',
				icon: Newspaper,
				groups: ['all', 'marketing'],
				permissions: ['news.read']
			},
			{
				title: 'Contact',
				url: '/panel/contact',
				icon: Contact,
				groups: ['all', 'marketing'],
				permissions: ['pages.read']
			},
			{
				title: 'Subscriptions',
				url: '/panel/subscription',
				icon: MailCheck,
				groups: ['all', 'marketing'],
				permissions: ['pages.read']
			}
		]
	},
	{
		label: 'Master Data',
		menus: [
			{
				title: 'User Management',
				url: '/panel/user',
				icon: Users,
				groups: ['all', 'hr'],
				permissions: ['users.read']
			},
			{
				title: 'Role & Akses',
				url: '/panel/masters/roles',
				icon: Shield,
				groups: ['all', 'hr'],
				permissions: ['roles.read']
			},
			{
				title: 'Positions',
				url: '/panel/masters/positions',
				icon: Database,
				groups: ['all', 'hr'],
				permissions: ['positions.read']
			},
			{
				title: 'Bank',
				url: '/panel/masters/banks',
				icon: Landmark,
				groups: ['all', 'finance', 'hr'],
				permissions: ['banks.read']
			},
			{
				title: 'Schools',
				url: '/panel/masters/schools',
				icon: Database,
				groups: ['all', 'hr'],
				permissions: ['schools.read']
			},
			{
				title: 'Agama',
				url: '/panel/masters/religions',
				icon: Church,
				groups: ['all', 'hr'],
				permissions: ['religions.read']
			},
			{
				title: 'Stages',
				url: '/panel/masters/stages',
				icon: Database,
				groups: ['all', 'hr'],
				permissions: ['stages.read']
			},
			{
				title: 'Units',
				url: '/panel/masters/units',
				icon: Database,
				groups: ['all', 'hr'],
				permissions: ['units.read']
			},
			{
				title: 'Shifts',
				url: '/panel/masters/shifts',
				icon: Clock,
				groups: ['all', 'hr'],
				permissions: ['shifts.read']
			},
			{
				title: 'Salary Components',
				url: '/panel/masters/salary-components',
				icon: Landmark,
				groups: ['all', 'finance', 'hr'],
				permissions: ['banks.read']
			},
			{
				title: 'Tags',
				url: '/panel/masters/tags',
				icon: Tag,
				groups: ['all'],
				permissions: ['tags.read']
			},
			{
				title: 'Categories',
				url: '/panel/masters/categories',
				icon: LayoutGrid,
				groups: ['all'],
				permissions: ['categories.read']
			},
			{
				title: 'Log Activities',
				url: '/panel/log',
				icon: Logs,
				groups: ['all', 'engineering', 'hr'],
				permissions: ['activity_logs.read']
			},
			{
				title: 'Audit Logs',
				url: '/panel/log/audit',
				icon: ShieldCheck,
				groups: ['all', 'engineering'],
				permissions: ['superadmin.read']
			}
		]
	},
	{
		label: 'Settings',
		menus: [
			{
				title: 'General Settings',
				url: '/panel/setting/:lang/general',
				icon: Settings2Icon,
				groups: ['all'],
				permissions: ['settings.read']
			},
			{
				title: 'Organisasi',
				url: '/panel/setting/organization',
				icon: Users,
				groups: ['all'],
				permissions: ['settings.read']
			},
			{
				title: 'Perusahaan',
				url: '/panel/setting/company',
				icon: Building,
				groups: ['all'],
				permissions: ['settings.read']
			},
			{
				title: 'Perangkat',
				url: '/panel/setting/devices',
				icon: Monitor,
				groups: ['all'],
				permissions: ['settings.read']
			}
		]
	},
	{
		label: 'Superadmin',
		menus: [
			{
				title: 'Companies',
				url: '/panel/superadmin/companies',
				icon: ShieldCheck,
				groups: ['all'],
				permissions: ['superadmin.read']
			}
		]
	}
];
