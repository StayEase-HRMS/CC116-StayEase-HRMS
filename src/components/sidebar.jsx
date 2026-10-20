import { Star, BedDouble, CalendarDays, ChartColumn, LayoutDashboard, Users, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

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

// NEW: account block pinned to the bottom of the admin / staff sidebar.
// Clicking the name opens the account page; the logout icon is a separate button.
function AccountFooter({ accountLink, roleLabel, user, onLogout }) {
	const navigate = useNavigate();
	const initials = user.name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	const handleLogout = () => {
		if (onLogout) onLogout();
		else navigate("/"); // replace with your real logout (clear session/token) when ready
	};

	return (
		<div className="mt-auto flex items-center gap-1 border-t-2 border-gray-200 p-2">
			<NavLink
				end
				to={accountLink}
				title="My account"
				aria-label="My account"
				className={({ isActive }) =>
					`flex min-w-0 flex-1 items-center gap-3 rounded-lg p-2 transition-colors focus-visible:outline-2 focus-visible:outline-[#4b6b95] ${
						isActive ? "bg-[#f5e6cb]" : "hover:bg-[#e3effe]"
					}`
				}
			>
				{user.avatar ? (
					<img src={user.avatar} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
				) : (
					<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#b3832c] text-xs font-bold text-white">
						{initials}
					</span>
				)}
				{/* management-nav-label so it collapses together with the other labels */}
				<span className="management-nav-label min-w-0">
					<span className="block truncate text-xs font-semibold text-[#574d40]">{user.name}</span>
					<span className="block truncate text-[11px] text-gray-500">{roleLabel}</span>
				</span>
			</NavLink>

			<button
				type="button"
				onClick={handleLogout}
				aria-label="Log out"
				title="Log out"
				className="shrink-0 cursor-pointer rounded-lg p-2 text-[#574d40] transition-colors hover:bg-[#e3effe] focus-visible:outline-2 focus-visible:outline-[#4b6b95]"
			>
				<LogOut size={18} />
			</button>
		</div>
	);
}

function SideBarShell({ children, management, footer }) {
	return (
		<aside className="management-sidebar w-[200px] shrink-0 border-r-2 border-gray-200 bg-white text-left text-sm">
			{/* management sidebars are now full viewport height so the footer sits at the bottom */}
			<div className={`sticky top-0 h-screen ${management ? "flex flex-col" : ""}`}>
				<ul className="grid">{children}</ul>
				{footer}
			</div>
		</aside>
	);
}

function NavItem({ icon: Icon, label, link, management, ...iconProps }) {
	if (management) return <li><NavLink end to={link} title={label} aria-label={label} className={({ isActive }) => `flex items-center gap-3 border-l-4 p-4 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#4b6b95] ${isActive ? "border-[#b3832c] bg-[#f5e6cb] font-semibold text-[#684d24] hover:bg-[#f5e6cb]" : "border-transparent text-[#574d40] hover:bg-[#e3effe]"}`}><Icon className="shrink-0" {...iconProps} /><span className="management-nav-label">{label}</span></NavLink></li>;
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

function SideBar({ links, management = false, footer }) {
	return (
		<SideBarShell management={management} footer={footer}>
			{links.map((item) => (
				<NavItem key={item.label} {...item} management={management} />
			))}
		</SideBarShell>
	);
}

// Pass a real user (from your auth state) via the `user` prop; this is a placeholder default.
const DEFAULT_USER = { name: "Joshybels", avatar: null };

export const AdminSideBar = ({ user = DEFAULT_USER, onLogout }) => (
	<SideBar
		links={ADMIN_LINKS}
		management
		footer={<AccountFooter accountLink="/admin/account" roleLabel="StayEase Admin" user={user} onLogout={onLogout} />}
	/>
);

export const StaffSideBar = ({ user = DEFAULT_USER, onLogout }) => (
	<SideBar
		links={STAFF_LINKS}
		management
		footer={<AccountFooter accountLink="/staff/account" roleLabel="StayEase Staff" user={user} onLogout={onLogout} />}
	/>
);

export const CustomerSideBar = () => <SideBar links={CUSTOMER_LINKS} />;
