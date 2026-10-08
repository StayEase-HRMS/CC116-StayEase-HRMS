import logo from "../assets/logo.png"
import { Star, BedDouble, CalendarDays, ChartColumn, LayoutDashboard } from "lucide-react";

export function AdminSideBar() {
	return (
		<div className="w-[200px] h-screen text-left sticky top-0 border-r-2 text-sm">
			<div className="w-[100%] justify-items-center p-5 border-gray-200 border-b-1">
				<img className="w-[140px]" src={logo}/>
			</div>

			<ul className="grid">
				<li className="p-5 hover:bg-[#e3effe] hover:cursor-pointer">
					<div className="flex gap-3 items-center">
						<LayoutDashboard />
						<p>Dashboard</p>
					</div>
				</li>
				<li className="p-5 hover:bg-[#e3effe] hover:cursor-pointer">
					<div className="flex gap-3 items-center">
						<BedDouble />
						Room management
					</div>
				</li>
				<li className="p-5 hover:bg-[#e3effe] hover:cursor-pointer">
					<div className="flex gap-3 items-center">
						<CalendarDays />
						<p>Reservations</p>
					</div>
				</li>
				<li className="p-5 hover:bg-[#e3effe] hover:cursor-pointer">
					<div className="flex gap-3 items-center">
						<ChartColumn />
						<p>Reports</p>
					</div>
				</li>
				<li className="p-5 hover:bg-[#e3effe] hover:cursor-pointer">
					<div className="flex gap-3 items-center">
						<Star color="black" />
						<p>Reviews & ratings</p>
					</div>
				</li>
			</ul>
		</div>
	)
}

// unfinished
export function StaffSideBar() {
	return (
		<div className="w-[200px] h-screen text-left sticky top-0 border-r-2">
			<div className="w-[100%] justify-items-center p-5 border-gray-200 border-b-1">
				<img className="w-[140px]" src={logo}/>
			</div>

			<ul className="grid">
				<li className="p-5 hover:bg-[#e3effe] hover:cursor-pointer">
					<div className="flex gap-3 items-center">
						<LayoutDashboard />
						<p>Dashboard</p>
					</div>
				</li>
				<li className="p-5 hover:bg-[#e3effe] hover:cursor-pointer">
					<div className="flex gap-3 items-center">
						<BedDouble />
						Room management
					</div>
				</li>
				<li className="p-5 hover:bg-[#e3effe] hover:cursor-pointer">
					<div className="flex gap-3 items-center">
						<CalendarDays />
						<p>Reservations</p>
					</div>
				</li>
				<li className="p-5 hover:bg-[#e3effe] hover:cursor-pointer">
					<div className="flex gap-3 items-center">
						<ChartColumn />
						<p>Reports</p>
					</div>
				</li>
			</ul>
		</div>
	)
}