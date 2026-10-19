import { Star, BedDouble, CalendarDays, ChartColumn, LayoutDashboard, Users } from "lucide-react";
import { NavLink } from "react-router-dom";

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
		<aside className="management-sidebar w-[200px] shrink-0 border-r-2 border-gray-200 bg-white text-left text-sm">
			<div className={`sticky top-0 ${management ? '' : 'h-screen'}`}>
				<ul className="grid">{children}</ul>
			</div>
		</aside>
	);
}

function NavItem({ icon: Icon, label, link, management, ...iconProps }) {
	if (management) return <li><NavLink end to={link} title={label} aria-label={label} className={({ isActive }) => `flex items-center gap-3 border-l-4 p-4 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#4b6b95] ${isActive ? "border-[#b3832c] bg-[#f5e6cb] font-semibold text-[#684d24] hover:bg-[#f5e6cb]" : "border-transparent text-[#574d40] hover:bg-[#e3effe]"}`}><Icon className="shrink-0" {...iconProps} /><span className="management-nav-label">{label}</span></NavLink></li>;
	return (
		<li className="p-5 hover:bg-[#e3effe] hover:cursor-pointer">
			<a href={link}>
				<div className="flex gap-3 items-center">
					<Icon {...iconProps} />
					<p>{label}</p>
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
