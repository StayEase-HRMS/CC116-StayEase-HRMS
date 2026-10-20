import { useState } from 'react';
import Pagination from './Pagination';
const reservations = [
  { guest: "Dayapera", room: "405 Deluxe", checkIn: "Sept 22, 2026", checkOut: "Sept 25, 2026", status: "Checked-in" },
  { guest: "Puerta", room: "205 Standard", checkIn: "Sept 22, 2026", checkOut: "Sept 25, 2026", status: "Pending" },
  { guest: "Zantua", room: "103 Family", checkIn: "Sept 22, 2026", checkOut: "Sept 25, 2026", status: "Checked-in" },
  { guest: "Fabi", room: "405 Deluxe", checkIn: "Sept 22, 2026", checkOut: "Sept 25, 2026", status: "Checked-in" },
  { guest: "Denina", room: "303 Suite", checkIn: "Sept 22, 2026", checkOut: "Sept 22, 2026", status: "Checked-out" },
]

const statusStyles = {
  "Checked-in": "bg-green-200",
  "Pending": "bg-blue-400 text-white",
  "Checked-out": "bg-yellow-100",
}

const roomStatus = [
  { label: "Pending", value: 5, color: "#7eb2ff" },
  { label: "Available", value: 5, color: "#b5f0d0" },
  { label: "Occupied", value: 40, color: "#d4a55c" },
]

function StatusBadge({ status }) {
  return (
    <span className={`inline-block w-24 py-0.5 rounded-xl text-xs font-medium ${statusStyles[status]}`}>
      {status}
    </span>
  )
}

function ReservationsTable() {
  const [page, setPage] = useState(1);
  return (
    <div className="flex-1 min-w-0 p-4 rounded-xl bg-white shadow-sm">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-base font-bold">Today's Reservation</h2>
        <a href="#" className="text-xs text-blue-600 mr-6">View all</a>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-center text-xs">
          <thead>
            <tr className="bg-blue-100 text-sm">
              <th className="py-3 font-normal">Guest Name</th>
              <th className="py-3 font-normal">Room no.</th>
              <th className="py-3 font-normal">Check-in</th>
              <th className="py-3 font-normal">Check-out</th>
              <th className="py-3 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {reservations.slice((page - 1) * 7, page * 7).map((r) => (
              <tr key={r.guest}>
                <td className="py-3">{r.guest}</td>
                <td className="py-3">{r.room}</td>
                <td className="py-3">{r.checkIn}</td>
                <td className="py-3">{r.checkOut}</td>
                <td className="py-3"><StatusBadge status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} total={reservations.length} pageSize={7} onChange={setPage} noun="reservations" />
    </div>
  )
}

function PieChart({ data, size = 180 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const r = size / 2
  let angle = -Math.PI / 2 // start at 12 o'clock

  const slices = data.map((d) => {
    const sweep = (d.value / total) * Math.PI * 2
    const x1 = r + r * Math.cos(angle)
    const y1 = r + r * Math.sin(angle)
    angle += sweep
    const x2 = r + r * Math.cos(angle)
    const y2 = r + r * Math.sin(angle)
    const largeArc = sweep > Math.PI ? 1 : 0
    return {
      ...d,
      path: `M ${r} ${r} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`,
    }
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      {slices.map((s) => (
        <path key={s.label} d={s.path} fill={s.color} stroke="white" strokeWidth="1" />
      ))}
    </svg>
  )
}

function RoomStatusOverview() {
  const total = roomStatus.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="flex-1 min-w-0 p-4 rounded-xl bg-white shadow-sm">
      <h2 className="text-base font-bold pb-2 border-b border-gray-200">Room Status Overview</h2>

      <div className="mt-4 flex items-center justify-around gap-6 flex-wrap">
        <PieChart data={roomStatus} />

        <table className="text-xs font-semibold">
          <tbody>
            {roomStatus.map((d) => (
              <tr key={d.label}>
                <td className="py-3 pr-3">
                  <span className="block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                </td>
                <td className="py-3 pr-8 text-center">{d.label}</td>
                <td className="py-3 pr-8 text-center">{d.value}</td>
                <td className="py-3 text-center">{Math.round((d.value / total) * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function ReservationsAndStatus() {
  return (
    <div className="flex gap-3 flex-col lg:flex-row">
      <ReservationsTable />
      <RoomStatusOverview />
    </div>
  )
}

export function QuickDetailsCard({ color, icon, cardName, value, comment }) {
  return (
    <div className="flex-1 min-w-0 p-4 rounded-md bg-white shadow-md">
      <div className="flex justify-between">
        <div>
          <p className="pt-1 pb-2 text-sm">{cardName}</p>
          <p className="pb-2 text-2xl font-bold">{value}</p>
        </div>

        <div className={`${color} w-fit h-fit p-2 rounded-xl`}>
          {icon}
        </div>
      </div>

      <p className="border-t-1 border-gray-300 pt-2 text-sm text-gray-400 italic text-right">{comment}</p>
    </div>
  )
}

export function RoomAvailabilityCard({ roomType, comment, occupied, available }) {
  return (
    <div className="w-80 shrink-0 p-3 grid gap-1 rounded-md bg-white shadow-md border-1 border-gray-200">
      <div className="w-full h-30 rounded-md bg-gray-200"></div>
      <p className="text-xl font-bold">{roomType}</p>
      <p className="text-sm">{comment}</p>

      <div className="flex justify-between mt-2">
        <div className="w-fit h-fit p-1 pr-2 pl-2 rounded-xl bg-yellow-100">{occupied} occupied</div>
        <div className="w-fit h-fit p-1 pr-2 pl-2 rounded-xl bg-green-200">{available} available</div>
      </div>
    </div>
  )
}
