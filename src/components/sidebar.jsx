import { Star, BedDouble, CalendarDays, ChartColumn, LayoutDashboard, Users } from "lucide-react";

const ADMIN_LINKS = [
	{ icon: LayoutDashboard, label: "Dashboard", link: "/admin" },
	{ icon: BedDouble, label: "Room management", link: "/admin/rooms" },
	{ icon: CalendarDays, label: "Reservations", link: "/admin/reservations" },
	{ icon: ChartColumn, label: "Reports", link: "/admin/reports" },
	{ icon: Users, label: "User Management", link: "/admin/users" },
	{ icon: Star, label: "Reviews & ratings", link: "/admin/reviews" },
];

const STAFF_LINKS = [
	{ icon: LayoutDashboard, label: "Dashboard", link: "/staff" },
	{ icon: BedDouble, label: "Room management", link: "/staff/rooms" },
	{ icon: CalendarDays, label: "Reservations", link: "/staff/reservations" },
	{ icon: Users, label: "Customer Support", link: "/staff/support" },
];

const CUSTOMER_LINKS = [
	{ icon: BedDouble, label: "Rooms and Accommodations", link: "/rooms" },
	{ icon: CalendarDays, label: "My reservations", link: "/my-reservation" },
	{ icon: Users, label: "Customer Support", link: "/chat-support" },
];

function SideBarShell({ children, management }) {
	return (
		<aside className={`${management ? "w-16 sm:w-[200px]" : "w-[200px]"} shrink-0 border-r-2 border-gray-200 bg-white text-left text-sm`}>
			<div className="sticky top-0 h-screen">
				<ul className="grid">{children}</ul>
			</div>
		</aside>
	);
}

function NavItem({ icon: Icon, label, link, management, ...iconProps }) {
	return (
		<li className="p-5 hover:bg-[#e3effe] hover:cursor-pointer">
			<a href={link} aria-label={label} title={label}>
				<div className="flex gap-3 items-center">
					<Icon className="shrink-0" {...iconProps} />
					<p className={management ? "hidden sm:block" : ""}>{label}</p>
				</div>
			</a>
		</li>
	);
}

function SideBar({ links, management = false }) {
	return (
		<SideBarShell management={management}>
			{links.map((item) => (
				<NavItem key={item.label} {...item} management={management} />
			))}
		</SideBarShell>
	);
}

export const AdminSideBar = () => <SideBar links={ADMIN_LINKS} management />;
export const StaffSideBar = () => <SideBar links={STAFF_LINKS} management />;
export const CustomerSideBar = () => <SideBar links={CUSTOMER_LINKS} />;