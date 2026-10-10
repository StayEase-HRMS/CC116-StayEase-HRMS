import logo from "../assets/logo.png"
import { Star, BedDouble, CalendarDays, ChartColumn, LayoutDashboard } from "lucide-react";

function SideBarShell({ children }) {
	return (
		<aside className="w-[200px] shrink-0 border-r-2 border-gray-200 bg-white text-left text-sm">
			<div className="sticky top-0 h-screen">
				<ul className="grid">{children}</ul>
			</div>
		</aside>
	)
}

function NavItem({ icon: Icon, label, ...iconProps }) {
	return (
		<li className="p-5 hover:bg-[#e3effe] hover:cursor-pointer">
			<div className="flex gap-3 items-center">
				<Icon {...iconProps} />
				<p>{label}</p>
			</div>
		</li>
	)
}

export function AdminSideBar() {
	return (
		<SideBarShell>
			<NavItem icon={LayoutDashboard} label="Dashboard" />
			<NavItem icon={BedDouble} label="Room management" />
			<NavItem icon={CalendarDays} label="Reservations" />
			<NavItem icon={ChartColumn} label="Reports" />
			<NavItem icon={Star} label="Reviews & ratings" color="black" />
		</SideBarShell>
	)
}

export function StaffSideBar() {
	return (
		<SideBarShell>
			<NavItem icon={LayoutDashboard} label="Dashboard" />
			<NavItem icon={BedDouble} label="Room management" />
			<NavItem icon={CalendarDays} label="Reservations" />
			<NavItem icon={ChartColumn} label="Reports" />
		</SideBarShell>
	)
}