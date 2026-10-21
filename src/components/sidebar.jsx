import { Star, BedDouble, CalendarDays, ChartColumn, LayoutDashboard, Users } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";

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

// Single source of truth for the customer portal.
// `link` is the route, `page` is the id CustomerPage uses to pick the content,
// `title` / `desc` feed the PageHeader.
export const CUSTOMER_LINKS = [
	{
		icon: BedDouble,
		label: "Rooms and Accommodations",
		link: "/rooms",
		page: "rooms",
		title: "Rooms & Accommodation",
		desc: "Browse over a wide selection of rooms and accommodations according to your taste.",
	},
	{
		icon: CalendarDays,
		label: "My reservations",
		link: "/my-reservation",
		page: "my-reservation",
		title: "My reservations",
		desc: "View upcoming stays, manage booking dates, and access your contactless digital keys.",
	},
	{
		icon: Users,
		label: "Customer Support",
		link: "/chat-support",
		page: "chat-support",
		title: "Customer service",
		desc: "Chat with our concierge team for real-time assistance.",
	},
];

// Matches a URL to a customer page. "/" (or any unknown path) falls back to rooms.
export const getCustomerLink = (pathname) => {
	const path = pathname.replace(/\/+$/, "") || "/";
	return CUSTOMER_LINKS.find((item) => item.link === path) ?? CUSTOMER_LINKS[0];
};

function SideBarShell({ children, management }) {
	return (
		<aside className="management-sidebar w-[200px] shrink-0 border-r-2 border-gray-200 bg-white text-left text-sm">
			<div className={`sticky top-0 ${management ? "" : "h-full"}`}>
				<ul className="grid">{children}</ul>
			</div>
		</aside>
	);
}

/* ---------- admin / staff (route-based, gold active state) ---------- */

function NavItem({ icon: Icon, label, link, ...iconProps }) {
	return (
		<li>
			<NavLink
				end
				to={link}
				title={label}
				aria-label={label}
				className={({ isActive }) =>
					`flex items-center gap-3 border-l-4 p-4 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#4b6b95] ${
						isActive
							? "border-[#b3832c] bg-[#f5e6cb] font-semibold text-[#684d24] hover:bg-[#f5e6cb]"
							: "border-transparent text-[#574d40] hover:bg-[#e3effe]"
					}`
				}
			>
				<Icon className="shrink-0" {...iconProps} />
				<span className="management-nav-label">{label}</span>
			</NavLink>
		</li>
	);
}

function SideBar({ links }) {
	return (
		<SideBarShell management>
			{links.map((item) => (
				<NavItem key={item.label} {...item} />
			))}
		</SideBarShell>
	);
}

export const AdminSideBar = () => <SideBar links={ADMIN_LINKS} />;
export const StaffSideBar = () => <SideBar links={STAFF_LINKS} />;

/* ---------- customer (route-based, blue active state) ---------- */

function CustomerNavItem({ icon: Icon, label, link, active }) {
	return (
		<li>
			<Link
				to={link}
				aria-current={active ? "page" : undefined}
				className={`flex w-full items-center gap-3 p-5 text-left ${
					active ? "bg-[#a9c9f2]" : "hover:bg-[#e3effe]"
				}`}
			>
				<Icon className="shrink-0" />
				<span>{label}</span>
			</Link>
		</li>
	);
}

// Takes no props: the active item comes from the URL, so it works anywhere.
export function CustomerSideBar() {
	const { pathname } = useLocation();
	const activePage = getCustomerLink(pathname).page;

	return (
		<SideBarShell>
			{CUSTOMER_LINKS.map(({ icon, label, link, page }) => (
				<CustomerNavItem
					key={page}
					icon={icon}
					label={label}
					link={link}
					active={page === activePage}
				/>
			))}
		</SideBarShell>
	);
}